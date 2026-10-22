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
	audioNarracao = 'narracao_thalita.mp3',
	enableSfx = true,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const t = frame / fps;

	// Cores da Identidade Visual
	const FERRARI_RED = '#FF0022';
	const MATRIX_GREEN = '#00FF66';
	const ELECTRIC_CYAN = '#00F0FF';
	const PURE_BLACK = '#050608';
	const PURE_WHITE = '#FFFFFF';

	// Palavras ativas do Whisper
	const activeWord = useMemo(() => {
		return RAW_WORDS.find((w) => t >= w.start && t <= w.end);
	}, [t]);

	// ────────────────────────────────────────────────────────────────────────────
	// CENA 1 (FRAMES 0 - 89 / 0.0s - 2.97s): HOOK BRUTALISTA TELA CHEIA
	// "Cansado de vídeos de inteligência artificial genéricos..."
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene1Hook = () => {
		if (frame >= 90) return null;

		const glitch = Math.sin(frame * 1.5) > 0.85 ? 4 : 0;
		const scaleIn = spring({ frame, fps, config: { damping: 18, mass: 0.8 } });

		return (
			<AbsoluteFill
				style={{
					backgroundColor: PURE_BLACK,
					justifyContent: 'center',
					alignItems: 'center',
					padding: '0 64px',
				}}
			>
				{/* Scanlines analógicas de fundo */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 6px)',
						pointerEvents: 'none',
					}}
				/>

				{/* Top Tag */}
				<div
					style={{
						position: 'absolute',
						top: 140,
						left: 64,
						display: 'flex',
						alignItems: 'center',
						gap: 12,
					}}
				>
					<span
						style={{
							display: 'inline-block',
							width: 10,
							height: 10,
							borderRadius: '50%',
							backgroundColor: FERRARI_RED,
							boxShadow: `0 0 16px ${FERRARI_RED}`,
						}}
					/>
					<span
						style={{
							fontFamily: fontMono,
							fontSize: 16,
							color: 'rgba(255, 255, 255, 0.5)',
							letterSpacing: '0.15em',
							textTransform: 'uppercase',
						}}
					>
						[DIAGNÓSTICO CRÍTICO 01]
					</span>
				</div>

				{/* Tipografia Massiva Brutalista */}
				<div
					style={{
						width: '100%',
						transform: `scale(${scaleIn}) translate(${glitch}px, 0px)`,
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
					}}
				>
					<div
						style={{
							fontFamily: fontAnton,
							fontSize: 112,
							lineHeight: 0.92,
							color: PURE_WHITE,
							textTransform: 'uppercase',
							letterSpacing: '-0.02em',
						}}
					>
						CANSADO DE
					</div>
					<div
						style={{
							fontFamily: fontAnton,
							fontSize: 130,
							lineHeight: 0.9,
							color: FERRARI_RED,
							textTransform: 'uppercase',
							letterSpacing: '-0.02em',
							textShadow: `0 0 40px rgba(255, 0, 34, 0.4)`,
						}}
					>
						VÍDEOS DE IA
					</div>
					<div
						style={{
							fontFamily: fontInstrumentSerif,
							fontSize: 88,
							lineHeight: 1.0,
							color: 'rgba(255, 255, 255, 0.65)',
							fontStyle: 'italic',
						}}
					>
						genéricos?
					</div>
				</div>

				{/* Micro-ticker inferior de terminal */}
				<div
					style={{
						position: 'absolute',
						bottom: 120,
						left: 64,
						right: 64,
						display: 'flex',
						justifyContent: 'space-between',
						borderTop: '1px solid rgba(255, 255, 255, 0.12)',
						paddingTop: 24,
						fontFamily: fontMono,
						fontSize: 15,
						color: 'rgba(255, 255, 255, 0.4)',
					}}
				>
					<span>RETENÇÃO MÉDIA: 1.2s</span>
					<span style={{ color: FERRARI_RED }}>LOCK-IN DE SAAS</span>
				</div>
			</AbsoluteFill>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// CENA 2 (FRAMES 90 - 164 / 3.0s - 5.47s): IMPACTO "REJEITADO POR SLOP"
	// "...com gradiente roxo e robôs sem alma?"
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene2SlopRejection = () => {
		if (frame < 90 || frame >= 165) return null;

		const f = frame - 90;
		const stampSpring = spring({ frame: f, fps, config: { damping: 14, mass: 0.6 } });
		const shake = f < 8 ? (f % 2 === 0 ? 12 : -12) : 0;

		return (
			<AbsoluteFill
				style={{
					backgroundColor: '#080104',
					justifyContent: 'center',
					alignItems: 'center',
					padding: '0 50px',
					transform: `translate(${shake}px, ${shake * 0.5}px)`,
				}}
			>
				{/* Grade de alerta vermelha */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						backgroundImage: 'radial-gradient(rgba(255, 0, 34, 0.15) 1px, transparent 1px)',
						backgroundSize: '32px 32px',
					}}
				/>

				{/* Texto prévio ofuscado pelo carimbo */}
				<div
					style={{
						fontFamily: fontMono,
						fontSize: 28,
						color: 'rgba(255, 100, 100, 0.4)',
						marginBottom: 40,
						textTransform: 'uppercase',
						letterSpacing: '0.1em',
					}}
				>
					GRADIENTE ROXO • ROBÔS SEM ALMA
				</div>

				{/* Carimbo Brutalista de Tela Cheia */}
				<div
					style={{
						transform: `scale(${ci(stampSpring, [0, 1], [3.5, 1])}) rotate(-9deg)`,
						border: '14px solid #FF0022',
						padding: '40px 48px',
						borderRadius: 16,
						backgroundColor: 'rgba(255, 0, 34, 0.08)',
						boxShadow: '0 0 100px rgba(255, 0, 34, 0.6), inset 0 0 60px rgba(255, 0, 34, 0.3)',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 16,
					}}
				>
					<div
						style={{
							fontFamily: fontAnton,
							fontSize: 88,
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
							fontSize: 66,
							color: '#FFFFFF',
							backgroundColor: '#FF0022',
							padding: '6px 28px',
							letterSpacing: '0.08em',
							borderRadius: 6,
						}}
					>
						POR SLOP
					</div>
					<div
						style={{
							fontFamily: fontMono,
							fontSize: 18,
							color: '#FFB3BA',
							letterSpacing: '0.2em',
							fontWeight: 700,
						}}
					>
						99% GENÉRICO • ZERO RETENÇÃO
					</div>
				</div>
			</AbsoluteFill>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// CENA 3 (FRAMES 165 - 334 / 5.5s - 11.13s): FULLSCREEN TERMINAL TAKEOVER
	// "Conheça o Vibe Design Studio: o estúdio criativo headless..."
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene3TerminalTakeover = () => {
		if (frame < 165 || frame >= 335) return null;

		const f = frame - 165;
		const typedChars = Math.min(
			48,
			Math.floor(ci(f, [15, 80], [0, 48]))
		);
		const fullCommand = 'npx skills add Gabrielrtads/vibe-design-studio';
		const currentText = fullCommand.slice(0, typedChars);
		const isDoneTyping = typedChars >= fullCommand.length;
		const showCursor = (Math.floor(f / 8) % 2 === 0);

		return (
			<AbsoluteFill
				style={{
					backgroundColor: '#07080B',
					padding: '120px 48px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-start',
					fontFamily: fontMono,
				}}
			>
				{/* Top Bar do Terminal nativo macOS */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
						paddingBottom: 24,
						marginBottom: 40,
					}}
				>
					<div style={{ display: 'flex', gap: 10 }}>
						<div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
						<div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
						<div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27C93F' }} />
					</div>
					<span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.45)', letterSpacing: '0.08em' }}>
						zsh — vibe-studio — 1080×1920 @ 60 FPS
					</span>
					<span style={{ fontSize: 13, color: MATRIX_GREEN, fontWeight: 700 }}>
						● CLI HEADLESS
					</span>
				</div>

				{/* Título de Entrada da Solução */}
				<div style={{ marginBottom: 40 }}>
					<span
						style={{
							fontFamily: fontAnton,
							fontSize: 64,
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
							fontSize: 36,
							color: 'rgba(255, 255, 255, 0.6)',
							fontStyle: 'italic',
							marginTop: 8,
						}}
					>
						O estúdio criativo em código puro para agentes
					</div>
				</div>

				{/* Linha de Comando Interativa em Digitação Real */}
				<div
					style={{
						backgroundColor: 'rgba(255, 255, 255, 0.04)',
						border: '1px solid rgba(255, 255, 255, 0.12)',
						borderRadius: 12,
						padding: '24px 28px',
						fontSize: 22,
						color: PURE_WHITE,
						lineHeight: 1.5,
						wordBreak: 'break-all',
						boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
					}}
				>
					<span style={{ color: MATRIX_GREEN, fontWeight: 700 }}>workspace $ </span>
					<span>{currentText}</span>
					{showCursor && (
						<span style={{ backgroundColor: MATRIX_GREEN, color: '#000', display: 'inline-block', width: 12, height: 22, verticalAlign: 'middle', marginLeft: 4 }} />
					)}
				</div>

				{/* Output Instantâneo pós-digitação */}
				{isDoneTyping && (
					<div
						style={{
							marginTop: 36,
							display: 'flex',
							flexDirection: 'column',
							gap: 16,
							fontSize: 19,
							color: 'rgba(255, 255, 255, 0.85)',
						}}
					>
						<div style={{ color: MATRIX_GREEN }}>
							✔ Motor Remotion + Whisper C++ injetado com sucesso
						</div>
						<div style={{ color: MATRIX_GREEN }}>
							✔ 7 habilidades canônicas registradas no enxame
						</div>
						<div style={{ color: ELECTRIC_CYAN }}>
							✔ Studio compilado: http://localhost:3000 (0.6s)
						</div>
						<div style={{ color: 'rgba(255, 255, 255, 0.45)', marginTop: 8 }}>
							[HEADLESS]: Sem navegador pesado aberto. Render 100% código.
						</div>
					</div>
				)}

				{/* Três Caixas de Métricas Técnicas em ASCII */}
				<div
					style={{
						marginTop: 'auto',
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: 16,
					}}
				>
					<div
						style={{
							backgroundColor: 'rgba(0, 255, 102, 0.08)',
							border: `1px solid ${MATRIX_GREEN}`,
							borderRadius: 12,
							padding: '24px 16px',
							textAlign: 'center',
						}}
					>
						<div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.5)', marginBottom: 6 }}>CUSTO</div>
						<div style={{ fontFamily: fontAnton, fontSize: 36, color: MATRIX_GREEN }}>R$ 0,00</div>
					</div>
					<div
						style={{
							backgroundColor: 'rgba(0, 240, 255, 0.08)',
							border: `1px solid ${ELECTRIC_CYAN}`,
							borderRadius: 12,
							padding: '24px 16px',
							textAlign: 'center',
						}}
					>
						<div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.5)', marginBottom: 6 }}>CONTROLE</div>
						<div style={{ fontFamily: fontAnton, fontSize: 32, color: ELECTRIC_CYAN }}>100% CÓDIGO</div>
					</div>
					<div
						style={{
							backgroundColor: 'rgba(255, 0, 34, 0.08)',
							border: `1px solid ${FERRARI_RED}`,
							borderRadius: 12,
							padding: '24px 16px',
							textAlign: 'center',
						}}
					>
						<div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.5)', marginBottom: 6 }}>LICENÇA</div>
						<div style={{ fontFamily: fontAnton, fontSize: 36, color: FERRARI_RED }}>MIT OPEN</div>
					</div>
				</div>
			</AbsoluteFill>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// CENA 4 (FRAMES 335 - 479 / 11.16s - 15.97s): FULLSCREEN OSCILOSCÓPIO APPLE SPRING & WHISPER
	// "Física de mola Apple, legendas cinéticas sincronizadas no milissegundo..."
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene4PhysicsAndWhisper = () => {
		if (frame < 335 || frame >= 480) return null;

		const f = frame - 335;
		const springPuckX = spring({
			frame: f,
			fps,
			config: { damping: 20, mass: 0.85, stiffness: 90 },
		});
		const puckPos = ci(springPuckX, [0, 1], [-300, 300]);

		return (
			<AbsoluteFill
				style={{
					backgroundColor: '#07090E',
					padding: '120px 48px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					fontFamily: fontMono,
				}}
			>
				{/* Topo Técnico */}
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span style={{ fontSize: 14, color: MATRIX_GREEN, letterSpacing: '0.12em' }}>
							● APPLE SPRING ENGINE (60 FPS NATIVO)
						</span>
						<span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)' }}>
							CRITICAL DAMPING: ZERO OVERSHOOT
						</span>
					</div>
					<h2
						style={{
							fontFamily: fontAnton,
							fontSize: 72,
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
							fontSize: 38,
							color: 'rgba(255, 255, 255, 0.7)',
							fontStyle: 'italic',
							marginTop: 8,
						}}
					>
						Legendas sincronizadas no milissegundo com Whisper C++
					</div>
				</div>

				{/* Osciloscópio Físico de Tela Cheia */}
				<div
					style={{
						height: 480,
						backgroundColor: 'rgba(0, 0, 0, 0.6)',
						border: '1px solid rgba(255, 255, 255, 0.12)',
						borderRadius: 18,
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
							backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
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
							backgroundColor: 'rgba(255, 0, 34, 0.3)',
						}}
					/>

					{/* Puck oscilante em amortecimento crítico */}
					<div
						style={{
							transform: `translateX(${puckPos}px)`,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 8,
							zIndex: 2,
						}}
					>
						<div
							style={{
								width: 80,
								height: 80,
								borderRadius: '50%',
								backgroundColor: FERRARI_RED,
								boxShadow: '0 0 50px rgba(255, 0, 34, 0.8), inset 0 0 20px #FFF',
								border: '4px solid #FFF',
							}}
						/>
						<span style={{ fontSize: 13, color: '#FFF', fontWeight: 700, letterSpacing: '0.08em' }}>
							damping: 20
						</span>
					</div>

					{/* Live Parameters */}
					<div
						style={{
							position: 'absolute',
							bottom: 24,
							left: 24,
							right: 24,
							display: 'flex',
							justifyContent: 'space-between',
							fontSize: 14,
							color: 'rgba(255, 255, 255, 0.5)',
						}}
					>
						<span>MASS: 0.85</span>
						<span>STIFFNESS: 90</span>
						<span style={{ color: MATRIX_GREEN }}>DELTA: 0.00ms</span>
					</div>
				</div>

				{/* Barra de Áudio Whisper Sub-15ms */}
				<div
					style={{
						backgroundColor: 'rgba(255, 255, 255, 0.04)',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						borderRadius: 14,
						padding: '24px 30px',
					}}
				>
					<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
						<span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>WHISPER SUB-15MS TOKEN TRACKER</span>
						<span style={{ color: MATRIX_GREEN }}>✔ 100% OFFLINE</span>
					</div>
					<div
						style={{
							fontSize: 24,
							fontFamily: fontPlusJakartaSans,
							fontWeight: 700,
							color: PURE_WHITE,
						}}
					>
						Palavra ativa:{' '}
						<span style={{ color: FERRARI_RED, textTransform: 'uppercase', fontSize: 28 }}>
							{activeWord ? activeWord.text : '...'}
						</span>
					</div>
				</div>
			</AbsoluteFill>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// CENA 5 (FRAMES 480 - 624 / 16.0s - 20.8s): FULLSCREEN BROADCAST AUDIO CONSOLE
	// "Sound design dinâmico e masterização profissional EBU R128."
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene5AudioMastering = () => {
		if (frame < 480 || frame >= 625) return null;

		const f = frame - 480;
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
				}}
			>
				{/* Top Bar Broadcast */}
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span style={{ fontSize: 14, color: MATRIX_GREEN, letterSpacing: '0.12em' }}>
							● BROADCAST AUDIO MASTERING ENGINE
						</span>
						<span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)' }}>
							EBU R128 / ITU-R BS.1770
						</span>
					</div>
					<h2
						style={{
							fontFamily: fontAnton,
							fontSize: 68,
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
							fontSize: 38,
							color: 'rgba(255, 255, 255, 0.7)',
							fontStyle: 'italic',
							marginTop: 8,
						}}
					>
						Masterização com loudness padronizado a -14 LUFS
					</div>
				</div>

				{/* Medidores Digitais Gigantes */}
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
					<div
						style={{
							backgroundColor: 'rgba(0, 255, 102, 0.05)',
							border: '1px solid rgba(0, 255, 102, 0.3)',
							borderRadius: 16,
							padding: '36px 24px',
							textAlign: 'center',
						}}
					>
						<div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', marginBottom: 8 }}>
							INTEGRATED LOUDNESS
						</div>
						<div
							style={{
								fontFamily: fontAnton,
								fontSize: 72,
								color: MATRIX_GREEN,
								letterSpacing: '-0.02em',
							}}
						>
							-14.0{' '}
							<span style={{ fontSize: 28, fontFamily: fontMono }}>LUFS</span>
						</div>
					</div>

					<div
						style={{
							backgroundColor: 'rgba(0, 240, 255, 0.05)',
							border: '1px solid rgba(0, 240, 255, 0.3)',
							borderRadius: 16,
							padding: '36px 24px',
							textAlign: 'center',
						}}
					>
						<div style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', marginBottom: 8 }}>
							TRUE PEAK CEILING
						</div>
						<div
							style={{
								fontFamily: fontAnton,
								fontSize: 72,
								color: ELECTRIC_CYAN,
								letterSpacing: '-0.02em',
							}}
						>
							-1.0{' '}
							<span style={{ fontSize: 28, fontFamily: fontMono }}>dBTP</span>
						</div>
					</div>
				</div>

				{/* Analisador de Espectro de Frequências (VU Meter 28 Bandas) */}
				<div
					style={{
						backgroundColor: 'rgba(0, 0, 0, 0.8)',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						borderRadius: 16,
						padding: '36px 30px',
						display: 'flex',
						flexDirection: 'column',
						gap: 16,
					}}
				>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
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
							const wave = Math.sin(f * 0.4 + i * 0.35) * 0.5 + 0.5;
							const heightPct = Math.max(15, Math.min(100, Math.floor(wave * 90 + (i % 3) * 6)));
							const isClipping = heightPct > 85;

							return (
								<div
									key={i}
									style={{
										flex: 1,
										height: `${heightPct}%`,
										backgroundColor: isClipping ? FERRARI_RED : (heightPct > 65 ? '#FFBD2E' : MATRIX_GREEN),
										borderRadius: 4,
										boxShadow: isClipping ? '0 0 10px #FF0022' : 'none',
										transition: 'height 0.05s ease',
									}}
								/>
							);
						})}
					</div>

					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: MATRIX_GREEN }}>
						<span>● SMART AUTO-DUCKING ATIVO (-12 dB)</span>
						<span style={{ color: 'rgba(255,255,255,0.5)' }}>SEM DISTORÇÃO EM CELULARES</span>
					</div>
				</div>
			</AbsoluteFill>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// CENA 6 (FRAMES 625 - 749 / 20.83s - 24.97s): FULLSCREEN FERRARI RED OPEN SOURCE
	// "Custo zero de API e 100% open source."
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene6FerrariRedOpenSource = () => {
		if (frame < 625 || frame >= 750) return null;

		const f = frame - 625;
		const pulse = Math.sin(f * 0.3) * 0.03 + 1.0;

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
				}}
			>
				<div
					style={{
						fontFamily: fontMono,
						fontSize: 20,
						fontWeight: 800,
						color: '#000000',
						backgroundColor: '#FFFFFF',
						padding: '8px 20px',
						borderRadius: 6,
						letterSpacing: '0.15em',
						marginBottom: 40,
					}}
				>
					LIBERDADE ABSOLUTA
				</div>

				<div
					style={{
						transform: `scale(${pulse})`,
						transformOrigin: 'left center',
						display: 'flex',
						flexDirection: 'column',
						gap: 12,
					}}
				>
					<div
						style={{
							fontFamily: fontAnton,
							fontSize: 126,
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
							fontSize: 126,
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
							fontSize: 104,
							color: '#FFFFFF',
							lineHeight: 0.92,
							letterSpacing: '-0.02em',
							textTransform: 'uppercase',
							marginTop: 18,
						}}
					>
						100% OPEN SOURCE
					</div>
				</div>

				<div
					style={{
						marginTop: 64,
						fontSize: 22,
						color: 'rgba(255, 255, 255, 0.9)',
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
	// CENA 7 (FRAMES 750 - 900 / 25.0s - 30.0s): FULLSCREEN GITHUB & CTA BRUTALISTA
	// "Instale via npx skills add e deixe sua estrela no GitHub."
	// ────────────────────────────────────────────────────────────────────────────
	const renderScene7GitHubCTA = () => {
		if (frame < 750) return null;

		const f = frame - 750;
		const starCount = f > 24 ? 1482 : 1481;
		const isStarClicked = f > 24;

		return (
			<AbsoluteFill
				style={{
					backgroundColor: PURE_BLACK,
					padding: '120px 48px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					fontFamily: fontMono,
				}}
			>
				{/* Top Callout */}
				<div>
					<span style={{ fontSize: 14, color: MATRIX_GREEN, letterSpacing: '0.15em' }}>
						● ACESSO DIRETO VIA GITHUB & SKILLS
					</span>
					<h2
						style={{
							fontFamily: fontAnton,
							fontSize: 82,
							color: PURE_WHITE,
							textTransform: 'uppercase',
							lineHeight: 0.96,
							marginTop: 20,
						}}
					>
						INSTALE EM <span style={{ color: FERRARI_RED }}>1 CLIQUE</span>
					</h2>
				</div>

				{/* Card de Terminal do GitHub em Tela Cheia */}
				<div
					style={{
						backgroundColor: 'rgba(255, 255, 255, 0.05)',
						border: '2px solid rgba(255, 255, 255, 0.15)',
						borderRadius: 20,
						padding: '40px 32px',
						display: 'flex',
						flexDirection: 'column',
						gap: 28,
						boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
					}}
				>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
							<span style={{ fontSize: 36 }}>🐙</span>
							<div>
								<div style={{ fontSize: 20, color: PURE_WHITE, fontWeight: 700 }}>Gabrielrtads</div>
								<div style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)' }}>/ vibe-design-studio</div>
							</div>
						</div>

						{/* Botão Star do GitHub Reativo */}
						<div
							style={{
								backgroundColor: isStarClicked ? '#E3B341' : 'rgba(255, 255, 255, 0.12)',
								color: isStarClicked ? '#000000' : '#FFFFFF',
								borderRadius: 10,
								padding: '12px 24px',
								display: 'flex',
								alignItems: 'center',
								gap: 10,
								fontWeight: 800,
								fontSize: 20,
								boxShadow: isStarClicked ? '0 0 30px rgba(227, 179, 65, 0.6)' : 'none',
								transition: 'all 0.1s ease',
							}}
						>
							<span>⭐ Star</span>
							<span>{starCount}</span>
						</div>
					</div>

					{/* Comando de Terminal */}
					<div
						style={{
							backgroundColor: '#000000',
							border: '1px solid rgba(255, 255, 255, 0.2)',
							borderRadius: 12,
							padding: '20px 24px',
							fontSize: 18,
							color: MATRIX_GREEN,
							wordBreak: 'break-all',
						}}
					>
						$ npx skills add Gabrielrtads/vibe-design-studio
					</div>
				</div>

				{/* Call to Action Gigante */}
				<div
					style={{
						backgroundColor: FERRARI_RED,
						borderRadius: 18,
						padding: '36px 32px',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 12,
						boxShadow: '0 0 60px rgba(255, 0, 34, 0.4)',
					}}
				>
					<div
						style={{
							fontFamily: fontAnton,
							fontSize: 48,
							color: PURE_WHITE,
							letterSpacing: '0.04em',
							textAlign: 'center',
							textTransform: 'uppercase',
						}}
					>
						COMENTE "VIBE" AQUI EMBAIXO
					</div>
					<div
						style={{
							fontFamily: fontPlusJakartaSans,
							fontSize: 18,
							color: 'rgba(255, 255, 255, 0.9)',
							fontWeight: 600,
						}}
					>
						Para receber o link direto e comando no seu Direct ⚡
					</div>
				</div>
			</AbsoluteFill>
		);
	};

	// ────────────────────────────────────────────────────────────────────────────
	// CAMADA DE ÁUDIO E SFX
	// ────────────────────────────────────────────────────────────────────────────
	const renderAudio = () => {
		if (!enableSfx) return null;

		return (
			<>
				{/* Narração da Thalita */}
				{audioNarracao && (
					<Audio src={staticFile(audioNarracao)} volume={1.0} />
				)}

				{/* Trilha Lo-Fi Minimalista Tech */}
				<Audio src={staticFile('audio/trilha_lofi.mp3')} volume={0.14} />

				{/* SFX com persistência garantida via Sequence */}
				<Sequence from={2}>
					<Audio src={staticFile('audio/whoosh_zoom.mp3')} volume={0.4} />
				</Sequence>
				<Sequence from={90}>
					<Audio src={staticFile('audio/hud_boom.mp3')} volume={0.65} />
				</Sequence>
				<Sequence from={165}>
					<Audio src={staticFile('audio/futurista_click.mp3')} volume={0.35} />
				</Sequence>
				<Sequence from={266}>
					<Audio src={staticFile('audio/click_haptic.mp3')} volume={0.4} />
				</Sequence>
				<Sequence from={335}>
					<Audio src={staticFile('audio/sub_impact_warm.mp3')} volume={0.45} />
				</Sequence>
				<Sequence from={480}>
					<Audio src={staticFile('audio/whoosh_zoom.mp3')} volume={0.4} />
				</Sequence>
				<Sequence from={625}>
					<Audio src={staticFile('audio/click_haptic.mp3')} volume={0.45} />
				</Sequence>
				<Sequence from={754}>
					<Audio src={staticFile('audio/impacto_final.mp3')} volume={0.7} />
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
