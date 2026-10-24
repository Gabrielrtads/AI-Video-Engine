/**
 * Carrossel estático de ponta a ponta com Remotion de verdade: spec JSON -> slides PNG 1080x1350.
 * Confere dimensão, que o slide não é uma tela em branco, que os slides são diferentes entre si e que
 * o spec inválido é recusado antes de renderizar.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { gerarCarrossel, medirImagem } from '../../scripts/carrossel.mjs';

const spec = {
  nome: 'teste-barbearia',
  estilo: 'uniforme',
  destino: 'estatico',
  autor: '@barbearia',
  marca: 'BARBEARIA FLOW',
  slides: [
    { categoria: 'AGENDA CHEIA', titulo: ['SEU CAIXA', 'NÃO ESQUECE', 'DE'], destaque: 'NINGUÉM', subtitulo: 'Lembretes automáticos trazem o cliente de volta.', palco: { destaque: 'SEM FALTAS', repetida: 'AGENDA CHEIA' } },
    { categoria: 'NO-SHOW', titulo: ['FALTA CUSTA'], destaque: 'CARO', subtitulo: 'Cada cadeira vazia é dinheiro que não volta.', palco: { destaque: 'ZERO FALTAS', repetida: 'NO-SHOW' } },
  ],
};

test('carrossel: 2 slides viram 2 PNG 1080x1350 diferentes, não vazios, mais a folha de contato', { timeout: 280000 }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-carrossel-'));
  try {
    const r = await gerarCarrossel({ spec, saidaDir: dir, estiloVisual: 'editorial-creme', silencioso: true });
    assert.equal(r.slides.length, 2);
    const hashes = new Set();
    for (const arquivo of r.slides) {
      assert.ok(fs.existsSync(arquivo), `${arquivo} deveria existir`);
      const m = medirImagem(arquivo);
      assert.equal(m.largura, 1080);
      assert.equal(m.altura, 1350);
      assert.ok(m.desvioPadrao > 12, `slide quase em branco (desvio ${m.desvioPadrao})`);
      hashes.add(crypto.createHash('sha1').update(fs.readFileSync(arquivo)).digest('hex'));
    }
    assert.equal(hashes.size, 2, 'os slides precisam ser diferentes');
    assert.ok(fs.existsSync(r.folha), 'a folha de contato deveria existir');
    assert.deepEqual(fs.readdirSync(dir).sort(), ['folha.png', 'slide-01.png', 'slide-02.png']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('spec inválido é recusado antes de renderizar, com a razão', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-carrossel-'));
  try {
    await assert.rejects(() => gerarCarrossel({ spec: { ...spec, estilo: undefined }, saidaDir: dir, silencioso: true }), /estilo/);
    assert.deepEqual(fs.readdirSync(dir), [], 'nada deveria ser gerado');
    await assert.rejects(() => gerarCarrossel({ spec, saidaDir: dir, estiloVisual: 'rosa-choque', silencioso: true }), /rosa-choque/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a CLI lê o spec de um arquivo JSON', { timeout: 280000 }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-carrossel-'));
  try {
    const arq = path.join(dir, 'spec.json');
    fs.writeFileSync(arq, JSON.stringify(spec));
    const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..');
    const r = spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', path.join(raiz, 'scripts', 'carrossel.mjs'), arq, '--saida', path.join(dir, 'slides'), '--estilo-visual', 'luxo-titanio'], { encoding: 'utf8', cwd: raiz });
    assert.equal(r.status, 0, r.stderr + r.stdout);
    assert.ok(fs.existsSync(path.join(dir, 'slides', 'slide-01.png')));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
