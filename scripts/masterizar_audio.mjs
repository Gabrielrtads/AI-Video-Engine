#!/usr/bin/env node
/**
 * Masterizador de Áudio EBU R128 (-14 LUFS) para Redes Sociais.
 * Aplica normalização de loudness com true-peak limiting (-1 dBTP)
 * garantindo compatibilidade estrita com Instagram, TikTok e YouTube.
 * 
 * Uso:
 *   node scripts/masterizar_audio.mjs [inputVideo] [outputVideo]
 * Exemplo:
 *   node scripts/masterizar_audio.mjs out/video.mp4 out/video_mastered.mp4
 */

import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function masterizeAudio(
	inputFile = 'out/video.mp4',
	outputFile = 'out/video_mastered.mp4',
	options = {}
) {
	const {
		targetLufs = -14,
		loudnessRange = 7,
		truePeak = -1.0,
		dryRun = false,
	} = options;

	const resolvedInput = path.resolve(inputFile);
	const resolvedOutput = path.resolve(outputFile);

	if (!dryRun && !fs.existsSync(resolvedInput)) {
		throw new Error(`Arquivo de entrada não encontrado: ${resolvedInput}`);
	}

	const filterStr = `loudnorm=I=${targetLufs}:LRA=${loudnessRange}:tp=${truePeak}`;

	const ffmpegArgs = [
		'-y',
		'-i', resolvedInput,
		'-c:v', 'copy',
		'-af', filterStr,
		'-c:a', 'aac',
		'-b:a', '192k',
		resolvedOutput,
	];

	if (dryRun) {
		return {
			command: 'ffmpeg',
			args: ffmpegArgs,
			filter: filterStr,
			input: resolvedInput,
			output: resolvedOutput,
		};
	}

	// Garante que o diretório de destino existe
	const outDir = path.dirname(resolvedOutput);
	if (!fs.existsSync(outDir)) {
		fs.mkdirSync(outDir, { recursive: true });
	}

	const result = spawnSync('ffmpeg', ffmpegArgs, {
		stdio: 'inherit',
		windowsHide: true,
	});

	if (result.status !== 0) {
		throw new Error(`FFmpeg falhou com código ${result.status} ao masterizar áudio.`);
	}

	return {
		success: true,
		output: resolvedOutput,
		targetLufs,
	};
}

// Execução direta via CLI
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('masterizar_audio.mjs')) {
	const input = process.argv[2] || 'out/video.mp4';
	const output = process.argv[3] || 'out/video_mastered.mp4';

	try {
		console.log(`[Masterizador EBU R128] Normalizando para -14 LUFS...`);
		console.log(`Entrada: ${input} -> Saída: ${output}`);
		masterizeAudio(input, output);
		console.log(`[Masterizador] Concluído com sucesso! Arquivo: ${output}`);
	} catch (err) {
		console.error(`[Erro Masterização]`, err.message);
		process.exit(1);
	}
}
