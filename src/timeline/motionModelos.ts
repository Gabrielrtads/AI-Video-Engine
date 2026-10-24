/**
 * Motion graphics sem narração por MODELOS FECHADOS. O agente não monta timeline nem escolhe componente:
 * escolhe um modelo (título cinético, cartão de marca, dataviz) e preenche os campos de texto e número.
 * Fundo, cena, tempo, cores e geometria vêm do código e do pacote de estilo, então o resultado tem o mesmo
 * piso de gosto qualquer que seja o modelo de IA que preencheu o spec. Sem dependência de Remotion.
 */
import { pontosDeCurva } from './curvaMath.ts';
import { resolveAspectRatioMetrics } from './pipeline1ClickMath.ts';
import type { EstiloPacote } from './gosto.ts';
import type { ClipItem, TimelineState, TrackItem } from './types.ts';

export const FORMATOS_MOTION = ['9:16', '4:5', '16:9', '1:1'] as const;
export type FormatoMotion = (typeof FORMATOS_MOTION)[number];
export const FPS = 30;

type Obj = Record<string, unknown>;
const ehObjeto = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const ehTexto = (v: unknown, max: number, min = 1): v is string => typeof v === 'string' && v.trim().length >= min && v.trim().length <= max;

export interface ModeloMotion {
	id: string;
	nome: string;
	descricao: string;
	campos: string[];
}

export const MODELOS: Record<string, ModeloMotion> = {
	'titulo-cinetico': {
		id: 'titulo-cinetico',
		nome: 'Título cinético',
		descricao: 'Frases grandes que entram palavra por palavra, uma por vez, e a última pousa num cartão. Bom para abertura, manifesto e anúncio.',
		campos: ['linhas (1 a 4 frases de até 40 caracteres cada, obrigatório)'],
	},
	'cartao-de-marca': {
		id: 'cartao-de-marca',
		nome: 'Cartão de marca',
		descricao: 'Um cartão 3D flutuante com a marca, o slogan e um selo, sobre o fundo do estilo. Bom para apresentar uma marca ou produto.',
		campos: ['marca (até 24 caracteres, obrigatório)', 'slogan (até 60, opcional)', 'selo (até 20, opcional)'],
	},
	dataviz: {
		id: 'dataviz',
		nome: 'Dataviz',
		descricao: 'Números que contam até o valor e uma curva que desenha a série real. Bom para resultado, crescimento e prova numérica.',
		campos: ['titulo (até 40, opcional)', 'numeros (1 a 3: valor, rotulo, e opcional decimais, prefixo, sufixo)', 'serie (opcional: valores de 3 a 8 números, prefixo, sufixo)'],
	},
};

export function descreverModelos(): ModeloMotion[] {
	return Object.values(MODELOS);
}

/** Specs oficiais: o agente copia um deles (`vibe motion exemplo <modelo>`) e troca só os textos e números. */
export const EXEMPLOS: Record<string, Obj> = {
	'titulo-cinetico': {
		modelo: 'titulo-cinetico',
		nome: 'abertura-lancamento',
		formato: '9:16',
		estilo: 'escuro-tech',
		conteudo: { linhas: ['Sua agenda cheia', 'sem mandar mensagem', 'Comece hoje'] },
	},
	'cartao-de-marca': {
		modelo: 'cartao-de-marca',
		nome: 'marca-barbearia-flow',
		formato: '9:16',
		estilo: 'luxo-titanio',
		conteudo: { marca: 'Barbearia Flow', slogan: 'Corte, barba e assinatura num só lugar', selo: 'Desde 2024' },
	},
	dataviz: {
		modelo: 'dataviz',
		nome: 'resultado-do-mes',
		formato: '9:16',
		estilo: 'cash-verde',
		conteudo: {
			titulo: 'O mês da barbearia',
			numeros: [
				{ valor: 70, sufixo: '%', rotulo: 'menos faltas na agenda' },
				{ valor: 12500, prefixo: 'R$ ', rotulo: 'de receita recorrente' },
			],
			serie: { valores: [8200, 9100, 9800, 11000, 12500], prefixo: 'R$ ' },
		},
	},
};

const CAMPOS_RAIZ = ['modelo', 'nome', 'formato', 'estilo', 'conteudo'];
const CAMPOS_CONTEUDO: Record<string, string[]> = {
	'titulo-cinetico': ['linhas'],
	'cartao-de-marca': ['marca', 'slogan', 'selo'],
	dataviz: ['titulo', 'numeros', 'serie'],
};
const CAMPOS_NUMERO = ['valor', 'rotulo', 'decimais', 'prefixo', 'sufixo'];
const CAMPOS_SERIE = ['valores', 'prefixo', 'sufixo'];

function conferirCampos(erros: string[], onde: string, objeto: Obj, permitidos: string[]) {
	for (const chave of Object.keys(objeto)) if (!permitidos.includes(chave)) erros.push(`${onde}: campo desconhecido "${chave}" (permitidos: ${permitidos.join(', ')})`);
}

export function validarMotionSpec(spec: unknown): { ok: boolean; erros: string[] } {
	const erros: string[] = [];
	const dica = 'Copie um exemplo com `pnpm vibe motion exemplo <modelo>` e troque só os textos e números.';
	if (!ehObjeto(spec)) return { ok: false, erros: [`a spec precisa ser um objeto JSON. ${dica}`] };
	conferirCampos(erros, 'spec', spec, CAMPOS_RAIZ);

	if (typeof spec.nome !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(spec.nome)) erros.push('nome: use letras minúsculas, números e hífen (ex.: "abertura-lancamento")');
	if (spec.formato !== undefined && !(FORMATOS_MOTION as readonly string[]).includes(spec.formato as string)) erros.push(`formato: use ${FORMATOS_MOTION.join(', ')} (vertical 9:16 para reel, 4:5 para feed, 16:9 para YouTube, 1:1 quadrado)`);
	if (spec.estilo !== undefined && typeof spec.estilo !== 'string') erros.push('estilo: informe o id de um pacote (veja `pnpm vibe estilos`)');

	const modelo = spec.modelo;
	if (typeof modelo !== 'string' || !MODELOS[modelo]) {
		erros.push(`modelo: "${String(modelo)}" não existe. Modelos: ${Object.keys(MODELOS).join(', ')}. ${dica}`);
		return { ok: false, erros };
	}
	if (!ehObjeto(spec.conteudo)) {
		erros.push(`conteudo: informe os campos do modelo ${modelo}. ${dica}`);
		return { ok: false, erros };
	}
	const c = spec.conteudo;
	conferirCampos(erros, `conteudo (${modelo})`, c, CAMPOS_CONTEUDO[modelo]);

	if (modelo === 'titulo-cinetico') {
		if (!Array.isArray(c.linhas) || c.linhas.length < 1 || c.linhas.length > 4) erros.push('linhas: informe de 1 a 4 frases (cada uma vira uma cena)');
		else c.linhas.forEach((l, i) => { if (!ehTexto(l, 40)) erros.push(`linhas[${i}]: texto de 1 a 40 caracteres (esta tem ${typeof l === 'string' ? l.trim().length : 'tipo inválido'}); frase curta lê melhor na tela`); });
	}

	if (modelo === 'cartao-de-marca') {
		if (!ehTexto(c.marca, 24)) erros.push('marca: obrigatória, de 1 a 24 caracteres');
		if (c.slogan !== undefined && !ehTexto(c.slogan, 60)) erros.push('slogan: de 1 a 60 caracteres (ou tire o campo)');
		if (c.selo !== undefined && !ehTexto(c.selo, 20)) erros.push('selo: de 1 a 20 caracteres (ou tire o campo)');
	}

	if (modelo === 'dataviz') {
		if (c.titulo !== undefined && !ehTexto(c.titulo, 40)) erros.push('titulo: de 1 a 40 caracteres (ou tire o campo)');
		if (c.numeros === undefined && c.serie === undefined) erros.push('dataviz precisa de "numeros" (1 a 3) ou de "serie" (3 a 8 valores)');
		if (c.numeros !== undefined) {
			if (!Array.isArray(c.numeros) || c.numeros.length < 1 || c.numeros.length > 3) erros.push('numeros: informe de 1 a 3 números');
			else c.numeros.forEach((n, i) => {
				if (!ehObjeto(n)) return void erros.push(`numeros[${i}]: precisa ser um objeto { valor, rotulo }`);
				conferirCampos(erros, `numeros[${i}]`, n, CAMPOS_NUMERO);
				if (typeof n.valor !== 'number' || !Number.isFinite(n.valor)) erros.push(`numeros[${i}].valor: precisa ser um número (sem aspas)`);
				if (!ehTexto(n.rotulo, 40)) erros.push(`numeros[${i}].rotulo: diga o que o número mede, de 1 a 40 caracteres`);
				if (n.decimais !== undefined && (!Number.isInteger(n.decimais) || (n.decimais as number) < 0 || (n.decimais as number) > 2)) erros.push(`numeros[${i}].decimais: 0, 1 ou 2`);
				for (const k of ['prefixo', 'sufixo'] as const) if (n[k] !== undefined && (typeof n[k] !== 'string' || (n[k] as string).length > 6)) erros.push(`numeros[${i}].${k}: até 6 caracteres (ex.: "R$ " ou "%")`);
			});
		}
		if (c.serie !== undefined) {
			if (!ehObjeto(c.serie)) erros.push('serie: precisa ser { valores: [...] }');
			else {
				conferirCampos(erros, 'serie', c.serie, CAMPOS_SERIE);
				const v = c.serie.valores;
				if (!Array.isArray(v) || v.length < 3 || v.length > 8 || v.some((x) => typeof x !== 'number' || !Number.isFinite(x))) erros.push('serie.valores: de 3 a 8 números (sem aspas)');
				for (const k of ['prefixo', 'sufixo'] as const) if (c.serie[k] !== undefined && (typeof c.serie[k] !== 'string' || (c.serie[k] as string).length > 6)) erros.push(`serie.${k}: até 6 caracteres`);
			}
		}
	}
	return { ok: erros.length === 0, erros };
}

/** 12500 -> "12,5k", 1200000 -> "1,2M": cabe no selo do ponto da curva. */
export function formatarCompacto(valor: number): string {
	const abs = Math.abs(valor);
	const limpo = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');
	if (abs >= 1_000_000) return `${limpo(valor / 1_000_000)}M`;
	if (abs >= 1_000) return `${limpo(valor / 1_000)}k`;
	return limpo(valor);
}

interface Cena {
	componentName: string;
	frames: number;
	props: Obj;
}

const SEGUNDOS = { frase: 2.2, fraseFinal: 2.8, cartao: 5, titulo: 2, numero: 3, curva: 4 };
const frames = (s: number) => Math.round(s * FPS);

/** O cartão base tem 540x340 px: a escala o leva a ~78% da largura sem passar de metade da altura. */
export function escalaDoCartao(largura: number, altura: number): number {
	return Math.max(1, Math.round(Math.min((largura * 0.78) / 540, (altura * 0.5) / 340) * 100) / 100);
}

const CURVA_BASE = { largura: 540, altura: 300 };

/** Leva a curva base a ~84% da largura sem passar de pouco mais da metade da altura. */
export function escalaDaCurva(largura: number, altura: number): number {
	return Math.round(Math.min((largura * 0.84) / CURVA_BASE.largura, (altura * 0.5) / CURVA_BASE.altura) * 100) / 100;
}

function cenasDoModelo(spec: Obj, estilo: EstiloPacote, largura: number, altura: number, metricas: ReturnType<typeof resolveAspectRatioMetrics>): Cena[] {
	const c = spec.conteudo as Obj;
	const cores = { corTexto: estilo.texto, corAcento: estilo.acento };
	if (spec.modelo === 'titulo-cinetico') {
		const linhas = (c.linhas as string[]).map((l) => l.trim());
		return linhas.map((texto, i) => {
			const ultima = i === linhas.length - 1;
			return { componentName: 'FraseDestaque', frames: frames(ultima ? SEGUNDOS.fraseFinal : SEGUNDOS.frase), props: { texto, variant: ultima && linhas.length > 1 ? 'cartao' : 'afirmacao', ...cores } };
		});
	}
	if (spec.modelo === 'cartao-de-marca') {
		return [{
			componentName: 'AppleKineticCard3D',
			frames: frames(SEGUNDOS.cartao),
			props: { title: (c.marca as string).trim(), subtitle: c.slogan ? (c.slogan as string).trim() : undefined, badge: c.selo ? (c.selo as string).trim() : '', variant: estilo.cartao ?? 'dark-glass', escala: escalaDoCartao(largura, altura), tiltIntensity: 0.8 },
		}];
	}
	// dataviz
	const cenas: Cena[] = [];
	if (c.titulo) cenas.push({ componentName: 'FraseDestaque', frames: frames(SEGUNDOS.titulo), props: { texto: (c.titulo as string).trim(), variant: 'afirmacao', ...cores } });
	for (const n of (c.numeros as Obj[] | undefined) ?? []) {
		cenas.push({ componentName: 'NumeroDestaque', frames: frames(SEGUNDOS.numero), props: { valor: n.valor, decimais: n.decimais ?? 0, prefixo: n.prefixo ?? '', sufixo: n.sufixo ?? '', rotulo: (n.rotulo as string).trim(), ...cores } });
	}
	if (c.serie) {
		const s = c.serie as Obj;
		// Desenhada em 540x300 (o texto dos pontos tem 10 px fixos) e escalada para ocupar a tela
		const w = CURVA_BASE.largura;
		const h = CURVA_BASE.altura;
		const prefixo = (s.prefixo as string | undefined) ?? '';
		const sufixo = (s.sufixo as string | undefined) ?? '';
		cenas.push({
			componentName: 'AnimatedBezierCurve',
			frames: frames(SEGUNDOS.curva),
			props: { width: w, height: h, escala: escalaDaCurva(largura, altura), strokeColor: estilo.acento, fillGradient: true, points: pontosDeCurva(s.valores as number[], w, h, { formatar: (v) => `${prefixo.trim()}${formatarCompacto(v)}${sufixo.trim()}` }) },
		});
	}
	return cenas;
}

export function montarTimelineMotion(spec: unknown, estilo: EstiloPacote): TimelineState {
	const validacao = validarMotionSpec(spec);
	if (!validacao.ok) throw new Error(`Spec de motion inválida:\n  - ${validacao.erros.join('\n  - ')}`);
	const s = spec as Obj;
	const formato = ((s.formato as FormatoMotion | undefined) ?? '9:16');
	const metricas = resolveAspectRatioMetrics(formato);
	const cenas = cenasDoModelo(s, estilo, metricas.width, metricas.height, metricas);
	const total = cenas.reduce((soma, c) => soma + c.frames, 0);

	const tracks: TrackItem[] = [
		{ id: 'T_FUNDO', kind: 'graphics', name: 'Fundo do estilo', zIndex: 2 },
		{ id: 'T_BG', kind: 'graphics', name: 'Background FX', zIndex: 10 },
		{ id: 'T_HERO', kind: 'graphics', name: 'Cenas', zIndex: 20 },
	];
	const clips: ClipItem[] = [
		{ id: 'clip_fundo', trackId: 'T_FUNDO', kind: 'graphics', componentName: 'FundoEstilo', startFrame: 0, durationInFrames: total, props: { fundo: estilo.fundo, fundo2: estilo.fundo2 } },
	];
	if (estilo.hud) {
		clips.push({ id: 'clip_bg_hud', trackId: 'T_BG', kind: 'graphics', componentName: 'VectorHUDOverlay', startFrame: 0, durationInFrames: total, props: { preset: 'cyber', accentColor: estilo.acento, showGrid: true } });
	}
	let cursor = 0;
	cenas.forEach((cena, i) => {
		clips.push({ id: `clip_cena_${i + 1}`, trackId: 'T_HERO', kind: 'graphics', componentName: cena.componentName, startFrame: cursor, durationInFrames: cena.frames, props: cena.props });
		cursor += cena.frames;
	});

	return { fps: FPS, width: metricas.width, height: metricas.height, durationInFrames: total, currentFrame: 0, tracks, clips, selectedClipIds: [] };
}

