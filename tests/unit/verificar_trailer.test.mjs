/**
 * O CI recusa PR com commit sem o trailer `Agent=<id>` (regra do projeto). O teste monta repositórios
 * Git de verdade e confere o que o verificador devolve.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { commitsComProblema } from '../../scripts/verificar_trailer.mjs';

function git(cwd, ...args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}

function repo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-trailer-'));
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'config', 'user.email', 't@example.com');
  git(dir, 'config', 'user.name', 'Teste');
  git(dir, 'config', 'commit.gpgsign', 'false');
  fs.writeFileSync(path.join(dir, 'a.txt'), '1');
  git(dir, 'add', 'a.txt');
  git(dir, 'commit', '-q', '-m', 'base');
  return dir;
}

function commit(dir, msg, ...trailers) {
  fs.appendFileSync(path.join(dir, 'a.txt'), 'x');
  git(dir, 'add', 'a.txt');
  const args = ['commit', '-q', '-m', msg];
  for (const t of trailers) args.push('--trailer', t);
  git(dir, ...args);
}

test('commits com trailer Agent válido passam', () => {
  const dir = repo();
  try {
    commit(dir, 'feat: a', 'Agent=claude-local');
    commit(dir, 'feat: b', 'Agent=codex-local');
    assert.deepEqual(commitsComProblema('HEAD~2..HEAD', dir), []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('commit sem trailer é apontado', () => {
  const dir = repo();
  try {
    commit(dir, 'feat: ok', 'Agent=claude-local');
    commit(dir, 'feat: sem trailer');
    const problemas = commitsComProblema('HEAD~2..HEAD', dir);
    assert.equal(problemas.length, 1);
    assert.match(problemas[0].motivo, /sem trailer/i);
    assert.match(problemas[0].assunto, /sem trailer/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('trailer com id desconhecido é apontado', () => {
  const dir = repo();
  try {
    commit(dir, 'feat: id estranho', 'Agent=robo-qualquer');
    const problemas = commitsComProblema('HEAD~1..HEAD', dir);
    assert.equal(problemas.length, 1);
    assert.match(problemas[0].motivo, /desconhecido/i);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('ids válidos: claude, codex e gemini, locais ou de VPS', () => {
  const dir = repo();
  try {
    for (const id of ['claude-local', 'claude-vps', 'codex-local', 'codex-vps', 'gemini-local', 'gemini-vps']) commit(dir, `feat: ${id}`, `Agent=${id}`);
    assert.deepEqual(commitsComProblema('HEAD~6..HEAD', dir), []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('commits de merge do GitHub não exigem trailer', () => {
  const dir = repo();
  try {
    git(dir, 'checkout', '-q', '-b', 'f');
    commit(dir, 'feat: na branch', 'Agent=claude-local');
    git(dir, 'checkout', '-q', 'main');
    git(dir, 'merge', '--no-ff', '-q', '-m', 'Merge branch f', 'f');
    assert.equal(git(dir, 'rev-list', '--count', 'HEAD^1..HEAD'), '2', 'o intervalo inclui o commit da branch e o merge');
    assert.deepEqual(commitsComProblema('HEAD^1..HEAD', dir), []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
