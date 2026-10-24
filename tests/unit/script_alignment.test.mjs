/**
 * A legenda tem que mostrar o texto do ROTEIRO (que o autor escreveu e conhece), usando do Whisper só
 * o tempo de cada palavra. Antes, o Whisper trocava palavras ("Agende" virou "AGENTE") e a legenda
 * saía errada.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { alignScriptToTimestamps, normalizeToken } from '../../src/timeline/scriptAlignment.ts';

const w = (text, start, end) => ({ text, start, end });
const monotono = (ws) => ws.every((x, i) => x.end >= x.start && (i === 0 || x.start >= ws[i - 1].start));

test('normalizeToken ignora caixa, acento e pontuação', () => {
  assert.equal(normalizeToken('Você,'), 'voce');
  assert.equal(normalizeToken('“Sistema.”'), 'sistema');
  assert.equal(normalizeToken('R$127,97'), 'r12797');
});

test('palavras iguais: texto do roteiro (com pontuação) e tempo do Whisper', () => {
  const r = alignScriptToTimestamps('Agende, lembre e fidelize.', [w('agende', 0, 0.4), w('lembre', 0.5, 0.9), w('e', 0.9, 1), w('fidelize', 1, 1.6)]);
  assert.deepEqual(r.map((x) => x.text), ['Agende,', 'lembre', 'e', 'fidelize.']);
  assert.deepEqual(r.map((x) => [x.start, x.end]), [[0, 0.4], [0.5, 0.9], [0.9, 1], [1, 1.6]]);
});

test('Whisper ouviu errado ("Agente"): a legenda mantém "Agende" com o tempo da palavra ouvida', () => {
  const r = alignScriptToTimestamps('Agende, lembre e fidelize.', [w('Agente,', 0, 0.4), w('lembre', 0.5, 0.9), w('e', 0.9, 1), w('fidelize.', 1, 1.6)]);
  assert.equal(r[0].text, 'Agende,');
  assert.deepEqual([r[0].start, r[0].end], [0, 0.4]);
});

test('palavra que o Whisper não ouviu é interpolada entre as vizinhas', () => {
  const r = alignScriptToTimestamps('um dois tres quatro', [w('um', 0, 1), w('quatro', 3, 4)]);
  assert.deepEqual(r.map((x) => x.text), ['um', 'dois', 'tres', 'quatro']);
  assert.ok(monotono(r));
  assert.ok(r[1].start >= 1 && r[2].end <= 3, 'dois e tres ficam entre 1 s e 3 s');
  assert.ok(r[1].end <= r[2].start + 1e-9);
});

test('palavra a mais no Whisper (alucinação) é descartada', () => {
  const r = alignScriptToTimestamps('olá mundo', [w('olá', 0, 0.5), w('obrigado', 0.5, 1), w('mundo', 1, 1.5)]);
  assert.deepEqual(r.map((x) => x.text), ['olá', 'mundo']);
  assert.deepEqual([r[1].start, r[1].end], [1, 1.5]);
});

test('casa sem diferenciar maiúscula e acento', () => {
  const r = alignScriptToTimestamps('Você precisa', [w('voce', 0, 0.3), w('precisa', 0.3, 0.9)]);
  assert.deepEqual(r.map((x) => [x.text, x.start]), [['Você', 0], ['precisa', 0.3]]);
});

test('sem nenhuma palavra em comum: distribui o roteiro por todo o trecho falado', () => {
  const r = alignScriptToTimestamps('alfa beta gama', [w('xxxx', 2, 3), w('yyyy', 3, 5)]);
  assert.deepEqual(r.map((x) => x.text), ['alfa', 'beta', 'gama']);
  assert.ok(monotono(r));
  assert.equal(r[0].start, 2);
  assert.equal(r.at(-1).end, 5);
});

test('Whisper vazio devolve lista vazia (o chamador usa o estimador)', () => {
  assert.deepEqual(alignScriptToTimestamps('qualquer coisa', []), []);
});

test('roteiro vazio devolve lista vazia', () => {
  assert.deepEqual(alignScriptToTimestamps('   ', [w('a', 0, 1)]), []);
});
