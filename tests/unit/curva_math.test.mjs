/**
 * Pontos da curva animada em pixels: valores reais (ou uma forma decorativa) viram coordenadas dentro da área,
 * sem herdar os pontos de demonstração do componente ("$12k ... $142k").
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { pontosDeCurva, FORMA_DECORATIVA } from '../../src/timeline/curvaMath.ts';

test('pontosDeCurva: x cresce e todos os pontos ficam dentro da área, com margem', () => {
  const pts = pontosDeCurva([10, 40, 25, 80], 800, 400);
  assert.equal(pts.length, 4);
  for (let i = 1; i < pts.length; i++) assert.ok(pts[i].x > pts[i - 1].x);
  for (const p of pts) {
    assert.ok(p.x >= 0 && p.x <= 800, `x fora da área: ${p.x}`);
    assert.ok(p.y >= 0 && p.y <= 400, `y fora da área: ${p.y}`);
  }
});

test('pontosDeCurva: valor maior fica mais alto (y menor) e o menor fica embaixo', () => {
  const pts = pontosDeCurva([5, 50, 20], 600, 300);
  assert.ok(pts[1].y < pts[2].y && pts[2].y < pts[0].y);
});

test('pontosDeCurva: série constante fica no meio, sem dividir por zero', () => {
  const pts = pontosDeCurva([7, 7, 7], 600, 300);
  assert.ok(pts.every((p) => Number.isFinite(p.y) && p.y === pts[0].y));
});

test('pontosDeCurva: sem formatador não há texto nos pontos; com formatador cada ponto mostra o valor real', () => {
  assert.ok(pontosDeCurva([1, 2, 3], 600, 300).every((p) => p.value === undefined && p.label === undefined));
  const comTexto = pontosDeCurva([1500, 2500], 600, 300, { formatar: (v) => `R$ ${v}` });
  assert.deepEqual(comTexto.map((p) => p.value), ['R$ 1500', 'R$ 2500']);
});

test('pontosDeCurva recusa série curta ou com valor que não é número', () => {
  assert.throws(() => pontosDeCurva([1], 600, 300), /pelo menos 2/);
  assert.throws(() => pontosDeCurva([1, NaN, 3], 600, 300), /número/);
  assert.throws(() => pontosDeCurva([1, 2], 0, 300), /área/);
});

test('FORMA_DECORATIVA sobe de forma suave e tem pontos suficientes', () => {
  assert.ok(FORMA_DECORATIVA.length >= 5);
  assert.ok(FORMA_DECORATIVA[FORMA_DECORATIVA.length - 1] > FORMA_DECORATIVA[0]);
});
