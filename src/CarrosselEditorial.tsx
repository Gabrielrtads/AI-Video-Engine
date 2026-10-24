import React, { useId } from 'react';
import {
	AbsoluteFill,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import { loadFont as loadBebasNeue } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

// Fontes editoriais idênticas ao padrão de alta retenção
const { fontFamily: fontBebas } = loadBebasNeue();
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['500', '600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export interface CarrosselEditorialProps {
	headerTagLeft?: string;
	headerTagRight?: string;
	categoryTag?: string;
	categoryColor?: string;
	titleLine1?: string;
	titleLine2?: string;
	titleLine3?: string;
	highlightWord?: string;
	gradientColors?: string[];
	subtitle?: string;
	subtitleColor?: string;
	backgroundColor?: string;
	textColor?: string;
	badgeNumber?: string;
	badgeOthers?: string;
	badgeOthersColor?: string;
	badgeCategory?: string;
	badgeCategoryColor?: string;
	stageHighlightWord?: string;
	stageRepeatedWord?: string;
	stageWatermarkColor?: string;
	stageBgColor?: string;
	stageTextColor?: string;
	underlineColor?: string;
	footerAuthor?: string;
	footerAction?: string;
}

export const CarrosselEditorial: React.FC<CarrosselEditorialProps> = ({
	headerTagLeft = 'VIBE DESIGN STUDIO × AGENTES',
	headerTagRight = 'ESTÚDIO HEADLESS',
	categoryTag = '— CRIATIVO 100% EM CÓDIGO PURO',
	categoryColor = '#FF0022',
	titleLine1 = 'O FIM DOS',
	titleLine2 = 'VÍDEOS DE IA',
	titleLine3 = 'SEM',
	highlightWord = 'ALMA',
	gradientColors = ['#FF0022', '#FF3355', '#FF0022'],
	subtitle = 'Adeus ferramentas no-code travadas e vídeos que todo mundo ignora. Um estúdio headless em React e Remotion para agentes criarem vídeos direto do terminal.',
	subtitleColor = '#475569',
	backgroundColor = '#FCFCFD',
	textColor = '#09090B',
	badgeNumber = '01',
	badgeOthers = '02  03  04  05',
	badgeOthersColor = 'rgba(255, 255, 255, 0.75)',
	badgeCategory = 'ZERO SLOP',
	badgeCategoryColor = '#FFFFFF',
	stageHighlightWord = 'SEM SLOP',
	stageRepeatedWord = 'CÓDIGO PURO',
	stageWatermarkColor = 'rgba(255, 255, 255, 0.18)',
	stageBgColor = '#FF0022',
	stageTextColor = '#FFFFFF',
	underlineColor = '#09090B',
	footerAuthor = 'GABRIEL TOLEDO',
	footerAction = 'ARRASTA  →',
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const rawId = useId();
	const gradId = `highlightGrad_${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

	// 1. Física elástica do palco inferior
	const stageEntrance = spring({
		frame: frame - 6,
		fps,
		config: { damping: 16, mass: 0.8, stiffness: 100 },
	});

	// 2. Linha elástica sublinhando a palavra central
	const underlineProgress = spring({
		frame: frame - 18,
		fps,
		config: { damping: 18, mass: 0.7, stiffness: 90 },
	});

	// 3. Loop de texto repetido no fundo do palco (horizontal reto a 0 graus)
	const repeatedScrollOffset = (frame * 2.4) % 800;

	// 5 linhas horizontais perfeitamente retas para preencher o fundo cinético
	const bgLines = [0, 1, 2, 3, 4];

	return (
		<AbsoluteFill
			style={{
				width: 1080,
				height: 1350,
				background: backgroundColor,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: '40px 48px 36px 48px',
				boxSizing: 'border-box',
				overflow: 'hidden',
			}}
		>
			{/* ══════════════ 1. HEADER EDITORIAL SUPERIOR ══════════════ */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					paddingBottom: 18,
					borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
					fontFamily: fontMono,
					fontSize: 19,
					letterSpacing: '0.24em',
					fontWeight: 600,
					textTransform: 'uppercase',
				}}
			>
				<span style={{ color: textColor }}>{headerTagLeft}</span>
				<span style={{ color: textColor, opacity: 0.6 }}>{headerTagRight}</span>
			</div>

			{/* ══════════════ 2. CATEGORIA, TÍTULO ULTRA-CONDENSADO & SUBTÍTULO ══════════════ */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
				{/* Tag de Categoria com Traço */}
				<div
					style={{
						fontFamily: fontPlusJakartaSans,
						fontSize: 17,
						fontWeight: 800,
						letterSpacing: '0.18em',
						color: categoryColor,
						textTransform: 'uppercase',
					}}
				>
					{categoryTag}
				</div>

				{/* Título Principal Ultra-Condensado (Bebas Neue) */}
				<h1
					style={{
						fontFamily: fontBebas,
						fontSize: 132,
						lineHeight: 0.91,
						letterSpacing: '0.01em',
						color: textColor,
						margin: 0,
						textTransform: 'uppercase',
					}}
				>
					{titleLine1}
					<br />
					{titleLine2}
					<br />
					{titleLine3}{' '}
					{/* SVG Text com gradiente ou cor sólida */}
					{(() => {
						const wordLen = highlightWord.length;
						const estWidthPx = Math.max(wordLen * 64 + 16, 80);
						const estWidthEm = (estWidthPx / 132).toFixed(2);
						const gradXShift = (frame * 1.2) % 100;

						return (
							<svg
								style={{
									display: 'inline-block',
									height: '0.84em',
									width: `${estWidthEm}em`,
									verticalAlign: '-0.02em',
									overflow: 'visible',
									marginLeft: 6,
								}}
								viewBox={`0 0 ${estWidthPx} 120`}
							>
								<defs>
									<linearGradient
										id={gradId}
										x1={`${-60 + gradXShift * 1.5}%`}
										y1="0%"
										x2={`${140 + gradXShift * 1.5}%`}
										y2="0%"
									>
										{gradientColors.map((color, idx) => {
											const offsetPct =
												gradientColors.length > 1
													? (idx / (gradientColors.length - 1)) * 100
													: 100;
											return (
												<stop
													key={idx}
													offset={`${offsetPct}%`}
													stopColor={color}
												/>
											);
										})}
									</linearGradient>
								</defs>
								<text
									x="0"
									y="105"
									fill={`url(#${gradId})`}
									fontFamily={fontBebas}
									fontSize="132"
									letterSpacing="0.01em"
								>
									{highlightWord}
								</text>
							</svg>
						);
					})()}
				</h1>

				{/* Subtítulo Editorial */}
				<p
					style={{
						fontFamily: fontPlusJakartaSans,
						fontSize: 23,
						lineHeight: 1.38,
						color: subtitleColor,
						margin: 0,
						fontWeight: 600,
						maxWidth: 960,
					}}
				>
					{subtitle}
				</p>
			</div>

			{/* ══════════════ 3. PALCO INFERIOR CINÉTICO (CARD EM LOOP) ══════════════ */}
			<div
				style={{
					position: 'relative',
					width: '100%',
					height: 480,
					borderRadius: 28,
					background: stageBgColor,
					overflow: 'hidden',
					boxShadow: '0 25px 50px -12px rgba(255, 0, 34, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08)',
					transform: `scale(${0.96 + stageEntrance * 0.04}) translateY(${(1 - stageEntrance) * 20}px)`,
					opacity: Math.min(Math.max(stageEntrance, 0), 1),
				}}
			>
				{/* Badges Superiores do Palco */}
				<div
					style={{
						position: 'absolute',
						top: 24,
						left: 28,
						right: 28,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						zIndex: 5,
					}}
				>
					{/* Pílula de Progresso Editorial */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 10,
							fontFamily: fontMono,
							fontSize: 16,
							fontWeight: 700,
						}}
					>
						<span
							style={{
								background: '#0a0a0c',
								color: '#ffffff',
								padding: '4px 12px',
								borderRadius: 999,
								fontSize: 15,
								letterSpacing: '0.04em',
							}}
						>
							{badgeNumber}
						</span>
						<span
							style={{
								color: badgeOthersColor,
								letterSpacing: '0.12em',
							}}
						>
							{badgeOthers}
						</span>
					</div>

					{/* Tag de Categoria do Card */}
					<div
						style={{
							fontFamily: fontMono,
							fontSize: 14,
							fontWeight: 700,
							letterSpacing: '0.16em',
							color: badgeCategoryColor,
							textTransform: 'uppercase',
						}}
					>
						{badgeCategory}
					</div>
				</div>

				{/* Fundo Cinético: 5 Linhas Perfeitamente Retas (0 graus) */}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-around',
						padding: '40px 0',
						boxSizing: 'border-box',
						pointerEvents: 'none',
						opacity: 0.9,
					}}
				>
					{bgLines.map((lineIdx) => {
						const direction = lineIdx % 2 === 0 ? -1 : 1;
						const xOffset = direction * repeatedScrollOffset;

						return (
							<div
								key={lineIdx}
								style={{
									whiteSpace: 'nowrap',
									fontFamily: fontBebas,
									fontSize: 78,
									lineHeight: 1,
									letterSpacing: '0.04em',
									color: stageWatermarkColor,
									textTransform: 'uppercase',
									transform: `translateX(${xOffset}px)`,
									userSelect: 'none',
								}}
							>
								{Array(14).fill(`${stageRepeatedWord} `).join('')}
							</div>
						);
					})}
				</div>

				{/* Palavra Central de Destaque com Sublinhado Físico */}
				<div
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -46%)',
						zIndex: 4,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						textAlign: 'center',
					}}
				>
					<span
						style={{
							fontFamily: fontBebas,
							// Encolhe a palavra do palco para ela nunca passar da borda (12 letras já estouravam)
							fontSize: Math.min(215, Math.floor(880 / (Math.max(1, stageHighlightWord.length) * 0.43))),
							lineHeight: 0.84,
							letterSpacing: '0.01em',
							color: stageTextColor,
							textTransform: 'uppercase',
							textShadow: '0 2px 20px rgba(0, 0, 0, 0.15)',
							whiteSpace: 'nowrap',
						}}
					>
						{stageHighlightWord}
					</span>

					{/* Linha Sublinhada Física (animação elástica de entrada) */}
					<div
						style={{
							marginTop: 10,
							height: 8,
							borderRadius: 999,
							background: underlineColor,
							width: `${Math.min(Math.max(underlineProgress, 0), 1) * 102}%`,
							boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
						}}
					/>
				</div>
			</div>

			{/* ══════════════ 4. FOOTER EDITORIAL INFERIOR ══════════════ */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					paddingTop: 18,
					borderTop: '1px solid rgba(0, 0, 0, 0.08)',
					fontFamily: fontMono,
					fontSize: 18,
					letterSpacing: '0.24em',
					fontWeight: 600,
					textTransform: 'uppercase',
				}}
			>
				<span style={{ color: textColor, opacity: 0.65 }}>{footerAuthor}</span>
				<span style={{ color: textColor }}>{footerAction}</span>
			</div>
		</AbsoluteFill>
	);
};
