/**
 * Layout de mídia previsível: o código só pode referenciar arquivos de public/ por pastas
 * declaradas em PASTAS (ou pelos poucos arquivos de trabalho fixos). Sem nomes soltos na raiz,
 * que faziam agentes inventar arquivos que não existem.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { PASTAS, ARQUIVOS_DE_TRABALHO } from '../../scripts/preparar_pastas.mjs';
import { findAssetRefs, findMissing } from '../../scripts/check_assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const srcDir = path.join(root, 'src');

const todas = PASTAS.filter((p) => p.caminho.startsWith('public/')).map((p) => p.caminho.slice('public/'.length));
// Pasta que tem subpastas declaradas (ex.: audio/) é só contêiner: arquivo solto nela é bagunça.
const pastasPublic = todas.filter((p) => !todas.some((outra) => outra.startsWith(`${p}/`)));
const permitido = (ref) =>
  ARQUIVOS_DE_TRABALHO.includes(ref) || pastasPublic.some((pasta) => ref === pasta || ref.startsWith(`${pasta}/`));

test('toda referência literal de mídia em src/ usa uma pasta declarada', () => {
  const { literais } = findAssetRefs(srcDir);
  assert.ok(literais.length >= 15, "o varredor deveria achar as ~19 mídias distintas que o código chama");
  const fora = literais.filter((ref) => !permitido(ref));
  assert.deepEqual(fora, [], `referências fora do layout (mova para audio/sfx, audio/musica, audio/locucao ou video): ${fora.join(', ')}`);
});

test('referências dinâmicas (template com ${}) também começam em pasta declarada', () => {
  const { dinamicos } = findAssetRefs(srcDir);
  const fora = dinamicos.filter((prefixo) => !permitido(prefixo.replace(/\/[^/]*$/, '')));
  assert.deepEqual(fora, [], `prefixos dinâmicos fora do layout: ${fora.join(', ')}`);
});

test('findAssetRefs ignora comentários e acha literais, ternários e props', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-assets-'));
  try {
    fs.writeFileSync(
      path.join(dir, 'a.tsx'),
      [
        "// staticFile('audio/sfx/comentario.mp3')",
        "const a = staticFile('audio/sfx/click.mp3');",
        "const b = cond ? 'audio/musica/x.mp3' : 'audio/musica/y.mp3';",
        '<Video videoSrc="video/take.webm" />',
        'const c = staticFile(`video/frames/f_${n}.jpg`);',
      ].join('\n'),
    );
    const { literais, dinamicos } = findAssetRefs(dir);
    assert.deepEqual(literais.sort(), ['audio/musica/x.mp3', 'audio/musica/y.mp3', 'audio/sfx/click.mp3', 'video/take.webm']);
    assert.deepEqual(dinamicos, ['video/frames/f_']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('findMissing lista só o que não existe em public/', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-assets-'));
  try {
    fs.mkdirSync(path.join(dir, 'src'));
    fs.mkdirSync(path.join(dir, 'public', 'audio', 'sfx'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'src', 'a.tsx'), "staticFile('audio/sfx/ok.mp3'); staticFile('audio/sfx/falta.mp3');");
    fs.writeFileSync(path.join(dir, 'public', 'audio', 'sfx', 'ok.mp3'), 'x');
    assert.deepEqual(findMissing(path.join(dir, 'src'), path.join(dir, 'public')), ['audio/sfx/falta.mp3']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
