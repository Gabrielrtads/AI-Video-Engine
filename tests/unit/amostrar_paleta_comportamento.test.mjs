/**
 * Comportamento do amostrador de paleta (Python), medido de verdade em vez de procurar texto no código:
 * um espião em subprocess.run registra o que o script manda para o ffmpeg/ffprobe.
 * Substitui testes antigos que só conferiam se o arquivo .py continha strings como "'-vframes'".
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { makeFixtureImage } from '../e2e/helpers.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = path.join(root, 'scripts', 'references', 'amostrar_paleta.py');
const python = process.env.PYTHON || process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');

// Roda o script com subprocess.run espiado. `modo`: 'normal' | 'truncar' (corta os bytes brutos do ffmpeg).
const HARNESS = `
import json, runpy, subprocess, sys
modo, script, imagem = sys.argv[1], sys.argv[2], sys.argv[3]
chamadas = []
real = subprocess.run
def espiao(cmd, *a, **k):
    chamadas.append({"cmd": [str(c) for c in cmd], "timeout": k.get("timeout")})
    r = real(cmd, *a, **k)
    if modo == "truncar" and "rawvideo" in [str(c) for c in cmd]:
        return subprocess.CompletedProcess(r.args, r.returncode, r.stdout[: len(r.stdout) // 2], r.stderr)
    return r
subprocess.run = espiao
sys.argv = [script, imagem, "--json"]
codigo = 0
try:
    runpy.run_path(script, run_name="__main__")
except SystemExit as e:
    codigo = e.code or 0
except Exception as e:
    codigo = 1
    print("ERRO:" + type(e).__name__ + ":" + str(e), file=sys.stderr)
sys.stderr.write("CHAMADAS=" + json.dumps(chamadas) + chr(10))
sys.exit(codigo)
`;

function rodar(script, imagem, modo = 'normal', env = {}) {
  const r = spawnSync(python, ['-c', HARNESS, modo, script, imagem], { encoding: 'utf8', env: { ...process.env, ...env } });
  const linha = (r.stderr || '').split('\n').find((l) => l.startsWith('CHAMADAS='));
  return { ...r, chamadas: linha ? JSON.parse(linha.slice('CHAMADAS='.length)) : [] };
}

const comRaw = (chamadas) => chamadas.find((c) => c.cmd.includes('rawvideo'));

test('o ffmpeg lê UM quadro, em rgb24, com limite de tempo (proteção de RAM e de processo pendurado)', () => {
  const fx = makeFixtureImage('png');
  try {
    const r = rodar(SCRIPT, fx.file);
    assert.equal(r.status, 0, r.stderr);
    const raw = comRaw(r.chamadas);
    assert.ok(raw, 'o script deveria chamar o ffmpeg com saída rawvideo');
    const i = raw.cmd.indexOf('-vframes');
    assert.ok(i >= 0 && raw.cmd[i + 1] === '1', `faltou -vframes 1: ${raw.cmd.join(' ')}`);
    assert.equal(raw.cmd[raw.cmd.indexOf('-pix_fmt') + 1], 'rgb24');
    assert.ok(raw.timeout && raw.timeout <= 15, `ffmpeg sem timeout adequado (${raw.timeout})`);
    const sonda = r.chamadas.find((c) => path.basename(c.cmd[0]).startsWith('ffprobe'));
    assert.ok(sonda && sonda.timeout && sonda.timeout <= 10, 'ffprobe precisa de timeout <= 10 s');
  } finally {
    fs.rmSync(fx.dir, { recursive: true, force: true });
  }
});

test('o espião pega a regressão: sem -vframes 1 o teste reprova', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-mut-'));
  const fx = makeFixtureImage('png');
  try {
    const original = fs.readFileSync(SCRIPT, 'utf8');
    assert.ok(/'-vframes'/.test(original), 'a mutação precisa de algo para remover');
    const mutado = path.join(dir, 'amostrar_mutado.py');
    fs.writeFileSync(mutado, original.replace("'-vframes', '1',", ''));
    const r = rodar(mutado, fx.file);
    const raw = comRaw(r.chamadas);
    assert.ok(!raw || raw.cmd.indexOf('-vframes') < 0, 'a mutação deveria ter removido -vframes');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(fx.dir, { recursive: true, force: true });
  }
});

test('bytes truncados do ffmpeg viram erro, não uma paleta inventada', () => {
  const fx = makeFixtureImage('png');
  try {
    const r = rodar(SCRIPT, fx.file, 'truncar');
    assert.notEqual(r.status, 0, 'deveria falhar com bytes insuficientes');
    assert.match(r.stderr, /Bytes insuficientes|insuficientes/i);
  } finally {
    fs.rmSync(fx.dir, { recursive: true, force: true });
  }
});

test('a paleta é determinística (mesma imagem, mesmo resultado)', () => {
  const fx = makeFixtureImage('jpg');
  try {
    const execucoes = [0, 1].map(() => spawnSync(python, [SCRIPT, fx.file, '--json'], { encoding: 'utf8' }));
    for (const e of execucoes) assert.equal(e.status, 0, e.stderr);
    assert.equal(execucoes[0].stdout, execucoes[1].stdout);
    assert.ok(JSON.parse(execucoes[0].stdout).dominant_palette.length >= 3);
  } finally {
    fs.rmSync(fx.dir, { recursive: true, force: true });
  }
});

test('a saída em texto não quebra com console cp1252 do Windows (emojis)', () => {
  const fx = makeFixtureImage('png');
  try {
    const r = spawnSync(python, [SCRIPT, fx.file], { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'cp1252' } });
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /Análise Cromática/);
  } finally {
    fs.rmSync(fx.dir, { recursive: true, force: true });
  }
});
