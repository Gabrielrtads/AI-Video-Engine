/**
 * `vibe doctor`: diz o que falta instalar antes de o primeiro vídeo falhar no meio.
 * As funções recebem um "executor" falso nos testes unitários e rodam de verdade no teste de integração.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { extrairVersao, versaoMinimaOk, verificarPrograma, avaliarEncoders, rodarDoctor } from '../../scripts/doctor.mjs';

const ok = (stdout, stderr = '') => ({ status: 0, stdout, stderr });
const falha = (stderr = 'not found') => ({ status: 1, stdout: '', stderr, error: new Error('ENOENT') });

test('extrairVersao lê a versão de saídas típicas', () => {
  assert.equal(extrairVersao('v24.19.0'), '24.19.0');
  assert.equal(extrairVersao('ffmpeg version 8.1.1-essentials_build-www.gyan.dev Copyright'), '8.1.1');
  assert.equal(extrairVersao('Python 3.13.5'), '3.13.5');
  assert.equal(extrairVersao('sem numero'), null);
});

test('versaoMinimaOk compara pela versão principal', () => {
  assert.equal(versaoMinimaOk('24.19.0', 24), true);
  assert.equal(versaoMinimaOk('22.1.0', 24), false);
  assert.equal(versaoMinimaOk(null, 24), false);
  assert.equal(versaoMinimaOk('3.9.1', 3), true);
});

test('verificarPrograma: instalado e na versão certa passa', () => {
  const r = verificarPrograma({ id: 'node', nome: 'Node.js', comando: 'node', args: ['--version'], minimaPrincipal: 24, corrigir: 'Instale o Node 24' }, () => ok('v24.19.0'));
  assert.equal(r.ok, true);
  assert.match(r.mensagem, /24\.19\.0/);
});

test('verificarPrograma: versão antiga reprova e diz como corrigir', () => {
  const r = verificarPrograma({ id: 'node', nome: 'Node.js', comando: 'node', args: ['--version'], minimaPrincipal: 24, corrigir: 'Instale o Node 24' }, () => ok('v20.1.0'));
  assert.equal(r.ok, false);
  assert.equal(r.nivel, 'erro');
  assert.match(r.mensagem, /20\.1\.0/);
  assert.equal(r.corrigir, 'Instale o Node 24');
});

test('verificarPrograma: programa ausente reprova', () => {
  const r = verificarPrograma({ id: 'ffmpeg', nome: 'FFmpeg', comando: 'ffmpeg', args: ['-version'], corrigir: 'Instale o FFmpeg' }, () => falha());
  assert.equal(r.ok, false);
  assert.match(r.mensagem, /não encontrado/i);
});

test('verificarPrograma: item opcional vira aviso, não erro', () => {
  const r = verificarPrograma({ id: 'x', nome: 'X', comando: 'x', args: ['-v'], opcional: true, corrigir: 'faça isso' }, () => falha());
  assert.equal(r.ok, false);
  assert.equal(r.nivel, 'aviso');
});

test('avaliarEncoders exige libx264 e libmp3lame', () => {
  const completo = ' V....D libx264              libx264 H.264\n A....D libmp3lame           libmp3lame MP3';
  assert.deepEqual(avaliarEncoders(completo), { ok: true, faltando: [] });
  assert.deepEqual(avaliarEncoders(' V....D libx264 H.264'), { ok: false, faltando: ['libmp3lame'] });
});

function executorTudoOk(comando, args) {
  const linha = `${comando} ${args.join(' ')}`;
  if (comando === 'node') return ok('v24.19.0');
  if (comando === 'pnpm') return ok('11.22.0');
  if (comando === 'ffmpeg' && args.includes('-encoders')) return ok(' V....D libx264 H.264\n A....D libmp3lame MP3');
  if (comando === 'ffmpeg') return ok('ffmpeg version 8.1.1');
  if (comando === 'ffprobe') return ok('ffprobe version 8.1.1');
  if (/^python/.test(comando) && args[0] === '--version') return ok('Python 3.13.5');
  if (/^python/.test(comando) && args[0] === '-c') return ok('ok');
  throw new Error(`comando inesperado: ${linha}`);
}

test('rodarDoctor: ambiente completo aprova', () => {
  const r = rodarDoctor({ executar: executorTudoOk, raiz: process.cwd(), plataforma: 'linux' });
  assert.equal(r.ok, true, JSON.stringify(r.checagens.filter((c) => !c.ok && c.nivel === 'erro')));
});

test('rodarDoctor: sem edge-tts reprova com o comando pip exato', () => {
  const executor = (comando, args) => {
    if (/^python/.test(comando) && args[0] === '-c' && /edge_tts/.test(args[1])) return { status: 1, stdout: '', stderr: "ModuleNotFoundError: No module named 'edge_tts'" };
    return executorTudoOk(comando, args);
  };
  const r = rodarDoctor({ executar: executor, raiz: process.cwd(), plataforma: 'linux' });
  assert.equal(r.ok, false);
  const c = r.checagens.find((x) => x.id === 'python-pacotes');
  assert.ok(c && !c.ok);
  assert.match(c.corrigir, /pip install -r requirements\.txt/);
});

test('integração: o doctor roda de verdade e devolve checagens estruturadas', () => {
  const r = rodarDoctor();
  assert.ok(r.checagens.length >= 8);
  for (const c of r.checagens) {
    assert.equal(typeof c.id, 'string');
    assert.equal(typeof c.ok, 'boolean');
    assert.ok(['erro', 'aviso'].includes(c.nivel));
    assert.ok(c.mensagem.length > 3);
  }
  assert.ok(r.checagens.find((c) => c.id === 'node' && c.ok), 'este próprio teste roda em Node >= 24');
});

test('doctor manda o agente só para comandos do caminho único (pnpm vibe ...), nunca para scripts soltos', async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-doctor-'));
  try {
    const falso = () => ({ status: 1, stdout: '', stderr: 'não existe' });
    const r = rodarDoctor({ executar: falso, raiz });
    const sugestoes = r.checagens.map((c) => c.corrigir).filter(Boolean);
    const pastas = r.checagens.find((c) => c.id === 'pastas');
    assert.equal(pastas.ok, false, 'sem pastas na raiz de teste');
    assert.match(pastas.corrigir, /pnpm vibe pastas/);
    for (const s of sugestoes) assert.ok(!/pnpm setup:|node scripts\//.test(s), `sugestão fora do caminho único: ${s}`);
  } finally {
    fs.rmSync(raiz, { recursive: true, force: true });
  }
});
