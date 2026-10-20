import React, {useMemo} from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

export interface WordItem {
	text: string;
	start: number; // tempo de início em segundos
	end: number; // tempo de término em segundos
}

export type CaptionPreset = 'gold-glow' | 'cyber-green' | 'apple-clean' | 'neon-crimson';

export interface KineticWordCaptionProps {
	/** Array de palavras transcritas milissegundo a milissegundo (formato words.json do Whisper) */
	words: WordItem[];
	/** Preset visual estilizado */
	preset?: CaptionPreset;
	/** Quantidade de palavras visíveis na janela deslizante (default: 4) */
	windowSize?: number;
	/** Cor customizada da palavra ativa */
	activeColor?: string;
	/** Cor de glow difuso na palavra ativa */
	glowColor?: string;
	/** Cor das palavras inativas da janela */
	inactiveColor?: string;
	/** Tamanho da fonte em px (default: 32) */
	fontSize?: number;
	/** Distância do rodapé em px (default: 110) */
	bottom?: number;
	style?: React.CSSProperties;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const FONT_SANS = 'Inter, system-ui, sans-serif';
const FONT_MONO = 'JetBrains Mono, monospace';

const PRESET_CONFIGS: Record<
	CaptionPreset,
	{active: string; glow: string; inactive: string; bg: string; border: string; font: string}
> = {
	'gold-glow': {
		active: '#FBE8A6',
		glow: 'rgba(212, 175, 55, 0.65)',
		inactive: 'rgba(255, 255, 255, 0.45)',
		bg: 'rgba(10, 12, 18, 0.88)',
		border: '1px solid rgba(212, 175, 55, 0.35)',
		font: FONT_SANS,
	},
	'cyber-green': {
		active: '#00FF66',
		glow: 'rgba(0, 255, 102, 0.7)',
		inactive: 'rgba(160, 174, 192, 0.5)',
		bg: 'rgba(6, 12, 8, 0.92)',
		border: '1px solid rgba(0, 255, 102, 0.4)',
		font: FONT_MONO,
	},
	'apple-clean': {
		active: '#FFFFFF',
		glow: 'rgba(255, 255, 255, 0.5)',
		inactive: 'rgba(255, 255, 255, 0.35)',
		bg: 'rgba(20, 22, 28, 0.82)',
		border: '1px solid rgba(255, 255, 255, 0.15)',
		font: FONT_SANS,
	},
	'neon-crimson': {
		active: '#FF4D6D',
		glow: 'rgba(255, 77, 109, 0.7)',
		inactive: 'rgba(255, 255, 255, 0.4)',
		bg: 'rgba(18, 8, 12, 0.92)',
		border: '1px solid rgba(255, 77, 109, 0.4)',
		font: FONT_SANS,
	},
};

/**
 * COMPONENTE DE LEGENDA CINÉTICA PALAVRA POR PALAVRA (WHISPER SYNC)
 * Implementação 100% determinística para Remotion:
 * - Sem CSS transitions (que quebram em render headless frame a frame).
 * - Mola física calibrada para pop no início de cada palavra falada.
 * - Janela deslizante fluida sem layout shifts abruptos.
 */
export const KineticWordCaption: React.FC<KineticWordCaptionProps> = ({
	words,
	preset = 'gold-glow',
	windowSize = 4,
	activeColor,
	glowColor,
	inactiveColor,
	fontSize = 32,
	bottom = 110,
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;

	const cfg = PRESET_CONFIGS[preset];
	const colorActive = activeColor || cfg.active;
	const colorGlow = glowColor || cfg.glow;
	const colorInactive = inactiveColor || cfg.inactive;

	// Encontra o índice da palavra atualmente falada
	const activeWordIdx = words.findIndex((w) => t >= w.start && t <= w.end);

	// Monta a janela deslizante de palavras ativas
	const visibleSlice = useMemo(() => {
		if (words.length === 0) return [];
		// Se ainda não começou a fala ou se a fala já terminou, oculta as legendas
		if (t < words[0].start - 0.15 || t > words[words.length - 1].end + 0.6) {
			return [];
		}
		if (activeWordIdx === -1) {
			const nextIdx = words.findIndex((w) => w.start > t);
			const idx = nextIdx > 0 ? nextIdx - 1 : (nextIdx === 0 ? 0 : words.length - 1);
			const start = Math.max(0, idx - Math.floor(windowSize / 2));
			return words.slice(start, start + windowSize);
		}
		const start = Math.max(0, activeWordIdx - Math.floor(windowSize / 2));
		return words.slice(start, start + windowSize);
	}, [activeWordIdx, t, windowSize, words]);

	// Se não houver palavras no momento, não renderiza nada
	if (visibleSlice.length === 0) return null;

	return (
		<div
			style={{
				position: 'absolute',
				bottom,
				left: 0,
				right: 0,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				zIndex: 80,
				pointerEvents: 'none',
				...style,
			}}
		>
			<div
				style={{
					padding: '16px 32px',
					borderRadius: 28,
					background: cfg.bg,
					border: cfg.border,
					backdropFilter: 'blur(20px)',
					boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
					display: 'flex',
					alignItems: 'center',
					gap: 14,
					flexWrap: 'wrap',
					justifyContent: 'center',
					maxWidth: '85%',
				}}
			>
				{visibleSlice.map((w, idx) => {
					const isSpoken = t >= w.start && t <= w.end;
					const wordStartFrame = Math.round(w.start * fps);
					const wordAge = frame - wordStartFrame;

					// Mola física de entrada da palavra ativa (determinística e frame-accurate)
					const popSpring = isSpoken && wordAge >= 0
						? spring({
								frame: wordAge,
								fps,
								config: {damping: 14, stiffness: 220},
						  })
						: 0;

					const wordScale = isSpoken ? lerp(1.0, 1.14, popSpring) : 1.0;

					return (
						<span
							key={`${w.start}-${w.text}-${idx}`}
							style={{
								fontFamily: cfg.font,
								fontSize,
								fontWeight: isSpoken ? 800 : 500,
								color: isSpoken ? colorActive : colorInactive,
								textShadow: isSpoken ? `0 0 20px ${colorGlow}, 0 0 35px ${colorGlow}` : 'none',
								transform: `scale(${wordScale})`,
								letterSpacing: '-0.01em',
								display: 'inline-block',
							}}
						>
							{w.text}
						</span>
					);
				})}
			</div>
		</div>
	);
};
