import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import WORDS_DATA from './data/words.json';

interface AppleCameraRigProps {
	children: React.ReactNode;
}

export const AppleCameraRig: React.FC<AppleCameraRigProps> = ({children}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const t = frame / fps;

	// Timestamps exatos das cenas
	const tScene1 = (WORDS_DATA as any[]).find((w) => w.scene === 1)?.start ?? 4.4;
	const tScene2 = (WORDS_DATA as any[]).find((w) => w.scene === 2)?.start ?? 13.3;
	const tScene3 = (WORDS_DATA as any[]).find((w) => w.scene === 3)?.start ?? 23.8;

	// ════════════════════════════════════════════════════════════════════════════
	// CÂMERA DINÂMICA (PUNCH-INS DE ALTA RETENÇÃO)
	// ════════════════════════════════════════════════════════════════════════════
	let targetScale = 1.0;
	let targetY = 0;
	let targetX = 0;

	if (t < tScene1) {
		// Cena 0: Hook "100% feito com IA" -> Punch-in focado no rosto
		targetScale = 1.14;
		targetY = -35;
		targetX = 0;
	} else if (t < tScene2) {
		// Cena 1: "Elementos 3D ao redor" -> Plano aberto para ver o espaço
		targetScale = 1.0;
		targetY = 0;
		targetX = 0;
	} else if (t < tScene3) {
		// Cena 2: "Planeta aqui na minha mão" -> Punch-in focado nas mãos e no holograma
		targetScale = 1.22;
		targetY = -90;
		targetX = -18;
	} else {
		// Cena 3: Conclusão herói "100% inteligência artificial"
		targetScale = 1.08;
		targetY = -20;
		targetX = 0;
	}

	// Suavização orgânica com mola a cada transição
	// Calcula a transição mais próxima
	const fScene1 = Math.round(tScene1 * fps);
	const fScene2 = Math.round(tScene2 * fps);
	const fScene3 = Math.round(tScene3 * fps);

	let currentScale = 1.14;
	let currentY = -35;
	let currentX = 0;

	if (frame < fScene1) {
		currentScale = 1.14;
		currentY = -35;
		currentX = 0;
	} else if (frame < fScene2) {
		const s = spring({frame: frame - fScene1, fps, config: {damping: 18, mass: 0.7, stiffness: 140}});
		currentScale = interpolate(s, [0, 1], [1.14, 1.0]);
		currentY = interpolate(s, [0, 1], [-35, 0]);
		currentX = 0;
	} else if (frame < fScene3) {
		const s = spring({frame: frame - fScene2, fps, config: {damping: 16, mass: 0.6, stiffness: 150}});
		currentScale = interpolate(s, [0, 1], [1.0, 1.22]);
		currentY = interpolate(s, [0, 1], [0, -90]);
		currentX = interpolate(s, [0, 1], [0, -18]);
	} else {
		const s = spring({frame: frame - fScene3, fps, config: {damping: 18, mass: 0.8, stiffness: 120}});
		currentScale = interpolate(s, [0, 1], [1.22, 1.08]);
		currentY = interpolate(s, [0, 1], [-90, -20]);
		currentX = interpolate(s, [0, 1], [-18, 0]);
	}

	// Foco e desfoque seletivo de profundidade de campo durante o holograma na mão
	const isInPlanetScene = t >= tScene2 && t < tScene3;
	const planetSceneAlpha = interpolate(t, [tScene2 - 0.2, tScene2 + 0.6, tScene3 - 0.5, tScene3], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div style={{position: 'absolute', width, height, overflow: 'hidden', background: '#000000'}}>
			{/* Container de Câmera com Transformação */}
			<div
				style={{
					width: '100%',
					height: '100%',
					transform: `scale(${currentScale}) translate(${currentX}px, ${currentY}px)`,
					transformOrigin: '50% 45%',
					transition: 'filter 0.3s ease',
					filter: isInPlanetScene ? `contrast(1.04) brightness(${1 - planetSceneAlpha * 0.12})` : undefined,
				}}
			>
				{children}
			</div>

			{/* Vinheta Cinemática Apple Suave */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					background: 'radial-gradient(circle at 50% 45%, transparent 60%, rgba(0, 0, 0, 0.45) 100%)',
				}}
			/>

			{/* Efeito sutil de profundidade de campo quando o planeta holográfico estiver ativo */}
			{planetSceneAlpha > 0.01 && (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						pointerEvents: 'none',
						background: 'radial-gradient(circle at 45% 65%, transparent 180px, rgba(4, 8, 16, 0.45) 450px)',
						opacity: planetSceneAlpha,
					}}
				/>
			)}
		</div>
	);
};
