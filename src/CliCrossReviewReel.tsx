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
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';
import { AppleCameraRig } from './AppleCameraRig';
import { KineticWordCaption } from './KineticWordCaption';
import { AdversarialTerminal } from './demonstracoes/AdversarialTerminal';
import { GitHubStarHero } from './demonstracoes/GitHubStarHero';
import wordsData from './data/words.json';

const { fontFamily: fontAnton } = loadAnton();
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const CliCrossReviewReel: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	// ────────────────────────────────────────────────────────────────────────────
	// ATOS NARRATIVOS (Sincronizados com a Narração Whisper de 53s)
	// Ato 1: 0 - 140 frames (0.0s - 4.6s) -> "Você realmente confia no código..."
	// Ato 2: 140 - 405 frames (4.6s - 13.5s) -> "A maioria dos desenvolvedores aceita a primeira resposta... bugs"
	// Ato 3: 405 - 720 frames (13.5s - 24.0s) -> "Pra acabar com isso... cli cross review... 3 IAs debatendo"
	// Ato 4: 720 - 1134 frames (24.0s - 37.8s) -> "O primeiro programa, o segundo ataca... e o árbitro só aprova"
	// Ato 5: 1134 - 1420 frames (37.8s - 47.3s) -> "100% gratuito... Comenta SWARM..."
	// Ato 6: 1420 - 1600 frames (47.3s - 53.3s) -> "Deixa uma estrelinha lá no repositório..."
	// ────────────────────────────────────────────────────────────────────────────

	let headerText = 'VOCÊ CONFIA NA SUA IA?';
	let headerBadge = 'PERGUNTA';
	let headerBorder = '#FFE600';

	if (frame >= 140 && frame < 405) {
		headerText = 'BUGS EM PRODUÇÃO ❌';
		headerBadge = 'O PERIGO';
		headerBorder = '#EF4444';
	} else if (frame >= 405 && frame < 720) {
		headerText = 'CLI-CROSS-REVIEW ⚡';
		headerBadge = 'OPEN SOURCE';
		headerBorder = '#38BDF8';
	} else if (frame >= 720 && frame < 1134) {
		headerText = '3 IAs EM GUERRA ⚔️';
		headerBadge = 'TRIUNVIRATO';
		headerBorder = '#10B981';
	} else if (frame >= 1134 && frame < 1420) {
		headerText = 'DIGITE "SWARM" 👇';
		headerBadge = 'LINK NO DIRECT';
		headerBorder = '#FFE600';
	} else if (frame >= 1420) {
		headerText = 'DEIXE UMA ⭐ NO GITHUB';
		headerBadge = 'APOIE O PROJETO';
		headerBorder = '#F59E0B';
	}

	// Mola do Header para transições impactantes
	const headerSpring = spring({
		frame: frame % 150,
		fps,
		config: { damping: 14, mass: 0.4, stiffness: 180 },
	});

	// Transições de Fade entre cenas
	const avatarFadeOut = interpolate(frame, [380, 405], [1, 0], {
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

	// Notificação estilo iOS Direct para o Ato 5
	const showDirectNotification = frame >= 1150 && frame < 1420;
	const directNotifSpring = spring({
		frame: Math.max(0, frame - 1150),
		fps,
		config: { damping: 15, mass: 0.5, stiffness: 150 },
	});

	return (
		<AbsoluteFill style={{ background: '#050608', overflow: 'hidden' }}>
			{/* Áudio Oficial da Narração Neural sincronizada */}
			<Audio src={staticFile('audio/locucao/narracao_cli_review.mp3')} volume={1.0} />

			{/* ════════════════════════════════════════════════════════════════════
			    CENA 1: AVATAR DE GABRIEL (0 a 405 frames) com Apple Camera Rig
			    ════════════════════════════════════════════════════════════════════ */}
			{frame < 415 && (
				<AbsoluteFill style={{ opacity: avatarFadeOut }}>
					<AppleCameraRig pushInAmount={0.035} driftIntensity={0.8}>
						<div
							style={{
								width,
								height,
								position: 'relative',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<OffthreadVideo
								src={staticFile('video/avatar_hook_real.mp4')}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
							/>

							{/* Vinheta escura no topo e base para realçar títulos e legendas */}
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background:
										'linear-gradient(180deg, rgba(5,6,8,0.75) 0%, rgba(5,6,8,0.15) 30%, rgba(5,6,8,0.2) 65%, rgba(5,6,8,0.92) 100%)',
									pointerEvents: 'none',
								}}
							/>

							{/* Overlay de Caos / Bugs em Produção no Ato 2 (140 a 405 frames) */}
							{frame >= 140 && (
								<div
									style={{
										position: 'absolute',
										inset: 0,
										background: 'rgba(239, 68, 68, 0.12)',
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'center',
										alignItems: 'center',
										padding: 30,
										gap: 16,
									}}
								>
									<div
										style={{
											background: 'rgba(15, 17, 23, 0.92)',
											border: '1.5px solid #EF4444',
											borderRadius: 16,
											padding: '16px 24px',
											boxShadow: '0 20px 50px rgba(239, 68, 68, 0.35)',
											maxWidth: 600,
											fontFamily: fontMono,
											fontSize: 13,
											color: '#FCA5A5',
											lineHeight: 1.6,
										}}
									>
										<div style={{ color: '#EF4444', fontWeight: 800, marginBottom: 6 }}>
											🚨 [FATAL ERROR] 500 Internal Server Error
										</div>
										<div>TypeError: Cannot read properties of undefined (reading 'customer_id')</div>
										<div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4 }}>
											at processOrder (/app/api/checkout.ts:89:14)
										</div>
									</div>

									<div
										style={{
											background: 'rgba(15, 17, 23, 0.92)',
											border: '1.5px solid #EF4444',
											borderRadius: 16,
											padding: '16px 24px',
											boxShadow: '0 20px 50px rgba(239, 68, 68, 0.35)',
											maxWidth: 600,
											fontFamily: fontMono,
											fontSize: 13,
											color: '#FCA5A5',
											lineHeight: 1.6,
										}}
									>
										<div style={{ color: '#EF4444', fontWeight: 800, marginBottom: 6 }}>
											⚡ [ALUCINAÇÃO DETECTADA]
										</div>
										<div>A IA inventou um parâmetro que não existe na API em produção!</div>
									</div>
								</div>
							)}
						</div>
					</AppleCameraRig>
				</AbsoluteFill>
			)}

			{/* ════════════════════════════════════════════════════════════════════
			    CENA 2: O CAMPO DE BATALHA ADVERSARIAL (405 a 1134 frames)
			    ════════════════════════════════════════════════════════════════════ */}
			{frame >= 395 && frame < 1140 && (
				<AbsoluteFill
					style={{
						opacity: terminalFadeIn * terminalFadeOut,
					}}
				>
					{/* Grid de fundo sutil */}
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundImage:
								'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.15) 0%, transparent 65%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
							backgroundSize: '100% 100%, 40px 40px, 40px 40px',
						}}
					/>

					<AppleCameraRig
						pushInAmount={0.03}
						driftIntensity={0.35}
						mode="ui"
					>
						<div
							style={{
								width: '100%',
								height: '100%',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<div
								style={{
									transform: 'perspective(1200px) rotateX(3deg) scale(1.06)',
								}}
							>
								<AdversarialTerminal />
							</div>
						</div>
					</AppleCameraRig>
				</AbsoluteFill>
			)}

			{/* ════════════════════════════════════════════════════════════════════
			    CENA 3: FUNIL DE CONVERSÃO DE ESTRELAS ⭐ (1130 a 1600 frames)
			    ════════════════════════════════════════════════════════════════════ */}
			{frame >= 1125 && (
				<AbsoluteFill
					style={{
						opacity: starFadeIn,
					}}
				>
					{/* Glow Dourado de Fundo */}
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundImage:
								'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.22) 0%, transparent 65%)',
						}}
					/>

					<AppleCameraRig
						pushInAmount={0.03}
						driftIntensity={0.35}
						mode="ui"
					>
						<div
							style={{
								width: '100%',
								height: '100%',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<div
								style={{
									transform: 'perspective(1200px) rotateX(2.5deg) scale(1.06)',
								}}
							>
								<GitHubStarHero
									repoName="cli-cross-review"
									installCommand="$ npx cli-cross-review --adversarial"
									ctaWord="SWARM"
									ctaSubtitle="Para receber o link do repositório no seu Direct!"
									initialStars={1481}
								/>
							</div>
						</div>
					</AppleCameraRig>
				</AbsoluteFill>
			)}

			{/* ════════════════════════════════════════════════════════════════════
			    NOTIFICAÇÃO SUSPENSA ESTILO IOS (DIRECT ENVIADO) - Ato 5
			    ════════════════════════════════════════════════════════════════════ */}
			{showDirectNotification && (
				<div
					style={{
						position: 'absolute',
						top: 280,
						left: 0,
						right: 0,
						display: 'flex',
						justifyContent: 'center',
						zIndex: 75,
						opacity: directNotifSpring,
						transform: `translateY(${(1 - directNotifSpring) * -30}px)`,
					}}
				>
					<div
						style={{
							background: 'rgba(18, 20, 26, 0.95)',
							border: '1.5px solid rgba(255, 255, 255, 0.15)',
							borderRadius: 20,
							padding: '14px 22px',
							display: 'flex',
							alignItems: 'center',
							gap: 14,
							boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.25)',
							maxWidth: 580,
						}}
					>
						<div
							style={{
								width: 44,
								height: 44,
								borderRadius: '50%',
								background: 'linear-gradient(135deg, #FF0080, #7928CA)',
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								fontSize: 22,
							}}
						>
							✉️
						</div>
						<div>
							<div style={{ fontFamily: fontPlusJakartaSans, fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
								Instagram Direct • Gabriel Toledo
							</div>
							<div style={{ fontFamily: fontMono, fontSize: 12, color: '#38BDF8', marginTop: 2 }}>
								"Aqui está o link: github.com/Gabrielrtads/cli-cross-review"
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ════════════════════════════════════════════════════════════════════
			    HEADER RETRÔ / 8-BIT PIXEL AMARELO (Inspiração: Rourke Sefton-Minns)
			    ════════════════════════════════════════════════════════════════════ */}
			<div
				style={{
					position: 'absolute',
					top: 130,
					left: 0,
					right: 0,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					zIndex: 85,
					pointerEvents: 'none',
				}}
			>
				{/* Badge Superior */}
				<div
					style={{
						background: 'rgba(0, 0, 0, 0.85)',
						border: `1.5px solid ${headerBorder}`,
						borderRadius: 999,
						padding: '4px 14px',
						fontFamily: fontMono,
						fontSize: 11,
						fontWeight: 800,
						color: headerBorder,
						letterSpacing: '0.08em',
						marginBottom: 8,
						boxShadow: '0 6px 16px rgba(0,0,0,0.6)',
					}}
				>
					{headerBadge}
				</div>

				{/* Caixa Retrô Pixel Amarela */}
				<div
					style={{
						background: '#000000',
						border: `2.5px solid ${headerBorder}`,
						borderRadius: 14,
						padding: '12px 28px',
						boxShadow: `0 15px 40px rgba(0, 0, 0, 0.9), 0 0 25px ${headerBorder}40`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						transform: `scale(${interpolate(headerSpring, [0, 1], [0.98, 1])})`,
					}}
				>
					<span
						style={{
							fontFamily: fontAnton,
							fontSize: 38,
							color: headerBorder,
							letterSpacing: '0.04em',
							lineHeight: 1,
							textShadow: '3px 3px 0px #000000',
							textAlign: 'center',
						}}
					>
						{headerText}
					</span>
				</div>
			</div>

			{/* ════════════════════════════════════════════════════════════════════
			    LEGENDAS CINÉTICAS PALAVRA POR PALAVRA (Whisper Sync)
			    ════════════════════════════════════════════════════════════════════ */}
			<KineticWordCaption
				words={wordsData as any}
				preset="gold-glow"
				windowSize={4}
				fontSize={34}
				bottom={140}
			/>
		</AbsoluteFill>
	);
};
