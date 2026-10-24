/**
 * O Edge-TTS depende da rede e falha de vez em quando (visto em render real: "Falha ao gerar narração com
 * código 1" e, na segunda tentativa, funcionou). A narração precisa tentar de novo antes de derrubar o vídeo.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { executarComTentativas } from '../../scripts/narrar.mjs';

test('sucesso na primeira tentativa não repete', () => {
  let chamadas = 0;
  const r = executarComTentativas(() => { chamadas++; return { status: 0 }; }, { tentativas: 3, esperaMs: 0 });
  assert.equal(r.status, 0);
  assert.equal(chamadas, 1);
});

test('falha transitória é repetida até funcionar', () => {
  let chamadas = 0;
  const r = executarComTentativas(() => { chamadas++; return { status: chamadas < 3 ? 1 : 0 }; }, { tentativas: 3, esperaMs: 0 });
  assert.equal(r.status, 0);
  assert.equal(chamadas, 3);
});

test('falha persistente devolve o último resultado depois de todas as tentativas', () => {
  let chamadas = 0;
  const r = executarComTentativas(() => { chamadas++; return { status: 1 }; }, { tentativas: 3, esperaMs: 0 });
  assert.equal(r.status, 1);
  assert.equal(chamadas, 3);
});

test('avisa a cada nova tentativa', () => {
  const avisos = [];
  executarComTentativas(() => ({ status: 1 }), { tentativas: 2, esperaMs: 0, aoRepetir: (n) => avisos.push(n) });
  assert.deepEqual(avisos, [2]);
});
