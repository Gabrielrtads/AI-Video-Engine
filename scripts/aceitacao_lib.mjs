/**
 * Parte pura do harness de aceitação (testada em tests/unit/aceitacao_lib.test.mjs): cenários, argumentos do agente,
 * portões medidos e placar. O agente nunca é julgado pelo que ele diz, só pelo que ficou no disco.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { medirImagem } from './carrossel.mjs';
import { verificarVideo } from './verificar_video.mjs';
import { validarSpec } from '../src/timeline/carrosselSpec.ts';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IGNORADAS = new Set(['node_modules', '.git', '.worktrees']);

export const CENARIOS = {
	carrossel: { brief: 'carrossel', esperado: { slides: 5 } },
	motion: { brief: 'motion', esperado: { textos: ['Barbearia Flow', 'Corte, barba e assinatura'] } },
	roteiro: { brief: 'roteiro', esperado: { textos: ['lembrete', 'agenda'] } },
};

export function lerBrief(id) {
	return fs.readFileSync(path.join(RAIZ, 'tests', 'aceitacao', 'briefs', `${CENARIOS[id].brief}.md`), 'utf8').trim();
}

/** O agente recebe só o pedido do usuário: o caminho ele precisa achar pelo AGENTS.md e pelo SKILL.md do repositório. */
export function montarPrompt(brief) {
	return `Você está no repositório vibe-design-studio. Atenda ao pedido do usuário abaixo e, ao terminar, diga onde ficaram os arquivos.\n\nPedido do usuário:\n${brief}`;
}

/** Em modo não interativo o agy nega todo comando de shell. `pularPermissoes` liga a flag dele que aprova tudo: só para o clone descartável da aceitação. */
export function montarArgsAgy({ modelo, prompt, tempoLimite = '25m', pularPermissoes = false }) {
	const args = ['--print', prompt, '--model', modelo, '--mode', 'accept-edits', '--output-format', 'json', '--print-timeout', tempoLimite];
	if (pularPermissoes) args.push('--dangerously-skip-permissions');
	return args;
}

export const REPO_CONFIAVEL = 'https://github.com/Gabrielrtads/vibe-design-studio.git';

/**
 * Pular permissões deixa o agente rodar qualquer comando na máquina. Só com confirmação explícita de quem roda
 * (ACEITACAO_ISOLADA=1, "sei que o agente não está isolado e aceito") e só com o repositório confiável, para um
 * clone de terceiros não virar execução de código arbitrário.
 */
export function exigirIsolamento({ pularPermissoes, repo, env = process.env }) {
	if (!pularPermissoes) return;
	if (env.ACEITACAO_ISOLADA !== '1') throw new Error('--pular-permissoes exige ACEITACAO_ISOLADA=1 no ambiente: o agente poderá rodar qualquer comando nesta máquina. Confirme conscientemente.');
	if (repo !== REPO_CONFIAVEL) throw new Error(`--pular-permissoes só vale com o repositório confiável (${REPO_CONFIAVEL}), não com ${repo}.`);
}

export function detectarCota(saida) {
	const t = String(saida);
	const bloqueado = /quota|resource_exhausted|rate.?limit|limite de uso|usage limit|too many requests|\b429\b/i.test(t) && !/"status"\s*:\s*"SUCCESS"/.test(t);
	return { bloqueado, trecho: bloqueado ? t.slice(0, 300) : '' };
}

function listar(dir, aceita, acc = []) {
	if (!fs.existsSync(dir)) return acc;
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		if (IGNORADAS.has(e.name)) continue;
		const p = path.join(dir, e.name);
		if (e.isDirectory()) listar(p, aceita, acc);
		else if (aceita(p)) acc.push(p);
	}
	return acc;
}

const maisRecente = (arquivos) => [...arquivos].sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0] ?? null;
const resultado = (checagens) => ({ ok: checagens.length > 0 && checagens.every((c) => c.ok), checagens });
const checa = (checagens, id, ok, mensagem) => checagens.push({ id, ok: Boolean(ok), mensagem });

export function avaliarCarrossel(dir, { slides }) {
	const c = [];
	const pngs = listar(path.join(dir, 'out'), (p) => /slide-\d+\.png$/.test(p));
	const porPasta = new Map();
	for (const p of pngs) porPasta.set(path.dirname(p), [...(porPasta.get(path.dirname(p)) ?? []), p]);
	const melhor = [...porPasta.values()].sort((a, b) => b.length - a.length)[0] ?? [];
	checa(c, 'quantidade', melhor.length === slides, `${melhor.length} slide(s) PNG (o pedido era ${slides})`);
	if (melhor.length > 0) {
		const medidas = melhor.map((p) => medirImagem(p));
		const tortos = medidas.filter((m) => m.largura !== 1080 || m.altura !== 1350);
		checa(c, 'dimensoes', tortos.length === 0, tortos.length ? `${tortos.length} slide(s) fora de 1080x1350` : 'todos 1080x1350');
		const vazios = medidas.filter((m) => m.desvioPadrao <= 12);
		checa(c, 'conteudo-visual', vazios.length === 0, vazios.length ? `${vazios.length} slide(s) quase em branco` : 'nenhum slide em branco');
		const hashes = new Set(melhor.map((p) => crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex')));
		checa(c, 'slides-diferentes', hashes.size === melhor.length, `${hashes.size} imagem(ns) distinta(s) em ${melhor.length}`);
	}
	const specs = listar(dir, (p) => p.endsWith('.json') && !p.includes(`${path.sep}out${path.sep}temp`) && !p.includes(`${path.sep}src${path.sep}`) && !p.includes(`${path.sep}tests${path.sep}`) && !/package(-lock)?\.json$/.test(p) && /"slides"/.test(fs.readFileSync(p, 'utf8')));
	let specValida = false;
	if (specs.length) {
		try {
			specValida = validarSpec(JSON.parse(fs.readFileSync(maisRecente(specs), 'utf8'))).ok;
		} catch {
			specValida = false;
		}
	}
	checa(c, 'spec-do-carrossel', specValida, specs.length ? (specValida ? 'spec válida pelo validador do estúdio' : 'a spec existe, mas o validador do estúdio a recusa') : 'nenhuma spec de carrossel encontrada (o agente não usou o comando?)');
	return resultado(c);
}

function avaliarVideo(dir, { textos }, opcoesVerificar) {
	const c = [];
	const video = maisRecente(listar(path.join(dir, 'out'), (p) => p.endsWith('.mp4')));
	checa(c, 'video', Boolean(video), video ? path.relative(dir, video) : 'nenhum MP4 em out/');
	if (video) {
		try {
			const v = verificarVideo(video, { formato: '9:16', ...opcoesVerificar });
			for (const k of v.checagens) checa(c, `verificar:${k.id}`, k.ok, k.mensagem);
		} catch (e) {
			checa(c, 'verificar', false, e.message);
		}
	}
	const timelines = listar(path.join(dir, 'out'), (p) => /timeline.*\.json$/.test(p));
	const texto = timelines.map((p) => fs.readFileSync(p, 'utf8')).join('\n').toLowerCase();
	const faltam = textos.filter((t) => !texto.includes(t.toLowerCase()));
	checa(c, 'conteudo', timelines.length > 0 && faltam.length === 0, faltam.length ? `a timeline não traz: ${faltam.join(' | ')}` : 'os textos do pedido estão na timeline');
	return resultado(c);
}

export const avaliarMotion = (dir, esperado) => avaliarVideo(dir, esperado, { semAudio: true });
export const avaliarRoteiro = (dir, esperado) => avaliarVideo(dir, esperado, {});

export const AVALIADORES = { carrossel: avaliarCarrossel, motion: avaliarMotion, roteiro: avaliarRoteiro };

export function placar(execucoes) {
	const por = {};
	for (const e of execucoes) {
		const m = (por[e.modelo] ??= { passou: 0, total: 0, taxa: 0 });
		m.total++;
		if (e.ok) m.passou++;
		m.taxa = m.passou / m.total;
	}
	return por;
}
