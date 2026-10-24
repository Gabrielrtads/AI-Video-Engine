import React, { useMemo } from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	interpolateColors,
	OffthreadVideo,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import { CinematicStage, AnimosSheen } from './styles_kit';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadInstrumentSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

// Palavras da narração da Thalita sincronizadas via Whisper
import RAW_WORDS from './data/words_thalita_cleaned.json';

// Fontes canônicas
const { fontFamily: fontAnton } = loadAnton();
const { fontFamily: fontInstrumentSerif } = loadInstrumentSerif('italic');
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['500', '600', '700', '800'],
});
const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

// Clamp helper
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

export interface FullBleedShowcaseProps {
	audioNarracao?: string;
	enableSfx?: boolean;
}

export const FullBleedShowcase: React.FC<FullBleedShowcaseProps> = ({
	audioNarracao = 'audio/locucao/narracao_thalita.mp3',
	enableSfx = true,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const t = frame / fps;

	// Cores da Identidade Visual
	const FERRARI_RED = '#FF0022';
	const MATRIX_GREEN = '#00FF66';
	const ELECTRIC_CYAN = '#00F0FF';
	const PURE_BLACK = '#060709';
	const PURE_WHITE = '#FFFFFF';

	// Palavra ativa do Whisper
	const activeWord = useMemo(() => {
		return RAW_WORDS.find((w) => t >= w.start && t <= w.end);
	}, [t]);

	// ────────────────────────────────────────────────────────────────────────────
	// CENA 1 (FRAMES 0 - 90 / 0.0s - 3.0s): HOOK BRUTALISTA FLUIDO
	// "Cansado de vídeos de inteligência artificial genéricos..."
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene1Hook = () => {
		if (frame > 95) return null;

		// Transição de saída contínua (cross-dissolve suave)
		const sceneOpacity = ci(frame, [80, 92], [1, 0]);
		const cameraDrift = ci(frame, [0, 90], [1.0, 1.035]);

		// Staggered smooth fade-up para cada linha (padrão Apple)
		const line1Spring = spring({ frame: frame, fps, config: { damping: 24, mass: 0.8, stiffness: 120 } });
		const line2Spring = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 24, mass: 0.8, stiffness: 120 } });
		const line3Spring = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 24, mass: 0.8, stiffness: 120 } });

		return (
			<AbsoluteFill
				style={{
					backgroundColor: PURE_BLACK,
					justifyContent: 'center',
					alignItems: 'center',
					padding: '0 64px',
					opacity: sceneOpacity,
					transform: `scale(${cameraDrift})`,
					pointerEvents: 'none',
				}}
			>
				{/* Scanlines analógicas de fundo orgânicas e sutis */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 2px, transparent 2px, transparent 6px)',
						opacity: 0.8,
					}}
				/>

				{/* Top Tag com fade suave */}
				<div
					style={{
						position: 'absolute',
						top: 140,
						left: 64,
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						opacity: ci(frame, [0, 15], [0, 1]),
						transform: `translateY(${ci(frame, [0, 15], [10, 0])}px)`,
					}}
				>
					<span
						style={{
							display: 'inline-block',
							width: 14,
							height: 14,
							borderRadius: '50%',
							backgroundColor: FERRARI_RED,
							boxShadow: `0 0 20px ${FERRARI_RED}`,
						}}
					/>
					<span
						style={{
							fontFamily: fontMono,
							fontSize: 24,
							color: 'rgba(255, 255, 255, 0.6)',
							letterSpacing: '0.12em',
							textTransform: 'uppercase',
							fontWeight: 700,
						}}
					>
						[DIAGNÓSTICO CRÍTICO 01]
					</span>
				</div>

				{/* Tipografia Massiva em Staggered Fade-Up Contínuo */}
				<div
					style={{
						width: '100%',
						display: 'flex',
						flexDirection: 'column',
						gap: 12,
					}}
				>
					{/* Linha 1 */}
					<div
						style={{
							fontFamily: fontAnton,
							fontSize: 124,
							lineHeight: 0.92,
							color: PURE_WHITE,
							textTransform: 'uppercase',
							letterSpacing: '-0.02em',
							opacity: ci(line1Spring, [0, 1], [0, 1]),
							transform: `translateY(${ci(line1Spring, [0, 1], [30, 0])}px)`,
						}}
					>
						CANSADO DE
					</div>

					{/* Linha 2 */}
					<div
						style={{
							fontFamily: fontAnton,
							fontSize: 142,
							lineHeight: 0.9,
							color: FERRARI_RED,
							textTransform: 'uppercase',
							letterSpacing: '-0.02em',
							textShadow: `0 0 50px rgba(255, 0, 34, 0.35)`,
							opacity: ci(line2Spring, [0, 1], [0, 1]),
							transform: `translateY(${ci(line2Spring, [0, 1], [35, 0])}px)`,
						}}
					>
						VÍDEOS DE IA
					</div>

					{/* Linha 3 */}
					<div
						style={{
							fontFamily: fontInstrumentSerif,
							fontSize: 98,
							lineHeight: 1.0,
							color: 'rgba(255, 255, 255, 0.75)',
							fontStyle: 'italic',
							opacity: ci(line3Spring, [0, 1], [0, 1]),
							transform: `translateY(${ci(line3Spring, [0, 1], [40, 0])}px)`,
						}}
					>
						genéricos?
					</div>
				</div>

				{/* Micro-ticker inferior legível em mobile */}
				<div
					style={{
						position: 'absolute',
						bottom: 140,
						left: 64,
						right: 64,
						display: 'flex',
						justifyContent: 'space-between',
						borderTop: '2px solid rgba(255, 255, 255, 0.12)',
						paddingTop: 24,
						fontFamily: fontMono,
						fontSize: 24,
						fontWeight: 700,
						color: 'rgba(255, 255, 255, 0.55)',
						opacity: ci(frame, [15, 30], [0, 1]),
					}}
				>
					<span>RETENÇÃO: 1.2s</span>
					<span style={{ color: FERRARI_RED }}>ZERO IDENTIDADE</span>
				</div>
			</AbsoluteFill>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// CENA 2 (FRAMES 85 - 170 / 2.83s - 5.67s): REJEIÇÃO POR SLOP ELEGANTE
	// "...com gradiente roxo e robôs sem alma?"
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene2SlopRejection = () => {
		if (frame < 82 || frame > 175) return null;

		const f = frame - 88;
		const sceneOpacity = ci(frame, [85, 92, 160, 170], [0, 1, 1, 0]);

		// Mola suave com amortecimento crítico (sem tremor/shake amador)
		const stampSpring = spring({
			frame: Math.max(0, f),
			fps,
			config: { damping: 26, mass: 0.9, stiffness: 140 },
		});

		// Respiração cinematográfica contínua (slow drift)
		const breathingRot = -8.5 + Math.sin(t * 1.5) * 0.8;
		const breathingScale = ci(stampSpring, [0, 1], [1.8, 1.0]) * (1.0 + Math.sin(t * 1.2) * 0.015);

		return (
			<AbsoluteFill
				style={{
					backgroundColor: '#090508',
					justifyContent: 'center',
					alignItems: 'center',
					padding: '0 50px',
					opacity: sceneOpacity,
					pointerEvents: 'none',
				}}
			>
				{/* Fundo com aura sutil de alerta (sem oscilação brusca) */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: 'radial-gradient(circle at center, rgba(255, 0, 34, 0.12) 0%, transparent 70%)',
					}}
				/>

				{/* Texto prévio que é superado pelo carimbo */}
				<div
					style={{
						fontFamily: fontMono,
						fontSize: 32,
						fontWeight: 700,
						color: 'rgba(255, 120, 120, 0.6)',
						marginBottom: 44,
						textTransform: 'uppercase',
						letterSpacing: '0.12em',
						transform: `translateY(${ci(stampSpring, [0, 1], [20, 0])}px)`,
						opacity: ci(stampSpring, [0, 1], [0.3, 0.85]),
					}}
				>
					GRADIENTE ROXO • ROBÔS SEM ALMA
				</div>

				{/* Carimbo Brutalista com Entrada Suave e Firme */}
				<div
					style={{
						transform: `scale(${breathingScale}) rotate(${breathingRot}deg)`,
						border: '14px solid #FF0022',
						padding: '48px 60px',
						borderRadius: 20,
						backgroundColor: 'rgba(255, 0, 34, 0.08)',
						boxShadow: '0 20px 80px rgba(255, 0, 34, 0.4), inset 0 0 50px rgba(255, 0, 34, 0.2)',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 18,
						opacity: ci(stampSpring, [0, 1], [0, 1]),
					}}
				>
					<div
						style={{
							fontFamily: fontAnton,
							fontSize: 104,
							color: '#FF0022',
							letterSpacing: '0.04em',
							lineHeight: 0.9,
							textAlign: 'center',
						}}
					>
						REJEITADO
					</div>
					<div
						style={{
							fontFamily: fontAnton,
							fontSize: 78,
							color: '#FFFFFF',
							backgroundColor: '#FF0022',
							padding: '8px 36px',
							letterSpacing: '0.08em',
							borderRadius: 8,
						}}
					>
						POR SLOP
					</div>
					<div
						style={{
							fontFamily: fontMono,
							fontSize: 26,
							color: '#FFC2C7',
							letterSpacing: '0.16em',
							fontWeight: 800,
						}}
					>
						99% GENÉRICO • ZERO RETENÇÃO
					</div>
				</div>
			</AbsoluteFill>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// CENA 3 (FRAMES 165 - 340 / 5.5s - 11.33s): TERMINAL TAKEOVER FLUIDO
	// "Conheça o Vibe Design Studio: o estúdio criativo headless..."
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene3TerminalTakeover = () => {
		if (frame < 160 || frame > 345) return null;

		const f = frame - 165;
		const sceneOpacity = ci(frame, [162, 172, 330, 340], [0, 1, 1, 0]);
		const cameraDrift = 1.0 + ci(f, [0, 175], [0, 0.025]);

		// Digitação suave e contínua
		const typedChars = Math.min(
			48,
			Math.floor(ci(f, [15, 80], [0, 48]))
		);
		const fullCommand = 'npx skills add Gabrielrtads/vibe-design-studio';
		const currentText = fullCommand.slice(0, typedChars);
		const isDoneTyping = typedChars >= fullCommand.length;
		const showCursor = (Math.floor(f / 8) % 2 === 0);

		// Staggered fade suave nas linhas de saída
		const log1Opacity = ci(f, [85, 95], [0, 1]);
		const log2Opacity = ci(f, [95, 105], [0, 1]);
		const log3Opacity = ci(f, [105, 115], [0, 1]);

		// Entrada suave das métricas
		const metricsSpring = spring({ frame: Math.max(0, f - 110), fps, config: { damping: 24, mass: 0.8 } });

		return (
			<AbsoluteFill
				style={{
					backgroundColor: '#06070A',
					padding: '100px 48px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					fontFamily: fontMono,
					opacity: sceneOpacity,
					transform: `scale(${cameraDrift})`,
					pointerEvents: 'none',
				}}
			>
				{/* Top Bar macOS legível em mobile */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
						paddingBottom: 24,
						marginBottom: 36,
					}}
				>
					<div style={{ display: 'flex', gap: 12 }}>
						<div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
						<div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
						<div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#27C93F' }} />
					</div>
					<span style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.55)', letterSpacing: '0.06em' }}>
						zsh — vibe-studio
					</span>
					<span style={{ fontSize: 20, color: MATRIX_GREEN, fontWeight: 800 }}>
						● CLI HEADLESS
					</span>
				</div>

				{/* Título de Entrada */}
				<div style={{ marginBottom: 44 }}>
					<span
						style={{
							fontFamily: fontAnton,
							fontSize: 82,
							color: PURE_WHITE,
							textTransform: 'uppercase',
							lineHeight: 1.0,
						}}
					>
						VIBE DESIGN{' '}
						<span style={{ color: ELECTRIC_CYAN }}>STUDIO</span>
					</span>
					<div
						style={{
							fontFamily: fontInstrumentSerif,
							fontSize: 44,
							color: 'rgba(255, 255, 255, 0.75)',
							fontStyle: 'italic',
							marginTop: 10,
						}}
					>
						O estúdio criativo em código puro para agentes
					</div>
				</div>

				{/* Console Interativo em Perspectiva 3D Animos com Sheen de Compilação */}
				<CinematicStage
					preset="subtle-float"
					elevation="raised"
					sheen={true}
					sheenAtSecond={2.4}
					sheenDuration={1.2}
					sheenIntensity={0.34}
					borderRadius={20}
					width="100%"
					style={{ width: '100%' }}
					innerStyle={{
						width: '100%',
						backgroundColor: 'rgba(10, 12, 16, 0.96)',
						border: '2px solid rgba(255, 255, 255, 0.14)',
						borderRadius: 20,
						padding: '32px 34px',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<div
						style={{
							fontSize: 32,
							color: PURE_WHITE,
							lineHeight: 1.5,
							wordBreak: 'break-all',
						}}
					>
						<span style={{ color: MATRIX_GREEN, fontWeight: 800 }}>workspace $ </span>
						<span style={{ fontWeight: 600 }}>{currentText}</span>
						{showCursor && (
							<span style={{ backgroundColor: MATRIX_GREEN, color: '#000', display: 'inline-block', width: 16, height: 32, verticalAlign: 'middle', marginLeft: 6 }} />
						)}
					</div>

					{/* Logs com entrada suave e fluida */}
					{isDoneTyping && (
						<div
							style={{
								marginTop: 28,
								paddingTop: 24,
								borderTop: '1px solid rgba(255, 255, 255, 0.1)',
								display: 'flex',
								flexDirection: 'column',
								gap: 16,
								fontSize: 26,
								color: 'rgba(255, 255, 255, 0.9)',
							}}
						>
							<div style={{ color: MATRIX_GREEN, opacity: log1Opacity, transform: `translateY(${ci(log1Opacity, [0, 1], [8, 0])}px)` }}>
								✔ Motor Remotion + Whisper C++ injetado
							</div>
							<div style={{ color: MATRIX_GREEN, opacity: log2Opacity, transform: `translateY(${ci(log2Opacity, [0, 1], [8, 0])}px)` }}>
								✔ 8 habilidades canônicas registradas
							</div>
							<div style={{ color: ELECTRIC_CYAN, opacity: log3Opacity, transform: `translateY(${ci(log3Opacity, [0, 1], [8, 0])}px)` }}>
								✔ Studio compilado: localhost:3000 (0.6s)
							</div>
						</div>
					)}
				</CinematicStage>

				{/* Três Caixas de Métricas com Slide-up Suave */}
				<div
					style={{
						marginTop: 36,
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: 16,
						opacity: ci(metricsSpring, [0, 1], [0, 1]),
						transform: `translateY(${ci(metricsSpring, [0, 1], [30, 0])}px)`,
					}}
				>
					<div
						style={{
							backgroundColor: 'rgba(0, 255, 102, 0.08)',
							border: `2px solid ${MATRIX_GREEN}`,
							borderRadius: 14,
							padding: '24px 16px',
							textAlign: 'center',
						}}
					>
						<div style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, marginBottom: 8 }}>CUSTO</div>
						<div style={{ fontFamily: fontAnton, fontSize: 44, color: MATRIX_GREEN }}>R$ 0,00</div>
					</div>
					<div
						style={{
							backgroundColor: 'rgba(0, 240, 255, 0.08)',
							border: `2px solid ${ELECTRIC_CYAN}`,
							borderRadius: 14,
							padding: '24px 16px',
							textAlign: 'center',
						}}
					>
						<div style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, marginBottom: 8 }}>CONTROLE</div>
						<div style={{ fontFamily: fontAnton, fontSize: 36, color: ELECTRIC_CYAN }}>100% CÓDIGO</div>
					</div>
					<div
						style={{
							backgroundColor: 'rgba(255, 0, 34, 0.08)',
							border: `2px solid ${FERRARI_RED}`,
							borderRadius: 14,
							padding: '24px 16px',
							textAlign: 'center',
						}}
					>
						<div style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, marginBottom: 8 }}>LICENÇA</div>
						<div style={{ fontFamily: fontAnton, fontSize: 44, color: FERRARI_RED }}>MIT OPEN</div>
					</div>
				</div>
			</AbsoluteFill>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// CENA 4 (FRAMES 335 - 485 / 11.16s - 16.16s): OSCILOSCÓPIO APPLE SPRING & WHISPER
	// "Física de mola Apple, legendas cinéticas sincronizadas no milissegundo..."
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene4PhysicsAndWhisper = () => {
		if (frame < 330 || frame > 490) return null;

		const f = frame - 335;
		const sceneOpacity = ci(frame, [332, 342, 475, 485], [0, 1, 1, 0]);
		const cameraDrift = 1.0 + ci(f, [0, 150], [0, 0.02]);

		// Movimento oscilatório suave e harmônico (sem sobressaltos)
		const puckPos = Math.sin(f * 0.12) * 260 * Math.exp(-f * 0.005);

		return (
			<AbsoluteFill
				style={{
					backgroundColor: '#06080D',
					padding: '120px 48px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					fontFamily: fontMono,
					opacity: sceneOpacity,
					transform: `scale(${cameraDrift})`,
					pointerEvents: 'none',
				}}
			>
				{/* Topo Técnico */}
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span style={{ fontSize: 22, color: MATRIX_GREEN, letterSpacing: '0.12em', fontWeight: 800 }}>
							● APPLE SPRING ENGINE (60 FPS)
						</span>
						<span style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.55)', fontWeight: 600 }}>
							CRITICAL DAMPING
						</span>
					</div>
					<h2
						style={{
							fontFamily: fontAnton,
							fontSize: 84,
							color: PURE_WHITE,
							textTransform: 'uppercase',
							lineHeight: 1.0,
							marginTop: 20,
						}}
					>
						FÍSICA DE MOLA <span style={{ color: FERRARI_RED }}>APPLE</span>
					</h2>
					<div
						style={{
							fontFamily: fontInstrumentSerif,
							fontSize: 44,
							color: 'rgba(255, 255, 255, 0.75)',
							fontStyle: 'italic',
							marginTop: 10,
						}}
					>
						Legendas sincronizadas no milissegundo com Whisper C++
					</div>
				</div>

				{/* Osciloscópio Físico com Grid Suave */}
				<div
					style={{
						height: 440,
						backgroundColor: 'rgba(0, 0, 0, 0.55)',
						border: '2px solid rgba(255, 255, 255, 0.12)',
						borderRadius: 20,
						position: 'relative',
						overflow: 'hidden',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					{/* Grid de osciloscópio */}
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
							backgroundSize: '40px 40px',
						}}
					/>

					{/* Linha guia central */}
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							height: 2,
							backgroundColor: 'rgba(255, 0, 34, 0.35)',
						}}
					/>

					{/* Puck oscilante com movimento contínuo e orgânico */}
					<div
						style={{
							transform: `translateX(${puckPos}px)`,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 10,
							zIndex: 2,
						}}
					>
						<div
							style={{
								width: 84,
								height: 84,
								borderRadius: '50%',
								backgroundColor: FERRARI_RED,
								boxShadow: '0 0 50px rgba(255, 0, 34, 0.8), inset 0 0 18px #FFF',
								border: '3px solid #FFF',
							}}
						/>
						<span style={{ fontSize: 20, color: '#FFF', fontWeight: 800, letterSpacing: '0.08em', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: 6 }}>
							damping: 20
						</span>
					</div>

					{/* Parâmetros Técnicos Legíveis */}
					<div
						style={{
							position: 'absolute',
							bottom: 24,
							left: 24,
							right: 24,
							display: 'flex',
							justifyContent: 'space-between',
							fontSize: 20,
							fontWeight: 700,
							color: 'rgba(255, 255, 255, 0.6)',
						}}
					>
						<span>MASS: 0.85</span>
						<span>STIFFNESS: 90</span>
						<span style={{ color: MATRIX_GREEN }}>DELTA: 0.00ms</span>
					</div>
				</div>

				{/* Card de Áudio Whisper Sub-15ms em Escala Mobile Real */}
				<div
					style={{
						backgroundColor: 'rgba(255, 255, 255, 0.04)',
						border: '2px solid rgba(255, 255, 255, 0.12)',
						borderRadius: 18,
						padding: '30px 36px',
					}}
				>
					<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 20, fontWeight: 700 }}>
						<span style={{ color: 'rgba(255, 255, 255, 0.55)' }}>WHISPER SUB-15MS TOKEN TRACKER</span>
						<span style={{ color: MATRIX_GREEN }}>✔ 100% OFFLINE</span>
					</div>
					<div
						style={{
							fontSize: 34,
							fontFamily: fontPlusJakartaSans,
							fontWeight: 800,
							color: PURE_WHITE,
						}}
					>
						Palavra ativa:{' '}
						<span style={{ color: FERRARI_RED, textTransform: 'uppercase', fontSize: 38, padding: '2px 10px', backgroundColor: 'rgba(255,0,34,0.12)', borderRadius: 6 }}>
							{activeWord ? activeWord.text : '...'}
						</span>
					</div>
				</div>
			</AbsoluteFill>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// CENA 5 (FRAMES 480 - 630 / 16.0s - 21.0s): BROADCAST AUDIO CONSOLE
	// "Sound design dinâmico e masterização profissional EBU R128."
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene5AudioMastering = () => {
		if (frame < 475 || frame > 635) return null;

		const f = frame - 480;
		const sceneOpacity = ci(frame, [478, 488, 620, 630], [0, 1, 1, 0]);
		const cameraDrift = 1.0 + ci(f, [0, 150], [0, 0.02]);
		const barsCount = 28;

		return (
			<AbsoluteFill
				style={{
					backgroundColor: '#040507',
					padding: '120px 48px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					fontFamily: fontMono,
					opacity: sceneOpacity,
					transform: `scale(${cameraDrift})`,
					pointerEvents: 'none',
				}}
			>
				{/* Top Bar Broadcast */}
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span style={{ fontSize: 22, color: MATRIX_GREEN, letterSpacing: '0.12em', fontWeight: 800 }}>
							● BROADCAST MASTERING ENGINE
						</span>
						<span style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.55)', fontWeight: 600 }}>
							EBU R128
						</span>
					</div>
					<h2
						style={{
							fontFamily: fontAnton,
							fontSize: 82,
							color: PURE_WHITE,
							textTransform: 'uppercase',
							lineHeight: 1.0,
							marginTop: 20,
						}}
					>
						SOUND DESIGN <span style={{ color: MATRIX_GREEN }}>DINÂMICO</span>
					</h2>
					<div
						style={{
							fontFamily: fontInstrumentSerif,
							fontSize: 44,
							color: 'rgba(255, 255, 255, 0.75)',
							fontStyle: 'italic',
							marginTop: 10,
						}}
					>
						Masterização com loudness padronizado a -14 LUFS
					</div>
				</div>

				{/* Medidores Digitais */}
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
					<div
						style={{
							backgroundColor: 'rgba(0, 255, 102, 0.06)',
							border: '2px solid rgba(0, 255, 102, 0.3)',
							borderRadius: 18,
							padding: '36px 24px',
							textAlign: 'center',
						}}
					>
						<div style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, marginBottom: 10 }}>
							INTEGRATED LOUDNESS
						</div>
						<div
							style={{
								fontFamily: fontAnton,
								fontSize: 84,
								color: MATRIX_GREEN,
								letterSpacing: '-0.02em',
							}}
						>
							-14.0{' '}
							<span style={{ fontSize: 32, fontFamily: fontMono }}>LUFS</span>
						</div>
					</div>

					<div
						style={{
							backgroundColor: 'rgba(0, 240, 255, 0.06)',
							border: '2px solid rgba(0, 240, 255, 0.3)',
							borderRadius: 18,
							padding: '36px 24px',
							textAlign: 'center',
						}}
					>
						<div style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, marginBottom: 10 }}>
							TRUE PEAK CEILING
						</div>
						<div
							style={{
								fontFamily: fontAnton,
								fontSize: 84,
								color: ELECTRIC_CYAN,
								letterSpacing: '-0.02em',
							}}
						>
							-1.0{' '}
							<span style={{ fontSize: 32, fontFamily: fontMono }}>dBTP</span>
						</div>
					</div>
				</div>

				{/* Analisador de Espectro com Balística Realista e Suave */}
				<div
					style={{
						backgroundColor: 'rgba(0, 0, 0, 0.65)',
						border: '2px solid rgba(255, 255, 255, 0.1)',
						borderRadius: 18,
						padding: '36px 30px',
						display: 'flex',
						flexDirection: 'column',
						gap: 18,
					}}
				>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>
						<span>20 Hz</span>
						<span>1 kHz</span>
						<span>20 kHz</span>
					</div>

					<div
						style={{
							display: 'flex',
							alignItems: 'flex-end',
							justifyContent: 'space-between',
							height: 180,
							gap: 6,
						}}
					>
						{Array.from({ length: barsCount }).map((_, i) => {
							// Onda orgânica sem ruído caótico
							const wave = Math.sin(f * 0.15 + i * 0.25) * 0.5 + 0.5;
							const heightPct = Math.max(12, Math.min(95, Math.floor(wave * 75 + (i % 4) * 5)));
							const isHigh = heightPct > 70;

							return (
								<div
									key={i}
									style={{
										flex: 1,
										height: `${heightPct}%`,
										backgroundColor: isHigh ? '#FFBD2E' : MATRIX_GREEN,
										borderRadius: 4,
										opacity: 0.85,
									}}
								/>
							);
						})}
					</div>

					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, color: MATRIX_GREEN }}>
						<span>● SMART AUTO-DUCKING ATIVO (-12 dB)</span>
						<span style={{ color: 'rgba(255,255,255,0.6)' }}>SEM DISTORÇÃO EM CELULARES</span>
					</div>
				</div>
			</AbsoluteFill>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// CENA 6 (FRAMES 625 - 755 / 20.83s - 25.17s): FERRARI RED OPEN SOURCE
	// "Custo zero de API e 100% open source."
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene6FerrariRedOpenSource = () => {
		if (frame < 620 || frame > 760) return null;

		const f = frame - 625;
		const sceneOpacity = ci(frame, [622, 630, 745, 755], [0, 1, 1, 0]);
		const cameraDrift = 1.0 + ci(f, [0, 130], [0, 0.03]);

		return (
			<AbsoluteFill
				style={{
					backgroundColor: FERRARI_RED,
					padding: '120px 54px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'flex-start',
					fontFamily: fontMono,
					opacity: sceneOpacity,
					transform: `scale(${cameraDrift})`,
					pointerEvents: 'none',
				}}
			>
				<div
					style={{
						fontFamily: fontMono,
						fontSize: 26,
						fontWeight: 800,
						color: '#000000',
						backgroundColor: '#FFFFFF',
						padding: '10px 24px',
						borderRadius: 8,
						letterSpacing: '0.15em',
						marginBottom: 44,
					}}
				>
					LIBERDADE ABSOLUTA
				</div>

				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 14,
					}}
				>
					<div
						style={{
							fontFamily: fontAnton,
							fontSize: 136,
							color: '#FFFFFF',
							lineHeight: 0.9,
							letterSpacing: '-0.02em',
							textTransform: 'uppercase',
						}}
					>
						CUSTO ZERO
					</div>
					<div
						style={{
							fontFamily: fontAnton,
							fontSize: 136,
							color: '#000000',
							lineHeight: 0.9,
							letterSpacing: '-0.02em',
							textTransform: 'uppercase',
						}}
					>
						DE API
					</div>
					<div
						style={{
							fontFamily: fontAnton,
							fontSize: 112,
							color: '#FFFFFF',
							lineHeight: 0.92,
							letterSpacing: '-0.02em',
							textTransform: 'uppercase',
							marginTop: 20,
						}}
					>
						100% OPEN SOURCE
					</div>
				</div>

				<div
					style={{
						marginTop: 64,
						fontSize: 28,
						fontWeight: 700,
						color: 'rgba(255, 255, 255, 0.95)',
						borderTop: '2px solid rgba(0, 0, 0, 0.2)',
						paddingTop: 32,
						width: '100%',
					}}
				>
					Nenhum centavo gasto com créditos de vídeo de IA.
				</div>
			</AbsoluteFill>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// CENA 7 (FRAMES 750 - 900 / 25.0s - 30.0s): GITHUB & CTA REDESENHADO (MOBILE-FIRST)
	// "Instale via npx skills add e deixe sua estrela no GitHub."
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene7GitHubCTA = () => {
		if (frame < 745) return null;

		const f = frame - 750;
		const sceneOpacity = ci(frame, [748, 758], [0, 1]);
		const cameraDrift = 1.0 + ci(f, [0, 150], [0, 0.02]);

		const isStarClicked = f > 20;
		const starCount = isStarClicked ? 1482 : 1481;

		// Clique do Star com mola Apple orgânica
		const starButtonScale = isStarClicked
			? spring({ frame: Math.max(0, f - 20), fps, config: { damping: 16, mass: 0.6 } })
			: 1.0;
		const finalStarScale = isStarClicked ? ci(starButtonScale, [0, 1], [0.92, 1.0]) : 1.0;

		return (
			<AbsoluteFill
				style={{
					backgroundColor: PURE_BLACK,
					padding: '130px 48px 120px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					gap: 36,
					fontFamily: fontMono,
					opacity: sceneOpacity,
					transform: `scale(${cameraDrift})`,
					pointerEvents: 'none',
				}}
			>
				{/* Top Callout e Título Centralizado com Presença */}
				<div style={{ width: '100%', textAlign: 'center' }}>
					<div
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 12,
							backgroundColor: 'rgba(0, 255, 102, 0.1)',
							border: '1px solid rgba(0, 255, 102, 0.3)',
							borderRadius: 100,
							padding: '10px 24px',
							marginBottom: 18,
						}}
					>
						<span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: MATRIX_GREEN, boxShadow: `0 0 12px ${MATRIX_GREEN}` }} />
						<span style={{ fontSize: 22, color: MATRIX_GREEN, letterSpacing: '0.12em', fontWeight: 800 }}>
							ACESSO DIRETO VIA GITHUB & SKILLS
						</span>
					</div>
					<h2
						style={{
							fontFamily: fontAnton,
							fontSize: 98,
							color: PURE_WHITE,
							textTransform: 'uppercase',
							lineHeight: 0.94,
							letterSpacing: '-0.02em',
							margin: 0,
						}}
					>
						INSTALE EM <span style={{ color: FERRARI_RED }}>1 CLIQUE</span>
					</h2>
				</div>

				{/* Card de Terminal do GitHub em Perspectiva 3D Animos com Sheen Metálico */}
				<CinematicStage
					preset="keynote"
					elevation="dramatic"
					sheen={true}
					sheenAtSecond={0.7}
					sheenDuration={1.2}
					sheenIntensity={0.38}
					borderRadius={24}
					width="100%"
					style={{ width: '100%' }}
					innerStyle={{
						width: '100%',
						backgroundColor: 'rgba(18, 20, 24, 0.98)',
						border: '2px solid rgba(255, 255, 255, 0.18)',
						borderRadius: 24,
						padding: '40px 36px',
						display: 'flex',
						flexDirection: 'column',
						gap: 28,
					}}
				>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
							<span style={{ fontSize: 52 }}>🐙</span>
							<div>
								<div style={{ fontSize: 32, color: PURE_WHITE, fontWeight: 800 }}>Gabrielrtads</div>
								<div style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>/ vibe-design-studio</div>
							</div>
						</div>

						{/* Botão Star do GitHub Reativo com Efeito 3D Sparkles */}
						<div style={{ position: 'relative' }}>
							<div
								style={{
									backgroundColor: isStarClicked ? '#E3B341' : 'rgba(255, 255, 255, 0.12)',
									color: isStarClicked ? '#000000' : '#FFFFFF',
									borderRadius: 14,
									padding: '16px 28px',
									display: 'flex',
									alignItems: 'center',
									gap: 12,
									fontWeight: 900,
									fontSize: 26,
									transform: `scale(${finalStarScale})`,
									boxShadow: isStarClicked ? '0 0 35px rgba(227, 179, 65, 0.6)' : 'none',
								}}
							>
								<span>⭐ Star</span>
								<span>{starCount}</span>
							</div>

							{/* Sparkles 3D ProRes com transparência ao clicar na estrela */}
							{isStarClicked && (
								<div
									style={{
										position: 'absolute',
										top: -75,
										right: -50,
										width: 150,
										height: 150,
										pointerEvents: 'none',
										zIndex: 50,
									}}
								>
									<OffthreadVideo
										src={staticFile('assets/Sparkles.mov')}
										transparent
										style={{ width: '100%', height: '100%', objectFit: 'contain' }}
									/>
								</div>
							)}
						</div>
					</div>

					{/* Comando de Terminal em Escala Mobile Real */}
					<div
						style={{
							backgroundColor: '#000000',
							border: '2px solid rgba(0, 255, 102, 0.35)',
							borderRadius: 16,
							padding: '24px 28px',
							color: MATRIX_GREEN,
							boxShadow: 'inset 0 0 30px rgba(0, 255, 102, 0.08)',
						}}
					>
						<div style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: 20, marginBottom: 8, fontWeight: 700 }}>
							$ COPIE E EXECUTE NO TERMINAL:
						</div>
						<div style={{ fontSize: 32, fontWeight: 800, wordBreak: 'break-all', lineHeight: 1.35 }}>
							npx skills add Gabrielrtads/vibe-design-studio
						</div>
					</div>

					{/* Feature Pills */}
					<div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
						<span style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.08)', padding: '10px 18px', borderRadius: 8 }}>
							⚡ 100% OFFLINE
						</span>
						<span style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.08)', padding: '10px 18px', borderRadius: 8 }}>
							MIT OPEN SOURCE
						</span>
						<span style={{ fontSize: 20, color: MATRIX_GREEN, fontWeight: 800, backgroundColor: 'rgba(0,255,102,0.1)', padding: '10px 18px', borderRadius: 8 }}>
							CUSTO ZERO
						</span>
					</div>
				</CinematicStage>

				{/* Call to Action com Presença Firme e Elegante */}
				<div
					style={{
						width: '100%',
						backgroundColor: FERRARI_RED,
						borderRadius: 22,
						padding: '36px 32px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 12,
						boxShadow: '0 0 60px rgba(255, 0, 34, 0.45)',
					}}
				>
					<div
						style={{
							fontFamily: fontAnton,
							fontSize: 56,
							color: PURE_WHITE,
							letterSpacing: '0.04em',
							textAlign: 'center',
							textTransform: 'uppercase',
							lineHeight: 1.0,
						}}
					>
						COMENTE "VIBE" AQUI EMBAIXO
					</div>
					<div
						style={{
							fontFamily: fontPlusJakartaSans,
							fontSize: 26,
							color: 'rgba(255, 255, 255, 0.95)',
							fontWeight: 700,
							textAlign: 'center',
						}}
					>
						Para receber o link direto e comando no seu Direct ⚡
					</div>
				</div>
			</AbsoluteFill>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// CAMADA DE ÁUDIO REFINADA (TRILHA SOCIAL MODERNA + THALITA ACELERADA)
	// ────────────────────────────────────────────────────────────────────────────
	const renderAudio = () => {
		if (!enableSfx) return null;

		return (
			<>
				{/* Narração da Thalita em cadência acelerada (+8%) */}
				{audioNarracao && (
					<Audio src={staticFile(audioNarracao)} volume={1.0} />
				)}

				{/* Trilha Sonora Moderna Estilo Rede Social (New Benz beat moderno) */}
				<Audio src={staticFile('audio/musica/trilha_social_moderna.mp3')} volume={0.18} />

				{/* Micro-feedback háptico apenas na digitação do terminal e clique do Star */}
				<Sequence from={185} durationInFrames={8}>
					<Audio src={staticFile('audio/sfx/click_haptic.mp3')} volume={0.14} />
				</Sequence>
				<Sequence from={210} durationInFrames={8}>
					<Audio src={staticFile('audio/sfx/click_haptic.mp3')} volume={0.14} />
				</Sequence>
				<Sequence from={240} durationInFrames={8}>
					<Audio src={staticFile('audio/sfx/click_haptic.mp3')} volume={0.14} />
				</Sequence>
				<Sequence from={770} durationInFrames={8}>
					<Audio src={staticFile('audio/sfx/click_haptic.mp3')} volume={0.18} />
				</Sequence>
			</>
		);
	};

	return (
		<AbsoluteFill style={{ width: 1080, height: 1920, overflow: 'hidden' }}>
			{renderScene1Hook()}
			{renderScene2SlopRejection()}
			{renderScene3TerminalTakeover()}
			{renderScene4PhysicsAndWhisper()}
			{renderScene5AudioMastering()}
			{renderScene6FerrariRedOpenSource()}
			{renderScene7GitHubCTA()}
			{renderAudio()}
		</AbsoluteFill>
	);
};
