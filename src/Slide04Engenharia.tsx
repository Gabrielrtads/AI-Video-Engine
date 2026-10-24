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

export const Slide04Engenharia: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Animação elástica de entrada em cascata
	const titleEntrance = spring({
		frame: Math.max(0, frame - 2),
		fps,
		config: { damping: 16, mass: 0.7, stiffness: 120 },
	});

	const module1Entrance = spring({
		frame: Math.max(0, frame - 10),
		fps,
		config: { damping: 18, mass: 0.8, stiffness: 100 },
	});

	const module2Entrance = spring({
		frame: Math.max(0, frame - 18),
		fps,
		config: { damping: 18, mass: 0.8, stiffness: 100 },
	});

	const bannerEntrance = spring({
		frame: Math.max(0, frame - 26),
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
							background: '#09090B',
							color: '#FFFFFF',
							padding: '3px 10px',
							borderRadius: 6,
							fontSize: 14,
							fontWeight: 700,
							letterSpacing: '0.08em',
						}}
					>
						04
					</span>
					<span style={{ color: '#FF0022', fontWeight: 700 }}>ENGENHARIA</span>
				</div>
			</div>

			{/* ══════════════ 2. TÍTULO BRUTALISTA DE IMPACTO ══════════════ */}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 10,
					marginTop: 8,
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
					— ESPECIFICAÇÃO DE ALTA PERFORMANCE
				</span>

				<h1
					style={{
						fontFamily: fontBebas,
						fontSize: 108,
						lineHeight: 0.91,
						letterSpacing: '0.01em',
						color: '#09090B',
						margin: 0,
						textTransform: 'uppercase',
					}}
				>
					FÍSICA DE MOLA APPLE.{' '}
					<span style={{ color: '#FF0022' }}>SOM EBU R128.</span>
				</h1>
			</div>

			{/* ══════════════ 3. DOIS MÓDULOS TÉCNICOS SPLIT ══════════════ */}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 18,
					margin: '8px 0',
				}}
			>
				{/* Módulo 01: Física de Mola Apple */}
				<div
					style={{
						background: '#FFFFFF',
						border: '1px solid rgba(0, 0, 0, 0.09)',
						borderRadius: 22,
						padding: '24px 28px',
						boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.05)',
						display: 'flex',
						flexDirection: 'column',
						gap: 14,
						opacity: Math.min(Math.max(module1Entrance, 0), 1),
						transform: `translateY(${(1 - module1Entrance) * 20}px)`,
					}}
				>
					{/* Header do Módulo */}
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
							<span
								style={{
									background: 'rgba(255, 0, 34, 0.12)',
									border: '1px solid rgba(255, 0, 34, 0.35)',
									color: '#FF0022',
									fontFamily: fontMono,
									fontSize: 13,
									fontWeight: 800,
									padding: '4px 10px',
									borderRadius: 6,
								}}
							>
								MOTION
							</span>
							<span style={{ fontFamily: fontPlusJakartaSans, fontSize: 20, fontWeight: 800, color: '#09090B' }}>
								Apple Spring Engine (Amortecimento Crítico)
							</span>
						</div>
						<span style={{ fontFamily: fontMono, fontSize: 13, color: '#64748B' }}>
							damping: 20 • mass: 0.85
						</span>
					</div>

					{/* Gráfico Visualizador Técnico da Mola */}
					<div
						style={{
							background: '#09090B',
							borderRadius: 14,
							padding: '16px 20px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: 20,
						}}
					>
						<svg width="240" height="48" viewBox="0 0 240 48" style={{ overflow: 'visible' }}>
							<path
								d="M 10 40 Q 40 4, 80 10 T 140 18 T 190 18 L 230 18"
								fill="none"
								stroke="#10B981"
								strokeWidth="3.5"
								strokeLinecap="round"
							/>
							<circle cx="140" cy="18" r="5" fill="#FF0022" />
						</svg>

						<div style={{ display: 'flex', gap: 14, fontFamily: fontMono, fontSize: 12 }}>
							<span style={{ color: '#34D399' }}>✔ Zero Overshoot</span>
							<span style={{ color: '#E2E8F0' }}>✔ Inércia Natural</span>
							<span style={{ color: '#A1A1AA' }}>✔ 30 FPS Fluido</span>
						</div>
					</div>

					<p
						style={{
							fontFamily: fontPlusJakartaSans,
							fontSize: 17,
							lineHeight: 1.44,
							color: '#475569',
							margin: 0,
							fontWeight: 600,
						}}
					>
						Adeus interpolações lineares robóticas. O movimento no Vibe Design Studio segue as leis físicas da inércia, gerando sensação tátil e agradável que prende a atenção.
					</p>
				</div>

				{/* Módulo 02: Áudio e Masterização EBU R128 */}
				<div
					style={{
						background: '#FFFFFF',
						border: '1px solid rgba(0, 0, 0, 0.09)',
						borderRadius: 22,
						padding: '24px 28px',
						boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.05)',
						display: 'flex',
						flexDirection: 'column',
						gap: 14,
						opacity: Math.min(Math.max(module2Entrance, 0), 1),
						transform: `translateY(${(1 - module2Entrance) * 20}px)`,
					}}
				>
					{/* Header do Módulo */}
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
							<span
								style={{
									background: 'rgba(16, 185, 129, 0.12)',
									border: '1px solid rgba(16, 185, 129, 0.35)',
									color: '#059669',
									fontFamily: fontMono,
									fontSize: 13,
									fontWeight: 800,
									padding: '4px 10px',
									borderRadius: 6,
								}}
							>
								AUDIO
							</span>
							<span style={{ fontFamily: fontPlusJakartaSans, fontSize: 20, fontWeight: 800, color: '#09090B' }}>
								Masterização Broadcast EBU R128
							</span>
						</div>
						<span style={{ fontFamily: fontMono, fontSize: 13, color: '#059669', fontWeight: 700 }}>
							-14.0 LUFS LOCKED
						</span>
					</div>

					{/* Console de Medição de Volume */}
					<div
						style={{
							background: '#09090B',
							borderRadius: 14,
							padding: '16px 20px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}
					>
						<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<span style={{ fontFamily: fontMono, fontSize: 10, color: '#94A3B8' }}>LOUDNESS</span>
								<span style={{ fontFamily: fontBebas, fontSize: 28, color: '#10B981' }}>-14 LUFS</span>
							</div>
							<div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<span style={{ fontFamily: fontMono, fontSize: 10, color: '#94A3B8' }}>TRUE PEAK</span>
								<span style={{ fontFamily: fontBebas, fontSize: 28, color: '#FFFFFF' }}>-1.0 dB</span>
							</div>
							<div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />
							<div style={{ display: 'flex', flexDirection: 'column' }}>
								<span style={{ fontFamily: fontMono, fontSize: 10, color: '#94A3B8' }}>DUCKING</span>
								<span style={{ fontFamily: fontBebas, fontSize: 28, color: '#FF0022' }}>AUTO MATH</span>
							</div>
						</div>

						<div style={{ display: 'flex', gap: 6 }}>
							{['WHOOSH', 'CLICK', 'SUB-DROP'].map((sfx, idx) => (
								<span
									key={idx}
									style={{
										background: 'rgba(255,255,255,0.08)',
										color: '#E2E8F0',
										fontFamily: fontMono,
										fontSize: 11,
										fontWeight: 700,
										padding: '4px 8px',
										borderRadius: 6,
									}}
								>
									{sfx}
								</span>
							))}
						</div>
					</div>

					<p
						style={{
							fontFamily: fontPlusJakartaSans,
							fontSize: 17,
							lineHeight: 1.44,
							color: '#475569',
							margin: 0,
							fontWeight: 600,
						}}
					>
						A trilha sonora se abaixa dinamicamente na frequência da voz (Auto-Ducking matematico). O áudio sai encorpado, sem estourar e pronto para fones e celulares.
					</p>
				</div>
			</div>

			{/* ══════════════ 4. BANNER DE IMPACTO EDITORIAL ══════════════ */}
			<div
				style={{
					background: '#09090B',
					border: '1px solid rgba(255, 255, 255, 0.12)',
					borderRadius: 20,
					padding: '22px 30px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.25)',
					opacity: Math.min(Math.max(bannerEntrance, 0), 1),
					transform: `scale(${0.97 + bannerEntrance * 0.03})`,
				}}
			>
				<span
					style={{
						fontFamily: fontPlusJakartaSans,
						fontSize: 19,
						fontWeight: 700,
						color: '#FFFFFF',
						lineHeight: 1.35,
					}}
				>
					A diferença entre o amador e o viral{' '}
					<span
						style={{
							fontFamily: fontInstrumentSerif,
							fontStyle: 'italic',
							fontSize: 23,
							color: '#E2E8F0',
							fontWeight: 400,
						}}
					>
						está nos detalhes matemáticos que ninguém vê, mas todo mundo sente.
					</span>
				</span>
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
