/**
 * Material público não pode afirmar o que o repositório não prova:
 * - número de estrelas fixo no código (o contador real vem do GitHub, nunca de um literal);
 * - "60 FPS" nos textos enquanto as composições renderizam a 30 fps.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const srcDir = path.join(root, 'src');

function arquivos(dir, saida = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) arquivos(full, saida);
    else if (/\.(ts|tsx)$/.test(e.name)) saida.push(full);
  }
  return saida;
}
const todos = arquivos(srcDir);
const rel = (f) => path.relative(root, f).replace(/\\/g, '/');

test('nenhum contador de estrelas com número inventado em src/', () => {
  const padroes = [
    /initialStars\s*(=|:)\s*\{?\s*\d{2,}/, // initialStars = 1481 / initialStars={1481}
    /starCount\s*=[^;\n]*\b\d{3,}\b/, // const starCount = ... 1482
  ];
  const achados = [];
  for (const f of todos) {
    const texto = fs.readFileSync(f, 'utf8');
    for (const p of padroes) if (p.test(texto)) achados.push(`${rel(f)} (${p})`);
  }
  assert.deepEqual(achados, [], `estrelas fixas no código: ${achados.join(', ')}`);
});

test('texto "60 FPS" só aparece se alguma composição realmente renderiza a 60 fps', () => {
  const index = fs.readFileSync(path.join(srcDir, 'index.tsx'), 'utf8');
  const fps = new Set([...index.matchAll(/fps=\{(\d+)\}/g)].map((m) => Number(m[1])));
  assert.ok(fps.size > 0, 'index.tsx deveria declarar fps nas composições');
  if (fps.has(60)) return;
  const achados = todos.filter((f) => /\b60\s?FPS\b/i.test(fs.readFileSync(f, 'utf8'))).map(rel);
  assert.deepEqual(achados, [], `citam 60 FPS, mas as composições usam ${[...fps].join('/')} fps: ${achados.join(', ')}`);
});
