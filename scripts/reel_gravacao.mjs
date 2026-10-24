#!/usr/bin/env node
/**
 * Reel com a SUA gravação: corta o silêncio, legenda estilo Hormozi, masteriza o áudio e verifica.
 *
 * Uso:
 *   node scripts/reel_gravacao.mjs <gravacao.mp4> [--roteiro "texto" | arquivo.txt] [--saida out/videos/reel.mp4]
 *                                  [--formato 9:16|4:5|16:9|1:1] [--folga 0.12] [--sem-corte] [--sem-whisper]
 *
 *   --roteiro     texto que você falou: a legenda usa ESTE texto (o Whisper só dá o tempo de cada palavra)
 *   --sem-corte   não remove pausas
 *   --sem-whisper não transcreve (exige --roteiro; os tempos viram uma estimativa)
 *
 * Etapas: corta silêncio -> Whisper -> alinha ao roteiro -> timeline (vídeo + legenda + barra) -> render ->
 * masterização (-14 LUFS) -> verificação. Sai com código 1 se o verificador reprovar.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { cutSilence } from './cortar_silencio.mjs';
import { masterizeAudio } from './masterizar_audio.mjs';
import { verificarVideo } from './verificar_video.mjs';
import { generateEstimatedWordTimestamps, resolveAspectRatioMetrics } from '../src/timeline/pipeline1ClickMath.ts';
import { alignScriptToTimestamps } from '../src/timeline/scriptAlignment.ts';
import { buildReelGravacaoTimeline } from '../src/timeline/reelGravacaoMath.ts';
import { validateTimelineSchema } from '../src/timeline/compileTimeline.ts';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function duracaoDe(arquivo) {
	const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', arquivo], { encoding: 'utf8' });
	if (r.status !== 0) throw new Error(`ffprobe falhou em ${arquivo}: ${r.stderr}`);
	return parseFloat(r.stdout);
}

function lerRoteiro(roteiro) {
	if (!roteiro) return null;
	const caminho = path.resolve(roteiro);
	return fs.existsSync(caminho) && fs.statSync(caminho).isFile() ? fs.readFileSync(caminho, 'utf8').trim() : roteiro.trim();
}

export async function produzirReelGravacao(opcoes) {
	const { entrada, saida = 'out/videos/reel_gravacao.mp4', roteiro = null, formato = '9:16', semCorte = false, folga = 0.12, semWhisper = false, silencioso = false } = opcoes;
	const log = (...a) => { if (!silencioso) console.log(...a); };

	const origem = path.resolve(entrada);
	if (!fs.existsSync(origem)) throw new Error(`Arquivo de entrada não encontrado: ${origem}`);
	const roteiroTexto = lerRoteiro(roteiro);
	if (semWhisper && !roteiroTexto) {
		throw new Error('Sem legenda possível: com --sem-whisper é preciso passar --roteiro com o texto falado.');
	}

	const destino = path.resolve(saida);
	const temp = path.join(RAIZ, 'out', 'temp');
	fs.mkdirSync(temp, { recursive: true });
	fs.mkdirSync(path.dirname(destino), { recursive: true });

	// 1. Staging local com nome ASCII (acentos e espaços quebram FFmpeg e Chromium) + corte de silêncio
	const inputDir = path.join(RAIZ, 'public', 'input');
	fs.mkdirSync(inputDir, { recursive: true });
	const staged = path.join(inputDir, 'take_atual.mp4');
	let removidoSegundos = 0;
	if (semCorte) {
		log('[1/5] Copiando a gravação (sem corte de silêncio)...');
		const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', origem, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', staged], { encoding: 'utf8' });
		if (r.status !== 0) throw new Error(`ffmpeg falhou ao preparar a gravação: ${r.stderr.slice(-300)}`);
	} else {
		log('[1/5] Cortando o silêncio...');
		const rel = cutSilence(origem, staged, { padding: folga, silent: true });
		removidoSegundos = rel.removidoSegundos;
		log(`      ${rel.silencios.length} pausa(s); ${rel.duracaoOriginal}s -> ${rel.duracaoFinal}s (removeu ${rel.removidoSegundos}s)`);
	}
	const duracao = duracaoDe(staged);

	// 2. Palavras com tempo (Whisper) e alinhamento ao roteiro
	log('[2/5] Sincronizando a legenda...');
	let words = [];
	if (!semWhisper) {
		const wordsPath = path.join(temp, 'words_reel.json');
		fs.rmSync(wordsPath, { force: true });
		const tr = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'transcrever-palavras.mjs'), staged, wordsPath, 'pt'], { cwd: RAIZ, encoding: 'utf8', timeout: 240000, windowsHide: true });
		if (tr.status === 0 && fs.existsSync(wordsPath)) words = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));
	}
	if (roteiroTexto) {
		const alinhadas = words.length > 0 ? alignScriptToTimestamps(roteiroTexto, words) : [];
		words = alinhadas.length > 0 ? alinhadas : generateEstimatedWordTimestamps(roteiroTexto, duracao);
	}
	if (words.length === 0) {
		throw new Error('Sem legenda: o Whisper não ouviu fala (ou não está instalado). Passe --roteiro com o texto falado.');
	}
	log(`      ${words.length} palavra(s) na legenda.`);

	// 3. Timeline declarativa
	log('[3/5] Montando a timeline...');
	const timeline = buildReelGravacaoTimeline({ videoSrc: 'input/take_atual.mp4', duracaoSegundos: duracao, words, aspectRatio: formato });
	const validacao = validateTimelineSchema(timeline);
	if (!validacao.valid) throw new Error(`Timeline inválida: ${validacao.errors.join('; ')}`);
	const timelineJson = path.join(temp, 'timeline_reel.json');
	fs.writeFileSync(timelineJson, JSON.stringify({ timeline }, null, 2));

	// 4. Render (Remotion direto pelo Node, sem shell) e masterização de dois passes
	log('[4/5] Renderizando e masterizando...');
	const cru = path.join(temp, `reel_cru_${Date.now()}.mp4`);
	const render = spawnSync(process.execPath, [path.join(RAIZ, 'node_modules', '@remotion', 'cli', 'remotion-cli.js'), 'render', 'src/index.tsx', 'JsonTimelineVideo', cru, `--props=${timelineJson}`, '--codec=h264', '--crf=18'], { cwd: RAIZ, stdio: silencioso ? 'ignore' : 'inherit', windowsHide: true });
	if (render.status !== 0 || !fs.existsSync(cru)) throw new Error(`Falha na renderização Remotion (código ${render.status}).`);
	masterizeAudio(cru, destino, { silent: silencioso });
	fs.rmSync(cru, { force: true });

	// 5. Verificação
	log('[5/5] Verificando o resultado...');
	const verificacao = verificarVideo(destino, { formato });
	const metricas = resolveAspectRatioMetrics(formato);
	return { saida: destino, removidoSegundos, palavras: words.length, duracao: verificacao.medidas.duracao, formato, resolucao: `${metricas.width}x${metricas.height}`, verificacao };
}

function main() {
	const args = process.argv.slice(2);
	const opt = (nome, padrao) => {
		const i = args.indexOf(nome);
		return i >= 0 ? args.splice(i, 2)[1] : padrao;
	};
	const flag = (nome) => {
		const i = args.indexOf(nome);
		if (i < 0) return false;
		args.splice(i, 1);
		return true;
	};
	const roteiro = opt('--roteiro', null);
	const saida = opt('--saida', 'out/videos/reel_gravacao.mp4');
	const formato = opt('--formato', '9:16');
	const folga = parseFloat(opt('--folga', '0.12'));
	const semCorte = flag('--sem-corte');
	const semWhisper = flag('--sem-whisper');
	const [entrada] = args;
	if (!entrada) {
		console.error('Uso: node scripts/reel_gravacao.mjs <gravacao.mp4> [--roteiro "texto"|arquivo.txt] [--saida out/videos/reel.mp4] [--formato 9:16] [--folga 0.12] [--sem-corte] [--sem-whisper]');
		process.exit(2);
	}
	produzirReelGravacao({ entrada, saida, roteiro, formato, folga, semCorte, semWhisper })
		.then((r) => {
			console.log(`\n${r.verificacao.ok ? '✅ APROVADO' : '❌ REPROVADO'}: ${r.saida}`);
			console.log(`   ${r.duracao.toFixed(1)} s, ${r.resolucao}, ${r.palavras} palavras, silêncio removido: ${r.removidoSegundos}s`);
			for (const c of r.verificacao.checagens) console.log(`   ${c.ok ? '✓' : '✗'} ${c.id}: ${c.mensagem}`);
			process.exit(r.verificacao.ok ? 0 : 1);
		})
		.catch((e) => {
			console.error(`\n❌ [Erro reel-gravacao] ${e.message}`);
			process.exit(1);
		});
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
