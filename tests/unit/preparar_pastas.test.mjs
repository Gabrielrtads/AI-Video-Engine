/**
 * Contrato das pastas locais do estúdio: um comando idempotente cria tudo,
 * nada escapa da raiz do projeto, e o que o código usa está declarado e documentado.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { PASTAS, criarPastas, verificarPastas } from '../../scripts/preparar_pastas.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'vds-pastas-'));

test('criarPastas cria todas as pastas declaradas e é idempotente', () => {
  const dir = tmp();
  try {
    const primeira = criarPastas(dir);
    assert.equal(primeira.criadas.length, PASTAS.length);
    for (const p of PASTAS) assert.ok(fs.statSync(path.join(dir, p.caminho)).isDirectory(), p.caminho);

    const segunda = criarPastas(dir);
    assert.deepEqual(segunda.criadas, []);
    assert.equal(segunda.jaExistiam.length, PASTAS.length);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('criarPastas nunca mexe em arquivos que já existem', () => {
  const dir = tmp();
  try {
    fs.mkdirSync(path.join(dir, 'public', 'audio'), { recursive: true });
    const arquivo = path.join(dir, 'public', 'audio', 'minha_locucao.mp3');
    fs.writeFileSync(arquivo, 'conteudo-original');
    criarPastas(dir);
    assert.equal(fs.readFileSync(arquivo, 'utf8'), 'conteudo-original');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('verificarPastas lista o que falta sem criar nada', () => {
  const dir = tmp();
  try {
    const antes = verificarPastas(dir);
    assert.equal(antes.faltando.length, PASTAS.length);
    assert.deepEqual(fs.readdirSync(dir), []);
    criarPastas(dir);
    assert.deepEqual(verificarPastas(dir).faltando, []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('todo caminho é relativo, em ASCII e fica dentro da raiz', () => {
  for (const p of PASTAS) {
    assert.ok(!path.isAbsolute(p.caminho), `${p.caminho} deve ser relativo`);
    assert.ok(!p.caminho.split('/').includes('..'), `${p.caminho} não pode subir de nível`);
    assert.match(p.caminho, /^[A-Za-z0-9_\-/]+$/, `${p.caminho} deve ser ASCII simples (FFmpeg/Chromium)`);
    assert.ok(p.uso && p.uso.length > 10, `${p.caminho} precisa explicar para que serve`);
    assert.equal(typeof p.versionada, 'boolean');
  }
  assert.equal(new Set(PASTAS.map((p) => p.caminho)).size, PASTAS.length, 'sem duplicadas');
});

test('toda pasta de public/ usada por staticFile() no código está declarada', () => {
  const declaradas = new Set(PASTAS.map((p) => p.caminho));
  const usadas = new Set();
  const visitar = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) visitar(full);
      else if (/\.(ts|tsx)$/.test(e.name)) {
        const texto = fs.readFileSync(full, 'utf8');
        for (const m of texto.matchAll(/staticFile\(\s*['"`]([A-Za-z0-9_\-]+)\/[^'"`$]*['"`]/g)) usadas.add(m[1]);
      }
    }
  };
  visitar(path.join(root, 'src'));
  for (const sub of usadas) {
    assert.ok(declaradas.has(`public/${sub}`), `src/ usa public/${sub}/ mas ela não está em PASTAS`);
  }
});

test('docs/PASTAS.md documenta cada pasta declarada', () => {
  const doc = fs.readFileSync(path.join(root, 'docs', 'PASTAS.md'), 'utf8');
  for (const p of PASTAS) assert.ok(doc.includes(`\`${p.caminho}/\``), `docs/PASTAS.md não cita ${p.caminho}/`);
});

test('pasta marcada como "vem no clone" tem mesmo um arquivo rastreado pelo Git', { skip: !fs.existsSync(path.join(root, '.git')) && 'sem .git (zip/tarball)' }, () => {
  for (const p of PASTAS.filter((x) => x.versionada)) {
    const r = spawnSync('git', ['ls-files', p.caminho], { cwd: root, encoding: 'utf8' });
    assert.ok(r.stdout.trim().length > 0, `${p.caminho} diz que vem no clone, mas não há arquivo versionado nela (falta .gitkeep?)`);
  }
});
