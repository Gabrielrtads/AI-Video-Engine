/**
 * Trava de higiene do repositório: o que um clone limpo precisa para ser
 * reproduzível (lockfile versionado, scripts de teste completos, motor Node).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const root = new URL('../../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const hasGit = fs.existsSync(new URL('.git', root));

test('pnpm-lock.yaml não está no .gitignore e existe', () => {
  const ignored = read('.gitignore').split(/\r?\n/).map((l) => l.trim());
  assert.ok(!ignored.includes('pnpm-lock.yaml'), 'pnpm-lock.yaml não pode ser ignorado');
  assert.ok(fs.existsSync(new URL('pnpm-lock.yaml', root)), 'pnpm-lock.yaml deve existir');
});

test('pnpm-lock.yaml é rastreado pelo Git', { skip: !hasGit && 'sem .git (zip/tarball)' }, () => {
  const r = spawnSync('git', ['ls-files', '--error-unmatch', 'pnpm-lock.yaml'], { cwd: root });
  assert.equal(r.status, 0, 'pnpm-lock.yaml precisa estar versionado');
});

test('package.json expõe os scripts de teste e fixa o gerenciador e o Node', () => {
  const pkg = JSON.parse(read('package.json'));
  for (const k of ['test', 'test:unit', 'test:e2e', 'test:py']) {
    assert.ok(pkg.scripts[k], `script ${k} ausente`);
  }
  assert.match(pkg.packageManager ?? '', /^pnpm@\d+\.\d+\.\d+$/);
  assert.ok(pkg.engines?.node, 'engines.node ausente');
});

test('test:unit e test:e2e usam glob entre aspas (igual em Windows e Linux)', () => {
  const s = JSON.parse(read('package.json')).scripts;
  assert.match(s['test:unit'], /"tests\/unit\/\*\*\/\*\.test\.mjs"/);
  assert.match(s['test:e2e'], /"tests\/e2e\/\*\.test\.mjs"/);
  assert.match(s['test:e2e'], /"tests\/adversarial\/\*\.test\.mjs"/);
});

test('requirements.txt declara numpy (paleta) e edge-tts fixado (voz do 1-click); o dev aponta para ele', () => {
  const req = read('requirements.txt');
  assert.match(req, /^numpy\b/m);
  assert.match(req, /^edge-tts==\d+\.\d+\.\d+$/m);
  assert.match(read('requirements-dev.txt'), /^-r requirements\.txt$/m);
});
