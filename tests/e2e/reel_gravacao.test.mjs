/**
 * Reel com a gravação do usuário, de ponta a ponta com ffmpeg e Remotion de verdade:
 * clipe sintético (tom, 2 s de silêncio, tom, imagem em movimento) -> corta o silêncio -> legenda -> render
 * -> masteriza -> verifica. Roda sem Whisper (usa o estimador com o roteiro) para ser determinístico.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { produzirReelGravacao } from '../../scripts/reel_gravacao.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function duracao(arquivo) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', arquivo], { encoding: 'utf8' });
  return parseFloat(r.stdout);
}

test('reel com gravação: corta o silêncio, legenda, masteriza e passa no verificador', { timeout: 280000 }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-reel-'));
  try {
    const entrada = path.join(dir, 'gravacao.mp4');
    const saida = path.join(dir, 'reel.mp4');
    const gerar = spawnSync(
      'ffmpeg',
      ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=540x960:r=30:d=6', '-f', 'lavfi', '-i', "aevalsrc='if(between(t,2,4),0,0.4*sin(2*PI*440*t))':d=6:s=48000", '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', entrada],
      { encoding: 'utf8' },
    );
    assert.equal(gerar.status, 0, gerar.stderr);

    const r = await produzirReelGravacao({ entrada, saida, roteiro: 'Fala pessoal. Bora começar agora mesmo.', semWhisper: true, formato: '9:16', silencioso: true });

    assert.ok(fs.existsSync(saida), 'o reel deveria ter sido gerado');
    assert.ok(duracao(saida) < duracao(entrada) - 1.0, `o reel (${duracao(saida)}s) deveria ser mais curto que a gravação (${duracao(entrada)}s)`);
    assert.ok(r.removidoSegundos > 1.4, `removeu só ${r.removidoSegundos}s de silêncio`);
    assert.equal(r.verificacao.ok, true, JSON.stringify(r.verificacao.checagens.filter((c) => !c.ok)));
    assert.equal(r.verificacao.medidas.largura, 1080);
    assert.equal(r.verificacao.medidas.altura, 1920);
    assert.ok(r.palavras >= 5, 'a legenda deveria ter as palavras do roteiro');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
    for (const f of fs.readdirSync(path.join(root, 'public', 'input'))) if (f.startsWith('take_atual')) fs.rmSync(path.join(root, 'public', 'input', f), { force: true });
  }
});

test('entrada inexistente falha com mensagem clara', async () => {
  await assert.rejects(() => produzirReelGravacao({ entrada: path.join(os.tmpdir(), 'nao-existe-123.mp4'), saida: path.join(os.tmpdir(), 'x.mp4'), semWhisper: true, silencioso: true }), /não encontrad/i);
});

test('sem Whisper e sem roteiro a legenda não existe: a CLI recusa em vez de entregar sem legenda', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-reel-'));
  try {
    const entrada = path.join(dir, 'a.mp4');
    spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=320x568:r=30:d=2', '-f', 'lavfi', '-i', 'sine=f=440:d=2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', entrada]);
    await assert.rejects(() => produzirReelGravacao({ entrada, saida: path.join(dir, 'o.mp4'), semWhisper: true, semCorte: true, silencioso: true }), /legenda|roteiro/i);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
