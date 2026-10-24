/**
 * O auto-ducking era anunciado (README, AGENTS) mas nenhuma composição o usava: a trilha ficava
 * num volume fixo por cima da voz. Toda composição que toca narração e trilha precisa
 * passar a trilha pelo AutoDuckingAudio.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { calculateDuckedVolume } from '../../src/auto_ducking_math.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ler = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const tagsAudio = (src) => [...src.matchAll(/<Audio\b[\s\S]*?\/>/g)].map((m) => m[0]);
const tagsDucking = (src) => [...src.matchAll(/<AutoDuckingAudio\b[\s\S]*?\/>/g)].map((m) => m[0]);

for (const arquivo of ['src/FlowMotionMaster.tsx', 'src/FullBleedShowcase.tsx']) {
  test(`${arquivo}: a trilha passa pelo AutoDuckingAudio, com as palavras da narração`, () => {
    const src = ler(arquivo);
    assert.equal(tagsAudio(src).filter((t) => t.includes('audio/musica/')).length, 0, 'sobrou <Audio> direto de trilha');
    const ducking = tagsDucking(src).filter((t) => t.includes('audio/musica/'));
    assert.equal(ducking.length, 1, 'esperava 1 AutoDuckingAudio de trilha');
    assert.match(ducking[0], /words=\{/, 'precisa receber as palavras para saber quando há fala');
    assert.match(ducking[0], /duckedVolume=\{/);
  });
}

test('src/RourkeLuxuryShowcase.tsx: com locução a trilha usa ducking; só no modo visual puro fica fixa', () => {
  const src = ler('src/RourkeLuxuryShowcase.tsx');
  const diretas = tagsAudio(src).filter((t) => t.includes('audio/musica/'));
  assert.equal(diretas.length, 1, 'só o modo pure-visual (sem voz) pode tocar a trilha direto');
  assert.match(src, /mode === 'pure-visual'/);
  const ducking = tagsDucking(src).filter((t) => t.includes('audio/musica/'));
  assert.equal(ducking.length, 1);
  assert.match(ducking[0], /speechIntervals=\{/);
});

test('intervalos de fala da locução de showcase são válidos e cobrem a maior parte do áudio', () => {
  const iv = JSON.parse(ler('src/data/speech_showcase_vibe.json'));
  assert.ok(iv.length >= 3);
  let ultimo = -1;
  let frames = 0;
  for (const i of iv) {
    assert.ok(i.startFrame >= ultimo, 'intervalos em ordem e sem sobreposição');
    assert.ok(i.endFrame > i.startFrame);
    frames += i.endFrame - i.startFrame;
    ultimo = i.endFrame;
  }
  assert.ok(ultimo <= 750, 'não passa dos 750 frames da composição');
  assert.ok(frames / 741 > 0.5, 'a fala deveria cobrir mais da metade da locução (24,7 s)');
});

test('o ducking de fato baixa a trilha durante a fala e a devolve na pausa', () => {
  const fala = [{ startFrame: 30, endFrame: 120 }];
  const duranteFala = calculateDuckedVolume(60, fala, 0.35, 0.14, 8);
  const naPausa = calculateDuckedVolume(200, fala, 0.35, 0.14, 8);
  assert.equal(duranteFala, 0.14);
  assert.equal(naPausa, 0.35);
});
