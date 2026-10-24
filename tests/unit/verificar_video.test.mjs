/**
 * `verificar_video` é o portão de qualidade: mede o vídeo pronto e reprova o que está fora do padrão
 * (loudness, pico, formato, quadros congelados, áudio ausente). Funções puras com números e integração
 * com vídeos sintéticos conhecidos (bom, alto demais, congelado, formato errado).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { parseEbur128, parseFreezeDetect, avaliar, verificarVideo, FORMATOS } from '../../scripts/verificar_video.mjs';
import { masterizeAudio } from '../../scripts/masterizar_audio.mjs';

test('parseEbur128 lê loudness integrado e pico do resumo', () => {
  const stderr = 'noise\n  Summary:\n\n  Integrated loudness:\n    I:         -14.2 LUFS\n    Threshold: -24.2 LUFS\n\n  Loudness range:\n    LRA:         5.0 LU\n\n  True peak:\n    Peak:       -1.3 dBFS\n';
  assert.deepEqual(parseEbur128(stderr), { lufs: -14.2, picoDb: -1.3 });
});

test('parseFreezeDetect soma os trechos congelados e acha o maior', () => {
  const stderr = '[freezedetect @ 0x1] lavfi.freezedetect.freeze_start: 1.5\n[freezedetect @ 0x1] lavfi.freezedetect.freeze_duration: 2\n[freezedetect @ 0x1] lavfi.freezedetect.freeze_end: 3.5\n[freezedetect @ 0x1] lavfi.freezedetect.freeze_start: 6\n[freezedetect @ 0x1] lavfi.freezedetect.freeze_duration: 0.8\n[freezedetect @ 0x1] lavfi.freezedetect.freeze_end: 6.8\n';
  assert.deepEqual(parseFreezeDetect(stderr), { trechos: 2, maiorSegundos: 2, totalSegundos: 2.8 });
});

test('parseFreezeDetect: trecho parado até o fim do arquivo (sem freeze_duration) conta até o fim', () => {
  const stderr = '[Parsed_freezedetect_0 @ 0x1] lavfi.freezedetect.freeze_start: 2.5\n';
  assert.deepEqual(parseFreezeDetect(stderr, 6), { trechos: 1, maiorSegundos: 3.5, totalSegundos: 3.5 });
});

const bom = { largura: 1080, altura: 1920, fps: 30, temAudio: true, duracao: 20, lufs: -14.1, picoDb: -1.4, congelado: { trechos: 0, maiorSegundos: 0, totalSegundos: 0 } };

test('avaliar aprova um vídeo dentro do padrão', () => {
  const r = avaliar(bom, { formato: '9:16' });
  assert.equal(r.ok, true);
  assert.ok(r.checagens.every((c) => c.ok));
});

test('avaliar reprova cada tipo de problema com a razão', () => {
  const casos = [
    [{ lufs: -9 }, 'loudness'],
    [{ picoDb: -0.2 }, 'pico'],
    [{ largura: 1920, altura: 1080 }, 'formato'],
    [{ fps: 60 }, 'fps'],
    [{ temAudio: false, lufs: null, picoDb: null }, 'audio'],
    [{ congelado: { trechos: 1, maiorSegundos: 4, totalSegundos: 4 } }, 'congelado'],
  ];
  for (const [mudanca, id] of casos) {
    const r = avaliar({ ...bom, ...mudanca }, { formato: '9:16' });
    assert.equal(r.ok, false, id);
    const c = r.checagens.find((x) => x.id === id);
    assert.ok(c && !c.ok && c.mensagem.length > 5, `esperava a checagem "${id}" falhando com mensagem`);
  }
});

test('FORMATOS cobre os formatos do estúdio', () => {
  assert.deepEqual(FORMATOS['9:16'], { largura: 1080, altura: 1920 });
  assert.deepEqual(FORMATOS['4:5'], { largura: 1080, altura: 1350 });
  assert.deepEqual(FORMATOS['16:9'], { largura: 1920, altura: 1080 });
  assert.deepEqual(FORMATOS['1:1'], { largura: 1080, altura: 1080 });
});

function gerar(dir, nome, { largura = 1080, altura = 1920, fonte = 'testsrc2', som = 'anoisesrc=d=6:c=pink:r=48000:a=0.5:seed=7,tremolo=f=3:d=0.5,volume=0.5', dur = 6 } = {}) {
  const arquivo = path.join(dir, nome);
  const args = ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `${fonte}${fonte.includes('=') ? ':' : '='}s=${largura}x${altura}:r=30:d=${dur}`];
  if (som) args.push('-f', 'lavfi', '-i', som);
  args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p');
  if (som) args.push('-c:a', 'aac', '-shortest');
  args.push(arquivo);
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return arquivo;
}

test('integração: vídeo masterizado e em movimento passa; os defeituosos reprovam', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-verificar-'));
  try {
    const cru = gerar(dir, 'cru.mp4');
    const mastered = path.join(dir, 'mastered.mp4');
    masterizeAudio(cru, mastered, { silent: true });

    const bomRes = verificarVideo(mastered, { formato: '9:16' });
    assert.equal(bomRes.ok, true, JSON.stringify(bomRes.checagens.filter((c) => !c.ok)));

    // sem masterizar: o ruído cru fica longe de -14 LUFS
    const naoMaster = verificarVideo(cru, { formato: '9:16' });
    assert.equal(naoMaster.ok, false);
    assert.ok(naoMaster.checagens.find((c) => c.id === 'loudness' && !c.ok));

    // formato errado
    const horizontal = gerar(dir, 'h.mp4', { largura: 1280, altura: 720 });
    assert.ok(verificarVideo(horizontal, { formato: '9:16' }).checagens.find((c) => c.id === 'formato' && !c.ok));

    // imagem parada
    const parado = gerar(dir, 'parado.mp4', { fonte: 'color=c=0x336699' });
    assert.ok(verificarVideo(parado, { formato: '9:16' }).checagens.find((c) => c.id === 'congelado' && !c.ok));

    // sem áudio
    const mudo = gerar(dir, 'mudo.mp4', { som: null });
    assert.ok(verificarVideo(mudo, { formato: '9:16' }).checagens.find((c) => c.id === 'audio' && !c.ok));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
