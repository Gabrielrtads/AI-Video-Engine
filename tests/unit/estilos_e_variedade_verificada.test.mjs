/**
 * Pacotes de estilo acessíveis ao agente (`vibe estilos`, `--estilo`) e variedade conferida de verdade no
 * vídeo pronto (o verificador lê a timeline do render).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { listarEstilos, carregarEstilo } from '../../scripts/estilos.mjs';
import { chavesDeVariedade, avaliar } from '../../scripts/verificar_video.mjs';
import { build1ClickTimelinePayload } from '../../src/timeline/pipeline1ClickMath.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('listarEstilos devolve os pacotes com id, nome e clima', () => {
  const lista = listarEstilos();
  assert.ok(lista.length >= 6);
  for (const e of lista) {
    assert.ok(e.id && e.nome && e.clima);
  }
  assert.ok(lista.some((e) => e.id === 'escuro-tech'));
});

test('carregarEstilo devolve o pacote completo e recusa id inexistente listando os válidos', () => {
  const e = carregarEstilo('editorial-creme');
  assert.equal(e.id, 'editorial-creme');
  assert.equal(e.hud, false);
  assert.throws(() => carregarEstilo('rosa-choque'), (erro) => /rosa-choque/.test(erro.message) && /escuro-tech/.test(erro.message));
});

test('vibe estilos --json lista os pacotes', () => {
  const r = spawnSync(process.execPath, [path.join(root, 'scripts', 'vibe.mjs'), 'estilos', '--json'], { encoding: 'utf8', cwd: root });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(JSON.parse(r.stdout).length >= 6);
});

const medidasBoas = { largura: 1080, altura: 1920, fps: 30, temAudio: true, duracao: 20, lufs: -14, picoDb: -1.4, congelado: { trechos: 0, maiorSegundos: 0, totalSegundos: 0 } };

test('chavesDeVariedade lê os visuais (faixa T_HERO, em ordem) e separa variantes da frase', () => {
  const clips = [
    { trackId: 'T_HERO', startFrame: 60, componentName: 'FraseDestaque', props: { variant: 'cta' } },
    { trackId: 'T_HERO', startFrame: 0, componentName: 'Smartphone3DMockup', props: {} },
    { trackId: 'T_CAPTIONS', startFrame: 0, componentName: 'HormoziKineticCaption', props: {} },
  ];
  assert.deepEqual(chavesDeVariedade(clips), ['Smartphone3DMockup', 'FraseDestaque:cta']);
});

test('avaliar inclui a checagem de variedade quando recebe as chaves', () => {
  const bom = avaliar(medidasBoas, { formato: '9:16', chavesVisuais: ['A', 'B', 'C', 'A'] });
  assert.equal(bom.checagens.find((c) => c.id === 'variedade').ok, true);
  const ruim = avaliar(medidasBoas, { formato: '9:16', chavesVisuais: ['A', 'A', 'B', 'B'] });
  assert.equal(ruim.ok, false);
  assert.match(ruim.checagens.find((c) => c.id === 'variedade').mensagem, /repetem|distint/);
  assert.equal(avaliar(medidasBoas, { formato: '9:16' }).checagens.some((c) => c.id === 'variedade'), false, 'sem timeline, sem checagem');
});

test('integração: a timeline do 1-click com roteiro variado passa na variedade; o mesmo roteiro fixo não é mais gerado', () => {
  const texto = 'Você perde clientes toda semana? Barbearias perdem 40% do faturamento. Existe um sistema simples. Ele lembra cada cliente. Agende agora.';
  const palavras = texto.split(' ').map((t, i) => ({ text: t, start: i * 0.5, end: i * 0.5 + 0.45 }));
  const timeline = build1ClickTimelinePayload({ text: texto, audioDurationSeconds: 14, words: palavras, preset: 'hormozi', aspectRatio: '9:16', estilo: carregarEstilo('luxo-titanio') });
  const chaves = chavesDeVariedade(timeline.clips);
  assert.ok(chaves.length >= 4, `esperava 4+ cenas, veio ${chaves.length}`);
  assert.equal(avaliar(medidasBoas, { formato: '9:16', chavesVisuais: chaves }).checagens.find((c) => c.id === 'variedade').ok, true, chaves.join(' > '));
  assert.ok(chaves.includes('NumeroDestaque'), '40% pede o número em destaque');
  assert.ok(chaves.includes('FraseDestaque:pergunta'), 'a pergunta pede o gancho');
  assert.ok(chaves.includes('FraseDestaque:cta'), 'a última frase pede a chamada para ação');
  const fundo = timeline.clips.find((c) => c.componentName === 'FundoEstilo');
  assert.equal(fundo.props.fundo, '#0E0E10');
  assert.equal(timeline.clips.find((c) => c.componentName === 'VectorHUDOverlay'), undefined, 'luxo-titanio não usa HUD');
  const legenda = timeline.clips.find((c) => c.componentName === 'HormoziKineticCaption');
  assert.equal(legenda.props.variant, 'dark-glass');
});
