import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import WORDS_DATA from './data/words.json';
import {
	ci,
	lerp,
	EASE,
	E_IN,
	E_IO,
	E_OUT,
	MONO,
	SANS,
	SERIF,
	AutoImpactTrack,
	SoundImpactTrigger,
	KineticWordCaption,
} from './kit';

// ════════════════════════════════════════════════════════════════════════════
// VIBE DESIGN STUDIO — SHOWCASE REEL INSTAGRAM (30.6s @ 30 FPS = 918 FRAMES)
// Headless Creative Studio para Agentes em Código Puro
// Voz: Antonio Neural (Edge-TTS)
// Sound Design: Foley Orgânico, Whisper-Quiet (-14 LUFS Broadcast Standard)
// ════════════════════════════════════════════════════════════════════════════

export interface FlowMotionMasterProps {
	audioNarracao?: string;
	audioTrilha?: string;
	enableSfx?: boolean;
}

export const FlowMotionMaster: React.FC<FlowMotionMasterProps> = ({
	audioNarracao = 'narracao.mp3',
	audioTrilha,
	enableSfx = true,
}) => {
	const frame = useCurrentFrame();
	const {fps, width: W, height: H} = useVideoConfig();
	const t = frame / fps;

	// ────────────────────────────────────────────────────────────────────────────
	// 1. SOUND DESIGN & IMPACTOS HÁPTICOS (WHISPER-QUIET FOLEY)
	// ────────────────────────────────────────────────────────────────────────────
	const soundTriggers: SoundImpactTrigger[] = useMemo(
		() => [
			// Cena 1: Entrada e alerta de AI Slop
			{startFrame: 0, durationFrames: 25, type: 'whoosh', ease: 'glide', volume: 0.15},
			{startFrame: 45, durationFrames: 15, type: 'click', ease: 'snapSettle', volume: 0.12},
			// Cena 2: Transição para Vibe Design Studio (Hero)
			{startFrame: 165, durationFrames: 25, type: 'whoosh', ease: 'glide', volume: 0.18},
			{startFrame: 210, durationFrames: 15, type: 'click', ease: 'snapSettle', volume: 0.15},
			// Cena 3: Transição para os 4 Superpowers
			{startFrame: 360, durationFrames: 25, type: 'whoosh', ease: 'glide', volume: 0.18},
			{startFrame: 420, durationFrames: 15, type: 'click', ease: 'snapSettle', volume: 0.12},
			{startFrame: 490, durationFrames: 15, type: 'click', ease: 'snapSettle', volume: 0.12},
			{startFrame: 560, durationFrames: 15, type: 'click', ease: 'snapSettle', volume: 0.12},
			// Cena 4: Transição para o CTA Final e Estrela no GitHub
			{startFrame: 665, durationFrames: 28, type: 'whoosh', ease: 'glide', volume: 0.20},
			{startFrame: 720, durationFrames: 18, type: 'click', ease: 'snapSettle', volume: 0.18},
		],
		[]
	);

	// Curva de música com Auto-Ducking
	const musicVolume = useMemo(() => {
		if (frame < 60) return interpolate(frame, [0, 60], [0.08, 0.14]);
		if (frame >= 60 && frame < 780) return 0.12; // Deixa a voz brilhar
		if (frame >= 780 && frame < 860) return 0.18; // Crescendo para fechar
		return interpolate(frame, [860, 918], [0.18, 0.0]); // Fade-out suave
	}, [frame]);

	// ────────────────────────────────────────────────────────────────────────────
	// 2. PARALLAX DA CÂMERA & MICRO-DRIFT CONTÍNUO
	// ────────────────────────────────────────────────────────────────────────────
	const camDriftX = Math.sin(t * 0.9) * 4;
	const camDriftY = Math.cos(t * 0.7) * 3;

	const camScale = useMemo(() => {
		if (frame < 170) {
			// Cena 1: Push-in sutil no choque do problema
			return ci(frame, [0, 170], [1.0, 1.05], EASE.snapSettle);
		}
		if (frame >= 170 && frame < 365) {
			// Cena 2: Recuo e push no Hero Card do estúdio
			const p = ci(frame, [170, 365], [0, 1], EASE.glide);
			return lerp(0.99, 1.04, p);
		}
		if (frame >= 365 && frame < 670) {
			// Cena 3: Foco nos 4 pilares
			const p = ci(frame, [365, 670], [0, 1], EASE.snapSettle);
			return lerp(1.0, 1.05, p);
		}
		// Cena 4: Foco na Estrela e Call to Action
		const p = ci(frame, [670, 918], [0, 1], EASE.softLand);
		return lerp(1.0, 1.06, p);
	}, [frame]);

	// ────────────────────────────────────────────────────────────────────────────
	// 3. ILUMINAÇÃO ATMOSFÉRICA DINÂMICA
	// ────────────────────────────────────────────────────────────────────────────
	const ambientLight = useMemo(() => {
		if (frame < 170) {
			// Cena 1: Alerta vermelho/carmesim sutil
			const alert = ci(frame, [30, 120], [0.08, 0.18], EASE.glide);
			return {
				spotlight: `radial-gradient(circle at 50% 38%, rgba(239, 68, 68, ${alert}) 0%, rgba(6, 8, 13, 0.98) 75%)`,
				rim: `rgba(239, 68, 68, 0.25)`,
			};
		}
		if (frame >= 170 && frame < 365) {
			// Cena 2: Cyan elétrico e azul luxo (Antigravity & Claude)
			const blueIn = ci(frame, [170, 230], [0, 1], EASE.softLand);
			return {
				spotlight: `radial-gradient(circle at 50% 40%, rgba(56, 189, 248, ${0.16 * blueIn}) 0%, rgba(6, 8, 13, 0.98) 80%)`,
				rim: `rgba(56, 189, 248, ${0.35 * blueIn})`,
			};
		}
		if (frame >= 365 && frame < 670) {
			// Cena 3: Verde esmeralda & âmbar (Performance & EBU R128)
			return {
				spotlight: `radial-gradient(circle at 50% 42%, rgba(16, 185, 129, 0.14) 0%, rgba(6, 8, 13, 0.98) 80%)`,
				rim: `rgba(16, 185, 129, 0.28)`,
			};
		}
		// Cena 4: Dourado imperial radiante (GitHub Star)
		const goldIn = ci(frame, [670, 740], [0, 1], EASE.softLand);
		return {
			spotlight: `radial-gradient(circle at 50% 36%, rgba(234, 179, 8, ${0.22 * goldIn}) 0%, rgba(6, 8, 13, 0.98) 80%)`,
			rim: `rgba(234, 179, 8, ${0.45 * goldIn})`,
		};
	}, [frame]);

	// ────────────────────────────────────────────────────────────────────────────
	// 4. TRANSIÇÕES DE VISIBILIDADE DAS 4 CENAS
	// ────────────────────────────────────────────────────────────────────────────
	const s1Progress = ci(frame, [0, 25], [0, 1], E_IN) * ci(frame, [160, 175], [1, 0], E_OUT);
	const s2Progress = ci(frame, [170, 195], [0, 1], E_IN) * ci(frame, [355, 370], [1, 0], E_OUT);
	const s3Progress = ci(frame, [365, 390], [0, 1], E_IN) * ci(frame, [660, 675], [1, 0], E_OUT);
	const s4Progress = ci(frame, [670, 695], [0, 1], E_IN);

	return (
		<AbsoluteFill style={{background: '#06080D', overflow: 'hidden'}}>
			{/* Áudio Trilha & Narração Neural Edge-TTS */}
			{audioTrilha ? <Audio src={staticFile(audioTrilha)} volume={musicVolume} /> : null}
			{audioNarracao ? <Audio src={staticFile(audioNarracao)} volume={1.0} /> : null}
			{enableSfx ? <AutoImpactTrack triggers={soundTriggers} masterVolume={0.30} /> : null}

			{/* ══════════════════════════════════════════════════════════════════════
			    PALCO FÍSICO COM CÂMERA & LUZ ATMOSFÉRICA
			══════════════════════════════════════════════════════════════════════ */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: ambientLight.spotlight,
					transform: `scale(${camScale}) translate(${camDriftX}px, ${camDriftY}px)`,
					transformOrigin: '50% 45%',
				}}
			>
				{/* Grid de Fundo Minimalista */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						backgroundImage:
							'linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)',
						backgroundSize: '68px 68px',
						opacity: 0.65,
						maskImage: 'radial-gradient(ellipse at 50% 45%, black 45%, transparent 85%)',
						WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 45%, transparent 85%)',
					}}
				/>

				{/* Feixe de Luz Físico Superior (Screenbar / Laser Apple) */}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: '18%',
						right: '18%',
						height: 5,
						background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8) 50%, transparent)',
						boxShadow: '0 0 30px rgba(255, 255, 255, 0.4), 0 10px 50px rgba(56, 189, 248, 0.3)',
						borderRadius: 4,
						opacity: 0.85,
					}}
				/>

				{/* Header Superior Fixo / Marca D'água Editorial */}
				<div
					style={{
						position: 'absolute',
						top: 85,
						left: 0,
						right: 0,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						gap: 14,
						zIndex: 50,
						opacity: 0.92,
					}}
				>
					<div
						style={{
							width: 38,
							height: 38,
							borderRadius: 12,
							background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 60%, #0369A1 100%)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#FFFFFF',
							fontWeight: 900,
							fontFamily: SANS,
							fontSize: 20,
							boxShadow: '0 4px 20px rgba(56, 189, 248, 0.4)',
						}}
					>
						V
					</div>
					<div>
						<div
							style={{
								fontFamily: SANS,
								fontSize: 18,
								fontWeight: 700,
								letterSpacing: '-0.02em',
								color: '#F8FAFC',
								display: 'flex',
								alignItems: 'center',
								gap: 8,
							}}
						>
							VIBE DESIGN STUDIO
							<span
								style={{
									fontSize: 10,
									fontWeight: 800,
									padding: '2px 7px',
									borderRadius: 999,
									background: 'rgba(56, 189, 248, 0.16)',
									color: '#38BDF8',
									border: '1px solid rgba(56, 189, 248, 0.3)',
								}}
							>
								OPEN-SOURCE
							</span>
						</div>
						<div
							style={{
								fontFamily: MONO,
								fontSize: 11,
								color: 'rgba(255, 255, 255, 0.45)',
								letterSpacing: '0.04em',
							}}
						>
							HEADLESS MOTION ENGINE FOR AI AGENTS
						</div>
					</div>
				</div>

				{/* ══════════════════════════════════════════════════════════════════
				    CENA 1: O PROBLEMA — "AI SLOP" DETECTED (Frames 0 a 170)
				══════════════════════════════════════════════════════════════════ */}
				{s1Progress > 0.01 && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '0 64px',
							opacity: s1Progress,
							transform: `translateY(${(1 - s1Progress) * 30}px)`,
						}}
					>
						{/* Tag Pill Alerta */}
						<div
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 8,
								padding: '8px 18px',
								borderRadius: 999,
								background: 'rgba(239, 68, 68, 0.12)',
								border: '1px solid rgba(239, 68, 68, 0.35)',
								boxShadow: '0 0 25px rgba(239, 68, 68, 0.25)',
								marginBottom: 24,
							}}
						>
							<span
								style={{
									width: 8,
									height: 8,
									borderRadius: '50%',
									background: '#EF4444',
									boxShadow: '0 0 8px #EF4444',
								}}
							/>
							<span
								style={{
									fontFamily: MONO,
									fontSize: 13,
									fontWeight: 700,
									letterSpacing: '0.08em',
									color: '#FCA5A5',
								}}
							>
								ANTI-SLOP LINTER · DIAGNÓSTICO
							</span>
						</div>

						{/* Headline Provocativa */}
						<h1
							style={{
								fontFamily: SANS,
								fontSize: 58,
								fontWeight: 800,
								lineHeight: 1.08,
								textAlign: 'center',
								letterSpacing: '-0.04em',
								color: '#FFFFFF',
								margin: '0 0 36px 0',
								maxWidth: 880,
							}}
						>
							Cansado de vídeos de IA{' '}
							<span
								style={{
									background: 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
								}}
							>
								genéricos e sem alma?
							</span>
						</h1>

						{/* Card Glassmorphic com os 4 Clichês Riscados */}
						<div
							style={{
								width: '100%',
								maxWidth: 780,
								background: 'rgba(15, 18, 26, 0.75)',
								backdropFilter: 'blur(30px)',
								WebkitBackdropFilter: 'blur(30px)',
								borderRadius: 24,
								border: '1px solid rgba(239, 68, 68, 0.25)',
								boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
								padding: '32px 36px',
								display: 'flex',
								flexDirection: 'column',
								gap: 16,
							}}
						>
							{[
								{text: 'Gradiente roxo clichê e texto chapado', tag: 'AMADOR'},
								{text: 'Movimento linear duro (zero física de mola)', tag: 'SEM INÉRCIA'},
								{text: 'Áudio estourado e foley estridente (> 0 dBFS)', tag: 'CLIPPING'},
								{text: 'Colagem de robôs e stock footage desconexo', tag: 'SLOP'},
							].map((item, idx) => {
								const strikeIn = ci(frame, [45 + idx * 20, 65 + idx * 20], [0, 1], EASE.snapSettle);
								return (
									<div
										key={idx}
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											padding: '14px 18px',
											borderRadius: 14,
											background: 'rgba(255, 255, 255, 0.03)',
											border: '1px solid rgba(255, 255, 255, 0.05)',
										}}
									>
										<div
											style={{
												fontFamily: SANS,
												fontSize: 20,
												fontWeight: 500,
												color: strikeIn > 0.5 ? 'rgba(255, 255, 255, 0.45)' : '#F1F5F9',
												textDecoration: strikeIn > 0.8 ? 'line-through' : 'none',
												display: 'flex',
												alignItems: 'center',
												gap: 12,
											}}
										>
											<span style={{color: '#EF4444', fontSize: 20}}>✕</span>
											{item.text}
										</div>
										<span
											style={{
												fontFamily: MONO,
												fontSize: 11,
												fontWeight: 700,
												padding: '4px 10px',
												borderRadius: 6,
												background: 'rgba(239, 68, 68, 0.15)',
												color: '#F87171',
												border: '1px solid rgba(239, 68, 68, 0.3)',
											}}
										>
											{item.tag}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* ══════════════════════════════════════════════════════════════════
				    CENA 2: A SOLUÇÃO — VIBE DESIGN STUDIO (Frames 165 a 365)
				══════════════════════════════════════════════════════════════════ */}
				{s2Progress > 0.01 && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '0 64px',
							opacity: s2Progress,
							transform: `translateY(${(1 - s2Progress) * 30}px)`,
						}}
					>
						{/* Tag Pill Headless */}
						<div
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 8,
								padding: '8px 20px',
								borderRadius: 999,
								background: 'rgba(56, 189, 248, 0.12)',
								border: '1px solid rgba(56, 189, 248, 0.35)',
								boxShadow: '0 0 25px rgba(56, 189, 248, 0.25)',
								marginBottom: 24,
							}}
						>
							<span
								style={{
									width: 8,
									height: 8,
									borderRadius: '50%',
									background: '#38BDF8',
									boxShadow: '0 0 10px #38BDF8',
								}}
							/>
							<span
								style={{
									fontFamily: MONO,
									fontSize: 13,
									fontWeight: 700,
									letterSpacing: '0.08em',
									color: '#BAE6FD',
								}}
							>
								HEADLESS CREATIVE ENGINE
							</span>
						</div>

						{/* Headline Principal */}
						<h1
							style={{
								fontFamily: SANS,
								fontSize: 62,
								fontWeight: 800,
								lineHeight: 1.05,
								textAlign: 'center',
								letterSpacing: '-0.04em',
								color: '#FFFFFF',
								margin: '0 0 12px 0',
							}}
						>
							Apresentamos o{' '}
							<span
								style={{
									background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
								}}
							>
								Vibe Design Studio
							</span>
						</h1>

						<p
							style={{
								fontFamily: SANS,
								fontSize: 24,
								color: 'rgba(255, 255, 255, 0.65)',
								textAlign: 'center',
								maxWidth: 720,
								margin: '0 0 36px 0',
								fontWeight: 400,
							}}
						>
							O estúdio criativo headless em <b style={{color: '#F8FAFC'}}>código puro</b> desenhado para{' '}
							<b style={{color: '#38BDF8'}}>agentes autônomos</b>.
						</p>

						{/* Terminal Mac & Swarm Agents Stack */}
						<div
							style={{
								width: '100%',
								maxWidth: 820,
								background: 'rgba(11, 15, 24, 0.82)',
								backdropFilter: 'blur(35px)',
								WebkitBackdropFilter: 'blur(35px)',
								borderRadius: 22,
								border: '1px solid rgba(56, 189, 248, 0.25)',
								boxShadow: '0 30px 70px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
								overflow: 'hidden',
							}}
						>
							{/* Top Bar macOS */}
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									padding: '16px 22px',
									background: 'rgba(255, 255, 255, 0.03)',
									borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
								}}
							>
								<div style={{display: 'flex', gap: 8}}>
									<div style={{width: 12, height: 12, borderRadius: '50%', background: '#EF4444'}} />
									<div style={{width: 12, height: 12, borderRadius: '50%', background: '#F59E0B'}} />
									<div style={{width: 12, height: 12, borderRadius: '50%', background: '#10B981'}} />
								</div>
								<div
									style={{
										fontFamily: MONO,
										fontSize: 12,
										color: 'rgba(255, 255, 255, 0.4)',
										letterSpacing: '0.04em',
									}}
								>
									vibe-design-studio / terminal
								</div>
								<div style={{width: 36}} />
							</div>

							{/* Terminal Body com Comandos & Badges */}
							<div style={{padding: '28px 32px'}}>
								<div
									style={{
										fontFamily: MONO,
										fontSize: 20,
										color: '#38BDF8',
										marginBottom: 20,
										display: 'flex',
										alignItems: 'center',
										gap: 12,
									}}
								>
									<span style={{color: '#94A3B8'}}>$</span>
									<span>npx skills add Gabrielrtads/vibe-design-studio</span>
								</div>

								{/* Grid de Agentes Habilitados */}
								<div
									style={{
										display: 'grid',
										gridTemplateColumns: 'repeat(2, 1fr)',
										gap: 12,
										marginTop: 18,
									}}
								>
									{[
										{agent: 'Claude Code', detail: 'Opus 5.5 / Sonnet 4.6', color: '#D97706'},
										{agent: 'OpenAI Codex', detail: 'App & Sandboxed CLI', color: '#10B981'},
										{agent: 'Google Antigravity', detail: 'AGY SDK & Swarm', color: '#38BDF8'},
										{agent: 'Remotion 4.0', detail: 'Deterministic Headless', color: '#8B5CF6'},
									].map((item, i) => (
										<div
											key={i}
											style={{
												padding: '12px 16px',
												borderRadius: 12,
												background: 'rgba(255, 255, 255, 0.03)',
												border: '1px solid rgba(255, 255, 255, 0.08)',
												display: 'flex',
												alignItems: 'center',
												gap: 12,
											}}
										>
											<div
												style={{
													width: 10,
													height: 10,
													borderRadius: '50%',
													background: item.color,
													boxShadow: `0 0 10px ${item.color}`,
												}}
											/>
											<div>
												<div
													style={{
														fontFamily: SANS,
														fontSize: 15,
														fontWeight: 700,
														color: '#F8FAFC',
													}}
												>
													{item.agent}
												</div>
												<div
													style={{
														fontFamily: MONO,
														fontSize: 11,
														color: 'rgba(255, 255, 255, 0.45)',
													}}
												>
													{item.detail}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* ══════════════════════════════════════════════════════════════════
				    CENA 3: OS 4 PILARES DE MOTION (Frames 360 a 670)
				══════════════════════════════════════════════════════════════════ */}
				{s3Progress > 0.01 && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '0 64px',
							opacity: s3Progress,
							transform: `translateY(${(1 - s3Progress) * 30}px)`,
						}}
					>
						{/* Tag Pill 4 Superpowers */}
						<div
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 8,
								padding: '8px 20px',
								borderRadius: 999,
								background: 'rgba(16, 185, 129, 0.12)',
								border: '1px solid rgba(16, 185, 129, 0.35)',
								boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
								marginBottom: 20,
							}}
						>
							<span
								style={{
									width: 8,
									height: 8,
									borderRadius: '50%',
									background: '#10B981',
									boxShadow: '0 0 8px #10B981',
								}}
							/>
							<span
								style={{
									fontFamily: MONO,
									fontSize: 13,
									fontWeight: 700,
									letterSpacing: '0.08em',
									color: '#A7F3D0',
								}}
							>
								4 PILARES DA ARQUITETURA
							</span>
						</div>

						{/* Headline */}
						<h1
							style={{
								fontFamily: SANS,
								fontSize: 54,
								fontWeight: 800,
								lineHeight: 1.08,
								textAlign: 'center',
								letterSpacing: '-0.04em',
								color: '#FFFFFF',
								margin: '0 0 32px 0',
							}}
						>
							Engenharia de Motion{' '}
							<span
								style={{
									background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
								}}
							>
								sem Concorrência
							</span>
						</h1>

						{/* Grid dos 4 Pilares */}
						<div
							style={{
								width: '100%',
								maxWidth: 820,
								display: 'grid',
								gridTemplateColumns: 'repeat(2, 1fr)',
								gap: 18,
							}}
						>
							{[
								{
									icon: '🍏',
									title: 'Física de Mola Apple',
									desc: 'Bézier snapSettle & crashIn com overshoot medido e inércia física real.',
									badge: 'CALIBRATED EASES',
									color: '#34D399',
								},
								{
									icon: '🎙️',
									title: 'Whisper Sub-Milissegundo',
									desc: 'Legendas cinéticas sincronizadas palavra a palavra direto do arquivo words.json.',
									badge: 'SUB-10MS SYNC',
									color: '#38BDF8',
								},
								{
									icon: '🔊',
									title: 'Masterização EBU R128',
									desc: 'Áudio perfeito em -14 LUFS / -1 dBTP com Auto-Ducking automático da trilha.',
									badge: 'BROADCAST STANDARD',
									color: '#F59E0B',
								},
								{
									icon: '🛡️',
									title: 'Anti-Slop Determinístico',
									desc: 'Linter automático que bloqueia estourar volume ou sair das Safe Zones do Instagram.',
									badge: 'AUTOMATED LINTER',
									color: '#A855F7',
								},
							].map((card, idx) => {
								const cardEnter = ci(frame, [380 + idx * 25, 410 + idx * 25], [0, 1], EASE.snapSettle);
								return (
									<div
										key={idx}
										style={{
											background: 'rgba(13, 17, 26, 0.78)',
											backdropFilter: 'blur(30px)',
											WebkitBackdropFilter: 'blur(30px)',
											borderRadius: 20,
											border: '1px solid rgba(255, 255, 255, 0.1)',
											boxShadow:
												'0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
											padding: '24px 26px',
											display: 'flex',
											flexDirection: 'column',
											justifyContent: 'space-between',
											transform: `translateY(${(1 - cardEnter) * 20}px) scale(${lerp(0.95, 1, cardEnter)})`,
											opacity: cardEnter,
										}}
									>
										<div>
											<div
												style={{
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'space-between',
													marginBottom: 14,
												}}
											>
												<span style={{fontSize: 32}}>{card.icon}</span>
												<span
													style={{
														fontFamily: MONO,
														fontSize: 10,
														fontWeight: 800,
														padding: '3px 8px',
														borderRadius: 6,
														background: `${card.color}22`,
														color: card.color,
														border: `1px solid ${card.color}44`,
													}}
												>
													{card.badge}
												</span>
											</div>
											<div
												style={{
													fontFamily: SANS,
													fontSize: 22,
													fontWeight: 700,
													color: '#F8FAFC',
													marginBottom: 8,
												}}
											>
												{card.title}
											</div>
											<div
												style={{
													fontFamily: SANS,
													fontSize: 14,
													color: 'rgba(255, 255, 255, 0.6)',
													lineHeight: 1.4,
												}}
											>
												{card.desc}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* ══════════════════════════════════════════════════════════════════
				    CENA 4: O CTA VIRAL — ESTRELA NO GITHUB (Frames 665 a 918)
				══════════════════════════════════════════════════════════════════ */}
				{s4Progress > 0.01 && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '0 64px',
							opacity: s4Progress,
							transform: `translateY(${(1 - s4Progress) * 30}px)`,
						}}
					>
						{/* Tag Pill Custo Zero */}
						<div
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 8,
								padding: '8px 22px',
								borderRadius: 999,
								background: 'rgba(234, 179, 8, 0.14)',
								border: '1px solid rgba(234, 179, 8, 0.4)',
								boxShadow: '0 0 30px rgba(234, 179, 8, 0.3)',
								marginBottom: 20,
							}}
						>
							<span
								style={{
									width: 8,
									height: 8,
									borderRadius: '50%',
									background: '#EAB308',
									boxShadow: '0 0 10px #EAB308',
								}}
							/>
							<span
								style={{
									fontFamily: MONO,
									fontSize: 13,
									fontWeight: 700,
									letterSpacing: '0.08em',
									color: '#FEF08A',
								}}
							>
								100% OPEN-SOURCE & CUSTO ZERO
							</span>
						</div>

						{/* Ícone Estrela 3D Pulsante com Halo Dourado */}
						<div
							style={{
								position: 'relative',
								width: 100,
								height: 100,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								marginBottom: 16,
							}}
						>
							<div
								style={{
									position: 'absolute',
									inset: -20,
									borderRadius: '50%',
									background: 'radial-gradient(circle, rgba(234, 179, 8, 0.4) 0%, transparent 70%)',
									transform: `scale(${1 + Math.sin(t * 3) * 0.1})`,
								}}
							/>
							<div
								style={{
									fontSize: 80,
									filter: 'drop-shadow(0 0 25px rgba(234, 179, 8, 0.8))',
									transform: `scale(${1 + Math.sin(t * 4) * 0.05})`,
								}}
							>
								⭐
							</div>
						</div>

						{/* Headline Chamada para Estrela */}
						<h1
							style={{
								fontFamily: SANS,
								fontSize: 60,
								fontWeight: 900,
								lineHeight: 1.05,
								textAlign: 'center',
								letterSpacing: '-0.04em',
								color: '#FFFFFF',
								margin: '0 0 14px 0',
							}}
						>
							Deixe sua{' '}
							<span
								style={{
									background: 'linear-gradient(135deg, #FDE047 0%, #EAB308 100%)',
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
								}}
							>
								Estrela no GitHub!
							</span>
						</h1>

						<p
							style={{
								fontFamily: SANS,
								fontSize: 22,
								color: 'rgba(255, 255, 255, 0.7)',
								textAlign: 'center',
								maxWidth: 720,
								margin: '0 0 32px 0',
							}}
						>
							Custo zero de API e livre para toda a comunidade de desenvolvedores.
						</p>

						{/* Card Principal de Conversão / GitHub Repo */}
						<div
							style={{
								width: '100%',
								maxWidth: 780,
								background: 'rgba(15, 19, 28, 0.85)',
								backdropFilter: 'blur(35px)',
								WebkitBackdropFilter: 'blur(35px)',
								borderRadius: 22,
								border: '1px solid rgba(234, 179, 8, 0.35)',
								boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
								padding: '28px 36px',
								display: 'flex',
								flexDirection: 'column',
								gap: 20,
							}}
						>
							{/* Linha do Repositório com Botão Star */}
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									padding: '16px 20px',
									borderRadius: 14,
									background: 'rgba(255, 255, 255, 0.04)',
									border: '1px solid rgba(255, 255, 255, 0.08)',
								}}
							>
								<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
									<div
										style={{
											width: 44,
											height: 44,
											borderRadius: 12,
											background: '#24292F',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											color: '#FFFFFF',
											fontSize: 24,
										}}
									>
										🐙
									</div>
									<div>
										<div
											style={{
												fontFamily: MONO,
												fontSize: 16,
												fontWeight: 700,
												color: '#F8FAFC',
											}}
										>
											Gabrielrtads/vibe-design-studio
										</div>
										<div
											style={{
												fontFamily: SANS,
												fontSize: 12,
												color: 'rgba(255, 255, 255, 0.45)',
											}}
										>
											github.com/Gabrielrtads/vibe-design-studio
										</div>
									</div>
								</div>

								{/* Botão Star Estilizado */}
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 8,
										padding: '10px 18px',
										borderRadius: 10,
										background: 'linear-gradient(135deg, #FDE047 0%, #EAB308 100%)',
										color: '#0F172A',
										fontFamily: SANS,
										fontSize: 15,
										fontWeight: 800,
										boxShadow: '0 4px 20px rgba(234, 179, 8, 0.4)',
									}}
								>
									<span>★</span>
									<span>Star Repo</span>
								</div>
							</div>

							{/* Terminal One-Liner Install */}
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									padding: '14px 20px',
									borderRadius: 12,
									background: 'rgba(0, 0, 0, 0.45)',
									border: '1px solid rgba(255, 255, 255, 0.06)',
								}}
							>
								<div
									style={{
										fontFamily: MONO,
										fontSize: 16,
										color: '#BAE6FD',
										display: 'flex',
										alignItems: 'center',
										gap: 10,
									}}
								>
									<span style={{color: '#94A3B8'}}>$</span>
									<span>npx skills add Gabrielrtads/vibe-design-studio</span>
								</div>
								<span
									style={{
										fontFamily: MONO,
										fontSize: 11,
										fontWeight: 700,
										padding: '4px 8px',
										borderRadius: 6,
										background: 'rgba(56, 189, 248, 0.15)',
										color: '#38BDF8',
									}}
								>
									COPY
								</span>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* ══════════════════════════════════════════════════════════════════════
			    LEGENDAS CINÉTICAS PALAVRA POR PALAVRA (WHISPER SYNC)
			══════════════════════════════════════════════════════════════════════ */}
			<KineticWordCaption
				words={WORDS_DATA}
				preset="gold-glow"
				bottom={120}
				fontSize={32}
				windowSize={4}
			/>
		</AbsoluteFill>
	);
};
