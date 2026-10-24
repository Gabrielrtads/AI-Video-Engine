#!/usr/bin/env node
/**
 * Corte de silêncio: remove as pausas longas de uma gravação (vídeo ou áudio), mantendo uma folga em volta
 * da fala para o corte não ficar seco.
 *
 * Uso:
 *   node scripts/cortar_silencio.mjs <entrada> <saida> [--folga 0.12] [--ruido -35] [--minimo 0.5] [--mapa saida.json] [--simular]
 *
 *   --folga   segundos de silêncio mantidos antes e depois de cada fala (padrão 0,12)
 *   --ruido   limite em dB abaixo do qual o som conta como silêncio (padrão -35)
 *   --minimo  duração mínima em segundos para um trecho calado ser tratado como pausa (padrão 0,5)
 *   --mapa    grava os trechos mantidos em JSON, para reencaixar legendas (remapTimestamp)
 *   --simular só mostra o que seria cortado, sem gerar arquivo
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const arredonda = (x) => Math.round(x * 1e6) / 1e6;

/** Lê o stderr do filtro `silencedetect` e devolve os silêncios como {start, end}. */
export function parseSilenceDetect(stderr, duration) {
	const silencios = [];
	let inicio = null;
	for (const linha of stderr.split('\n')) {
		const s = linha.match(/silence_start:\s*(-?[\d.]+)/);
		const e = linha.match(/silence_end:\s*(-?[\d.]+)/);
		if (s) inicio = Math.max(0, parseFloat(s[1]));
		else if (e && inicio !== null) {
			silencios.push({ start: inicio, end: parseFloat(e[1]) });
			inicio = null;
		}
	}
	if (inicio !== null) silencios.push({ start: inicio, end: duration });
	return silencios;
}

/** Trechos a manter: o arquivo menos o miolo de cada silêncio (a folga fica dos dois lados). */
export function computeKeepSegments(silencios, duration, { padding = 0.12 } = {}) {
	const cortes = [];
	for (const s of silencios) {
		const de = s.start <= 0 ? 0 : s.start + padding;
		const ate = s.end >= duration ? duration : s.end - padding;
		if (ate - de > 1e-9) cortes.push({ start: arredonda(de), end: arredonda(ate) });
	}
	cortes.sort((a, b) => a.start - b.start);
	const manter = [];
	let cursor = 0;
	for (const c of cortes) {
		if (c.start > cursor + 1e-9) manter.push({ start: arredonda(cursor), end: c.start });
		cursor = Math.max(cursor, c.end);
	}
	if (duration > cursor + 1e-9) manter.push({ start: arredonda(cursor), end: arredonda(duration) });
	return manter;
}

/** Leva um tempo do arquivo original para o tempo do arquivo cortado (null se caiu num trecho removido). */
export function remapTimestamp(t, manter) {
	let acumulado = 0;
	for (const seg of manter) {
		if (t >= seg.start && t <= seg.end) return arredonda(acumulado + (t - seg.start));
		acumulado += seg.end - seg.start;
	}
	return null;
}

function duracaoDe(arquivo) {
	const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', arquivo], { encoding: 'utf8' });
	if (r.status !== 0) throw new Error(`ffprobe falhou em ${arquivo}: ${r.stderr}`);
	return parseFloat(r.stdout);
}

function temVideo(arquivo) {
	const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_type', '-of', 'default=nw=1:nk=1', arquivo], { encoding: 'utf8' });
	return r.stdout.trim() === 'video';
}

export function detectSilences(arquivo, { noiseDb = -35, minSilence = 0.5 } = {}) {
	const duration = duracaoDe(arquivo);
	const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', arquivo, '-af', `silencedetect=noise=${noiseDb}dB:d=${minSilence}`, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
	if (r.status !== 0) throw new Error(`ffmpeg falhou ao detectar silêncio: ${r.stderr.slice(-400)}`);
	return { duration, silencios: parseSilenceDetect(r.stderr, duration) };
}

export function cutSilence(entrada, saida, opcoes = {}) {
	const { padding = 0.12, noiseDb = -35, minSilence = 0.5, silent = false, simular = false } = opcoes;
	const origem = path.resolve(entrada);
	if (!fs.existsSync(origem)) throw new Error(`Arquivo de entrada não encontrado: ${origem}`);

	const { duration, silencios } = detectSilences(origem, { noiseDb, minSilence });
	const manter = computeKeepSegments(silencios, duration, { padding });
	if (manter.length === 0) throw new Error('O arquivo inteiro foi considerado silêncio; ajuste --ruido.');
	const finalSeg = manter.reduce((s, m) => s + (m.end - m.start), 0);
	const relatorio = { duracaoOriginal: arredonda(duration), duracaoFinal: arredonda(finalSeg), removidoSegundos: arredonda(duration - finalSeg), silencios, manter };
	if (simular) return relatorio;

	const comVideo = temVideo(origem);
	const partes = [];
	manter.forEach((m, i) => {
		if (comVideo) partes.push(`[0:v]trim=start=${m.start}:end=${m.end},setpts=PTS-STARTPTS[v${i}]`);
		partes.push(`[0:a]atrim=start=${m.start}:end=${m.end},asetpts=PTS-STARTPTS[a${i}]`);
	});
	const entradas = manter.map((_, i) => (comVideo ? `[v${i}][a${i}]` : `[a${i}]`)).join('');
	partes.push(`${entradas}concat=n=${manter.length}:v=${comVideo ? 1 : 0}:a=1${comVideo ? '[v][a]' : '[a]'}`);

	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vds-corte-'));
	try {
		const roteiroFiltro = path.join(dir, 'filtro.txt');
		fs.writeFileSync(roteiroFiltro, partes.join(';\n'));
		const destino = path.resolve(saida);
		fs.mkdirSync(path.dirname(destino), { recursive: true });
		const args = ['-y', '-i', origem, '-filter_complex_script', roteiroFiltro, ...(comVideo ? ['-map', '[v]', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p'] : []), '-map', '[a]', '-c:a', 'aac', '-b:a', '192k', destino];
		const r = spawnSync('ffmpeg', args, { stdio: silent ? 'ignore' : 'inherit', windowsHide: true });
		if (r.status !== 0) throw new Error(`ffmpeg falhou com código ${r.status} ao cortar o silêncio.`);
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
	return relatorio;
}

function main() {
	const args = process.argv.slice(2);
	const opt = (nome, padrao) => {
		const i = args.indexOf(nome);
		return i >= 0 ? args.splice(i, 2)[1] : padrao;
	};
	const simular = args.includes('--simular');
	if (simular) args.splice(args.indexOf('--simular'), 1);
	const padding = parseFloat(opt('--folga', '0.12'));
	const noiseDb = parseFloat(opt('--ruido', '-35'));
	const minSilence = parseFloat(opt('--minimo', '0.5'));
	const mapa = opt('--mapa', null);
	const [entrada, saida] = args;
	if (!entrada || (!simular && !saida)) {
		console.error('Uso: node scripts/cortar_silencio.mjs <entrada> <saida> [--folga 0.12] [--ruido -35] [--minimo 0.5] [--mapa saida.json] [--simular]');
		process.exit(2);
	}
	try {
		const r = cutSilence(entrada, saida, { padding, noiseDb, minSilence, simular });
		console.log(`${simular ? 'Simulação: ' : ''}${r.silencios.length} pausa(s) encontrada(s); ${r.duracaoOriginal}s -> ${r.duracaoFinal}s (removeu ${r.removidoSegundos}s).`);
		if (mapa) fs.writeFileSync(mapa, JSON.stringify(r.manter, null, 2));
		if (!simular) console.log(`Arquivo: ${path.resolve(saida)}`);
	} catch (e) {
		console.error(`[Erro cortar silêncio] ${e.message}`);
		process.exit(1);
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
