#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Orquestrador do Motor de Vídeo: consome a fila SQLite etapa por etapa.

Substitui as etapas 3-6 do ``run_course_2.ps1`` (que rodavam "às cegas") por
uma execução rastreada por vídeo: cada etapa concluída vira um marco no banco,
e uma execução interrompida recomeça da etapa que não terminou.

Uso:
    python orchestrator.py ingest "G:\\...\\Curso"       # registra vídeos (RECEIVED)
    python orchestrator.py run --course "G:\\...\\Curso" # registra e processa até esvaziar
    python orchestrator.py run --watch                   # worker contínuo
    python orchestrator.py status
    python orchestrator.py retry all
"""

from __future__ import annotations

import argparse
import contextlib
import io
import os
import socket
import sys
import threading
import traceback
from pathlib import Path
from typing import Sequence

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pipeline_db as db  # noqa: E402
from stages import DEFAULT_PIPELINE, Stage, discover_videos, probe_duration  # noqa: E402

HEARTBEAT_SECONDS = 10.0
STALE_SECONDS = 90.0


class _EventTee(io.TextIOBase):
    """Espelha o print() das etapas no terminal e no feed de eventos do banco."""

    def __init__(self, conn, video_id: int, stage: str, passthrough):
        self.conn, self.video_id, self.stage, self.passthrough = conn, video_id, stage, passthrough
        self._buffer = ""

    def write(self, text: str) -> int:
        if self.passthrough is not None:
            self.passthrough.write(text)
        self._buffer += text
        while "\n" in self._buffer:
            line, self._buffer = self._buffer.split("\n", 1)
            self._emit(line)
        return len(text)

    def flush(self) -> None:
        if self.passthrough is not None:
            self.passthrough.flush()

    def close_buffer(self) -> None:
        self._emit(self._buffer)
        self._buffer = ""

    def _emit(self, line: str) -> None:
        line = line.strip()
        if not line:
            return
        level = "error" if line.startswith(("[-]", "[ERRO]")) else "warn" if line.startswith("[AVISO]") else "log"
        db.add_event(self.conn, self.video_id, line, level=level, stage=self.stage)


class _Heartbeat:
    def __init__(self, db_path, video_id: int, worker_id: str):
        self.db_path, self.video_id, self.worker_id = db_path, video_id, worker_id
        self._stop = threading.Event()
        self._thread = threading.Thread(target=self._loop, daemon=True)

    def __enter__(self):
        self._thread.start()
        return self

    def __exit__(self, *exc):
        self._stop.set()
        self._thread.join(timeout=5)

    def _loop(self) -> None:
        conn = db.connect(self.db_path)
        try:
            while not self._stop.wait(HEARTBEAT_SECONDS):
                db.heartbeat(conn, self.video_id, self.worker_id)
        finally:
            conn.close()


class Worker:
    def __init__(self, db_path=None, pipeline: Sequence[Stage] = DEFAULT_PIPELINE,
                 worker_id: str | None = None, poll_seconds: float = 2.0, echo: bool = True):
        self.db_path = db.resolve_db_path(db_path)
        self.pipeline = tuple(pipeline)
        self.worker_id = worker_id or f"{socket.gethostname()}:{os.getpid()}:{threading.get_ident()}"
        self.poll_seconds = poll_seconds
        self.echo = echo
        self.stop_event = threading.Event()
        self.current_video_id: int | None = None
        self.processed = 0

    def stop(self) -> None:
        self.stop_event.set()

    def run(self, drain: bool = True) -> int:
        """Processa a fila. drain=True encerra quando não houver mais trabalho."""

        conn = db.connect(self.db_path)
        db.init_db(conn)
        try:
            recovered = db.recover_stale(conn, STALE_SECONDS)
            if recovered:
                self._say(f"[*] {recovered} vídeo(s) interrompido(s) devolvido(s) à fila")
            while not self.stop_event.is_set():
                job = db.claim_next(conn, self.worker_id)
                if job is None:
                    if drain:
                        break
                    self.stop_event.wait(self.poll_seconds)
                    db.recover_stale(conn, STALE_SECONDS)
                    continue
                self._process(conn, job)
                self.processed += 1
        finally:
            conn.close()
        return self.processed

    def _process(self, conn, job: dict) -> None:
        video_id, video = job["id"], Path(job["path"])
        self.current_video_id = video_id
        try:
            if not video.exists():
                db.fail_stage(conn, video_id, None, f"Arquivo de vídeo não encontrado: {video}")
                return
            if job["duration_s"] is None:
                duration = probe_duration(video)
                if duration:
                    db.set_duration(conn, video_id, duration)

            start = db.STATUSES.index(job["status"])
            for stage in self.pipeline[start:]:
                if self.stop_event.is_set():
                    db.add_event(conn, video_id, "Worker parado; vídeo volta para a fila", level="warn")
                    break
                self._say(f"[>] {video.name} :: {stage.name}")
                run_id = db.start_stage(conn, video_id, stage.name)
                tee = _EventTee(conn, video_id, stage.name, sys.stdout if self.echo else None)
                try:
                    with _Heartbeat(self.db_path, video_id, self.worker_id), contextlib.redirect_stdout(tee):
                        artifacts = stage.run(video)
                except Exception as exc:  # noqa: BLE001 - qualquer falha vira estado no banco
                    tee.close_buffer()
                    detail = f"{stage.name} falhou: {exc}"
                    if not str(exc):
                        detail += "\n" + traceback.format_exc(limit=3)
                    db.fail_stage(conn, video_id, run_id, detail)
                    self._say(f"[-] {detail}")
                    return
                tee.close_buffer()
                db.complete_stage(conn, video_id, run_id, stage.to_status, artifacts)
        finally:
            db.release(conn, video_id)
            self.current_video_id = None

    def _say(self, message: str) -> None:
        if self.echo:
            print(message, flush=True)


# ---------------------------------------------------------------- CLI

def ingest(conn, target: Path, course: str | None = None) -> tuple[int, int]:
    target = Path(target).expanduser().resolve()
    if not target.exists():
        raise FileNotFoundError(f"Caminho não encontrado: {target}")
    course_name = course or (target.name if target.is_dir() else target.parent.name)
    created = 0
    videos = discover_videos(target)
    for video in videos:
        _, is_new = db.register_video(conn, video, course=course_name)
        created += int(is_new)
    db.add_event(conn, None, f"Ingestão de '{course_name}': {len(videos)} vídeo(s), {created} novo(s)")
    return len(videos), created


def _print_status(conn) -> None:
    rows = db.list_videos(conn)
    if not rows:
        print("Fila vazia.")
        return
    print(f"{'ID':>4}  {'ESTADO':<8} {'MARCO':<15} {'TENT.':>5}  VÍDEO")
    for r in rows:
        print(f"{r['id']:>4}  {r['state']:<8} {r['status']:<15} {r['attempts']:>5}  {r['title']}")
        if r["last_error"]:
            print(f"      └─ {r['last_error'][:160]}")
    s = db.summary(conn)
    print(f"\nTotal {s['total']} · " + " · ".join(f"{k}={v}" for k, v in s["by_state"].items()))


def main(argv: list[str] | None = None) -> int:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description="Control plane do Motor de Vídeo")
    parser.add_argument("--db", help="Caminho do SQLite (padrão: data/video_pipeline_db.sqlite)")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("init", help="Cria o banco")
    p_ing = sub.add_parser("ingest", help="Registra vídeos de uma pasta como RECEIVED")
    p_ing.add_argument("path", type=Path)
    p_ing.add_argument("--course")
    p_run = sub.add_parser("run", help="Processa a fila")
    p_run.add_argument("--course", type=Path, help="Ingerir esta pasta antes de processar")
    p_run.add_argument("--watch", action="store_true", help="Não encerrar com a fila vazia")
    sub.add_parser("status", help="Mostra a fila")
    p_retry = sub.add_parser("retry", help="Reenfileira vídeos com falha")
    p_retry.add_argument("target", help="ID do vídeo ou 'all'")

    args = parser.parse_args(argv)
    conn = db.connect(args.db)
    db.init_db(conn)

    if args.cmd == "init":
        print(f"[OK] Banco pronto: {db.resolve_db_path(args.db)}")
        return 0
    if args.cmd == "ingest":
        total, created = ingest(conn, args.path, args.course)
        print(f"[OK] {total} vídeo(s) encontrado(s), {created} novo(s) na fila")
        return 0
    if args.cmd == "status":
        _print_status(conn)
        return 0
    if args.cmd == "retry":
        n = db.retry_all_failed(conn) if args.target == "all" else int(db.retry(conn, int(args.target)))
        print(f"[OK] {n} vídeo(s) reenfileirado(s)")
        return 0

    # run
    scope: list[str] = []
    if args.course:
        ingest(conn, args.course)
        root = str(Path(args.course).expanduser().resolve())
        scope = [r["path"] for r in db.list_videos(conn, limit=100000) if r["path"].startswith(root)]
    conn.close()

    worker = Worker(args.db)
    try:
        worker.run(drain=not args.watch)
    except KeyboardInterrupt:
        worker.stop()
        print("\n[!] Interrompido. O estado ficou salvo; rode de novo para retomar.")
        return 130

    conn = db.connect(args.db)
    failed = [r for r in db.list_videos(conn, state="failed", limit=100000) if not scope or r["path"] in scope]
    _print_status(conn)
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
