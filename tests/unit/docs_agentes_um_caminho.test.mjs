/**
 * O agente de um desconhecido lê SKILL.md e AGENTS.md e nada mais. Os dois precisam levar ao MESMO caminho
 * (`pnpm vibe ...`) e não podem derivar do código: cada comando do `vibe` aparece no SKILL.md, nenhum comando
 * citado no SKILL.md deixou de existir, e o caminho legado (motor interativo, scripts soltos) não é o principal.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { COMANDOS } from '../../scripts/vibe.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ler = (f) => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const SKILL = ler('SKILL.md');
const AGENTS = ler('AGENTS.md');

test('SKILL.md documenta todos os comandos do vibe', () => {
  for (const nome of Object.keys(COMANDOS)) {
    assert.ok(SKILL.includes(`pnpm vibe ${nome}`), `SKILL.md não mostra "pnpm vibe ${nome}"`);
  }
});

test('todo "pnpm vibe <x>" citado nos docs de agente existe de verdade', () => {
  for (const [arquivo, texto] of [['SKILL.md', SKILL], ['AGENTS.md', AGENTS]]) {
    for (const m of texto.matchAll(/pnpm vibe ([a-z][a-z-]*)/g)) {
      assert.ok(m[1] in COMANDOS, `${arquivo} cita "pnpm vibe ${m[1]}", que não existe`);
    }
  }
});

test('o primeiro passo é o doctor e o portão de entrega é o verificar (SKILL.md)', () => {
  assert.ok(SKILL.indexOf('pnpm vibe doctor') < SKILL.indexOf('pnpm vibe roteiro'), 'o doctor tem de vir antes de produzir');
  assert.match(SKILL, /nunca diga que está pronto|never say (it is )?done|do not say (it is )?done/i);
  assert.match(SKILL, /folha|contact sheet/i);
});

test('SKILL.md proíbe inventar: nada de TSX/timeline à mão nem arquivo ou componente inventado', () => {
  assert.match(SKILL, /do not (write|hand-write)[^.]*(TSX|timeline)/i);
  assert.match(SKILL, /pnpm vibe componentes/);
});

test('o motor interativo e scripts soltos não são mais o caminho de produção principal', () => {
  const principal = SKILL.split(/\n## /).find((s) => /^(Quick path|Fast path|Which command)/i.test(s)) ?? '';
  assert.ok(principal.length > 0, 'faltou a seção do caminho rápido');
  assert.ok(!/studio_engine/.test(principal), 'studio_engine é legado e não pode aparecer no caminho rápido');
  assert.match(AGENTS, /SKILL\.md/, 'AGENTS.md precisa mandar o agente para o SKILL.md');
  assert.ok(!/node scripts\/studio_engine\.mjs/.test(AGENTS.split('Ferramentas')[0] ?? ''), 'AGENTS.md abre mandando para o motor interativo');
});

test('os docs de agente cabem no orçamento de leitura (um modelo pequeno lê tudo)', () => {
  assert.ok(SKILL.length < 9000, `SKILL.md com ${SKILL.length} caracteres`);
  assert.ok(AGENTS.length < 7000, `AGENTS.md com ${AGENTS.length} caracteres`);
});

test('carrossel: o protocolo de perguntas continua no SKILL.md (quantidade, uniforme ou individual, estático ou animado)', () => {
  assert.match(SKILL, /uniform/i);
  assert.match(SKILL, /static|estatic/i);
  assert.match(SKILL, /how many slides|quantos slides/i);
});

test('todo "pnpm <script>" e "node scripts/<arquivo>" citado nos docs de agente existe (nada inventado)', () => {
  const pacote = JSON.parse(ler('package.json'));
  const pnpmNativos = new Set(['install', 'exec', 'run', 'add', 'dlx', 'test', 'vibe']);
  for (const [arquivo, texto] of [['SKILL.md', SKILL], ['AGENTS.md', AGENTS]]) {
    for (const m of texto.matchAll(/pnpm (?!vibe\b)([a-z][a-z0-9:-]*)/g)) {
      if (pnpmNativos.has(m[1])) continue;
      assert.ok(m[1] in pacote.scripts, `${arquivo} cita "pnpm ${m[1]}", que não é um script do package.json`);
    }
    for (const m of texto.matchAll(/node (scripts\/[A-Za-z0-9_./-]*[A-Za-z0-9_])/g)) {
      assert.ok(fs.existsSync(path.join(RAIZ, m[1])), `${arquivo} cita ${m[1]}, que não existe`);
    }
  }
});
