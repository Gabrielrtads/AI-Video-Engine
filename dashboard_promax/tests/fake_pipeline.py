"""Pipeline falso (sem ffmpeg/whisper/claude) para testar o control plane."""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from stages import Stage  # noqa: E402


def _mark(video: Path, stage: str) -> None:
    log = video.with_name(f"{video.stem}.calls.log")
    with log.open("a", encoding="utf-8") as fh:
        fh.write(stage + "\n")


def calls(video: Path) -> list[str]:
    log = video.with_name(f"{video.stem}.calls.log")
    return log.read_text(encoding="utf-8").split() if log.exists() else []


def whisper(video: Path):
    _mark(video, "WHISPER")
    srt = video.with_suffix(".transcricao.srt")
    srt.write_text("1\n00:00:00,000 --> 00:00:09,000\nolá\n", encoding="utf-8")
    print("[+] transcrição falsa gerada")
    return [("srt", srt)]


def claude(video: Path):
    _mark(video, "CLAUDE")
    out = video.with_name(f"{video.stem}.cortes.json")
    cuts = [{"titulo": f"Corte {i}", "start": f"00:00:0{i}", "end": f"00:00:0{i + 1}", "motivo": "teste"} for i in (1, 3, 5)]
    out.write_text(json.dumps(cuts), encoding="utf-8")
    return [("cuts_json", out)]


def render(video: Path):
    _mark(video, "RENDER")
    arts = []
    for i in (1, 2, 3):
        clip = video.with_name(f"{video.stem}_corte_{i}{video.suffix}")
        clip.write_bytes(bytes(range(256)) * 40)  # 10240 bytes
        arts.append(("clip", clip))
    return arts


def rough_cut(video: Path):
    _mark(video, "ROUGH_CUT")
    seco = video.with_name(f"{video.stem}_seco{video.suffix}")
    seco.write_bytes(b"seco")
    return [("rough_cut", seco)]


def failing_claude(video: Path):
    _mark(video, "CLAUDE")
    raise RuntimeError("Claude indisponível (simulado)")


def slow_claude(video: Path):
    _mark(video, "CLAUDE-SLOW")
    time.sleep(120)
    return []


def pipeline(claude_fn=claude):
    return (
        Stage("WHISPER", "RECEIVED", "WHISPER_DONE", whisper),
        Stage("CLAUDE", "WHISPER_DONE", "CLAUDE_DONE", claude_fn),
        Stage("RENDER", "CLAUDE_DONE", "RENDER_DONE", render),
        Stage("ROUGH_CUT", "RENDER_DONE", "ROUGH_CUT_DONE", rough_cut),
    )


if __name__ == "__main__":
    # Processo-filho do teste de retomada: trava na etapa CLAUDE até ser morto.
    from orchestrator import Worker

    Worker(sys.argv[1], pipeline=pipeline(slow_claude), echo=False).run(drain=True)
