import React, { useMemo } from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	interpolateColors,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadInstrumentSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';
import RAW_WORDS from './data/words.json';

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

// Enriquecimento das 63 palavras da locução com índices e flags de ênfase
const WORDS: KineticWord[] = (RAW_WORDS as { text: string; start: number; end: number }[]).map((w, i) => {
	const clean = w.text.toLowerCase().replace(/[.,:!?⭐"']/g, '').trim();
	const isAccent = [
		'vibe', 'design', 'studio', 'headless', 'puro', 'whisper', 'ebu', 'r128',
		'zero', '100%', 'open-source', 'skills', 'estrela', 'github', 'apple', 'mola', 'genéricos'
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

export interface FlowMotionMasterProps {
	audioNarracao?: string;
	enableSfx?: boolean;
}

export const FlowMotionMaster: React.FC<FlowMotionMasterProps> = ({
	audioNarracao = 'narracao.mp3',
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
	const EMERALD = '#10B981';
	const GOLD = '#F59E0B';
	const CYAN = '#38BDF8';
	const PURE_WHITE = '#FFFFFF';

	// ────────────────────────────────────────────────────────────────────────────
	// TRANSIÇÃO DE CORES DE FUNDO FLUIDA (8 BEATS NARRATIVOS)
	// ────────────────────────────────────────────────────────────────────────────
	const bgColor = interpolateColors(
		frame,
		[
			0, 80, 92,          // Beat 1: Black -> Red (0 - 3.05s)
			160, 174,           // Beat 2: Red -> Crisp Off-White (3.05 - 5.8s)
			250, 265,           // Beat 3: Off-White -> Dark Obsidian (5.8 - 8.85s)
			345, 360,           // Beat 4: Obsidian -> Deep Forest Emerald (8.85 - 12.0s)
			495, 510,           // Beat 5: Deep Forest -> Ferrari Red (12.0 - 17.0s)
			650, 666,           // Beat 6: Red -> High-contrast White (17.0 - 22.2s)
			750, 768, 918       // Beat 7 & 8: White -> Deep Obsidian / Black (22.2 - 30.6s)
		],
		[
			'#08090C', '#08090C', '#FF0022',
			'#FF0022', '#F5F6F8',
			'#F5F6F8', '#0A0B0E',
			'#0A0B0E', '#060B08',
			'#060B08', '#FF0022',
			'#FF0022', '#F8F9FA',
			'#F8F9FA', '#08090C', '#08090C'
		]
	);

	// Detecção de contraste de fundo
	const isLightBg = (frame >= 165 && frame < 260) || (frame >= 655 && frame < 760);
	const isRedBg = (frame >= 88 && frame < 170) || (frame >= 505 && frame < 660);
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
			end: 3.05,
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
				rotX: 10,
				rotY: 10,
				rotZ: -2,
				scale: 1.04,
			},
		},
		{
			// Beat 2: "com gradiente roxo e robôs sem alma?"
			// 🔄 INVERSÃO: SLIDE EM CIMA | LEGENDA EM BAIXO
			id: 2,
			start: 3.05,
			end: 5.8,
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
			// Beat 3: "Conheça o Vibe Design Studio: o estúdio"
			// 🔄 INVERSÃO: SLIDE EM BAIXO | LEGENDA NO TOPO
			id: 3,
			start: 5.8,
			end: 8.85,
			lineIndices: [
				[14, 15, 16, 17], // "Conheça o Vibe Design Studio:"
				[18, 19],         // "o estúdio"
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
				rotY: 10,
				rotZ: -1,
				scale: 1.04,
			},
		},
		{
			// Beat 4: "criativo headless para agentes em código puro."
			// 🔄 INVERSÃO: SLIDE EM CIMA | LEGENDA EM BAIXO
			id: 4,
			start: 8.85,
			end: 12.0,
			lineIndices: [
				[20, 21, 22], // "criativo headless para agentes"
				[23, 24, 25], // "em código puro."
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
				rotY: -9,
				rotZ: 2,
				scale: 1.03,
			},
		},
		{
			// Beat 5: "Física de mola Apple, legendas cinéticas sincronizadas no milissegundo com Whisper,"
			// 🔄 INVERSÃO: SLIDE EM BAIXO | LEGENDA NO TOPO
			id: 5,
			start: 12.0,
			end: 17.0,
			lineIndices: [
				[26, 27, 28, 29], // "Física de mola Apple,"
				[30, 31, 32],     // "legendas cinéticas sincronizadas"
				[33, 34, 35, 36], // "no milissegundo com Whisper,"
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
				rotX: 10,
				rotY: 8,
				rotZ: -2,
				scale: 1.05,
			},
		},
		{
			// Beat 6: "sound design dinâmico e masterização profissional EBU R128."
			// 🔄 INVERSÃO: SLIDE EM CIMA | LEGENDA EM BAIXO
			id: 6,
			start: 17.0,
			end: 22.2,
			lineIndices: [
				[37, 38, 39, 40], // "sound design dinâmico"
				[41, 42],         // "e masterização profissional"
				[43, 44],         // "EBU R128."
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
			// Beat 7: "Custo zero de API e 100% open-source."
			// 🔄 INVERSÃO: SLIDE EM BAIXO | LEGENDA NO TOPO
			id: 7,
			start: 22.2,
			end: 25.6,
			lineIndices: [
				[45, 46, 47, 48], // "Custo zero de API"
				[49, 50, 51],     // "e 100% open-source."
			],
			subtitleConfig: {
				top: 220,
				align: 'center',
				maxWidth: 860,
			},
			slideConfig: {
				top: 860,
				x: 0,
				y: 20,
				z: 30,
				rotX: 9,
				rotY: 9,
				rotZ: -2,
				scale: 1.05,
			},
		},
		{
			// Beat 8: "Instale via npx skills add e deixe sua estrela no GitHub! ⭐"
			// 🔄 CLÍMAX HERO: SLIDE EM BAIXO/CENTRO | LEGENDA NO TOPO
			id: 8,
			start: 25.6,
			end: 30.6,
			lineIndices: [
				[52, 53, 54, 55, 56], // "Instale via npx skills add"
				[57, 58, 59, 60],     // "e deixe sua estrela"
				[61, 62],             // "no GitHub! ⭐"
			],
			subtitleConfig: {
				top: 180,
				align: 'center',
				maxWidth: 880,
			},
			slideConfig: {
				top: 760,
				x: 0,
				y: 20,
				z: 80,
				rotX: 6,
				rotY: 0,
				rotZ: 0,
				scale: 1.08,
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
				'custo', 'zero', 'api', '100%', 'open-source',
				'github', 'skills'
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
				// No fundo Ferrari Red, o Electric Lime (#D4FF00) é o rei absoluto do contraste editorial
				textColor = ELECTRIC_LIME;
			} else if (isLightBg) {
				textColor = word.accent ? (currentBeat.id >= 3 && currentBeat.id <= 6 ? '#059669' : FERRARI_RED) : '#000000';
			} else {
				textColor = word.accent ? (currentBeat.id >= 7 ? GOLD : EMERALD) : FERRARI_RED;
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
				opacity = 0.32;
				textColor = PURE_WHITE;
			}
		}

		const textShadow = isRedBg
			? '0 4px 18px rgba(0, 0, 0, 0.75)'
			: isLightBg
			? 'none'
			: '0 3px 14px rgba(0, 0, 0, 0.6)';

		return (
			<span
				key={word.index}
				style={{
					display: 'inline-block',
					position: 'relative',
					fontFamily: typo.fontFamily,
					fontStyle: typo.fontStyle,
					fontSize,
					fontWeight: typo.fontWeight,
					textTransform: typo.textTransform,
					color: textColor,
					opacity,
					transform: `scale(${scale})`,
					transformOrigin: 'center center',
					letterSpacing: typo.letterSpacing,
					lineHeight: 1.15,
					margin: '0 8px',
					transition: 'color 0.12s ease, opacity 0.12s ease',
					textShadow,
				}}
			>
				{word.text}
			</span>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// RENDERIZAÇÃO DOS 5 CARDS 4:5 EM REACT/CSS PURO (VETORIAL, ULTRA-SHARP)
	// ────────────────────────────────────────────────────────────────────────────
	const renderDynamicSlideCards = () => {
		const floatY = Math.sin(t * 1.5) * 5;
		const floatRotY = Math.sin(t * 1.2) * 2;
		const floatRotZ = Math.cos(t * 1.0) * 1;

		const luxuryCardBorder = isLightBg
			? '1px solid rgba(0, 0, 0, 0.08)'
			: '1px solid rgba(255, 255, 255, 0.14)';

		const luxuryCardShadow = isLightBg
			? '0 30px 70px -15px rgba(0, 0, 0, 0.18), 0 10px 25px -5px rgba(0, 0, 0, 0.10)'
			: '0 35px 85px -15px rgba(0, 0, 0, 0.75), 0 10px 35px -5px rgba(0, 0, 0, 0.5)';

		return (
			<div
				style={{
					position: 'absolute',
					top: stageTop,
					left: '50%',
					width: 1000,
					height: 680,
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
				    CARD 1 (Frames 0 a 174 — Beats 1 & 2): AI SLOP ALERT & REJEIÇÃO
				    ═══════════════════════════════════════════════════════════════ */}
				{frame < 174 && (() => {
					const enterProgress = ci(frame, [0, 14], [0, 1]);
					const exitProgress = ci(frame, [160, 174], [0, 1]);
					const opacity = enterProgress * (1 - exitProgress);
					const enterY = (1 - enterProgress) * 50;

					// Mola física para impacto do carimbo de rejeição no Frame 92
					const stampSpring = spring({
						frame: Math.max(0, frame - 92),
						fps,
						config: { damping: 14, mass: 0.45, stiffness: 220 },
					});
					const stampScale = frame < 92 ? 0 : ci(stampSpring, [0, 1], [2.2, 1.0]);
					const stampOpacity = frame < 92 ? 0 : ci(stampSpring, [0, 0.3, 1], [0, 0.8, 1]);

					return (
						<div
							style={{
								position: 'absolute',
								width: 520,
								height: 650,
								opacity,
								transform: `translateY(${enterY + floatY}px) rotateY(${floatRotY}deg) rotateZ(${floatRotZ}deg)`,
								transformStyle: 'preserve-3d',
							}}
						>
							<div
								style={{
									width: '100%',
									height: '100%',
									borderRadius: 28,
									overflow: 'hidden',
									boxShadow: luxuryCardShadow,
									border: luxuryCardBorder,
									background: 'linear-gradient(145deg, #120e18 0%, #09080e 100%)',
									padding: 36,
									boxSizing: 'border-box',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
									position: 'relative',
								}}
							>
								{/* Top Header Card */}
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<div
										style={{
											display: 'inline-flex',
											alignItems: 'center',
											gap: 8,
											background: 'rgba(239, 68, 68, 0.18)',
											border: '1px solid rgba(239, 68, 68, 0.4)',
											borderRadius: 999,
											padding: '6px 14px',
											fontFamily: fontMono,
											fontSize: 13,
											color: '#f87171',
											fontWeight: 700,
											letterSpacing: '0.08em',
										}}
									>
										<span>⚠️</span> AI SLOP DETECTED
									</div>
									<span style={{ fontFamily: fontMono, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
										01 / 05
									</span>
								</div>

								{/* Mock Prompt Box com Gradiente Roxo Slop */}
								<div
									style={{
										background: 'rgba(255, 255, 255, 0.04)',
										border: '1px dashed rgba(168, 85, 247, 0.5)',
										borderRadius: 18,
										padding: 20,
										display: 'flex',
										flexDirection: 'column',
										gap: 10,
									}}
								>
									<span style={{ fontFamily: fontMono, fontSize: 12, color: '#c084fc', textTransform: 'uppercase' }}>
										Prompt Genérico:
									</span>
									<span style={{ fontFamily: fontPlusJakartaSans, fontSize: 16, color: '#e2e8f0', lineHeight: 1.4 }}>
										"Crie um vídeo futurista com gradiente roxo, robôs neon e transições aleatórias..."
									</span>
								</div>

								{/* Métricas de Fracasso */}
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
									<div
										style={{
											background: 'rgba(0,0,0,0.4)',
											border: '1px solid rgba(255,255,255,0.06)',
											borderRadius: 16,
											padding: 16,
										}}
									>
										<div style={{ fontFamily: fontMono, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
											RETENÇÃO MÉDIA
										</div>
										<div style={{ fontFamily: fontAnton, fontSize: 36, color: '#f87171', marginTop: 4 }}>
											1.2s
										</div>
									</div>
									<div
										style={{
											background: 'rgba(0,0,0,0.4)',
											border: '1px solid rgba(255,255,255,0.06)',
											borderRadius: 16,
											padding: 16,
										}}
									>
										<div style={{ fontFamily: fontMono, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
											ALMA / ORIGINALIDADE
										</div>
										<div style={{ fontFamily: fontAnton, fontSize: 36, color: '#f87171', marginTop: 4 }}>
											0%
										</div>
									</div>
								</div>

								{/* Carimbo de Rejeição Brutalista com Animação de Slam */}
								<div
									style={{
										border: '3px solid #ef4444',
										borderRadius: 14,
										padding: '12px 20px',
										textAlign: 'center',
										transform: `rotate(-4deg) scale(${stampScale})`,
										opacity: stampOpacity,
										background: 'rgba(239, 68, 68, 0.15)',
										boxShadow: '0 0 30px rgba(239, 68, 68, 0.35)',
									}}
								>
									<span
										style={{
											fontFamily: fontAnton,
											fontSize: 32,
											color: '#ef4444',
											letterSpacing: '0.12em',
										}}
									>
										REJEITADO POR SLOP
									</span>
								</div>
							</div>
						</div>
					);
				})()}

				{/* ═══════════════════════════════════════════════════════════════
				    CARD 2 (Frames 165 a 365 — Beats 3 & 4): VIBE DESIGN STUDIO TERMINAL
				    ═══════════════════════════════════════════════════════════════ */}
				{frame >= 165 && frame < 365 && (() => {
					const enterProgress = ci(frame, [165, 180], [0, 1]);
					const exitProgress = ci(frame, [345, 360], [0, 1]);
					const opacity = enterProgress * (1 - exitProgress);
					const enterX = (1 - enterProgress) * 70;

					return (
						<div
							style={{
								position: 'absolute',
								width: 520,
								height: 650,
								opacity,
								transform: `translateX(${enterX}px) translateY(${floatY}px) rotateY(${floatRotY}deg) rotateZ(${floatRotZ}deg)`,
								transformStyle: 'preserve-3d',
							}}
						>
							<div
								style={{
									width: '100%',
									height: '100%',
									borderRadius: 28,
									overflow: 'hidden',
									boxShadow: luxuryCardShadow,
									border: luxuryCardBorder,
									background: '#0d1117',
									display: 'flex',
									flexDirection: 'column',
									position: 'relative',
								}}
							>
								{/* Top Bar macOS com Botões */}
								<div
									style={{
										height: 48,
										background: '#161b22',
										borderBottom: '1px solid rgba(255,255,255,0.08)',
										display: 'flex',
										alignItems: 'center',
										padding: '0 20px',
										gap: 8,
										justifyContent: 'space-between',
									}}
								>
									<div style={{ display: 'flex', gap: 8 }}>
										<div style={{ width: 12, height: 12, borderRadius: 6, background: '#ff5f56' }} />
										<div style={{ width: 12, height: 12, borderRadius: 6, background: '#ffbd2e' }} />
										<div style={{ width: 12, height: 12, borderRadius: 6, background: '#27c93f' }} />
									</div>
									<span style={{ fontFamily: fontMono, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
										vibe-design-studio — zsh
									</span>
									<span style={{ width: 28 }} />
								</div>

								{/* Terminal Body */}
								<div
									style={{
										padding: 28,
										flex: 1,
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'space-between',
										fontFamily: fontMono,
									}}
								>
									<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
										<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
											<span style={{ color: '#38bdf8' }}>➜</span>
											<span style={{ color: '#a78bfa' }}>workspace</span>
											<span style={{ color: '#ffffff' }}>npx skills add vibe-design-studio</span>
										</div>

										<div style={{ color: '#34d399', fontSize: 13, lineHeight: 1.6 }}>
											✔ [INSTALLED] Vibe Design Studio v1.0.0<br />
											✔ [ENGINE] Remotion + React 18 Puro<br />
											✔ [AUDIO] Whisper C++ Sub-15ms<br />
											✔ [PHYSICS] Apple Spring Engine
										</div>

										<div
											style={{
												marginTop: 8,
												padding: 14,
												background: 'rgba(56, 189, 248, 0.08)',
												border: '1px solid rgba(56, 189, 248, 0.25)',
												borderRadius: 12,
											}}
										>
											<div style={{ color: '#38bdf8', fontSize: 12, fontWeight: 700 }}>
												ARQUITETURA HEADLESS PARA AGENTES:
											</div>
											<div style={{ color: '#e2e8f0', fontSize: 13, marginTop: 4 }}>
												Claude Code, Codex e Antigravity criam e editam vídeos diretamente em código.
											</div>
										</div>
									</div>

									{/* Badge Inferior */}
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											borderTop: '1px solid rgba(255,255,255,0.08)',
											paddingTop: 16,
										}}
									>
										<span style={{ color: '#34d399', fontSize: 13, fontWeight: 700 }}>
											● 100% CÓDIGO PURO
										</span>
										<span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
											Zero Web UIs lentas
										</span>
									</div>
								</div>
							</div>
						</div>
					);
				})()}

				{/* ═══════════════════════════════════════════════════════════════
				    CARD 3 (Frames 355 a 515 — Beat 5): APPLE SPRING & WHISPER SYNC
				    ═══════════════════════════════════════════════════════════════ */}
				{frame >= 355 && frame < 515 && (() => {
					const enterProgress = ci(frame, [355, 370], [0, 1]);
					const exitProgress = ci(frame, [495, 510], [0, 1]);
					const opacity = enterProgress * (1 - exitProgress);
					const enterY = (1 - enterProgress) * -45;

					const bars = [18, 38, 54, 78, 62, 88, 45, 92, 70, 48, 35, 68, 85, 42, 60];

					return (
						<div
							style={{
								position: 'absolute',
								width: 520,
								height: 650,
								opacity,
								transform: `translateY(${enterY + floatY}px) rotateY(${floatRotY}deg) rotateZ(${floatRotZ}deg)`,
								transformStyle: 'preserve-3d',
							}}
						>
							<div
								style={{
									width: '100%',
									height: '100%',
									borderRadius: 28,
									overflow: 'hidden',
									boxShadow: luxuryCardShadow,
									border: luxuryCardBorder,
									background: 'linear-gradient(155deg, #071710 0%, #040906 100%)',
									padding: 34,
									boxSizing: 'border-box',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
									position: 'relative',
								}}
							>
								{/* Header */}
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<div
										style={{
											display: 'inline-flex',
											alignItems: 'center',
											gap: 8,
											background: 'rgba(16, 185, 129, 0.18)',
											border: '1px solid rgba(16, 185, 129, 0.4)',
											borderRadius: 999,
											padding: '6px 14px',
											fontFamily: fontMono,
											fontSize: 13,
											color: '#34d399',
											fontWeight: 700,
										}}
									>
										<span>🍏</span> APPLE SPRING ENGINE
									</div>
									<span style={{ fontFamily: fontMono, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
										03 / 05
									</span>
								</div>

								{/* Visualizador de Curva de Mola Apple */}
								<div
									style={{
										background: 'rgba(0,0,0,0.5)',
										border: '1px solid rgba(16, 185, 129, 0.2)',
										borderRadius: 20,
										padding: 20,
										display: 'flex',
										flexDirection: 'column',
										gap: 12,
									}}
								>
									<div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: fontMono, fontSize: 12 }}>
										<span style={{ color: '#34d399' }}>CURVA DE MOVIMENTO FÍSICO</span>
										<span style={{ color: 'rgba(255,255,255,0.5)' }}>damping: 20 • stiffness: 90</span>
									</div>

									{/* Traçado SVG da mola crítica */}
									<svg width="100%" height="80" viewBox="0 0 450 80" style={{ overflow: 'visible' }}>
										<path
											d="M 10 70 Q 80 5, 150 15 T 260 20 T 360 20 L 440 20"
											fill="none"
											stroke="#10b981"
											strokeWidth="4"
											strokeLinecap="round"
										/>
										<circle cx="260" cy="20" r="6" fill="#d4ff00" />
									</svg>
								</div>

								{/* Waveform Whisper Sync */}
								<div
									style={{
										background: 'rgba(0,0,0,0.5)',
										border: '1px solid rgba(255,255,255,0.06)',
										borderRadius: 20,
										padding: 20,
									}}
								>
									<div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: fontMono, fontSize: 12, marginBottom: 14 }}>
										<span style={{ color: '#38bdf8' }}>WHISPER C++ SYNC</span>
										<span style={{ color: '#34d399', fontWeight: 700 }}>00:14.280 ms [LOCKED]</span>
									</div>

									<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 50, gap: 4 }}>
										{bars.map((h, i) => {
											const waveH = Math.max(12, Math.min(48, h * (0.8 + Math.sin(t * 8 + i) * 0.3)));
											return (
												<div
													key={i}
													style={{
														width: 14,
														height: waveH,
														background: i > 8 ? '#10b981' : '#38bdf8',
														borderRadius: 6,
														transition: 'height 0.08s ease',
													}}
												/>
											);
										})}
									</div>
								</div>

								{/* Rodapé Card */}
								<div style={{ fontFamily: fontMono, fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
									Zero delays manuais • Legendas cravadas na fala
								</div>
							</div>
						</div>
					);
				})()}

				{/* ═══════════════════════════════════════════════════════════════
				    CARD 4 (Frames 505 a 665 — Beat 6): SOUND DESIGN & EBU R128
				    ═══════════════════════════════════════════════════════════════ */}
				{frame >= 505 && frame < 665 && (() => {
					const enterProgress = ci(frame, [505, 520], [0, 1]);
					const exitProgress = ci(frame, [650, 665], [0, 1]);
					const opacity = enterProgress * (1 - exitProgress);
					const enterScale = ci(enterProgress, [0, 1], [0.95, 1.03]);

					return (
						<div
							style={{
								position: 'absolute',
								width: 520,
								height: 650,
								opacity,
								transform: `translateY(${floatY}px) rotateY(${floatRotY}deg) rotateZ(${floatRotZ}deg) scale(${enterScale})`,
								transformStyle: 'preserve-3d',
							}}
						>
							<div
								style={{
									width: '100%',
									height: '100%',
									borderRadius: 28,
									overflow: 'hidden',
									boxShadow: luxuryCardShadow,
									border: luxuryCardBorder,
									background: 'linear-gradient(155deg, #18090a 0%, #0d0405 100%)',
									padding: 34,
									boxSizing: 'border-box',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
									position: 'relative',
								}}
							>
								{/* Header */}
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<div
										style={{
											display: 'inline-flex',
											alignItems: 'center',
											gap: 8,
											background: 'rgba(255, 0, 34, 0.18)',
											border: '1px solid rgba(255, 0, 34, 0.4)',
											borderRadius: 999,
											padding: '6px 14px',
											fontFamily: fontMono,
											fontSize: 13,
											color: '#ff4d6d',
											fontWeight: 700,
										}}
									>
										<span>🎚️</span> MASTER AUDIO CONSOLE
									</div>
									<span style={{ fontFamily: fontMono, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
										04 / 05
									</span>
								</div>

								{/* Medidores de Masterização EBU R128 */}
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
									<div
										style={{
											background: 'rgba(0,0,0,0.5)',
											border: '1px solid rgba(255, 0, 34, 0.3)',
											borderRadius: 18,
											padding: 18,
										}}
									>
										<div style={{ fontFamily: fontMono, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
											INTEGRATED LOUDNESS
										</div>
										<div style={{ fontFamily: fontAnton, fontSize: 40, color: '#ff0022', marginTop: 4 }}>
											-14 LUFS
										</div>
										<div style={{ fontFamily: fontMono, fontSize: 12, color: '#34d399', marginTop: 4 }}>
											● EBU R128 LOCKED
										</div>
									</div>

									<div
										style={{
											background: 'rgba(0,0,0,0.5)',
											border: '1px solid rgba(255,255,255,0.08)',
											borderRadius: 18,
											padding: 18,
										}}
									>
										<div style={{ fontFamily: fontMono, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
											TRUE PEAK LIMIT
										</div>
										<div style={{ fontFamily: fontAnton, fontSize: 40, color: '#ffffff', marginTop: 4 }}>
											-1.0 dB
										</div>
										<div style={{ fontFamily: fontMono, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
											Zero clipping
										</div>
									</div>
								</div>

								{/* Gatilhos SFX Automáticos */}
								<div
									style={{
										background: 'rgba(0,0,0,0.4)',
										border: '1px solid rgba(255,255,255,0.06)',
										borderRadius: 18,
										padding: 20,
										display: 'flex',
										flexDirection: 'column',
										gap: 10,
									}}
								>
									<span style={{ fontFamily: fontMono, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
										CAMADA DE SFX AUTOMATIZADA:
									</span>
									<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
										{['WHOOSH_ZOOM', 'HAPTIC_CLICK', 'SUB_BASS_DROP', 'FUTURISTA_RISE'].map((sfx, idx) => (
											<div
												key={idx}
												style={{
													background: idx === 0 ? '#ff0022' : 'rgba(255,255,255,0.08)',
													color: idx === 0 ? '#ffffff' : '#e2e8f0',
													padding: '6px 12px',
													borderRadius: 8,
													fontFamily: fontMono,
													fontSize: 12,
													fontWeight: 700,
												}}
											>
												{sfx}
											</div>
										))}
									</div>
								</div>

								{/* Rodapé Card */}
								<div style={{ fontFamily: fontMono, fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
									Áudio encorpado para Instagram, TikTok e YouTube
								</div>
							</div>
						</div>
					);
				})()}

				{/* ═══════════════════════════════════════════════════════════════
				    CARD 5 (Frames 660 a 918 — Beats 7 & 8): HERO GITHUB & MULTIAGENT
				    ═══════════════════════════════════════════════════════════════ */}
				{frame >= 660 && (() => {
					const enterProgress = ci(frame, [660, 680], [0, 1]);
					const starPop = spring({
						frame: Math.max(0, frame - 770),
						fps,
						config: { damping: 14, mass: 0.5, stiffness: 120 },
					});

					const starCount = Math.round(interpolate(starPop, [0, 1], [120, 1482]));

					return (
						<div
							style={{
								position: 'absolute',
								width: 540,
								height: 680,
								opacity: enterProgress,
								transform: `translateY(${floatY}px) rotateY(${floatRotY}deg) scale(${1.02 + starPop * 0.04})`,
								transformStyle: 'preserve-3d',
							}}
						>
							<div
								style={{
									width: '100%',
									height: '100%',
									borderRadius: 32,
									overflow: 'hidden',
									boxShadow: '0 40px 100px -15px rgba(0, 0, 0, 0.9), 0 0 45px rgba(245, 158, 11, 0.25)',
									border: '1.5px solid rgba(245, 158, 11, 0.45)',
									background: 'linear-gradient(160deg, #111116 0%, #08080a 100%)',
									padding: 38,
									boxSizing: 'border-box',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
									position: 'relative',
								}}
							>
								{/* Header Hero */}
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<div
										style={{
											display: 'inline-flex',
											alignItems: 'center',
											gap: 8,
											background: 'rgba(245, 158, 11, 0.18)',
											border: '1px solid rgba(245, 158, 11, 0.4)',
											borderRadius: 999,
											padding: '8px 16px',
											fontFamily: fontMono,
											fontSize: 13,
											color: '#fbbf24',
											fontWeight: 700,
										}}
									>
										<span>⭐</span> 100% OPEN SOURCE • MIT
									</div>
									<span style={{ fontFamily: fontMono, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
										CUSTO ZERO
									</span>
								</div>

								{/* Repositório e Grande Contador de Estrelas */}
								<div
									style={{
										background: 'rgba(255,255,255,0.03)',
										border: '1px solid rgba(255,255,255,0.08)',
										borderRadius: 22,
										padding: 24,
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										gap: 12,
									}}
								>
									<span style={{ fontFamily: fontMono, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
										github.com/Gabrielrtads/vibe-design-studio
									</span>

									<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
										<span style={{ fontSize: 48 }}>⭐</span>
										<span
											style={{
												fontFamily: fontAnton,
												fontSize: 64,
												color: '#fbbf24',
												letterSpacing: '0.04em',
											}}
										>
											{starCount}
										</span>
									</div>

									<span style={{ fontFamily: fontPlusJakartaSans, fontSize: 14, color: '#34d399', fontWeight: 600 }}>
										Deixe sua estrela no repositório oficial!
									</span>
								</div>

								{/* Suporte Multiagente */}
								<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
									<span style={{ fontFamily: fontMono, fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
										Orquestrado nos 3 Grandes Agentes:
									</span>
									<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
										<div
											style={{
												background: 'rgba(245, 158, 11, 0.12)',
												border: '1px solid rgba(245, 158, 11, 0.3)',
												borderRadius: 10,
												padding: '8px 10px',
												textAlign: 'center',
												fontFamily: fontMono,
												fontSize: 11,
												color: '#fbbf24',
												fontWeight: 700,
											}}
										>
											Claude Code
										</div>
										<div
											style={{
												background: 'rgba(16, 185, 129, 0.12)',
												border: '1px solid rgba(16, 185, 129, 0.3)',
												borderRadius: 10,
												padding: '8px 10px',
												textAlign: 'center',
												fontFamily: fontMono,
												fontSize: 11,
												color: '#34d399',
												fontWeight: 700,
											}}
										>
											OpenAI Codex
										</div>
										<div
											style={{
												background: 'rgba(56, 189, 248, 0.12)',
												border: '1px solid rgba(56, 189, 248, 0.3)',
												borderRadius: 10,
												padding: '8px 10px',
												textAlign: 'center',
												fontFamily: fontMono,
												fontSize: 11,
												color: '#38bdf8',
												fontWeight: 700,
											}}
										>
											Antigravity
										</div>
									</div>
								</div>

								{/* Botão de Comando Copiável */}
								<div
									style={{
										background: '#ffffff',
										borderRadius: 16,
										padding: '16px 20px',
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
								>
									<span
										style={{
											fontFamily: fontMono,
											fontSize: 14,
											color: '#0a0a0f',
											fontWeight: 700,
										}}
									>
										$ npx skills add Gabrielrtads/...
									</span>
									<div
										style={{
											background: '#0a0a0f',
											color: '#ffffff',
											borderRadius: 8,
											padding: '6px 12px',
											fontFamily: fontMono,
											fontSize: 12,
											fontWeight: 700,
										}}
									>
										COPIAR
									</div>
								</div>
							</div>
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
				{/* Narração Principal Sincronizada */}
				{audioNarracao && (
					<Audio src={staticFile(audioNarracao)} volume={1.0} />
				)}

				{/* Trilha de Luxo Duckada */}
				<Audio src={staticFile('audio/trilha_luxo.mp3')} volume={0.12} />

				{/* Efeitos Sonoros nas Transições de Beat */}
				{/* Beat 1 Drop */}
				{frame === 2 && <Audio src={staticFile('audio/whoosh_zoom.mp3')} volume={0.4} />}

				{/* Beat 2 Shock */}
				{frame === 92 && <Audio src={staticFile('audio/hud_boom.mp3')} volume={0.5} />}

				{/* Beat 3 Terminal Rise */}
				{frame === 174 && <Audio src={staticFile('audio/hud_rise.mp3')} volume={0.45} />}

				{/* Beat 4 Code Click */}
				{frame === 265 && <Audio src={staticFile('audio/futurista_click.mp3')} volume={0.35} />}

				{/* Beat 5 Apple Spring Warm Bass */}
				{frame === 360 && <Audio src={staticFile('audio/sub_impact_warm.mp3')} volume={0.4} />}

				{/* Beat 6 Audio Console Whoosh */}
				{frame === 510 && <Audio src={staticFile('audio/whoosh_zoom.mp3')} volume={0.45} />}

				{/* Beat 7 Zero API Drop */}
				{frame === 666 && <Audio src={staticFile('audio/click_haptic.mp3')} volume={0.4} />}

				{/* Beat 8 Clímax Final GitHub Star */}
				{frame === 768 && <Audio src={staticFile('audio/impacto_final.mp3')} volume={0.65} />}
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

			{/* Palco 3D Dinâmico com os Cards */}
			{renderDynamicSlideCards()}

			{/* Legendas Cinéticas Sincronizadas */}
			{renderKineticSubtitles()}

			{/* Camada de Áudio e SFX */}
			{renderAudioTriggers()}
		</AbsoluteFill>
	);
};
