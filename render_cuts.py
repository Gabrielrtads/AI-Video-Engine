#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Processa os arquivos cortes.json gerados pelo Claude e extrai os clipes do vídeo original.

Este script lê os tempos de início e fim, extrai os clipes usando FFmpeg, e gera um arquivo
.csv com marcadores para ser importado facilmente no DaVinci Resolve ou Premiere.
"""

import argparse
import json
import logging
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path


LOGGER = logging.getLogger("render_cuts")
SCRIPT_DIR = Path(__file__).resolve().parent
REFRAME_VENV_DIR = SCRIPT_DIR / "reframe_venv"
REFRAME_REPO_DIR = SCRIPT_DIR / "auto-vertical-reframe"
REFRAME_MODEL_PATH = REFRAME_REPO_DIR / "yolo11n-seg.pt"
FFMPEG_TIMEOUT_SECONDS = 30 * 60
VERTHOR_TIMEOUT_SECONDS = 2 * 60 * 60
DEPENDENCY_PROBE_TIMEOUT_SECONDS = 30
ANSI_ESCAPE_RE = re.compile(r"\x1b(?:[@-_][0-?]*[ -/]*[@-~])")


def configure_logging() -> None:
    """Configura logs legíveis sem expor o conteúdo dos vídeos ou prompts."""

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        stream=sys.stdout,
    )


def parse_time(time_str: str) -> float:
    """Converte 'HH:MM:SS' para segundos (float)."""
    parts = time_str.split(":")
    if len(parts) == 3:
        h, m, s = parts
        return int(h) * 3600 + int(m) * 60 + float(s)
    elif len(parts) == 2:
        m, s = parts
        return int(m) * 60 + float(s)
    else:
        return float(time_str)


def _venv_bin_dir() -> Path:
    """Retorna a pasta de executáveis do venv para o sistema atual."""

    return REFRAME_VENV_DIR / ("Scripts" if os.name == "nt" else "bin")


def _compact_detail(text: str, limit: int = 500) -> str:
    """Reduz uma saída de subprocesso a uma linha útil para o log."""

    return " ".join(text.split())[-limit:]


def discover_dependencies() -> tuple[str, list[str], Path]:
    """Valida FFmpeg/Verthor e retorna o comando do Verthor e seu cwd.

    O pacote pode expor o wrapper ``verthor`` ou apenas o módulo Python. Nos
    dois casos o interpretador pertence ao ``reframe_venv``; nunca usamos um
    ``verthor`` global do PATH por acidente.
    """

    ffmpeg_bin = shutil.which("ffmpeg")
    if not ffmpeg_bin:
        raise RuntimeError("FFmpeg nao encontrado no PATH")

    python_bin = _venv_bin_dir() / ("python.exe" if os.name == "nt" else "python")
    if not python_bin.is_file():
        raise RuntimeError(f"Python do reframe_venv nao encontrado: {python_bin}")

    if not REFRAME_REPO_DIR.is_dir():
        raise RuntimeError(f"Repositorio do Verthor nao encontrado: {REFRAME_REPO_DIR}")
    if not REFRAME_MODEL_PATH.is_file():
        raise RuntimeError(f"Peso do modelo do Verthor nao encontrado: {REFRAME_MODEL_PATH}")

    probe = subprocess.run(
        [str(python_bin), "-c", "import verthor"],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=DEPENDENCY_PROBE_TIMEOUT_SECONDS,
        check=False,
    )
    if probe.returncode != 0:
        detail = _compact_detail(probe.stderr or probe.stdout or "sem detalhes")
        raise RuntimeError(
            f"Pacote 'verthor' indisponivel no reframe_venv: {detail}"
        )

    media_pipe_probe = subprocess.run(
        [
            str(python_bin),
            "-c",
            (
                "try:\n"
                " from mediapipe.python.solutions import face_detection, pose\n"
                " print('mediapipe_legacy=ok')\n"
                "except Exception:\n"
                " try:\n"
                "  from mediapipe import solutions\n"
                "  _ = solutions.face_detection\n"
                "  _ = solutions.pose\n"
                "  print('mediapipe_solutions=ok')\n"
                " except Exception as exc:\n"
                "  print(f'mediapipe_face_pose=unavailable:{type(exc).__name__}:{exc}')\n"
                "  raise SystemExit(1)\n"
            ),
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=DEPENDENCY_PROBE_TIMEOUT_SECONDS,
        check=False,
    )
    if media_pipe_probe.returncode != 0:
        detail = _compact_detail(
            media_pipe_probe.stderr or media_pipe_probe.stdout or "sem detalhes"
        )
        LOGGER.warning(
            "MediaPipe face/pose indisponivel; Verthor seguira com fallback "
            "por mascara: %s",
            detail,
        )

    cli_candidates = [
        _venv_bin_dir() / ("verthor.exe" if os.name == "nt" else "verthor"),
    ]
    verthor_cli = next((candidate for candidate in cli_candidates if candidate.is_file()), None)
    if verthor_cli:
        verthor_command = [str(verthor_cli)]
    else:
        # Fallback seguro para instalações que têm o pacote, mas não criaram o
        # wrapper de console. Continua usando exclusivamente o Python do venv.
        verthor_command = [str(python_bin), "-m", "verthor"]

    LOGGER.info(
        "Dependencias base OK: ffmpeg=%s; python=%s; verthor=%s; modelo=%s",
        ffmpeg_bin,
        python_bin,
        "wrapper" if verthor_cli else "python -m verthor",
        REFRAME_MODEL_PATH,
    )
    return ffmpeg_bin, verthor_command, REFRAME_REPO_DIR


def run_command(
    command: list[str],
    *,
    label: str,
    timeout_seconds: int,
    cwd: Path | None = None,
) -> subprocess.CompletedProcess[str]:
    """Executa um subprocesso com timeout, captura e logs úteis."""

    LOGGER.info("Iniciando %s", label)
    started_at = time.monotonic()
    try:
        result = subprocess.run(
            command,
            cwd=str(cwd) if cwd else None,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout_seconds,
            check=True,
        )
    except subprocess.TimeoutExpired as error:
        LOGGER.error("%s excedeu o timeout de %ss", label, timeout_seconds)
        raise RuntimeError(
            f"{label} excedeu o timeout de {timeout_seconds}s"
        ) from error
    except subprocess.CalledProcessError as error:
        detail = _compact_detail(error.stderr or error.stdout or "sem detalhes", 1000)
        LOGGER.error("%s falhou com codigo %s: %s", label, error.returncode, detail)
        raise
    except OSError as error:
        LOGGER.error("Nao foi possivel iniciar %s: %s", label, error)
        raise RuntimeError(f"Falha ao iniciar {label}: {error}") from error

    for raw_line in (result.stdout or "").splitlines():
        line = ANSI_ESCAPE_RE.sub("", raw_line).strip()
        if line:
            LOGGER.info("%s | %s", label, line)
    for raw_line in (result.stderr or "").splitlines():
        line = ANSI_ESCAPE_RE.sub("", raw_line).strip()
        if not line:
            continue
        if "| ERROR |" in line or "Traceback" in line:
            LOGGER.error("%s | %s", label, line)
        elif "| WARNING |" in line:
            LOGGER.warning("%s | %s", label, line)
        else:
            LOGGER.info("%s | %s", label, line)

    elapsed = time.monotonic() - started_at
    LOGGER.info("%s concluido em %.1fs", label, elapsed)
    return result


def run_verthor(
    verthor_command: list[str],
    verthor_cwd: Path,
    clip_output: Path,
    vertical_output: Path,
    cut_index: int,
    force: bool,
) -> None:
    """Gera o clipe 9:16 e só publica a saída após conclusão bem-sucedida."""

    if vertical_output.exists() and not force:
        LOGGER.info("Reframe ja existe; pulando: %s", vertical_output.name)
        return

    temporary_output = vertical_output.with_name(
        f".{vertical_output.stem}.reframe-{os.getpid()}-{cut_index}.tmp{vertical_output.suffix}"
    )
    temporary_output.unlink(missing_ok=True)

    command = [
        *verthor_command,
        str(clip_output),
        str(temporary_output),
        "--preset",
        "talking_head",
        "--output-width",
        "1080",
        "--output-height",
        "1920",
        "--saliency-model",
        "handcrafted",
        "--seg-model",
        str(REFRAME_MODEL_PATH),
    ]

    try:
        run_command(
            command,
            label=f"Verthor corte {cut_index} (9:16)",
            timeout_seconds=VERTHOR_TIMEOUT_SECONDS,
            cwd=verthor_cwd,
        )
        if not temporary_output.is_file() or temporary_output.stat().st_size == 0:
            raise RuntimeError("Verthor terminou sem gerar uma saida de video valida")
        temporary_output.replace(vertical_output)
        LOGGER.info("Clipe %s vertical salvo: %s", cut_index, vertical_output.name)
    finally:
        temporary_output.unlink(missing_ok=True)

def clean_json_string(text: str) -> str:
    """Remove marcações Markdown ```json ... ``` caso existam."""
    text = text.strip()
    if text.startswith("```"):
        # Remove a primeira linha (ex: ```json) e a última linha (```)
        lines = text.splitlines()
        if len(lines) > 2:
            return "\n".join(lines[1:-1])
    return text

def process_video_cuts(
    video_path: Path,
    json_path: Path,
    force: bool = False,
    *,
    ffmpeg_bin: str | None = None,
    verthor_command: list[str] | None = None,
    verthor_cwd: Path | None = None,
):
    """Lê o JSON, extrai os clipes e gera suas versões verticais 9:16."""
    # O Verthor roda com cwd no próprio repositório para localizar pesos e
    # dependências. Caminhos relativos encontrados pelo rglob deixariam de
    # apontar para o curso nesse contexto.
    video_path = video_path.expanduser().resolve()
    json_path = json_path.expanduser().resolve()

    try:
        content = json_path.read_text(encoding="utf-8")
        clean_content = clean_json_string(content)
        cuts = json.loads(clean_content)
    except Exception as e:
        LOGGER.error("Erro ao ler ou parsear %s: %s", json_path.name, e)
        return False

    if not isinstance(cuts, list):
        LOGGER.error("O arquivo %s nao contem uma lista JSON valida", json_path.name)
        return False

    if ffmpeg_bin is None or verthor_command is None or verthor_cwd is None:
        try:
            ffmpeg_bin, verthor_command, verthor_cwd = discover_dependencies()
        except (RuntimeError, subprocess.TimeoutExpired) as error:
            LOGGER.error("Dependencias indisponiveis para %s: %s", video_path.name, error)
            return False

    success = True
    edl_lines = [
        "TITLE: Cortes do Video",
        "FCM: NON-DROP FRAME",
        ""
    ]
    
    for i, cut in enumerate(cuts, start=1):
        if not isinstance(cut, dict):
            LOGGER.error("Corte %s de %s nao e um objeto JSON", i, json_path.name)
            success = False
            continue

        start_str = str(cut.get("start", "00:00:00"))
        end_str = str(cut.get("end", "00:00:00"))
        title = cut.get("titulo", f"Corte {i}")

        try:
            if parse_time(str(end_str)) <= parse_time(str(start_str)):
                raise ValueError("o fim deve ser maior que o inicio")
        except (TypeError, ValueError) as error:
            LOGGER.error(
                "Corte %s invalido em %s (%s -> %s): %s",
                i,
                json_path.name,
                start_str,
                end_str,
                error,
            )
            success = False
            continue
        
        # Format for EDL: HH:MM:SS:FF (Adding 00 frames)
        if len(start_str.split(":")) == 3:
            start_edl = f"{start_str}:00"
        else:
            start_edl = "00:00:00:00"
            
        if len(end_str.split(":")) == 3:
            end_edl = f"{end_str}:00"
        else:
            end_edl = "00:00:00:00"
            
        # CMX3600 format
        edl_lines.append(f"{i:03}  AX       V     C        {start_edl} {end_edl} {start_edl} {end_edl}")
        edl_lines.append(f"* FROM CLIP NAME: {video_path.name}")
        edl_lines.append(f"* {title}")
        edl_lines.append("")

        clip_output = video_path.with_name(f"{video_path.stem}_corte_{i}{video_path.suffix}")

        cmd = [
            ffmpeg_bin,
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(video_path),
            "-ss",
            str(start_str),
            "-to",
            str(end_str),
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            str(clip_output),
        ]

        try:
            if (
                clip_output.is_file()
                and clip_output.stat().st_size > 0
                and not force
            ):
                LOGGER.info("Clipe normal ja existe; pulando FFmpeg: %s", clip_output.name)
            else:
                if clip_output.exists() and not force:
                    LOGGER.warning(
                        "Clipe normal invalido; recriando: %s", clip_output.name
                    )
                run_command(
                    cmd,
                    label=f"FFmpeg corte {i}",
                    timeout_seconds=FFMPEG_TIMEOUT_SECONDS,
                )
                if not clip_output.is_file() or clip_output.stat().st_size == 0:
                    raise RuntimeError("FFmpeg terminou sem gerar uma saida de video valida")
                LOGGER.info("Clipe normal salvo: %s", clip_output.name)

            vertical_output = clip_output.with_name(
                f"{clip_output.stem}_vertical{clip_output.suffix}"
            )
            run_verthor(
                verthor_command,
                verthor_cwd,
                clip_output,
                vertical_output,
                i,
                force,
            )
        except (RuntimeError, subprocess.CalledProcessError, OSError) as error:
            LOGGER.error("Erro no corte %s de %s: %s", i, video_path.name, error)
            success = False

    # Salva o arquivo EDL universal
    edl_output = video_path.with_name(f"{video_path.stem}_cortes.edl")
    try:
        edl_output.write_text("\n".join(edl_lines), encoding="utf-8")
        LOGGER.info("Projeto salvo para DaVinci/Premiere: %s", edl_output.name)
    except OSError as error:
        LOGGER.error("Nao foi possivel salvar o EDL %s: %s", edl_output, error)
        success = False

    return success

def find_videos_with_json(course_dir: Path):
    """Encontra os arquivos de vídeo baseados na existência de cortes.json"""
    json_files = list(course_dir.rglob("*.cortes.json"))
    videos = []
    
    for j in json_files:
        video_stem = j.name[:-12] # remove ".cortes.json"
        
        # Procura o arquivo de video correspondente
        for ext in [".mp4", ".mkv", ".mov", ".avi"]:
            possible_video = j.with_name(f"{video_stem}{ext}")
            if possible_video.exists():
                videos.append((possible_video, j))
                break
    return videos

def main(argv: list[str] | None = None) -> int:
    configure_logging()
    parser = argparse.ArgumentParser(description="Extrai cortes de vídeo com base no cortes.json.")
    parser.add_argument("course_dir", type=Path, help="Pasta raiz do curso")
    parser.add_argument("--force", action="store_true", help="Gera novamente mesmo se existir.")
    args = parser.parse_args(argv)
    
    course_dir = args.course_dir.expanduser().resolve()
    if not course_dir.is_dir():
        LOGGER.error("Pasta nao encontrada: %s", course_dir)
        return 2

    try:
        ffmpeg_bin, verthor_command, verthor_cwd = discover_dependencies()
    except (RuntimeError, subprocess.TimeoutExpired) as error:
        LOGGER.error("Pipeline bloqueado por dependencia: %s", error)
        return 2

    pairs = find_videos_with_json(course_dir)
    if not pairs:
        LOGGER.info("Nenhum par de video/json encontrado em %s", course_dir)
        return 0

    LOGGER.info("Encontrados %s pares de video/json", len(pairs))
    
    has_errors = False
    for video_path, json_path in pairs:
        success = process_video_cuts(
            video_path,
            json_path,
            force=args.force,
            ffmpeg_bin=ffmpeg_bin,
            verthor_command=verthor_command,
            verthor_cwd=verthor_cwd,
        )
        if not success:
            has_errors = True
            
    return 1 if has_errors else 0

if __name__ == "__main__":
    sys.exit(main())
