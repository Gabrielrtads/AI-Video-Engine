import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SANS} from './kit';

interface AppleRetentionTimerProps {
	totalSeconds?: number;
}

export const AppleRetentionTimer: React.FC<AppleRetentionTimerProps> = ({totalSeconds = 30}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;

	// Entrada com mola no início do vídeo
	const entrance = spring({
		frame,
		fps,
		config: {damping: 14, mass: 0.6, stiffness: 120},
	});

	// Tempo restante dinâmico
	const remaining = Math.max(0, totalSeconds - t);
	const mins = Math.floor(remaining / 60);
	const secs = Math.floor(remaining % 60);
	const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;

	// Progresso de 1 (início) a 0 (fim)
	const progress = Math.max(0, Math.min(1, remaining / totalSeconds));

	// Pulso de respiração a cada segundo
	const pulse = 1 + Math.sin(t * Math.PI * 2) * 0.02;

	return (
		<div
			style={{
				position: 'absolute',
				top: 80,
				left: '50%',
				transform: `translateX(-50%) translateY(${(1 - entrance) * -60}px) scale(${entrance * pulse})`,
				opacity: entrance,
				zIndex: 90,
				pointerEvents: 'none',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 12,
					padding: '10px 24px',
					borderRadius: 999,
					background: 'rgba(12, 14, 20, 0.82)',
					backdropFilter: 'blur(24px)',
					WebkitBackdropFilter: 'blur(24px)',
					border: '1px solid rgba(255, 255, 255, 0.16)',
					boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), 0 0 1px rgba(255, 255, 255, 0.3)',
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				{/* Ícone de Cadeado Apple Minimalista */}
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="rgba(255, 255, 255, 0.9)"
					strokeWidth="2.4"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
					<path d="M7 11V7a5 5 0 0 1 10 0v4" />
				</svg>

				{/* Timer em fonte San Francisco / Inter */}
				<span
					style={{
						fontFamily: SANS,
						fontSize: 22,
						fontWeight: 600,
						color: '#FFFFFF',
						letterSpacing: '0.04em',
						fontVariantNumeric: 'tabular-nums',
					}}
				>
					{timeString}
				</span>

				{/* Linha fina de progresso no rodapé da cápsula */}
				<div
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						height: 2.5,
						width: `${progress * 100}%`,
						background: 'linear-gradient(90deg, #38BDF8 0%, #818CF8 100%)',
						boxShadow: '0 0 8px rgba(56, 189, 248, 0.8)',
						transition: 'width 0.1s linear',
					}}
				/>
			</div>
		</div>
	);
};
