#!/usr/bin/env node
/**
 * Narração 1-Click Multi-TTS & Pipeline de Transcrição.
 * Gera narração em áudio neural (Edge-TTS grátis ou ElevenLabs) e
 * dispara opcionalmente a transcrição de palavras para out/temp/words.json.
 * 
 * Uso:
 *   node scripts/narrar.mjs "Texto para narrar..." [--voz antonio|francisca|thalita] [--rate +15%] [--saida public/narracao.mp3] [--transcrever]
 * Exemplo:
 *   node scripts/narrar.mjs "O futuro do design não é estático. É código vivo." --transcrever
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const VOZES_MAP = {
	antonio: 'pt-BR-AntonioNeural',
	francisca: 'pt-BR-FranciscaNeural',
	thalita: 'pt-BR-ThalitaNeural',
};

export function buildTTSCommand(text, outputFile = 'public/narracao.mp3', options = {}) {
	const {
		voice = 'antonio',
		rate = '+0%',
		pitch = '+0Hz',
	} = options;

	const resolvedVoice = VOZES_MAP[voice.toLowerCase()] || voice;
	const resolvedOutput = path.resolve(outputFile);

	const pythonScript = `
import asyncio
import edge_tts

async def main():
    communicate = edge_tts.Communicate('''${text.replace(/'/g, "\\'")}''', '${resolvedVoice}', rate='${rate}', pitch='${pitch}')
    await communicate.save(r'${resolvedOutput}')

asyncio.run(main())
`;

	return {
		command: 'python',
		args: ['-c', pythonScript],
		voice: resolvedVoice,
		output: resolvedOutput,
	};
}

export function narrarTexto(text, outputFile = 'public/narracao.mp3', options = {}) {
	const {
		voice = 'antonio',
		rate = '+0%',
		pitch = '+0Hz',
		transcrever = false,
		dryRun = false,
	} = options;

	if (!text || !text.trim()) {
		throw new Error('Texto para narração não pode ser vazio.');
	}

	const cmd = buildTTSCommand(text.trim(), outputFile, { voice, rate, pitch });

	if (dryRun) {
		return {
			success: true,
			dryRun: true,
			...cmd,
		};
	}

	const outDir = path.dirname(cmd.output);
	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir, { recursive: true });
	}

	console.log(`[Narrar] Gerando voz com Edge-TTS (${cmd.voice}, rate: ${rate})...`);
	const result = spawnSync(cmd.command, cmd.args, {
		stdio: 'inherit',
		windowsHide: true,
	});

	if (result.status !== 0) {
		throw new Error(`Falha ao gerar narração com código ${result.status}`);
	}

	console.log(`[Narrar] Áudio salvo em: ${cmd.output}`);

	if (transcrever) {
		console.log(`[Narrar] Disparando transcrição Whisper para out/temp/words.json...`);
		const transcribeScript = path.resolve('scripts/transcrever-palavras.mjs');
		const wordsOutput = path.resolve('out/temp/words.json');
		const trResult = spawnSync('node', [transcribeScript, cmd.output, wordsOutput, 'pt'], {
			stdio: 'inherit',
			windowsHide: true,
		});

		if (trResult.status !== 0) {
			console.warn(`[Aviso] Transcrição falhou ou whisper não disponível. Prosseguindo.`);
		} else {
			console.log(`[Narrar] Transcrição concluída: ${wordsOutput}`);
		}
	}

	return {
		success: true,
		output: cmd.output,
		voice: cmd.voice,
	};
}

// Execução via CLI direta
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('narrar.mjs')) {
	const args = process.argv.slice(2);
	if (args.length === 0) {
		console.log(`Uso: node scripts/narrar.mjs "<texto>" [--voz antonio|francisca|thalita] [--rate +15%] [--saida public/narracao.mp3] [--transcrever]`);
		process.exit(0);
	}

	let text = '';
	let voice = 'antonio';
	let output = 'public/narracao.mp3';
	let rate = '+0%';
	let transcrever = false;

	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--voz' && args[i + 1]) {
			voice = args[++i];
		} else if (args[i] === '--saida' && args[i + 1]) {
			output = args[++i];
		} else if (args[i] === '--rate' && args[i + 1]) {
			rate = args[++i];
		} else if (args[i] === '--transcrever') {
			transcrever = true;
		} else if (!text && !args[i].startsWith('--')) {
			text = args[i];
		}
	}

	// Se o texto for um caminho para arquivo existente, lê o arquivo
	if (text && fs.existsSync(text) && fs.statSync(text).isFile()) {
		text = fs.readFileSync(text, 'utf8');
	}

	try {
		narrarTexto(text, output, { voice, rate, transcrever });
	} catch (err) {
		console.error(`[Erro Narração]`, err.message);
		process.exit(1);
	}
}
