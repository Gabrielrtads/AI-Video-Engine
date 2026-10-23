import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface CursorWaypoint {
	frame: number;
	x: number;
	y: number;
	clickFrame?: number; // Se houver clique neste ponto
}

export interface AnimatedCursorProps {
	waypoints: CursorWaypoint[];
	visibleStartFrame?: number;
	visibleEndFrame?: number;
}

export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({
	waypoints,
	visibleStartFrame = 0,
	visibleEndFrame = 9999,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	if (frame < visibleStartFrame || frame > visibleEndFrame) {
		return null;
	}

	if (waypoints.length === 0) return null;

	// Se o frame for menor que o primeiro waypoint, posiciona no primeiro
	if (frame <= waypoints[0].frame) {
		const first = waypoints[0];
		return renderCursor(first.x, first.y, 1.0, false);
	}

	// Se o frame for maior que o último waypoint, posiciona no último
	if (frame >= waypoints[waypoints.length - 1].frame) {
		const last = waypoints[waypoints.length - 1];
		return renderCursor(last.x, last.y, 1.0, false);
	}

	// Encontra o segmento atual entre dois waypoints
	let prevIndex = 0;
	for (let i = 0; i < waypoints.length - 1; i++) {
		if (frame >= waypoints[i].frame && frame <= waypoints[i + 1].frame) {
			prevIndex = i;
			break;
		}
	}

	const p1 = waypoints[prevIndex];
	const p2 = waypoints[prevIndex + 1];

	// Interpolação suave cúbica com ease-in-out
	const segmentProgress = interpolate(frame, [p1.frame, p2.frame], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Easing cúbico para movimento natural de mão humana
	const smoothProgress =
		segmentProgress < 0.5
			? 4 * segmentProgress * segmentProgress * segmentProgress
			: 1 - Math.pow(-2 * segmentProgress + 2, 3) / 2;

	const currentX = p1.x + (p2.x - p1.x) * smoothProgress;
	const currentY = p1.y + (p2.y - p1.y) * smoothProgress;

	// Checa se há animação de clique próxima
	let isClicking = false;
	let clickProgress = 0;

	for (const wp of waypoints) {
		if (wp.clickFrame !== undefined && Math.abs(frame - wp.clickFrame) <= 10) {
			isClicking = true;
			const clickAge = frame - (wp.clickFrame - 4);
			clickProgress = spring({
				frame: Math.max(0, clickAge),
				fps,
				config: { damping: 12, stiffness: 250 },
			});
			break;
		}
	}

	const scale = isClicking
		? interpolate(clickProgress, [0, 0.5, 1], [1.0, 0.82, 1.0])
		: 1.0;

	return renderCursor(currentX, currentY, scale, isClicking);
};

function renderCursor(x: number, y: number, scale: number, isClicking: boolean) {
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-2px, -2px) scale(${scale})`,
				pointerEvents: 'none',
				zIndex: 90,
				filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.75))',
			}}
		>
			{/* Efeito Ripple de Clique */}
			{isClicking && (
				<div
					style={{
						position: 'absolute',
						left: 4,
						top: 4,
						width: 32,
						height: 32,
						borderRadius: '50%',
						border: '2px solid rgba(56, 189, 248, 0.85)',
						background: 'rgba(56, 189, 248, 0.25)',
						transform: 'translate(-50%, -50%)',
						pointerEvents: 'none',
					}}
				/>
			)}

			{/* Vetor Clássico do Cursor macOS em SVG */}
			<svg
				width="28"
				height="28"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M5.5 3.2L18.4 12.3C19.1 12.8 18.8 13.9 17.9 14.1L12.7 15L9.6 20.8C9.2 21.6 8.1 21.8 7.4 21.2L6 20.1C5.3 19.5 5.2 18.4 5.7 17.6L8.8 11.9L4.4 9.8C3.6 9.4 3.5 8.3 4.2 7.7L5.5 3.2Z"
					fill="#FFFFFF"
					stroke="#000000"
					strokeWidth="1.8"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	);
}
