import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ci, E_IN, E_OUT, lerp, MONO, SANS, SERIF} from '../../kit';
import {VOX_COLORS, tornPolygon, calculateHandDrawnPerimeter} from '../../timeline/voxMath';

export {VOX_COLORS, tornPolygon, calculateHandDrawnPerimeter};

// ────────────────────────────────────────────────────────────────────────────
// 1. VOX PAPER STAGE (Mesa Editorial 2.5D com Dual-Clock e Drift Contínuo)
// ────────────────────────────────────────────────────────────────────────────

export interface VoxPaperStageProps {
	width?: number;
	height?: number;
	theme?: 'light-newsprint' | 'aged-kraft' | 'microfilm-dark';
	showGrid?: boolean;
	camDrift?: boolean;
	children?: React.ReactNode;
	style?: React.CSSProperties;
}

export const VoxPaperStage: React.FC<VoxPaperStageProps> = ({
	width = 1080,
	height = 1920,
	theme = 'light-newsprint',
	showGrid = true,
	camDrift = true,
	children,
	style,
}) => {
	const frame = useCurrentFrame();

	const bg =
		theme === 'microfilm-dark'
			? VOX_COLORS.paperDark
			: theme === 'aged-kraft'
				? VOX_COLORS.paperAged
				: VOX_COLORS.paperBase;

	const gridColor =
		theme === 'microfilm-dark' ? 'rgba(244, 241, 234, 0.06)' : VOX_COLORS.gridLine;

	// Drift contínuo a 30 FPS para garantir Zero Frames Mortos
	const driftX = camDrift ? Math.sin(frame * 0.035) * 6 : 0;
	const driftY = camDrift ? Math.cos(frame * 0.028) * 8 : 0;
	const driftScale = camDrift ? 1 + Math.sin(frame * 0.02) * 0.012 : 1;

	return (
		<div
			style={{
				width,
				height,
				backgroundColor: bg,
				position: 'relative',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundImage: showGrid
					? `radial-gradient(${gridColor} 1.5px, transparent 1.5px)`
					: undefined,
				backgroundSize: showGrid ? '36px 36px' : undefined,
				...style,
			}}
		>
			{/* Vinheta quente analógica nas bordas */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					boxShadow:
						theme === 'microfilm-dark'
							? 'inset 0 0 140px rgba(0,0,0,0.85)'
							: 'inset 0 0 160px rgba(78, 68, 52, 0.18)',
					zIndex: 5,
				}}
			/>

			{/* Palco com drift suave de câmera */}
			<div
				style={{
					width: '100%',
					height: '100%',
					position: 'relative',
					transform: `translate3d(${driftX}px, ${driftY}px, 0) scale(${driftScale})`,
					transformOrigin: 'center center',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 10,
				}}
			>
				{children}
			</div>
		</div>
	);
};

// ────────────────────────────────────────────────────────────────────────────
// 2. NEWSPAPER CUTOUT (Recorte de Jornal com Borda Rasgada & Greeking)
// ────────────────────────────────────────────────────────────────────────────

export interface NewspaperCutoutProps {
	headline: string;
	date?: string;
	source?: string;
	snippet?: string;
	highlightedPhrase?: string;
	w?: number;
	h?: number;
	angle?: number;
	seed?: string;
	delay?: number;
	style?: React.CSSProperties;
}

export const NewspaperCutout: React.FC<NewspaperCutoutProps> = ({
	headline,
	date = 'OUTUBRO, 1994',
	source = 'GAZETA OFICIAL // ARQUIVO',
	snippet = 'Relatórios confirmam os impactos estruturais observados no período analisado com evidências documentais inequívocas.',
	highlightedPhrase,
	w = 880,
	h = 480,
	angle = -2,
	seed = 'vox-news-01',
	delay = 10,
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const anim = spring({
		frame: Math.max(0, frame - delay),
		fps,
		config: {damping: 18, stiffness: 120, mass: 0.8},
	});

	const translateY = lerp(80, 0, anim);
	const opacity = ci(frame, [delay, delay + 8], [0, 1]);
	const rot = lerp(angle - 4, angle, anim);

	const clip = tornPolygon(seed, 28, 2.2);

	return (
		<div
			style={{
				width: w,
				minHeight: h,
				position: 'relative',
				opacity,
				transform: `translate3d(0, ${translateY}px, 0) rotate(${rot}deg)`,
				margin: '20px 0',
				...style,
			}}
		>
			{/* Sombra desacoplada em camada gêmea (Zero custo de GPU de drop-shadow) */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					transform: 'translate3d(8px, 14px, 0)',
					backgroundColor: 'rgba(32, 28, 22, 0.22)',
					clipPath: clip,
					zIndex: 1,
				}}
			/>

			{/* Folha do jornal recortada */}
			<div
				style={{
					position: 'relative',
					width: '100%',
					height: '100%',
					backgroundColor: '#FAF7F0',
					clipPath: clip,
					padding: '36px 44px',
					boxSizing: 'border-box',
					color: VOX_COLORS.inkPrimary,
					display: 'flex',
					flexDirection: 'column',
					gap: 14,
					zIndex: 2,
				}}
			>
				{/* Cabeçalho metadados do jornal */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						borderBottom: `2px solid ${VOX_COLORS.inkPrimary}`,
						paddingBottom: 8,
						fontFamily: MONO,
						fontSize: 18,
						letterSpacing: 1.5,
						color: VOX_COLORS.inkMuted,
					}}
				>
					<span>{source}</span>
					<span>{date}</span>
				</div>

				{/* Manchete em Instrument Serif */}
				<div
					style={{
						fontFamily: SERIF,
						fontSize: 48,
						lineHeight: 1.08,
						fontWeight: 500,
						letterSpacing: -0.5,
						color: VOX_COLORS.inkPrimary,
					}}
				>
					{headline}
				</div>

				{/* Divisor duplo de imprensa */}
				<div
					style={{
						width: '100%',
						height: 1,
						backgroundColor: VOX_COLORS.inkSecondary,
						opacity: 0.35,
						margin: '4px 0',
					}}
				/>

				{/* Trecho com Marca-Texto opcional */}
				<div
					style={{
						fontFamily: SANS,
						fontSize: 22,
						lineHeight: 1.45,
						color: VOX_COLORS.inkSecondary,
						position: 'relative',
					}}
				>
					{highlightedPhrase ? (
						<span>
							{snippet.replace(highlightedPhrase, '')}
							<span
								style={{
									backgroundColor: VOX_COLORS.highlighterYellow,
									padding: '2px 8px',
									borderRadius: 2,
									fontWeight: 600,
									color: VOX_COLORS.inkPrimary,
								}}
							>
								{highlightedPhrase}
							</span>
						</span>
					) : (
						snippet
					)}
				</div>

				{/* Greeking decorativo (linhas abstratas para evitar poluição no 9:16) */}
				<div style={{display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8}}>
					<div
						style={{
							width: '100%',
							height: 4,
							backgroundColor: 'rgba(61, 58, 53, 0.15)',
							borderRadius: 2,
						}}
					/>
					<div
						style={{
							width: '92%',
							height: 4,
							backgroundColor: 'rgba(61, 58, 53, 0.12)',
							borderRadius: 2,
						}}
					/>
					<div
						style={{
							width: '74%',
							height: 4,
							backgroundColor: 'rgba(61, 58, 53, 0.09)',
							borderRadius: 2,
						}}
					/>
				</div>
			</div>
		</div>
	);
};

// ────────────────────────────────────────────────────────────────────────────
// 3. VOX HIGHLIGHTER (Marca-Texto Amarelo Fluído Sincronizado)
// ────────────────────────────────────────────────────────────────────────────

export interface VoxHighlighterProps {
	text: string;
	color?: string;
	delay?: number;
	duration?: number;
	fontSize?: number;
	style?: React.CSSProperties;
}

export const VoxHighlighter: React.FC<VoxHighlighterProps> = ({
	text,
	color = VOX_COLORS.highlighterYellow,
	delay = 15,
	duration = 20,
	fontSize = 38,
	style,
}) => {
	const frame = useCurrentFrame();

	const progress = ci(frame, [delay, delay + duration], [0, 1], E_IN);
	const widthPercent = progress * 100;

	return (
		<span
			style={{
				position: 'relative',
				display: 'inline-block',
				fontFamily: SERIF,
				fontSize,
				fontWeight: 500,
				color: VOX_COLORS.inkPrimary,
				padding: '2px 10px',
				...style,
			}}
		>
			{/* Camada do grifo que corre da esquerda para a direita */}
			<span
				style={{
					position: 'absolute',
					left: 0,
					top: '12%',
					bottom: '8%',
					width: `${widthPercent}%`,
					backgroundColor: color,
					zIndex: 1,
					transform: 'rotate(-0.4deg)',
					borderRadius: 2,
					opacity: 0.9,
				}}
			/>
			{/* Texto acima do grifo */}
			<span style={{position: 'relative', zIndex: 2}}>{text}</span>
		</span>
	);
};

// ────────────────────────────────────────────────────────────────────────────
// 4. HAND DRAWN MARK (Círculo ou Seta de Caneta Vermelha com Cálculo Puro)
// ────────────────────────────────────────────────────────────────────────────

export interface HandDrawnMarkProps {
	type?: 'circle' | 'underline' | 'cross';
	color?: string;
	width?: number;
	height?: number;
	delay?: number;
	duration?: number;
	style?: React.CSSProperties;
}

export const HandDrawnMark: React.FC<HandDrawnMarkProps> = ({
	type = 'circle',
	color = VOX_COLORS.penRed,
	width = 280,
	height = 140,
	delay = 20,
	duration = 25,
	style,
}) => {
	const frame = useCurrentFrame();

	const progress = ci(frame, [delay, delay + duration], [0, 1], E_IN);

	// Comprimento matemático exato do círculo/elipse (Ramanujan aproximado)
	// a = width/2 - 10, b = height/2 - 10
	const a = width / 2 - 10;
	const b = height / 2 - 10;
	const hConst = Math.pow(a - b, 2) / Math.pow(a + b, 2);
	const perimeter = Math.PI * (a + b) * (1 + (3 * hConst) / (10 + Math.sqrt(4 - 3 * hConst)));
	const strokeDashoffset = perimeter * (1 - progress);

	// Traçado com sobreposição imperfeita (estilo mão humana)
	const circlePath = `M ${width / 2} 10 C ${width - 5} 12, ${width + 4} ${height - 15}, ${width / 2} ${height - 8} C 12 ${height - 5}, 8 18, ${width / 2 + 15} 12`;
	const underlinePath = `M 15 ${height / 2} Q ${width / 2} ${height / 2 + 12}, ${width - 15} ${height / 2 - 4}`;

	const pathD = type === 'underline' ? underlinePath : circlePath;
	const activePerimeter = type === 'underline' ? width : perimeter;
	const finalDashoffset = activePerimeter * (1 - progress);

	return (
		<div
			style={{
				width,
				height,
				position: 'absolute',
				pointerEvents: 'none',
				...style,
			}}
		>
			<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
				<path
					d={pathD}
					fill="none"
					stroke={color}
					strokeWidth={6}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeDasharray={activePerimeter}
					strokeDashoffset={finalDashoffset}
				/>
			</svg>
		</div>
	);
};

// ────────────────────────────────────────────────────────────────────────────
// 5. VOX ANIMATED MAP (Atlas Vetorial Limpo com Rota Dinâmica)
// ────────────────────────────────────────────────────────────────────────────

export interface VoxAnimatedMapProps {
	title?: string;
	subtitle?: string;
	width?: number;
	height?: number;
	startPoint?: [number, number];
	endPoint?: [number, number];
	delay?: number;
	style?: React.CSSProperties;
}

export const VoxAnimatedMap: React.FC<VoxAnimatedMapProps> = ({
	title = 'ROTA TRANSATLÂNTICA // ARQUIVO',
	subtitle = 'ORIGEM ➔ DESTINO (1994)',
	width = 900,
	height = 540,
	startPoint = [180, 360],
	endPoint = [720, 180],
	delay = 15,
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const anim = spring({
		frame: Math.max(0, frame - delay),
		fps,
		config: {damping: 20, stiffness: 100},
	});

	const routeProgress = ci(frame, [delay + 12, delay + 45], [0, 1], E_IN);

	// Linha curva da rota em Bézier
	const [x1, y1] = startPoint;
	const [x2, y2] = endPoint;
	const cx = (x1 + x2) / 2;
	const cy = Math.min(y1, y2) - 80;
	const routePath = `M ${x1} ${y1} Q ${cx} ${cy}, ${x2} ${y2}`;

	// Comprimento aproximado da curva quadrática
	const approxLength = Math.hypot(x2 - x1, y2 - y1) * 1.15;
	const dashOffset = approxLength * (1 - routeProgress);

	return (
		<div
			style={{
				width,
				height,
				backgroundColor: '#EBE5D8',
				border: `2px solid ${VOX_COLORS.inkPrimary}`,
				position: 'relative',
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'column',
				boxShadow: '8px 14px 0px rgba(32, 28, 22, 0.22)',
				opacity: anim,
				transform: `scale(${lerp(0.95, 1, anim)})`,
				...style,
			}}
		>
			{/* Barra de metadados cartográficos */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '12px 20px',
					backgroundColor: VOX_COLORS.paperBase,
					borderBottom: `2px solid ${VOX_COLORS.inkPrimary}`,
					fontFamily: MONO,
					fontSize: 16,
					color: VOX_COLORS.inkPrimary,
					letterSpacing: 1.2,
				}}
			>
				<span>{title}</span>
				<span>{subtitle}</span>
			</div>

			{/* Canvas do mapa vetorial */}
			<svg width={width} height={height - 50} viewBox={`0 0 ${width} ${height - 50}`}>
				{/* Grade de coordenadas náuticas/cartográficas */}
				<line
					x1={100}
					y1={0}
					x2={100}
					y2={height}
					stroke="rgba(61, 58, 53, 0.12)"
					strokeDasharray="4 4"
				/>
				<line
					x1={300}
					y1={0}
					x2={300}
					y2={height}
					stroke="rgba(61, 58, 53, 0.12)"
					strokeDasharray="4 4"
				/>
				<line
					x1={500}
					y1={0}
					x2={500}
					y2={height}
					stroke="rgba(61, 58, 53, 0.12)"
					strokeDasharray="4 4"
				/>
				<line
					x1={700}
					y1={0}
					x2={700}
					y2={height}
					stroke="rgba(61, 58, 53, 0.12)"
					strokeDasharray="4 4"
				/>
				<line
					x1={0}
					y1={150}
					x2={width}
					y2={150}
					stroke="rgba(61, 58, 53, 0.12)"
					strokeDasharray="4 4"
				/>
				<line
					x1={0}
					y1={320}
					x2={width}
					y2={320}
					stroke="rgba(61, 58, 53, 0.12)"
					strokeDasharray="4 4"
				/>

				{/* Massa de terra continente 1 (abstraída) */}
				<path
					d="M 60 120 Q 140 80, 240 140 T 260 380 T 120 440 Z"
					fill="#DCD5C4"
					stroke="#B3AA97"
					strokeWidth={2}
				/>

				{/* Massa de terra continente 2 (abstraída) */}
				<path
					d="M 620 90 Q 760 60, 840 160 T 820 400 T 640 420 Z"
					fill="#DCD5C4"
					stroke="#B3AA97"
					strokeWidth={2}
				/>

				{/* Linha da Rota tracejada em Bézier */}
				<path
					d={routePath}
					fill="none"
					stroke={VOX_COLORS.penRed}
					strokeWidth={5}
					strokeDasharray="8 6"
					strokeDashoffset={dashOffset}
				/>

				{/* Ponto A (Origem) */}
				<circle cx={x1} cy={y1} r={8} fill={VOX_COLORS.inkPrimary} />
				<circle cx={x1} cy={y1} r={16} fill="none" stroke={VOX_COLORS.inkPrimary} strokeWidth={2} />
				<text
					x={x1 + 22}
					y={y1 + 6}
					fontFamily={SERIF}
					fontSize={24}
					fontWeight="bold"
					fill={VOX_COLORS.inkPrimary}
				>
					PONTO A
				</text>

				{/* Ponto B (Destino revelado com a rota) */}
				{routeProgress > 0.85 && (
					<g>
						<circle cx={x2} cy={y2} r={8} fill={VOX_COLORS.penRed} />
						<circle
							cx={x2}
							cy={y2}
							r={18}
							fill="none"
							stroke={VOX_COLORS.penRed}
							strokeWidth={2}
						/>
						<text
							x={x2 - 140}
							y={y2 - 16}
							fontFamily={SERIF}
							fontSize={26}
							fontWeight="bold"
							fill={VOX_COLORS.penRed}
						>
							DESTINO [LOCKED]
						</text>
					</g>
				)}
			</svg>
		</div>
	);
};

// ────────────────────────────────────────────────────────────────────────────
// 6. VOX EDITORIAL TYPOGRAPHY (Hierarquia Documental Clássica)
// ────────────────────────────────────────────────────────────────────────────

export interface VoxEditorialTypographyProps {
	kicker?: string;
	title: string;
	subtitle?: string;
	sourceNote?: string;
	delay?: number;
	align?: 'left' | 'center';
	style?: React.CSSProperties;
}

export const VoxEditorialTypography: React.FC<VoxEditorialTypographyProps> = ({
	kicker = '[ INVESTIGAÇÃO ESPECIAL // DOCUMENTÁRIO ]',
	title,
	subtitle,
	sourceNote = 'FONTE: DOCUMENTOS DESCLASSIFICADOS',
	delay = 5,
	align = 'center',
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const anim = spring({
		frame: Math.max(0, frame - delay),
		fps,
		config: {damping: 18, stiffness: 120},
	});

	const translateY = lerp(40, 0, anim);
	const opacity = ci(frame, [delay, delay + 10], [0, 1]);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: align === 'center' ? 'center' : 'flex-start',
				textAlign: align,
				opacity,
				transform: `translate3d(0, ${translateY}px, 0)`,
				padding: '20px 40px',
				maxWidth: 1000,
				...style,
			}}
		>
			{/* Kicker em JetBrains Mono */}
			{kicker && (
				<div
					style={{
						fontFamily: MONO,
						fontSize: 18,
						letterSpacing: 2,
						color: VOX_COLORS.penRed,
						fontWeight: 500,
						marginBottom: 12,
						textTransform: 'uppercase',
					}}
				>
					{kicker}
				</div>
			)}

			{/* Título Principal em Instrument Serif */}
			<div
				style={{
					fontFamily: SERIF,
					fontSize: 72,
					lineHeight: 1.05,
					fontWeight: 500,
					color: VOX_COLORS.inkPrimary,
					letterSpacing: -1,
				}}
			>
				{title}
			</div>

			{/* Subtítulo explicativo em Inter */}
			{subtitle && (
				<div
					style={{
						fontFamily: SANS,
						fontSize: 26,
						lineHeight: 1.4,
						color: VOX_COLORS.inkSecondary,
						marginTop: 16,
						maxWidth: 820,
					}}
				>
					{subtitle}
				</div>
			)}

			{/* Nota de rodapé documental */}
			{sourceNote && (
				<div
					style={{
						fontFamily: MONO,
						fontSize: 14,
						letterSpacing: 1.5,
						color: VOX_COLORS.inkMuted,
						marginTop: 20,
						textTransform: 'uppercase',
					}}
				>
					{sourceNote}
				</div>
			)}
		</div>
	);
};
