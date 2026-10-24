/**
 * Legenda e áudio precisam andar juntos: words_thalita_cleaned.json foi medido em
 * narracao_thalita.mp3 (28,8 s); narracao_thalita_fast.mp3 dura 26,4 s. Usar as palavras
 * do áudio normal no áudio rápido atrasava a legenda até 2,5 s (medido com Whisper, 23/10/2026).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ler = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const DURACAO_NORMAL = 28.8;
const DURACAO_RAPIDA = 26.4;

test('words_thalita_fast.json é words_thalita_cleaned.json na velocidade do áudio rápido', () => {
  const normal = ler('src/data/words_thalita_cleaned.json');
  const rapido = ler('src/data/words_thalita_fast.json');
  assert.equal(rapido.length, normal.length);
  const k = DURACAO_RAPIDA / DURACAO_NORMAL;
  rapido.forEach((w, i) => {
    assert.equal(w.text, normal[i].text);
    assert.ok(Math.abs(w.start - normal[i].start * k) <= 0.011, `start da palavra ${i} fora da escala`);
    assert.ok(Math.abs(w.end - normal[i].end * k) <= 0.011, `end da palavra ${i} fora da escala`);
  });
  assert.ok(rapido.at(-1).end <= DURACAO_RAPIDA, 'a última palavra precisa terminar antes do fim do áudio rápido');
});

test('FullBleedShowcase escolhe as palavras pelo áudio de narração', () => {
  const src = fs.readFileSync(path.join(root, 'src', 'FullBleedShowcase.tsx'), 'utf8');
  assert.match(src, /words_thalita_fast\.json/);
  assert.match(src, /palavrasDoAudio\(audioNarracao\)/);
  assert.doesNotMatch(src, /RAW_WORDS\.find\(/, 'activeWord não pode usar só as palavras do áudio normal');
});
