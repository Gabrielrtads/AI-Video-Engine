/**
 * ════════════════════════════════════════════════════════════════════════════
 * MEASURED EASES (12 Curvas Físicas Extraídas de 53 Filmes Profissionais)
 * ════════════════════════════════════════════════════════════════════════════
 * Fonte: Benchmark Motionmaxxing (Tejas Makwana / FinalMotion)
 * Amostragem: 4.288 movimentos distintos analisados frame a frame.
 * 
 * Todas as funções são compatíveis nativamente com:
 * - `ci(frame, [in, out], [0, 1], ease)`
 * - `interpolate(frame, [in, out], [0, 1], { easing: ease })`
 * - Remotion spring / CSS inline transforms
 */

// Helpers matemáticos das curvas físicas
const powerOut = (p: number) => (t: number) => 1 - Math.pow(1 - t, p);
const powerIn = (p: number) => (t: number) => Math.pow(t, p);
const expoOut = (k: number) => {
	const d = 1 - Math.exp(-k);
	return (t: number) => (1 - Math.exp(-k * t)) / d;
};
const snapRamp = (w: number, tau: number) => {
	const n = w * (1 - Math.exp(-1 / tau)) + (1 - w);
	return (t: number) => (w * (1 - Math.exp(-t / tau)) + (1 - w) * t) / n;
};
const snapOver = (A: number, ta: number, td: number) => {
	const f = (t: number) => (1 + A * Math.exp(-t / td)) * (1 - Math.exp(-t / ta));
	const n = f(1);
	return (t: number) => f(t) / n;
};
const springPhysical = (c: number, om: number) => {
	const f = (t: number) => 1 - Math.exp(-c * t) * (Math.cos(om * t) + (c / om) * Math.sin(om * t));
	const n = f(1);
	return (t: number) => f(t) / n;
};
const smoothP = (p: number) => (t: number) => {
	const a = Math.pow(t, p);
	const b = Math.pow(1 - t, p);
	return a / (a + b);
};
const guard = (f: (t: number) => number) => (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : f(t));

export const EASE = {
	/**
	 * crashIn: Entrada de impacto que ultrapassa levemente o ponto neutro logo no início (pico 1.18 em t~0.27).
	 * Ideal para: quedas pesadas, slams e impactos rápidos. (Duração típica: 10 frames)
	 */
	crashIn: guard(snapOver(2.0, 0.19, 0.218)),

	/**
	 * popOver: Overshoot sutil e tardio (pico 1.08 em t~0.72).
	 * Ideal para: botões que sofrem release, expansão de cards, leve respiro elástico. (Duração típica: 15 frames)
	 */
	popOver: guard(springPhysical(2.67, 4.36)),

	/**
	 * bounceHard: Overshoot expressivo (pico 1.48). Usar com extrema parcimônia (no máximo 1 vez por vídeo).
	 * (Duração típica: 22 frames)
	 */
	bounceHard: guard(springPhysical(1.34, 5.07)),

	/**
	 * snapSettle: O cavalo de batalha para entradas de herói e CTAs (54% do percurso nos primeiros 10% do tempo).
	 * Decodificado em 23% dos encerramentos profissionais. Rápido, certeiro e com cauda suave. (Duração típica: 11 frames)
	 */
	snapSettle: guard(snapRamp(0.942, 0.118)),

	/**
	 * softLand: Desaceleração firme exponencial (k=3.41).
	 * O cavalo de batalha número 1 para textos, títulos suíços, cards de produto e painéis. (Duração típica: 12 frames)
	 */
	softLand: guard(expoOut(3.41)),

	/**
	 * whip: Desaceleração brusca de alta energia (power 2.52).
	 * Ideal para chicotes de câmera (whip pan) e transições rápidas entre cortes. (Duração típica: 7 frames)
	 */
	whip: guard(powerOut(2.52)),

	/**
	 * glide: Desaceleração suave e orgânica (power 1.7, similar a sine.out).
	 * Ideal para movimentos secundários, fades elegantes e reposicionamentos. (Duração típica: 10 frames)
	 */
	glide: guard(powerOut(1.7)),

	/**
	 * cruise: Linear puro (t => t).
	 * Ideal para: contadores numéricos (odômetro), drifts de câmera, rotações contínuas e luz ambiente. (Duração típica: 9 frames)
	 */
	cruise: guard((t: number) => t),

	/**
	 * softInOut: Curva S suave e simétrica.
	 * Ideal para: transições de opacidade (27% dos casos), blur-in/blur-out e rampas de cor de fundo. (Duração típica: 9 frames)
	 */
	softInOut: guard(smoothP(1.42)),

	/**
	 * gentleIn: Aceleração sutil (power 2.07).
	 * Ideal para inícios de saídas lentas e desfoques de saída antes de cortes. (Duração típica: 9 frames)
	 */
	gentleIn: guard(powerIn(2.07)),

	/**
	 * accelExit: Curva clássica de saída por aceleração (power 2.6).
	 * Elementos que saem da tela devem ACELERAR e atingir a velocidade máxima no corte, nunca morrer parados. (Duração típica: 13 frames)
	 */
	accelExit: guard(powerIn(2.6)),

	/**
	 * crashOut: Aceleração extrema (power 3.97) terminando em velocidade máxima no corte seco.
	 * Ideal para saídas violentas de tela e objetos "jogados fora". (Duração típica: 17 frames)
	 */
	crashOut: guard(powerIn(3.97)),
};

/** Duração recomendada em frames @ 30 FPS para cada curva medida */
export const EASE_FRAMES = {
	crashIn: 10,
	popOver: 15,
	bounceHard: 22,
	snapSettle: 11,
	softLand: 12,
	whip: 7,
	glide: 10,
	cruise: 9,
	softInOut: 9,
	gentleIn: 9,
	accelExit: 13,
	crashOut: 17,
} as const;

export type MeasuredEaseName = keyof typeof EASE;
