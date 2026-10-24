#!/usr/bin/env node
/**
 * Carrossel estático 4:5: um spec JSON vira N slides PNG (1080x1350) mais uma folha de contato.
 *
 * Uso:
 *   node scripts/carrossel.mjs spec.json [--saida out/carrosseis/<nome>] [--estilo-visual editorial-creme]
 *
 * O spec segue o protocolo do projeto: o agente pergunta ao usuário a quantidade de slides, se o estilo é
 * uniforme ou slide a slide, e se o destino é estático ou animado. Exemplo de spec:
 *   { "nome": "barbearia", "estilo": "uniforme", "destino": "estatico", "autor": "@minha", "marca": "MINHA MARCA",
 *     "slides": [ { "categoria": "AGENDA CHEIA", "titulo": ["SEU CAIXA", "NÃO ESQUECE", "DE"],
 *                   "destaque": "NINGUÉM", "subtitulo": "Lembretes trazem o cliente de volta.",
 *                   "palco": { "destaque": "SEM FALTAS", "repetida": "AGENDA CHEIA" } }, ... ] }
 *
 * Regras que o validador confere: título de 1 a 3 linhas (até 24 caracteres cada); "destaque" é desenhado como uma linha própria
 * (colorida) logo depois do título, então não repita nele uma linha do título; palco.destaque tem no máximo 14 caracteres.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

import { carregarEstilo } from './estilos.mjs';
import { slidesParaProps, validarSpec } from '../src/timeline/carrosselSpec.ts';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Dimensões e "quanto o slide varia" (desvio padrão dos tons de cinza): tela em branco dá ~0. */
export function medirImagem(arquivo) {
	const sonda = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', arquivo], { encoding: 'utf8' });
	if (sonda.status !== 0) throw new Error(`ffprobe falhou em ${arquivo}: ${sonda.stderr}`);
	const [largura, altura] = sonda.stdout.trim().split('x').map(Number);
	const bruto = spawnSync('ffmpeg', ['-v', 'error', '-i', arquivo, '-vframes', '1', '-vf', 'scale=96:96,format=gray', '-f', 'rawvideo', '-'], { maxBuffer: 1024 * 1024 });
	if (bruto.status !== 0) throw new Error(`ffmpeg falhou ao medir ${arquivo}`);
	const pixels = [...bruto.stdout];
	const media = pixels.reduce((a, b) => a + b, 0) / pixels.length;
	const desvioPadrao = Math.sqrt(pixels.reduce((a, b) => a + (b - media) ** 2, 0) / pixels.length);
	return { largura, altura, desvioPadrao: Math.round(desvioPadrao * 100) / 100 };
}

/** Uma etapa que trava sem erro é pior que uma que falha: o agente fica esperando para sempre. */
export function comVigia(promessa, ms, etapa) {
	let temporizador;
	const limite = new Promise((_, rejeitar) => {
		temporizador = setTimeout(() => rejeitar(new Error(`A etapa "${etapa}" passou de ${Math.round(ms / 1000)} s sem terminar`)), ms);
	});
	return Promise.race([promessa, limite]).finally(() => clearTimeout(temporizador));
}

export async function gerarCarrossel({ spec, saidaDir, estiloVisual = null, silencioso = false, frame = 90 }) {
	// Tudo que pode estar errado é conferido ANTES de gastar tempo com bundle e render
	const validacao = validarSpec(spec);
	if (!validacao.ok) throw new Error(`Spec de carrossel inválido:\n  - ${validacao.erros.join('\n  - ')}`);
	const estilo = estiloVisual ? carregarEstilo(estiloVisual) : undefined;
	const propsPorSlide = slidesParaProps(spec, estilo);

	const destino = path.resolve(saidaDir);
	fs.mkdirSync(destino, { recursive: true });
	const log = (...a) => { if (!silencioso) console.log(...a); };
	const diag = (...a) => { if (process.env.VIBE_DEBUG) console.error('[carrossel]', ...a); };
	const logLevel = process.env.VIBE_DEBUG ? 'verbose' : 'warn';

	log(`[1/3] Preparando o Remotion (${propsPorSlide.length} slide(s))...`);
	diag('bundle...');
	const serveUrl = await comVigia(bundle({ entryPoint: path.join(RAIZ, 'src', 'index.tsx'), onProgress: () => {} }), 240000, 'preparar o Remotion');
	diag('bundle ok', serveUrl);

	const slides = [];
	for (let i = 0; i < propsPorSlide.length; i++) {
		const nome = `slide-${String(i + 1).padStart(2, '0')}.png`;
		log(`[2/3] Renderizando ${nome}...`);
		diag(`selectComposition ${nome}...`);
		const composition = await comVigia(selectComposition({ serveUrl, id: 'CarrosselSlide', inputProps: propsPorSlide[i], logLevel }), 180000, `abrir o navegador para ${nome}`);
		diag(`selectComposition ${nome} ok`);
		const saida = path.join(destino, nome);
		await comVigia(renderStill({ composition, serveUrl, output: saida, frame: Math.min(frame, composition.durationInFrames - 1), inputProps: propsPorSlide[i], logLevel }), 180000, `renderizar ${nome}`);
		diag(`renderStill ${nome} ok`);
		slides.push(saida);
	}

	log('[3/3] Montando a folha de contato...');
	const colunas = Math.min(slides.length, 5);
	const linhas = Math.ceil(slides.length / colunas);
	const folha = path.join(destino, 'folha.png');
	const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', path.join(destino, 'slide-%02d.png'), '-vf', `scale=324:-1,tile=${colunas}x${linhas}:padding=8:color=white`, '-frames:v', '1', folha], { encoding: 'utf8' });
	if (r.status !== 0) throw new Error(`ffmpeg falhou ao montar a folha: ${r.stderr}`);

	return { slides, folha, destino };
}

function main() {
	const args = process.argv.slice(2);
	const opt = (nome, padrao) => {
		const i = args.indexOf(nome);
		return i >= 0 ? args.splice(i, 2)[1] : padrao;
	};
	const estiloVisual = opt('--estilo-visual', null);
	const saidaOpcao = opt('--saida', null);
	const [arquivo] = args;
	if (!arquivo) {
		console.error('Uso: node scripts/carrossel.mjs spec.json [--saida out/carrosseis/<nome>] [--estilo-visual editorial-creme]');
		process.exit(2);
	}
	let spec;
	try {
		spec = JSON.parse(fs.readFileSync(path.resolve(arquivo), 'utf8'));
	} catch (e) {
		console.error(`[Erro carrossel] Não consegui ler ${arquivo}: ${e.message}`);
		process.exit(2);
	}
	const saidaDir = saidaOpcao ?? path.join('out', 'carrosseis', spec.nome ?? 'carrossel');
	gerarCarrossel({ spec, saidaDir, estiloVisual })
		.then((r) => {
			console.log(`\n✅ ${r.slides.length} slide(s) em ${r.destino}`);
			for (const s of r.slides) {
				const m = medirImagem(s);
				console.log(`   ${path.basename(s)}: ${m.largura}x${m.altura}, variação ${m.desvioPadrao}`);
			}
			console.log(`   folha de contato: ${r.folha}`);
		})
		.catch((e) => {
			console.error(`\n❌ [Erro carrossel] ${e.message}`);
			process.exit(1);
		});
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
