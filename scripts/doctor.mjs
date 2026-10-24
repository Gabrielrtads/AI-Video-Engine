#!/usr/bin/env node
/**
 * `vibe doctor`: confere o que o estúdio precisa e diz exatamente o que instalar.
 *
 * Uso:
 *   node scripts/doctor.mjs [--json]
 *
 * Itens com nível "erro" impedem de gerar vídeo (sai com código 1); "aviso" só avisa.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { verificarPastas } from './preparar_pastas.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function extrairVersao(texto) {
	const m = String(texto).match(/(\d+\.\d+(?:\.\d+)?)/);
	return m ? m[1] : null;
}

export function versaoMinimaOk(versao, minimaPrincipal) {
	if (!versao) return false;
	return parseInt(versao.split('.')[0], 10) >= minimaPrincipal;
}

/** Executor real: usa shell só para o pnpm no Windows (é um .cmd). */
export function executarPadrao(comando, args) {
	const usarShell = process.platform === 'win32' && comando === 'pnpm';
	return spawnSync(comando, args, { encoding: 'utf8', windowsHide: true, shell: usarShell, timeout: 20000 });
}

export function verificarPrograma({ id, nome, comando, args, minimaPrincipal, opcional = false, corrigir }, executar = executarPadrao) {
	const nivel = opcional ? 'aviso' : 'erro';
	const r = executar(comando, args);
	if (!r || r.error || r.status !== 0) {
		return { id, ok: false, nivel, mensagem: `${nome} não encontrado`, corrigir };
	}
	const versao = extrairVersao(`${r.stdout}${r.stderr}`);
	if (minimaPrincipal && !versaoMinimaOk(versao, minimaPrincipal)) {
		return { id, ok: false, nivel, mensagem: `${nome} ${versao ?? '?'} é antigo (mínimo ${minimaPrincipal})`, corrigir };
	}
	return { id, ok: true, nivel, mensagem: `${nome} ${versao ?? 'instalado'}` };
}

export function avaliarEncoders(saidaEncoders) {
	const faltando = ['libx264', 'libmp3lame'].filter((e) => !saidaEncoders.includes(e));
	return { ok: faltando.length === 0, faltando };
}

export function rodarDoctor({ executar = executarPadrao, raiz = RAIZ, plataforma = process.platform } = {}) {
	const checagens = [];
	const add = (c) => checagens.push(c);

	add(verificarPrograma({ id: 'node', nome: 'Node.js', comando: 'node', args: ['--version'], minimaPrincipal: 24, corrigir: 'Instale o Node.js 24 ou mais novo (https://nodejs.org).' }, executar));
	add(verificarPrograma({ id: 'pnpm', nome: 'pnpm', comando: 'pnpm', args: ['--version'], minimaPrincipal: 10, corrigir: 'Instale o pnpm: npm install -g pnpm' }, executar));
	add(verificarPrograma({ id: 'ffmpeg', nome: 'FFmpeg', comando: 'ffmpeg', args: ['-version'], corrigir: 'Instale o FFmpeg (winget install Gyan.FFmpeg | brew install ffmpeg | apt install ffmpeg).' }, executar));
	add(verificarPrograma({ id: 'ffprobe', nome: 'FFprobe', comando: 'ffprobe', args: ['-version'], corrigir: 'O FFprobe vem junto com o FFmpeg.' }, executar));

	const enc = executar('ffmpeg', ['-hide_banner', '-encoders']);
	if (enc && enc.status === 0) {
		const a = avaliarEncoders(`${enc.stdout}${enc.stderr}`);
		add({ id: 'ffmpeg-encoders', ok: a.ok, nivel: 'erro', mensagem: a.ok ? 'FFmpeg com libx264 e libmp3lame' : `FFmpeg sem: ${a.faltando.join(', ')}`, corrigir: a.ok ? undefined : 'Use um build completo do FFmpeg (com libx264 e libmp3lame).' });
	} else {
		add({ id: 'ffmpeg-encoders', ok: false, nivel: 'erro', mensagem: 'Não foi possível listar os codificadores do FFmpeg', corrigir: 'Instale o FFmpeg.' });
	}

	const python = process.env.PYTHON || process.env.PYTHON_PATH || (plataforma === 'win32' ? 'python' : 'python3');
	add(verificarPrograma({ id: 'python', nome: 'Python', comando: python, args: ['--version'], minimaPrincipal: 3, corrigir: 'Instale o Python 3.10 ou mais novo (https://python.org).' }, executar));
	const pacotes = executar(python, ['-c', 'import numpy, edge_tts']);
	const pacotesOk = pacotes && !pacotes.error && pacotes.status === 0;
	add({
		id: 'python-pacotes',
		ok: pacotesOk,
		nivel: 'erro',
		mensagem: pacotesOk ? 'Pacotes Python numpy e edge-tts instalados' : `Faltam pacotes Python (numpy e edge-tts): ${String(pacotes?.stderr ?? '').trim().split('\n').pop() || 'import falhou'}`,
		corrigir: pacotesOk ? undefined : 'Rode: pip install -r requirements.txt',
	});

	const depsOk = fs.existsSync(path.join(raiz, 'node_modules', 'remotion'));
	add({ id: 'dependencias', ok: depsOk, nivel: 'erro', mensagem: depsOk ? 'Dependências do projeto instaladas' : 'Dependências do projeto não instaladas', corrigir: depsOk ? undefined : 'Rode: pnpm install --frozen-lockfile' });

	const { faltando } = verificarPastas(raiz);
	add({ id: 'pastas', ok: faltando.length === 0, nivel: 'aviso', mensagem: faltando.length === 0 ? 'Pastas do estúdio criadas' : `Faltam ${faltando.length} pasta(s): ${faltando.join(', ')}`, corrigir: faltando.length === 0 ? undefined : 'Rode: pnpm setup:pastas' });

	const whisperDir = process.env.WHISPER_DIR || path.join(os.homedir(), '.whisper-cpp');
	const whisperOk = fs.existsSync(whisperDir);
	add({ id: 'whisper', ok: whisperOk, nivel: 'aviso', mensagem: whisperOk ? 'whisper.cpp instalado' : 'whisper.cpp ainda não instalado (instala sozinho na primeira transcrição; sem ele a legenda usa o estimador)', corrigir: whisperOk ? undefined : 'Precisa de internet e, no Linux/macOS, de make e um compilador C++.' });

	if (plataforma === 'win32') {
		const longo = raiz.length > 120;
		add({ id: 'caminho', ok: !longo, nivel: 'aviso', mensagem: longo ? `Caminho do projeto com ${raiz.length} caracteres` : 'Caminho do projeto curto', corrigir: longo ? 'Mantenha o projeto em um caminho curto (ex.: C:\\vds): caminhos acima de 260 caracteres quebram o Remotion no Windows.' : undefined });
	}

	return { ok: checagens.every((c) => c.ok || c.nivel === 'aviso'), checagens };
}

function main() {
	const json = process.argv.includes('--json');
	const r = rodarDoctor();
	if (json) console.log(JSON.stringify(r, null, 2));
	else {
		console.log(r.ok ? '✅ Ambiente pronto para gerar vídeos.' : '❌ Faltam itens obrigatórios.');
		for (const c of r.checagens) {
			console.log(`  ${c.ok ? '✓' : c.nivel === 'erro' ? '✗' : '!'} ${c.mensagem}`);
			if (!c.ok && c.corrigir) console.log(`      → ${c.corrigir}`);
		}
	}
	process.exit(r.ok ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
