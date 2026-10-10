import os
import sys
import subprocess
import shutil
from pathlib import Path

WHISPER_EXE = Path(r"C:\Program Files\Whisper_AI\main.exe")
MODEL_BIN = Path(r"C:\Program Files\Whisper_AI\ggml-small.bin")


def transcribe_video(video_file: Path) -> Path:
    """Transcreve um único vídeo e retorna o SRT. Levanta RuntimeError em falha.

    Usado pelo control plane (dashboard_promax) para rastrear cada vídeo.
    """
    video_file = Path(video_file)
    srt_file = video_file.with_suffix(".transcricao.srt")
    if srt_file.exists():
        return srt_file
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg não encontrado no PATH.")
    if not WHISPER_EXE.exists() or not MODEL_BIN.exists():
        raise RuntimeError(f"whisper.cpp ou modelo não encontrados em {WHISPER_EXE.parent}")

    wav_file = video_file.with_suffix(".temp.wav")
    try:
        # 1. Extrair Áudio via FFmpeg (16kHz WAV exigido pelo whisper.cpp)
        print("    [1/2] Extraindo áudio (16kHz WAV)...")
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(video_file), "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", str(wav_file)],
            stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, check=True, timeout=300
        )

        # 2. Rodar Whisper.cpp
        print("    [2/2] Transcrevendo com whisper.cpp...")
        subprocess.run(
            [str(WHISPER_EXE), "-m", str(MODEL_BIN), "-f", str(wav_file), "-osrt", "-l", "pt"],
            stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, check=True, timeout=3600
        )

        # O whisper.cpp gera "nome.temp.wav.srt". Precisamos renomear.
        generated_srt = wav_file.with_suffix(".wav.srt")
        if not generated_srt.exists():
            raise RuntimeError("SRT não foi gerado.")
        generated_srt.rename(srt_file)
        return srt_file
    except subprocess.TimeoutExpired:
        raise RuntimeError(f"Timeout ao processar {video_file.name}")
    except subprocess.CalledProcessError as e:
        err_msg = e.stderr.decode("utf-8", errors="replace") if e.stderr else str(e)
        raise RuntimeError(f"Erro de execução em {video_file.name}: {err_msg[:200]}")
    finally:
        # Limpeza do WAV temporário
        if wav_file.exists():
            wav_file.unlink()


def transcribe_folder(folder_path: str):
    if not shutil.which("ffmpeg"):
        print("[ERRO] ffmpeg não encontrado no PATH.")
        return False

    folder = Path(folder_path).resolve()
    if not folder.exists() or not folder.is_dir():
        print(f"[ERRO] Pasta não encontrada: {folder}")
        return False

    mp4_files = sorted(folder.rglob("*.mp4"))
    if not mp4_files:
        print(f"[AVISO] Nenhum arquivo .mp4 encontrado em: {folder}")
        return False

    if not WHISPER_EXE.exists() or not MODEL_BIN.exists():
        print("[ERRO] whisper.cpp ou modelo não encontrados em C:\\Program Files\\Whisper_AI")
        return False

    print("=" * 60)
    print(f"[*] INICIANDO TRANSCRIÇÃO C++ EM LOTE: {folder.name}")
    print(f"[*] Total de Vídeos: {len(mp4_files)}")
    print("=" * 60)

    has_errors = False

    for i, video_file in enumerate(mp4_files, 1):
        srt_file = video_file.with_suffix(".transcricao.srt")
        if srt_file.exists():
            print(f"[{i}/{len(mp4_files)}] Já transcrito: {video_file.name}")
            continue

        print(f"\n[{i}/{len(mp4_files)}] Transcrevendo: {video_file.name}...")
        try:
            transcribe_video(video_file)
            print(f"    [+] Transcrição concluída com sucesso.")
        except Exception as e:
            print(f"    [-] {e}")
            has_errors = True

    print("\n" + "=" * 60)
    print(f"[OK] Lote {folder.name} finalizado!")
    print("=" * 60)
    return not has_errors

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python transcribe_course_cpp.py <caminho_da_pasta>")
        sys.exit(1)

    target_folder = sys.argv[1]
    success = transcribe_folder(target_folder)
    sys.exit(0 if success else 1)
