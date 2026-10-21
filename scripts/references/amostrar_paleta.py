#!/usr/bin/env python3
"""
amostrar_paleta.py - Extrator e Analisador Cromático Científico de Posts/Frames.
Lê qualquer frame ou imagem usando FFmpeg + NumPy nativo (sem dependência de PIL/OpenCV)
e extrai cores pontuais e dominantes para calibração pixel-perfect no Remotion.

Blindado contra:
- Dump acidental de vídeos longos em RAM (-vframes 1)
- Imagens monocromáticas ou com menos pixels que clusters K-Means
- Terminal Windows cp1252 (força UTF-8)
"""

import sys
import json
import subprocess
import argparse
import numpy as np

# Força UTF-8 no stdout para compatibilidade com o terminal Windows cp1252
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def load_image_raw(img_path):
    # 1. Obter largura e altura via ffprobe com timeout de segurança
    probe_cmd = [
        'ffprobe', '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height',
        '-of', 'json', img_path
    ]
    probe = subprocess.run(probe_cmd, capture_output=True, text=True, check=True, timeout=10)
    streams = json.loads(probe.stdout).get('streams', [])
    if not streams:
        raise ValueError(f"Não foi possível obter streams de vídeo da mídia: {img_path}")
    
    meta = streams[0]
    w, h = int(meta['width']), int(meta['height'])

    # 2. Despejar bytes raw rgb24 via ffmpeg limitando ESTRITAMENTE a 1 frame (-vframes 1)
    raw_cmd = [
        'ffmpeg', '-v', 'error',
        '-i', img_path,
        '-vframes', '1',
        '-f', 'rawvideo',
        '-pix_fmt', 'rgb24', '-'
    ]
    raw = subprocess.run(raw_cmd, capture_output=True, check=True, timeout=15)
    expected_bytes = w * h * 3
    if len(raw.stdout) < expected_bytes:
        raise ValueError(f"Bytes insuficientes recebidos do FFmpeg (esperado {expected_bytes}, recebido {len(raw.stdout)})")

    arr = np.frombuffer(raw.stdout[:expected_bytes], dtype=np.uint8).reshape((h, w, 3))
    return arr, w, h

def rgb_to_hex(r, g, b):
    return f"#{int(r):02x}{int(g):02x}{int(b):02x}"

def sample_point(arr, x_pct, y_pct, window=5):
    h, w, _ = arr.shape
    px = int(w * x_pct)
    py = int(h * y_pct)
    x1 = max(0, px - window)
    x2 = min(w, px + window + 1)
    y1 = max(0, py - window)
    y2 = min(h, py + window + 1)
    patch = arr[y1:y2, x1:x2]
    if patch.size == 0:
        return np.array([0, 0, 0], dtype=np.float32)
    median = np.median(patch.reshape(-1, 3), axis=0)
    return median

def get_dominant_colors(arr, k=5):
    # Subamostragem a cada 4 pixels para velocidade e teto de memória
    pixels = arr[::4, ::4].reshape(-1, 3).astype(np.float32)
    if len(pixels) == 0:
        return [([0, 0, 0], 1.0)]

    unique_pixels = np.unique(pixels, axis=0)
    actual_k = min(k, len(unique_pixels))
    if actual_k <= 1:
        mean_color = pixels.mean(axis=0)
        return [(mean_color, 1.0)]

    # K-means determinístico em NumPy
    np.random.seed(42)
    initial_indices = np.random.choice(unique_pixels.shape[0], actual_k, replace=False)
    centroids = unique_pixels[initial_indices].copy()

    labels = np.zeros(len(pixels), dtype=int)
    for _ in range(12):
        dists = np.linalg.norm(pixels[:, None, :] - centroids[None, :, :], axis=2)
        labels = np.argmin(dists, axis=1)
        for i in range(actual_k):
            mask = labels == i
            if np.any(mask):
                centroids[i] = pixels[mask].mean(axis=0)

    # Ordenar por frequência e remover clusters vazios
    counts = np.bincount(labels, minlength=actual_k)
    order = np.argsort(-counts)
    total_pixels = len(pixels)

    results = []
    for i in order:
        if counts[i] > 0:
            results.append((centroids[i], counts[i] / total_pixels))
    return results

def main():
    parser = argparse.ArgumentParser(description="Extrai paleta e amostras de cores de um post/frame")
    parser.add_argument("image", help="Caminho da imagem/frame de referência")
    parser.add_argument("--json", action="store_true", help="Saída em formato JSON estruturado")
    args = parser.parse_args()

    arr, w, h = load_image_raw(args.image)

    # Amostragem de zonas padrão em carrosséis editoriais 4:5
    # (Header, Tag Categoria, Palco Inferior, Texto Repetido, Badge)
    bg_card = sample_point(arr, 0.20, 0.70)
    repeat_text = sample_point(arr, 0.50, 0.60)
    badge_inact = sample_point(arr, 0.25, 0.53)
    header_bg = sample_point(arr, 0.10, 0.05)
    category_tag = sample_point(arr, 0.25, 0.18)

    dominants = get_dominant_colors(arr, k=6)

    res = {
        "dimensions": {"width": w, "height": h, "aspect_ratio": f"{w}:{h}"},
        "editorial_zones": {
            "card_background": {
                "rgb": [int(x) for x in bg_card],
                "hex": rgb_to_hex(*bg_card)
            },
            "repeat_marquee_text": {
                "rgb": [int(x) for x in repeat_text],
                "hex": rgb_to_hex(*repeat_text)
            },
            "inactive_badge": {
                "rgb": [int(x) for x in badge_inact],
                "hex": rgb_to_hex(*badge_inact)
            },
            "category_tag": {
                "rgb": [int(x) for x in category_tag],
                "hex": rgb_to_hex(*category_tag)
            },
            "canvas_background": {
                "rgb": [int(x) for x in header_bg],
                "hex": rgb_to_hex(*header_bg)
            }
        },
        "dominant_palette": [
            {
                "hex": rgb_to_hex(*c),
                "rgb": [int(x) for x in c],
                "weight_pct": round(pct * 100, 1)
            }
            for c, pct in dominants
        ]
    }

    if args.json:
        print(json.dumps(res, indent=2))
    else:
        print(f"📊 [Análise Cromática: {args.image}] ({w}x{h})")
        print("─" * 55)
        print("🎯 Zonas Editoriais Amostradas:")
        for k, v in res["editorial_zones"].items():
            print(f"  • {k:<22} : {v['hex']} (RGB {v['rgb']})")
        print("\n🎨 Cores Dominantes (K-Means):")
        for d in res["dominant_palette"]:
            print(f"  • {d['hex']} ({d['weight_pct']}% da imagem)")

if __name__ == "__main__":
    main()
