"""Testes do control plane: banco, validação, retomada e API HTTP.

Rodar:  python -m unittest discover -s tests -v   (dentro de dashboard_promax/)
"""

from __future__ import annotations

import http.client
import json
import subprocess
import sys
import tempfile
import threading
import time
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
sys.path.insert(0, str(HERE))

import fake_pipeline as fp  # noqa: E402
import pipeline_db as db  # noqa: E402
from orchestrator import Worker, ingest  # noqa: E402
from server import make_server  # noqa: E402
from stages import StageError, discover_videos, validate_cuts  # noqa: E402

SRT = "1\n00:00:01,000 --> 00:00:04,500\na\n\n2\n00:01:00,000 --> 00:01:30,200\nb\n"


class TempWorkspace(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)
        self.db_path = self.root / "state.sqlite"
        self.course = self.root / "Curso Teste" / "Modulo 1"
        self.course.mkdir(parents=True)
        self.conn = db.connect(self.db_path)
        db.init_db(self.conn)

    def tearDown(self):
        self.conn.close()
        self._tmp.cleanup()

    def make_video(self, name: str) -> Path:
        path = self.course / name
        path.write_bytes(b"fake-video")
        return path


class DiscoveryAndValidationTests(TempWorkspace):
    def test_discover_ignores_pipeline_outputs(self):
        for name in ("aula1.mp4", "aula1_corte_1.mp4", "aula1_seco.mp4", "aula1_seco.tmp.mp4", "aula2.mkv", "notas.txt"):
            (self.course / name).write_bytes(b"x")
        names = [p.name for p in discover_videos(self.root)]
        self.assertEqual(names, ["aula1.mp4", "aula2.mkv"])

    def test_valid_cuts_with_markdown_fence(self):
        raw = '```json\n[{"titulo": "A", "start": "00:00:01", "end": "00:00:04"}]\n```'
        self.assertEqual(len(validate_cuts(raw, 100.0, SRT)), 1)

    def test_rejects_hallucinated_or_malformed_cuts(self):
        cases = {
            "formato": '[{"titulo": "A", "start": "1:00", "end": "00:00:04"}]',
            "invertido": '[{"titulo": "A", "start": "00:00:10", "end": "00:00:04"}]',
            "duração": '[{"titulo": "A", "start": "00:00:01", "end": "00:05:00"}]',
            "fora da fala": '[{"titulo": "A", "start": "00:00:01", "end": "00:01:45"}]',
            "sem título": '[{"titulo": "", "start": "00:00:01", "end": "00:00:04"}]',
            "não-lista": '{"titulo": "A"}',
            "json quebrado": "Aqui estão os cortes: [",
        }
        for label, raw in cases.items():
            with self.subTest(label), self.assertRaises(StageError):
                validate_cuts(raw, 200.0, SRT)


class StateMachineTests(TempWorkspace):
    def test_register_is_idempotent(self):
        video = self.make_video("aula.mp4")
        first = db.register_video(self.conn, video, "Curso")
        second = db.register_video(self.conn, video, "Curso")
        self.assertTrue(first[1])
        self.assertFalse(second[1])
        self.assertEqual(first[0], second[0])

    def test_full_success_path(self):
        video = self.make_video("aula.mp4")
        ingest(self.conn, self.course)
        Worker(self.db_path, pipeline=fp.pipeline(), echo=False).run()
        row = db.list_videos(self.conn)[0]
        self.assertEqual((row["status"], row["state"]), ("ROUGH_CUT_DONE", "done"))
        self.assertEqual(fp.calls(video), ["WHISPER", "CLAUDE", "RENDER", "ROUGH_CUT"])
        detail = db.get_video_detail(self.conn, row["id"])
        kinds = sorted(a["kind"] for a in detail["artifacts"])
        self.assertEqual(kinds, ["clip", "clip", "clip", "cuts_json", "rough_cut", "source", "srt"])
        self.assertTrue(all(r["ok"] == 1 for r in detail["stage_runs"]))
        self.assertTrue(any("transcrição falsa" in e["message"] for e in detail["events"]))  # stdout → feed

    def test_failure_then_retry_resumes_from_failed_stage(self):
        video = self.make_video("aula.mp4")
        ingest(self.conn, self.course)
        Worker(self.db_path, pipeline=fp.pipeline(fp.failing_claude), echo=False).run()
        row = db.list_videos(self.conn)[0]
        self.assertEqual((row["status"], row["state"]), ("WHISPER_DONE", "failed"))
        self.assertIn("Claude indisponível", row["last_error"])

        self.assertTrue(db.retry(self.conn, row["id"]))
        Worker(self.db_path, pipeline=fp.pipeline(), echo=False).run()
        row = db.get_video_row(self.conn, row["id"])
        self.assertEqual((row["status"], row["state"], row["attempts"]), ("ROUGH_CUT_DONE", "done", 2))
        # WHISPER não roda de novo: a retomada começa na etapa que falhou.
        self.assertEqual(fp.calls(video), ["WHISPER", "CLAUDE", "CLAUDE", "RENDER", "ROUGH_CUT"])

    def test_missing_file_fails_cleanly(self):
        video = self.make_video("sumiu.mp4")
        ingest(self.conn, self.course)
        video.unlink()
        Worker(self.db_path, pipeline=fp.pipeline(), echo=False).run()
        row = db.list_videos(self.conn)[0]
        self.assertEqual(row["state"], "failed")
        self.assertIn("não encontrado", row["last_error"])

    def test_resume_after_process_is_killed_mid_stage(self):
        """Mata de verdade o worker durante CLAUDE e confirma a retomada."""
        video = self.make_video("aula.mp4")
        ingest(self.conn, self.course)
        child = subprocess.Popen([sys.executable, str(HERE / "fake_pipeline.py"), str(self.db_path)],
                                 stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            deadline = time.time() + 30
            while time.time() < deadline:
                row = db.list_videos(self.conn)[0]
                if row["current_stage"] == "CLAUDE":
                    break
                time.sleep(0.2)
            self.assertEqual(row["current_stage"], "CLAUDE", "worker filho não chegou na etapa CLAUDE")
        finally:
            child.kill()
            child.wait(timeout=10)

        row = db.list_videos(self.conn)[0]
        self.assertEqual((row["state"], row["status"]), ("running", "WHISPER_DONE"))  # ficou órfão

        Worker(self.db_path, pipeline=fp.pipeline(), echo=False).run()  # detecta PID morto e retoma
        row = db.get_video_row(self.conn, row["id"])
        self.assertEqual((row["status"], row["state"]), ("ROUGH_CUT_DONE", "done"))
        self.assertEqual(fp.calls(video), ["WHISPER", "CLAUDE-SLOW", "CLAUDE", "RENDER", "ROUGH_CUT"])
        runs = db.get_video_detail(self.conn, row["id"])["stage_runs"]
        self.assertTrue(any(r["stage"] == "CLAUDE" and r["ok"] == 0 for r in runs))
        events = [e["message"] for e in db.events_since(self.conn, 0, 500, video_id=row["id"])]
        self.assertTrue(any("Retomada" in m for m in events))

    def test_stale_heartbeat_is_recovered(self):
        video = self.make_video("aula.mp4")
        vid, _ = db.register_video(self.conn, video)
        db.claim_next(self.conn, "outro-host:999:1")
        self.assertEqual(db.recover_stale(self.conn, stale_seconds=90), 0)  # host remoto e heartbeat recente
        self.conn.execute("UPDATE videos SET heartbeat_at = heartbeat_at - 1000 WHERE id = ?", (vid,))
        self.assertEqual(db.recover_stale(self.conn, stale_seconds=90), 1)
        self.assertEqual(db.get_video_row(self.conn, vid)["state"], "queued")


class ApiTests(TempWorkspace):
    def setUp(self):
        super().setUp()
        self.server = make_server(port=0, db_path=self.db_path, pipeline=fp.pipeline())
        self.port = self.server.server_address[1]
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.server.app.worker.stop()
        self.server.shutdown()
        self.server.server_close()
        super().tearDown()

    def request(self, method, path, body=None, headers=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        hdrs = {"Host": f"127.0.0.1:{self.port}"}
        payload = None
        if body is not None:
            payload = json.dumps(body).encode()
            hdrs["Content-Type"] = "application/json"
        hdrs.update(headers or {})
        conn.request(method, path, body=payload, headers=hdrs)
        res = conn.getresponse()
        data = res.read()
        conn.close()
        ctype = res.getheader("Content-Type", "")
        return res.status, (json.loads(data) if "json" in ctype else data), res

    def wait_for(self, predicate, timeout=15):
        deadline = time.time() + timeout
        while time.time() < deadline:
            if predicate():
                return True
            time.sleep(0.1)
        return False

    def test_end_to_end_via_api(self):
        self.make_video("aula1.mp4")
        self.make_video("aula2.mp4")

        status, health, _ = self.request("GET", "/api/health")
        self.assertEqual((status, health["ok"], health["worker"]["state"]), (200, True, "stopped"))

        status, body, _ = self.request("POST", "/api/ingest", {"path": str(self.root / "Curso Teste")})
        self.assertEqual((status, body), (201, {"found": 2, "created": 2}))
        status, body, _ = self.request("POST", "/api/ingest", {"path": str(self.root / "Curso Teste")})
        self.assertEqual(body["created"], 0)

        _, summary, _ = self.request("GET", "/api/summary")
        self.assertEqual((summary["total"], summary["by_state"]["queued"]), (2, 2))

        status, body, _ = self.request("POST", "/api/worker/start", {})
        self.assertTrue(body["started"])
        done = self.wait_for(lambda: self.request("GET", "/api/summary")[1]["by_state"]["done"] == 2)
        self.assertTrue(done, "worker não concluiu os vídeos")

        _, summary, _ = self.request("GET", "/api/summary")
        self.assertEqual(summary["clips"], 6)
        self.assertEqual(summary["by_status"]["ROUGH_CUT_DONE"], 2)
        self.assertEqual(set(summary["stage_avg"]), {"WHISPER", "CLAUDE", "RENDER", "ROUGH_CUT"})

        _, videos, _ = self.request("GET", "/api/videos?state=done&q=aula1")
        self.assertEqual([v["title"] for v in videos], ["aula1"])

        _, detail, _ = self.request("GET", f"/api/videos/{videos[0]['id']}")
        self.assertEqual([c["titulo"] for c in detail["cuts"]], ["Corte 1", "Corte 3", "Corte 5"])
        clip = next(a for a in detail["artifacts"] if a["kind"] == "clip")
        self.assertEqual(clip["size"], 10240)

        status, data, res = self.request("GET", clip["url"], headers={"Range": "bytes=100-199"})
        self.assertEqual((status, len(data), res.getheader("Content-Range")), (206, 100, "bytes 100-199/10240"))
        self.assertEqual(data, (bytes(range(256)) * 40)[100:200])
        status, data, _ = self.request("GET", clip["url"])
        self.assertEqual((status, len(data)), (200, 10240))
        status, _, _ = self.request("GET", clip["url"], headers={"Range": "bytes=99999-"})
        self.assertEqual(status, 416)

        _, events, _ = self.request("GET", "/api/events?since=0&limit=500")
        self.assertTrue(any(e["message"] == "Pipeline concluído" for e in events))

        status, body, _ = self.request("POST", "/api/worker/stop", {})
        self.assertTrue(body["stopping"])

    def test_retry_and_errors(self):
        self.server.app.worker.pipeline = fp.pipeline(fp.failing_claude)
        self.make_video("aula.mp4")
        self.request("POST", "/api/ingest", {"path": str(self.course)})
        self.request("POST", "/api/worker/start", {})
        self.assertTrue(self.wait_for(lambda: self.request("GET", "/api/summary")[1]["by_state"]["failed"] == 1))
        _, videos, _ = self.request("GET", "/api/videos?state=failed")
        vid = videos[0]["id"]
        self.assertIn("CLAUDE falhou", videos[0]["last_error"])

        status, body, _ = self.request("POST", f"/api/videos/{vid}/retry", {})
        self.assertEqual((status, body["ok"]), (200, True))
        status, _, _ = self.request("POST", f"/api/videos/{vid}/retry", {})  # já está na fila/rodando
        self.assertEqual(status, 409)

    def test_security_and_validation(self):
        status, _, _ = self.request("POST", "/api/ingest", None)  # sem JSON
        self.assertEqual(status, 415)
        status, _, _ = self.request("POST", "/api/ingest", {"path": "x"}, headers={"Origin": "http://evil.example"})
        self.assertEqual(status, 403)
        status, _, _ = self.request("GET", "/api/summary", headers={"Host": "evil.example"})
        self.assertEqual(status, 421)
        status, _, _ = self.request("POST", "/api/ingest", {"path": str(self.root / "nao-existe")})
        self.assertEqual(status, 404)
        status, _, _ = self.request("GET", "/api/videos?state=hackeado")
        self.assertEqual(status, 400)
        status, _, _ = self.request("GET", "/media/9999")
        self.assertEqual(status, 404)
        status, _, _ = self.request("GET", "/static/../server.py")
        self.assertEqual(status, 404)
        status, _, _ = self.request("GET", "/static/..%2Fserver.py")
        self.assertEqual(status, 404)

    def test_rejected_post_does_not_poison_keepalive(self):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        host = {"Host": f"127.0.0.1:{self.port}"}
        conn.request("POST", "/api/ingest", body=b'{"path": "x"}',
                     headers={**host, "Content-Type": "application/json", "Origin": "http://evil.example"})
        res = conn.getresponse()
        res.read()
        self.assertEqual(res.status, 403)
        conn.request("GET", "/api/health", headers=host)  # mesma conexão
        res = conn.getresponse()
        self.assertEqual((res.status, json.loads(res.read())["ok"]), (200, True))
        conn.close()

    def test_serves_dashboard(self):
        status, html, res = self.request("GET", "/")
        self.assertEqual(status, 200)
        self.assertIn(b"Motor de V", html)
        for asset in ("/static/app.js", "/static/app.css"):
            status, _, _ = self.request("GET", asset)
            self.assertEqual(status, 200, asset)


if __name__ == "__main__":
    unittest.main()
