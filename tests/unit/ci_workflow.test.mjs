/**
 * O CI é a trava que não depende de memória: este teste avisa se alguém apagar ou esvaziar o workflow.
 * (A prova de verdade é a execução no GitHub Actions; aqui só garantimos que o essencial continua lá.)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ci = fs.readFileSync(path.join(root, '.github', 'workflows', 'ci.yml'), 'utf8');

test('o workflow roda em PR e em push na main', () => {
  assert.match(ci, /pull_request:/);
  assert.match(ci, /branches:\s*\[main\]/);
});

test('o workflow roda a suíte completa com lockfile congelado, ffmpeg e python', () => {
  assert.match(ci, /pnpm install --frozen-lockfile/);
  assert.match(ci, /run:\s*pnpm test/);
  assert.match(ci, /apt-get install -y ffmpeg/);
  assert.match(ci, /requirements-dev\.txt/);
  assert.match(ci, /node-version:\s*24/);
});

test('o workflow confere o trailer Agent dos commits do PR', () => {
  assert.match(ci, /verificar_trailer\.mjs origin\/\$\{\{ github\.base_ref \}\}\.\.HEAD/);
  assert.match(ci, /fetch-depth:\s*0/);
});

test('permissões mínimas e actions fixadas em versão exata', () => {
  assert.match(ci, /permissions:\s*\n\s*contents:\s*read/);
  for (const uso of ci.matchAll(/uses:\s*([^\s#]+)/g)) {
    assert.match(uso[1], /@v\d+\.\d+\.\d+$/, `${uso[1]} deve usar versão exata (vX.Y.Z), não tag móvel`);
  }
});
