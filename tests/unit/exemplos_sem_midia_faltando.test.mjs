/**
 * Todo exemplo versionado precisa renderizar num clone limpo: qualquer arquivo de mídia que ele cita
 * (áudio, vídeo, imagem) tem de existir em public/. O showcase pedia "audio/musica/trilha_luxo.mp3", que não
 * é versionado (direitos autorais), e quebrava o primeiro render de quem copiasse o exemplo.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateTimelineSchema } from '../../src/timeline/compileTimeline.ts';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIR = path.join(RAIZ, 'src', 'timeline', 'exemplos');

for (const arquivo of fs.readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  test(`exemplo ${arquivo}: timeline válida e sem mídia que falta no clone limpo`, () => {
    const bruto = JSON.parse(fs.readFileSync(path.join(DIR, arquivo), 'utf8'));
    const timeline = bruto.timeline ?? bruto;
    assert.equal(validateTimelineSchema(timeline).valid, true);
    const faltando = timeline.clips
      .filter((c) => ['video', 'audio', 'image'].includes(c.kind) && c.src && !/^https?:\/\//.test(c.src))
      .filter((c) => !fs.existsSync(path.join(RAIZ, 'public', c.src)))
      .map((c) => c.src);
    assert.deepEqual(faltando, [], `mídia citada e não versionada: ${faltando.join(', ')}`);
  });
}
