#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Estado persistente da fila do Motor de Vídeo (SQLite).

Cada vídeo avança por marcos fixos (``status``) e, em paralelo, tem um estado
de execução (``state``). O ``status`` registra a última etapa CONCLUÍDA; por
isso, se o processo morrer no meio de uma etapa, o vídeo volta para a fila e
recomeça exatamente da etapa que não terminou.
"""

from __future__ import annotations

import json
import os
import socket
import sqlite3
import time
from pathlib import Path
from typing import Any, Iterable

DEFAULT_DB_PATH = Path(__file__).resolve().parent / "data" / "video_pipeline_db.sqlite"

STATUSES = ("RECEIVED", "WHISPER_DONE", "CLAUDE_DONE", "RENDER_DONE", "ROUGH_CUT_DONE")
FINAL_STATUS = STATUSES[-1]
STATES = ("queued", "running", "failed", "done")

SCHEMA = f"""
CREATE TABLE IF NOT EXISTS videos (
    id            INTEGER PRIMARY KEY,
    path          TEXT    NOT NULL UNIQUE,
    course        TEXT    NOT NULL DEFAULT '',
    title         TEXT    NOT NULL,
    status        TEXT    NOT NULL DEFAULT 'RECEIVED'
                  CHECK (status IN ({", ".join(repr(s) for s in STATUSES)})),
    state         TEXT    NOT NULL DEFAULT 'queued'
                  CHECK (state IN ({", ".join(repr(s) for s in STATES)})),
    current_stage TEXT,
    worker_id     TEXT,
    heartbeat_at  REAL,
    attempts      INTEGER NOT NULL DEFAULT 0,
    last_error    TEXT,
    duration_s    REAL,
    created_at    REAL    NOT NULL,
    updated_at    REAL    NOT NULL,
    finished_at   REAL
);
CREATE INDEX IF NOT EXISTS idx_videos_state ON videos(state, id);

CREATE TABLE IF NOT EXISTS stage_runs (
    id          INTEGER PRIMARY KEY,
    video_id    INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    stage       TEXT    NOT NULL,
    started_at  REAL    NOT NULL,
    finished_at REAL,
    ok          INTEGER,
    error       TEXT
);
CREATE INDEX IF NOT EXISTS idx_runs_video ON stage_runs(video_id, id);

CREATE TABLE IF NOT EXISTS artifacts (
    id         INTEGER PRIMARY KEY,
    video_id   INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    kind       TEXT    NOT NULL,
    path       TEXT    NOT NULL,
    created_at REAL    NOT NULL,
    UNIQUE (video_id, path)
);

CREATE TABLE IF NOT EXISTS events (
    id       INTEGER PRIMARY KEY,
    video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
    ts       REAL    NOT NULL,
    level    TEXT    NOT NULL DEFAULT 'info',
    stage    TEXT,
    message  TEXT    NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_video ON events(video_id, id);
"""


def resolve_db_path(explicit: str | os.PathLike | None = None) -> Path:
    if explicit:
        return Path(explicit)
    env = os.environ.get("VIDEO_PIPELINE_DB")
    return Path(env) if env else DEFAULT_DB_PATH


def connect(db_path: str | os.PathLike | None = None) -> sqlite3.Connection:
    path = resolve_db_path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    # isolation_level=None: transações explícitas (BEGIN IMMEDIATE) onde importa.
    conn = sqlite3.connect(path, timeout=10, isolation_level=None, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=10000")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA)


def _now() -> float:
    return time.time()


def _row(row: sqlite3.Row | None) -> dict[str, Any] | None:
    return dict(row) if row is not None else None


# ---------------------------------------------------------------- eventos

def add_event(conn, video_id: int | None, message: str, level: str = "info", stage: str | None = None) -> None:
    conn.execute(
        "INSERT INTO events (video_id, ts, level, stage, message) VALUES (?, ?, ?, ?, ?)",
        (video_id, _now(), level, stage, message[:4000]),
    )


def events_since(conn, since_id: int = 0, limit: int = 100, video_id: int | None = None) -> list[dict]:
    sql = (
        "SELECT e.*, v.title FROM events e LEFT JOIN videos v ON v.id = e.video_id "
        "WHERE e.id > ?"
    )
    params: list[Any] = [since_id]
    if video_id is not None:
        sql += " AND e.video_id = ?"
        params.append(video_id)
    sql += " ORDER BY e.id DESC LIMIT ?"
    params.append(limit)
    return [dict(r) for r in conn.execute(sql, params)][::-1]


# ---------------------------------------------------------------- fila

def register_video(conn, path: Path, course: str = "", title: str | None = None) -> tuple[int, bool]:
    """Registra um vídeo como RECEIVED. Idempotente pelo caminho absoluto."""

    path = Path(path).resolve()
    now = _now()
    cur = conn.execute(
        "INSERT OR IGNORE INTO videos (path, course, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        (str(path), course, title or path.stem, now, now),
    )
    created = cur.rowcount == 1
    video_id = conn.execute("SELECT id FROM videos WHERE path = ?", (str(path),)).fetchone()["id"]
    if created:
        add_artifact(conn, video_id, "source", path)
        add_event(conn, video_id, f"Vídeo recebido: {path.name}", stage="RECEIVED")
    return video_id, created


def claim_next(conn, worker_id: str) -> dict | None:
    """Reserva atomicamente o próximo vídeo em fila (seguro entre processos)."""

    conn.execute("BEGIN IMMEDIATE")
    try:
        row = conn.execute(
            "SELECT id FROM videos WHERE state = 'queued' ORDER BY id LIMIT 1"
        ).fetchone()
        if row is None:
            conn.execute("COMMIT")
            return None
        now = _now()
        conn.execute(
            "UPDATE videos SET state = 'running', worker_id = ?, heartbeat_at = ?, "
            "attempts = attempts + 1, last_error = NULL, updated_at = ? WHERE id = ?",
            (worker_id, now, now, row["id"]),
        )
        conn.execute("COMMIT")
    except BaseException:
        conn.execute("ROLLBACK")
        raise
    return get_video_row(conn, row["id"])


def heartbeat(conn, video_id: int, worker_id: str) -> None:
    conn.execute(
        "UPDATE videos SET heartbeat_at = ? WHERE id = ? AND worker_id = ? AND state = 'running'",
        (_now(), video_id, worker_id),
    )


def start_stage(conn, video_id: int, stage: str) -> int:
    now = _now()
    conn.execute(
        "UPDATE videos SET current_stage = ?, heartbeat_at = ?, updated_at = ? WHERE id = ?",
        (stage, now, now, video_id),
    )
    cur = conn.execute(
        "INSERT INTO stage_runs (video_id, stage, started_at) VALUES (?, ?, ?)",
        (video_id, stage, now),
    )
    add_event(conn, video_id, f"Etapa {stage} iniciada", stage=stage)
    return cur.lastrowid


def complete_stage(conn, video_id: int, run_id: int, new_status: str, artifacts: Iterable[tuple[str, Path]] = ()) -> None:
    if new_status not in STATUSES:
        raise ValueError(f"status inválido: {new_status}")
    now = _now()
    conn.execute("BEGIN IMMEDIATE")
    try:
        conn.execute("UPDATE stage_runs SET finished_at = ?, ok = 1 WHERE id = ?", (now, run_id))
        for kind, path in artifacts:
            add_artifact(conn, video_id, kind, path)
        conn.execute(
            "UPDATE videos SET status = ?, current_stage = NULL, heartbeat_at = ?, updated_at = ? WHERE id = ?",
            (new_status, now, now, video_id),
        )
        add_event(conn, video_id, f"Marco atingido: {new_status}", level="success", stage=new_status)
        conn.execute("COMMIT")
    except BaseException:
        conn.execute("ROLLBACK")
        raise


def fail_stage(conn, video_id: int, run_id: int | None, error: str) -> None:
    now = _now()
    if run_id is not None:
        conn.execute("UPDATE stage_runs SET finished_at = ?, ok = 0, error = ? WHERE id = ?", (now, error[:4000], run_id))
    conn.execute(
        "UPDATE videos SET state = 'failed', last_error = ?, worker_id = NULL, updated_at = ? WHERE id = ?",
        (error[:4000], now, video_id),
    )
    add_event(conn, video_id, error, level="error")


def release(conn, video_id: int) -> None:
    """Libera o vídeo após o worker sair: concluído ou de volta à fila."""

    now = _now()
    row = conn.execute("SELECT status FROM videos WHERE id = ?", (video_id,)).fetchone()
    if row["status"] == FINAL_STATUS:
        conn.execute(
            "UPDATE videos SET state = 'done', current_stage = NULL, worker_id = NULL, "
            "finished_at = ?, updated_at = ? WHERE id = ?",
            (now, now, video_id),
        )
        add_event(conn, video_id, "Pipeline concluído", level="success", stage=FINAL_STATUS)
    else:
        conn.execute(
            "UPDATE stage_runs SET finished_at = ?, ok = 0, error = 'interrompido' "
            "WHERE video_id = ? AND finished_at IS NULL",
            (now, video_id),
        )
        conn.execute(
            "UPDATE videos SET state = 'queued', current_stage = NULL, worker_id = NULL, updated_at = ? "
            "WHERE id = ? AND state = 'running'",
            (now, video_id),
        )


def _local_worker_dead(worker_id: str | None) -> bool:
    """True se o worker era deste host e o processo dele não existe mais."""

    if not worker_id:
        return True
    parts = worker_id.split(":")
    if len(parts) < 2 or parts[0] != socket.gethostname() or not parts[1].isdigit():
        return False
    pid = int(parts[1])
    if pid == os.getpid():
        return False
    if os.name == "nt":
        import ctypes

        kernel32 = ctypes.windll.kernel32
        handle = kernel32.OpenProcess(0x1000, False, pid)  # PROCESS_QUERY_LIMITED_INFORMATION
        if not handle:
            return True
        try:
            code = ctypes.c_ulong()
            kernel32.GetExitCodeProcess(handle, ctypes.byref(code))
            return code.value != 259  # STILL_ACTIVE
        finally:
            kernel32.CloseHandle(handle)
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return True
    except PermissionError:
        return False
    return False


def recover_stale(conn, stale_seconds: float = 90.0) -> int:
    """Devolve à fila vídeos 'running' cujo worker morreu ou parou de dar sinal."""

    now = _now()
    limit = now - stale_seconds
    stale = [
        row for row in conn.execute(
            "SELECT id, current_stage, worker_id, heartbeat_at FROM videos WHERE state = 'running'"
        ).fetchall()
        if row["heartbeat_at"] is None or row["heartbeat_at"] < limit or _local_worker_dead(row["worker_id"])
    ]
    for row in stale:
        conn.execute(
            "UPDATE stage_runs SET finished_at = ?, ok = 0, error = 'interrompido (worker sem sinal)' "
            "WHERE video_id = ? AND finished_at IS NULL",
            (now, row["id"]),
        )
        conn.execute(
            "UPDATE videos SET state = 'queued', current_stage = NULL, worker_id = NULL, updated_at = ? WHERE id = ?",
            (now, row["id"]),
        )
        add_event(
            conn, row["id"],
            f"Retomada: worker interrompido em {row['current_stage'] or 'etapa desconhecida'}; voltou para a fila",
            level="warn", stage=row["current_stage"],
        )
    return len(stale)


def retry(conn, video_id: int) -> bool:
    cur = conn.execute(
        "UPDATE videos SET state = 'queued', last_error = NULL, updated_at = ? WHERE id = ? AND state = 'failed'",
        (_now(), video_id),
    )
    if cur.rowcount:
        add_event(conn, video_id, "Reenfileirado manualmente", level="info")
    return cur.rowcount == 1


def retry_all_failed(conn) -> int:
    ids = [r["id"] for r in conn.execute("SELECT id FROM videos WHERE state = 'failed'")]
    return sum(1 for vid in ids if retry(conn, vid))


def set_duration(conn, video_id: int, duration_s: float) -> None:
    conn.execute("UPDATE videos SET duration_s = ? WHERE id = ?", (duration_s, video_id))


# ---------------------------------------------------------------- artefatos

def add_artifact(conn, video_id: int, kind: str, path: Path) -> None:
    conn.execute(
        "INSERT OR IGNORE INTO artifacts (video_id, kind, path, created_at) VALUES (?, ?, ?, ?)",
        (video_id, kind, str(Path(path).resolve()), _now()),
    )


def get_artifact(conn, artifact_id: int) -> dict | None:
    return _row(conn.execute("SELECT * FROM artifacts WHERE id = ?", (artifact_id,)).fetchone())


# ---------------------------------------------------------------- leitura

def get_video_row(conn, video_id: int) -> dict | None:
    return _row(conn.execute("SELECT * FROM videos WHERE id = ?", (video_id,)).fetchone())


def list_videos(conn, state: str | None = None, query: str | None = None, limit: int = 500) -> list[dict]:
    sql = "SELECT * FROM videos WHERE 1=1"
    params: list[Any] = []
    if state:
        sql += " AND state = ?"
        params.append(state)
    if query:
        sql += " AND (title LIKE ? OR course LIKE ?)"
        params += [f"%{query}%", f"%{query}%"]
    sql += " ORDER BY CASE state WHEN 'running' THEN 0 WHEN 'failed' THEN 1 WHEN 'queued' THEN 2 ELSE 3 END, id LIMIT ?"
    params.append(limit)
    return [dict(r) for r in conn.execute(sql, params)]


def get_video_detail(conn, video_id: int) -> dict | None:
    video = get_video_row(conn, video_id)
    if video is None:
        return None
    video["stage_runs"] = [dict(r) for r in conn.execute(
        "SELECT * FROM stage_runs WHERE video_id = ? ORDER BY id", (video_id,))]
    video["artifacts"] = [dict(r) for r in conn.execute(
        "SELECT * FROM artifacts WHERE video_id = ? ORDER BY id", (video_id,))]
    video["events"] = events_since(conn, 0, 200, video_id=video_id)
    return video


def summary(conn) -> dict:
    by_state = {s: 0 for s in STATES}
    for r in conn.execute("SELECT state, COUNT(*) n FROM videos GROUP BY state"):
        by_state[r["state"]] = r["n"]
    by_status = {s: 0 for s in STATUSES}
    for r in conn.execute("SELECT status, COUNT(*) n FROM videos GROUP BY status"):
        by_status[r["status"]] = r["n"]
    stage_avg = {
        r["stage"]: {"avg_s": r["avg_s"], "runs": r["n"]}
        for r in conn.execute(
            "SELECT stage, AVG(finished_at - started_at) avg_s, COUNT(*) n FROM stage_runs "
            "WHERE ok = 1 GROUP BY stage")
    }
    clips = conn.execute("SELECT COUNT(*) n FROM artifacts WHERE kind = 'clip'").fetchone()["n"]
    last_event = conn.execute("SELECT MAX(id) m FROM events").fetchone()["m"] or 0
    return {
        "total": sum(by_state.values()),
        "by_state": by_state,
        "by_status": by_status,
        "stage_avg": stage_avg,
        "clips": clips,
        "last_event_id": last_event,
        "statuses": list(STATUSES),
    }


def dumps(obj: Any) -> bytes:
    return json.dumps(obj, ensure_ascii=False, default=str).encode("utf-8")
