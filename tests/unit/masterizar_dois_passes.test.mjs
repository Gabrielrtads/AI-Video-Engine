/**
 * Masterização em dois passes de verdade: o passe 1 mede, o passe 2 aplica com os valores
 * medidos (linear). O teste de integração roda ffmpeg num clipe sintético e mede o resultado:
 * o passe único antigo deixava o arquivo final com pico de -0,9 dBFS (acima do -1 prometido) e, em
 * clipes de dinâmica alta, errava o alvo em ~1 LU e passava de 0 dBFS.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { masterizeAudio, parseLoudnormJson, buildSecondPassFilter } from '../../scripts/masterizar_audio.mjs';

const MEDIDAS = {
  input_i: '-34.60',
  input_tp: '-16.50',
  input_lra: '5.20',
  input_thresh: '-45.10',
  target_offset: '0.30',
};

test('parseLoudnormJson extrai o bloco JSON do stderr do ffmpeg', () => {
  const stderr = `[Parsed_loudnorm_0 @ 0000] \n${JSON.stringify(MEDIDAS, null, 2)}\n`;
  assert.deepEqual(parseLoudnormJson(stderr), MEDIDAS);
});

test('parseLoudnormJson recusa saída sem medição', () => {
  assert.throws(() => parseLoudnormJson('ffmpeg falhou'), /medi[cç]ão/i);
});

test('buildSecondPassFilter usa os valores medidos e linear=true', () => {
  const filtro = buildSecondPassFilter(MEDIDAS, { targetLufs: -14, loudnessRange: 7, truePeak: -1 });
  assert.equal(
    filtro,
    'loudnorm=I=-14:LRA=7:tp=-1:measured_I=-34.60:measured_LRA=5.20:measured_TP=-16.50:measured_thresh=-45.10:offset=0.30:linear=true',
  );
});

test('dryRun descreve os dois passes sem executar nada', () => {
  const r = masterizeAudio('a.mp4', 'b.mp4', { dryRun: true });
  assert.equal(r.passes, 2);
  assert.equal(r.filter, 'loudnorm=I=-14:LRA=7:tp=-1');
  assert.ok(r.args.includes('loudnorm=I=-14:LRA=7:tp=-1'));
});

function medir(arquivo) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', arquivo, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
  const resumo = r.stderr.slice(r.stderr.lastIndexOf('Summary:'));
  return {
    lufs: parseFloat(resumo.match(/I:\s+(-?[\d.]+) LUFS/)[1]),
    pico: parseFloat(resumo.match(/Peak:\s+(-?[\d.]+) dBFS/)[1]),
  };
}

test('integração: clipe sintético sai em -14 LUFS (±0,5) e com pico em -1,0 dBFS ou menos', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-master-'));
  try {
    const entrada = path.join(dir, 'in.mp4');
    const saida = path.join(dir, 'out.mp4');
    const gerar = spawnSync(
      'ffmpeg',
      ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=black:s=320x240:d=10:r=10', '-f', 'lavfi', '-i', 'anoisesrc=d=10:c=pink:r=48000:a=0.5:seed=7,tremolo=f=3:d=0.5,volume=0.5', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', entrada],
      { encoding: 'utf8' },
    );
    assert.equal(gerar.status, 0, gerar.stderr);
    masterizeAudio(entrada, saida, { silent: true });
    const m = medir(saida);
    assert.ok(Math.abs(m.lufs - -14) <= 0.5, `loudness ${m.lufs} LUFS fora de -14 ±0,5`);
    assert.ok(m.pico <= -1.0, `pico ${m.pico} dBFS acima de -1,0`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
