/**
 * Bom gosto como regra medida. Sem dependências: roda no Node puro (testes, CLI) e no bundle do Remotion.
 *
 * O julgamento final é de quem olha a tela, mas o piso é automático: contraste legível, visuais variados e
 * nada fora da zona segura do celular.
 */

export const VARIANTES_DE_LEGENDA = ['classic-yellow', 'cash-green', 'red-alert', 'cyber-cyan', 'dark-glass', 'white-punch', 'ink-punch'] as const;

export interface EstiloPacote {
	id: string;
	nome: string;
	clima: string;
	fundo: string;
	fundo2: string;
	texto: string;
	acento: string;
	captionVariant: string;
	hud: boolean;
	fonte?: string;
	/** Tema do planeta 3D (cyber-blue, saturn-gold, mars-crimson, neon-emerald). */
	planeta?: string;
	/** Variante do cartão (dark-glass, white-frosted, gold-titanium). */
	cartao?: string;
}

function paraRgb(cor: string): [number, number, number] {
	let h = String(cor).trim().replace(/^#/, '');
	if (h.length === 3) h = h.split('').map((c) => c + c).join('');
	if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Cor inválida: "${cor}" (use #RGB ou #RRGGBB).`);
	return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Luminância relativa (WCAG 2.x). */
export function luminanciaRelativa(cor: string): number {
	const [r, g, b] = paraRgb(cor).map((v) => {
		const c = v / 255;
		return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste WCAG entre duas cores (1 a 21). */
export function razaoDeContraste(a: string, b: string): number {
	const la = luminanciaRelativa(a);
	const lb = luminanciaRelativa(b);
	const [maior, menor] = la >= lb ? [la, lb] : [lb, la];
	return (maior + 0.05) / (menor + 0.05);
}

const CAMPOS_DO_PACOTE = ['id', 'nome', 'clima', 'fundo', 'fundo2', 'texto', 'acento', 'captionVariant', 'hud'] as const;

/** Um pacote de estilo precisa estar completo e ser legível: texto 4,5:1 e acento 3:1 sobre o fundo. */
export function avaliarPacote(pacote: Partial<EstiloPacote>): { ok: boolean; problemas: string[] } {
	const problemas: string[] = [];
	for (const campo of CAMPOS_DO_PACOTE) {
		if (pacote[campo] === undefined || pacote[campo] === '') problemas.push(`campo obrigatório ausente: ${campo}`);
	}
	if (problemas.length === 0) {
		try {
			for (const fundo of [pacote.fundo!, pacote.fundo2!]) {
				const rt = razaoDeContraste(pacote.texto!, fundo);
				if (rt < 4.5) problemas.push(`texto ${pacote.texto} sobre ${fundo} tem contraste ${rt.toFixed(2)}:1 (mínimo 4,5:1)`);
				const ra = razaoDeContraste(pacote.acento!, fundo);
				if (ra < 3) problemas.push(`acento ${pacote.acento} sobre ${fundo} tem contraste ${ra.toFixed(2)}:1 (mínimo 3:1)`);
			}
		} catch (e) {
			problemas.push((e as Error).message);
		}
		if (!(VARIANTES_DE_LEGENDA as readonly string[]).includes(pacote.captionVariant!)) {
			problemas.push(`captionVariant "${pacote.captionVariant}" não é uma variante de legenda válida (${VARIANTES_DE_LEGENDA.join(', ')})`);
		}
	}
	return { ok: problemas.length === 0, problemas };
}

/** Variedade entre cenas: nunca o mesmo visual em sequência e, com 4+ cenas, ao menos 3 visuais distintos. */
export function avaliarVariedade(componentes: string[]): { ok: boolean; distintos: number; repetidosEmSequencia: number; problemas: string[] } {
	const problemas: string[] = [];
	let repetidosEmSequencia = 0;
	for (let i = 1; i < componentes.length; i++) if (componentes[i] === componentes[i - 1]) repetidosEmSequencia++;
	const distintos = new Set(componentes).size;
	if (repetidosEmSequencia > 0) problemas.push(`${repetidosEmSequencia} cena(s) repetem o visual da anterior`);
	if (componentes.length >= 4 && distintos < 3) problemas.push(`só ${distintos} visual(is) distinto(s) em ${componentes.length} cenas (mínimo 3)`);
	return { ok: problemas.length === 0, distintos, repetidosEmSequencia, problemas };
}

/** Zona segura vertical (9:16): 20% livre no topo e 25% embaixo (a interface do app cobre o resto). */
export function dentroDaZonaSegura(caixa: { topo: number; base: number }, altura: number): boolean {
	return caixa.topo >= altura * 0.2 && caixa.base <= altura * 0.75;
}
