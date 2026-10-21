#!/usr/bin/env python3
"""
Unit and Contract Tests for amostrar_paleta.py
Zero external test bloatware: uses Python standard library unittest.
"""

import os
import sys
import json
import unittest
import subprocess
from unittest.mock import patch, MagicMock
import numpy as np

# Add scripts/references to Python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ENGINE_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..'))
REFERENCES_DIR = os.path.join(ENGINE_ROOT, 'scripts', 'references')
if REFERENCES_DIR not in sys.path:
    sys.path.insert(0, REFERENCES_DIR)

import amostrar_paleta


class TestAmostrarPaleta(unittest.TestCase):
    """Test suite for chromatic extraction and K-Means palette analysis."""

    def test_rgb_to_hex_standard(self):
        """Verify rgb_to_hex standard color transformations."""
        self.assertEqual(amostrar_paleta.rgb_to_hex(0, 0, 0), "#000000")
        self.assertEqual(amostrar_paleta.rgb_to_hex(255, 255, 255), "#ffffff")
        self.assertEqual(amostrar_paleta.rgb_to_hex(255, 0, 0), "#ff0000")
        self.assertEqual(amostrar_paleta.rgb_to_hex(0, 255, 0), "#00ff00")
        self.assertEqual(amostrar_paleta.rgb_to_hex(0, 0, 255), "#0000ff")

    def test_rgb_to_hex_floats_and_boundaries(self):
        """Verify rgb_to_hex handles float arrays and boundary padding."""
        # 95, 220, 48 -> #5fdc30 (acid lime reference)
        hex_val = amostrar_paleta.rgb_to_hex(95.4, 220.1, 48.9)
        self.assertEqual(hex_val, "#5fdc30")
        # Ensure single digit hex values are padded with 0 (e.g. 10 -> '0a')
        self.assertEqual(amostrar_paleta.rgb_to_hex(10, 11, 12), "#0a0b0c")

    def test_sample_point_center(self):
        """Verify sampling at percentage coordinates on synthetic array."""
        h, w = 100, 100
        arr = np.zeros((h, w, 3), dtype=np.uint8)
        arr[45:55, 45:55] = [120, 200, 80]

        sample = amostrar_paleta.sample_point(arr, 0.50, 0.50, window=3)
        self.assertEqual(int(sample[0]), 120)
        self.assertEqual(int(sample[1]), 200)
        self.assertEqual(int(sample[2]), 80)

    def test_sample_point_corners_and_bounds(self):
        """Verify sampling at extreme bounds (0.0 and 1.0) does not throw index errors."""
        h, w = 80, 60
        arr = np.full((h, w, 3), 42, dtype=np.uint8)

        # Top-left corner
        tl = amostrar_paleta.sample_point(arr, 0.0, 0.0, window=5)
        self.assertEqual(int(tl[0]), 42)

        # Bottom-right corner
        br = amostrar_paleta.sample_point(arr, 1.0, 1.0, window=5)
        self.assertEqual(int(br[0]), 42)

    def test_sample_point_empty_patch(self):
        """Verify sampling on 0-sized dimension returns fallback [0, 0, 0]."""
        arr = np.zeros((0, 0, 3), dtype=np.uint8)
        sample = amostrar_paleta.sample_point(arr, 0.5, 0.5, window=5)
        self.assertTrue(np.array_equal(sample, [0, 0, 0]))

    def test_get_dominant_colors_monochromatic(self):
        """Verify monochromatic image returns 1 cluster with 1.0 weight."""
        arr = np.full((100, 100, 3), [20, 30, 40], dtype=np.uint8)
        dominants = amostrar_paleta.get_dominant_colors(arr, k=5)

        self.assertEqual(len(dominants), 1)
        centroid, weight = dominants[0]
        self.assertAlmostEqual(weight, 1.0, places=2)
        self.assertEqual(int(centroid[0]), 20)
        self.assertEqual(int(centroid[1]), 30)
        self.assertEqual(int(centroid[2]), 40)

    def test_get_dominant_colors_multi_clusters(self):
        """Verify multi-colored image returns up to k clusters summing to 1.0."""
        arr = np.zeros((100, 100, 3), dtype=np.uint8)
        # 4 quadrants of distinct colors
        arr[0:50, 0:50] = [255, 0, 0]      # Red
        arr[0:50, 50:100] = [0, 255, 0]    # Green
        arr[50:100, 0:50] = [0, 0, 255]    # Blue
        arr[50:100, 50:100] = [255, 255, 0] # Yellow

        dominants = amostrar_paleta.get_dominant_colors(arr, k=4)
        self.assertGreaterEqual(len(dominants), 2)
        total_weight = sum(pct for _, pct in dominants)
        self.assertAlmostEqual(total_weight, 1.0, places=2)

    def test_get_dominant_colors_deterministic_seed(self):
        """Verify K-Means produces deterministic output across runs with fixed seed."""
        arr = np.random.randint(0, 256, (120, 120, 3), dtype=np.uint8)
        run1 = amostrar_paleta.get_dominant_colors(arr, k=5)
        run2 = amostrar_paleta.get_dominant_colors(arr, k=5)

        self.assertEqual(len(run1), len(run2))
        for (c1, w1), (c2, w2) in zip(run1, run2):
            self.assertTrue(np.allclose(c1, c2, atol=1e-2))
            self.assertAlmostEqual(w1, w2, places=4)

    @patch('subprocess.run')
    def test_load_image_raw_enforces_vframes_1(self, mock_subproc):
        """Verify load_image_raw strictly passes -vframes 1 to FFmpeg."""
        w, h = 64, 64
        fake_ffprobe_json = json.dumps({'streams': [{'width': w, 'height': h}]})
        fake_raw_bytes = bytes([128] * (w * h * 3))

        mock_probe_result = MagicMock()
        mock_probe_result.stdout = fake_ffprobe_json
        mock_raw_result = MagicMock()
        mock_raw_result.stdout = fake_raw_bytes

        mock_subproc.side_effect = [mock_probe_result, mock_raw_result]

        arr, width, height = amostrar_paleta.load_image_raw('dummy_video.mp4')

        self.assertEqual(width, w)
        self.assertEqual(height, h)
        self.assertEqual(arr.shape, (h, w, 3))

        # Check second call was ffmpeg with -vframes 1
        ffmpeg_cmd = mock_subproc.call_args_list[1][0][0]
        self.assertIn('-vframes', ffmpeg_cmd)
        idx = ffmpeg_cmd.index('-vframes')
        self.assertEqual(ffmpeg_cmd[idx + 1], '1')
        self.assertIn('rgb24', ffmpeg_cmd)

    @patch('subprocess.run')
    def test_load_image_raw_insufficient_bytes_error(self, mock_subproc):
        """Verify load_image_raw raises ValueError if received buffer is truncated."""
        w, h = 100, 100
        fake_ffprobe_json = json.dumps({'streams': [{'width': w, 'height': h}]})
        # Provide less than w * h * 3 bytes
        fake_raw_bytes = bytes([0] * 50)

        mock_probe_result = MagicMock()
        mock_probe_result.stdout = fake_ffprobe_json
        mock_raw_result = MagicMock()
        mock_raw_result.stdout = fake_raw_bytes

        mock_subproc.side_effect = [mock_probe_result, mock_raw_result]

        with self.assertRaises(ValueError) as ctx:
            amostrar_paleta.load_image_raw('corrupted.mp4')
        self.assertIn("Bytes insuficientes", str(ctx.exception))

    @patch('subprocess.run')
    def test_load_image_raw_no_video_streams_error(self, mock_subproc):
        """Verify load_image_raw raises ValueError if media has no video streams."""
        fake_ffprobe_json = json.dumps({'streams': []})
        mock_probe_result = MagicMock()
        mock_probe_result.stdout = fake_ffprobe_json

        mock_subproc.return_value = mock_probe_result

        with self.assertRaises(ValueError) as ctx:
            amostrar_paleta.load_image_raw('audio_only.mp3')
        self.assertIn("Não foi possível obter streams", str(ctx.exception))

    def test_cli_help(self):
        """Verify script exits with code 0 on --help."""
        script_path = os.path.join(REFERENCES_DIR, 'amostrar_paleta.py')
        res = subprocess.run([sys.executable, script_path, '--help'], capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(res.returncode, 0)
        self.assertIn("Extrai paleta e amostras", res.stdout)


if __name__ == '__main__':
    unittest.main()
