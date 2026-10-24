#!/usr/bin/env node
/**
 * vibe: entrada única e headless do Vibe Design Studio para agentes e pessoas.
 *
 *   pnpm vibe ajuda
 *   pnpm vibe doctor [--json]
 *   pnpm vibe componentes [--json]
 *   pnpm vibe roteiro "texto do roteiro" [--vertical] [--voz thalita] [--estilo escuro-tech] [--cenas plano.json] [--saida out/videos/x.mp4]
 *   pnpm vibe estilos [--json]
 *   pnpm vibe carrossel <spec.json> [--saida out/carrosseis/x] [--estilo-visual editorial-creme]
 *   pnpm vibe reel-gravacao <gravacao.mp4> [--roteiro "texto"] [--formato 9:16] [--saida out/videos/reel.mp4]
 *   pnpm vibe cortar-silencio <entrada> <saida> [--simular]
 *   pnpm vibe verificar <video> [--formato 9:16] [--json] [--folha pasta]
 *   pnpm vibe pastas [--verificar]
 *
 * Nada aqui inventa comportamento: cada comando delega ao script que já tem testes.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { rodarDoctor } from './doctor.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Os scripts importam arquivos .ts sem "type": "module"; esse aviso do Node só faz barulho na saída dos agentes.
const SEM_AVISO = '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON';

function delegar(script, args) {
	const env = { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} ${SEM_AVISO}`.trim() };
	const r = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', script), ...args], { stdio: 'inherit', cwd: RAIZ, env });
	return r.status ?? 1;
}

export const COMANDOS = {
	ajuda: { descricao: 'Lista os comandos disponíveis.', executar: () => { imprimirAjuda(); return 0; } },
	doctor: {
		descricao: 'Confere o ambiente (Node, pnpm, FFmpeg, Python, pacotes, pastas) e diz o que instalar.',
		executar: (_args, json) => {
			const r = rodarDoctor();
			if (json) console.log(JSON.stringify(r, null, 2));
			else {
				console.log(r.ok ? '✅ Ambiente pronto para gerar vídeos.' : '❌ Faltam itens obrigatórios.');
				for (const c of r.checagens) {
					console.log(`  ${c.ok ? '✓' : c.nivel === 'erro' ? '✗' : '!'} ${c.mensagem}`);
					if (!c.ok && c.corrigir) console.log(`      → ${c.corrigir}`);
				}
			}
			return r.ok ? 0 : 1;
		},
	},
	componentes: {
		descricao: 'Lista os componentes do catálogo (nomes válidos para --cenas e specs) com descrição e props padrão.',
		executar: async (_args, json) => {
			process.removeAllListeners('warning');
			const { VIBE_COMPONENT_METADATA } = await import('../src/timeline/componentCatalog.ts');
			const lista = Object.values(VIBE_COMPONENT_METADATA);
			if (json) console.log(JSON.stringify(lista, null, 2));
			else for (const c of lista) console.log(`${c.name} [${c.category}] — ${c.description}`);
			return 0;
		},
	},
	roteiro: { descricao: 'Reel a partir de um roteiro: voz, legenda alinhada ao texto, uma cena por frase, render e masterização.', executar: (args) => delegar('pipeline_script_to_video.mjs', args) },
	estilos: {
		descricao: 'Lista os pacotes de estilo (cores, legenda, clima) para usar com --estilo no comando roteiro.',
		executar: async (_args, json) => {
			process.removeAllListeners('warning');
			const { listarEstilos } = await import('./estilos.mjs');
			const lista = listarEstilos();
			if (json) console.log(JSON.stringify(lista, null, 2));
			else for (const e of lista) console.log(`${e.id.padEnd(22)} ${e.nome} — ${e.clima}`);
			return 0;
		},
	},
	carrossel: { descricao: 'Carrossel estático 4:5: um spec JSON vira slides PNG (1080x1350) mais uma folha de contato para conferir.', executar: (args) => delegar('carrossel.mjs', args) },
	'reel-gravacao': { descricao: 'Reel com a SUA gravação: corta silêncio, legenda Hormozi, masteriza e verifica (--roteiro usa o seu texto na legenda).', executar: (args) => delegar('reel_gravacao.mjs', args) },
	'cortar-silencio': { descricao: 'Remove pausas longas de uma gravação (use --simular para só ver o que seria cortado).', executar: (args) => delegar('cortar_silencio.mjs', args) },
	verificar: { descricao: 'Portão de qualidade do vídeo pronto: formato, fps, -14 LUFS, pico, imagem parada.', executar: (args) => delegar('verificar_video.mjs', args) },
	pastas: { descricao: 'Cria (ou confere com --verificar) as pastas locais do estúdio.', executar: (args) => delegar('preparar_pastas.mjs', args) },
};

/** Separa comando, argumentos e a flag --json (que o vibe consome). */
export function rotear(argv) {
	const args = [...argv];
	const json = args.includes('--json') && !['verificar'].includes(args[0]);
	const [comando, ...resto] = args;
	if (!comando) return { comando: 'ajuda', args: [], json: false };
	if (!(comando in COMANDOS)) return { comando: 'desconhecido', pedido: comando, args: resto, json };
	return { comando, args: json ? resto.filter((a) => a !== '--json') : resto, json };
}

function imprimirAjuda() {
	console.log('Uso: pnpm vibe <comando> [argumentos]\n');
	for (const [nome, c] of Object.entries(COMANDOS)) console.log(`  ${nome.padEnd(16)} ${c.descricao}`);
	console.log('\nExemplo: pnpm vibe roteiro "Você perde clientes. Comece hoje." --vertical --voz thalita');
}

async function main() {
	const r = rotear(process.argv.slice(2));
	// process.exitCode (não process.exit): sair no meio de uma escrita em pipe trunca a saída (Linux) ou derruba o libuv (Windows).
	if (r.comando === 'desconhecido') {
		console.error(`Comando desconhecido: ${r.pedido}. Rode: pnpm vibe ajuda`);
		process.exitCode = 2;
		return;
	}
	process.exitCode = await COMANDOS[r.comando].executar(r.args, r.json);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
