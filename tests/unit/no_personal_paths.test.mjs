/**
 * Trava para repositório público: nenhum caminho pessoal (usuário do Windows,
 * Google Drive do dono) nem shell com string interpolada em scripts/ e src/.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('../../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const CODE_EXT = /\.(mjs|js|ts|tsx|py)$/;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '__pycache__') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (CODE_EXT.test(entry.name)) out.push(full);
  }
  return out;
}

const files = ['scripts', 'src'].flatMap((d) => walk(path.join(root, d)));

test('nenhum caminho pessoal (C:/Users/..., G:\\Meu Drive) no código versionado', () => {
  const offenders = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    if (/[A-Za-z]:[\\/]+Users[\\/]/i.test(text) || /G:\\\\?Meu Drive/i.test(text)) {
      offenders.push(path.relative(root, file));
    }
  }
  assert.deepEqual(offenders, [], `caminhos pessoais em: ${offenders.join(', ')}`);
});

test('pipeline_script_to_video não executa ffprobe por string de shell', () => {
  const src = fs.readFileSync(path.join(root, 'scripts', 'pipeline_script_to_video.mjs'), 'utf8');
  assert.ok(!/execSync\(\s*ffprobeCmd/.test(src), 'use execFileSync com array de argumentos');
  assert.ok(!/shell:\s*true/.test(src), 'não use shell:true ao chamar o Remotion');
});

test('espelhamento de saída é opt-in (sem pasta fixa do dono)', () => {
  const src = fs.readFileSync(path.join(root, 'scripts', 'pipeline_script_to_video.mjs'), 'utf8');
  assert.match(src, /VIBE_SYNC_DIR/, 'pasta de espelhamento deve vir de VIBE_SYNC_DIR ou --sync-dir');
  assert.match(src, /syncDir\s*=\s*(?:options\.)?(?:null|undefined|process\.env)/, 'sync desligado por padrão');
});

test('pipeline 1-click grava arquivos gerados em out/temp, nunca em src/data (que tem dados versionados)', () => {
  const src = fs.readFileSync(path.join(root, 'scripts', 'pipeline_script_to_video.mjs'), 'utf8');
  assert.ok(!/src\/data\/(words|timeline_1click)\.json/.test(src), 'não grave words.json/timeline_1click.json em src/data');
  assert.match(src, /out\/temp/);
});
