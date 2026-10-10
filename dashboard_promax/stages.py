#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Adaptadores entre o control plane e os scripts existentes do pipeline.

Cada etapa recebe UM vídeo, chama a função por-arquivo do script original
(sem reescrever a lógica de mídia) e devolve os artefatos produzidos. Qualquer
falha vira exceção, para o orquestrador registrar no banco onde parou.
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

AUTOMATION_DIR = Path(__file__).resolve().parent.parent
if str(AUTOMATION_DIR) not in sys.path:
    sys.path.insert(0, str(AUTOMATION_DIR))

VIDEO_EXTENSIONS = (".mp4", ".mkv", ".mov", ".avi")
# Arquivos derivados pelo próprio pipeline nunca entram na fila como vídeo novo.
DERIVED_PATTERN = re.compile(r"(_corte_\d+|_seco|\.tmp|\.temp)$", re.IGNORECASE)
TIME_PATTERN = re.compile(r"^\d{2}:\d{2}:\d{2}$")
SRT_TIME = re.compile(r"(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})")

Artifacts = list[tuple[str, Path]]
StageFn = Callable[[Path], Artifacts]


@dataclass(frozen=True)
class Stage:
    name: str
    from_status: str
    to_status: str
    run: StageFn


class StageError(RuntimeError):
    pass


# ---------------------------------------------------------------- descoberta

def is_source_video(path: Path) -> bool:
    return path.suffix.lower() in VIDEO_EXTENSIONS and not DERIVED_PATTERN.search(path.stem)


def discover_videos(course_dir: Path) -> list[Path]:
    course_dir = Path(course_dir)
    if course_dir.is_file():
        return [course_dir] if is_source_video(course_dir) else []
    return sorted(
        (p for p in course_dir.rglob("*") if p.is_file() and is_source_video(p)),
        key=lambda p: str(p).casefold(),
    )


# ---------------------------------------------------------------- caminhos

def srt_path(video: Path) -> Path:
    return video.with_suffix(".transcricao.srt")


def cuts_json_path(video: Path) -> Path:
    return video.with_name(f"{video.stem}.cortes.json")


def clip_paths(video: Path) -> list[Path]:
    clips = []
    for i in range(1, 50):
        clip = video.with_name(f"{video.stem}_corte_{i}{video.suffix}")
        if not clip.exists():
            break
        clips.append(clip)
    return clips


# ---------------------------------------------------------------- validação

def _hms(value: str) -> int:
    h, m, s = (int(x) for x in value.split(":"))
    return h * 3600 + m * 60 + s


def srt_bounds(srt_text: str) -> tuple[float, float] | None:
    starts, ends = [], []
    for m in SRT_TIME.finditer(srt_text):
        g = [int(x) for x in m.groups()]
        starts.append(g[0] * 3600 + g[1] * 60 + g[2] + g[3] / 1000)
        ends.append(g[4] * 3600 + g[5] * 60 + g[6] + g[7] / 1000)
    if not starts:
        return None
    return min(starts), max(ends)


def validate_cuts(raw: str, duration_s: float | None, srt_text: str | None) -> list[dict]:
    """Valida o JSON do Diretor de Corte contra a minutagem real do vídeo.

    Rejeita formato inválido, horários fora do vídeo ou fora da fala transcrita
    (sinal de alucinação). Tolerância de 1s por causa do truncamento HH:MM:SS.
    """

    from render_cuts import clean_json_string

    try:
        cuts = json.loads(clean_json_string(raw))
    except json.JSONDecodeError as exc:
        raise StageError(f"JSON do Claude inválido: {exc}") from exc
    if not isinstance(cuts, list) or not cuts:
        raise StageError("JSON do Claude não é uma lista de cortes não vazia")

    bounds = srt_bounds(srt_text) if srt_text else None
    problems = []
    for i, cut in enumerate(cuts, start=1):
        if not isinstance(cut, dict):
            problems.append(f"corte {i}: não é objeto")
            continue
        start, end = str(cut.get("start", "")), str(cut.get("end", ""))
        if not TIME_PATTERN.match(start) or not TIME_PATTERN.match(end):
            problems.append(f"corte {i}: horário fora do formato HH:MM:SS ({start!r}, {end!r})")
            continue
        s, e = _hms(start), _hms(end)
        if s >= e:
            problems.append(f"corte {i}: start {start} não é anterior ao end {end}")
        if duration_s is not None and e > duration_s + 1:
            problems.append(f"corte {i}: end {end} passa da duração do vídeo ({duration_s:.1f}s)")
        if bounds and (s < bounds[0] - 1 or e > bounds[1] + 1):
            problems.append(f"corte {i}: {start}-{end} fora da fala transcrita")
        if not str(cut.get("titulo", "")).strip():
            problems.append(f"corte {i}: sem título")
    if problems:
        raise StageError("Cortes rejeitados: " + "; ".join(problems))
    return cuts


def probe_duration(video: Path) -> float | None:
    from cut_silences import get_duration

    duration = get_duration(video)
    return duration or None


# ---------------------------------------------------------------- etapas

def run_whisper(video: Path) -> Artifacts:
    from transcribe_course_cpp import transcribe_video

    return [("srt", transcribe_video(video))]


def run_claude(video: Path) -> Artifacts:
    from extract_video_cuts import process_transcript

    srt = srt_path(video)
    if not srt.exists():
        raise StageError(f"Transcrição ausente: {srt.name}")
    output = process_transcript(srt)
    raw = output.read_text(encoding="utf-8", errors="replace")
    try:
        cuts = validate_cuts(raw, probe_duration(video), srt.read_text(encoding="utf-8-sig", errors="replace"))
    except StageError:
        # Preserva a resposta para auditoria e libera o caminho para nova tentativa.
        output.replace(output.with_name(f"{video.stem}.cortes.invalid.json"))
        raise
    if len(cuts) != 3:
        print(f"[AVISO] Claude retornou {len(cuts)} cortes (esperado: 3)")
    output.write_text(json.dumps(cuts, ensure_ascii=False, indent=2), encoding="utf-8")
    return [("cuts_json", output)]


def run_render(video: Path) -> Artifacts:
    from render_cuts import process_video_cuts

    cuts_json = cuts_json_path(video)
    if not cuts_json.exists():
        raise StageError(f"Arquivo de cortes ausente: {cuts_json.name}")
    # force=True: se a etapa não foi marcada como concluída, um clipe existente
    # pode estar truncado por uma execução interrompida.
    if not process_video_cuts(video, cuts_json, force=True):
        raise StageError("FFmpeg falhou ao extrair um ou mais clipes")
    artifacts: Artifacts = [("clip", clip) for clip in clip_paths(video)]
    edl = video.with_name(f"{video.stem}_cortes.edl")
    if edl.exists():
        artifacts.append(("edl", edl))
    return artifacts


def run_rough_cut(video: Path) -> Artifacts:
    from cut_silences import process_video

    if process_video(video) is False:
        raise StageError("FFmpeg falhou ao remover silêncios")
    seco = video.with_name(f"{video.stem}_seco{video.suffix}")
    return [("rough_cut", seco)] if seco.exists() else []


DEFAULT_PIPELINE: tuple[Stage, ...] = (
    Stage("WHISPER", "RECEIVED", "WHISPER_DONE", run_whisper),
    Stage("CLAUDE", "WHISPER_DONE", "CLAUDE_DONE", run_claude),
    Stage("RENDER", "CLAUDE_DONE", "RENDER_DONE", run_render),
    Stage("ROUGH_CUT", "RENDER_DONE", "ROUGH_CUT_DONE", run_rough_cut),
)
