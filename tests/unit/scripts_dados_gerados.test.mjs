/**
 * Dados gerados (palavras do Whisper, timelines) nunca podem ter como destino padrão um arquivo versionado:
 * src/data/words.json é importado por CliCrossReviewReel, GenHqReel e AppleCameraRig, e os scripts o
 * sobrescreviam a cada execução. Gerados vão para out/temp.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ler = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const semComentarios = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');

const PADRAO_PROIBIDO = /src\/data\/words\.json|'src',\s*'data',\s*'words\.json'/;

for (const arquivo of ['scripts/narrar.mjs', 'scripts/transcrever-palavras.mjs', 'scripts/produzir_video_bancada.mjs', 'scripts/pipeline_script_to_video.mjs']) {
  test(`${arquivo} não tem src/data/words.json como destino`, () => {
    assert.doesNotMatch(semComentarios(ler(arquivo)), PADRAO_PROIBIDO);
  });
}

test('o script "palavras" do package.json grava em out/temp', () => {
  const cmd = JSON.parse(ler('package.json')).scripts.palavras;
  assert.doesNotMatch(cmd, PADRAO_PROIBIDO);
  assert.match(cmd, /out\/temp\/words\.json/);
});
