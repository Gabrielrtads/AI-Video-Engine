#!/usr/bin/env node
/**
 * Aceitação: um pedido em linguagem natural vai para um agente de IA num CLONE LIMPO do repositório e o resultado
 * é julgado só por portões medidos. É assim que se prova (ou não) que o estúdio eleva modelos mais fracos.
 *
 * Uso:
 *   node scripts/aceitacao.mjs --modelo gemini-3.8-flash-high --cenario motion [--repo <url|pasta>] [--tempo 25m]
 *   node scripts/aceitacao.mjs --placar [pasta-de-resultados]
 *
 * `--pular-permissoes`: o agy em modo não interativo nega todo comando de shell; esta flag liga o
 * --dangerously-skip-permissions dele. Use só aqui, no clone descartável em C:dsacc, e sabendo que o agente
 * pode executar qualquer comando na máquina. Por isso exige ACEITACAO_ISOLADA=1 no ambiente e o repositório oficial.
 *
 * Cenários: carrossel, motion, roteiro. O agente roda pela CLI `agy` (veja `agy models`). Cada execução fica em
 * <base>/<data>-<modelo>-<cenario>/ (clone, resposta, resultado.json e cópia dos arquivos gerados). A base é
 * C:\vdsacc no Windows (caminho curto: o Remotion quebra acima de 260 caracteres) ou <tmp>/vdsacc.
 * Não reseta cota nem compra nada: se o agente bater no limite, a execução é marcada como bloqueada e para.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { AVALIADORES, CENARIOS, detectarCota, exigirIsolamento, lerBrief, montarArgsAgy, montarPrompt, placar } from './aceitacao_lib.mjs';

const REPO_PADRAO = 'https://github.com/Gabrielrtads/vibe-design-studio.git';
export const BASE = process.platform === 'win32' ? 'C:\\vdsacc' : path.join(os.tmpdir(), 'vdsacc');

function copiarArtefatos(clone, destino) {
	const copiados = [];
	const visitar = (dir) => {
		if (!fs.existsSync(dir)) return;
		for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
			const p = path.join(dir, e.name);
			if (e.isDirectory()) visitar(p);
			else if (/\.(mp4|png|json)$/.test(e.name) && !/node_modules/.test(p)) {
				const rel = path.relative(path.join(clone, 'out'), p);
				const alvo = path.join(destino, 'artefatos', rel);
				fs.mkdirSync(path.dirname(alvo), { recursive: true });
				fs.copyFileSync(p, alvo);
				copiados.push(rel);
			}
		}
	};
	visitar(path.join(clone, 'out'));
	return copiados;
}

export function executar({ modelo, cenario, repo = REPO_PADRAO, tempo = '25m', pularPermissoes = false }) {
	exigirIsolamento({ pularPermissoes, repo });
	if (!CENARIOS[cenario]) throw new Error(`Cenário desconhecido: ${cenario}. Use: ${Object.keys(CENARIOS).join(', ')}`);
	const carimbo = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
	const pasta = path.join(BASE, `${carimbo}-${modelo}-${cenario}`);
	const clone = path.join(pasta, 'repo');
	fs.mkdirSync(pasta, { recursive: true });

	const git = spawnSync('git', ['clone', '--depth', '1', repo, clone], { encoding: 'utf8' });
	if (git.status !== 0) throw new Error(`git clone falhou: ${git.stderr}`);
	const instalar = spawnSync('pnpm', ['install', '--frozen-lockfile'], { cwd: clone, encoding: 'utf8', shell: process.platform === 'win32' });
	if (instalar.status !== 0) throw new Error(`pnpm install falhou no clone: ${instalar.stderr.slice(-400)}`);

	const prompt = montarPrompt(lerBrief(cenario));
	const inicio = Date.now();
	const agente = spawnSync('agy', montarArgsAgy({ modelo, prompt, tempoLimite: tempo, pularPermissoes }), { cwd: clone, encoding: 'utf8', timeout: 35 * 60 * 1000, maxBuffer: 64 * 1024 * 1024 });
	const segundos = Math.round((Date.now() - inicio) / 1000);
	const saida = `${agente.stdout ?? ''}\n${agente.stderr ?? ''}`;
	fs.writeFileSync(path.join(pasta, 'resposta_agente.txt'), saida);

	let resposta = '';
	let negadas = [];
	try {
		const j = JSON.parse(agente.stdout);
		resposta = j.response ?? '';
		negadas = j.denied_actions ?? [];
	} catch { resposta = saida.slice(-1500); }

	const cota = detectarCota(saida);
	const status = spawnSync('git', ['status', '--porcelain'], { cwd: clone, encoding: 'utf8' }).stdout.split('\n').filter(Boolean);
	const mexeuNoCodigo = status.filter((l) => /\s(src|scripts|tests)\//.test(l) || /\.tsx\b/.test(l));
	const julgamento = cota.bloqueado ? { ok: false, checagens: [{ id: 'cota', ok: false, mensagem: `agente bloqueado por limite de uso: ${cota.trecho}` }] } : AVALIADORES[cenario](clone, CENARIOS[cenario].esperado);

	const copiados = copiarArtefatos(clone, pasta);
	const resultado = { modelo, cenario, repo, segundos, bloqueadoPorCota: cota.bloqueado, ok: julgamento.ok, checagens: julgamento.checagens, usouVibe: /pnpm vibe/.test(saida), acoesNegadas: negadas, mexeuNoCodigo, respostaFinal: resposta, artefatos: copiados, pasta };
	fs.writeFileSync(path.join(pasta, 'resultado.json'), JSON.stringify(resultado, null, 2));
	return resultado;
}

function lerResultados(base) {
	if (!fs.existsSync(base)) return [];
	return fs.readdirSync(base).map((d) => path.join(base, d, 'resultado.json')).filter((f) => fs.existsSync(f)).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
}

function main() {
	const args = process.argv.slice(2);
	const opt = (n, p) => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : p; };
	if (args.includes('--placar')) {
		const base = args[args.indexOf('--placar') + 1]?.startsWith('--') || !args[args.indexOf('--placar') + 1] ? BASE : args[args.indexOf('--placar') + 1];
		console.log(JSON.stringify(placar(lerResultados(base)), null, 2));
		return;
	}
	const pularPermissoes = args.includes('--pular-permissoes');
	if (pularPermissoes) args.splice(args.indexOf('--pular-permissoes'), 1);
	const modelo = opt('--modelo', null);
	const cenario = opt('--cenario', null);
	if (!modelo || !cenario) {
		console.error('Uso: node scripts/aceitacao.mjs --modelo <id do agy> --cenario carrossel|motion|roteiro [--repo url] [--tempo 25m]  |  --placar');
		process.exitCode = 2;
		return;
	}
	try {
		const r = executar({ modelo, cenario, repo: opt('--repo', REPO_PADRAO), tempo: opt('--tempo', '25m'), pularPermissoes });
		console.log(`\n${r.ok ? '✅ PASSOU' : '❌ FALHOU'}: ${modelo} / ${cenario} em ${r.segundos}s${r.bloqueadoPorCota ? ' (BLOQUEADO POR COTA)' : ''}`);
		for (const c of r.checagens) console.log(`  ${c.ok ? '✓' : '✗'} ${c.id}: ${c.mensagem}`);
		if (r.acoesNegadas.length) console.log(`  ⚠ ${r.acoesNegadas.length} ação(ões) negada(s) por permissão (regra faltando em permissions.allow?)`);
		console.log(`  usou pnpm vibe: ${r.usouVibe ? 'sim' : 'NÃO'}; mexeu no código do estúdio: ${r.mexeuNoCodigo.length ? r.mexeuNoCodigo.join(', ') : 'não'}`);
		console.log(`  resposta final do agente (não vale como prova): ${r.respostaFinal.slice(0, 300).replace(/\s+/g, ' ')}`);
		console.log(`  tudo em: ${r.pasta}`);
		process.exitCode = r.ok ? 0 : 1;
	} catch (e) {
		console.error(`[Erro aceitação] ${e.message}`);
		process.exitCode = 2;
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
