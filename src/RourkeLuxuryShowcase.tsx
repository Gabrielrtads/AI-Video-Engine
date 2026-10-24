import React from 'react';
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
import { ThreeCanvas } from '@remotion/three';
import { loadFont as loadBebasNeue } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadInstrumentSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

// Componentes do Estúdio
import { PBRCardMesh, StudioLighting } from './PBRStage3D';
import { SlopSimulator } from './demonstracoes/SlopSimulator';
import { AppleSpringDemo } from './demonstracoes/AppleSpringDemo';
import { AudioConsoleDemo } from './demonstracoes/AudioConsoleDemo';
import { GitHubStarHero } from './demonstracoes/GitHubStarHero';
import { AnimatedCursor } from './demonstracoes/AnimatedCursor';
import { CarrosselEditorial } from './CarrosselEditorial';
import { Slide02Diagnostico } from './Slide02Diagnostico';
import { Slide04Engenharia } from './Slide04Engenharia';

const { fontFamily: fontBebas } = loadBebasNeue();
const { fontFamily: fontInstrumentSerif } = loadInstrumentSerif('italic');
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export interface RourkeLuxuryShowcaseProps {
	mode: 'pure-visual' | 'editorial-voiceover';
}

export const RourkeLuxuryShowcase: React.FC<RourkeLuxuryShowcaseProps> = ({ mode }) => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();
	const t = frame / fps;

	// ────────────────────────────────────────────────────────────────────────────
	// 1. DINÂMICA CROMÁTICA DE FUNDO (Transições entre Obsidian e Editorial Paper)
	// ────────────────────────────────────────────────────────────────────────────
	const bgColor = interpolateColors(
		frame,
		[
			0, 179,           // Beat 1 & 2: Dark Obsidian (#08090C)
			195, 269,         // Beat 3: Inversão para Editorial Warm Paper (#F5F3EE)
			285, 449,         // Beat 4 & 5: Retorno ao Obsidian (#08090C)
			465, 539,         // Beat 6: Inversão para Crisp Alabaster (#FCFCFD)
			555, 750          // Beat 7 & 8: Retorno ao Deep Obsidian Noturno (#08090C)
		],
		[
			'#08090C', '#08090C',
			'#F5F3EE', '#F5F3EE',
			'#08090C', '#08090C',
			'#FCFCFD', '#FCFCFD',
			'#08090C', '#08090C'
		]
	);

	const isLight = (frame >= 180 && frame < 270) || (frame >= 450 && frame < 540);
	const primaryTextColor = isLight ? '#0B0D13' : '#FFFFFF';
	const mutedTextColor = isLight ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.55)';

	// ────────────────────────────────────────────────────────────────────────────
	// 2. MICRO-DRIFT ORGÂNICO DE CÂMERA (Respiração Física Rourke Heath)
	// ────────────────────────────────────────────────────────────────────────────
	const cameraDriftX = Math.sin(t * 0.8) * 8;
	const cameraDriftY = Math.cos(t * 0.6) * 6;
	const cameraZoom = 1.0 + Math.sin(t * 0.4) * 0.02;

	// ────────────────────────────────────────────────────────────────────────────
	// 3. CURSORES ANIMADOS DO MAC OS PARA OS BEATS INTERATIVOS
	// ────────────────────────────────────────────────────────────────────────────
	const cursorWaypoints = [
		{ frame: 275, x: 700, y: 350 },
		{ frame: 305, x: 420, y: 520, clickFrame: 312 }, // Clique no AppleSpringDemo
		{ frame: 345, x: 800, y: 650 },
		{ frame: 635, x: 750, y: 400 },
		{ frame: 665, x: 420, y: 480, clickFrame: 672 }, // Clique no GitHub Star
	];

	return (
		<AbsoluteFill
			style={{
				background: bgColor,
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'space-between',
				paddingTop: 80,
				paddingBottom: 90,
				boxSizing: 'border-box',
				transition: 'background 0.4s ease',
			}}
		>
			{/* ════════════════════════════════════════════════════════════════════
			    TRILHA SONORA, LOCUÇÃO & SOUND DESIGN FOLEY
			    ════════════════════════════════════════════════════════════════════ */}
			{/* Trilha de Luxo (com ducking automático se houver voz) */}
			<Audio
				src={staticFile('audio/musica/trilha_luxo.mp3')}
				volume={mode === 'pure-visual' ? 0.65 : 0.18}
			/>

			{/* Narração Neural (somente no modo voiceover) */}
			{mode === 'editorial-voiceover' && (
				<Audio src={staticFile('audio/locucao/narracao_showcase_vibe.mp3')} volume={1.0} />
			)}

			{/* Foley de Impacto Beat 1: Colisão de Cartão 3D */}
			<Sequence from={32} durationInFrames={40}>
				<Audio src={staticFile('audio/sfx/sub_impact_warm.mp3')} volume={0.45} />
				<Audio src={staticFile('audio/sfx/transicao_digital.mp3')} volume={0.45} />
			</Sequence>

			{/* Foley Beat 2: Whoosh Shimmer de Hardware 3D */}
			<Sequence from={90} durationInFrames={45}>
				<Audio src={staticFile('audio/sfx/whoosh_zoom.mp3')} volume={0.45} />
				<Audio src={staticFile('audio/sfx/hud_rise.mp3')} volume={0.45} />
			</Sequence>

			{/* Foley Beat 3: Leque de Carrossel Editorial */}
			<Sequence from={180} durationInFrames={50}>
				<Audio src={staticFile('audio/sfx/whoosh_zoom.mp3')} volume={0.45} />
				<Audio src={staticFile('audio/sfx/click_haptic.mp3')} volume={0.45} />
			</Sequence>
			<Sequence from={194} durationInFrames={30}>
				<Audio src={staticFile('audio/sfx/click_haptic.mp3')} volume={0.45} />
			</Sequence>

			{/* Foley Beat 4: Compressão de Mola Apple & Click Ripple */}
			<Sequence from={310} durationInFrames={40}>
				<Audio src={staticFile('audio/sfx/click_haptic.mp3')} volume={0.45} />
				<Audio src={staticFile('audio/sfx/futurista_click.mp3')} volume={0.45} />
			</Sequence>

			{/* Foley Beat 5: Tipografia Cinética */}
			<Sequence from={360} durationInFrames={40}>
				<Audio src={staticFile('audio/sfx/whoosh_zoom.mp3')} volume={0.45} />
			</Sequence>

			{/* Foley Beat 6: DataViz & Odômetro */}
			<Sequence from={450} durationInFrames={50}>
				<Audio src={staticFile('audio/sfx/hud_rise.mp3')} volume={0.45} />
			</Sequence>

			{/* Foley Beat 7: VU Meters de Som Broadcast */}
			<Sequence from={540} durationInFrames={50}>
				<Audio src={staticFile('audio/sfx/sub_impact_warm.mp3')} volume={0.45} />
				<Audio src={staticFile('audio/sfx/futurista_click.mp3')} volume={0.45} />
			</Sequence>

			{/* Foley Beat 8: Star Click Burst no GitHub */}
			<Sequence from={630} durationInFrames={60}>
				<Audio src={staticFile('audio/sfx/impacto_final.mp3')} volume={0.45} />
			</Sequence>
			<Sequence from={670} durationInFrames={40}>
				<Audio src={staticFile('audio/sfx/click_haptic.mp3')} volume={0.45} />
				<Audio src={staticFile('audio/sfx/hud_rise.mp3')} volume={0.45} />
			</Sequence>

			{/* ════════════════════════════════════════════════════════════════════
			    HEADER FLUTUANTE DE ALTO PADRÃO (Glassmorphism Concêntrico)
			    ════════════════════════════════════════════════════════════════════ */}
			<div
				style={{
					zIndex: 40,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 6,
					textAlign: 'center',
				}}
			>
				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 10,
						background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.07)',
						backdropFilter: 'blur(16px)',
						border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
						borderRadius: 999,
						padding: '6px 18px',
						boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
					}}
				>
					<span
						style={{
							width: 8,
							height: 8,
							borderRadius: '50%',
							background: '#10B981',
							boxShadow: '0 0 10px #10B981',
						}}
					/>
					<span
						style={{
							fontFamily: fontMono,
							fontSize: 12,
							letterSpacing: 1.5,
							fontWeight: 700,
							color: primaryTextColor,
							textTransform: 'uppercase',
						}}
					>
						VIBE DESIGN STUDIO • MOTION ENGINE
					</span>
					<span
						style={{
							background: 'rgba(245, 158, 11, 0.18)',
							border: '1px solid rgba(245, 158, 11, 0.4)',
							borderRadius: 6,
							padding: '1px 8px',
							fontFamily: fontMono,
							fontSize: 10,
							color: '#F59E0B',
							fontWeight: 800,
						}}
					>
						100% CODE
					</span>
				</div>

				<div
					style={{
						fontFamily: fontBebas,
						fontSize: 34,
						letterSpacing: 1.5,
						color: primaryTextColor,
						marginTop: 4,
					}}
				>
					{frame < 90 && '01 / O CHOQUE ANTI-SLOP'}
					{frame >= 90 && frame < 180 && '02 / HARDWARE 3D & PBR REAL'}
					{frame >= 180 && frame < 270 && '03 / CARROSSÉIS EDITORIAIS EM LEQUE'}
					{frame >= 270 && frame < 360 && '04 / MICROINTERAÇÃO & MOLA APPLE'}
					{frame >= 360 && frame < 450 && '05 / TIPOGRAFIA SUÍÇA & WHISPER'}
					{frame >= 450 && frame < 540 && '06 / DATAVIZ VIVO & PALETAS K-MEANS'}
					{frame >= 540 && frame < 630 && '07 / SOUND DESIGN FOLEY BROADCAST'}
					{frame >= 630 && '08 / ESTRELA NO GITHUB • OPEN SOURCE'}
				</div>
			</div>

			{/* ════════════════════════════════════════════════════════════════════
			    PALCO HERÓI CENTRAL (Transformações 3D a Cada 3 Segundos)
			    ════════════════════════════════════════════════════════════════════ */}
			<div
				style={{
					width: 960,
					height: 1100,
					position: 'relative',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					transform: `translate(${cameraDriftX}px, ${cameraDriftY}px) scale(${cameraZoom})`,
					transition: 'all 0.1s linear',
					zIndex: 20,
				}}
			>
				{/* Card Slop que é arremessado no frame 35 (Beat 1: Choque Anti-Slop) */}
				{frame < 60 && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							transform: `translateX(${
								frame >= 35 ? (frame - 35) * -45 : 0
							}px) rotate(${frame >= 35 ? (frame - 35) * -2.5 : 0}deg) scale(${
								frame >= 35 ? Math.max(0, 1 - (frame - 35) * 0.03) : 1
							})`,
							opacity: frame >= 55 ? 0 : 1,
							zIndex: 10,
						}}
					>
						<SlopSimulator />
					</div>
				)}

				{/* ── BEATS 1 & 2 (30 a 180f): THREE.JS PBR HARDWARE 3D CONTÍNUO (Single Canvas) ── */}
				{frame >= 30 && frame < 180 && (
					<div
						style={{
							position: 'absolute',
							width: 900,
							height: 900,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							transform: `translateX(${
								frame < 45 ? (45 - frame) * 40 : 0
							}px) scale(${frame < 45 ? 0.65 + (frame - 30) * (0.7 / 15) : 1.35})`,
							zIndex: 25,
						}}
					>
						<ThreeCanvas width={900} height={900}>
							<StudioLighting
								keyIntensity={3.5}
								rimColor={frame < 90 ? '#F59E0B' : '#38BDF8'}
								fillColor={frame < 90 ? '#38BDF8' : '#10B981'}
							/>
							<PBRCardMesh
								rotX={frame < 90 ? 0.2 : Math.sin(t * 1.5) * 0.3}
								rotY={
									frame < 90
										? -0.3 + (frame - 30) * 0.015
										: -0.6 + (frame - 90) * 0.015
								}
								rotZ={frame < 90 ? 0.05 : Math.cos(t * 1.2) * 0.15}
								scale={1.4}
								accentColor={frame < 90 ? '#F59E0B' : '#38BDF8'}
							/>
						</ThreeCanvas>

						{/* Tag Flutuante Glassmorphism sobre o 3D (aparece no Beat 2) */}
						{frame >= 90 && (
							<div
								style={{
									position: 'absolute',
									bottom: 120,
									background: 'rgba(8, 9, 13, 0.85)',
									backdropFilter: 'blur(20px)',
									border: '1.5px solid rgba(56, 189, 248, 0.4)',
									borderRadius: 16,
									padding: '14px 28px',
									boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.25)',
									textAlign: 'center',
								}}
							>
								<div style={{ fontFamily: fontMono, fontSize: 11, color: '#38BDF8', fontWeight: 800 }}>
									THREE.JS PBR METALNESS 0.88 • CLEARCOAT 0.85
								</div>
								<div style={{ fontFamily: fontBebas, fontSize: 26, color: '#FFFFFF', marginTop: 2 }}>
									Reflexo Fotográfico Físico em Tempo Real
								</div>
							</div>
						)}
					</div>
				)}

				{/* ── BEAT 3 (180 a 270f): CARROSSÉIS EDITORIAIS EM LEQUE 3D ── */}
				{frame >= 180 && frame < 275 && (
					<div
						style={{
							position: 'absolute',
							width: '100%',
							height: '100%',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							perspective: 1200,
							zIndex: 25,
						}}
					>
						{/* Slide 1 Esquerda */}
						<div
							style={{
								position: 'absolute',
								transform: 'translateX(-220px) scale(0.65) rotateY(18deg) rotateZ(-4deg)',
								boxShadow: '0 30px 60px rgba(0, 0, 0, 0.2)',
								borderRadius: 24,
								overflow: 'hidden',
								opacity: 0.85,
							}}
						>
							<Slide02Diagnostico />
						</div>

						{/* Slide 3 Direita */}
						<div
							style={{
								position: 'absolute',
								transform: 'translateX(220px) scale(0.65) rotateY(-18deg) rotateZ(4deg)',
								boxShadow: '0 30px 60px rgba(0, 0, 0, 0.2)',
								borderRadius: 24,
								overflow: 'hidden',
								opacity: 0.85,
							}}
						>
							<Slide04Engenharia />
						</div>

						{/* Slide Central em Destaque */}
						<div
							style={{
								position: 'absolute',
								transform: 'scale(0.74) translateZ(80px)',
								boxShadow: '0 40px 100px rgba(0, 0, 0, 0.35)',
								borderRadius: 24,
								overflow: 'hidden',
								zIndex: 30,
							}}
						>
							<CarrosselEditorial />
						</div>
					</div>
				)}

				{/* ── BEAT 4 (270 a 360f): MICROINTERAÇÕES & MOLA APPLE CALIBRADA ── */}
				{frame >= 270 && frame < 365 && (
					<div
						style={{
							position: 'absolute',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							zIndex: 25,
						}}
					>
						<div style={{ transform: 'scale(1.18)' }}>
							<AppleSpringDemo />
						</div>
					</div>
				)}

				{/* ── BEAT 5 (360 a 450f): TIPOGRAFIA SUÍÇA CINÉTICA DE IMPACTO ── */}
				{frame >= 360 && frame < 455 && (
					<div
						style={{
							position: 'absolute',
							width: 860,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							textAlign: 'center',
							zIndex: 25,
						}}
					>
						<div
							style={{
								fontFamily: fontMono,
								fontSize: 13,
								color: '#F59E0B',
								letterSpacing: 2,
								fontWeight: 800,
								textTransform: 'uppercase',
								marginBottom: 12,
							}}
						>
							● SINCRONIA WHISPER SUB-15MS
						</div>
						<div
							style={{
								fontFamily: fontBebas,
								fontSize: 88,
								lineHeight: 0.9,
								color: '#FFFFFF',
								letterSpacing: 1,
							}}
						>
							TIPOGRAFIA QUE <br />
							<span style={{ color: '#F59E0B', fontFamily: fontInstrumentSerif, fontSize: 102 }}>
								respira
							</span>{' '}
							COM A SUA VOZ
						</div>
						<div
							style={{
								fontFamily: fontPlusJakartaSans,
								fontSize: 18,
								color: 'rgba(255, 255, 255, 0.7)',
								marginTop: 24,
								maxWidth: 620,
								lineHeight: 1.5,
							}}
						>
							Cada palavra acende no milissegundo exato do fonema gravado. Zero edição manual em timeline.
						</div>

						{/* Gráfico de Ondas de Áudio Animado */}
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 6,
								marginTop: 36,
								height: 60,
							}}
						>
							{Array.from({ length: 24 }).map((_, i) => {
								const barH = Math.sin(t * 8 + i * 0.4) * 24 + 28;
								return (
									<div
										key={i}
										style={{
											width: 8,
											height: barH,
											background: i % 3 === 0 ? '#F59E0B' : '#38BDF8',
											borderRadius: 4,
											boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)',
										}}
									/>
								);
							})}
						</div>
					</div>
				)}

				{/* ── BEAT 6 (450 a 540f): DATAVIZ VIVO & EXTRAÇÃO DE CORES K-MEANS ── */}
				{frame >= 450 && frame < 545 && (
					<div
						style={{
							position: 'absolute',
							width: 820,
							background: '#FFFFFF',
							borderRadius: 32,
							padding: 40,
							boxShadow: '0 30px 80px rgba(0, 0, 0, 0.15)',
							border: '1px solid rgba(0, 0, 0, 0.08)',
							zIndex: 25,
						}}
					>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<div>
								<div style={{ fontFamily: fontMono, fontSize: 12, color: '#10B981', fontWeight: 800 }}>
									K-MEANS PALETTE EXTRACTOR
								</div>
								<div style={{ fontFamily: fontBebas, fontSize: 36, color: '#09090B', marginTop: 4 }}>
									HARMONIA CROMÁTICA MATEMÁTICA
								</div>
							</div>
							<div
								style={{
									fontFamily: fontBebas,
									fontSize: 32,
									color: '#10B981',
									background: 'rgba(16, 185, 129, 0.12)',
									padding: '6px 16px',
									borderRadius: 12,
								}}
							>
								+340% RETENÇÃO
							</div>
						</div>

						{/* 5 Swatches de Cores Magnéticas */}
						<div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
							{['#08090C', '#FF0022', '#F59E0B', '#10B981', '#38BDF8'].map((hex, idx) => (
								<div
									key={idx}
									style={{
										flex: 1,
										height: 80,
										borderRadius: 16,
										background: hex,
										boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
										display: 'flex',
										alignItems: 'flex-end',
										padding: 8,
									}}
								>
									<span
										style={{
											fontFamily: fontMono,
											fontSize: 10,
											color: idx === 0 ? '#FFFFFF' : '#000000',
											fontWeight: 700,
										}}
									>
										{hex}
									</span>
								</div>
							))}
						</div>

						{/* Gráfico Curva Bézier */}
						<div style={{ marginTop: 28, height: 160, position: 'relative' }}>
							<svg width="100%" height="100%" viewBox="0 0 740 160">
								<path
									d="M 10 140 Q 180 120, 360 60 T 730 20"
									fill="none"
									stroke="#10B981"
									strokeWidth="4"
									strokeLinecap="round"
								/>
								<circle cx="730" cy="20" r="7" fill="#10B981" />
							</svg>
						</div>
					</div>
				)}

				{/* ── BEAT 7 (540 a 630f): CONSOLE DE ÁUDIO & BROADCAST -14 LUFS ── */}
				{frame >= 540 && frame < 635 && (
					<div
						style={{
							position: 'absolute',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							zIndex: 25,
						}}
					>
						<div style={{ transform: 'scale(1.18)' }}>
							<AudioConsoleDemo />
						</div>
					</div>
				)}

				{/* ── BEAT 8 (630 a 750f): CLÍMAX HERO GITHUB STAR & LEAD MAGNET ── */}
				{frame >= 630 && (
					<div
						style={{
							position: 'absolute',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							zIndex: 25,
						}}
					>
						<div style={{ transform: 'scale(1.12)' }}>
							<GitHubStarHero
								repoName="vibe-design-studio"
								installCommand="$ npx skills add Gabrielrtads/vibe-design-studio"
								ctaWord="VIBE"
								ctaSubtitle="Para receber o repositório completo e comandos no seu Direct."
								initialStars={1481}
							/>
						</div>
					</div>
				)}

				{/* Cursor animado operando nos Beats 4 e 8 */}
				{frame >= 270 && frame <= 720 && (
					<AnimatedCursor
						waypoints={cursorWaypoints}
						visibleStartFrame={270}
						visibleEndFrame={535}
					/>
				)}
			</div>

			{/* ════════════════════════════════════════════════════════════════════
			    FOOTER: STATUS EDITORIAL & SELO BROADCAST
			    ════════════════════════════════════════════════════════════════════ */}
			<div
				style={{
					zIndex: 40,
					display: 'flex',
					alignItems: 'center',
					gap: 24,
					background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
					backdropFilter: 'blur(12px)',
					border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.12)',
					borderRadius: 16,
					padding: '10px 24px',
				}}
			>
				<span style={{ fontFamily: fontMono, fontSize: 11, color: mutedTextColor }}>
					FRAME: {frame} / 750
				</span>
				<span style={{ fontFamily: fontMono, fontSize: 11, color: '#10B981', fontWeight: 700 }}>
					● EBU R128 (-14.0 LUFS)
				</span>
				<span style={{ fontFamily: fontMono, fontSize: 11, color: mutedTextColor }}>
					FPS: 30 • RESOLUÇÃO: 1080×1920
				</span>
			</div>
		</AbsoluteFill>
	);
};
