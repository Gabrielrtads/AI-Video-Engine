#!/usr/bin/env node
/**
 * Motion graphics sem narração a partir de MODELOS fechados (título cinético, cartão de marca, dataviz).
 *
 * Uso:
 *   node scripts/motion.mjs modelos [--json]          lista os modelos e os campos de cada um
 *   node scripts/motion.mjs exemplo <modelo>          imprime uma spec pronta para copiar e editar
 *   node scripts/motion.mjs <spec.json> [--saida out/videos/x.mp4]
 *
 * A spec escolhe o modelo e traz só texto e número; fundo, cenas, tempo e cores vêm do código e do pacote de
 * estilo (`pnpm vibe estilos`). Etapas: valida -> monta a timeline -> renderiza (Remotion) -> verifica
 * (formato, 30 fps, sem imagem parada) -> folha de contato. Sai com código 1 se o verificador reprovar.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { carregarEstilo } from './estilos.mjs';
import { gerarFolha, verificarVideo } from './verificar_video.mjs';
import { validateTimelineSchema } from '../src/timeline/compileTimeline.ts';
import { EXEMPLOS, MODELOS, descreverModelos, montarTimelineMotion, validarMotionSpec } from '../src/timeline/motionModelos.ts';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ESTILO_PADRAO_ID = 'escuro-tech';

export async function produzirMotion({ spec, saida = null, silencioso = false }) {
	const log = (...a) => { if (!silencioso) console.log(...a); };
	// Tudo que pode estar errado é conferido ANTES de gastar render
	const validacao = validarMotionSpec(spec);
	if (!validacao.ok) throw new Error(`Spec de motion inválida:\n  - ${validacao.erros.join('\n  - ')}`);
	const estilo = carregarEstilo(spec.estilo ?? ESTILO_PADRAO_ID);
	const formato = spec.formato ?? '9:16';

	log(`[1/3] Montando a timeline (${MODELOS[spec.modelo].nome}, estilo ${estilo.id}, ${formato})...`);
	const timeline = montarTimelineMotion(spec, estilo);
	const esquema = validateTimelineSchema(timeline);
	if (!esquema.valid) throw new Error(`Timeline inválida: ${esquema.errors.join('; ')}`);

	const destino = path.resolve(saida ?? path.join('out', 'videos', `${spec.nome}.mp4`));
	const temp = path.join(RAIZ, 'out', 'temp');
	fs.mkdirSync(temp, { recursive: true });
	fs.mkdirSync(path.dirname(destino), { recursive: true });
	const timelineJson = path.join(temp, `timeline_motion_${spec.nome}.json`);
	fs.writeFileSync(timelineJson, JSON.stringify({ timeline }, null, 2));

	log('[2/3] Renderizando...');
	const render = spawnSync(process.execPath, [path.join(RAIZ, 'node_modules', '@remotion', 'cli', 'remotion-cli.js'), 'render', 'src/index.tsx', 'JsonTimelineVideo', destino, `--props=${timelineJson}`, '--codec=h264', '--crf=18'], { cwd: RAIZ, stdio: silencioso ? 'ignore' : 'inherit', windowsHide: true });
	if (render.status !== 0 || !fs.existsSync(destino)) throw new Error(`Falha na renderização Remotion (código ${render.status}).`);

	log('[3/3] Verificando o resultado...');
	const verificacao = verificarVideo(destino, { formato, semAudio: true });
	const folha = gerarFolha(destino, path.join(path.dirname(destino), `${spec.nome}_folha`), verificacao.medidas.duracao);
	return { saida: destino, modelo: spec.modelo, formato, estilo: estilo.id, duracao: verificacao.medidas.duracao, verificacao, folha, timeline: timelineJson };
}

function main() {
	const args = process.argv.slice(2);
	const opt = (nome, padrao) => {
		const i = args.indexOf(nome);
		return i >= 0 ? args.splice(i, 2)[1] : padrao;
	};
	const json = args.includes('--json');
	if (json) args.splice(args.indexOf('--json'), 1);
	const saida = opt('--saida', null);
	const [primeiro, segundo] = args;

	if (primeiro === 'modelos') {
		if (json) console.log(JSON.stringify(descreverModelos(), null, 2));
		else {
			for (const m of descreverModelos()) console.log(`${m.id}: ${m.descricao}\n  campos: ${m.campos.join('; ')}`);
			console.log('\nPróximo passo: pnpm vibe motion exemplo <modelo>');
		}
		return;
	}
	if (primeiro === 'exemplo') {
		if (!segundo || !EXEMPLOS[segundo]) {
			console.error(`Uso: motion exemplo <${Object.keys(EXEMPLOS).join('|')}>`);
			process.exitCode = 2;
			return;
		}
		console.log(JSON.stringify(EXEMPLOS[segundo], null, 2));
		return;
	}
	if (!primeiro) {
		console.error('Uso: node scripts/motion.mjs <spec.json> [--saida out/videos/x.mp4]  |  modelos  |  exemplo <modelo>');
		process.exitCode = 2;
		return;
	}
	let spec;
	try {
		spec = JSON.parse(fs.readFileSync(path.resolve(primeiro), 'utf8'));
	} catch (e) {
		console.error(`[Erro motion] Não consegui ler ${primeiro}: ${e.message}`);
		process.exitCode = 2;
		return;
	}
	produzirMotion({ spec, saida })
		.then((r) => {
			console.log(`\n${r.verificacao.ok ? '✅ APROVADO' : '❌ REPROVADO'}: ${r.saida}`);
			console.log(`   ${r.duracao.toFixed(1)} s, ${r.formato}, modelo ${r.modelo}, estilo ${r.estilo}`);
			for (const c of r.verificacao.checagens) console.log(`   ${c.ok ? '✓' : '✗'} ${c.id}: ${c.mensagem}`);
			if (r.folha) console.log(`   folha de contato: ${r.folha}`);
			process.exitCode = r.verificacao.ok ? 0 : 1;
		})
		.catch((e) => {
			console.error(`\n❌ [Erro motion] ${e.message}`);
			process.exitCode = 1;
		});
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
