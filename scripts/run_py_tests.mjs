#!/usr/bin/env node
/**
 * Roda a suíte Python (unittest) com o interpretador certo por plataforma.
 * Mesma regra do pipeline_referencia.mjs: PYTHON/PYTHON_PATH, senão `python`
 * no Windows e `python3` nos demais sistemas.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const python =
  process.env.PYTHON || process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');

const result = spawnSync(python, ['-m', 'unittest', 'discover', '-s', 'tests/python'], {
  cwd: root,
  stdio: 'inherit',
});
process.exit(result.status ?? 1);
