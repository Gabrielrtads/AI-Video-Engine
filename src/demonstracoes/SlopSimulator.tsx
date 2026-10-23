import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

const { fontFamily: fontAnton } = loadAnton();
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const SlopSimulator: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const t = frame / fps;

	// Efeito de glitch e pulso no gradiente roxo slop
	const glitchShift = Math.sin(t * 18) * 4;
	const purplePulse = Math.sin(t * 4) * 0.15 + 0.85;

	// Carimbo brutalista de rejeição caindo no frame 92 (cerca de 3.0s)
	const stampSpring = spring({
		frame: Math.max(0, frame - 90),
		fps,
		config: { damping: 13, mass: 0.45, stiffness: 220 },
	});

	const stampScale = frame < 90 ? 0 : interpolate(stampSpring, [0, 1], [2.4, 1.0]);
	const stampOpacity = frame < 90 ? 0 : interpolate(stampSpring, [0, 0.2, 1], [0, 0.8, 1]);

	return (
		<div
			style={{
				width: 580,
				height: 725,
				borderRadius: 26,
				overflow: 'hidden',
				boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.5), 0 10px 30px -5px rgba(0, 0, 0, 0.2)',
				border: '1.5px solid rgba(168, 85, 247, 0.4)',
				background: '#0d0b14',
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: 32,
				boxSizing: 'border-box',
			}}
		>
			{/* Top Bar da Ferramenta Genérica */}
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 8,
						background: 'rgba(168, 85, 247, 0.15)',
						border: '1px solid rgba(168, 85, 247, 0.3)',
						borderRadius: 999,
						padding: '6px 14px',
						fontFamily: fontMono,
						fontSize: 12,
						color: '#c084fc',
						fontWeight: 700,
					}}
				>
					<span style={{ fontSize: 14 }}>⚠️</span> AI VIDEO GENERATOR v0.1
				</div>
				<span style={{ fontFamily: fontMono, fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' }}>
					CRÉDITOS: 0 / 10
				</span>
			</div>

			{/* Caixa de Prompt Clichê */}
			<div
				style={{
					background: 'rgba(255, 255, 255, 0.03)',
					border: '1px dashed rgba(168, 85, 247, 0.5)',
					borderRadius: 18,
					padding: 18,
					display: 'flex',
					flexDirection: 'column',
					gap: 8,
				}}
			>
				<span style={{ fontFamily: fontMono, fontSize: 11, color: '#c084fc', textTransform: 'uppercase' }}>
					Prompt Clichê Digitado:
				</span>
				<span style={{ fontFamily: fontPlusJakartaSans, fontSize: 15, color: '#e2e8f0', lineHeight: 1.4 }}>
					"Crie um vídeo futurista com gradiente roxo, robôs neon brilhantes e transições aleatórias..."
				</span>
			</div>

			{/* Visualizador de Render com o Slop Roxo Glitcheado */}
			<div
				style={{
					width: '100%',
					height: 230,
					borderRadius: 18,
					background: `radial-gradient(circle at 50% 50%, rgba(168, 85, 247, ${purplePulse}) 0%, rgba(88, 28, 135, 0.7) 60%, #0a0612 100%)`,
					border: '1px solid rgba(168, 85, 247, 0.4)',
					position: 'relative',
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{/* Linhas de scanline simuladas */}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 3px, rgba(0,0,0,0.3) 4px)',
						pointerEvents: 'none',
					}}
				/>

				{/* Avatar de Robô IA tosco com glitch */}
				<div
					style={{
						fontSize: 72,
						transform: `translate(${glitchShift}px, 0)`,
						filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))',
					}}
				>
					🤖
				</div>

				<div
					style={{
						fontFamily: fontMono,
						fontSize: 12,
						color: '#f3e8ff',
						marginTop: 8,
						background: 'rgba(0, 0, 0, 0.6)',
						padding: '4px 10px',
						borderRadius: 6,
					}}
				>
					Render genérico: 1.2s de retenção
				</div>
			</div>

			{/* Métricas de Desastre */}
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
				<div
					style={{
						background: 'rgba(239, 68, 68, 0.08)',
						border: '1px solid rgba(239, 68, 68, 0.25)',
						borderRadius: 14,
						padding: 12,
						textAlign: 'center',
					}}
				>
					<div style={{ fontFamily: fontMono, fontSize: 10, color: '#f87171' }}>RETENÇÃO</div>
					<div style={{ fontFamily: fontAnton, fontSize: 24, color: '#ef4444', marginTop: 2 }}>1.2s</div>
				</div>
				<div
					style={{
						background: 'rgba(239, 68, 68, 0.08)',
						border: '1px solid rgba(239, 68, 68, 0.25)',
						borderRadius: 14,
						padding: 12,
						textAlign: 'center',
					}}
				>
					<div style={{ fontFamily: fontMono, fontSize: 10, color: '#f87171' }}>LOCK-IN</div>
					<div style={{ fontFamily: fontAnton, fontSize: 24, color: '#ef4444', marginTop: 2 }}>100%</div>
				</div>
				<div
					style={{
						background: 'rgba(239, 68, 68, 0.08)',
						border: '1px solid rgba(239, 68, 68, 0.25)',
						borderRadius: 14,
						padding: 12,
						textAlign: 'center',
					}}
				>
					<div style={{ fontFamily: fontMono, fontSize: 10, color: '#f87171' }}>CUSTO</div>
					<div style={{ fontFamily: fontAnton, fontSize: 24, color: '#ef4444', marginTop: 2 }}>$49/MÊS</div>
				</div>
			</div>

			{/* Carimbo Brutalista de Rejeição SLOP */}
			<div
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: `translate(-50%, -50%) rotate(-7deg) scale(${stampScale})`,
					opacity: stampOpacity,
					border: '4px solid #FF0022',
					borderRadius: 16,
					padding: '16px 28px',
					background: 'rgba(255, 0, 34, 0.2)',
					boxShadow: '0 0 50px rgba(255, 0, 34, 0.5), inset 0 0 20px rgba(255, 0, 34, 0.3)',
					pointerEvents: 'none',
					zIndex: 50,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 4,
				}}
			>
				<span
					style={{
						fontFamily: fontAnton,
						fontSize: 42,
						color: '#FF0022',
						letterSpacing: '0.08em',
						textShadow: '0 0 20px rgba(255,0,34,0.8)',
					}}
				>
					REJEITADO POR SLOP
				</span>
				<span
					style={{
						fontFamily: fontMono,
						fontSize: 13,
						color: '#ffffff',
						fontWeight: 800,
						letterSpacing: '0.15em',
						background: '#FF0022',
						padding: '2px 10px',
						borderRadius: 4,
					}}
				>
					99% GENÉRICO • ZERO ALMA
				</span>
			</div>
		</div>
	);
};
