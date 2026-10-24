#!/usr/bin/env node
/**
 * Confere se os arquivos de mídia que o código chama existem em public/.
 *
 * Uso:
 *   node scripts/check_assets.mjs          lista o que falta (sai com código 1 se faltar algo)
 *   node scripts/check_assets.mjs --warn   só avisa (sempre sai com código 0)
 *
 * Acha referências escritas como texto: staticFile('audio/sfx/x.mp3'), ternários, props
 * (videoSrc="video/x.webm") e JSON de timeline. Referências montadas em tempo de execução
 * (template com ${...}) não dá para conferir arquivo por arquivo: saem como "dinâmicas",
 * com o prefixo, para você conferir a pasta.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const EXTENSOES = /\.(ts|tsx|js|mjs|json)$/;
const PASTAS_DE_MIDIA = 'audio|video|assets|marcas|input';

function listarArquivos(dir, saida = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '__pycache__') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) listarArquivos(full, saida);
    else if (EXTENSOES.test(e.name)) saida.push(full);
  }
  return saida;
}

function semComentarios(texto) {
  return texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
}

/** Acha as referências de mídia (relativas a public/) escritas nos arquivos de `srcDir`. */
export function findAssetRefs(srcDir) {
  const literais = new Set();
  const dinamicos = new Set();
  for (const arquivo of listarArquivos(srcDir)) {
    const texto = arquivo.endsWith('.json') ? fs.readFileSync(arquivo, 'utf8') : semComentarios(fs.readFileSync(arquivo, 'utf8'));
    for (const m of texto.matchAll(/staticFile\(\s*(['"`])([^'"`$]+)\1/g)) literais.add(m[2]);
    for (const m of texto.matchAll(new RegExp(`['"\`]((?:${PASTAS_DE_MIDIA})/[^'"\`$\\s]+\\.[A-Za-z0-9]+)['"\`]`, 'g'))) literais.add(m[1]);
    for (const m of texto.matchAll(/staticFile\(\s*`([^`$]*)\$\{/g)) dinamicos.add(m[1]);
  }
  return { literais: [...literais].sort(), dinamicos: [...dinamicos].sort() };
}

/** Referências literais cujo arquivo não existe em `publicDir`. */
export function findMissing(srcDir, publicDir) {
  return findAssetRefs(srcDir).literais.filter((ref) => !fs.existsSync(path.join(publicDir, ...ref.split('/'))));
}

function main() {
  const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const srcDir = path.join(raiz, 'src');
  const publicDir = path.join(raiz, 'public');
  const { literais, dinamicos } = findAssetRefs(srcDir);
  const faltando = findMissing(srcDir, publicDir);
  console.log(`Referências de mídia no código: ${literais.length} literais, ${dinamicos.length} dinâmicas.`);
  for (const d of dinamicos) console.log(`  (dinâmica) public/${d}...  -> confira a pasta`);
  if (faltando.length === 0) {
    console.log('Todos os arquivos referenciados existem em public/.');
    return;
  }
  console.log(`Faltam ${faltando.length} arquivo(s) em public/:`);
  for (const f of faltando) console.log(`  - ${f}`);
  if (!process.argv.includes('--warn')) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
