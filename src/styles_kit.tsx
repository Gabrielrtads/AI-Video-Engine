import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ci, E_IN, E_IO, E_OUT, lerp, MONO, SANS, SERIF, AutoImpactTrack} from './kit';
export * from './PBRStage3D';
export * from './KineticWordCaption';

// ════════════════════════════════════════════════════════════════════════════
// 1. ESTILO TIPOGRAFIA CINÉTICA SUÍÇA (SWISS KINETIC)
// ════════════════════════════════════════════════════════════════════════════

export interface SwissHeadlineProps {
	text: string;
	italicWord?: string;
	delay?: number;
	duration?: number;
	size?: number;
	style?: React.CSSProperties;
}

export const SwissHeadline: React.FC<SwissHeadlineProps> = (props) => {
	const {text, italicWord, delay = 0, duration = 90, size = 110, style} = props;
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Revelação por máscara vertical
	const enterProgress = ci(frame, [delay, delay + 25], [0, 1], E_IN);
	const exitProgress = ci(frame, [duration - 15, duration], [0, 1], E_OUT);

	// Tracking dinâmico que expande sutilmente
	const tracking = lerp(-4, -1, enterProgress);
	const opacity = enterProgress * (1 - exitProgress);
	const translateY = (1 - enterProgress) * 60 + exitProgress * -40;

	const words = text.split(' ');

	return (
		<div
			style={{
				overflow: 'hidden',
				clipPath: 'inset(0 0 0 0)',
				padding: '20px 0',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'center',
					alignItems: 'center',
					gap: '0.22em',
					fontSize: size,
					lineHeight: 1.05,
					letterSpacing: tracking,
					color: '#F2F0EB',
					opacity,
					transform: `translateY(${translateY}px)`,
					fontFamily: SANS,
					fontWeight: 500,
					textAlign: 'center',
					padding: '0 40px',
					...style,
				}}
			>
				{words.map((w, i) => {
					const isItalic = italicWord && w.toLowerCase().includes(italicWord.toLowerCase());
					return (
						<span
							key={i}
							style={{
								fontFamily: isItalic ? SERIF : SANS,
								fontStyle: isItalic ? 'italic' : 'normal',
								fontWeight: isItalic ? 400 : 500,
								color: isItalic ? '#FFFFFF' : '#F2F0EB',
							}}
						>
							{w}
						</span>
					);
				})}
			</div>
		</div>
	);
};

// ════════════════════════════════════════════════════════════════════════════
// 2. ESTILO CONSOLE TÉCNICO & BLUEPRINT HUD
// ════════════════════════════════════════════════════════════════════════════

export interface TechConsoleHUDProps {
	title: string;
	codeSnippet: string;
	statusBadge?: string;
	width?: number;
	delay?: number;
	style?: React.CSSProperties;
}

export const TechConsoleHUD: React.FC<TechConsoleHUDProps> = (props) => {
	const {title, codeSnippet, statusBadge = 'DEPLOYED', width = 940, delay = 0, style} = props;
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const enter = spring({
		frame: Math.max(0, frame - delay),
		fps,
		config: {damping: 14, stiffness: 120},
	});

	// Efeito Typewriter usando string slicing
	const chars = Math.floor(ci(frame, [delay + 10, delay + 70], [0, codeSnippet.length]));
	const displayedCode = codeSnippet.slice(0, chars);
	const cursorBlink = Math.floor((frame / 12) % 2) === 0;

	return (
		<div
			style={{
				width,
				borderRadius: 20,
				background: 'linear-gradient(175deg, rgba(18, 22, 28, 0.94) 0%, rgba(10, 12, 16, 0.96) 100%)',
				border: '1px solid rgba(0, 229, 255, 0.25)',
				boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 229, 255, 0.1)',
				transform: `scale(${enter})`,
				opacity: enter,
				overflow: 'hidden',
				position: 'relative',
				...style,
			}}
		>
			{/* Scanlines Overlay */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 2px, transparent 2px, transparent 4px)',
					pointerEvents: 'none',
					opacity: 0.6,
				}}
			/>

			{/* Top Header */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '16px 24px',
					borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
					background: 'rgba(255, 255, 255, 0.03)',
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
					<span style={{width: 10, height: 10, borderRadius: '50%', background: '#FF5F56'}} />
					<span style={{width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E'}} />
					<span style={{width: 10, height: 10, borderRadius: '50%', background: '#27C93F'}} />
					<span style={{marginLeft: 14, fontFamily: MONO, fontSize: 18, color: '#90A4AE', letterSpacing: 1}}>{title}</span>
				</div>
				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 8,
						padding: '6px 14px',
						borderRadius: 99,
						background: 'rgba(0, 255, 102, 0.12)',
						border: '1px solid rgba(0, 255, 102, 0.4)',
						color: '#00FF66',
						fontFamily: MONO,
						fontSize: 14,
						letterSpacing: 1.5,
					}}
				>
					<span style={{width: 6, height: 6, borderRadius: '50%', background: '#00FF66', boxShadow: '0 0 8px #00FF66'}} />
					{statusBadge}
				</div>
			</div>

			{/* Code / Terminal Content */}
			<div style={{padding: '24px 30px', fontFamily: MONO, fontSize: 24, lineHeight: 1.5, color: '#E0E6ED', whiteSpace: 'pre-wrap'}}>
				{displayedCode}
				<span style={{color: '#00E5FF', opacity: cursorBlink ? 1 : 0}}>▌</span>
			</div>
		</div>
	);
};

// ════════════════════════════════════════════════════════════════════════════
// 3. ESTILO MOCKUP 3D DE PRODUTO & GLASSMORPHISM
// ════════════════════════════════════════════════════════════════════════════

export interface FloatingPhone3DProps {
	children?: React.ReactNode;
	width?: number;
	height?: number;
	delay?: number;
	rotateY?: number;
	rotateX?: number;
	clickAtSecond?: number;
	style?: React.CSSProperties;
}

export const FloatingPhone3D: React.FC<FloatingPhone3DProps> = (props) => {
	const {children, width = 680, height = 1180, delay = 0, rotateY = -12, rotateX = 8, clickAtSecond = 2, style} = props;
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Respiração 3D da tela
	const t = frame / fps;
	const idleY = Math.sin(t * 1.5) * 12;
	const dynamicRotY = rotateY + Math.cos(t * 1.2) * 2;
	const dynamicRotX = rotateX + Math.sin(t * 1.1) * 1.5;

	const enter = spring({
		frame: Math.max(0, frame - delay),
		fps,
		config: {damping: 15, stiffness: 90},
	});

	// Efeito Click Ripple
	const clickFrame = Math.round(clickAtSecond * fps);
	const rippleAge = frame - clickFrame;
	const hasClicked = rippleAge >= 0 && rippleAge < 35;
	const rippleScale = hasClicked ? ci(rippleAge, [0, 35], [0.3, 2.8]) : 0;
	const rippleOpacity = hasClicked ? ci(rippleAge, [0, 35], [0.8, 0]) : 0;

	return (
		<div
			style={{
				perspective: 1400,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				...style,
			}}
		>
			<div
				style={{
					width,
					height,
					borderRadius: 54,
					background: '#121417',
					border: '14px solid #23272E',
					boxShadow: '0 40px 90px rgba(0, 0, 0, 0.8), inset 0 0 12px rgba(255, 255, 255, 0.1)',
					transform: `translateY(${idleY}px) rotateY(${dynamicRotY}deg) rotateX(${dynamicRotX}deg) scale(${enter})`,
					position: 'relative',
					overflow: 'hidden',
					transformStyle: 'preserve-3d',
				}}
			>
				{/* Dynamic Island */}
				<div
					style={{
						position: 'absolute',
						top: 18,
						left: '50%',
						transform: 'translateX(-50%)',
						width: 160,
						height: 32,
						borderRadius: 20,
						background: '#000000',
						zIndex: 50,
					}}
				/>

				{/* App Screen Container */}
				<div
					style={{
						width: '100%',
						height: '100%',
						background: '#090A0D',
						position: 'relative',
						overflow: 'hidden',
					}}
				>
					{children}

					{/* Click Ripple Indicator */}
					{hasClicked && (
						<div
							style={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								width: 90,
								height: 90,
								borderRadius: '50%',
								border: '3px solid #00E5FF',
								background: 'rgba(0, 229, 255, 0.25)',
								transform: `translate(-50%, -50%) scale(${rippleScale})`,
								opacity: rippleOpacity,
								pointerEvents: 'none',
								zIndex: 60,
							}}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

// ════════════════════════════════════════════════════════════════════════════
// 4. ESTILO DATAVIZ DINÂMICO & GRÁFICOS VIVOS
// ════════════════════════════════════════════════════════════════════════════

export interface DynamicTrendChartProps {
	title: string;
	metricValue: number;
	growthPercent?: number;
	metricPrefix?: string;
	metricSuffix?: string;
	points?: number[];
	width?: number;
	height?: number;
	delay?: number;
	style?: React.CSSProperties;
}

export const DynamicTrendChart: React.FC<DynamicTrendChartProps> = (props) => {
	const {
		title,
		metricValue,
		growthPercent = 42.8,
		metricPrefix = 'R$ ',
		metricSuffix = '',
		points = [20, 28, 42, 38, 55, 72, 68, 92],
		width = 880,
		height = 420,
		delay = 0,
		style,
	} = props;
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Revelação da linha com strokeDashoffset
	const drawProgress = ci(frame, [delay, delay + 45], [0, 1], E_IO);
	const displayedNumber = Math.round(drawProgress * metricValue);

	// Geração da curva SVG
	const paddingX = 40;
	const paddingY = 50;
	const stepX = (width - paddingX * 2) / (points.length - 1);
	const coords = points.map((p, i) => {
		const x = paddingX + i * stepX;
		const y = height - paddingY - (p / 100) * (height - paddingY * 2);
		return [x, y];
	});

	// Montagem do path SVG
	let pathD = `M ${coords[0][0]} ${coords[0][1]}`;
	for (let i = 1; i < coords.length; i++) {
		const [x0, y0] = coords[i - 1];
		const [x1, y1] = coords[i];
		const mx = (x0 + x1) / 2;
		pathD += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
	}

	const totalLength = 1200;
	const strokeOffset = (1 - drawProgress) * totalLength;

	return (
		<div
			style={{
				width,
				height,
				borderRadius: 24,
				background: 'linear-gradient(160deg, #13171F 0%, #0B0E14 100%)',
				border: '1px solid rgba(255, 255, 255, 0.1)',
				boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7)',
				padding: '30px 36px',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				position: 'relative',
				...style,
			}}
		>
			{/* Top Metric Header */}
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
				<div>
					<div style={{fontFamily: SANS, fontSize: 22, color: '#8892B0', textTransform: 'uppercase', letterSpacing: 2}}>
						{title}
					</div>
					<div style={{fontFamily: MONO, fontSize: 58, fontWeight: 700, color: '#FFFFFF', marginTop: 6}}>
						{metricPrefix}
						{displayedNumber.toLocaleString('pt-BR')}
						{metricSuffix}
					</div>
				</div>
				<div
					style={{
						padding: '8px 16px',
						borderRadius: 99,
						background: 'rgba(16, 185, 129, 0.15)',
						border: '1px solid rgba(16, 185, 129, 0.4)',
						color: '#10B981',
						fontFamily: MONO,
						fontSize: 18,
						fontWeight: 600,
					}}
				>
					+{(drawProgress * growthPercent).toFixed(1)}%
				</div>
			</div>

			{/* SVG Chart Line */}
			<div style={{position: 'absolute', bottom: 10, left: 0, right: 0, height: height * 0.55}}>
				<svg width={width} height={height * 0.55} viewBox={`0 0 ${width} ${height * 0.55}`}>
					<path
						d={pathD}
						fill="none"
						stroke="#10B981"
						strokeWidth={6}
						strokeDasharray={totalLength}
						strokeDashoffset={strokeOffset}
						strokeLinecap="round"
					/>
				</svg>
			</div>
		</div>
	);
};

// ════════════════════════════════════════════════════════════════════════════
// 5. ESTILO VIBE MOTION & CINEMATIC STAGE (BENCHMARK ANIMOS.APP)
// ════════════════════════════════════════════════════════════════════════════

export interface AnimosSheenProps {
	/** Segundo de início da animação do reflexo */
	atSecond?: number;
	/** Duração da passagem de luz em segundos (default: 1.2s) */
	durationInSeconds?: number;
	/** Intensidade máxima do reflexo de 0 a 1 (default: 0.28) */
	intensity?: number;
	/** Ângulo da lâmina de luz em graus (default: 105deg) */
	angle?: number;
	/** Cor do feixe de luz (default: branco puro) */
	color?: string;
	/** Delay adicional em frames */
	delay?: number;
	style?: React.CSSProperties;
}

export const AnimosSheen: React.FC<AnimosSheenProps> = (props) => {
	const {
		atSecond = 1.0,
		durationInSeconds = 1.2,
		intensity = 0.28,
		angle = 105,
		color = '255, 255, 255',
		delay = 0,
		style,
	} = props;
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const startFrame = Math.round(atSecond * fps) + delay;
	const durationFrames = Math.round(durationInSeconds * fps);
	const endFrame = startFrame + durationFrames;

	// Progressão suave do feixe de luz
	const progress = ci(frame, [startFrame, endFrame], [0, 1], E_IO);
	const isSheening = frame >= startFrame && frame <= endFrame;

	if (!isSheening && (frame < startFrame || frame > endFrame)) {
		return null;
	}

	// Translação diagonal do feixe de luz (de -120% até 220%)
	const translateX = lerp(-120, 220, progress);

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				overflow: 'hidden',
				pointerEvents: 'none',
				zIndex: 40,
				borderRadius: 'inherit',
				...style,
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: '-50%',
					bottom: '-50%',
					left: 0,
					width: '100%',
					transform: `translateX(${translateX}%) rotate(${angle - 90}deg)`,
					transformOrigin: 'center center',
					background: `linear-gradient(90deg, 
						transparent 0%, 
						rgba(${color}, 0) 25%, 
						rgba(${color}, ${intensity * 0.4}) 42%, 
						rgba(${color}, ${intensity}) 50%, 
						rgba(${color}, ${intensity * 0.4}) 58%, 
						rgba(${color}, 0) 75%, 
						transparent 100%)`,
					mixBlendMode: 'overlay',
					pointerEvents: 'none',
				}}
			/>
		</div>
	);
};

export type CinematicPreset = 'keynote' | 'isometric' | 'subtle-float' | 'flat-sheen';
export type CinematicElevation = 'flat' | 'raised' | 'floating' | 'dramatic';

export interface CinematicStageProps {
	children: React.ReactNode;
	/** Preset de câmera e ângulo 3D inspirado no animos.app */
	preset?: CinematicPreset;
	/** Nível de elevação e difusão das sombras softbox */
	elevation?: CinematicElevation;
	/** Delay de entrada em frames */
	delay?: number;
	/** Largura total do contêiner */
	width?: number | string;
	/** Altura total do contêiner */
	height?: number | string;
	/** Ângulo X customizado (sobrepõe o preset) */
	rotateX?: number;
	/** Ângulo Y customizado (sobrepõe o preset) */
	rotateY?: number;
	/** Ângulo Z customizado (sobrepõe o preset) */
	rotateZ?: number;
	/** Ativa o feixe de reflexo deslizante Animos Sheen */
	sheen?: boolean;
	/** Segundo exato do reflexo Sheen */
	sheenAtSecond?: number;
	/** Duração da passagem do Sheen em segundos */
	sheenDuration?: number;
	/** Intensidade do reflexo Sheen (0 a 1) */
	sheenIntensity?: number;
	/** Cor de glow difuso sutil no background (ex: 'rgba(0, 229, 255, 0.12)') */
	glowColor?: string;
	/** Ativa micro-oscilação harmônica ociosa */
	enableIdleFloat?: boolean;
	/** Damping da mola de entrada (default calibrado pelo preset) */
	springDamping?: number;
	/** Stiffness da mola de entrada (default calibrado pelo preset) */
	springStiffness?: number;
	/** Raio da borda chanfrada (default: 28px) */
	borderRadius?: number;
	/** Injeta automaticamente SFX de impacto e sheen calculados com precisão física */
	autoImpactSound?: boolean;
	/** Volume dos efeitos sonoros embutidos (0 a 1, default: 0.8) */
	soundVolume?: number;
	style?: React.CSSProperties;
	innerStyle?: React.CSSProperties;
}

export const CinematicStage: React.FC<CinematicStageProps> = (props) => {
	const {
		children,
		preset = 'keynote',
		elevation = 'floating',
		delay = 0,
		width = 'auto',
		height = 'auto',
		rotateX: customRotX,
		rotateY: customRotY,
		rotateZ: customRotZ,
		sheen = true,
		sheenAtSecond = 1.0,
		sheenDuration = 1.2,
		sheenIntensity = 0.32,
		glowColor,
		enableIdleFloat = true,
		springDamping,
		springStiffness,
		borderRadius = 28,
		autoImpactSound = false,
		soundVolume = 0.8,
		style,
		innerStyle,
	} = props;

	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Presets de orientação 3D (benchmark animos.app)
	const presetConfigs: Record<
		CinematicPreset,
		{rx: number; ry: number; rz: number; damping: number; stiffness: number; scaleStart: number}
	> = {
		keynote: {rx: 8, ry: -10, rz: 0, damping: 16, stiffness: 95, scaleStart: 0.92},
		isometric: {rx: 16, ry: -22, rz: -3, damping: 18, stiffness: 100, scaleStart: 0.88},
		'subtle-float': {rx: 4, ry: -3, rz: 0, damping: 15, stiffness: 110, scaleStart: 0.95},
		'flat-sheen': {rx: 0, ry: 0, rz: 0, damping: 14, stiffness: 120, scaleStart: 0.94},
	};

	const cfg = presetConfigs[preset];
	const baseRotX = customRotX ?? cfg.rx;
	const baseRotY = customRotY ?? cfg.ry;
	const baseRotZ = customRotZ ?? cfg.rz;
	const damping = springDamping ?? cfg.damping;
	const stiffness = springStiffness ?? cfg.stiffness;

	// Entrada física via spring Remotion
	const enterSpring = spring({
		frame: Math.max(0, frame - delay),
		fps,
		config: {damping, stiffness},
	});

	// Oscilação ociosa harmônica (Idle Breathing)
	const t = (frame - delay) / fps;
	const idleY = enableIdleFloat && frame >= delay ? Math.sin(t * 1.6) * 7 : 0;
	const idleRotX = enableIdleFloat && frame >= delay ? Math.sin(t * 1.3) * 1.2 : 0;
	const idleRotY = enableIdleFloat && frame >= delay ? Math.cos(t * 1.1) * 1.5 : 0;

	// Rotações finais combinadas
	const currentRotX = lerp(baseRotX * 1.5, baseRotX, enterSpring) + idleRotX;
	const currentRotY = lerp(baseRotY * 1.5, baseRotY, enterSpring) + idleRotY;
	const currentRotZ = baseRotZ;
	const currentScale = lerp(cfg.scaleStart, 1.0, enterSpring);
	const opacity = enterSpring;

	// Sombras multi-camadas (Softbox de estúdio calibradas por elevação)
	const shadowPresets: Record<CinematicElevation, string> = {
		flat: '0 4px 12px rgba(0, 0, 0, 0.25)',
		raised: '0 2px 6px rgba(0, 0, 0, 0.2), 0 12px 28px -4px rgba(0, 0, 0, 0.35)',
		floating:
			'0 2px 5px rgba(0, 0, 0, 0.2), 0 16px 36px -6px rgba(0, 0, 0, 0.4), 0 45px 90px -12px rgba(0, 0, 0, 0.55)',
		dramatic:
			'0 4px 8px rgba(0, 0, 0, 0.25), 0 24px 48px -6px rgba(0, 0, 0, 0.5), 0 70px 140px -18px rgba(0, 0, 0, 0.7)',
	};

	const baseShadow = shadowPresets[elevation];
	const fullShadow = glowColor ? `${baseShadow}, 0 0 60px ${glowColor}` : baseShadow;

	return (
		<div
			style={{
				perspective: 1200,
				perspectiveOrigin: '50% 50%',
				display: 'inline-flex',
				justifyContent: 'center',
				alignItems: 'center',
				width,
				height,
				...style,
			}}
		>
			<div
				style={{
					position: 'relative',
					borderRadius,
					transformStyle: 'preserve-3d',
					transform: `translateY(${idleY}px) scale(${currentScale}) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) rotateZ(${currentRotZ}deg)`,
					opacity,
					boxShadow: fullShadow,
					border: '1px solid rgba(255, 255, 255, 0.12)',
					background: 'rgba(18, 20, 24, 0.96)',
					overflow: 'hidden',
					...innerStyle,
				}}
			>
				{/* Highlight de borda chanfrada superior estilo vidro */}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						height: 1,
						background:
							'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)',
						pointerEvents: 'none',
						zIndex: 35,
					}}
				/>

				{/* Conteúdo encapsulado */}
				<div style={{position: 'relative', zIndex: 10, width: '100%', height: '100%'}}>
					{children}
				</div>

				{/* Feixe de Luz Animos Sheen */}
				{sheen && (
					<AnimosSheen
						atSecond={sheenAtSecond}
						durationInSeconds={sheenDuration}
						intensity={sheenIntensity}
						delay={delay}
					/>
				)}

				{/* Sound Design Físico Automatizado */}
				{autoImpactSound && (
					<AutoImpactTrack
						masterVolume={soundVolume}
						triggers={[
							{
								startFrame: delay,
								durationFrames: Math.round(fps * 0.6),
								ease: 'snapSettle',
								type: 'slam',
								volume: 0.45,
							},
							...(sheen
								? [
										{
											startFrame: Math.round(sheenAtSecond * fps) + delay,
											durationFrames: Math.round(sheenDuration * fps),
											ease: 'glide' as const,
											type: 'whoosh' as const,
											volume: 0.3,
										},
								  ]
								: []),
						]}
					/>
				)}
			</div>
		</div>
	);
};

