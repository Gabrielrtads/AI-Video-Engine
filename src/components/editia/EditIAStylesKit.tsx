import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
	Video,
} from 'remotion';
import {MONO, SANS, SERIF} from '../../kit';
import {
	EDITIA_PALETTES,
	EDITIA_STYLE_COMMANDS,
	generateDeterministicWaveformBars,
	generateSpellcheckWavePath,
	matchOneSentenceStyleRequest,
} from '../../timeline/editiaStylesMath';

export {
	EDITIA_PALETTES,
	EDITIA_STYLE_COMMANDS,
	generateDeterministicWaveformBars,
	generateSpellcheckWavePath,
	matchOneSentenceStyleRequest,
};

// ────────────────────────────────────────────────────────────────────────────
// 1. BIG HOOK TOP BANNER (e02-gancho: Gancho 3 Linhas + Onda de Erro SVG)
// ────────────────────────────────────────────────────────────────────────────
export interface BigHookTopBannerProps {
	lines?: [string, string, string];
	errorWords?: [string, string];
	switchFrame?: number;
	videoSrc?: string;
	foregroundNode?: React.ReactNode;
}

export const BigHookTopBanner: React.FC<BigHookTopBannerProps> = ({
	lines = ['EU GRAVEI', 'ESSE VÍDEO', 'UMA VEZ SÓ'],
	errorWords = ['ERREI', 'GAGUEJEI'],
	switchFrame = 45,
	videoSrc,
	foregroundNode,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const isErrorPhase = frame >= switchFrame;
	const localFrame = isErrorPhase ? frame - switchFrame : frame;

	// Acendimento progressivo por linha nos primeiros frames
	const activeLineIndex = Math.floor(
		interpolate(frame, [0, Math.max(10, switchFrame - 8)], [0, 2.99], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		})
	);

	const popScale = spring({
		frame: localFrame,
		fps,
		config: {damping: 14, stiffness: 200, mass: 0.7},
	});

	const wave1 = generateSpellcheckWavePath(340, 10, 22, 5.5);
	const wave2 = generateSpellcheckWavePath(560, 10, 22, 5.5);
	const waveProgress = interpolate(localFrame, [4, 24], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{backgroundColor: EDITIA_PALETTES.ganchoTopo.bg, overflow: 'hidden'}}>
			{/* Camada Z=1: Rim Glow Púrpura de Estúdio */}
			<div
				style={{
					position: 'absolute',
					top: 120,
					left: -120,
					width: 720,
					height: 980,
					borderRadius: '50%',
					background: `radial-gradient(circle, rgba(168,47,252,0.42) 0%, rgba(18,13,24,0) 70%)`,
					zIndex: 1,
				}}
			/>

			{/* Camada Z=2: Gancho Tipográfico no Terço Superior (Oclusão sutil de 15% pela aba/topo do boné) */}
			<div
				style={{
					position: 'absolute',
					top: isErrorPhase ? 250 : 345,
					left: 0,
					right: 0,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					transform: `scale(${0.92 + popScale * 0.08})`,
					zIndex: 2,
				}}
			>
				{!isErrorPhase ? (
					lines.map((lineText, idx) => {
						const isSpoken = idx <= activeLineIndex;
						return (
							<div
								key={idx}
								style={{
									fontFamily: SANS,
									fontWeight: 900,
									fontSize: idx === 0 ? 104 : 108,
									lineHeight: 1.02,
									letterSpacing: '-0.03em',
									textTransform: 'uppercase',
									color: isSpoken
										? EDITIA_PALETTES.ganchoTopo.wordActive
										: EDITIA_PALETTES.ganchoTopo.wordFuture,
									opacity: isSpoken ? 1 : 0.58,
									textShadow: isSpoken ? '0 10px 32px rgba(0,0,0,0.65)' : 'none',
								}}
							>
								{lineText}
							</div>
						);
					})
				) : (
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
						{/* Palavra 1 + Onda de Erro */}
						<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
							<div
								style={{
									fontFamily: SANS,
									fontWeight: 900,
									fontSize: 116,
									lineHeight: 0.98,
									letterSpacing: '-0.03em',
									color: '#FFFFFF',
									textTransform: 'uppercase',
								}}
							>
								{errorWords[0]}
							</div>
							<svg width={340} height={22} style={{marginTop: -4, overflow: 'visible'}}>
								<path
									d={wave1.path}
									fill="none"
									stroke={EDITIA_PALETTES.ganchoTopo.errorWave}
									strokeWidth={5}
									strokeLinecap="round"
									strokeDasharray={wave1.approximateLength}
									strokeDashoffset={wave1.approximateLength * waveProgress}
								/>
							</svg>
						</div>

						{/* Palavra 2 + Onda de Erro */}
						<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
							<div
								style={{
									fontFamily: SANS,
									fontWeight: 900,
									fontSize: 112,
									lineHeight: 0.98,
									letterSpacing: '-0.03em',
									color: '#FFFFFF',
									textTransform: 'uppercase',
								}}
							>
								{errorWords[1]}
							</div>
							<svg width={560} height={22} style={{marginTop: -4, overflow: 'visible'}}>
								<path
									d={wave2.path}
									fill="none"
									stroke={EDITIA_PALETTES.ganchoTopo.errorWave}
									strokeWidth={5}
									strokeLinecap="round"
									strokeDasharray={wave2.approximateLength}
									strokeDashoffset={wave2.approximateLength * waveProgress}
								/>
							</svg>
						</div>
					</div>
				)}
			</div>

			{/* Camada Z=3: Apresentador Recortado (Rotoscopia sobrepondo a base da 3ª linha) */}
			<div
				style={{
					position: 'absolute',
					left: 36,
					right: 0,
					bottom: -90,
					height: 1840,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'flex-end',
					transform: 'scale(1.08)',
					transformOrigin: 'bottom center',
					zIndex: 3,
					pointerEvents: 'none',
				}}
			>
				{foregroundNode ? (
					foregroundNode
				) : videoSrc ? (
					<Video
						src={staticFile(videoSrc)}
						muted
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						}}
					/>
				) : null}
			</div>
		</AbsoluteFill>
	);
};

// ────────────────────────────────────────────────────────────────────────────
// 2. ORBIT SPLIT SCREEN STAGE (e12-tela-dividida: 50/50 + Mural em Órbita)
// ────────────────────────────────────────────────────────────────────────────
export interface OrbitCardSpec {
	kicker?: string;
	highlight: string;
	footer?: string;
	x: number;
	y: number;
	rotateDeg: number;
	delayFrames: number;
}

export interface OrbitSplitScreenStageProps {
	topTitle?: string;
	captionPrefix?: string;
	captionHighlight?: string;
	captionSuffix?: string;
	topVideoSrc?: string;
	bottomVideoSrc?: string;
	cards?: OrbitCardSpec[];
}

const DEFAULT_ORBIT_CARDS: OrbitCardSpec[] = [
	{
		kicker: 'o Claude monta um',
		highlight: 'MURAL',
		footer: 'de frases',
		x: 46,
		y: 128,
		rotateDeg: -3.2,
		delayFrames: 4,
	},
	{
		kicker: 'tira as',
		highlight: 'pausas',
		footer: '||||||||  ||||  ||||',
		x: 560,
		y: 124,
		rotateDeg: 2.5,
		delayFrames: 10,
	},
	{
		kicker: 'fica com a',
		highlight: 'melhor',
		footer: 'tomada.',
		x: 610,
		y: 390,
		rotateDeg: -2.1,
		delayFrames: 16,
	},
];

export const OrbitSplitScreenStage: React.FC<OrbitSplitScreenStageProps> = ({
	topTitle = 'ÓRBITA',
	captionPrefix = 'e coloca eles ',
	captionHighlight = 'em volta',
	captionSuffix = ' de mim',
	topVideoSrc,
	bottomVideoSrc,
	cards = DEFAULT_ORBIT_CARDS,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: '#121212', overflow: 'hidden'}}>
			{/* Metade Superior (0..960px): Contexto + Órbita de Cards */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: 1080,
					height: 960,
					background: 'linear-gradient(180deg, #1E1D1B 0%, #2B2823 100%)',
					overflow: 'hidden',
				}}
			>
				{topVideoSrc && (
					<Video
						src={staticFile(topVideoSrc)}
						muted
						style={{
							position: 'absolute',
							bottom: -180,
							left: 0,
							width: '100%',
							height: 1140,
							objectFit: 'cover',
							zIndex: 2,
						}}
					/>
				)}

				{/* Título Laranja de Topo (opcional se não estiver vazio) */}
				{topTitle ? (
					<div
						style={{
							position: 'absolute',
							top: 96,
							left: 0,
							right: 0,
							textAlign: 'center',
							fontFamily: SANS,
							fontWeight: 900,
							fontSize: 64,
							letterSpacing: '-0.02em',
							color: EDITIA_PALETTES.orbitaSplit.accentOrange,
							zIndex: 1,
						}}
					>
						{topTitle}
					</div>
				) : null}

				{/* Cards Flutuantes em Órbita */}
				{cards.map((card, idx) => {
					const s = spring({
						frame: Math.max(0, frame - card.delayFrames),
						fps,
						config: {damping: 13, stiffness: 170, mass: 0.8},
					});
					const floatY = Math.sin((frame + idx * 18) * 0.08) * 6;
					return (
						<div
							key={idx}
							style={{
								position: 'absolute',
								left: card.x,
								top: card.y + floatY,
								width: 420,
								padding: '22px 26px',
								borderRadius: 22,
								backgroundColor: EDITIA_PALETTES.orbitaSplit.cardBg,
								boxShadow: '0 22px 48px rgba(0,0,0,0.42)',
								transform: `scale(${s}) rotate(${card.rotateDeg}deg)`,
								zIndex: idx === 0 ? 1 : 3,
							}}
						>
							{card.kicker && (
								<div
									style={{
										fontFamily: SERIF,
										fontStyle: 'italic',
										fontSize: 30,
										color: '#3A3834',
										marginBottom: 4,
									}}
								>
									{card.kicker}
								</div>
							)}
							<div
								style={{
									display: 'inline-block',
									padding: idx === 0 ? '4px 14px' : '2px 10px',
									backgroundColor:
										idx === 0
											? EDITIA_PALETTES.orbitaSplit.accentOrange
											: 'rgba(255, 107, 43, 0.22)',
									fontFamily: SANS,
									fontWeight: 900,
									fontSize: idx === 0 ? 64 : 52,
									lineHeight: 1.05,
									color: EDITIA_PALETTES.orbitaSplit.cardText,
									textTransform: idx === 0 ? 'uppercase' : 'none',
								}}
							>
								{card.highlight}
							</div>
							{card.footer && (
								<div
									style={{
										fontFamily: SERIF,
										fontSize: 30,
										color: '#4B4842',
										marginTop: 6,
									}}
								>
									{card.footer}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Metade Inferior (960..1920px): Câmera de Reação */}
			<div
				style={{
					position: 'absolute',
					top: 960,
					left: 0,
					width: 1080,
					height: 960,
					background: 'linear-gradient(180deg, #C7B293 0%, #8F7A5E 100%)',
					overflow: 'hidden',
				}}
			>
				{/* Quadro decorativo de fundo da reação */}
				<div
					style={{
						position: 'absolute',
						top: 110,
						left: 140,
						width: 680,
						height: 420,
						borderRadius: 8,
						border: '10px solid #2B2623',
						background: 'linear-gradient(135deg, #3D5A80 0%, #E07A5F 55%, #F2CC8F 100%)',
						opacity: 0.85,
					}}
				/>
				{bottomVideoSrc && (
					<Video
						src={staticFile(bottomVideoSrc)}
						muted
						style={{
							position: 'absolute',
							bottom: -120,
							left: 0,
							width: '100%',
							height: 1080,
							objectFit: 'cover',
						}}
					/>
				)}
			</div>

			{/* Costura Divisória Preta Sólida Exata (Y = 960px, 8px) */}
			<div
				style={{
					position: 'absolute',
					top: 956,
					left: 0,
					width: 1080,
					height: 8,
					backgroundColor: EDITIA_PALETTES.orbitaSplit.seamBlack,
					zIndex: 10,
				}}
			/>

			{/* Legenda Cravada na Costura Central (Y = 960px) */}
			<div
				style={{
					position: 'absolute',
					top: 912,
					left: 0,
					width: 1080,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					zIndex: 15,
				}}
			>
				<div
					style={{
						fontFamily: SANS,
						fontWeight: 900,
						fontSize: 64,
						letterSpacing: '-0.03em',
						color: '#FFFFFF',
						WebkitTextStroke: '12px #000000',
						paintOrder: 'stroke fill',
						textShadow: '0 8px 24px rgba(0,0,0,0.65)',
					}}
				>
					<span>{captionPrefix}</span>
					<span style={{color: EDITIA_PALETTES.orbitaSplit.accentOrange}}>{captionHighlight}</span>
					<span>{captionSuffix}</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ────────────────────────────────────────────────────────────────────────────
// 3. MAGAZINE COVER STAGE (e13-revista: Capa de Revista Editorial GQ/Vogue)
// ────────────────────────────────────────────────────────────────────────────
export interface MagazineCoverStageProps {
	masthead?: string;
	kickerTop?: string;
	kickerHeadline?: string;
	issueLine?: string;
	pillCaption?: string;
	solidGreenBackdrop?: boolean;
	videoSrc?: string;
	foregroundNode?: React.ReactNode;
}

export const MagazineCoverStage: React.FC<MagazineCoverStageProps> = ({
	masthead = 'CLAUDE',
	kickerTop = 'UMA FRASE',
	kickerHeadline = 'O vídeo inteiro,\neditado.',
	issueLine = 'Nº 01  ·  OUTUBRO 2026  ·  EDITADO PELO CLAUDE',
	pillCaption = 'vira capa de revista.',
	solidGreenBackdrop = true,
	videoSrc,
	foregroundNode,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const titleRise = spring({
		frame,
		fps,
		config: {damping: 18, stiffness: 120, mass: 0.9},
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: solidGreenBackdrop
					? EDITIA_PALETTES.capaRevista.editorialGreen
					: '#232B24',
				overflow: 'hidden',
			}}
		>
			{/* Camada Z=0: Textura Editorial e Vinheta Suave */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: solidGreenBackdrop
						? 'radial-gradient(circle at 50% 35%, rgba(44, 94, 67, 0.55) 0%, rgba(26, 60, 42, 1) 75%)'
						: 'linear-gradient(180deg, rgba(26,60,42,0.55) 0%, rgba(15,31,23,0.88) 100%)',
					zIndex: 0,
				}}
			/>

			{/* Camada Z=1: Masthead Editorial Colossal (230px) ATRÁS da Cabeça do Apresentador */}
			<div
				style={{
					position: 'absolute',
					top: 495,
					left: 0,
					right: 0,
					textAlign: 'center',
					fontFamily: SERIF,
					fontWeight: 400,
					fontSize: 236,
					lineHeight: 0.88,
					letterSpacing: '-0.02em',
					color: EDITIA_PALETTES.capaRevista.ivoryCream,
					transform: `translateY(${(1 - titleRise) * 40}px)`,
					opacity: interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'}),
					zIndex: 1,
					userSelect: 'none',
				}}
			>
				{masthead}
			</div>

			{/* Camada Z=2: Apresentador Recortado (Rotoscopia sobrepondo parcialmente o Masthead) */}
			<div
				style={{
					position: 'absolute',
					left: 36,
					right: 0,
					bottom: -90,
					height: 1850,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'flex-end',
					transform: 'scale(1.1)',
					transformOrigin: 'bottom center',
					zIndex: 2,
					pointerEvents: 'none',
				}}
			>
				{foregroundNode ? (
					foregroundNode
				) : videoSrc ? (
					<Video
						src={staticFile(videoSrc)}
						muted
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
						}}
					/>
				) : null}
			</div>

			{/* Camada Z=3: Moldura Retangular Inset 48px + Kicker + Faixa Monospace + Barcode + Pílula */}
			<div
				style={{
					position: 'absolute',
					top: 48,
					right: 48,
					bottom: 48,
					left: 48,
					border: `2px solid ${EDITIA_PALETTES.capaRevista.champagneBorder}`,
					zIndex: 3,
					pointerEvents: 'none',
				}}
			>
				{/* Kicker Editorial Superior Esquerdo */}
				<div style={{position: 'absolute', top: 44, left: 48}}>
					<div
						style={{
							fontFamily: MONO,
							fontSize: 19,
							letterSpacing: '0.22em',
							color: EDITIA_PALETTES.capaRevista.champagneBorder,
							textTransform: 'uppercase',
							marginBottom: 10,
						}}
					>
						{kickerTop}
					</div>
					<div
						style={{
							fontFamily: SERIF,
							fontSize: 42,
							lineHeight: 1.05,
							color: EDITIA_PALETTES.capaRevista.ivoryCream,
							whiteSpace: 'pre-line',
						}}
					>
						{kickerHeadline}
					</div>
				</div>

				{/* Faixa de Edição e Data em Monospace Espaçada */}
				<div
					style={{
						position: 'absolute',
						top: 195,
						left: 48,
						right: 48,
						fontFamily: MONO,
						fontSize: 20,
						letterSpacing: '0.24em',
						color: EDITIA_PALETTES.capaRevista.ivoryCream,
						textTransform: 'uppercase',
						opacity: 0.9,
					}}
				>
					{issueLine}
				</div>

				{/* Código de Barras Vetorial no Canto Inferior Esquerdo da Moldura */}
				<div
					style={{
						position: 'absolute',
						bottom: 42,
						left: 48,
						backgroundColor: EDITIA_PALETTES.capaRevista.ivoryCream,
						padding: '10px 14px',
						borderRadius: 4,
					}}
				>
					<svg width={132} height={54} viewBox="0 0 132 54">
						{[
							2, 6, 12, 16, 24, 28, 34, 42, 46, 52, 60, 64, 70, 78, 84, 88, 96, 102, 108, 114, 122,
							126,
						].map((x, idx) => (
							<rect
								key={idx}
								x={x}
								y={2}
								width={idx % 3 === 0 ? 4 : 2}
								height={40}
								fill="#141413"
							/>
						))}
						<text
							x={66}
							y={51}
							textAnchor="middle"
							fontFamily={MONO}
							fontSize={9}
							fill="#141413"
							letterSpacing={2}
						>
							9 772026 100018
						</text>
					</svg>
				</div>
			</div>

			{/* Legenda em Pílula Retangular na Altura do Peito (Y = 1320px) */}
			<div
				style={{
					position: 'absolute',
					top: 1320,
					left: 0,
					width: 1080,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					zIndex: 4,
				}}
			>
				<div
					style={{
						backgroundColor: EDITIA_PALETTES.capaRevista.editorialGreen,
						border: `2px solid ${EDITIA_PALETTES.capaRevista.ivoryCream}`,
						padding: '14px 36px',
						boxShadow: '0 14px 36px rgba(0,0,0,0.45)',
					}}
				>
					<span
						style={{
							fontFamily: SERIF,
							fontSize: 56,
							color: EDITIA_PALETTES.capaRevista.ivoryCream,
							letterSpacing: '0.01em',
						}}
					>
						{pillCaption}
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ────────────────────────────────────────────────────────────────────────────
// 4. AUDIO WAVEFORM CUT STAGE (e14-motion-explicativo: Onda Cortada Dark UI)
// ────────────────────────────────────────────────────────────────────────────
export interface AudioWaveformCutStageProps {
	fileName?: string;
	durationLabel?: string;
	scanStartFrame?: number;
}

export const AudioWaveformCutStage: React.FC<AudioWaveformCutStageProps> = ({
	fileName = 'bruto.mov',
	durationLabel = '2:03',
	scanStartFrame = 35,
}) => {
	const frame = useCurrentFrame();
	const bars = React.useMemo(() => generateDeterministicWaveformBars(56), []);

	const isEditing = frame >= scanStartFrame;
	const scanProgress = interpolate(frame, [scanStartFrame, scanStartFrame + 45], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const annotationsOpacity = interpolate(
		frame,
		[5, 16, scanStartFrame - 4, scanStartFrame + 8],
		[0, 1, 1, 0.15],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: EDITIA_PALETTES.ondaAudio.obsidianBg,
				overflow: 'hidden',
			}}
		>
			{/* Grade de Perspectiva 3D Âmbar no Terço Inferior */}
			<div
				style={{
					position: 'absolute',
					bottom: -120,
					left: -200,
					right: -200,
					height: 760,
					backgroundImage: `
						linear-gradient(to right, ${EDITIA_PALETTES.ondaAudio.gridLine} 2px, transparent 2px),
						linear-gradient(to bottom, ${EDITIA_PALETTES.ondaAudio.gridLine} 2px, transparent 2px)
					`,
					backgroundSize: '120px 90px',
					transform: 'perspective(520px) rotateX(62deg)',
					opacity: 0.75,
				}}
			/>

			{/* Badge Superior: PASSO 2 -> ● EDITANDO */}
			<div
				style={{
					position: 'absolute',
					top: 240,
					left: 0,
					right: 0,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					gap: 14,
				}}
			>
				{isEditing && (
					<div
						style={{
							width: 16,
							height: 16,
							borderRadius: '50%',
							backgroundColor: EDITIA_PALETTES.ondaAudio.annotationRed,
							boxShadow: '0 0 18px #FF4D4D',
						}}
					/>
				)}
				<span
					style={{
						fontFamily: MONO,
						fontWeight: 700,
						fontSize: 28,
						letterSpacing: '0.26em',
						color: EDITIA_PALETTES.ondaAudio.barActive,
						textTransform: 'uppercase',
					}}
				>
					{isEditing ? 'EDITANDO' : 'PASSO 2'}
				</span>
			</div>

			{/* Card Superior: VOCÊ MANDA bruto.mov */}
			<div
				style={{
					position: 'absolute',
					top: 330,
					left: 68,
					right: 68,
					padding: '28px 34px',
					borderRadius: 24,
					backgroundColor: EDITIA_PALETTES.ondaAudio.cardDark,
					border: `2px solid ${EDITIA_PALETTES.ondaAudio.cardBorder}`,
					boxShadow: '0 20px 60px rgba(0,0,0,0.65)',
					opacity: isEditing ? 0.45 : 1,
				}}
			>
				<div
					style={{
						fontFamily: MONO,
						fontSize: 22,
						letterSpacing: '0.2em',
						color: '#9E9689',
						marginBottom: 18,
					}}
				>
					VOCÊ MANDA
				</div>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 24,
						padding: '18px 24px',
						borderRadius: 18,
						backgroundColor: '#211D19',
						border: '1px solid #3A322B',
					}}
				>
					<div
						style={{
							width: 78,
							height: 78,
							borderRadius: 14,
							background: 'linear-gradient(135deg, #FF6B2B 0%, #7C2D12 100%)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontFamily: MONO,
							fontWeight: 800,
							fontSize: 22,
							color: '#FFF',
						}}
					>
						MOV
					</div>
					<div>
						<div style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, color: '#FFFFFF'}}>
							{fileName}
						</div>
						<div style={{fontFamily: SANS, fontSize: 26, color: '#9E9689', marginTop: 4}}>
							{durationLabel} · do jeito que gravou
						</div>
					</div>
				</div>
			</div>

			{/* Anotações Manuscritas Vermelhas (erro / gaguejada / pausa) + Setas Curvas */}
			<div style={{position: 'absolute', inset: 0, opacity: annotationsOpacity, zIndex: 8}}>
				{/* Rótulo: erro */}
				<div
					style={{
						position: 'absolute',
						top: 615,
						left: 138,
						fontFamily: SERIF,
						fontStyle: 'italic',
						fontWeight: 700,
						fontSize: 54,
						color: EDITIA_PALETTES.ondaAudio.annotationRed,
					}}
				>
					erro
				</div>
				{/* Rótulo: gaguejada */}
				<div
					style={{
						position: 'absolute',
						top: 605,
						left: 365,
						fontFamily: SERIF,
						fontStyle: 'italic',
						fontWeight: 700,
						fontSize: 54,
						color: EDITIA_PALETTES.ondaAudio.annotationRed,
					}}
				>
					gaguejada
				</div>
				{/* Rótulo: pausa */}
				<div
					style={{
						position: 'absolute',
						top: 1090,
						left: 425,
						fontFamily: SERIF,
						fontStyle: 'italic',
						fontWeight: 700,
						fontSize: 54,
						color: EDITIA_PALETTES.ondaAudio.annotationRed,
					}}
				>
					pausa
				</div>

				{/* Setas Curvas SVG */}
				<svg
					width={1080}
					height={1920}
					style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
				>
					{/* Seta erro */}
					<path
						d="M 180 680 Q 210 740, 212 805"
						fill="none"
						stroke="#FF4D4D"
						strokeWidth={5}
						strokeLinecap="round"
					/>
					<path
						d="M 200 792 L 212 808 L 225 790"
						fill="none"
						stroke="#FF4D4D"
						strokeWidth={5}
						strokeLinecap="round"
					/>

					{/* Seta gaguejada */}
					<path
						d="M 410 680 Q 435 745, 422 812"
						fill="none"
						stroke="#FF4D4D"
						strokeWidth={5}
						strokeLinecap="round"
					/>
					<path
						d="M 408 796 L 422 815 L 436 798"
						fill="none"
						stroke="#FF4D4D"
						strokeWidth={5}
						strokeLinecap="round"
					/>

					{/* Seta pausa (de baixo para o vale central) */}
					<path
						d="M 505 1075 Q 525 1015, 502 955"
						fill="none"
						stroke="#FF4D4D"
						strokeWidth={5}
						strokeLinecap="round"
					/>
					<path
						d="M 490 970 L 500 950 L 518 965"
						fill="none"
						stroke="#FF4D4D"
						strokeWidth={5}
						strokeLinecap="round"
					/>
				</svg>
			</div>

			{/* Monitor Central de Forma de Onda (GRAVAÇÃO | 2:03) */}
			<div
				style={{
					position: 'absolute',
					top: 700,
					left: 36,
					right: 36,
					height: 360,
					borderRadius: 26,
					backgroundColor: EDITIA_PALETTES.ondaAudio.cardDark,
					border: `2px solid ${EDITIA_PALETTES.ondaAudio.cardBorder}`,
					boxShadow: '0 24px 80px rgba(255, 107, 43, 0.12)',
					padding: '26px 36px',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
				}}
			>
				{/* Header do Monitor */}
				<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
					<span
						style={{
							fontFamily: MONO,
							fontWeight: 700,
							fontSize: 24,
							letterSpacing: '0.2em',
							color: '#9E9689',
						}}
					>
						GRAVAÇÃO
					</span>
					<span
						style={{
							fontFamily: SANS,
							fontWeight: 900,
							fontSize: 44,
							color: '#FFFFFF',
						}}
					>
						{durationLabel}
					</span>
				</div>

				{/* Barras da Forma de Onda + Agulha Scanner Laranja */}
				<div
					style={{
						position: 'relative',
						height: 220,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 6,
					}}
				>
					{bars.map((bar) => {
						const barNorm = bar.index / Math.max(1, bars.length - 1);
						const isScanned = isEditing && barNorm <= scanProgress;
						const isDefect = bar.kind === 'error' || bar.kind === 'stutter' || bar.kind === 'pause';

						let barColor: string = EDITIA_PALETTES.ondaAudio.barIdle;
						if (isScanned) {
							barColor = isDefect
								? EDITIA_PALETTES.ondaAudio.annotationRed
								: EDITIA_PALETTES.ondaAudio.barActive;
						}

						const heightPx = Math.max(14, Math.round(bar.heightRatio * 200));

						return (
							<div
								key={bar.index}
								style={{
									flex: 1,
									height: heightPx,
									borderRadius: 6,
									backgroundColor: barColor,
									opacity: isScanned && bar.kind === 'pause' ? 0.35 : 0.95,
									transition: 'height 0.1s ease',
								}}
							/>
						);
					})}

					{/* Agulha Playhead Scanner */}
					{isEditing && (
						<div
							style={{
								position: 'absolute',
								top: -12,
								bottom: -12,
								left: `${scanProgress * 100}%`,
								width: 4,
								backgroundColor: EDITIA_PALETTES.ondaAudio.barActive,
								boxShadow: '0 0 20px #FF6B2B',
							}}
						/>
					)}
				</div>
			</div>

			{/* Legenda Inferior Clean com Palavra Laranja */}
			<div
				style={{
					position: 'absolute',
					bottom: 390,
					left: 0,
					right: 0,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 800,
					fontSize: 56,
					letterSpacing: '-0.02em',
					color: '#FFFFFF',
				}}
			>
				{!isEditing ? (
					<>
						<span>com </span>
						<span style={{color: EDITIA_PALETTES.ondaAudio.barActive}}>pausa</span>
						<span> no meio</span>
					</>
				) : (
					<>
						<span>palavra que </span>
						<span style={{color: EDITIA_PALETTES.ondaAudio.barActive}}>você</span>
						<span> errou</span>
					</>
				)}
			</div>
		</AbsoluteFill>
	);
};
