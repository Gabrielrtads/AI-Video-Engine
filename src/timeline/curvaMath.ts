/**
 * Pontos da curva animada (AnimatedBezierCurve) em pixels. O componente trabalha direto em pixels, sem viewBox,
 * e traz pontos de demonstração ("$12k ... $142k") quando não recebe `points`: por isso quem usa a curva
 * sempre passa os pontos calculados aqui. Sem dependência de Remotion.
 */

export interface PontoDeCurva {
	x: number;
	y: number;
	label?: string;
	value?: string | number;
}

/** Forma sem números (0 a 1) para a curva de ambiente: sobe com um recuo no meio, como um gráfico de crescimento. */
export const FORMA_DECORATIVA = [0.12, 0.3, 0.24, 0.5, 0.68, 0.95];

export function pontosDeCurva(valores: number[], largura: number, altura: number, opcoes: { margem?: number; formatar?: (valor: number) => string } = {}): PontoDeCurva[] {
	if (!Array.isArray(valores) || valores.length < 2) throw new Error('A curva precisa de pelo menos 2 valores.');
	if (valores.some((v) => typeof v !== 'number' || !Number.isFinite(v))) throw new Error('Todo valor da curva precisa ser um número.');
	if (!(largura > 0) || !(altura > 0)) throw new Error('A área da curva precisa ter largura e altura positivas.');

	const margem = opcoes.margem ?? Math.round(Math.min(largura, altura) * 0.12);
	const minimo = Math.min(...valores);
	const maximo = Math.max(...valores);
	const amplitude = maximo - minimo;
	const passo = (largura - 2 * margem) / (valores.length - 1);

	return valores.map((valor, i) => {
		const proporcao = amplitude === 0 ? 0.5 : (valor - minimo) / amplitude;
		const ponto: PontoDeCurva = {
			x: Math.round(margem + passo * i),
			y: Math.round(altura - margem - proporcao * (altura - 2 * margem)),
		};
		if (opcoes.formatar) ponto.value = opcoes.formatar(valor);
		return ponto;
	});
}
