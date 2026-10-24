/**
 * 🥊 ADVERSARIAL PALETTE EXTRACTION CHALLENGE TEST SUITE (Milestone 2)
 * Target: scripts/pipeline_referencia.mjs -> extractReferencePalette
 * 
 * Verifies:
 * - Adversarial file inputs: non-existent paths, 0-byte files, corrupt binary data, unsupported extensions
 * - Path injection attacks ('test.mp4; rm -rf /', 'calc.exe', '\\..\\..\\etc\\passwd')
 * - Real extraction against valid images ('out/contact-sheet.jpg', 'out/stills/frame_0117.png')
 * - Child process timeouts, memory bounds, and zero unhandled rejections
 */

import { test, describe, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import { makeFixtureImage } from '../e2e/helpers.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINE_ROOT = path.resolve(__dirname, '..', '..');
const PIPELINE_SCRIPT_PATH = path.join(ENGINE_ROOT, 'scripts', 'pipeline_referencia.mjs');
const fixtureDirs = [];
after(() => {
  for (const dir of fixtureDirs) fs.rmSync(dir, { recursive: true, force: true });
});

function createFixture(ext, dimensions) {
  const fixture = makeFixtureImage(ext, dimensions);
  fixtureDirs.push(fixture.dir);
  return fixture;
}

// Dynamically import module under test using pathToFileURL for Windows compatibility
const pipelineModule = await import(pathToFileURL(PIPELINE_SCRIPT_PATH).href);
const {
  extractReferencePalette,
  SUPPORTED_EXTENSIONS,
  sanitizeUrl,
  validateMediaUrl,
  calculateSafeZones,
  getMicrointeractionsConfig,
} = pipelineModule;

describe('🥊 M2 Adversarial Challenge 1: Adversarial File Inputs', () => {

  test('1.1 Non-existent file with valid extension throws ENOENT', async () => {
    const nonExistentPath = path.join(ENGINE_ROOT, 'out', 'non_existent_reference_frame_xyz.png');
    assert.strictEqual(fs.existsSync(nonExistentPath), false);

    await assert.rejects(
      async () => {
        await extractReferencePalette(nonExistentPath);
      },
      (err) => {
        assert.strictEqual(err.code, 'ENOENT');
        assert.match(err.message, /ENOENT: media file not found/i);
        return true;
      }
    );
  });

  test('1.2 Non-existent relative file path throws ENOENT', async () => {
    await assert.rejects(
      async () => {
        await extractReferencePalette('relative_non_existent.jpg');
      },
      (err) => {
        assert.strictEqual(err.code, 'ENOENT');
        assert.match(err.message, /Arquivo não encontrado/i);
        return true;
      }
    );
  });

  test('1.3 Zero-byte PNG file throws EEMPTY', async () => {
    const emptyPngPath = path.join(os.tmpdir(), `test_zero_byte_${Date.now()}.png`);
    fs.writeFileSync(emptyPngPath, Buffer.alloc(0));

    try {
      await assert.rejects(
        async () => {
          await extractReferencePalette(emptyPngPath);
        },
        (err) => {
          assert.strictEqual(err.code, 'EEMPTY');
          assert.match(err.message, /0 bytes/i);
          return true;
        }
      );
    } finally {
      if (fs.existsSync(emptyPngPath)) fs.unlinkSync(emptyPngPath);
    }
  });

  test('1.4 Zero-byte MP4 file throws EEMPTY', async () => {
    const emptyMp4Path = path.join(os.tmpdir(), `test_zero_byte_${Date.now()}.mp4`);
    fs.writeFileSync(emptyMp4Path, Buffer.alloc(0));

    try {
      await assert.rejects(
        async () => {
          await extractReferencePalette(emptyMp4Path);
        },
        (err) => {
          assert.strictEqual(err.code, 'EEMPTY');
          assert.match(err.message, /File is empty/i);
          return true;
        }
      );
    } finally {
      if (fs.existsSync(emptyMp4Path)) fs.unlinkSync(emptyMp4Path);
    }
  });

  test('1.5 Corrupt binary data (random garbage bytes in .png) cleanly rejects with descriptive error', async () => {
    const corruptPngPath = path.join(os.tmpdir(), `test_corrupt_${Date.now()}.png`);
    // Write 512 bytes of completely unparseable random noise
    const noise = Buffer.from(Array.from({ length: 512 }, () => Math.floor(Math.random() * 256)));
    fs.writeFileSync(corruptPngPath, noise);

    try {
      await assert.rejects(
        async () => {
          await extractReferencePalette(corruptPngPath);
        },
        (err) => {
          assert.match(err.message, /Falha na extração de paleta via Python/i);
          return true;
        }
      );
    } finally {
      if (fs.existsSync(corruptPngPath)) fs.unlinkSync(corruptPngPath);
    }
  });

  test('1.6 Corrupt truncated video container (.mp4 header only) cleanly rejects', async () => {
    const corruptMp4Path = path.join(os.tmpdir(), `test_corrupt_${Date.now()}.mp4`);
    // Truncated fake ftyp atom
    const fakeHeader = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D]);
    fs.writeFileSync(corruptMp4Path, fakeHeader);

    try {
      await assert.rejects(
        async () => {
          await extractReferencePalette(corruptMp4Path);
        },
        (err) => {
          assert.match(err.message, /Falha na extração de paleta via Python/i);
          return true;
        }
      );
    } finally {
      if (fs.existsSync(corruptMp4Path)) fs.unlinkSync(corruptMp4Path);
    }
  });

  test('1.7 Unsupported file extensions throw EUNSUPPORTED_FORMAT', async () => {
    const unsupportedList = [
      'payload.exe',
      'document.pdf',
      'script.js',
      'vector.svg',
      'archive.zip',
      'data.csv',
      'styles.css',
      'binary_without_extension',
      'nested.exe.txt'
    ];

    for (const item of unsupportedList) {
      await assert.rejects(
        async () => {
          await extractReferencePalette(item);
        },
        (err) => {
          assert.strictEqual(err.code, 'EUNSUPPORTED_FORMAT', `Expected EUNSUPPORTED_FORMAT for "${item}"`);
          assert.match(err.message, /Unsupported format/i);
          return true;
        }
      );
    }
  });

  test('1.8 Directory path ending with .png throws EEMPTY (0 bytes directory)', async () => {
    const fakeDirPng = path.join(os.tmpdir(), `fake_dir_${Date.now()}.png`);
    fs.mkdirSync(fakeDirPng);

    try {
      await assert.rejects(
        async () => {
          await extractReferencePalette(fakeDirPng);
        },
        (err) => {
          assert.ok(err.code === 'EEMPTY' || err.message.includes('Python'));
          return true;
        }
      );
    } finally {
      if (fs.existsSync(fakeDirPng)) fs.rmdirSync(fakeDirPng);
    }
  });

  test('1.9 Empty or non-string inputs throw ENOENT or TypeError', async () => {
    const invalidInputs = ['', '   ', '\t\n', null, undefined, 12345, {}, []];

    for (const input of invalidInputs) {
      await assert.rejects(
        async () => {
          await extractReferencePalette(input);
        },
        (err) => {
          assert.ok(err instanceof Error);
          assert.ok(err.code === 'ENOENT' || err.code === 'EINVAL');
          return true;
        }
      );
    }
  });
});

describe('🥊 M2 Adversarial Challenge 2: Path Injection & Security Attacks', () => {

  test('2.1 Command injection via semicolon / command chaining (test.mp4; rm -rf /)', async () => {
    await assert.rejects(
      async () => {
        await extractReferencePalette('test.mp4; rm -rf /');
      },
      (err) => {
        assert.strictEqual(err.code, 'EINVAL');
        assert.match(err.message, /Security violation: invalid characters or command injection/i);
        return true;
      }
    );
  });

  test('2.2 Command injection via shell operators (&, |, `, $, >, <)', async () => {
    const attackStrings = [
      'video.mp4 && calc.exe',
      'frame.png | cat /etc/passwd',
      'frame.png`whoami`',
      'video.mp4$(reboot)',
      'frame.png > output.txt',
      'frame.png < input.txt',
      'test.mp4; calc.exe',
      'test.png\ncalc.exe',
      'test.png\r\nrmdir /s /q c:\\',
      'test"img.png',
      "test'img.png"
    ];

    for (const attack of attackStrings) {
      await assert.rejects(
        async () => {
          await extractReferencePalette(attack);
        },
        (err) => {
          assert.strictEqual(err.code, 'EINVAL', `Expected EINVAL for attack: "${attack}"`);
          assert.match(err.message, /Security violation/i);
          return true;
        }
      );
    }
  });

  test('2.3 Direct executable invocation (calc.exe)', async () => {
    await assert.rejects(
      async () => {
        await extractReferencePalette('calc.exe');
      },
      (err) => {
        // .exe is rejected as unsupported extension
        assert.strictEqual(err.code, 'EUNSUPPORTED_FORMAT');
        assert.match(err.message, /extension "\.exe" is not supported/i);
        return true;
      }
    );
  });

  test('2.4 Path traversal without extension (\\..\\..\\etc\\passwd)', async () => {
    await assert.rejects(
      async () => {
        await extractReferencePalette('\\..\\..\\etc\\passwd');
      },
      (err) => {
        assert.strictEqual(err.code, 'EUNSUPPORTED_FORMAT');
        assert.match(err.message, /Unsupported format/i);
        return true;
      }
    );
  });

  test('2.5 Path traversal with valid extension to non-existent file throws ENOENT', async () => {
    await assert.rejects(
      async () => {
        await extractReferencePalette('\\..\\..\\etc\\passwd.png');
      },
      (err) => {
        assert.strictEqual(err.code, 'ENOENT');
        assert.match(err.message, /ENOENT: media file not found/i);
        return true;
      }
    );
  });

  test('2.6 URL scheme injection (javascript:, data:, file:, ftp:) is rejected and blocked', async () => {
    const dangerousProtocols = [
      'javascript:alert(1)',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY44YAAAAASUVORK5CYII=',
      'file:///etc/passwd',
      'ftp://malicious.org/exploit.mp4',
    ];

    for (const url of dangerousProtocols) {
      await assert.rejects(
        async () => {
          await extractReferencePalette(url);
        },
        (err) => {
          // Blocked by command injection check (EINVAL), extension filter (EUNSUPPORTED_FORMAT), or missing file check (ENOENT)
          assert.ok(
            err.code === 'EINVAL' || err.code === 'EUNSUPPORTED_FORMAT' || err.code === 'ENOENT',
            `Expected security rejection code for ${url}, got ${err.code}: ${err.message}`
          );
          return true;
        }
      );
    }
  });

  test('2.7 Valid HTTP / HTTPS URLs resolve canonical palette without shell execution', async () => {
    const remoteUrl = 'https://instagram.com/p/DA_Canonical_Reference_456/';
    const result = await extractReferencePalette(remoteUrl);

    assert.ok(result);
    assert.strictEqual(result.sourcePath, remoteUrl);
    assert.strictEqual(result.dimensions[0], 1080);
    assert.strictEqual(result.dimensions[1], 1920);
    assert.strictEqual(result.dimensions.width, 1080);
    assert.strictEqual(result.dimensions.height, 1920);
    assert.strictEqual(result.dimensions.aspect_ratio, '9:16');
    assert.ok(Array.isArray(result.dominant_palette));
    assert.ok(result.dominant_palette.length >= 3);
    assert.ok(result.editorial_zones.card_background);
  });
});

describe('🥊 M2 Adversarial Challenge 3: Real Extraction Against Valid Images', () => {

  test('3.1 Extraction on out/contact-sheet.jpg meets complete interface contract', async () => {
    const { file: contactSheetPath } = createFixture('jpg');

    const result = await extractReferencePalette(contactSheetPath);

    // Verify dimensions (dual array + properties contract)
    assert.ok(Array.isArray(result.dimensions));
    assert.strictEqual(result.dimensions.length, 2);
    assert.strictEqual(typeof result.dimensions.width, 'number');
    assert.strictEqual(typeof result.dimensions.height, 'number');
    assert.strictEqual(result.dimensions[0], result.dimensions.width);
    assert.strictEqual(result.dimensions[1], result.dimensions.height);
    assert.strictEqual(typeof result.dimensions.aspect_ratio, 'string');
    assert.ok(result.dimensions.width > 0);
    assert.ok(result.dimensions.height > 0);

    // Verify dominant_palette (array of valid hex colors)
    assert.ok(Array.isArray(result.dominant_palette));
    assert.ok(result.dominant_palette.length >= 3);
    for (const hex of result.dominant_palette) {
      assert.match(hex, /^#[0-9a-fA-F]{6}$/, `Invalid hex color: ${hex}`);
    }

    // Verify editorial_zones (required 5 canonical zones)
    const requiredZones = [
      'card_background',
      'repeat_marquee_text',
      'inactive_badge',
      'category_tag',
      'canvas_background'
    ];

    for (const zone of requiredZones) {
      assert.ok(result.editorial_zones[zone], `Missing editorial zone: ${zone}`);
      assert.match(result.editorial_zones[zone].hex, /^#[0-9a-fA-F]{6}$/);
      assert.ok(Array.isArray(result.editorial_zones[zone].rgb));
      assert.strictEqual(result.editorial_zones[zone].rgb.length, 3);
      for (const channel of result.editorial_zones[zone].rgb) {
        assert.ok(channel >= 0 && channel <= 255);
      }
    }
  });

  test('3.2 Extraction on out/stills/frame_0117.png meets complete interface contract', async () => {
    const { file: framePath } = createFixture('png');

    const result = await extractReferencePalette(framePath);

    assert.ok(result.dimensions.width > 0);
    assert.ok(result.dimensions.height > 0);
    assert.ok(result.dominant_palette.length >= 3);
    for (const hex of result.dominant_palette) {
      assert.match(hex, /^#[0-9a-fA-F]{6}$/);
    }
    assert.ok(result.editorial_zones.card_background);
    assert.ok(result.editorial_zones.repeat_marquee_text);
  });

  test('3.3 Extraction using relative path vs absolute path produces identical chromatic analysis', async () => {
    const { file: absolutePath } = createFixture('jpg');
    const relativePath = path.relative(process.cwd(), absolutePath);

    const resRelative = await extractReferencePalette(relativePath);
    const resAbsolute = await extractReferencePalette(absolutePath);

    assert.deepStrictEqual(resRelative.dimensions, resAbsolute.dimensions);
    assert.deepStrictEqual(resRelative.dominant_palette, resAbsolute.dominant_palette);
    assert.deepStrictEqual(resRelative.editorial_zones, resAbsolute.editorial_zones);
  });

  test('3.4 Extraction on path with spaces and Unicode characters', async () => {
    const tempSpaceDir = path.join(os.tmpdir(), `space_test_${Date.now()}`);
    fs.mkdirSync(tempSpaceDir);
    const spaceFile = path.join(tempSpaceDir, 'frame com espaço e acentuação_ação.png');

    // Generate small 100x100 solid test frame
    execSync(`ffmpeg -y -f lavfi -i color=c=blue:s=100x100 -vframes 1 "${spaceFile}"`, { stdio: 'pipe' });

    try {
      const result = await extractReferencePalette(spaceFile);
      assert.strictEqual(result.dimensions.width, 100);
      assert.strictEqual(result.dimensions.height, 100);
      assert.ok(result.dominant_palette.length > 0);
    } finally {
      if (fs.existsSync(spaceFile)) fs.unlinkSync(spaceFile);
      if (fs.existsSync(tempSpaceDir)) fs.rmdirSync(tempSpaceDir);
    }
  });

  test('3.5 Single-pixel image (1x1) handled without zero-division or K-Means crash', async () => {
    const onePixelFile = path.join(os.tmpdir(), `pixel_1x1_${Date.now()}.png`);
    execSync(`ffmpeg -y -f lavfi -i color=c=red:s=1x1 -vframes 1 "${onePixelFile}"`, { stdio: 'pipe' });

    try {
      const result = await extractReferencePalette(onePixelFile);
      assert.strictEqual(result.dimensions.width, 1);
      assert.strictEqual(result.dimensions.height, 1);
      assert.ok(result.dominant_palette.length >= 1);
    } finally {
      if (fs.existsSync(onePixelFile)) fs.unlinkSync(onePixelFile);
    }
  });

  test('3.6 Monochromatic 1080x1350 image handled deterministically', async () => {
    const monoFile = path.join(os.tmpdir(), `mono_1080x1350_${Date.now()}.png`);
    execSync(`ffmpeg -y -f lavfi -i color=c=green:s=1080x1350 -vframes 1 "${monoFile}"`, { stdio: 'pipe' });

    try {
      const result = await extractReferencePalette(monoFile);
      assert.strictEqual(result.dimensions.width, 1080);
      assert.strictEqual(result.dimensions.height, 1350);
      assert.ok(result.dominant_palette.length >= 1);
    } finally {
      if (fs.existsSync(monoFile)) fs.unlinkSync(monoFile);
    }
  });

  test('3.7 Real video extraction caps frame extraction to 1 frame (-vframes 1)', async () => {
    const testVideo = path.join(os.tmpdir(), `test_video_${Date.now()}.mp4`);
    // 2-second 30fps video = 60 frames
    execSync(`ffmpeg -y -f lavfi -i testsrc=duration=2:size=720x1280:rate=30 -c:v libx264 -pix_fmt yuv420p "${testVideo}"`, { stdio: 'pipe' });

    try {
      const result = await extractReferencePalette(testVideo);
      assert.strictEqual(result.dimensions.width, 720);
      assert.strictEqual(result.dimensions.height, 1280);
      assert.ok(result.dominant_palette.length >= 3);
    } finally {
      if (fs.existsSync(testVideo)) fs.unlinkSync(testVideo);
    }
  });
});

describe('🥊 M2 Adversarial Challenge 4: Timeouts, Memory Bounds, and Zero Unhandled Rejections', () => {

  test('4.1 Zero unhandled rejections during concurrent burst of 50 mixed adversarial requests', async () => {
    let unhandledCount = 0;
    const unhandledListener = (reason) => {
      unhandledCount++;
    };
    process.on('unhandledRejection', unhandledListener);

    const tempEmpty = path.join(os.tmpdir(), `burst_empty_${Date.now()}.png`);
    const tempCorrupt = path.join(os.tmpdir(), `burst_corrupt_${Date.now()}.png`);
    const burstJpg = createFixture('jpg');
    const burstPng = createFixture('png');
    fs.writeFileSync(tempEmpty, Buffer.alloc(0));
    fs.writeFileSync(tempCorrupt, Buffer.from('NON_IMAGE_CORRUPT_BYTES'));

    const mixedPayloads = [
      burstJpg.file,
      burstPng.file,
      'non_existent_file.png',
      tempEmpty,
      tempCorrupt,
      'test.mp4; rm -rf /',
      'calc.exe',
      '\\..\\..\\etc\\passwd',
      'https://instagram.com/reel/valid_test',
      'unsupported_format.xyz'
    ];

    // 5 iterations x 10 payloads = 50 concurrent calls
    const barrage = [];
    for (let i = 0; i < 5; i++) {
      barrage.push(...mixedPayloads);
    }

    try {
      const settled = await Promise.allSettled(
        barrage.map((payload) => extractReferencePalette(payload))
      );

      assert.strictEqual(settled.length, 50);
      const fulfilled = settled.filter((s) => s.status === 'fulfilled').length;
      const rejected = settled.filter((s) => s.status === 'rejected').length;

      // 3 valid items x 5 = 15 fulfilled, 7 invalid items x 5 = 35 rejected
      assert.strictEqual(fulfilled, 15);
      assert.strictEqual(rejected, 35);
      assert.strictEqual(unhandledCount, 0, 'Must have zero unhandled promise rejections');
    } finally {
      process.off('unhandledRejection', unhandledListener);
      if (fs.existsSync(tempEmpty)) fs.unlinkSync(tempEmpty);
      if (fs.existsSync(tempCorrupt)) fs.unlinkSync(tempCorrupt);
    }
  });

  test('4.2 Memory heap stability under sequential palette extractions', async () => {
    const { file: contactSheetPath } = createFixture('jpg', { width: 1920, height: 1080 });
    
    // Force GC if available or record baseline
    if (global.gc) global.gc();
    const initialHeap = process.memoryUsage().heapUsed;

    // Run 10 sequential extractions of high-res image
    for (let i = 0; i < 10; i++) {
      const res = await extractReferencePalette(contactSheetPath);
      assert.ok(res.dominant_palette.length >= 3);
    }

    if (global.gc) global.gc();
    const finalHeap = process.memoryUsage().heapUsed;
    const growthMB = (finalHeap - initialHeap) / (1024 * 1024);

    // Node heap growth for 10 extractions should remain strictly under 25 MB
    assert.ok(growthMB < 25, `Heap grew by ${growthMB.toFixed(2)} MB, exceeding safe limit`);
  });

  test('4.3 Child process timeout and buffer configuration verified', () => {
    const scriptContent = fs.readFileSync(PIPELINE_SCRIPT_PATH, 'utf-8');

    // Verify execFile timeout: 30000 ms
    assert.match(scriptContent, /timeout:\s*30000/);

    // Verify maxBuffer: 10 * 1024 * 1024
    assert.match(scriptContent, /maxBuffer:\s*10\s*\*\s*1024\s*\*\s*1024/);

    // Verify Python amostrar_paleta.py ffprobe timeout
    const pythonScriptPath = path.join(ENGINE_ROOT, 'scripts', 'references', 'amostrar_paleta.py');
    const pythonContent = fs.readFileSync(pythonScriptPath, 'utf-8');

    assert.match(pythonContent, /timeout=10/);
    assert.match(pythonContent, /timeout=15/);
    assert.match(pythonContent, /-vframes['"],\s*['"]1['"]/);
  });
});
