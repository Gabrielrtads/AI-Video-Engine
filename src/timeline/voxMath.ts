/**
 * Vibe Design Studio — Matemática Pura & Constantes do Estilo VOX
 * Módulo puro sem dependência de JSX, executável em Node.js e Remotion.
 */

import { random } from 'remotion';

export const VOX_COLORS = {
	paperBase: '#F4F1EA',
	paperAged: '#EAE3D5',
	paperDark: '#1C1B18',
	inkPrimary: '#141413',
	inkSecondary: '#3D3A35',
	inkMuted: '#7D776D',
	highlighterYellow: '#FFDE2E',
	penRed: '#D9381E',
	atlasBlue: '#2B5B84',
	gridLine: 'rgba(61, 58, 53, 0.08)',
};

/** Função pura para borda rasgada determinística de papel */
export const tornPolygon = (seed: string, n = 32, amp = 1.8): string => {
	const pts: string[] = [];
	for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${random(`${seed}t${i}`) * amp}%`);
	for (let i = 0; i <= n; i++) pts.push(`${100 - random(`${seed}r${i}`) * amp}% ${(i / n) * 100}%`);
	for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - random(`${seed}b${i}`) * amp}%`);
	for (let i = n; i >= 0; i--) pts.push(`${random(`${seed}l${i}`) * amp}% ${(i / n) * 100}%`);
	return `polygon(${pts.join(',')})`;
};

/** Calcula o perímetro aproximado de elipse para traçado manuscrito */
export const calculateHandDrawnPerimeter = (width: number, height: number): number => {
	const a = width / 2 - 10;
	const b = height / 2 - 10;
	const hConst = Math.pow(a - b, 2) / Math.pow(a + b, 2);
	return Math.PI * (a + b) * (1 + (3 * hConst) / (10 + Math.sqrt(4 - 3 * hConst)));
};
