/**
 * `pnpm vibe <comando>` é a entrada única para agentes: roteia para os scripts e devolve JSON quando pedido.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { rotear, COMANDOS } from '../../scripts/vibe.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const vibe = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts', 'vibe.mjs'), ...args], { encoding: 'utf8', cwd: root });

test('rotear separa comando, argumentos e --json', () => {
  assert.deepEqual(rotear(['doctor', '--json']), { comando: 'doctor', args: [], json: true });
  assert.deepEqual(rotear(['verificar', 'out/a.mp4', '--formato', '9:16']), { comando: 'verificar', args: ['out/a.mp4', '--formato', '9:16'], json: false });
});

test('rotear sem comando ou com comando desconhecido devolve erro com a lista', () => {
  assert.equal(rotear([]).comando, 'ajuda');
  const r = rotear(['inventado']);
  assert.equal(r.comando, 'desconhecido');
  assert.equal(r.pedido, 'inventado');
});

test('COMANDOS tem descrição de cada comando', () => {
  for (const nome of ['doctor', 'componentes', 'verificar', 'roteiro', 'cortar-silencio', 'pastas']) {
    assert.ok(COMANDOS[nome] && COMANDOS[nome].descricao.length > 10, nome);
  }
});

test('vibe ajuda lista os comandos e sai com 0', () => {
  const r = vibe('ajuda');
  assert.equal(r.status, 0);
  for (const nome of Object.keys(COMANDOS)) assert.match(r.stdout, new RegExp(nome));
});

test('vibe comando-inventado sai com 2 e sugere a ajuda', () => {
  const r = vibe('comando-inventado');
  assert.equal(r.status, 2);
  assert.match(r.stderr, /desconhecido/i);
  assert.match(r.stderr, /vibe ajuda/);
});

test('vibe componentes --json lista os componentes do catálogo com descrição e props padrão', () => {
  const r = vibe('componentes', '--json');
  assert.equal(r.status, 0, r.stderr);
  const lista = JSON.parse(r.stdout);
  assert.ok(lista.length >= 15);
  const mockup = lista.find((c) => c.name === 'Smartphone3DMockup');
  assert.ok(mockup && mockup.description && mockup.defaultProps);
});

test('vibe doctor --json devolve ok e checagens', () => {
  const r = vibe('doctor', '--json');
  const saida = JSON.parse(r.stdout);
  assert.equal(typeof saida.ok, 'boolean');
  assert.ok(Array.isArray(saida.checagens));
  assert.equal(r.status, saida.ok ? 0 : 1);
});
