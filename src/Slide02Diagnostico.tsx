import React from 'react';
import {
	AbsoluteFill,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import { loadFont as loadBebasNeue } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadInstrumentSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

// Fontes editoriais de alto padrão
const { fontFamily: fontBebas } = loadBebasNeue();
const { fontFamily: fontInstrumentSerif } = loadInstrumentSerif('italic');
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['500', '600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const Slide02Diagnostico: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Animação física de entrada dos 3 blocos de diagnóstico com stagger
	const titleEntrance = spring({
		frame: Math.max(0, frame - 2),
		fps,
		config: { damping: 16, mass: 0.7, stiffness: 120 },
	});

	const card1Entrance = spring({
		frame: Math.max(0, frame - 10),
		fps,
		config: { damping: 18, mass: 0.8, stiffness: 100 },
	});

	const card2Entrance = spring({
		frame: Math.max(0, frame - 18),
		fps,
		config: { damping: 18, mass: 0.8, stiffness: 100 },
	});

	const card3Entrance = spring({
		frame: Math.max(0, frame - 26),
		fps,
		config: { damping: 18, mass: 0.8, stiffness: 100 },
	});

	const footerCalloutEntrance = spring({
		frame: Math.max(0, frame - 34),
		fps,
		config: { damping: 18, mass: 0.8, stiffness: 90 },
	});

	return (
		<AbsoluteFill
			style={{
				width: 1080,
				height: 1350,
				background: '#FCFCFD',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: '44px 52px 38px 52px',
				boxSizing: 'border-box',
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			{/* ══════════════ 1. HEADER EDITORIAL MINIMALISTA ══════════════ */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					paddingBottom: 20,
					borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
					fontFamily: fontMono,
					fontSize: 18,
					letterSpacing: '0.24em',
					fontWeight: 600,
					textTransform: 'uppercase',
				}}
			>
				<span style={{ color: '#09090B' }}>VIBE DESIGN STUDIO</span>
				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<span
						style={{
							background: '#FF0022',
							color: '#FFFFFF',
							padding: '3px 10px',
							borderRadius: 6,
							fontSize: 14,
							fontWeight: 700,
							letterSpacing: '0.08em',
						}}
					>
						02
					</span>
					<span style={{ color: '#64748B' }}>DIAGNÓSTICO</span>
				</div>
			</div>

			{/* ══════════════ 2. TÍTULO BRUTALISTA DO PROBLEMA ══════════════ */}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 12,
					marginTop: 10,
					opacity: Math.min(Math.max(titleEntrance, 0), 1),
					transform: `translateY(${(1 - titleEntrance) * 15}px)`,
				}}
			>
				<span
					style={{
						fontFamily: fontPlusJakartaSans,
						fontSize: 16,
						fontWeight: 800,
						letterSpacing: '0.2em',
						color: '#FF0022',
						textTransform: 'uppercase',
					}}
				>
					— O CICLO DO SLOP VISUAL
				</span>

				<h1
					style={{
						fontFamily: fontBebas,
						fontSize: 108,
						lineHeight: 0.93,
						letterSpacing: '0.01em',
						color: '#09090B',
						margin: 0,
						textTransform: 'uppercase',
					}}
				>
					O QUE ACONTECE QUANDO VOCÊ CRIA VÍDEO COM{' '}
					<span style={{ color: '#FF0022' }}>FERRAMENTAS NO-CODE:</span>
				</h1>
			</div>

			{/* ══════════════ 3. OS 3 SINTOMAS REAIS (CARDS ESTRUTURADOS) ══════════════ */}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 18,
					margin: '14px 0',
				}}
			>
				{/* Sintoma 01 */}
				<div
					style={{
						background: '#FFFFFF',
						border: '1px solid rgba(0, 0, 0, 0.08)',
						borderLeft: '6px solid #FF0022',
						borderRadius: 20,
						padding: '24px 28px',
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
						boxShadow: '0 10px 30px -8px rgba(0, 0, 0, 0.06)',
						opacity: Math.min(Math.max(card1Entrance, 0), 1),
						transform: `translateY(${(1 - card1Entrance) * 20}px)`,
					}}
				>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span
							style={{
								fontFamily: fontPlusJakartaSans,
								fontSize: 20,
								fontWeight: 800,
								color: '#09090B',
								letterSpacing: '0.02em',
								textTransform: 'uppercase',
							}}
						>
							1. O Visual Robótico Genérico
						</span>
						<span
							style={{
								fontFamily: fontMono,
								fontSize: 13,
								fontWeight: 700,
								color: '#FF0022',
								background: 'rgba(255, 0, 34, 0.08)',
								padding: '4px 10px',
								borderRadius: 6,
							}}
						>
							SLOP 99%
						</span>
					</div>
					<p
						style={{
							fontFamily: fontPlusJakartaSans,
							fontSize: 18,
							lineHeight: 1.44,
							color: '#475569',
							margin: 0,
							fontWeight: 600,
						}}
					>
						Gradientes roxos saturados, avatares plásticos sem expressão e transições prontas. A audiência identifica em 1 segundo e pula o vídeo instantaneamente.
					</p>
				</div>

				{/* Sintoma 02 */}
				<div
					style={{
						background: '#FFFFFF',
						border: '1px solid rgba(0, 0, 0, 0.08)',
						borderLeft: '6px solid #09090B',
						borderRadius: 20,
						padding: '24px 28px',
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
						boxShadow: '0 10px 30px -8px rgba(0, 0, 0, 0.06)',
						opacity: Math.min(Math.max(card2Entrance, 0), 1),
						transform: `translateY(${(1 - card2Entrance) * 20}px)`,
					}}
				>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span
							style={{
								fontFamily: fontPlusJakartaSans,
								fontSize: 20,
								fontWeight: 800,
								color: '#09090B',
								letterSpacing: '0.02em',
								textTransform: 'uppercase',
							}}
						>
							2. Zero Controle e Preso na Web UI
						</span>
						<span
							style={{
								fontFamily: fontMono,
								fontSize: 13,
								fontWeight: 700,
								color: '#64748B',
								background: 'rgba(0, 0, 0, 0.05)',
								padding: '4px 10px',
								borderRadius: 6,
							}}
						>
							LOCK-IN
						</span>
					</div>
					<p
						style={{
							fontFamily: fontPlusJakartaSans,
							fontSize: 18,
							lineHeight: 1.44,
							color: '#475569',
							margin: 0,
							fontWeight: 600,
						}}
					>
						Impossível versionar no Git, impossível delegar para agentes autônomos (Claude/Codex). Qualquer alteração exige arrastar caixas em telas lentas.
					</p>
				</div>

				{/* Sintoma 03 */}
				<div
					style={{
						background: '#FFFFFF',
						border: '1px solid rgba(0, 0, 0, 0.08)',
						borderLeft: '6px solid #FF0022',
						borderRadius: 20,
						padding: '24px 28px',
						display: 'flex',
						flexDirection: 'column',
						gap: 8,
						boxShadow: '0 10px 30px -8px rgba(0, 0, 0, 0.06)',
						opacity: Math.min(Math.max(card3Entrance, 0), 1),
						transform: `translateY(${(1 - card3Entrance) * 20}px)`,
					}}
				>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span
							style={{
								fontFamily: fontPlusJakartaSans,
								fontSize: 20,
								fontWeight: 800,
								color: '#09090B',
								letterSpacing: '0.02em',
								textTransform: 'uppercase',
							}}
						>
							3. O Sequestro de Créditos Pagos
						</span>
						<span
							style={{
								fontFamily: fontMono,
								fontSize: 13,
								fontWeight: 700,
								color: '#FF0022',
								background: 'rgba(255, 0, 34, 0.08)',
								padding: '4px 10px',
								borderRadius: 6,
							}}
						>
							$$$ LIMIT
						</span>
					</div>
					<p
						style={{
							fontFamily: fontPlusJakartaSans,
							fontSize: 18,
							lineHeight: 1.44,
							color: '#475569',
							margin: 0,
							fontWeight: 600,
						}}
					>
						Cada render para testar uma fonte consome créditos caros. Em 4 tentativas seus créditos acabam e o vídeo ainda não ficou no padrão que você exigia.
					</p>
				</div>
			</div>

			{/* ══════════════ 4. BLOCO DE IMPACTO CONCLUSIVO ══════════════ */}
			<div
				style={{
					background: '#09090B',
					border: '1px solid rgba(255, 255, 255, 0.12)',
					borderRadius: 20,
					padding: '24px 32px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35)',
					opacity: Math.min(Math.max(footerCalloutEntrance, 0), 1),
					transform: `scale(${0.97 + footerCalloutEntrance * 0.03})`,
				}}
			>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
					<span
						style={{
							fontFamily: fontMono,
							fontSize: 13,
							color: '#FF4D6D',
							letterSpacing: '0.18em',
							fontWeight: 700,
							textTransform: 'uppercase',
						}}
					>
						A VERDADE BRUTAL:
					</span>
					<span
						style={{
							fontFamily: fontPlusJakartaSans,
							fontSize: 20,
							fontWeight: 700,
							color: '#FFFFFF',
							lineHeight: 1.3,
						}}
					>
						O erro não é da IA.{' '}
						<span
							style={{
								fontFamily: fontInstrumentSerif,
								fontStyle: 'italic',
								fontSize: 24,
								color: '#E2E8F0',
								fontWeight: 400,
							}}
						>
							É criar conteúdo profissional em ferramentas de brinquedo.
						</span>
					</span>
				</div>
			</div>

			{/* ══════════════ 5. FOOTER EDITORIAL INFERIOR ══════════════ */}
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
				<span style={{ color: '#64748B' }}>GABRIEL TOLEDO</span>
				<span style={{ color: '#09090B' }}>ARRASTA PRO LADO  →</span>
			</div>
		</AbsoluteFill>
	);
};
