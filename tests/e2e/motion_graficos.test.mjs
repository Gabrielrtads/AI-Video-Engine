/**
 * Motion graphics sem narração de ponta a ponta com Remotion de verdade: spec de um modelo fechado -> MP4 mudo,
 * verificado (formato, 30 fps, sem trecho parado). Confere também que o desenho cabe e está centrado na tela
 * (a curva já nasceu colada no topo) e que spec ruim é recusada antes de gastar render.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { produzirMotion } from '../../scripts/motion.mjs';
import { EXEMPLOS } from '../../src/timeline/motionModelos.ts';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const clonar = (o) => JSON.parse(JSON.stringify(o));

/** Quadro em tons de cinza 54x96 -> onde estão os pixels bem mais claros que o fundo (mediana). */
function ocupacaoDoQuadro(video, segundo, margemClara = 50) {
  const L = 54;
  const A = 96;
  const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(segundo), '-i', video, '-vframes', '1', '-vf', `scale=${L}:${A},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1024 * 1024 });
  assert.equal(r.status, 0, 'ffmpeg não leu o quadro');
  const px = [...r.stdout];
  const mediana = [...px].sort((a, b) => a - b)[Math.floor(px.length / 2)];
  let minY = A, maxY = -1, minX = L, maxX = -1, soma = 0, n = 0;
  px.forEach((v, i) => {
    if (v > mediana + margemClara) {
      const y = Math.floor(i / L), x = i % L;
      minY = Math.min(minY, y); maxY = Math.max(maxY, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x); soma += y; n++;
    }
  });
  return { pixels: n, topo: minY / A, base: (maxY + 1) / A, esquerda: minX / L, direita: (maxX + 1) / L, centroY: n ? soma / n / A : 0 };
}

test('dataviz: renderiza mudo, passa no verificador e a curva fica centrada e dentro da tela', { timeout: 280000 }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-motion-'));
  try {
    const saida = path.join(dir, 'dataviz.mp4');
    const r = await produzirMotion({ spec: clonar(EXEMPLOS.dataviz), saida, silencioso: true });
    assert.equal(r.verificacao.ok, true, JSON.stringify(r.verificacao.checagens.filter((c) => !c.ok)));
    // O Remotion costuma gravar uma trilha AAC vazia mesmo sem clipe de áudio: o que importa é que seja silêncio
    const { temAudio, lufs } = r.verificacao.medidas;
    assert.ok(!temAudio || lufs === null || lufs < -60, `motion sem narração deveria ser mudo, mas mede ${lufs} LUFS`);
    assert.equal(`${r.verificacao.medidas.largura}x${r.verificacao.medidas.altura}`, '1080x1920');
    assert.ok(r.duracao > 10 && r.duracao < 14, `duração ${r.duracao}s`);
    assert.ok(r.folha && fs.existsSync(r.folha), 'deveria gerar a folha de contato');

    // No fim do vídeo a curva está toda desenhada: precisa estar no meio da tela e longe das bordas
    const o = ocupacaoDoQuadro(saida, r.duracao - 0.6);
    assert.ok(o.pixels > 20, 'a curva não apareceu');
    assert.ok(o.topo > 0.05 && o.base < 0.95, `curva encostou na borda (topo ${o.topo.toFixed(2)}, base ${o.base.toFixed(2)})`);
    assert.ok(o.centroY > 0.3 && o.centroY < 0.7, `curva fora do centro vertical (${o.centroY.toFixed(2)})`);
    assert.ok(o.esquerda > 0.03 && o.direita < 0.97, 'curva encostou nas laterais');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('cartão de marca: renderiza e passa no verificador com a marca do spec', { timeout: 280000 }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-motion-'));
  try {
    const r = await produzirMotion({ spec: clonar(EXEMPLOS['cartao-de-marca']), saida: path.join(dir, 'cartao.mp4'), silencioso: true });
    assert.equal(r.verificacao.ok, true, JSON.stringify(r.verificacao.checagens.filter((c) => !c.ok)));
    const o = ocupacaoDoQuadro(path.join(dir, 'cartao.mp4'), 3, 12);
    assert.ok(o.pixels > 40, 'o cartão não apareceu');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('spec inválida é recusada antes de renderizar, com a razão e sem criar arquivo', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-motion-'));
  try {
    const saida = path.join(dir, 'nao-deve-existir.mp4');
    const ruim = clonar(EXEMPLOS['titulo-cinetico']);
    ruim.conteudo.linhas = ['x'.repeat(80)];
    await assert.rejects(() => produzirMotion({ spec: ruim, saida, silencioso: true }), /linhas\[0\].*caracteres/s);
    assert.equal(fs.existsSync(saida), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a CLI lista os modelos em JSON e imprime um exemplo válido para copiar', () => {
  const modelos = spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', path.join(RAIZ, 'scripts', 'motion.mjs'), 'modelos', '--json'], { encoding: 'utf8' });
  assert.equal(modelos.status, 0);
  assert.deepEqual(JSON.parse(modelos.stdout).map((m) => m.id).sort(), ['cartao-de-marca', 'dataviz', 'titulo-cinetico']);
  const exemplo = spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', path.join(RAIZ, 'scripts', 'motion.mjs'), 'exemplo', 'dataviz'], { encoding: 'utf8' });
  assert.equal(exemplo.status, 0);
  assert.equal(JSON.parse(exemplo.stdout).modelo, 'dataviz');
  const inexistente = spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', path.join(RAIZ, 'scripts', 'motion.mjs'), 'exemplo', 'nada'], { encoding: 'utf8' });
  assert.equal(inexistente.status, 2);
});
