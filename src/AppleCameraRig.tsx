import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import WORDS_DATA from './data/words.json';
import {
	calculateCameraTransform,
	CameraRigOptions,
	SceneTimestamps,
} from './apple_camera_math';

export { CameraRigOptions, SceneTimestamps };

export interface AppleCameraRigProps extends CameraRigOptions {
	children: React.ReactNode;
	/** Custom timestamps de transição de cena (opcional) */
	timestamps?: Partial<SceneTimestamps>;
	/** Habilita vinheta cinematográfica de estúdio (padrão: true) */
	enableVignette?: boolean;
}

/**
 * Câmera Cinemática 3D Apple com Drift Orgânico Contínuo e Punch-Ins via Spring.
 * Evita quadros estáticos e mortos entre as trocas de cena seguindo o padrão GenHQ.
 */
export const AppleCameraRig: React.FC<AppleCameraRigProps> = ({
	children,
	enableDrift = true,
	enableContinuousPushIn = true,
	driftIntensity = 1.0,
	pushInAmount = 0.025,
	timestamps,
	enableVignette = true,
}) => {
	const frame = useCurrentFrame();
	const { fps, width, height, durationInFrames } = useVideoConfig();
	const t = frame / fps;

	// Timestamps dinâmicos a partir do words.json ou defaults
	const sceneTimestamps: SceneTimestamps = useMemo(() => {
		const tScene1 =
			timestamps?.tScene1 ??
			(WORDS_DATA as any[]).find((w) => w.scene === 1)?.start ??
			4.4;
		const tScene2 =
			timestamps?.tScene2 ??
			(WORDS_DATA as any[]).find((w) => w.scene === 2)?.start ??
			13.3;
		const tScene3 =
			timestamps?.tScene3 ??
			(WORDS_DATA as any[]).find((w) => w.scene === 3)?.start ??
			23.8;
		return { tScene1, tScene2, tScene3 };
	}, [timestamps]);

	// Cálculo da transformação com molas + micro-drift orgânico + push-in contínuo
	const { scale, x, y, rotateZ } = calculateCameraTransform(
		frame,
		fps,
		durationInFrames,
		sceneTimestamps,
		{
			enableDrift,
			enableContinuousPushIn,
			driftIntensity,
			pushInAmount,
		}
	);

	// Foco e desfoque seletivo de profundidade de campo durante o holograma na mão
	const isInPlanetScene =
		t >= sceneTimestamps.tScene2 && t < sceneTimestamps.tScene3;
	const planetSceneAlpha = interpolate(
		t,
		[
			sceneTimestamps.tScene2 - 0.2,
			sceneTimestamps.tScene2 + 0.6,
			sceneTimestamps.tScene3 - 0.5,
			sceneTimestamps.tScene3,
		],
		[0, 1, 1, 0],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);

	return (
		<div
			style={{
				position: 'absolute',
				width,
				height,
				overflow: 'hidden',
				background: '#000000',
			}}
		>
			{/* Container de Câmera com Transformação Orgânica Contínua */}
			<div
				style={{
					width: '100%',
					height: '100%',
					transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotate(${rotateZ.toFixed(3)}deg)`,
					transformOrigin: '50% 45%',
					transition: 'filter 0.3s ease',
					filter: isInPlanetScene
						? `contrast(1.04) brightness(${1 - planetSceneAlpha * 0.12})`
						: undefined,
				}}
			>
				{children}
			</div>

			{/* Vinheta Cinemática Apple Suave */}
			{enableVignette && (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						pointerEvents: 'none',
						background:
							'radial-gradient(circle at 50% 45%, transparent 60%, rgba(0, 0, 0, 0.45) 100%)',
					}}
				/>
			)}

			{/* Efeito sutil de profundidade de campo quando o planeta holográfico estiver ativo */}
			{planetSceneAlpha > 0.01 && (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						pointerEvents: 'none',
						background:
							'radial-gradient(circle at 45% 65%, transparent 180px, rgba(4, 8, 16, 0.45) 450px)',
						opacity: planetSceneAlpha,
					}}
				/>
			)}
		</div>
	);
};
