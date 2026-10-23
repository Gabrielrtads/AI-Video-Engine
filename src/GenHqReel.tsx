import React from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	OffthreadVideo,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';
import { GenHqHeader } from './demonstracoes/GenHqHeader';
import { GenHqTimeline } from './demonstracoes/GenHqTimeline';
import { AdversarialTerminal } from './demonstracoes/AdversarialTerminal';
import { GitHubStarHero } from './demonstracoes/GitHubStarHero';
import { KineticWordCaption } from './KineticWordCaption';
import wordsData from './data/words.json';

const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const GenHqReel: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	// ────────────────────────────────────────────────────────────────────────────
	// TIMESTAMPS DOS ATOS NARRATIVOS (Whisper Sync)
	// Ato 1: 0 - 140 frames (0.0s - 4.6s) -> "Você realmente confia no código..."
	// Ato 2: 140 - 405 frames (4.6s - 13.5s) -> "A maioria dos desenvolvedores aceita..."
	// Ato 3: 405 - 1134 frames (13.5s - 37.8s) -> "Pra acabar com isso... cli cross review... 3 IAs"
	// Ato 4: 1134 - 1600 frames (37.8s - 53.3s) -> "100% gratuito... Comenta SWARM... Estrela ⭐"
	// ────────────────────────────────────────────────────────────────────────────

	// Punch-in jump cut aos 60 frames (2.0s) na virada da frase
	const isPunchIn = frame >= 60 && frame < 140;
	const zoomScale = isPunchIn ? 1.18 : 1.0;

	// Transições de Fade entre cenas do Palco Central
	const hookFadeOut = interpolate(frame, [380, 405], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const terminalFadeIn = interpolate(frame, [400, 420], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const terminalFadeOut = interpolate(frame, [1110, 1134], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const starFadeIn = interpolate(frame, [1125, 1145], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Molas para Cards de Alerta de Bugs (Ato 2)
	const bug1Spring = spring({
		frame: Math.max(0, frame - 150),
		fps,
		config: { damping: 14, mass: 0.5, stiffness: 180 },
	});

	const bug2Spring = spring({
		frame: Math.max(0, frame - 210),
		fps,
		config: { damping: 14, mass: 0.5, stiffness: 180 },
	});

	// Notificação estilo iOS Direct para o Ato 4 (Lead Magnet)
	const showDirectNotification = frame >= 1150 && frame < 1420;
	const directNotifSpring = spring({
		frame: Math.max(0, frame - 1150),
		fps,
		config: { damping: 15, mass: 0.5, stiffness: 150 },
	});

	// Glow dinâmico de fundo baseado no ato ativo
	let glowColor = 'rgba(56, 189, 248, 0.12)';
	if (frame >= 140 && frame < 405) {
		glowColor = 'rgba(239, 68, 68, 0.15)';
	} else if (frame >= 405 && frame < 1134) {
		glowColor = 'rgba(56, 189, 248, 0.18)';
	} else if (frame >= 1134) {
		glowColor = 'rgba(245, 158, 11, 0.2)';
	}

	return (
		<AbsoluteFill
			style={{
				background: '#07080B',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'space-between',
				paddingTop: 70,
				paddingBottom: 110,
				boxSizing: 'border-box',
			}}
		>
			{/* ════════════════════════════════════════════════════════════════════
			    1. ÁUDIO: NARRAÇÃO NEURAL + TRILHA SONORA DARK + SFX DE CINEMA
			    ════════════════════════════════════════════════════════════════════ */}
			{/* Narração Principal Normalizada */}
			<Audio src={staticFile('narracao_cli_review.mp3')} volume={1.0} />

			{/* Trilha Sonora com Auto-Ducking Suave */}
			<Audio src={staticFile('audio/trilha_luxo.mp3')} volume={0.12} />

			{/* SFX: Sub-Impact no frame 0 */}
			<Sequence from={0} durationInFrames={90}>
				<Audio src={staticFile('audio/sub_impact_warm.mp3')} volume={0.8} />
			</Sequence>

			{/* SFX: Whoosh no Punch-In aos 60 frames (2.0s) */}
			<Sequence from={58} durationInFrames={40}>
				<Audio src={staticFile('audio/whoosh_zoom.mp3')} volume={0.6} />
			</Sequence>

			{/* SFX: Glitch de Erro nos Bugs aos 140 frames (4.6s) */}
			<Sequence from={140} durationInFrames={60}>
				<Audio src={staticFile('audio/transicao_digital.mp3')} volume={0.7} />
			</Sequence>

			{/* SFX: Whoosh na Entrada do Terminal aos 405 frames (13.5s) */}
			<Sequence from={403} durationInFrames={50}>
				<Audio src={staticFile('audio/whoosh_zoom.mp3')} volume={0.65} />
				<Audio src={staticFile('audio/click_haptic.mp3')} volume={0.5} />
			</Sequence>

			{/* SFX: Whoosh na Entrada do Card do GitHub aos 1134 frames (37.8s) */}
			<Sequence from={1132} durationInFrames={50}>
				<Audio src={staticFile('audio/whoosh_zoom.mp3')} volume={0.65} />
			</Sequence>

			{/* SFX: Clique da Estrela ⭐ no frame 1162 */}
			<Sequence from={1162} durationInFrames={60}>
				<Audio src={staticFile('audio/futurista_click.mp3')} volume={0.85} />
				<Audio src={staticFile('audio/hud_rise.mp3')} volume={0.7} />
			</Sequence>

			{/* SFX: Impacto Final de Fechamento no frame 1540 */}
			<Sequence from={1540} durationInFrames={60}>
				<Audio src={staticFile('audio/impacto_final.mp3')} volume={0.8} />
			</Sequence>

			{/* ════════════════════════════════════════════════════════════════════
			    2. GRID ESPACIAL TECH DE FUNDO (Padrão GenHQ / Rourke)
			    ════════════════════════════════════════════════════════════════════ */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage: `radial-gradient(circle at 50% 45%, ${glowColor} 0%, transparent 65%), radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)`,
					backgroundSize: '100% 100%, 36px 36px',
					pointerEvents: 'none',
					transition: 'all 0.4s ease',
				}}
			/>

			{/* ════════════════════════════════════════════════════════════════════
			    3. BLOCO SUPERIOR: HEADER EDITORIAL TIPOGRÁFICO FLUTUANTE
			    ════════════════════════════════════════════════════════════════════ */}
			<div style={{ zIndex: 30, width: '100%', display: 'flex', justifyContent: 'center' }}>
				<GenHqHeader />
			</div>

			{/* ════════════════════════════════════════════════════════════════════
			    4. BLOCO CENTRAL: PALCO HERÓI WIDESCREEN (Card Cinematográfico)
			    ════════════════════════════════════════════════════════════════════ */}
			<div
				style={{
					width: 960,
					height: 860,
					borderRadius: 24,
					overflow: 'hidden',
					position: 'relative',
					background: '#0B0C10',
					border: '1.5px solid rgba(255, 255, 255, 0.14)',
					boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 0.95), 0 0 50px rgba(56, 189, 248, 0.1)',
					zIndex: 20,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				{/* ── CENA A: TALKING HEAD DO GABRIEL (0 a 405 frames) ── */}
				{frame < 415 && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							opacity: hookFadeOut,
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								width: '100%',
								height: '100%',
								transform: `scale(${zoomScale})`,
								transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
								position: 'relative',
							}}
						>
							<OffthreadVideo
								src={staticFile('avatar_hook_intra.mp4')}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									filter: frame >= 140 ? 'blur(6px) brightness(0.4)' : 'none',
								}}
							/>

							{/* Vinheta de borda para integrar com o card */}
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background:
										'radial-gradient(circle at 50% 50%, transparent 60%, rgba(11, 12, 16, 0.85) 100%)',
									pointerEvents: 'none',
								}}
							/>

							{/* Tag do Criador no Canto Inferior Esquerdo (Ato 1) */}
							{frame < 140 && (
								<div
									style={{
										position: 'absolute',
										bottom: 24,
										left: 24,
										background: 'rgba(0, 0, 0, 0.75)',
										backdropFilter: 'blur(10px)',
										border: '1px solid rgba(255, 255, 255, 0.15)',
										borderRadius: 10,
										padding: '6px 14px',
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										fontFamily: fontMono,
										fontSize: 11,
										fontWeight: 700,
										color: '#FFFFFF',
									}}
								>
									<span style={{ color: '#22C55E' }}>●</span> GABRIEL TOLEDO • FOUNDER
								</div>
							)}

							{/* Cards Flutuantes de Bugs no Ato 2 (140 a 405 frames) */}
							{frame >= 140 && (
								<div
									style={{
										position: 'absolute',
										inset: 0,
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'center',
										alignItems: 'center',
										padding: 30,
										gap: 16,
										zIndex: 10,
									}}
								>
									<div
										style={{
											background: 'rgba(18, 10, 12, 0.92)',
											border: '1.5px solid #EF4444',
											borderRadius: 16,
											padding: '18px 24px',
											boxShadow: '0 25px 60px rgba(239, 68, 68, 0.4)',
											maxWidth: 620,
											fontFamily: fontMono,
											fontSize: 13,
											color: '#FCA5A5',
											lineHeight: 1.6,
											opacity: bug1Spring,
											transform: `translateY(${(1 - bug1Spring) * 20}px)`,
										}}
									>
										<div style={{ color: '#EF4444', fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
											<span>🚨</span> [FATAL ERROR] 500 Internal Server Error
										</div>
										<div>TypeError: Cannot read properties of undefined (reading 'customer_id')</div>
										<div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4 }}>
											at processOrder (/app/api/checkout.ts:89:14) • 03:42 AM
										</div>
									</div>

									<div
										style={{
											background: 'rgba(18, 10, 12, 0.92)',
											border: '1.5px solid #EF4444',
											borderRadius: 16,
											padding: '18px 24px',
											boxShadow: '0 25px 60px rgba(239, 68, 68, 0.4)',
											maxWidth: 620,
											fontFamily: fontMono,
											fontSize: 13,
											color: '#FCA5A5',
											lineHeight: 1.6,
											opacity: bug2Spring,
											transform: `translateY(${(1 - bug2Spring) * 20}px)`,
										}}
									>
										<div style={{ color: '#EF4444', fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
											<span>⚡</span> [ALUCINAÇÃO DETECTADA]
										</div>
										<div>A IA inventou parâmetros que não existem na API em produção!</div>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* ── CENA B: TERMINAL ADVERSARIAL DAS 3 IAs (405 a 1134 frames) ── */}
				{frame >= 395 && frame < 1140 && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							opacity: terminalFadeIn * terminalFadeOut,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<div style={{ transform: 'scale(1.05)' }}>
							<AdversarialTerminal />
						</div>
					</div>
				)}

				{/* ── CENA C: FUNIL DE ESTRELAS NO GITHUB (1130 a 1600 frames) ── */}
				{frame >= 1125 && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							opacity: starFadeIn,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<div style={{ transform: 'scale(1.05)' }}>
							<GitHubStarHero
								repoName="cli-cross-review"
								installCommand="$ npx cli-cross-review --adversarial"
								ctaWord="SWARM"
								ctaSubtitle="Para receber o link do repositório no seu Direct!"
								initialStars={1481}
							/>
						</div>
					</div>
				)}

				{/* Notificação iOS suspensa no topo do palco central (Ato 4) */}
				{showDirectNotification && (
					<div
						style={{
							position: 'absolute',
							top: 24,
							left: 24,
							right: 24,
							display: 'flex',
							justifyContent: 'center',
							zIndex: 40,
							opacity: directNotifSpring,
							transform: `translateY(${(1 - directNotifSpring) * -20}px)`,
						}}
					>
						<div
							style={{
								background: 'rgba(18, 20, 26, 0.95)',
								border: '1.5px solid rgba(255, 255, 255, 0.15)',
								borderRadius: 18,
								padding: '12px 20px',
								display: 'flex',
								alignItems: 'center',
								gap: 12,
								boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(56, 189, 248, 0.25)',
								width: '100%',
								maxWidth: 520,
							}}
						>
							<div
								style={{
									width: 38,
									height: 38,
									borderRadius: '50%',
									background: 'linear-gradient(135deg, #FF0080, #7928CA)',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									fontSize: 18,
								}}
							>
								✉️
							</div>
							<div>
								<div style={{ fontFamily: fontPlusJakartaSans, fontSize: 12, fontWeight: 800, color: '#FFFFFF' }}>
									Instagram Direct • Gabriel Toledo
								</div>
								<div style={{ fontFamily: fontMono, fontSize: 11, color: '#38BDF8', marginTop: 1 }}>
									"Link enviado: github.com/Gabrielrtads/cli-cross-review"
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* ════════════════════════════════════════════════════════════════════
			    5. BLOCO INFERIOR: TIMELINE INTERATIVA DE EXECUÇÃO (Assinatura Rourke)
			    ════════════════════════════════════════════════════════════════════ */}
			<div style={{ zIndex: 30, width: '100%', display: 'flex', justifyContent: 'center' }}>
				<GenHqTimeline />
			</div>

			{/* ════════════════════════════════════════════════════════════════════
			    6. LEGENDAS CINÉTICAS (WHISPER SYNC) EM PÍLULA CENTRAL
			    ════════════════════════════════════════════════════════════════════ */}
			<KineticWordCaption
				words={wordsData as any}
				preset="gold-glow"
				windowSize={4}
				fontSize={28}
				bottom={30}
			/>
		</AbsoluteFill>
	);
};
