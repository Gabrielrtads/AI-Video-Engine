/**
 * Corte de silêncio: tira as pausas longas de uma gravação (a "enrolação" entre frases) mantendo uma
 * folga em volta da fala. Funções puras testadas com números; a integração roda ffmpeg num clipe
 * sintético (tom, 2 s de silêncio, tom) e mede a duração e os silêncios que sobram.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { computeKeepSegments, parseSilenceDetect, remapTimestamp, cutSilence } from '../../scripts/cortar_silencio.mjs';

test('parseSilenceDetect lê início e fim dos silêncios do ffmpeg', () => {
  const stderr = [
    '[silencedetect @ 0x1] silence_start: 2.0015',
    '[silencedetect @ 0x1] silence_end: 4.0020 | silence_duration: 2.0005',
    '[silencedetect @ 0x1] silence_start: 7.5',
  ].join('\n');
  assert.deepEqual(parseSilenceDetect(stderr, 9), [
    { start: 2.0015, end: 4.002 },
    { start: 7.5, end: 9 }, // silêncio que vai até o fim do arquivo
  ]);
});

test('computeKeepSegments: sem silêncio, mantém tudo', () => {
  assert.deepEqual(computeKeepSegments([], 5), [{ start: 0, end: 5 }]);
});

test('computeKeepSegments: tira o miolo do silêncio e deixa folga nas bordas', () => {
  const r = computeKeepSegments([{ start: 1, end: 3 }], 5, { padding: 0.1 });
  assert.deepEqual(r, [{ start: 0, end: 1.1 }, { start: 2.9, end: 5 }]);
});

test('computeKeepSegments: silêncio curto demais (menor que 2x a folga) é mantido', () => {
  const r = computeKeepSegments([{ start: 1, end: 1.15 }], 5, { padding: 0.1 });
  assert.deepEqual(r, [{ start: 0, end: 5 }]);
});

test('computeKeepSegments: silêncio no início e no fim', () => {
  const r = computeKeepSegments([{ start: 0, end: 1 }, { start: 4, end: 5 }], 5, { padding: 0.1 });
  assert.deepEqual(r, [{ start: 0.9, end: 4.1 }]);
});

test('computeKeepSegments: tudo silêncio devolve lista vazia', () => {
  assert.deepEqual(computeKeepSegments([{ start: 0, end: 5 }], 5), []);
});

test('remapTimestamp leva o tempo original para o tempo do vídeo cortado', () => {
  const keep = [{ start: 0, end: 1.1 }, { start: 2.9, end: 5 }];
  assert.equal(remapTimestamp(0.5, keep), 0.5);
  assert.ok(Math.abs(remapTimestamp(3.0, keep) - 1.2) < 1e-9); // 1.1 + (3.0 - 2.9)
  assert.equal(remapTimestamp(2.0, keep), null); // caiu num trecho cortado
});

function silencios(arquivo) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', arquivo, '-af', 'silencedetect=noise=-35dB:d=0.5', '-f', 'null', '-'], { encoding: 'utf8' });
  return [...r.stderr.matchAll(/silence_duration: ([\d.]+)/g)].map((m) => parseFloat(m[1]));
}
function duracao(arquivo) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', arquivo], { encoding: 'utf8' });
  return parseFloat(r.stdout);
}

test('integração: tom + 2 s de silêncio + tom perde ~2 s e não deixa pausa longa', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-silencio-'));
  try {
    const entrada = path.join(dir, 'in.mp4');
    const saida = path.join(dir, 'out.mp4');
    const gerar = spawnSync(
      'ffmpeg',
      ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=black:s=320x240:d=6:r=10', '-f', 'lavfi', '-i', "aevalsrc='if(between(t,2,4),0,0.4*sin(2*PI*440*t))':d=6:s=48000", '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', entrada],
      { encoding: 'utf8' },
    );
    assert.equal(gerar.status, 0, gerar.stderr);
    assert.ok(silencios(entrada).some((d) => d > 1.5), 'o clipe de teste precisa ter o silêncio de 2 s');

    const rel = cutSilence(entrada, saida, { padding: 0.15, silent: true });
    assert.ok(rel.removidoSegundos > 1.4 && rel.removidoSegundos < 2.1, `removeu ${rel.removidoSegundos}s`);
    const dur = duracao(saida);
    assert.ok(dur > 3.6 && dur < 4.8, `duração final ${dur}s`);
    assert.deepEqual(silencios(saida).filter((d) => d > 0.5), [], 'sobrou pausa longa');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
