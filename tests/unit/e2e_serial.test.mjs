/**
 * Os e2e que usam o Remotion (reel, carrossel) não podem rodar em paralelo: dois bundles do mesmo projeto
 * ao mesmo tempo derrubaram o render de um deles e deixaram o CI do Linux travado por 24 minutos
 * (a mesma suíte em série passa em segundos). Esta trava garante que ninguém tire a opção sem perceber.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pacote = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

test('test:e2e roda os arquivos em série (--test-concurrency=1)', () => {
  assert.match(pacote.scripts['test:e2e'], /--test-concurrency=1\b/);
});

test('o workflow de diagnóstico temporário não vai para a main', () => {
  assert.equal(fs.existsSync(new URL('../../.github/workflows/diag-carrossel.yml', import.meta.url)), false);
});
