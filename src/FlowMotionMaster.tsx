import React, { useMemo } from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	interpolateColors,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadInstrumentSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

// Palavras da narração da Thalita sincronizadas via Whisper
import RAW_WORDS from './data/words_thalita_cleaned.json';

// Demonstradores interativos em tempo real ("Mostrar na Prática")
import { SlopSimulator } from './demonstracoes/SlopSimulator';
import { LiveTerminal } from './demonstracoes/LiveTerminal';
import { AppleSpringDemo } from './demonstracoes/AppleSpringDemo';
import { AudioConsoleDemo } from './demonstracoes/AudioConsoleDemo';
import { GitHubStarHero } from './demonstracoes/GitHubStarHero';

// Slides reais do Carrossel Editorial para o Leque 3D no Clímax
import { CarrosselEditorial as Slide01Capa } from './CarrosselEditorial';
import { Slide02Diagnostico } from './Slide02Diagnostico';
import { Slide03Solucao } from './Slide03Solucao';
import { Slide04Engenharia } from './Slide04Engenharia';
import { Slide05Final } from './Slide05Final';

// Pré-carregamento determinístico de Google Fonts via Remotion
const { fontFamily: fontAnton } = loadAnton();
const { fontFamily: fontInstrumentSerif } = loadInstrumentSerif('italic');
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

// Helper de interpolação clampada flexível
const ci = (
	val: number,
	inRange: readonly number[] | number[],
	outRange: readonly number[] | number[]
) => {
	return interpolate(val, inRange as number[], outRange as number[], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
};

export interface KineticWord {
	text: string;
	start: number;
	end: number;
	index: number;
	accent?: boolean;
}

// Enriquecimento das 65 palavras da locução com índices e flags de ênfase
const WORDS: KineticWord[] = (RAW_WORDS as { text: string; start: number; end: number }[]).map((w, i) => {
	const clean = w.text.toLowerCase().replace(/[.,:!?⭐"']/g, '').trim();
	const isAccent = [
		'vibe', 'design', 'studio', 'headless', 'puro', 'whisper', 'ebu', 'r128',
		'zero', '100%', 'open', 'source', 'skills', 'estrela', 'github', 'apple', 'mola', 'genéricos'
	].includes(clean);
	return {
		...w,
		index: i,
		accent: isAccent,
	};
});

interface NarrativeBeat {
	id: number;
	start: number;
	end: number;
	lineIndices: number[][];
	subtitleConfig: {
		top: number;
		align: 'center' | 'left' | 'right';
		maxWidth?: number;
	};
	slideConfig: {
		top: number;
		x: number;
		y: number;
		z: number;
		rotX: number;
		rotY: number;
		rotZ: number;
		scale: number;
	};
}

const CarouselCardWrapper: React.FC<{
	children: React.ReactNode;
	width?: number;
	height?: number;
	borderRadius?: number;
	shadow?: string;
	border?: string;
	style?: React.CSSProperties;
}> = ({
	children,
	width = 580,
	height = 725,
	borderRadius = 26,
	shadow,
	border = '1px solid rgba(0, 0, 0, 0.08)',
	style = {},
}) => {
	const scale = width / 1080;
	return (
		<div
			style={{
				width,
				height,
				borderRadius,
				overflow: 'hidden',
				boxShadow: shadow || '0 30px 80px -15px rgba(0, 0, 0, 0.25), 0 10px 30px -5px rgba(0, 0, 0, 0.12)',
				border,
				background: '#FCFCFD',
				position: 'relative',
				flexShrink: 0,
				...style,
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: 1080,
					height: 1350,
					transform: `scale(${scale})`,
					transformOrigin: 'top left',
					pointerEvents: 'none',
				}}
			>
				{children}
			</div>
		</div>
	);
};

export interface FlowMotionMasterProps {
	audioNarracao?: string;
	enableSfx?: boolean;
}

export const FlowMotionMaster: React.FC<FlowMotionMasterProps> = ({
	audioNarracao = 'audio/locucao/narracao_thalita.mp3',
	enableSfx = true,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const t = frame / fps;

	// ────────────────────────────────────────────────────────────────────────────
	// CORES E DESIGN TOKENS (EDITORIAL LUXO, ZERO NEON POLUÍDO)
	// ────────────────────────────────────────────────────────────────────────────
	const FERRARI_RED = '#FF0022';
	const ELECTRIC_LIME = '#D4FF00';
	const PURE_WHITE = '#FFFFFF';

	// ────────────────────────────────────────────────────────────────────────────
	// TRANSIÇÃO DE CORES DE FUNDO FLUIDA (8 BEATS NARRATIVOS COM THALITA)
	// ────────────────────────────────────────────────────────────────────────────
	const bgColor = interpolateColors(
		frame,
		[
			0, 155, 165,        // Beat 1 & 2: Crisp Off-White (0 - 5.5s)
			175, 255, 325, 335, // Beat 3 & 4: Deep Obsidian (5.5 - 11.16s)
			345, 470, 615, 625, // Beat 5 & 6: Crisp Off-White (11.16 - 20.8s)
			635, 720, 900       // Beat 7 & 8: VIBRANT FERRARI RED #FF0022 (20.8 - 30.0s)
		],
		[
			'#F5F6F8', '#F5F6F8', '#0A0B0E',
			'#0A0B0E', '#0A0B0E', '#0A0B0E', '#F5F6F8',
			'#F5F6F8', '#F5F6F8', '#F5F6F8', '#FF0022',
			'#FF0022', '#FF0022', '#FF0022'
		]
	);

	// Detecção de contraste de fundo
	const isLightBg = frame < 165 || (frame >= 335 && frame < 625);
	const isRedBg = frame >= 625;
	const textPrimaryColor = isLightBg ? '#111111' : PURE_WHITE;

	// Câmera 3D contínua com respiração orgânica
	const camRotX = 6 + Math.sin(t * 0.45) * 1.8;
	const camRotY = Math.sin(t * 0.4) * 2.2;
	const camZoom = 1.0 + Math.sin(t * 0.3) * 0.015;

	// ────────────────────────────────────────────────────────────────────────────
	// MAPEAMENTO DOS 8 BEATS NARRATIVOS COM ALTERNÂNCIA 4:5
	// ────────────────────────────────────────────────────────────────────────────
	const BEATS: NarrativeBeat[] = useMemo(() => [
		{
			// Beat 1: "Cansado de vídeos de inteligência artificial genéricos"
			// SLIDE EM BAIXO | LEGENDA NO TOPO
			id: 1,
			start: 0.0,
			end: 2.94,
			lineIndices: [
				[0, 1, 2, 3], // "Cansado de vídeos de"
				[4, 5, 6],    // "inteligência artificial genéricos"
			],
			subtitleConfig: {
				top: 240,
				align: 'center',
				maxWidth: 860,
			},
			slideConfig: {
				top: 860,
				x: 0,
				y: 20,
				z: 0,
				rotX: 8,
				rotY: 10,
				rotZ: -2,
				scale: 1.04,
			},
		},
		{
			// Beat 2: "com gradiente roxo e robôs sem alma?"
			// 🔄 INVERSÃO: SLIDE EM CIMA | LEGENDA EM BAIXO
			id: 2,
			start: 2.94,
			end: 5.5,
			lineIndices: [
				[7, 8, 9],       // "com gradiente roxo"
				[10, 11, 12, 13] // "e robôs sem alma?"
			],
			subtitleConfig: {
				top: 1380,
				align: 'center',
				maxWidth: 860,
			},
			slideConfig: {
				top: 240,
				x: 0,
				y: 0,
				z: 0,
				rotX: 8,
				rotY: -8,
				rotZ: 2,
				scale: 1.02,
			},
		},
		{
			// Beat 3: "Conheça o Vibe Design Studio, o estúdio criativo"
			// 🔄 INVERSÃO: SLIDE EM BAIXO | LEGENDA NO TOPO
			id: 3,
			start: 5.5,
			end: 8.88,
			lineIndices: [
				[14, 15, 16, 17, 18], // "Conheça o Vibe Design Studio,"
				[19, 20, 21],         // "o estúdio criativo"
			],
			subtitleConfig: {
				top: 220,
				align: 'center',
				maxWidth: 880,
			},
			slideConfig: {
				top: 860,
				x: 0,
				y: 20,
				z: 10,
				rotX: 9,
				rotY: 9,
				rotZ: -1,
				scale: 1.04,
			},
		},
		{
			// Beat 4: "headless para agentes em código puro."
			// 🔄 INVERSÃO: SLIDE EM CIMA | LEGENDA EM BAIXO
			id: 4,
			start: 8.88,
			end: 11.16,
			lineIndices: [
				[22, 23, 24, 25], // "e headless para agentes"
				[26, 27, 28],     // "em código puro."
			],
			subtitleConfig: {
				top: 1380,
				align: 'center',
				maxWidth: 860,
			},
			slideConfig: {
				top: 240,
				x: 0,
				y: 0,
				z: 10,
				rotX: 8,
				rotY: -8,
				rotZ: 2,
				scale: 1.03,
			},
		},
		{
			// Beat 5: "Física de mola Apple, legendas cinéticas sincronizadas no milissegundo com Whisper,"
			// 🔄 INVERSÃO: SLIDE EM BAIXO | LEGENDA NO TOPO
			id: 5,
			start: 11.16,
			end: 16.0,
			lineIndices: [
				[29, 30, 31, 32], // "Física de mola Apple,"
				[33, 34, 35],     // "legendas cinéticas sincronizadas"
				[36, 37, 38, 39], // "no milissegundo com Whisper,"
			],
			subtitleConfig: {
				top: 200,
				align: 'center',
				maxWidth: 880,
			},
			slideConfig: {
				top: 860,
				x: 0,
				y: 20,
				z: 20,
				rotX: 9,
				rotY: 8,
				rotZ: -2,
				scale: 1.04,
			},
		},
		{
			// Beat 6: "sound design dinâmico e masterização profissional EBU R128."
			// 🔄 INVERSÃO: SLIDE EM CIMA | LEGENDA EM BAIXO
			id: 6,
			start: 16.0,
			end: 20.8,
			lineIndices: [
				[40, 41, 42],     // "sound design dinâmico"
				[43, 44, 45],     // "e masterização profissional"
				[46, 47],         // "EBU R128."
			],
			subtitleConfig: {
				top: 1380,
				align: 'center',
				maxWidth: 860,
			},
			slideConfig: {
				top: 240,
				x: 0,
				y: 0,
				z: 20,
				rotX: 8,
				rotY: -8,
				rotZ: 1,
				scale: 1.03,
			},
		},
		{
			// Beat 7: "Custo zero de API e 100% open source."
			// 🔄 INVERSÃO: SLIDE EM BAIXO | LEGENDA NO TOPO (LEQUE 3D)
			id: 7,
			start: 20.8,
			end: 24.2,
			lineIndices: [
				[48, 49, 50, 51], // "Custo zero de API"
				[52, 53, 54, 55], // "e 100% open source."
			],
			subtitleConfig: {
				top: 200,
				align: 'center',
				maxWidth: 860,
			},
			slideConfig: {
				top: 760,
				x: 0,
				y: 20,
				z: 30,
				rotX: 8,
				rotY: 0,
				rotZ: 0,
				scale: 1.0,
			},
		},
		{
			// Beat 8: "Instale via npx skills add e deixe sua estrela no GitHub!"
			// 🔄 CLÍMAX HERO: SLIDE EM BAIXO/CENTRO | LEGENDA NO TOPO
			id: 8,
			start: 24.2,
			end: 30.0,
			lineIndices: [
				[56, 57, 58],         // "Instale via npx skills add"
				[59, 60, 61, 62],     // "e deixe sua estrela"
				[63, 64],             // "no GitHub!"
			],
			subtitleConfig: {
				top: 180,
				align: 'center',
				maxWidth: 880,
			},
			slideConfig: {
				top: 730,
				x: 0,
				y: 20,
				z: 80,
				rotX: 6,
				rotY: 0,
				rotZ: 0,
				scale: 1.05,
			},
		},
	], []);

	// Transição suave entre beats por mola Apple
	const activeBeatIndex = BEATS.findIndex((b) => t >= b.start && t < b.end);
	const curIdx = activeBeatIndex === -1 ? BEATS.length - 1 : activeBeatIndex;
	const currentBeat = BEATS[curIdx];
	const prevBeat = curIdx > 0 ? BEATS[curIdx - 1] : currentBeat;

	const beatStartFrame = Math.round(currentBeat.start * fps);
	const beatTransitionSpring = spring({
		frame: Math.max(0, frame - beatStartFrame),
		fps,
		config: {
			damping: 20,
			mass: 0.85,
			stiffness: 90,
		},
	});

	const stageTop = interpolate(
		beatTransitionSpring,
		[0, 1],
		[prevBeat.slideConfig.top, currentBeat.slideConfig.top]
	);

	const subtitleTop = interpolate(
		beatTransitionSpring,
		[0, 1],
		[prevBeat.subtitleConfig.top, currentBeat.subtitleConfig.top]
	);

	const stageRotX = interpolate(
		beatTransitionSpring,
		[0, 1],
		[prevBeat.slideConfig.rotX, currentBeat.slideConfig.rotX]
	);
	const stageRotY = interpolate(
		beatTransitionSpring,
		[0, 1],
		[prevBeat.slideConfig.rotY, currentBeat.slideConfig.rotY]
	);
	const stageRotZ = interpolate(
		beatTransitionSpring,
		[0, 1],
		[prevBeat.slideConfig.rotZ, currentBeat.slideConfig.rotZ]
	);
	const stageScale = interpolate(
		beatTransitionSpring,
		[0, 1],
		[prevBeat.slideConfig.scale, currentBeat.slideConfig.scale]
	);

	// Tipografia refinada (Anton + Instrument Serif + Plus Jakarta Sans)
	const getWordTypography = (word: KineticWord) => {
		const t_clean = word.text.toLowerCase().replace(/[.,:!?⭐"']/g, '').trim();

		// 1. EDITORIAL SERIF ITÁLICO
		if (
			[
				'genéricos', 'alma', 'estúdio', 'criativo', 'puro',
				'sincronizadas', 'milissegundo', 'profissional', 'estrela'
			].includes(t_clean)
		) {
			return {
				fontFamily: fontInstrumentSerif,
				fontStyle: 'italic',
				fontWeight: 400,
				textTransform: 'none' as const,
				letterSpacing: '0.01em',
				isSerif: true,
				isHero: false,
			};
		}

		// 2. HERO BRUTALIST (Anton)
		if (
			[
				'cansado', 'vídeos', 'gradiente', 'roxo', 'robôs',
				'vibe', 'design', 'studio', 'headless', 'código',
				'física', 'mola', 'apple', 'whisper', 'sound',
				'dinâmico', 'masterização', 'ebu', 'r128',
				'custo', 'zero', 'api', '100%', 'open', 'source',
				'github', 'skills', 'add'
			].includes(t_clean)
		) {
			return {
				fontFamily: fontAnton,
				fontStyle: 'normal',
				fontWeight: 900,
				textTransform: 'uppercase' as const,
				letterSpacing: '0.02em',
				isSerif: false,
				isHero: true,
			};
		}

		// 3. MODERN GEOMETRIC SANS
		return {
			fontFamily: fontPlusJakartaSans,
			fontStyle: 'normal',
			fontWeight: 700,
			textTransform: 'none' as const,
			letterSpacing: '0.01em',
			isSerif: false,
			isHero: false,
		};
	};

	// Renderizador de palavra cinética com spotlight de alto contraste
	const renderKineticWord = (word: KineticWord) => {
		const wordStartFrame = Math.round(word.start * fps);
		const isPast = t > word.end + 0.04;
		const isCurrent = t >= word.start && t <= word.end + 0.04;
		const typo = getWordTypography(word);

		const punchSpring = spring({
			frame: Math.max(0, frame - wordStartFrame),
			fps,
			config: {
				damping: 16,
				mass: 0.3,
				stiffness: 260,
			},
		});

		let fontSize = 48;
		if (typo.isHero) {
			fontSize = 72;
			if (word.text.toLowerCase().includes('vibe')) fontSize = 84;
			if (word.text.toLowerCase().includes('zero')) fontSize = 82;
			if (word.text.toLowerCase().includes('github')) fontSize = 84;
		} else if (typo.isSerif) {
			fontSize = 64;
			if (word.text.toLowerCase().includes('genéricos')) fontSize = 72;
			if (word.text.toLowerCase().includes('estrela')) fontSize = 74;
		} else {
			fontSize = 46;
		}

		let scale = 1.0;
		let opacity = 1.0;
		let textColor = textPrimaryColor;

		if (isCurrent) {
			scale = ci(punchSpring, [0, 0.7, 1], [0.97, 1.08, 1.02]);
			opacity = 1.0;

			if (isRedBg) {
				textColor = ELECTRIC_LIME;
			} else if (isLightBg) {
				textColor = word.accent ? FERRARI_RED : '#000000';
			} else {
				textColor = word.accent ? '#38BDF8' : '#10B981';
			}
		} else if (isPast) {
			scale = 1.0;
			opacity = isRedBg ? 0.95 : 0.95;
			textColor = isLightBg ? '#1A1A1A' : PURE_WHITE;
		} else {
			scale = 1.0;
			if (isRedBg) {
				opacity = 0.55;
				textColor = PURE_WHITE;
			} else if (isLightBg) {
				opacity = 0.28;
				textColor = '#111111';
			} else {
				opacity = 0.25;
				textColor = PURE_WHITE;
			}
		}

		return (
			<span
				key={word.index}
				style={{
					fontFamily: typo.fontFamily,
					fontWeight: typo.fontWeight,
					fontStyle: typo.fontStyle,
					textTransform: typo.textTransform,
					fontSize,
					color: textColor,
					opacity,
					transform: `scale(${scale})`,
					letterSpacing: typo.letterSpacing,
					lineHeight: 1.1,
					display: 'inline-block',
					margin: '0 6px',
					transition: 'color 0.05s ease',
					filter: isCurrent && typo.isHero ? `drop-shadow(0 0 12px ${isRedBg ? ELECTRIC_LIME : FERRARI_RED})` : 'none',
				}}
			>
				{word.text}
			</span>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// RENDERIZAÇÃO DAS DEMONSTRAÇÕES TÉCNICAS AO VIVO ("MOSTRAR NA PRÁTICA")
	// ────────────────────────────────────────────────────────────────────────────
	const renderDynamicSlideCards = () => {
		const floatY = Math.sin(t * 1.5) * 5;
		const floatRotY = Math.sin(t * 1.2) * 2;
		const floatRotZ = Math.cos(t * 1.0) * 1;

		return (
			<div
				style={{
					position: 'absolute',
					top: stageTop,
					left: '50%',
					width: 1000,
					height: 740,
					transform: `translateX(-50%) perspective(1200px) scale(${camZoom * stageScale}) rotateX(${camRotX + stageRotX}deg) rotateY(${camRotY + stageRotY}deg) rotateZ(${stageRotZ}deg)`,
					transformStyle: 'preserve-3d',
					zIndex: 10,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					pointerEvents: 'none',
				}}
			>
				{/* ═══════════════════════════════════════════════════════════════
				    DEMONSTRAÇÃO 1 (Frames 0 a 165 — Beats 1 & 2): SLOP SIMULATOR & REJEIÇÃO
				    ═══════════════════════════════════════════════════════════════ */}
				{frame < 165 && (() => {
					const enterProgress = ci(frame, [0, 16], [0, 1]);
					const exitProgress = ci(frame, [155, 165], [0, 1]);
					const opacity = enterProgress * (1 - exitProgress);
					const enterY = (1 - enterProgress) * 45;

					return (
						<div
							style={{
								position: 'absolute',
								opacity,
								transform: `translateY(${enterY + floatY}px) rotateY(${floatRotY}deg) rotateZ(${floatRotZ}deg)`,
								transformStyle: 'preserve-3d',
							}}
						>
							<SlopSimulator />
						</div>
					);
				})()}

				{/* ═══════════════════════════════════════════════════════════════
				    DEMONSTRAÇÃO 2 (Frames 165 a 335 — Beats 3 & 4): LIVE TERMINAL HEADLESS
				    ═══════════════════════════════════════════════════════════════ */}
				{frame >= 165 && frame < 335 && (() => {
					const enterSpring = spring({
						frame: Math.max(0, frame - 165),
						fps,
						config: { damping: 16, mass: 0.6, stiffness: 140 },
					});
					const exitProgress = ci(frame, [325, 335], [0, 1]);
					const opacity = (1 - exitProgress);
					const enterY = ci(enterSpring, [0, 1], [60, 0]);

					return (
						<div
							style={{
								position: 'absolute',
								opacity,
								transform: `translateY(${enterY + floatY}px) rotateY(${floatRotY}deg) rotateZ(${floatRotZ}deg)`,
								transformStyle: 'preserve-3d',
							}}
						>
							<LiveTerminal />
						</div>
					);
				})()}

				{/* ═══════════════════════════════════════════════════════════════
				    DEMONSTRAÇÃO 3 (Frames 335 a 480 — Beat 5): APPLE SPRING & WHISPER SYNC
				    ═══════════════════════════════════════════════════════════════ */}
				{frame >= 335 && frame < 480 && (() => {
					const enterSpring = spring({
						frame: Math.max(0, frame - 335),
						fps,
						config: { damping: 18, mass: 0.7, stiffness: 120 },
					});
					const exitProgress = ci(frame, [470, 480], [0, 1]);
					const opacity = (1 - exitProgress);
					const enterY = ci(enterSpring, [0, 1], [50, 0]);

					return (
						<div
							style={{
								position: 'absolute',
								opacity,
								transform: `translateY(${enterY + floatY}px) rotateY(${floatRotY}deg) rotateZ(${floatRotZ}deg)`,
								transformStyle: 'preserve-3d',
							}}
						>
							<AppleSpringDemo />
						</div>
					);
				})()}

				{/* ═══════════════════════════════════════════════════════════════
				    DEMONSTRAÇÃO 4 (Frames 480 a 625 — Beat 6): AUDIO CONSOLE VU METER & EBU R128
				    ═══════════════════════════════════════════════════════════════ */}
				{frame >= 480 && frame < 625 && (() => {
					const enterSpring = spring({
						frame: Math.max(0, frame - 480),
						fps,
						config: { damping: 18, mass: 0.7, stiffness: 120 },
					});
					const exitProgress = ci(frame, [615, 625], [0, 1]);
					const opacity = (1 - exitProgress);
					const enterY = ci(enterSpring, [0, 1], [50, 0]);

					return (
						<div
							style={{
								position: 'absolute',
								opacity,
								transform: `translateY(${enterY + floatY}px) rotateY(${floatRotY}deg) rotateZ(${floatRotZ}deg)`,
								transformStyle: 'preserve-3d',
							}}
						>
							<AudioConsoleDemo />
						</div>
					);
				})()}

				{/* ═══════════════════════════════════════════════════════════════
				    BEAT 7 (Frames 625 a 726): O GRANDE LEQUE TRIDIMENSIONAL (FAN-OUT 3D)
				    ═══════════════════════════════════════════════════════════════ */}
				{frame >= 625 && frame < 726 && (() => {
					const fanSpring = spring({
						frame: Math.max(0, frame - 625),
						fps,
						config: { damping: 18, mass: 0.85, stiffness: 95 },
					});

					const s1_x = -330 * fanSpring;
					const s1_y = 36 * fanSpring;
					const s1_z = -60 * fanSpring;
					const s1_rotY = 24 * fanSpring;
					const s1_rotZ = -12 * fanSpring;
					const s1_scale = ci(fanSpring, [0, 1], [0.8, 0.86]);

					const s2_x = -170 * fanSpring;
					const s2_y = 16 * fanSpring;
					const s2_z = -25 * fanSpring;
					const s2_rotY = 13 * fanSpring;
					const s2_rotZ = -6 * fanSpring;
					const s2_scale = ci(fanSpring, [0, 1], [0.85, 0.93]);

					const s3_x = 0;
					const s3_y = 0;
					const s3_z = 0;
					const s3_rotY = 0;
					const s3_rotZ = 0;
					const s3_scale = ci(fanSpring, [0, 1], [0.9, 1.0]);

					const s4_x = 170 * fanSpring;
					const s4_y = 16 * fanSpring;
					const s4_z = -25 * fanSpring;
					const s4_rotY = -13 * fanSpring;
					const s4_rotZ = 6 * fanSpring;
					const s4_scale = ci(fanSpring, [0, 1], [0.85, 0.93]);

					const s5_x = 330 * fanSpring;
					const s5_y = 36 * fanSpring;
					const s5_z = -60 * fanSpring;
					const s5_rotY = -24 * fanSpring;
					const s5_rotZ = 12 * fanSpring;
					const s5_scale = ci(fanSpring, [0, 1], [0.8, 0.86]);

					const cardShadowFan = '0 30px 85px -15px rgba(0, 0, 0, 0.8), 0 10px 30px -5px rgba(0, 0, 0, 0.5)';

					return (
						<>
							{/* Slide 01 no Leque */}
							<div
								style={{
									position: 'absolute',
									opacity: fanSpring,
									transform: `translate3d(${s1_x}px, ${s1_y + floatY}px, ${s1_z}px) rotateY(${s1_rotY + floatRotY}deg) rotateZ(${s1_rotZ}deg) scale(${s1_scale})`,
									transformStyle: 'preserve-3d',
									zIndex: 1,
								}}
							>
								<CarouselCardWrapper shadow={cardShadowFan}>
									<Slide01Capa />
								</CarouselCardWrapper>
							</div>

							{/* Slide 02 no Leque */}
							<div
								style={{
									position: 'absolute',
									opacity: fanSpring,
									transform: `translate3d(${s2_x}px, ${s2_y + floatY}px, ${s2_z}px) rotateY(${s2_rotY + floatRotY}deg) rotateZ(${s2_rotZ}deg) scale(${s2_scale})`,
									transformStyle: 'preserve-3d',
									zIndex: 2,
								}}
							>
								<CarouselCardWrapper shadow={cardShadowFan}>
									<Slide02Diagnostico />
								</CarouselCardWrapper>
							</div>

							{/* Slide 03 no Leque */}
							<div
								style={{
									position: 'absolute',
									opacity: fanSpring,
									transform: `translate3d(${s3_x}px, ${s3_y + floatY}px, ${s3_z}px) rotateY(${s3_rotY + floatRotY}deg) rotateZ(${s3_rotZ}deg) scale(${s3_scale})`,
									transformStyle: 'preserve-3d',
									zIndex: 3,
								}}
							>
								<CarouselCardWrapper shadow={cardShadowFan}>
									<Slide03Solucao />
								</CarouselCardWrapper>
							</div>

							{/* Slide 04 no Leque */}
							<div
								style={{
									position: 'absolute',
									opacity: fanSpring,
									transform: `translate3d(${s4_x}px, ${s4_y + floatY}px, ${s4_z}px) rotateY(${s4_rotY + floatRotY}deg) rotateZ(${s4_rotZ}deg) scale(${s4_scale})`,
									transformStyle: 'preserve-3d',
									zIndex: 2,
								}}
							>
								<CarouselCardWrapper shadow={cardShadowFan}>
									<Slide04Engenharia />
								</CarouselCardWrapper>
							</div>

							{/* Slide 05 no Leque */}
							<div
								style={{
									position: 'absolute',
									opacity: fanSpring,
									transform: `translate3d(${s5_x}px, ${s5_y + floatY}px, ${s5_z}px) rotateY(${s5_rotY + floatRotY}deg) rotateZ(${s5_rotZ}deg) scale(${s5_scale})`,
									transformStyle: 'preserve-3d',
									zIndex: 1,
								}}
							>
								<CarouselCardWrapper shadow={cardShadowFan}>
									<Slide05Final />
								</CarouselCardWrapper>
							</div>
						</>
					);
				})()}

				{/* ═══════════════════════════════════════════════════════════════
				    BEAT 8 (Frames 726 a 900): DEMONSTRAÇÃO GITHUB HERO & STAR CLICK
				    ═══════════════════════════════════════════════════════════════ */}
				{frame >= 726 && (() => {
					const heroEnterSpring = spring({
						frame: Math.max(0, frame - 726),
						fps,
						config: { damping: 16, mass: 0.75, stiffness: 110 },
					});

					return (
						<div
							style={{
								position: 'absolute',
								opacity: heroEnterSpring,
								transform: `translateY(${floatY}px) rotateY(${floatRotY}deg) scale(${ci(heroEnterSpring, [0, 1], [0.9, 1.05])})`,
								transformStyle: 'preserve-3d',
								zIndex: 50,
							}}
						>
							<GitHubStarHero />
						</div>
					);
				})()}
			</div>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// RENDERIZAÇÃO DA LEGENDA CINÉTICA EM BLOCO DE LINHAS
	// ────────────────────────────────────────────────────────────────────────────
	const renderKineticSubtitles = () => {
		return (
			<div
				style={{
					position: 'absolute',
					top: subtitleTop,
					left: '50%',
					transform: 'translateX(-50%)',
					width: currentBeat.subtitleConfig.maxWidth || 860,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 20,
					pointerEvents: 'none',
				}}
			>
				{currentBeat.lineIndices.map((lineWords, lineIdx) => (
					<div
						key={lineIdx}
						style={{
							display: 'flex',
							flexWrap: 'wrap',
							justifyContent: 'center',
							alignItems: 'baseline',
							margin: '4px 0',
						}}
					>
						{lineWords.map((wordIdx) => {
							const word = WORDS[wordIdx];
							if (!word) return null;
							return renderKineticWord(word);
						})}
					</div>
				))}
			</div>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// TRIGGER DE SFX EM FRAMES DETERMINÍSTICOS
	// ────────────────────────────────────────────────────────────────────────────
	const renderAudioTriggers = () => {
		if (!enableSfx) return null;

		return (
			<>
				{/* Narração Principal Sincronizada da Thalita */}
				{audioNarracao && (
					<Audio src={staticFile(audioNarracao)} volume={1.0} />
				)}

				{/* Trilha Lo-Fi Minimalista Tech (Batida Seca e Suave) */}
				<Audio src={staticFile('audio/musica/trilha_lofi.mp3')} volume={0.14} />

				{/* Efeitos Sonoros nas Transições de Demonstração (Persistência via Sequence) */}
				{/* Beat 1 Whoosh Zoom */}
				<Sequence from={2}>
					<Audio src={staticFile('audio/sfx/whoosh_zoom.mp3')} volume={0.4} />
				</Sequence>

				{/* Beat 2 Slam Stamp do Rejeitado por Slop */}
				<Sequence from={90}>
					<Audio src={staticFile('audio/sfx/hud_boom.mp3')} volume={0.55} />
				</Sequence>

				{/* Beat 3 Início do Terminal Mac */}
				<Sequence from={165}>
					<Audio src={staticFile('audio/sfx/futurista_click.mp3')} volume={0.35} />
				</Sequence>

				{/* Beat 4 Execução do Comando npX */}
				<Sequence from={266}>
					<Audio src={staticFile('audio/sfx/click_haptic.mp3')} volume={0.4} />
				</Sequence>

				{/* Beat 5 Mola Apple Quicando */}
				<Sequence from={335}>
					<Audio src={staticFile('audio/sfx/sub_impact_warm.mp3')} volume={0.45} />
				</Sequence>

				{/* Beat 6 Audio Console VU Meter */}
				<Sequence from={480}>
					<Audio src={staticFile('audio/sfx/whoosh_zoom.mp3')} volume={0.4} />
				</Sequence>

				{/* Beat 7 Abertura do Leque 3D */}
				<Sequence from={625}>
					<Audio src={staticFile('audio/sfx/click_haptic.mp3')} volume={0.4} />
				</Sequence>

				{/* Beat 8 Clique na Estrela do GitHub & Clímax */}
				<Sequence from={754}>
					<Audio src={staticFile('audio/sfx/impacto_final.mp3')} volume={0.65} />
				</Sequence>
			</>
		);
	};

	return (
		<AbsoluteFill
			style={{
				width: 1080,
				height: 1920,
				backgroundColor: bgColor,
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			{/* Grid Fino de Fundo Editorial */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					opacity: isLightBg ? 0.04 : 0.06,
					backgroundImage: `radial-gradient(${isLightBg ? '#000000' : '#ffffff'} 1px, transparent 1px)`,
					backgroundSize: '36px 36px',
					pointerEvents: 'none',
				}}
			/>

			{/* Palco 3D Dinâmico com as Demonstrações Reais */}
			{renderDynamicSlideCards()}

			{/* Legendas Cinéticas Sincronizadas com Thalita */}
			{renderKineticSubtitles()}

			{/* Bottom Watermark & Engagement Bar */}
			<div
				style={{
					position: 'absolute',
					bottom: 48,
					left: 0,
					right: 0,
					padding: '0 48px',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					zIndex: 30,
					pointerEvents: 'none',
				}}
			>
				<span
					style={{
						fontFamily: fontPlusJakartaSans,
						fontSize: 14,
						fontWeight: 700,
						color: isRedBg ? '#FFFFFF' : (isLightBg ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.5)'),
						letterSpacing: '0.08em',
						textTransform: 'uppercase',
					}}
				>
					@Gabrielrtads
				</span>
				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 6,
						background: isRedBg ? '#0B0C0E' : (isLightBg ? FERRARI_RED : '#FFFFFF'),
						color: isRedBg ? '#FFFFFF' : (isLightBg ? '#FFFFFF' : '#0B0C0E'),
						borderRadius: 999,
						padding: '8px 18px',
						fontFamily: fontPlusJakartaSans,
						fontSize: 13,
						fontWeight: 800,
						letterSpacing: '0.04em',
						boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
					}}
				>
					<span>Comente "VIBE"</span>
					<span>📌</span>
				</div>
			</div>

			{/* Camada de Áudio e SFX */}
			{renderAudioTriggers()}
		</AbsoluteFill>
	);
};
