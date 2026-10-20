import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import WORDS_DATA from './data/words_thalita.json';
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
	WordItem,
} from './kit';
import {AnimosSheen, CinematicStage} from './styles_kit';

// ════════════════════════════════════════════════════════════════════════════
// FLOW MOTION MASTER — VERSÃO DE LUXO & SOM MINIMALISTA (27.5s @ 30 FPS = 825 FRAMES)
// Voz: Thalita Multilingual Neural (Tom Sofisticado / Apple Clean)
// Sound Design: Foley Orgânico, Discreto, Whisper-Quiet (Zero ruídos agressivos)
// ════════════════════════════════════════════════════════════════════════════

export interface FlowMotionMasterProps {
	audioNarracao?: string;
	audioTrilha?: string;
	enableSfx?: boolean;
}

export const FlowMotionMaster: React.FC<FlowMotionMasterProps> = ({
	audioNarracao,
	audioTrilha,
	enableSfx = false,
}) => {
	const frame = useCurrentFrame();
	const {fps, width: W, height: H} = useVideoConfig();
	const t = frame / fps;

	// ────────────────────────────────────────────────────────────────────────────
	// 1. SOUND DESIGN MINIMALISTA & AGRADÁVEL (WHISPER-QUIET FOLEY)
	// Eliminados todos os booms, slams metálicos e glitches digitais estridentes.
	// Apenas transições de ar suaves e toques hápticos aveludados.
	// ────────────────────────────────────────────────────────────────────────────
	const soundTriggers: SoundImpactTrigger[] = useMemo(
		() => [
			// Entrada sutil de ar (whoosh suave)
			{startFrame: 0, durationFrames: 25, type: 'whoosh', ease: 'glide', volume: 0.16},
			// Toque tátil macio no R$ 35
			{startFrame: 105, durationFrames: 15, type: 'click', ease: 'snapSettle', volume: 0.12},
			// Virada de cena para o Cartão VIP (ar suave)
			{startFrame: 265, durationFrames: 25, type: 'whoosh', ease: 'glide', volume: 0.18},
			// Clique háptico sutil no Cartão Flow Club
			{startFrame: 295, durationFrames: 15, type: 'click', ease: 'snapSettle', volume: 0.14},
			// Transição para o painel de economia (ar suave)
			{startFrame: 430, durationFrames: 25, type: 'whoosh', ease: 'glide', volume: 0.16},
			// Transição para as badges e CTA
			{startFrame: 580, durationFrames: 25, type: 'whoosh', ease: 'glide', volume: 0.16},
			// Clique háptico no botão CTA final
			{startFrame: 715, durationFrames: 15, type: 'click', ease: 'snapSettle', volume: 0.18},
		],
		[]
	);

	// Curva suave da trilha sonora (Ducking aveludado e elegante)
	const musicVolume = useMemo(() => {
		if (frame < 60) return interpolate(frame, [0, 60], [0.12, 0.18]);
		if (frame >= 60 && frame < 710) return 0.15; // Música sutil de fundo deixando a voz brilhar
		if (frame >= 710 && frame < 780) return 0.22; // Leve crescendo no fechamento
		return interpolate(frame, [780, 825], [0.22, 0.0]); // Fade-out suave
	}, [frame]);

	// ────────────────────────────────────────────────────────────────────────────
	// 2. DINÂMICA DE CÂMERA & PARALLAX VIRTUAL (DOLLY-IN SUAVE)
	// ────────────────────────────────────────────────────────────────────────────
	const camDriftX = Math.sin(t * 1.0) * 5;
	const camDriftY = Math.cos(t * 0.8) * 4;

	const camScale = useMemo(() => {
		if (frame < 270) {
			// Cena 1: Push-in suave no choque do preço
			return ci(frame, [0, 270], [1.0, 1.06], EASE.snapSettle);
		}
		if (frame >= 270 && frame < 435) {
			// Cena 2: Recuo e foco no Cartão VIP
			const p = ci(frame, [270, 435], [0, 1], EASE.glide);
			return lerp(0.99, 1.05, p);
		}
		if (frame >= 435 && frame < 585) {
			// Cena 3: Foco no gráfico de economia real
			const p = ci(frame, [435, 585], [0, 1], EASE.snapSettle);
			return lerp(1.0, 1.07, p);
		}
		// Cena 4: Foco elegante no Call-to-Action
		const p = ci(frame, [585, 825], [0, 1], EASE.softLand);
		return lerp(1.01, 1.07, p);
	}, [frame]);

	// ────────────────────────────────────────────────────────────────────────────
	// 3. ILUMINAÇÃO ATMOSFÉRICA & NARRATIVA DE COR
	// ────────────────────────────────────────────────────────────────────────────
	const ambientLight = useMemo(() => {
		if (frame < 270) {
			const redAlert = ci(frame, [170, 260], [0, 0.2], EASE.glide);
			return {
				spotlight: `radial-gradient(circle at 50% 35%, rgba(20, 32, 54, 0.7) 0%, rgba(7, 9, 14, 0.98) 75%)`,
				rim: `rgba(244, 63, 94, ${redAlert * 0.15})`,
			};
		}
		if (frame >= 270 && frame < 435) {
			const goldIn = ci(frame, [270, 330], [0, 1], EASE.softLand);
			return {
				spotlight: `radial-gradient(circle at 50% 40%, rgba(212, 175, 55, ${0.14 * goldIn}) 0%, rgba(7, 9, 14, 0.98) 80%)`,
				rim: `rgba(212, 175, 55, ${0.3 * goldIn})`,
			};
		}
		if (frame >= 435 && frame < 585) {
			return {
				spotlight: `radial-gradient(circle at 50% 45%, rgba(16, 185, 129, 0.15) 0%, rgba(7, 9, 14, 0.98) 80%)`,
				rim: `rgba(16, 185, 129, 0.25)`,
			};
		}
		return {
			spotlight: `radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.18) 0%, rgba(7, 9, 14, 0.98) 80%)`,
			rim: `rgba(212, 175, 55, 0.35)`,
		};
	}, [frame]);

	// ────────────────────────────────────────────────────────────────────────────
	// 4. MOEDAS 3D FLUTUANTES NAS BORDAS COM FÍSICA SUAVE
	// ────────────────────────────────────────────────────────────────────────────
	const coins = useMemo(
		() => [
			{x: 110, delay: 90, speed: 1.1, rotOffset: 25},
			{x: 950, delay: 105, speed: 1.25, rotOffset: -35},
			{x: 180, delay: 125, speed: 0.95, rotOffset: 45},
			{x: 880, delay: 140, speed: 1.05, rotOffset: -20},
			{x: 90, delay: 160, speed: 1.3, rotOffset: 15},
			{x: 970, delay: 175, speed: 1.15, rotOffset: -10},
		],
		[]
	);

	// ────────────────────────────────────────────────────────────────────────────
	// 5. TRANSIÇÕES DE VISIBILIDADE DAS 4 CENAS
	// ────────────────────────────────────────────────────────────────────────────
	const s1Progress = ci(frame, [0, 25], [0, 1], E_IN) * ci(frame, [260, 275], [1, 0], E_OUT);
	const s2Progress = ci(frame, [275, 295], [0, 1], E_IN) * ci(frame, [425, 440], [1, 0], E_OUT);
	const s3Progress = ci(frame, [440, 460], [0, 1], E_IN) * ci(frame, [575, 590], [1, 0], E_OUT);
	const s4Progress = ci(frame, [590, 610], [0, 1], E_IN);

	return (
		<AbsoluteFill style={{background: '#05070A', overflow: 'hidden'}}>
			{/* Áudio Opcional (Plug & Play - Repositório 100% Livre de Binários de Mídia) */}
			{audioTrilha ? <Audio src={staticFile(audioTrilha)} volume={musicVolume} /> : null}
			{audioNarracao ? <Audio src={staticFile(audioNarracao)} volume={1.0} /> : null}
			{enableSfx ? <AutoImpactTrack triggers={soundTriggers} masterVolume={0.32} /> : null}

			{/* ══════════════════════════════════════════════════════════════════════
			    O SETUP FÍSICO / ÂNCORA DE REALIDADE (THE REALITY RIG)
			══════════════════════════════════════════════════════════════════════ */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: ambientLight.spotlight,
					transform: `scale(${camScale}) translate(${camDriftX}px, ${camDriftY}px)`,
					transformOrigin: '50% 45%',
					transition: 'background 0.5s ease',
				}}
			>
				{/* Grid de Fundo Minimalista */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						backgroundImage:
							'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
						backgroundSize: '72px 72px',
						opacity: 0.6,
						maskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 85%)',
						WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 85%)',
					}}
				/>

				{/* Screenbar / Feixe de Luz Físico no Topo */}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: '20%',
						right: '20%',
						height: 6,
						background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7) 50%, transparent)',
						boxShadow: '0 0 35px rgba(255, 255, 255, 0.5), 0 10px 60px rgba(212, 175, 55, 0.3)',
						borderRadius: 4,
						opacity: 0.85,
					}}
				/>

				{/* Marca D'água Editorial no Topo */}
				<div
					style={{
						position: 'absolute',
						top: 90,
						left: 0,
						right: 0,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						gap: 16,
						zIndex: 50,
						opacity: 0.9,
					}}
				>
					<div
						style={{
							width: 38,
							height: 38,
							borderRadius: 12,
							background: 'linear-gradient(135deg, #FBE8A6 0%, #D4AF37 60%, #996515 100%)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#07090E',
							fontWeight: 900,
							fontFamily: SANS,
							fontSize: 20,
							boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
						}}
					>
						F
					</div>
					<div>
						<div
							style={{
								fontFamily: SANS,
								fontSize: 18,
								fontWeight: 700,
								letterSpacing: 4,
								color: '#FFFFFF',
								textTransform: 'uppercase',
							}}
						>
							BARBEARIA FLOW
						</div>
						<div
							style={{
								fontFamily: MONO,
								fontSize: 11,
								letterSpacing: 2,
								color: 'rgba(212, 175, 55, 0.75)',
								textTransform: 'uppercase',
							}}
						>
							AUDITORIA FINANCEIRA • FLOW CLUB
						</div>
					</div>
				</div>

				{/* ══════════════════════════════════════════════════════════════════
				    CENA 1 (0.0s - 9.0s | Frames 0 - 270): O CUSTO DO CORTE AVULSO
				    "Você já calculou quanto gasta por mês na barbearia? Pagando 35
				     reais por corte avulso, duas idas ao mês já somam 70 reais."
				══════════════════════════════════════════════════════════════════ */}
				{frame < 275 && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							opacity: s1Progress,
							transform: `translateY(${lerp(25, 0, ci(frame, [0, 30], [0, 1], E_IN))}px)`,
						}}
					>
						<div
							style={{
								fontFamily: SERIF,
								fontSize: 54,
								fontStyle: 'italic',
								color: '#FFFFFF',
								textAlign: 'center',
								maxWidth: 860,
								lineHeight: 1.15,
								textShadow: '0 8px 30px rgba(0,0,0,0.8)',
							}}
						>
							Quanto você gasta por mês?
						</div>

						{/* Card 3D em Perspectiva */}
						<div
							style={{
								marginTop: 45,
								perspective: 1200,
								display: 'flex',
								justifyContent: 'center',
							}}
						>
							<div
								style={{
									width: 840,
									padding: '48px 56px',
									borderRadius: 36,
									background: 'linear-gradient(165deg, rgba(20, 24, 34, 0.95) 0%, rgba(10, 12, 18, 0.98) 100%)',
									border: '1px solid rgba(244, 63, 94, 0.25)',
									boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 50px rgba(244, 63, 94, 0.08)',
									transform: `rotateX(${interpolate(frame, [0, 200], [6, 2])}deg) rotateY(${interpolate(
										frame,
										[0, 200],
										[-4, 2]
									)}deg)`,
									transformStyle: 'preserve-3d',
								}}
							>
								{/* Header do Card */}
								<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
									<div
										style={{
											fontFamily: SANS,
											fontSize: 16,
											fontWeight: 600,
											letterSpacing: 3,
											color: 'rgba(255, 255, 255, 0.5)',
											textTransform: 'uppercase',
										}}
									>
										CUSTO INDIVIDUAL TRADICIONAL
									</div>
									<div
										style={{
											padding: '6px 16px',
											borderRadius: 99,
											background: 'rgba(244, 63, 94, 0.15)',
											border: '1px solid rgba(244, 63, 94, 0.4)',
											color: '#F43F5E',
											fontFamily: MONO,
											fontSize: 13,
											fontWeight: 700,
											letterSpacing: 1.5,
										}}
									>
										DESPERDÍCIO
									</div>
								</div>

								{/* Preço Gigante R$ 35 */}
								<div
									style={{
										display: 'flex',
										alignItems: 'baseline',
										gap: 14,
										marginTop: 26,
										transform: `scale(${spring({
											frame: Math.max(0, frame - 95),
											fps,
											config: {damping: 14, stiffness: 120},
										})})`,
										transformOrigin: 'left center',
									}}
								>
									<span style={{fontFamily: SANS, fontSize: 36, color: '#F43F5E', fontWeight: 600}}>
										R$
									</span>
									<span
										style={{
											fontFamily: SERIF,
											fontSize: 124,
											fontWeight: 400,
											color: '#FFFFFF',
											lineHeight: 0.9,
										}}
									>
										35
									</span>
									<span style={{fontFamily: SANS, fontSize: 24, color: 'rgba(255, 255, 255, 0.4)'}}>
										/ por corte
									</span>
								</div>

								{/* Multiplicação: 2 Idas = R$ 70 */}
								<div
									style={{
										marginTop: 40,
										paddingTop: 30,
										borderTop: '1px solid rgba(255, 255, 255, 0.08)',
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'center',
										opacity: ci(frame, [175, 205], [0, 1], E_IN),
										transform: `translateY(${lerp(15, 0, ci(frame, [175, 205], [0, 1], E_IN))}px)`,
									}}
								>
									<div>
										<div style={{fontFamily: SANS, fontSize: 20, color: 'rgba(255, 255, 255, 0.7)'}}>
											Faz a conta no mês:
										</div>
										<div style={{fontFamily: MONO, fontSize: 15, color: 'rgba(255, 255, 255, 0.4)', marginTop: 4}}>
											2 idas à barbearia
										</div>
									</div>
									<div style={{textAlign: 'right'}}>
										<div style={{fontFamily: SERIF, fontSize: 48, color: '#F43F5E', fontStyle: 'italic'}}>
											= R$ 70,00
										</div>
										<div style={{fontFamily: MONO, fontSize: 13, color: '#F43F5E', letterSpacing: 1}}>
											DINHEIRO INDO EMBORA
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Moedas 3D Flutuando nas Margens */}
						{coins.map((c, i) => {
							const coinAge = frame - c.delay;
							if (coinAge < 0 || coinAge > 110) return null;
							const fallProgress = ci(coinAge, [0, 55], [0, 1], EASE.snapSettle);
							const coinY = lerp(-100, 880, fallProgress);
							const coinRot = coinAge * 7 * c.speed + c.rotOffset;
							const coinOpacity = ci(coinAge, [0, 10], [0, 1]) * ci(coinAge, [90, 110], [1, 0]);

							return (
								<div
									key={i}
									style={{
										position: 'absolute',
										left: c.x,
										top: coinY,
										width: 48,
										height: 48,
										borderRadius: '50%',
										background: 'linear-gradient(135deg, #FBE8A6 0%, #D4AF37 60%, #996515 100%)',
										border: '2px solid rgba(255, 255, 255, 0.6)',
										boxShadow: '0 10px 25px rgba(0,0,0,0.6), 0 0 15px rgba(212, 175, 55, 0.4)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										color: '#07090E',
										fontFamily: SANS,
										fontWeight: 900,
										fontSize: 16,
										transform: `rotateY(${coinRot}deg) rotateZ(${c.rotOffset}deg)`,
										opacity: coinOpacity,
										pointerEvents: 'none',
									}}
								>
									$
								</div>
							);
						})}
					</div>
				)}

				{/* ══════════════════════════════════════════════════════════════════
				    CENA 2 (9.0s - 14.5s | Frames 270 - 435): O CARTÃO VIP FLOW CLUB
				    "No Flow Club, sua assinatura é ilimitada por apenas 64,97."
				══════════════════════════════════════════════════════════════════ */}
				{frame >= 270 && frame < 440 && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							opacity: s2Progress,
						}}
					>
						<div
							style={{
								fontFamily: SANS,
								fontSize: 16,
								fontWeight: 600,
								letterSpacing: 4,
								color: '#D4AF37',
								textTransform: 'uppercase',
								marginBottom: 20,
							}}
						>
							A SOLUÇÃO DEFINITIVA
						</div>

						<div
							style={{
								fontFamily: SERIF,
								fontSize: 64,
								fontStyle: 'italic',
								color: '#FFFFFF',
								textAlign: 'center',
								maxWidth: 880,
								lineHeight: 1.1,
							}}
						>
							Assinatura Ilimitada Flow Club
						</div>

						{/* O CARTÃO VIP BLACK TITANIUM 3D EM PERSPECTIVA */}
						<div
							style={{
								marginTop: 45,
								perspective: 1400,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<div
								style={{
									width: 820,
									height: 480,
									borderRadius: 36,
									background: 'linear-gradient(145deg, #181C26 0%, #0C0E14 60%, #06070A 100%)',
									border: '1.5px solid rgba(212, 175, 55, 0.45)',
									boxShadow:
										'0 40px 100px rgba(0, 0, 0, 0.85), 0 0 60px rgba(212, 175, 55, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
									padding: '44px 52px',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
									position: 'relative',
									overflow: 'hidden',
									transform: `scale(${spring({
										frame: Math.max(0, frame - 280),
										fps,
										config: {damping: 15, stiffness: 95},
									})}) rotateX(${lerp(12, 4, ci(frame, [280, 420], [0, 1])) + Math.sin(t * 1.4) * 2}deg) rotateY(${
										lerp(-18, -6, ci(frame, [280, 420], [0, 1])) + Math.cos(t * 1.2) * 2
									}deg)`,
									transformStyle: 'preserve-3d',
								}}
							>
								{/* Feixe de Luz Reflexiva Animos Sheen Cruzando o Cartão */}
								<AnimosSheen
									atSecond={10.2}
									durationInSeconds={1.4}
									intensity={0.42}
									angle={115}
									color="212, 175, 55"
								/>

								{/* Topo do Cartão: Chip EMV e Logo */}
								<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
									<div
										style={{
											width: 70,
											height: 52,
											borderRadius: 12,
											background: 'linear-gradient(135deg, #FBE8A6 0%, #D4AF37 50%, #B8860B 100%)',
											border: '1px solid rgba(255, 255, 255, 0.4)',
											boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
											position: 'relative',
										}}
									>
										<div
											style={{
												position: 'absolute',
												inset: '10px 14px',
												border: '1px solid rgba(0,0,0,0.3)',
												borderRadius: 6,
											}}
										/>
									</div>

									<div style={{textAlign: 'right'}}>
										<div
											style={{
												fontFamily: SANS,
												fontSize: 18,
												fontWeight: 700,
												letterSpacing: 4,
												color: '#FFFFFF',
												textTransform: 'uppercase',
											}}
										>
											TITANIUM VIP
										</div>
										<div style={{fontFamily: MONO, fontSize: 12, color: '#D4AF37', letterSpacing: 2}}>
											ACESSO ILIMITADO
										</div>
									</div>
								</div>

								{/* Preço Central da Assinatura: R$ 64,97 */}
								<div>
									<div
										style={{
											fontFamily: SANS,
											fontSize: 16,
											fontWeight: 600,
											letterSpacing: 3,
											color: 'rgba(255, 255, 255, 0.6)',
											textTransform: 'uppercase',
										}}
									>
										VALOR FIXO MENSAL
									</div>
									<div style={{display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 4}}>
										<span style={{fontFamily: SANS, fontSize: 38, color: '#D4AF37', fontWeight: 700}}>
											R$
										</span>
										<span
											style={{
												fontFamily: SERIF,
												fontSize: 110,
												fontWeight: 400,
												color: '#FFFFFF',
												lineHeight: 0.9,
												textShadow: '0 0 40px rgba(212, 175, 55, 0.4)',
											}}
										>
											64,97
										</span>
										<span
											style={{
												fontFamily: SANS,
												fontSize: 24,
												color: '#10B981',
												fontWeight: 600,
												letterSpacing: 1,
											}}
										>
											/ MÊS ILIMITADO
										</span>
									</div>
								</div>

								{/* Rodapé do Cartão */}
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										alignItems: 'flex-end',
										borderTop: '1px solid rgba(255, 255, 255, 0.08)',
										paddingTop: 18,
									}}
								>
									<div style={{fontFamily: MONO, fontSize: 15, letterSpacing: 3, color: 'rgba(255, 255, 255, 0.4)'}}>
										•••• •••• •••• 2026
									</div>
									<div
										style={{
											fontFamily: SANS,
											fontSize: 14,
											fontWeight: 700,
											letterSpacing: 2,
											color: '#D4AF37',
											textTransform: 'uppercase',
										}}
									>
										CORTE QUANTAS VEZES QUISER
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* ══════════════════════════════════════════════════════════════════
				    CENA 3 (14.5s - 19.5s | Frames 435 - 585): A MATEMÁTICA DA ECONOMIA
				    "Cortando toda semana, você economiza mais de 75 reais todo mês."
				══════════════════════════════════════════════════════════════════ */}
				{frame >= 435 && frame < 590 && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							opacity: s3Progress,
						}}
					>
						<div
							style={{
								fontFamily: SERIF,
								fontSize: 60,
								fontStyle: 'italic',
								color: '#FFFFFF',
								textAlign: 'center',
								maxWidth: 880,
								lineHeight: 1.15,
							}}
						>
							Corte toda semana e lucre
						</div>

						{/* Painel DataViz com Curva SVG e Odômetro */}
						<div
							style={{
								marginTop: 45,
								width: 860,
								padding: '48px 56px',
								borderRadius: 36,
								background: 'linear-gradient(165deg, rgba(14, 24, 20, 0.95) 0%, rgba(8, 14, 12, 0.98) 100%)',
								border: '1.5px solid rgba(16, 185, 129, 0.35)',
								boxShadow: '0 30px 90px rgba(0,0,0,0.8), 0 0 60px rgba(16, 185, 129, 0.15)',
								position: 'relative',
								overflow: 'hidden',
								transform: `scale(${spring({
									frame: Math.max(0, frame - 440),
									fps,
									config: {damping: 14, stiffness: 110},
								})})`,
							}}
						>
							{/* Odômetro Acumulado em Tempo Real */}
							<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
								<div>
									<div
										style={{
											fontFamily: SANS,
											fontSize: 16,
											fontWeight: 600,
											letterSpacing: 3,
											color: '#10B981',
											textTransform: 'uppercase',
										}}
									>
										ECONOMIA REAL NO SEU BOLSO
									</div>
									<div style={{display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 8}}>
										<span style={{fontFamily: SANS, fontSize: 36, color: '#10B981', fontWeight: 700}}>
											+R$
										</span>
										<span
											style={{
												fontFamily: SERIF,
												fontSize: 112,
												fontWeight: 400,
												color: '#FFFFFF',
												lineHeight: 0.9,
												textShadow: '0 0 35px rgba(16, 185, 129, 0.4)',
											}}
										>
											{Math.round(lerp(0, 75, ci(frame, [445, 530], [0, 1], EASE.glide)))},00
										</span>
										<span style={{fontFamily: SANS, fontSize: 24, color: 'rgba(255, 255, 255, 0.6)'}}>
											/ todo mês
										</span>
									</div>
								</div>

								<div
									style={{
										padding: '10px 20px',
										borderRadius: 99,
										background: 'rgba(16, 185, 129, 0.18)',
										border: '1px solid rgba(16, 185, 129, 0.5)',
										color: '#10B981',
										fontFamily: MONO,
										fontSize: 16,
										fontWeight: 700,
									}}
								>
									+54% DE ECONOMIA
								</div>
							</div>

							{/* Curva SVG Dinâmica */}
							<div style={{marginTop: 36, height: 160, position: 'relative'}}>
								<svg width="100%" height="160" viewBox="0 0 748 160">
									<defs>
										<linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
											<stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
										</linearGradient>
									</defs>

									<path
										d="M 20 140 C 220 130, 420 50, 728 15 L 728 150 L 20 150 Z"
										fill="url(#chartGrad)"
										opacity={ci(frame, [450, 530], [0, 1], E_IN)}
									/>

									<path
										d="M 20 140 C 220 130, 420 50, 728 15"
										fill="none"
										stroke="#10B981"
										strokeWidth="6"
										strokeLinecap="round"
										strokeDasharray={900}
										strokeDashoffset={lerp(900, 0, ci(frame, [450, 540], [0, 1], EASE.snapSettle))}
										filter="drop-shadow(0 0 12px rgba(16, 185, 129, 0.6))"
									/>
								</svg>
							</div>

							{/* Banner Anual de Lucro */}
							<div
								style={{
									marginTop: 20,
									padding: '18px 26px',
									borderRadius: 18,
									background: 'rgba(255, 255, 255, 0.04)',
									border: '1px solid rgba(255, 255, 255, 0.08)',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<div style={{fontFamily: SANS, fontSize: 18, color: '#FFFFFF', fontWeight: 600}}>
									Economia anual acumulada:
								</div>
								<div
									style={{
										fontFamily: MONO,
										fontSize: 24,
										fontWeight: 700,
										color: '#10B981',
										letterSpacing: 1,
									}}
								>
									R$ 900,00 / ano
								</div>
							</div>
						</div>
					</div>
				)}

				{/* ══════════════════════════════════════════════════════════════════
				    CENA 4 (19.5s - 27.5s | Frames 585 - 825): BADGES & CTA FINAL
				    "Seu degradê sempre impecável, pagando menos da metade.
				     Toque no link da bio e garanta sua vaga exclusiva."
				══════════════════════════════════════════════════════════════════ */}
				{frame >= 585 && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							opacity: s4Progress,
						}}
					>
						<div
							style={{
								fontFamily: SERIF,
								fontSize: 66,
								fontStyle: 'italic',
								color: '#FFFFFF',
								textAlign: 'center',
								maxWidth: 900,
								lineHeight: 1.1,
							}}
						>
							Degradê sempre impecável
						</div>

						{/* 4 Badges de Prestígio em Glassmorphism Flutuante */}
						<div
							style={{
								marginTop: 40,
								display: 'grid',
								gridTemplateColumns: 'repeat(2, 410px)',
								gap: 20,
							}}
						>
							{[
								{title: 'CORTES ILIMITADOS', sub: 'Sem limite no mês', delay: 595, offset: 0},
								{title: 'ZERO ESPERA', sub: 'Horário VIP garantido', delay: 615, offset: 1.5},
								{title: 'ALTA PRECISÃO', sub: 'Barbeiros de elite', delay: 635, offset: 3.0},
								{title: 'MENOS DA METADE', sub: 'Preço fixo de R$ 64,97', delay: 655, offset: 4.5},
							].map((item, idx) => {
								const bEnter = ci(frame, [item.delay, item.delay + 20], [0, 1], E_IN);
								const bY = lerp(30, 0, bEnter) + Math.sin(t * 2 + item.offset) * 5;

								return (
									<div
										key={idx}
										style={{
											padding: '24px 28px',
											borderRadius: 24,
											background: 'rgba(16, 20, 30, 0.85)',
											border: '1px solid rgba(212, 175, 55, 0.3)',
											backdropFilter: 'blur(20px)',
											boxShadow: '0 15px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
											opacity: bEnter,
											transform: `translateY(${bY}px)`,
										}}
									>
										<div
											style={{
												fontFamily: SANS,
												fontSize: 15,
												fontWeight: 700,
												letterSpacing: 2,
												color: '#D4AF37',
												textTransform: 'uppercase',
											}}
										>
											{item.title}
										</div>
										<div
											style={{
												fontFamily: SERIF,
												fontSize: 24,
												fontStyle: 'italic',
												color: '#FFFFFF',
												marginTop: 4,
											}}
										>
											{item.sub}
										</div>
									</div>
								);
							})}
						</div>

						{/* BOTÃO CALL TO ACTION (CTA) MINIMALISTA DE LUXO */}
						<div
							style={{
								marginTop: 50,
								width: 840,
								opacity: ci(frame, [675, 705], [0, 1], E_IN),
								transform: `scale(${spring({
									frame: Math.max(0, frame - 675),
									fps,
									config: {damping: 14, stiffness: 120},
								})})`,
							}}
						>
							<div
								style={{
									width: '100%',
									padding: '28px 0',
									borderRadius: 999,
									background: 'linear-gradient(135deg, #FBE8A6 0%, #D4AF37 60%, #B8860B 100%)',
									color: '#07090E',
									fontFamily: SANS,
									fontSize: 26,
									fontWeight: 800,
									letterSpacing: 3,
									textAlign: 'center',
									textTransform: 'uppercase',
									boxShadow: '0 15px 45px rgba(212, 175, 55, 0.4), 0 0 30px rgba(212, 175, 55, 0.25)',
									position: 'relative',
									overflow: 'hidden',
								}}
							>
								<AnimosSheen
									atSecond={23.5}
									durationInSeconds={1.0}
									intensity={0.5}
									angle={105}
									color="255, 255, 255"
								/>
								TOQUE NO LINK DA BIO
							</div>

							<div
								style={{
									textAlign: 'center',
									marginTop: 18,
									fontFamily: SANS,
									fontSize: 15,
									fontWeight: 600,
									letterSpacing: 2,
									color: 'rgba(255, 255, 255, 0.7)',
									textTransform: 'uppercase',
								}}
							>
								Vagas Limitadas para o Clube • Agendamento Online
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
				bottom={105}
				fontSize={34}
				windowSize={4}
			/>
		</AbsoluteFill>
	);
};
