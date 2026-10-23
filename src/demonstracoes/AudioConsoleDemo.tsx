import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

const { fontFamily: fontAnton } = loadAnton();
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const AudioConsoleDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const t = frame / fps;

	// Simulação de oscilação realista de decibéis estéreo com base na fala
	const vuLeft = Math.floor(interpolate(Math.sin(t * 12) * Math.cos(t * 7), [-1, 1], [6, 18]));
	const vuRight = Math.floor(interpolate(Math.sin(t * 10 + 1) * Math.cos(t * 8), [-1, 1], [5, 17]));

	// Oscilação fina do medidor LUFS em torno do alvo -14.0 LUFS
	const lufsOffset = (Math.sin(t * 3) * 0.2).toFixed(1);
	const currentLufs = (-14.0 + parseFloat(lufsOffset)).toFixed(1);

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
			{/* Header do Console */}
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
					<span>🎚️</span> EBU R128 AUDIO ENGINE
				</div>
				<span style={{ fontFamily: fontMono, fontSize: 11, color: '#10B981', fontWeight: 700 }}>
					● NORMALIZED (-14 LUFS)
				</span>
			</div>

			{/* Painel Central: VU Meters Estéreo Pulsando ao Vivo */}
			<div
				style={{
					width: '100%',
					height: 250,
					borderRadius: 20,
					background: '#0a0a0f',
					border: '1px solid rgba(0, 0, 0, 0.15)',
					padding: 24,
					boxSizing: 'border-box',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
				}}
			>
				{/* Medidores de LUFS e True Peak */}
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
					<div
						style={{
							background: 'rgba(255, 255, 255, 0.04)',
							border: '1px solid rgba(255, 255, 255, 0.08)',
							borderRadius: 14,
							padding: 12,
						}}
					>
						<span style={{ fontFamily: fontMono, fontSize: 10, color: 'rgba(255, 255, 255, 0.5)' }}>
							INTEGRATED LOUDNESS
						</span>
						<div
							style={{
								fontFamily: fontAnton,
								fontSize: 32,
								color: '#10B981',
								marginTop: 4,
								display: 'flex',
								alignItems: 'baseline',
								gap: 4,
							}}
						>
							<span>{currentLufs}</span>
							<span style={{ fontSize: 14, fontFamily: fontMono, color: '#34d399' }}>LUFS</span>
						</div>
					</div>

					<div
						style={{
							background: 'rgba(255, 255, 255, 0.04)',
							border: '1px solid rgba(255, 255, 255, 0.08)',
							borderRadius: 14,
							padding: 12,
						}}
					>
						<span style={{ fontFamily: fontMono, fontSize: 10, color: 'rgba(255, 255, 255, 0.5)' }}>
							TRUE PEAK CEILING
						</span>
						<div
							style={{
								fontFamily: fontAnton,
								fontSize: 32,
								color: '#38BDF8',
								marginTop: 4,
								display: 'flex',
								alignItems: 'baseline',
								gap: 4,
							}}
						>
							<span>-1.0</span>
							<span style={{ fontSize: 14, fontFamily: fontMono, color: '#7dd3fc' }}>dBTP</span>
						</div>
					</div>
				</div>

				{/* Barras de VU Meter LED ao Vivo (L / R) */}
				<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
					{/* Canal L */}
					<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
						<span style={{ fontFamily: fontMono, fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 14 }}>
							L
						</span>
						<div style={{ display: 'flex', gap: 3, flex: 1 }}>
							{Array.from({ length: 22 }).map((_, idx) => {
								const isActive = idx < vuLeft;
								const isRed = idx >= 18;
								const isYellow = idx >= 13 && idx < 18;
								const color = isRed ? '#ef4444' : (isYellow ? '#fbbf24' : '#10B981');
								return (
									<div
										key={idx}
										style={{
											flex: 1,
											height: 14,
											borderRadius: 2,
											background: isActive ? color : 'rgba(255, 255, 255, 0.08)',
											boxShadow: isActive ? `0 0 6px ${color}` : 'none',
										}}
									/>
								);
							})}
						</div>
					</div>

					{/* Canal R */}
					<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
						<span style={{ fontFamily: fontMono, fontSize: 11, color: 'rgba(255,255,255,0.4)', width: 14 }}>
							R
						</span>
						<div style={{ display: 'flex', gap: 3, flex: 1 }}>
							{Array.from({ length: 22 }).map((_, idx) => {
								const isActive = idx < vuRight;
								const isRed = idx >= 18;
								const isYellow = idx >= 13 && idx < 18;
								const color = isRed ? '#ef4444' : (isYellow ? '#fbbf24' : '#10B981');
								return (
									<div
										key={idx}
										style={{
											flex: 1,
											height: 14,
											borderRadius: 2,
											background: isActive ? color : 'rgba(255, 255, 255, 0.08)',
											boxShadow: isActive ? `0 0 6px ${color}` : 'none',
										}}
									/>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* Módulo de Auto-Ducking da Trilha Lo-Fi */}
			<div
				style={{
					background: '#f1f3f6',
					borderRadius: 18,
					padding: 16,
					border: '1px solid rgba(0, 0, 0, 0.06)',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<div>
					<div style={{ fontFamily: fontMono, fontSize: 11, fontWeight: 700, color: '#000000' }}>
						SMART AUTO-DUCKING (-12 dB)
					</div>
					<div style={{ fontFamily: fontPlusJakartaSans, fontSize: 12, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>
						Trilha abaixa na voz e sobe nas pausas
					</div>
				</div>
				<span
					style={{
						fontFamily: fontMono,
						fontSize: 11,
						color: '#10B981',
						fontWeight: 800,
						background: '#ffffff',
						padding: '4px 10px',
						borderRadius: 8,
						border: '1px solid rgba(0,0,0,0.08)',
					}}
				>
					ACTIVE
				</span>
			</div>

			{/* Rodapé de Som Encorpado */}
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
				Áudio encorpado para alto-falantes de celular, sem estourar.
			</div>
		</div>
	);
};
