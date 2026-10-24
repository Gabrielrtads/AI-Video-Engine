import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

const { fontFamily: fontAnton } = loadAnton();
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const AppleSpringDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Ciclo de mola Apple quicando ao vivo (reinicia a cada 60 frames)
	const localFrame = frame % 60;
	const appleSpringValue = spring({
		frame: localFrame,
		fps,
		config: {
			damping: 18,
			mass: 0.8,
			stiffness: 120,
		},
	});

	// Deslocamento físico em pixels da mola
	const puckY = interpolate(appleSpringValue, [0, 1], [-70, 0]);
	const puckScale = interpolate(appleSpringValue, [0, 0.5, 1], [0.85, 1.08, 1.0]);

	// Progresso da agulha de áudio no milissegundo
	const scrubberProgress = ((frame % 90) / 90) * 100;

	return (
		<div
			style={{
				width: 580,
				height: 725,
				borderRadius: 26,
				overflow: 'hidden',
				boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.22), 0 10px 25px -5px rgba(0, 0, 0, 0.1)',
				border: '1px solid rgba(0, 0, 0, 0.08)',
				background: '#FCFCFD',
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: 28,
				boxSizing: 'border-box',
			}}
		>
			{/* Header Técnico */}
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 8,
						background: 'rgba(0, 0, 0, 0.05)',
						border: '1px solid rgba(0, 0, 0, 0.1)',
						borderRadius: 999,
						padding: '6px 14px',
						fontFamily: fontMono,
						fontSize: 12,
						color: '#000000',
						fontWeight: 700,
					}}
				>
					<span></span> APPLE SPRING ENGINE
				</div>
				<span style={{ fontFamily: fontMono, fontSize: 11, color: '#10B981', fontWeight: 700 }}>
					● LIVE PHYSICS (30 FPS)
				</span>
			</div>

			{/* Simulador Físico da Mola Quicando ao Vivo */}
			<div
				style={{
					width: '100%',
					height: 240,
					borderRadius: 20,
					background: '#0a0a0f',
					border: '1px solid rgba(0, 0, 0, 0.15)',
					position: 'relative',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					overflow: 'hidden',
				}}
			>
				{/* Grid de régua métrica ao fundo */}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						opacity: 0.15,
						backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
						backgroundSize: '20px 20px',
					}}
				/>

				{/* Linha guia de repouso (zero overshoot) */}
				<div
					style={{
						position: 'absolute',
						top: '55%',
						left: 20,
						right: 20,
						borderTop: '1px dashed rgba(255, 255, 255, 0.2)',
					}}
				/>

				{/* Puck / Cartão Quicando com a Mola Apple */}
				<div
					style={{
						transform: `translateY(${puckY}px) scale(${puckScale})`,
						background: 'linear-gradient(135deg, #222228 0%, #111116 100%)',
						border: '1.5px solid #FF0022',
						boxShadow: '0 15px 40px rgba(255, 0, 34, 0.35)',
						borderRadius: 18,
						padding: '12px 24px',
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						zIndex: 10,
					}}
				>
					<span style={{ fontSize: 24, color: '#ffffff' }}></span>
					<div>
						<div style={{ fontFamily: fontMono, fontSize: 13, color: '#ffffff', fontWeight: 700 }}>
							Critical Damping
						</div>
						<div style={{ fontFamily: fontMono, fontSize: 10, color: '#FF0022' }}>
							Zero Overshoot • Natural
						</div>
					</div>
				</div>

				{/* Parâmetros em tempo real */}
				<div
					style={{
						position: 'absolute',
						bottom: 12,
						left: 20,
						right: 20,
						display: 'flex',
						justifyContent: 'space-between',
						fontFamily: fontMono,
						fontSize: 10,
						color: 'rgba(255, 255, 255, 0.5)',
					}}
				>
					<span>damping: 20</span>
					<span>mass: 0.85</span>
					<span>stiffness: 90</span>
					<span style={{ color: '#10B981' }}>delta: 0.00ms</span>
				</div>
			</div>

			{/* Módulo Whisper: Sincronização Milissegundo ao Vivo */}
			<div
				style={{
					background: '#f1f3f6',
					borderRadius: 18,
					padding: 16,
					border: '1px solid rgba(0, 0, 0, 0.06)',
					display: 'flex',
					flexDirection: 'column',
					gap: 10,
				}}
			>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<span style={{ fontFamily: fontMono, fontSize: 11, fontWeight: 700, color: '#000000' }}>
						WHISPER SUB-15MS SYNC
					</span>
					<span style={{ fontFamily: fontMono, fontSize: 10, color: '#059669', fontWeight: 700 }}>
						✔ TOKEN ALIGNED
					</span>
				</div>

				{/* Barra de Áudio com Agulha passando ao vivo */}
				<div
					style={{
						width: '100%',
						height: 28,
						background: '#ffffff',
						borderRadius: 8,
						border: '1px solid rgba(0, 0, 0, 0.1)',
						position: 'relative',
						overflow: 'hidden',
						display: 'flex',
						alignItems: 'center',
						padding: '0 8px',
						gap: 4,
					}}
				>
					{/* Agulha de scrub em tempo real */}
					<div
						style={{
							position: 'absolute',
							top: 0,
							bottom: 0,
							left: `${scrubberProgress}%`,
							width: 2,
							background: '#FF0022',
							boxShadow: '0 0 6px #FF0022',
							zIndex: 10,
						}}
					/>

					{/* Palavras sincronizadas */}
					{['Física', 'de', 'mola', 'Apple,', 'Whisper', 'Sync'].map((w, idx) => (
						<span
							key={idx}
							style={{
								fontFamily: fontMono,
								fontSize: 10,
								fontWeight: 700,
								color: scrubberProgress > idx * 16 ? '#000000' : 'rgba(0, 0, 0, 0.25)',
							}}
						>
							{w}
						</span>
					))}
				</div>
			</div>

			{/* Rodapé de Destaque */}
			<div
				style={{
					background: '#000000',
					color: '#ffffff',
					borderRadius: 14,
					padding: '12px 18px',
					textAlign: 'center',
					fontFamily: fontPlusJakartaSans,
					fontSize: 13,
					fontWeight: 600,
				}}
			>
				O fim das transições robóticas e legendas atrasadas.
			</div>
		</div>
	);
};
