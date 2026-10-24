#!/usr/bin/env node
/**
 * Portão de qualidade: mede um vídeo pronto e diz se ele está dentro do padrão do estúdio.
 *
 * Uso:
 *   node scripts/verificar_video.mjs <video> [--formato 9:16|4:5|16:9|1:1] [--json] [--folha pasta]
 *
 * Checagens: formato (resolução), fps, áudio presente, loudness (-14 LUFS ±1), pico (≤ -1 dBFS) e
 * quadros congelados (nenhum trecho parado por mais de 1,5 s). Sai com código 1 se algo reprovar.
 * `--folha <pasta>` também grava uma folha de contato (6 quadros) para você olhar.
 * `--timeline <arquivo.json>` (a timeline do render) liga a checagem de variedade entre as cenas.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { avaliarVariedade } from '../src/timeline/gosto.ts';

export const FORMATOS = {
	'9:16': { largura: 1080, altura: 1920 },
	'4:5': { largura: 1080, altura: 1350 },
	'16:9': { largura: 1920, altura: 1080 },
	'1:1': { largura: 1080, altura: 1080 },
};

export const LIMITES = { lufsAlvo: -14, lufsTolerancia: 1, picoMaxDb: -1.0, fpsEsperado: 30, congeladoMaxSegundos: 1.5 };

/** Lê o resumo do filtro ebur128 (stderr do ffmpeg). */
export function parseEbur128(stderr) {
	const resumo = stderr.slice(stderr.lastIndexOf('Summary:'));
	const lufs = resumo.match(/I:\s+(-?[\d.]+) LUFS/);
	const pico = resumo.match(/Peak:\s+(-?[\d.]+) dBFS/);
	if (!lufs || !pico) return null;
	return { lufs: parseFloat(lufs[1]), picoDb: parseFloat(pico[1]) };
}

/**
 * Lê o filtro freezedetect: quantos trechos parados, o maior e o total. O ffmpeg não imprime a duração de um
 * trecho que vai até o fim do arquivo (só o freeze_start); nesse caso usa-se `duracaoTotal - start`.
 */
export function parseFreezeDetect(stderr, duracaoTotal = 0) {
	const inicios = [...stderr.matchAll(/freeze_start:\s*([\d.]+)/g)].map((m) => parseFloat(m[1]));
	const duracoes = [...stderr.matchAll(/freeze_duration:\s*([\d.]+)/g)].map((m) => parseFloat(m[1]));
	if (inicios.length > duracoes.length && duracaoTotal > 0) duracoes.push(Math.max(0, duracaoTotal - inicios[inicios.length - 1]));
	const total = duracoes.reduce((a, b) => a + b, 0);
	return { trechos: duracoes.length, maiorSegundos: duracoes.length ? Math.max(...duracoes) : 0, totalSegundos: Math.round(total * 1000) / 1000 };
}

/** Chaves de variedade dos visuais de cena (faixa T_HERO, em ordem): componente, mais a variante da FraseDestaque. */
export function chavesDeVariedade(clips) {
	return clips
		.filter((c) => c.trackId === 'T_HERO')
		.sort((a, b) => a.startFrame - b.startFrame)
		.map((c) => (c.componentName === 'FraseDestaque' ? `FraseDestaque:${c.props?.variant}` : c.componentName));
}

/** Aplica as regras às medidas. `medidas` vem de medirVideo(). `chavesVisuais` (opcional) liga a checagem de variedade. */
export function avaliar(medidas, { formato = '9:16', chavesVisuais = null } = {}) {
	const esperado = FORMATOS[formato];
	if (!esperado) throw new Error(`Formato desconhecido: ${formato} (use ${Object.keys(FORMATOS).join(', ')})`);
	const checagens = [];
	const add = (id, ok, valor, esperadoTxt, mensagem) => checagens.push({ id, ok, valor, esperado: esperadoTxt, mensagem });

	const resOk = medidas.largura === esperado.largura && medidas.altura === esperado.altura;
	add('formato', resOk, `${medidas.largura}x${medidas.altura}`, `${esperado.largura}x${esperado.altura} (${formato})`, resOk ? `Resolução ${medidas.largura}x${medidas.altura} correta para ${formato}.` : `Resolução ${medidas.largura}x${medidas.altura}, o esperado para ${formato} é ${esperado.largura}x${esperado.altura}.`);

	const fpsOk = Math.abs(medidas.fps - LIMITES.fpsEsperado) < 0.5;
	add('fps', fpsOk, medidas.fps, LIMITES.fpsEsperado, fpsOk ? `${medidas.fps} fps, como no estúdio.` : `${medidas.fps} fps; o estúdio renderiza a ${LIMITES.fpsEsperado} fps.`);

	add('audio', medidas.temAudio, medidas.temAudio, true, medidas.temAudio ? 'Tem trilha de áudio.' : 'O vídeo não tem áudio.');

	if (medidas.temAudio) {
		const dentro = Math.abs(medidas.lufs - LIMITES.lufsAlvo) <= LIMITES.lufsTolerancia;
		add('loudness', dentro, medidas.lufs, `${LIMITES.lufsAlvo} ±${LIMITES.lufsTolerancia} LUFS`, dentro ? `Loudness ${medidas.lufs} LUFS dentro do alvo.` : `Loudness ${medidas.lufs} LUFS fora de ${LIMITES.lufsAlvo} ±${LIMITES.lufsTolerancia} (rode a masterização).`);
		const picoOk = medidas.picoDb <= LIMITES.picoMaxDb;
		add('pico', picoOk, medidas.picoDb, `<= ${LIMITES.picoMaxDb} dBFS`, picoOk ? `Pico ${medidas.picoDb} dBFS dentro do limite.` : `Pico ${medidas.picoDb} dBFS acima de ${LIMITES.picoMaxDb} (risco de estourar no celular).`);
	}

	const parado = medidas.congelado.maiorSegundos > LIMITES.congeladoMaxSegundos;
	add('congelado', !parado, medidas.congelado.maiorSegundos, `<= ${LIMITES.congeladoMaxSegundos} s parado`, parado ? `Imagem parada por ${medidas.congelado.maiorSegundos}s seguidos (${medidas.congelado.trechos} trecho(s)): falta movimento.` : 'Sem trechos congelados longos.');

	if (chavesVisuais) {
		const v = avaliarVariedade(chavesVisuais);
		add('variedade', v.ok, v.distintos, 'sem repetir em sequência e ≥ 3 visuais com 4+ cenas', v.ok ? `${v.distintos} visual(is) distinto(s) em ${chavesVisuais.length} cena(s).` : `Visuais repetem ou faltam: ${v.problemas.join('; ')}.`);
	}

	return { ok: checagens.every((c) => c.ok), formato, checagens };
}

function executar(cmd, args) {
	return spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

/** Mede o vídeo com ffprobe + ebur128 + freezedetect. */
export function medirVideo(arquivo) {
	const sonda = executar('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', arquivo]);
	if (sonda.status !== 0) throw new Error(`ffprobe falhou em ${arquivo}: ${sonda.stderr}`);
	const info = JSON.parse(sonda.stdout);
	const v = info.streams.find((s) => s.codec_type === 'video');
	if (!v) throw new Error('O arquivo não tem stream de vídeo.');
	const [num, den] = String(v.avg_frame_rate || v.r_frame_rate).split('/').map(Number);
	const medidas = {
		largura: v.width,
		altura: v.height,
		fps: Math.round((num / (den || 1)) * 100) / 100,
		duracao: parseFloat(info.format.duration),
		temAudio: info.streams.some((s) => s.codec_type === 'audio'),
		lufs: null,
		picoDb: null,
	};
	if (medidas.temAudio) {
		const e = executar('ffmpeg', ['-hide_banner', '-nostats', '-i', arquivo, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
		const lido = parseEbur128(e.stderr);
		if (lido) Object.assign(medidas, lido);
	}
	const f = executar('ffmpeg', ['-hide_banner', '-nostats', '-i', arquivo, '-an', '-vf', 'freezedetect=n=-60dB:d=0.5', '-f', 'null', '-']);
	medidas.congelado = parseFreezeDetect(f.stderr, medidas.duracao);
	return medidas;
}

export function verificarVideo(arquivo, opcoes = {}) {
	if (!fs.existsSync(arquivo)) throw new Error(`Vídeo não encontrado: ${arquivo}`);
	const medidas = medirVideo(arquivo);
	let chavesVisuais = opcoes.chavesVisuais ?? null;
	if (!chavesVisuais && opcoes.timeline) {
		const bruto = JSON.parse(fs.readFileSync(opcoes.timeline, 'utf8'));
		chavesVisuais = chavesDeVariedade((bruto.timeline ?? bruto).clips);
	}
	return { arquivo: path.resolve(arquivo), medidas, ...avaliar(medidas, { ...opcoes, chavesVisuais }) };
}

/** Folha de contato com 6 quadros (um por vez, -vframes 1) para olhar o resultado. */
export function gerarFolha(arquivo, pastaSaida, duracao) {
	fs.mkdirSync(pastaSaida, { recursive: true });
	const base = path.basename(arquivo, path.extname(arquivo));
	const quadros = [];
	for (let i = 0; i < 6; i++) {
		const t = Math.max(0, (duracao * (i + 0.5)) / 6);
		const png = path.join(pastaSaida, `${base}_q${i}.png`);
		const r = executar('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(t), '-i', arquivo, '-vframes', '1', '-vf', 'scale=270:-2', png]);
		if (r.status === 0) quadros.push(png);
	}
	const folha = path.join(pastaSaida, `${base}_folha.png`);
	const entradas = quadros.flatMap((q) => ['-i', q]);
	const r = executar('ffmpeg', ['-y', '-loglevel', 'error', ...entradas, '-filter_complex', `hstack=inputs=${quadros.length}`, '-vframes', '1', folha]);
	for (const q of quadros) fs.rmSync(q, { force: true });
	return r.status === 0 ? folha : null;
}

function main() {
	const args = process.argv.slice(2);
	const opt = (nome, padrao) => {
		const i = args.indexOf(nome);
		return i >= 0 ? args.splice(i, 2)[1] : padrao;
	};
	const json = args.includes('--json');
	if (json) args.splice(args.indexOf('--json'), 1);
	const formato = opt('--formato', '9:16');
	const pastaFolha = opt('--folha', null);
	const timeline = opt('--timeline', null);
	const [video] = args;
	if (!video) {
		console.error('Uso: node scripts/verificar_video.mjs <video> [--formato 9:16|4:5|16:9|1:1] [--json] [--folha pasta]');
		process.exit(2);
	}
	try {
		const r = verificarVideo(video, { formato, timeline });
		if (pastaFolha) r.folha = gerarFolha(video, pastaFolha, r.medidas.duracao);
		if (json) console.log(JSON.stringify(r, null, 2));
		else {
			console.log(`${r.ok ? '✅ APROVADO' : '❌ REPROVADO'}: ${path.basename(video)} (${formato}, ${r.medidas.duracao.toFixed(1)} s)`);
			for (const c of r.checagens) console.log(`  ${c.ok ? '✓' : '✗'} ${c.id}: ${c.mensagem}`);
			if (r.folha) console.log(`  folha de contato: ${r.folha}`);
		}
		process.exit(r.ok ? 0 : 1);
	} catch (e) {
		console.error(`[Erro verificar vídeo] ${e.message}`);
		process.exit(2);
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
