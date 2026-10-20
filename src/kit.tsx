import React from 'react';
import {Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {loadFont as loadSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';
import {rt} from './time';
import TEXT from './text.json';

export const SERIF = loadSerif('normal', {weights: ['400']}).fontFamily;
loadSerif('italic', {weights: ['400']});
export const SANS = loadInter('normal', {weights: ['300', '400', '500', '600']}).fontFamily;
export const MONO = loadMono('normal', {weights: ['400', '500']}).fontFamily;

export const W = 1080;
export const H = 1920;
export const FPS = 30;
export const IN = 30; // entrada
export const OUT = 15; // saída
export const sec = (s: number) => Math.round(s * FPS);

export const C = {
	bg: '#0A0A0A',
	ink: '#F2F0EB',
	mid: 'rgba(242,240,235,0.55)',
	dim: 'rgba(242,240,235,0.28)',
	line: 'rgba(242,240,235,0.14)',
	card: '#131313',
};

export const E_IN = Easing.bezier(0.16, 1, 0.3, 1);
export const E_OUT = Easing.bezier(0.7, 0, 0.84, 0);
export const E_IO = Easing.bezier(0.76, 0, 0.24, 1);

// Curvas Físicas Medidas (Benchmark Motionmaxxing)
export * from './measured_eases';

// Sound Design Automatizado por Impacto Físico
export * from './sound_impact_engine';

// Legendas Cinéticas Palavra por Palavra (Whisper Sync)
export * from './KineticWordCaption';

export const ci = (f: number, a: [number, number], b: [number, number], ease?: (t: number) => number) =>
	interpolate(f, a, b, {easing: ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Dir = 'up' | 'down' | 'left' | 'right';
const vec = (d: Dir): [number, number] =>
	d === 'up' ? [0, -1] : d === 'down' ? [0, 1] : d === 'left' ? [-1, 0] : [1, 0];

/**
 * Entrada 30f (posição + blur + opacity + scale) e saída 15f (quadruple exit).
 * `from`: de onde vem. `to`: para onde vai.
 */
export const io = (
	f: number,
	d: number,
	delay = 0,
	o: {from?: Dir; to?: Dir; dist?: number; outDist?: number; exitDelay?: number; rot?: number} = {},
): React.CSSProperties => {
	const {from = 'down', to = 'up', dist = 60, outDist = 140, exitDelay = 0, rot = 0} = o;
	const pi = ci(f, [delay, delay + IN], [0, 1], E_IN);
	const po = ci(f, [d + exitDelay, d + exitDelay + OUT], [0, 1], E_OUT);
	const [fx, fy] = vec(from);
	const [tx, ty] = vec(to);
	const x = fx * dist * (1 - pi) + tx * outDist * po;
	const y = fy * dist * (1 - pi) + ty * outDist * po;
	const blur = (1 - ci(f, [delay, delay + IN * 0.7], [0, 1])) * 14 + po * 20;
	const op = ci(f, [delay, delay + IN * 0.6], [0, 1]) * ci(po, [0.3, 1], [1, 0]);
	const sc = lerp(0.96, 1, pi) * lerp(1, 0.94, po);
	return {
		opacity: op,
		transform: `translate(${x}px, ${y}px) scale(${sc}) rotate(${rot * (1 - pi)}deg)`,
		filter: `blur(${blur}px)`,
	};
};

// Medição real das palavras (canvas) para quebrar linhas sem palavra órfã.
let ctx: CanvasRenderingContext2D | null = null;
const measure = (w: string, px: number, family: string, italic: boolean, weight: number, ls: number) => {
	if (!ctx) ctx = document.createElement('canvas').getContext('2d');
	if (!ctx) return w.length * px * 0.5;
	ctx.font = `${italic ? 'italic ' : ''}${weight} ${px}px "${family}"`;
	return ctx.measureText(w).width + ls * w.length;
};

/** Divide em linhas equilibradas; nunca deixa 1 palavra sozinha numa linha. */
const layout = (ws: number[], space: number, width: number): {lines: number[][]; scale: number} => {
	const n = ws.length;
	const lineW = (i: number, j: number) => ws.slice(i, j).reduce((a, b) => a + b, 0) + space * (j - i - 1);
	const total = lineW(0, n);
	if (total <= width) return {lines: [Array.from({length: n}, (_, i) => i)], scale: 1};
	let best: {cuts: number[]; max: number} | null = null;
	for (let L = 2; L <= 4 && !best; L++) {
		const rec = (start: number, left: number, cuts: number[]) => {
			if (left === 1) {
				if (n - start < 2) return;
				const all = [...cuts, n];
				let s = 0;
				let max = 0;
				for (const c of all) {
					max = Math.max(max, lineW(s, c));
					s = c;
				}
				if (max <= width && (!best || max < best.max)) best = {cuts: all, max};
				return;
			}
			for (let c = start + 2; c <= n - 2 * (left - 1); c++) rec(c, left - 1, [...cuts, c]);
		};
		rec(0, L, []);
	}
	if (!best) return {lines: [Array.from({length: n}, (_, i) => i)], scale: width / total};
	const lines: number[][] = [];
	let s = 0;
	for (const c of (best as {cuts: number[]}).cuts) {
		lines.push(Array.from({length: c - s}, (_, i) => s + i));
		s = c;
	}
	return {lines, scale: 1};
};

/** Texto palavra por palavra. `em` = índices em itálico serif destacado. */
export const Line: React.FC<{
	text: string;
	d: number;
	delay?: number;
	size?: number;
	serif?: boolean;
	em?: number[];
	strike?: number[];
	align?: 'left' | 'center';
	width?: number;
	from?: Dir;
	to?: Dir;
	color?: string;
	style?: React.CSSProperties;
	cut?: boolean;
}> = ({cut = false, text, d, delay = 0, size = 76, serif = false, em = [], strike = [], align = 'left', width = 900, from = 'down', to = 'up', color = C.ink, style}) => {
	const f = useCurrentFrame();
	const words = text.split(' ');
	const ls = serif ? -1 : -size * 0.035;
	const wsz = words.map((w, i) => {
		const isEm = em.includes(i);
		const px = isEm && !serif ? size * 1.12 : size;
		return measure(w, px, isEm || serif ? SERIF : SANS, isEm, isEm || serif ? 400 : 500, ls);
	});
	const {lines, scale} = layout(wsz, size * 0.24, width * 0.97);
	const fs = size * scale;
	return (
		<div
			style={{
				width,
				display: 'flex',
				flexDirection: 'column',
				alignItems: align === 'center' ? 'center' : 'flex-start',
				fontFamily: serif ? SERIF : SANS,
				fontWeight: serif ? 400 : 500,
				fontSize: fs,
				lineHeight: serif ? 1.02 : 1.08,
				letterSpacing: serif ? -1 : -fs * 0.035,
				color,
				...style,
			}}
		>
			{lines.map((ln, li) => (
				<div key={li} style={{display: 'flex', whiteSpace: 'nowrap'}}>
					{ln.map((i) => {
						const w = words[i];
						const isEm = em.includes(i);
						const st = strike.includes(i);
						const sp = ci(f, [delay + 18 + i * 3, delay + 34 + i * 3], [0, 1], E_IO);
						return (
							<span
								key={i}
								style={{
									display: 'inline-block',
									position: 'relative',
									marginRight: i === ln[ln.length - 1] ? 0 : '0.24em',
									fontFamily: isEm ? SERIF : undefined,
									fontStyle: isEm ? 'italic' : undefined,
									fontWeight: isEm ? 400 : undefined,
									fontSize: isEm && !serif ? fs * 1.12 : undefined,
									...(cut ? {opacity: f >= delay + i * CUT_STAGGER && f < d - (words.length - 1 - i) * 2 ? 1 : 0} : io(f, d, delay + i * 3, {from, to, dist: 44, exitDelay: i * 1.5})),
								}}
							>
								{w}
								{st && <span style={{position: 'absolute', left: 0, top: '55%', height: Math.max(3, fs * 0.05), width: `${sp * 100}%`, background: color}} />}
							</span>
						);
					})}
				</div>
			))}
		</div>
	);
};

export const CUT_STAGGER = 4; // frames entre palavras no modo corte seco

/**
 * Frase quebrada em blocos curtos, centralizados, sincronizados com a voz.
 * Dados em text.json: parts [texto, segundo (timeline original)], mode 'blur' | 'cut'.
 * *palavra* = destaque serif itálico, ~palavra~ = riscado.
 */
export const Chunks: React.FC<{k: number; d: number; y: number; size?: number; serif?: boolean}> = ({k, d, y, size = 96, serif = false}) => {
	const {parts, mode} = (TEXT as unknown as Record<string, {parts: [string, number][]; mode: string}>)[String(k)];
	const cut = mode === 'cut';
	const t0 = rt(parts[0][1]);
	return (
		<>
			{parts.map(([raw, s], i) => {
				const words = raw.split(' ');
				const em = words.map((w, j) => (w.startsWith('*') ? j : -1)).filter((j) => j >= 0);
				const strike = words.map((w, j) => (w.startsWith('~') ? j : -1)).filter((j) => j >= 0);
				const text = words.map((w) => w.replace(/[*~]/g, '')).join(' ');
				const base = i === 0 ? 0 : Math.round((rt(s) - t0) * FPS);
				const start = base + (cut ? 2 : 6);
				const end = i === parts.length - 1 ? d : Math.round((rt(parts[i + 1][1]) - t0) * FPS);
				return (
					<div key={i} style={{position: 'absolute', left: 90, top: y, width: 900}}>
						<Line text={text} d={end} delay={start} size={size} serif={serif} em={em} strike={strike} align="center" width={900} from="down" to="up" cut={cut} />
					</div>
				);
			})}
		</>
	);
};

/** Chip estilo UI */
export const Chip: React.FC<{children: React.ReactNode; style?: React.CSSProperties; dot?: boolean; solid?: boolean}> = ({children, style, dot, solid}) => (
	<div
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 12,
			padding: '12px 22px',
			borderRadius: 999,
			border: `1px solid ${solid ? C.ink : 'rgba(242,240,235,0.22)'}`,
			background: solid ? C.ink : 'rgba(20,20,20,0.7)',
			color: solid ? C.bg : C.ink,
			fontFamily: MONO,
			fontSize: 22,
			letterSpacing: 1,
			textTransform: 'uppercase',
			whiteSpace: 'nowrap',
			...style,
		}}
	>
		{dot && <span style={{width: 10, height: 10, borderRadius: 5, background: solid ? C.bg : C.ink}} />}
		{children}
	</div>
);

/** Borda rasgada determinística para colagem */
const torn = (seed: string, n = 28, amp = 1.6) => {
	const pts: string[] = [];
	for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${random(seed + 't' + i) * amp}%`);
	for (let i = 0; i <= n; i++) pts.push(`${100 - random(seed + 'r' + i) * amp}% ${(i / n) * 100}%`);
	for (let i = n; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - random(seed + 'b' + i) * amp}%`);
	for (let i = n; i >= 0; i--) pts.push(`${random(seed + 'l' + i) * amp}% ${(i / n) * 100}%`);
	return `polygon(${pts.join(',')})`;
};

/** Recorte de colagem P&B com papel rasgado */
export const Cut: React.FC<{
	src: string;
	w: number;
	h: number;
	fit?: 'cover' | 'contain';
	pos?: string;
	paper?: boolean;
	contrast?: number;
	style?: React.CSSProperties;
	seed?: string;
}> = ({src, w, h, fit = 'cover', pos = 'center', paper = true, contrast = 1.25, style, seed = src}) => (
	<div
		style={{
			width: w,
			height: h,
			padding: paper ? 14 : 0,
			background: paper ? '#E9E6DF' : 'transparent',
			clipPath: paper ? torn(seed) : undefined,
			boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
			...style,
		}}
	>
		<Img
			src={staticFile(src)}
			style={{
				width: '100%',
				height: '100%',
				objectFit: fit,
				objectPosition: pos,
				filter: `grayscale(1) contrast(${contrast}) brightness(1.02)`,
			}}
		/>
	</div>
);

/** Janela de UI minimal */
export const Win: React.FC<{title: string; w: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({title, w, children, style}) => (
	<div
		style={{
			width: w,
			borderRadius: 26,
			background: 'linear-gradient(160deg, #171717 0%, #0F0F0F 100%)',
			border: '1px solid rgba(242,240,235,0.12)',
			boxShadow: '0 2px 4px rgba(0,0,0,0.4), 0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
			overflow: 'hidden',
			...style,
		}}
	>
		<div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '18px 22px', borderBottom: `1px solid ${C.line}`}}>
			{[0, 1, 2].map((i) => (
				<span key={i} style={{width: 12, height: 12, borderRadius: 6, border: `1.5px solid ${C.dim}`}} />
			))}
			<span style={{marginLeft: 12, fontFamily: MONO, fontSize: 19, color: C.mid, letterSpacing: 1, textTransform: 'uppercase'}}>{title}</span>
		</div>
		<div style={{padding: 26}}>{children}</div>
	</div>
);

export * from './styles_kit';
