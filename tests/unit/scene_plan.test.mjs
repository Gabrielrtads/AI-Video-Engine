/**
 * "Roteiro manda": o visual deve acompanhar o roteiro. O roteiro vira cenas (uma por frase) com tempo
 * vindo das palavras alinhadas; cada cena tem seu visual (padrão ou escolhido pelo agente num plano) e
 * nenhum texto de demonstração ("Vibe Studio Mobile") pode aparecer no vídeo.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { planScenes, keyPhrase, resolveScenePlan } from '../../src/timeline/scenePlan.ts';
import { build1ClickTimelinePayload } from '../../src/timeline/pipeline1ClickMath.ts';
import { validateTimelineSchema } from '../../src/timeline/compileTimeline.ts';

const w = (text, start, end) => ({ text, start, end });
// "Você perde clientes. Barbearia cheia é sistema! Comece hoje."
const palavras = [
  w('Você', 0, 0.3), w('perde', 0.3, 0.7), w('clientes.', 0.7, 1.4),
  w('Barbearia', 1.6, 2.2), w('cheia', 2.2, 2.6), w('é', 2.6, 2.7), w('sistema!', 2.7, 3.5),
  w('Comece', 3.8, 4.2), w('hoje.', 4.2, 4.8),
];

test('planScenes: uma cena por frase, contíguas e cobrindo o vídeo inteiro', () => {
  const cenas = planScenes(palavras, 30, 150);
  assert.deepEqual(cenas.map((c) => c.texto), ['Você perde clientes.', 'Barbearia cheia é sistema!', 'Comece hoje.']);
  assert.equal(cenas[0].startFrame, 0);
  assert.equal(cenas.at(-1).startFrame + cenas.at(-1).durationInFrames, 150);
  for (let i = 1; i < cenas.length; i++) {
    assert.equal(cenas[i].startFrame, cenas[i - 1].startFrame + cenas[i - 1].durationInFrames, 'sem buraco entre cenas');
  }
  assert.ok(cenas.every((c) => c.durationInFrames > 0));
  assert.deepEqual(cenas.map((c) => c.indice), [1, 2, 3]);
});

test('planScenes: cena começa na primeira palavra da frase', () => {
  const cenas = planScenes(palavras, 30, 150);
  assert.ok(Math.abs(cenas[1].startFrame - 48) <= 6, `cena 2 deveria começar perto de 1,6 s (frame 48), começou em ${cenas[1].startFrame}`);
});

test('planScenes: frases curtíssimas são fundidas à vizinha (mínimo ~1 s)', () => {
  const curtas = [w('Oi.', 0, 0.2), w('Tudo', 0.3, 0.5), w('bem?', 0.5, 0.9), w('Vamos', 1, 1.4), w('lá', 1.4, 2.2), w('agora', 2.2, 3), w('mesmo.', 3, 4)];
  const cenas = planScenes(curtas, 30, 120);
  assert.ok(cenas.every((c) => c.durationInFrames >= 25 || cenas.length === 1), JSON.stringify(cenas.map((c) => c.durationInFrames)));
});

test('planScenes: sem pontuação final vira uma cena só', () => {
  const cenas = planScenes([w('sem', 0, 1), w('ponto', 1, 2)], 30, 90);
  assert.equal(cenas.length, 1);
  assert.equal(cenas[0].durationInFrames, 90);
});

test('keyPhrase: no máximo 5 palavras, sem pontuação final', () => {
  assert.equal(keyPhrase('Barbearia cheia não é sorte, é sistema.'), 'Barbearia cheia não é sorte');
  assert.equal(keyPhrase('Comece hoje.'), 'Comece hoje');
});

test('resolveScenePlan: o agente escolhe o componente de cada cena; componente inventado é recusado', () => {
  const cenas = planScenes(palavras, 30, 150);
  const r = resolveScenePlan(cenas, [{ cena: 2, componente: 'OrbitalPlanet3D', props: { size: 300 } }]);
  assert.equal(r[1].componentName, 'OrbitalPlanet3D');
  assert.deepEqual(r[1].props, { size: 300 });
  assert.equal(r[0].componentName, 'Smartphone3DMockup', 'cena sem plano usa o visual padrão');
  assert.throws(() => resolveScenePlan(cenas, [{ cena: 1, componente: 'ComponenteQueNaoExiste' }]), /ComponenteQueNaoExiste/);
  assert.throws(() => resolveScenePlan(cenas, [{ cena: 9, componente: 'OrbitalPlanet3D' }]), /cena 9/i);
});

test('timeline 1-click usa as cenas do roteiro e nenhum texto de demonstração', () => {
  const texto = 'Você perde clientes. Barbearia cheia é sistema! Comece hoje.';
  const payload = build1ClickTimelinePayload({ text: texto, audioDurationSeconds: 5, words: palavras, preset: 'hormozi', aspectRatio: '9:16' });
  const herois = payload.clips.filter((c) => c.trackId === 'T_HERO');
  assert.equal(herois.length, 3, 'um visual por frase');
  assert.deepEqual(herois.map((c) => c.props.title), ['Você perde clientes', 'Barbearia cheia é sistema', 'Comece hoje']);
  const dump = JSON.stringify(payload);
  assert.ok(!dump.includes('Vibe Studio Mobile'), 'texto de demonstração vazou');
  assert.ok(!dump.includes('vibe.studio/preview'), 'url de demonstração vazou');
  const total = payload.durationInFrames;
  assert.equal(herois.at(-1).startFrame + herois.at(-1).durationInFrames, total);
  assert.equal(validateTimelineSchema(payload).valid, true);
});

test('timeline 1-click aplica o plano de cenas do agente', () => {
  const texto = 'Você perde clientes. Barbearia cheia é sistema! Comece hoje.';
  const payload = build1ClickTimelinePayload({ text: texto, audioDurationSeconds: 5, words: palavras, preset: 'hormozi', aspectRatio: '9:16', planoDeCenas: [{ cena: 3, componente: 'AppleKineticCard3D', props: { title: 'Agende agora' } }] });
  const herois = payload.clips.filter((c) => c.trackId === 'T_HERO');
  assert.equal(herois[2].componentName, 'AppleKineticCard3D');
  assert.equal(herois[2].props.title, 'Agende agora');
  assert.equal(herois[0].componentName, 'Smartphone3DMockup');
});
