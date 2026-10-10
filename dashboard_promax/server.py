#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Servidor do Dashboard Promax: API JSON + painel estático + streaming de clipes.

Só biblioteca padrão. Escuta apenas em 127.0.0.1. O worker do pipeline pode
rodar embutido (botão no painel ou --worker) ou em outro processo via
``orchestrator.py run`` — a fila SQLite coordena os dois com segurança.

Uso:
    python server.py                 # http://127.0.0.1:8770
    python server.py --worker        # já sobe processando a fila
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import re
import sys
import threading
import urllib.parse
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pipeline_db as db  # noqa: E402
from orchestrator import Worker, ingest  # noqa: E402
from stages import DEFAULT_PIPELINE  # noqa: E402

STATIC_DIR = Path(__file__).resolve().parent / "static"
DEFAULT_PORT = 8770
CHUNK = 256 * 1024
MAX_BODY = 64 * 1024
mimetypes.add_type("text/plain; charset=utf-8", ".srt")
mimetypes.add_type("text/plain; charset=utf-8", ".edl")
mimetypes.add_type("application/javascript", ".js")


class WorkerController:
    """Liga/desliga um worker embutido em thread de fundo."""

    def __init__(self, db_path, pipeline=DEFAULT_PIPELINE):
        self.db_path, self.pipeline = db_path, pipeline
        self._lock = threading.Lock()
        self._worker: Worker | None = None
        self._thread: threading.Thread | None = None

    def start(self) -> bool:
        with self._lock:
            if self._thread and self._thread.is_alive():
                return False
            self._worker = Worker(self.db_path, pipeline=self.pipeline, echo=True)
            self._thread = threading.Thread(target=self._worker.run, kwargs={"drain": False},
                                            name="pipeline-worker", daemon=True)
            self._thread.start()
            return True

    def stop(self) -> bool:
        with self._lock:
            if not (self._thread and self._thread.is_alive()):
                return False
            self._worker.stop()
            return True

    def status(self) -> dict:
        alive = bool(self._thread and self._thread.is_alive())
        worker = self._worker
        state = "stopped"
        if alive:
            state = "stopping" if worker.stop_event.is_set() else ("busy" if worker.current_video_id else "idle")
        return {
            "state": state,
            "current_video_id": worker.current_video_id if alive and worker else None,
            "processed": worker.processed if worker else 0,
        }


def _artifact_view(artifact: dict) -> dict:
    path = Path(artifact["path"])
    exists = path.exists()
    return {
        "id": artifact["id"],
        "kind": artifact["kind"],
        "name": path.name,
        "exists": exists,
        "size": path.stat().st_size if exists else None,
        "url": f"/media/{artifact['id']}",
    }


def _load_cuts(artifacts: list[dict]) -> list[dict] | None:
    for artifact in artifacts:
        if artifact["kind"] == "cuts_json" and Path(artifact["path"]).exists():
            try:
                data = json.loads(Path(artifact["path"]).read_text(encoding="utf-8"))
                return data if isinstance(data, list) else None
            except (OSError, json.JSONDecodeError):
                return None
    return None


class Handler(BaseHTTPRequestHandler):
    server_version = "DashboardPromax/1.0"
    protocol_version = "HTTP/1.1"

    # ------------------------------------------------------------ infra
    @property
    def app(self) -> "App":
        return self.server.app  # type: ignore[attr-defined]

    def log_message(self, fmt, *args):  # silencia polling; erros continuam no stderr
        if not self.path.startswith(("/api/summary", "/api/videos", "/api/events")):
            sys.stderr.write("[http] " + (fmt % args) + "\n")

    def _host_ok(self) -> bool:
        # Bloqueia DNS rebinding: só aceita os nomes locais da própria porta.
        port = self.server.server_address[1]
        return self.headers.get("Host", "") in {f"127.0.0.1:{port}", f"localhost:{port}"}

    def _send_json(self, payload, status: int = 200) -> None:
        body = db.dumps(payload)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _error(self, status: int, message: str) -> None:
        self._send_json({"error": message}, status)

    def _read_json(self) -> dict | None:
        # Consome o corpo ANTES de qualquer recusa: com keep-alive, bytes não
        # lidos seriam interpretados como a próxima requisição.
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = -1
        if length < 0 or length > MAX_BODY:
            self.close_connection = True
            self._error(413, "Corpo grande demais ou Content-Length inválido")
            return None
        raw = self.rfile.read(length) if length else b""
        if not self.headers.get("Content-Type", "").startswith("application/json"):
            self._error(415, "Content-Type deve ser application/json")
            return None
        origin = self.headers.get("Origin")
        if origin and urllib.parse.urlparse(origin).netloc != self.headers.get("Host"):
            self._error(403, "Origem não permitida")
            return None
        try:
            data = json.loads(raw or b"{}")
        except json.JSONDecodeError:
            self._error(400, "JSON inválido")
            return None
        if not isinstance(data, dict):
            self._error(400, "Esperado objeto JSON")
            return None
        return data

    # ------------------------------------------------------------ roteamento
    def do_GET(self):  # noqa: N802
        if not self._host_ok():
            return self._error(421, "Host não permitido")
        url = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(url.query)
        path = url.path
        try:
            if path in ("/", "/index.html"):
                return self._static("index.html")
            if path.startswith("/static/"):
                return self._static(path[len("/static/"):])
            if path == "/api/health":
                return self._send_json({"ok": True, "db": str(self.app.db_path), "worker": self.app.worker.status()})
            if path == "/api/summary":
                with self.app.conn() as conn:
                    data = db.summary(conn)
                data["worker"] = self.app.worker.status()
                return self._send_json(data)
            if path == "/api/videos":
                state = (qs.get("state") or [None])[0]
                if state and state not in db.STATES:
                    return self._error(400, "state inválido")
                with self.app.conn() as conn:
                    return self._send_json(db.list_videos(conn, state=state, query=(qs.get("q") or [None])[0]))
            m = re.fullmatch(r"/api/videos/(\d+)", path)
            if m:
                with self.app.conn() as conn:
                    video = db.get_video_detail(conn, int(m.group(1)))
                if video is None:
                    return self._error(404, "Vídeo não encontrado")
                raw = video.pop("artifacts")
                video["cuts"] = _load_cuts(raw)
                video["artifacts"] = [_artifact_view(a) for a in raw]
                video["path_name"] = Path(video["path"]).name
                return self._send_json(video)
            if path == "/api/events":
                since = int((qs.get("since") or ["0"])[0])
                limit = min(int((qs.get("limit") or ["100"])[0]), 500)
                with self.app.conn() as conn:
                    return self._send_json(db.events_since(conn, since, limit))
            m = re.fullmatch(r"/media/(\d+)", path)
            if m:
                return self._media(int(m.group(1)))
            return self._error(404, "Rota não encontrada")
        except ValueError as exc:
            return self._error(400, str(exc))

    def do_POST(self):  # noqa: N802
        if not self._host_ok():
            return self._error(421, "Host não permitido")
        path = urllib.parse.urlparse(self.path).path
        data = self._read_json()
        if data is None:
            return
        if path == "/api/ingest":
            target = str(data.get("path") or "").strip().strip('"')
            if not target:
                return self._error(400, "Informe o caminho da pasta ou do vídeo")
            try:
                with self.app.conn() as conn:
                    total, created = ingest(conn, Path(target), data.get("course") or None)
            except FileNotFoundError as exc:
                return self._error(404, str(exc))
            return self._send_json({"found": total, "created": created}, 201)
        m = re.fullmatch(r"/api/videos/(\d+)/retry", path)
        if m:
            with self.app.conn() as conn:
                ok = db.retry(conn, int(m.group(1)))
            return self._send_json({"ok": ok}, 200 if ok else 409)
        if path == "/api/retry-failed":
            with self.app.conn() as conn:
                return self._send_json({"requeued": db.retry_all_failed(conn)})
        if path == "/api/worker/start":
            return self._send_json({"started": self.app.worker.start(), "worker": self.app.worker.status()})
        if path == "/api/worker/stop":
            return self._send_json({"stopping": self.app.worker.stop(), "worker": self.app.worker.status()})
        return self._error(404, "Rota não encontrada")

    # ------------------------------------------------------------ arquivos
    def _static(self, rel: str) -> None:
        target = (STATIC_DIR / rel).resolve()
        if STATIC_DIR not in target.parents or not target.is_file():
            return self._error(404, "Arquivo não encontrado")
        body = target.read_bytes()
        ctype = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        if ctype.startswith("text/") and "charset" not in ctype:
            ctype += "; charset=utf-8"
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(body)

    def _media(self, artifact_id: int) -> None:
        # Só serve arquivos registrados como artefato no banco: sem path traversal.
        with self.app.conn() as conn:
            artifact = db.get_artifact(conn, artifact_id)
        if artifact is None or not Path(artifact["path"]).is_file():
            return self._error(404, "Mídia não encontrada")
        file_path = Path(artifact["path"])
        size = file_path.stat().st_size
        ctype = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        start, end, status = 0, size - 1, HTTPStatus.OK
        range_header = self.headers.get("Range")
        if range_header:
            m = re.fullmatch(r"bytes=(\d*)-(\d*)", range_header.strip())
            if not m or (not m.group(1) and not m.group(2)):
                self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                self.send_header("Content-Range", f"bytes */{size}")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
            if m.group(1):
                start = int(m.group(1))
                end = min(int(m.group(2)), size - 1) if m.group(2) else size - 1
            else:  # sufixo: últimos N bytes
                start = max(size - int(m.group(2)), 0)
            if start > end or start >= size:
                self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                self.send_header("Content-Range", f"bytes */{size}")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return
            status = HTTPStatus.PARTIAL_CONTENT
        length = end - start + 1
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(length))
        if status == HTTPStatus.PARTIAL_CONTENT:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.end_headers()
        try:
            with file_path.open("rb") as fh:
                fh.seek(start)
                remaining = length
                while remaining > 0:
                    chunk = fh.read(min(CHUNK, remaining))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass  # player trocou de posição ou fechou


class App:
    def __init__(self, db_path=None, pipeline=DEFAULT_PIPELINE):
        self.db_path = db.resolve_db_path(db_path)
        conn = db.connect(self.db_path)
        db.init_db(conn)
        conn.close()
        self.worker = WorkerController(self.db_path, pipeline)

    def conn(self):
        return _ConnCtx(self.db_path)


class _ConnCtx:
    def __init__(self, db_path):
        self.db_path = db_path

    def __enter__(self):
        self._conn = db.connect(self.db_path)
        return self._conn

    def __exit__(self, *exc):
        self._conn.close()


def make_server(host: str = "127.0.0.1", port: int = DEFAULT_PORT, db_path=None,
                pipeline=DEFAULT_PIPELINE) -> ThreadingHTTPServer:
    server = ThreadingHTTPServer((host, port), Handler)
    server.daemon_threads = True
    server.app = App(db_path, pipeline)  # type: ignore[attr-defined]
    return server


def main(argv: list[str] | None = None) -> int:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description="Dashboard Promax do Motor de Vídeo")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--db", help="Caminho do SQLite")
    parser.add_argument("--worker", action="store_true", help="Inicia o worker junto com o servidor")
    args = parser.parse_args(argv)

    server = make_server(port=args.port, db_path=args.db)
    if args.worker:
        server.app.worker.start()
    print(f"[OK] Dashboard Promax em http://127.0.0.1:{args.port}  (banco: {server.app.db_path})", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Encerrando servidor...")
        server.app.worker.stop()
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
