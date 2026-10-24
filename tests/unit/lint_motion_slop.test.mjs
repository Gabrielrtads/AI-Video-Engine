/**
 * A trava de volume do linter anti-slop precisa funcionar no código real (JSX), não só em
 * objetos `{ volume: N }`. Medição (23/10/2026): os efeitos de public/audio/sfx têm pico
 * entre -0,5 e -3,8 dBFS; a 0,85 o efeito fica ~6 dB acima da média da narração.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lint = path.join(root, 'scripts', 'lint-motion-slop.mjs');

function rodar(codigo) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-lint-'));
  try {
    const arquivo = path.join(dir, 'Cena.tsx');
    fs.writeFileSync(arquivo, codigo);
    const r = spawnSync(process.execPath, [lint, arquivo], { encoding: 'utf8' });
    return `${r.stdout}${r.stderr}`;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const cena = (audio) => `import {Audio, staticFile, spring} from 'remotion';\nexport const C = () => (<>${audio}</>);`;

test('efeito em JSX acima de 0,45 é flagrado', () => {
  const saida = rodar(cena("<Audio src={staticFile('audio/sfx/hud_boom.mp3')} volume={0.85} />"));
  assert.match(saida, /Áudio Estourado/);
  assert.match(saida, /hud_boom\.mp3/);
});

test('efeito em JSX com volume antes do src também é flagrado', () => {
  const saida = rodar(cena("<Audio volume={0.9} src={staticFile('audio/sfx/whoosh_zoom.mp3')} />"));
  assert.match(saida, /Áudio Estourado/);
});

test('efeito até 0,45 passa', () => {
  const saida = rodar(cena("<Audio src={staticFile('audio/sfx/click_haptic.mp3')} volume={0.45} />"));
  assert.doesNotMatch(saida, /Áudio Estourado/);
  assert.match(saida, /Audio Pass/);
});

test('a regra vale só para efeitos: narração e trilha não entram nela', () => {
  const saida = rodar(
    cena(
      "<Audio src={staticFile('audio/locucao/narracao_thalita.mp3')} volume={1} /><Audio src={staticFile('audio/musica/trilha_lofi.mp3')} volume={0.9} />",
    ),
  );
  assert.doesNotMatch(saida, /Áudio Estourado/);
});

test('o objeto { volume: N } continua sendo flagrado', () => {
  assert.match(rodar('const config = { volume: 0.85 };'), /Áudio Estourado/);
});

test('muitos efeitos altos contam como um único alerta (o resumo lista todos)', () => {
  const muitos = Array.from({ length: 6 }, () => "<Audio src={staticFile('audio/sfx/hud_boom.mp3')} volume={0.9} />").join('');
  const saida = rodar(cena(muitos));
  assert.match(saida, /6 efeito\(s\) acima de 0,45/);
  assert.equal(saida.split('Áudio Estourado').length - 1, 1, 'só um alerta de áudio, mesmo com 6 efeitos');
});

test('toda composição de src/ que usa efeitos respeita o limite de 0,45', () => {
  const arquivos = fs
    .readdirSync(path.join(root, 'src'))
    .filter((f) => f.endsWith('.tsx'))
    .map((f) => path.join(root, 'src', f))
    .filter((f) => fs.readFileSync(f, 'utf8').includes('audio/sfx/'));
  assert.ok(arquivos.length >= 3, 'deveria haver várias composições com efeitos');
  for (const arquivo of arquivos) {
    const r = spawnSync(process.execPath, [lint, arquivo], { encoding: 'utf8' });
    const saida = `${r.stdout}${r.stderr}`;
    assert.doesNotMatch(saida, /Áudio Estourado/, `${path.basename(arquivo)} tem efeito acima de 0,45:\n${saida}`);
  }
});
