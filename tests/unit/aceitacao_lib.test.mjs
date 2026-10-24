/**
 * Harness de aceitação: o pedido em linguagem natural vai para um agente de IA num clone limpo e o resultado é
 * julgado só por portões medidos (nunca pelo relato do agente). Aqui: a parte pura (argumentos, portões, placar)
 * com artefatos sintéticos conhecidos, bons e ruins.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { CENARIOS, montarArgsAgy, avaliarCarrossel, avaliarMotion, placar, detectarCota, lerBrief } from '../../scripts/aceitacao_lib.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'vds-acc-'));
const ff = (...args) => assert.equal(spawnSync('ffmpeg', ['-y', '-v', 'error', ...args]).status, 0);

test('os cenários têm brief em linguagem natural que existe no repositório e não ensina o comando', () => {
  assert.deepEqual(Object.keys(CENARIOS).sort(), ['carrossel', 'motion', 'roteiro']);
  for (const id of Object.keys(CENARIOS)) {
    const brief = lerBrief(id);
    assert.ok(brief.length > 60, id);
    assert.ok(!/pnpm|vibe |node scripts/i.test(brief), `${id}: o brief não pode dar o comando (o agente precisa achar pelo SKILL.md)`);
  }
});

test('montarArgsAgy: modo não interativo, modelo, tempo limite e saída JSON', () => {
  const a = montarArgsAgy({ modelo: 'gemini-3.8-flash-high', prompt: 'faça X' });
  assert.deepEqual(a.slice(0, 2), ['--print', 'faça X']);
  assert.ok(a.includes('--model') && a[a.indexOf('--model') + 1] === 'gemini-3.8-flash-high');
  assert.ok(a.includes('--mode') && a[a.indexOf('--mode') + 1] === 'accept-edits');
  assert.ok(a.includes('--output-format') && a[a.indexOf('--output-format') + 1] === 'json');
  assert.ok(a.includes('--print-timeout'));
  assert.ok(!a.includes('--dangerously-skip-permissions'), 'sem pular permissões');
});

test('detectarCota reconhece limite de uso na saída do agente', () => {
  assert.equal(detectarCota('Error: quota exceeded, resets in 4h').bloqueado, true);
  assert.equal(detectarCota('RESOURCE_EXHAUSTED: rate limit').bloqueado, true);
  assert.equal(detectarCota('{"status":"SUCCESS","response":"pronto"}').bloqueado, false);
});

test('portão do carrossel: 5 PNG 1080x1350 diferentes e não vazios passam; faltando slide ou tamanho errado reprova', () => {
  const dir = tmp();
  try {
    const pasta = path.join(dir, 'out', 'carrosseis', 'x');
    fs.mkdirSync(pasta, { recursive: true });
    for (let i = 1; i <= 5; i++) ff('-f', 'lavfi', '-i', `testsrc=size=1080x1350:rate=1:duration=1,hue=h=${i * 40}`, '-vframes', '1', path.join(pasta, `slide-0${i}.png`));
    fs.writeFileSync(path.join(dir, 'spec.json'), JSON.stringify({ nome: 'x', estilo: 'uniforme', destino: 'estatico', autor: '@barbeariaflow', slides: Array.from({ length: 5 }, () => ({ categoria: 'AGENDA', titulo: ['SEU CAIXA'] })) }));
    const ok = avaliarCarrossel(dir, { slides: 5 });
    assert.equal(ok.ok, true, JSON.stringify(ok.checagens.filter((c) => !c.ok)));
    fs.rmSync(path.join(pasta, 'slide-05.png'));
    assert.equal(avaliarCarrossel(dir, { slides: 5 }).ok, false, 'faltando um slide');
    ff('-f', 'lavfi', '-i', 'testsrc=size=1080x1080:rate=1:duration=1', '-vframes', '1', path.join(pasta, 'slide-05.png'));
    const torto = avaliarCarrossel(dir, { slides: 5 });
    assert.equal(torto.ok, false);
    assert.ok(torto.checagens.some((c) => c.id === 'dimensoes' && !c.ok));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('portão do motion: vídeo mudo 9:16 com movimento e os textos do pedido na timeline passa; sem os textos reprova', () => {
  const dir = tmp();
  try {
    fs.mkdirSync(path.join(dir, 'out', 'videos'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'out', 'temp'), { recursive: true });
    ff('-f', 'lavfi', '-i', 'testsrc=size=1080x1920:rate=30:duration=3', '-pix_fmt', 'yuv420p', path.join(dir, 'out', 'videos', 'a.mp4'));
    const textos = ['Barbearia Flow', 'Corte, barba e assinatura'];
    fs.writeFileSync(path.join(dir, 'out', 'temp', 'timeline_motion_x.json'), JSON.stringify({ timeline: { clips: [{ props: { title: textos[0], subtitle: textos[1] } }] } }));
    const r = avaliarMotion(dir, { textos });
    assert.equal(r.ok, true, JSON.stringify(r.checagens.filter((c) => !c.ok)));
    const r2 = avaliarMotion(dir, { textos: ['Texto que o agente inventou'] });
    assert.equal(r2.ok, false);
    assert.ok(r2.checagens.some((c) => c.id === 'conteudo' && !c.ok));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('portão sem nenhuma saída: reprova com a razão em vez de quebrar', () => {
  const dir = tmp();
  try {
    assert.equal(avaliarMotion(dir, { textos: ['x'] }).ok, false);
    assert.equal(avaliarCarrossel(dir, { slides: 5 }).ok, false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('placar: passou/falhou por modelo e cenário, com taxa', () => {
  const p = placar([
    { modelo: 'a', cenario: 'motion', ok: true },
    { modelo: 'a', cenario: 'carrossel', ok: false },
    { modelo: 'b', cenario: 'motion', ok: true },
  ]);
  assert.equal(p.a.passou, 1);
  assert.equal(p.a.total, 2);
  assert.equal(p.b.taxa, 1);
});
