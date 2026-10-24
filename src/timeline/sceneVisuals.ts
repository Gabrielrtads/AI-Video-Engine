/**
 * Receitas visuais por cena: o visual de cada frase vem do conteúdo dela (número, pergunta, chamada para
 * ação) e, quando a frase não pede nada especial, de uma rotação determinística que nunca repete o visual
 * da cena anterior. Sem dependência de Remotion.
 */
import { keyPhrase } from './textoCena.ts';
import type { Scene } from './textoCena.ts';

export type Receita = 'celular' | 'cartao' | 'planeta' | 'frase' | 'curva' | 'numero' | 'pergunta' | 'cta';

export interface NumeroExtraido {
	valor: number;
	decimais: number;
	prefixo: string;
	sufixo: string;
}

export interface EstiloVisual {
	texto: string;
	acento: string;
	planeta?: string;
	cartao?: string;
}

const SEM_LETRA_DEPOIS = '(?![A-Za-zÀ-ÿ])';
const REGEX_NUMERO = new RegExp(`(R\\$\\s?)?(\\d{1,3}(?:\\.\\d{3})+|\\d+)(?:,(\\d{1,2}))?(?:\\s?(%|milhões|milhão|mil|mi|k|x|X)${SEM_LETRA_DEPOIS})?`, 'g');
const SUFIXOS: Record<string, string> = { '%': '%', x: 'x', X: 'x', k: 'k', mil: ' mil', mi: ' mi', 'milhões': ' milhões', 'milhão': ' milhão' };

/** Primeiro número "que merece destaque": com unidade (%, R$, x, mil...) ou com 10 ou mais; ignora anos. */
export function extrairNumero(texto: string): NumeroExtraido | null {
	for (const m of texto.matchAll(REGEX_NUMERO)) {
		const prefixo = m[1] ? 'R$ ' : '';
		const inteiro = parseInt(m[2].replace(/\./g, ''), 10);
		const decimal = m[3] ?? '';
		const valor = decimal ? parseFloat(`${inteiro}.${decimal}`) : inteiro;
		const sufixo = m[4] ? SUFIXOS[m[4]] : '';
		const temUnidade = Boolean(prefixo || sufixo);
		const ehAno = !temUnidade && !decimal && inteiro >= 1900 && inteiro <= 2100;
		if (ehAno) continue;
		if (!temUnidade && valor < 10) continue;
		return { valor, decimais: decimal.length, prefixo, sufixo };
	}
	return null;
}

const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const VERBO_DE_ACAO = /\b(comece|agende|clique|chame|garanta|fale|acesse|baixe|siga|comente|salve|compartilhe|experimente|teste|cadastre|aproveite|peca|solicite|reserve|marque|venha|entre|junte)\b/;

/** Receita pedida pelo conteúdo da frase, ou null quando ela não pede nada em especial. */
export function classificarCena(cena: Scene, ehUltima: boolean): Receita | null {
	const t = semAcento(cena.texto);
	if (ehUltima && VERBO_DE_ACAO.test(t)) return 'cta';
	if (/\?\s*["'”’)]*$/.test(cena.texto.trim())) return 'pergunta';
	if (extrairNumero(cena.texto)) return 'numero';
	return null;
}

const POOLS: Record<string, Receita[]> = {
	hormozi: ['celular', 'frase', 'cartao', 'planeta'],
	editorial: ['cartao', 'frase', 'planeta', 'curva'],
	keynote: ['cartao', 'frase', 'planeta', 'curva'],
	tech: ['curva', 'planeta', 'frase', 'celular'],
};

/** Uma receita por cena: conteúdo manda; o resto gira sem repetir vizinhas; 4+ cenas têm ao menos 3 receitas. */
export function escolherReceitas(cenas: Scene[], preset = 'hormozi'): Receita[] {
	const pool = POOLS[preset] ?? POOLS.hormozi;
	const n = cenas.length;
	if (n === 0) return [];
	const resultado: Array<Receita | null> = cenas.map((c, i) => classificarCena(c, i === n - 1));
	const porConteudo = new Set<number>();
	for (let i = 0; i < n; i++) {
		if (resultado[i] && i > 0 && resultado[i] === resultado[i - 1]) resultado[i] = null; // nunca em sequência
		if (resultado[i]) porConteudo.add(i);
	}

	let cursor = 0; // a primeira cena sem pedido do conteúdo usa a assinatura do preset (celular no hormozi, cartão no editorial)
	const escolher = (i: number, exclui: Array<Receita | null | undefined>): Receita | null => {
		for (let k = 0; k < pool.length; k++) {
			const candidata = pool[(cursor + k) % pool.length];
			if (!exclui.includes(candidata)) return candidata;
		}
		return null;
	};
	for (let i = 0; i < n; i++) {
		if (resultado[i]) continue;
		const anterior = resultado[i - 1];
		const proxima = resultado[i + 1];
		const antes2 = resultado[i - 2];
		const escolhida = escolher(i, [anterior, proxima, antes2]) ?? escolher(i, [anterior, proxima]) ?? escolher(i, [anterior]) ?? pool[0];
		resultado[i] = escolhida;
		cursor++;
	}

	// Garante 3 receitas distintas em vídeos com 4+ cenas trocando cenas que não são guiadas pelo conteúdo
	if (n >= 4) {
		for (let tentativa = 0; tentativa < n && new Set(resultado).size < 3; tentativa++) {
			const usadas = new Set(resultado);
			const nova = pool.find((r) => !usadas.has(r));
			const alvo = [...resultado.keys()].find((i) => !porConteudo.has(i) && resultado[i - 1] !== nova && resultado[i + 1] !== nova);
			if (!nova || alvo === undefined) break;
			resultado[alvo] = nova;
		}
	}
	return resultado as Receita[];
}

function frase(texto: string, maxPalavras: number, manterPontuacaoFinal: boolean): string {
	const cortada = texto.trim().split(/\s+/).slice(0, maxPalavras).join(' ');
	return manterPontuacaoFinal ? cortada : cortada.replace(/[.!?…,;:]+$/u, '');
}

/** Converte uma receita no componente do catálogo, com o texto da cena e as cores do estilo. */
export function receitaParaVisual(receita: Receita, cena: Scene, estilo?: Partial<EstiloVisual>): { componentName: string; props: Record<string, unknown>; chave: string } {
	const corTexto = estilo?.texto ?? '#F8FAFC';
	const corAcento = estilo?.acento ?? '#38BDF8';
	const curta = keyPhrase(cena.texto);
	const montar = (componentName: string, props: Record<string, unknown>) => ({
		componentName,
		props,
		chave: componentName === 'FraseDestaque' ? `FraseDestaque:${props.variant}` : componentName,
	});
	switch (receita) {
		case 'numero': {
			const n = extrairNumero(cena.texto) ?? { valor: 0, decimais: 0, prefixo: '', sufixo: '' };
			return montar('NumeroDestaque', { ...n, rotulo: frase(cena.texto, 8, false), corTexto, corAcento });
		}
		case 'pergunta':
			return montar('FraseDestaque', { texto: frase(cena.texto, 10, true), variant: 'pergunta', corTexto, corAcento });
		case 'cta':
			return montar('FraseDestaque', { texto: frase(cena.texto, 10, false), variant: 'cta', corTexto, corAcento });
		case 'frase':
			return montar('FraseDestaque', { texto: frase(cena.texto, 9, false), variant: 'afirmacao', corTexto, corAcento });
		case 'cartao':
			return montar('FraseDestaque', { texto: frase(cena.texto, 9, false), variant: 'cartao', corTexto, corAcento });
		case 'planeta':
			return montar('OrbitalPlanet3D', { theme: estilo?.planeta ?? 'cyber-blue' });
		case 'curva':
			return montar('AnimatedBezierCurve', { strokeColor: corAcento, fillGradient: true });
		case 'celular':
		default:
			return montar('Smartphone3DMockup', { title: curta, description: '', urlBadge: '' });
	}
}
