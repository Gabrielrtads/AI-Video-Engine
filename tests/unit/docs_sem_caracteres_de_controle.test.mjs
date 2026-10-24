/**
 * Um caminho do Windows escrito como C:\vds numa ferramenta que interpreta \v virou "C:" + tab vertical + "ds"
 * no README. Documentos de texto não podem ter caracteres de controle (exceto tab, quebra de linha e CR).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTROLE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;

function arquivosDeTexto(dir, saida = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.worktrees', 'out', 'public'].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) arquivosDeTexto(full, saida);
    else if (/\.(md|mjs|ts|tsx|json|yml|txt)$/.test(e.name) && e.name !== 'pnpm-lock.yaml') saida.push(full);
  }
  return saida;
}

test('nenhum documento ou código versionado contém caractere de controle', () => {
  const achados = [];
  for (const f of arquivosDeTexto(root)) {
    const texto = fs.readFileSync(f, 'utf8');
    const m = texto.match(CONTROLE);
    if (m) achados.push(`${path.relative(root, f)} (U+${m[0].charCodeAt(0).toString(16).padStart(4, '0')})`);
  }
  assert.deepEqual(achados, [], `caracteres de controle em: ${achados.join(', ')}`);
});
