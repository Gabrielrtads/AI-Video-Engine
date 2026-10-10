import subprocess
import re
import sys
from pathlib import Path

def get_duration(video_path):
    cmd = ["ffprobe", "-v", "error", "-show_entries",
           "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(video_path)]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace")
    if result.returncode != 0:
        print(f"[-] Erro ao obter duração: {result.stderr}")
        return 0.0
    try:
        return float(result.stdout.strip())
    except ValueError:
        return 0.0

def get_silences(video_path, noise_level="-35dB", min_duration="0.5"):
    print(f"[*] Escaneando silêncios em {video_path.name}...")
    cmd = [
        "ffmpeg", "-i", str(video_path),
        "-af", f"silencedetect=noise={noise_level}:d={min_duration}",
        "-f", "null", "-"
    ]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace")
    
    if result.returncode != 0 and not "silencedetect" in result.stderr:
        print(f"[-] Erro ao processar silêncios: {result.stderr}")
        return []
    
    silences = []
    start_time = None
    
    for line in result.stderr.splitlines():
        if "silence_start" in line:
            start_match = re.search(r"silence_start:\s+(-?[\d\.]+)", line)
            if start_match:
                start_time = float(start_match.group(1))
        elif "silence_end" in line and start_time is not None:
            end_match = re.search(r"silence_end:\s+([\d\.]+)", line)
            if end_match:
                end_time = float(end_match.group(1))
                silences.append((start_time, end_time))
                start_time = None
                
    return silences

def process_video(video_path):
    video = Path(video_path)
    output = video.with_name(f"{video.stem}_seco{video.suffix}")
    tmp_output = video.with_name(f"{video.stem}_seco.tmp{video.suffix}")
    
    if output.exists():
        print(f"[AVISO] O vídeo {output.name} já existe. Pulando.")
        return

    duration = get_duration(video)
    silences = get_silences(video)
    
    if not silences:
        print(f"[-] Nenhum silêncio significativo encontrado em {video.name}.")
        return True
        
    print(f"[+] {len(silences)} pausas mortas encontradas. Calculando cortes...")
    
    loud_parts = []
    current_time = 0.0
    
    for (s_start, s_end) in silences:
        if s_start > current_time:
            loud_parts.append((current_time, s_start))
        current_time = s_end
        
    if current_time < duration:
        loud_parts.append((current_time, duration))
        
    filter_complex = ""
    for i, (start, end) in enumerate(loud_parts):
        start = max(0.0, start) # Ensure no negative starts
        filter_complex += f"[0:v]trim=start={start}:end={end},setpts=PTS-STARTPTS[v{i}];"
        filter_complex += f"[0:a]atrim=start={start}:end={end},asetpts=PTS-STARTPTS[a{i}];"
        
    for i in range(len(loud_parts)):
        filter_complex += f"[v{i}][a{i}]"
        
    filter_complex += f"concat=n={len(loud_parts)}:v=1:a=1[vout][aout]"
    
    print(f"[*] Processando renderização rápida do novo arquivo: {output.name}...")
    
    # Save filter_complex to a temporary file to avoid Windows command length limits
    filter_script_path = video.with_name(f"{video.stem}_filter.txt")
    with open(filter_script_path, "w", encoding="utf-8") as f:
        f.write(filter_complex)
    
    cmd = [
        "ffmpeg", "-y", "-i", str(video),
        "-filter_complex_script", str(filter_script_path),
        "-map", "[vout]", "-map", "[aout]",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
        "-c:a", "aac", "-b:a", "128k",
        str(tmp_output)
    ]
    
    try:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        tmp_output.rename(output)
        print(f"[OK] Vídeo finalizado e salvo como: {output.name}\n")
        return True
    except subprocess.CalledProcessError:
        print(f"[-] Erro ao renderizar arquivo: {output.name}\n")
        return False
    finally:
        if filter_script_path.exists():
            filter_script_path.unlink()
        if tmp_output.exists():
            tmp_output.unlink()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python cut_silences.py <caminho_do_video_ou_pasta>")
        sys.exit(1)
        
    target = Path(sys.argv[1]).resolve()
    
    has_errors = False
    if target.is_dir():
        mp4_files = sorted(target.rglob("*.mp4"))
        mp4_files = [f for f in mp4_files if "_seco" not in f.name]
        for v in mp4_files:
            success = process_video(v)
            if success is False:
                has_errors = True
    else:
        success = process_video(target)
        if success is False:
            has_errors = True
            
    if has_errors:
        sys.exit(1)
