#!/usr/bin/env node
/**
 * Masterizador de Áudio EBU R128 (-14 LUFS) para Redes Sociais, em dois passes.
 *
 * Passe 1: o `loudnorm` do FFmpeg só mede o áudio (loudness, pico, faixa e limiar).
 * Passe 2: aplica a normalização linear com os valores medidos; o arquivo final fica em -1 dBTP ou menos
 * (o passe 2 mira 0,5 dB abaixo para compensar o overshoot do AAC).
 * Um passe único (modo dinâmico) errava o alvo em cerca de 1 LU e podia deixar pico acima de 0 dBFS.
 *
 * Uso:
 *   node scripts/masterizar_audio.mjs [inputVideo] [outputVideo]
 * Exemplo:
 *   node scripts/masterizar_audio.mjs out/video.mp4 out/video_mastered.mp4
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * O AAC reintroduz picos ao codificar (medido: +0,1 a +0,4 dB acima do limite do loudnorm). Para o arquivo
 * entregue ficar em -1 dBTP ou menos, o passe 2 mira 0,5 dB abaixo do pedido.
 */
export const FOLGA_CODEC_DB = 0.5;

/** Extrai o bloco JSON que o loudnorm imprime no stderr do FFmpeg (print_format=json). */
export function parseLoudnormJson(stderr) {
	const fim = stderr.lastIndexOf('}');
	const inicio = stderr.lastIndexOf('{', fim);
	if (fim < 0 || inicio < 0) {
		throw new Error('Não foi possível ler a medição de loudness do FFmpeg (bloco JSON ausente).');
	}
	let medidas;
	try {
		medidas = JSON.parse(stderr.slice(inicio, fim + 1));
	} catch {
		throw new Error('Não foi possível ler a medição de loudness do FFmpeg (JSON inválido).');
	}
	for (const chave of ['input_i', 'input_tp', 'input_lra', 'input_thresh', 'target_offset']) {
		if (medidas[chave] === undefined) throw new Error(`Medição de loudness incompleta: falta ${chave}.`);
	}
	return medidas;
}

/** Filtro do passe 2: normalização linear com os valores medidos no passe 1. */
export function buildSecondPassFilter(medidas, { targetLufs = -14, loudnessRange = 7, truePeak = -1.0 } = {}) {
	return (
		`loudnorm=I=${targetLufs}:LRA=${loudnessRange}:tp=${truePeak}` +
		`:measured_I=${medidas.input_i}:measured_LRA=${medidas.input_lra}:measured_TP=${medidas.input_tp}` +
		`:measured_thresh=${medidas.input_thresh}:offset=${medidas.target_offset}:linear=true`
	);
}

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
		silent = false,
	} = options;

	const resolvedInput = path.resolve(inputFile);
	const resolvedOutput = path.resolve(outputFile);

	if (!dryRun && !fs.existsSync(resolvedInput)) {
		throw new Error(`Arquivo de entrada não encontrado: ${resolvedInput}`);
	}

	// Filtro base (passe 1, só mede). O passe 2 acrescenta os valores medidos.
	const filterStr = `loudnorm=I=${targetLufs}:LRA=${loudnessRange}:tp=${truePeak}`;

	// Os dois passes miram o true-peak com a folga do codec (ver FOLGA_CODEC_DB).
	const truePeakEfetivo = truePeak - FOLGA_CODEC_DB;
	const filtroMedicao = `loudnorm=I=${targetLufs}:LRA=${loudnessRange}:tp=${truePeakEfetivo}:print_format=json`;
	const medirArgs = ['-hide_banner', '-nostats', '-i', resolvedInput, '-vn', '-af', filtroMedicao, '-f', 'null', '-'];
	const aplicarArgs = (filtro) => ['-y', '-i', resolvedInput, '-c:v', 'copy', '-af', filtro, '-c:a', 'aac', '-b:a', '192k', resolvedOutput];

	if (dryRun) {
		return {
			command: 'ffmpeg',
			passes: 2,
			args: aplicarArgs(filterStr),
			measureArgs: medirArgs,
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

	// Passe 1: medir
	const medicao = spawnSync('ffmpeg', medirArgs, { encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
	if (medicao.status !== 0) {
		throw new Error(`FFmpeg falhou com código ${medicao.status} ao medir o áudio.\n${medicao.stderr?.slice(-500) ?? ''}`);
	}
	const medidas = parseLoudnormJson(medicao.stderr);

	// Passe 2: aplicar com os valores medidos
	const segundoPasse = buildSecondPassFilter(medidas, { targetLufs, loudnessRange, truePeak: truePeakEfetivo });
	const result = spawnSync('ffmpeg', aplicarArgs(segundoPasse), {
		stdio: silent ? 'ignore' : 'inherit',
		windowsHide: true,
	});

	if (result.status !== 0) {
		throw new Error(`FFmpeg falhou com código ${result.status} ao masterizar áudio.`);
	}

	return {
		success: true,
		output: resolvedOutput,
		targetLufs,
		measured: medidas,
	};
}

// Execução direta via CLI
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('masterizar_audio.mjs')) {
	const input = process.argv[2] || 'out/video.mp4';
	const output = process.argv[3] || 'out/video_mastered.mp4';

	try {
		console.log(`[Masterizador EBU R128] Normalizando para -14 LUFS (dois passes)...`);
		console.log(`Entrada: ${input} -> Saída: ${output}`);
		masterizeAudio(input, output);
		console.log(`[Masterizador] Concluído com sucesso! Arquivo: ${output}`);
	} catch (err) {
		console.error(`[Erro Masterização]`, err.message);
		process.exit(1);
	}
}
