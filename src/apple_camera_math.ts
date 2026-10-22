import { interpolate, spring } from 'remotion';

export interface CameraRigState {
	/** Escala final combinada (basePunchIn * continuousPushIn) */
	scale: number;
	/** Translação horizontal final em pixels (baseX + driftX) */
	x: number;
	/** Translação vertical final em pixels (baseY + driftY) */
	y: number;
	/** Micro-inclinação rotacional orgânica em graus */
	rotateZ: number;
	/** Escala estrita da cena sem drift */
	baseScale: number;
	/** Posição X estrita da cena */
	baseX: number;
	/** Posição Y estrita da cena */
	baseY: number;
	/** Multiplicador do avanço lento e contínuo (push-in) */
	pushInScale: number;
	/** Offset orgânico horizontal em pixels */
	driftX: number;
	/** Offset orgânico vertical em pixels */
	driftY: number;
	/** Rotação orgânica em graus */
	driftRotate: number;
}

export interface CameraRigOptions {
	/** Ativa micro-drift orgânico de operador de câmera (padrão: true) */
	enableDrift?: boolean;
	/** Ativa push-in lento e contínuo ao longo da linha do tempo (padrão: true) */
	enableContinuousPushIn?: boolean;
	/** Intensidade multiplicadora do drift (padrão: 1.0) */
	driftIntensity?: number;
	/** Quantidade percentual do push-in contínuo (padrão: 0.025, i.e. 2.5%) */
	pushInAmount?: number;
}

export interface SceneTimestamps {
	tScene1: number;
	tScene2: number;
	tScene3: number;
}

export const DEFAULT_SCENE_TIMESTAMPS: SceneTimestamps = {
	tScene1: 4.4,
	tScene2: 13.3,
	tScene3: 23.8,
};

/**
 * Calcula a transformação espacial do Camera Rig com física de molas (punch-ins)
 * combinada com micro-drift orgânico contínuo e slow push-in (Fórmula GenHQ).
 */
export function calculateCameraTransform(
	frame: number,
	fps: number,
	totalFrames: number,
	timestamps: SceneTimestamps = DEFAULT_SCENE_TIMESTAMPS,
	options: CameraRigOptions = {}
): CameraRigState {
	const {
		enableDrift = true,
		enableContinuousPushIn = true,
		driftIntensity = 1.0,
		pushInAmount = 0.025,
	} = options;

	const { tScene1, tScene2, tScene3 } = timestamps;
	const fScene1 = Math.round(tScene1 * fps);
	const fScene2 = Math.round(tScene2 * fps);
	const fScene3 = Math.round(tScene3 * fps);

	let baseScale = 1.14;
	let baseY = -35;
	let baseX = 0;

	if (frame < fScene1) {
		baseScale = 1.14;
		baseY = -35;
		baseX = 0;
	} else if (frame < fScene2) {
		const s = spring({
			frame: frame - fScene1,
			fps,
			config: { damping: 18, mass: 0.7, stiffness: 140 },
		});
		baseScale = interpolate(s, [0, 1], [1.14, 1.0]);
		baseY = interpolate(s, [0, 1], [-35, 0]);
		baseX = 0;
	} else if (frame < fScene3) {
		const s = spring({
			frame: frame - fScene2,
			fps,
			config: { damping: 16, mass: 0.6, stiffness: 150 },
		});
		baseScale = interpolate(s, [0, 1], [1.0, 1.22]);
		baseY = interpolate(s, [0, 1], [0, -90]);
		baseX = interpolate(s, [0, 1], [0, -18]);
	} else {
		const s = spring({
			frame: frame - fScene3,
			fps,
			config: { damping: 18, mass: 0.8, stiffness: 120 },
		});
		baseScale = interpolate(s, [0, 1], [1.22, 1.08]);
		baseY = interpolate(s, [0, 1], [-90, -20]);
		baseX = interpolate(s, [0, 1], [-18, 0]);
	}

	// 1. Continuous Slow Push-In (Avanço lento constante sem quadros estáticos)
	const duration = totalFrames > 0 ? totalFrames : 900;
	const pushInScale = enableContinuousPushIn
		? interpolate(frame, [0, duration], [1.0, 1.0 + pushInAmount], {
				extrapolateRight: 'clamp',
		  })
		: 1.0;

	// 2. Organic Steadicam Drift (Osciladores não-harmônicos simulando respiração do operador)
	const t = frame / fps;
	let rawDriftX = 0;
	let rawDriftY = 0;
	let rawDriftRotate = 0;

	if (enableDrift) {
		rawDriftX = (Math.sin(t * 1.27) * 2.2 + Math.cos(t * 0.73) * 1.2) * driftIntensity;
		rawDriftY = (Math.cos(t * 1.09) * 2.0 + Math.sin(t * 0.81) * 1.0) * driftIntensity;
		rawDriftRotate = (Math.sin(t * 0.95) * 0.20 + Math.cos(t * 1.41) * 0.09) * driftIntensity;
	}

	// Trava de segurança anti-cinetose (bounds estritos)
	const driftX = Math.max(-5, Math.min(5, rawDriftX));
	const driftY = Math.max(-5, Math.min(5, rawDriftY));
	const driftRotate = Math.max(-0.35, Math.min(0.35, rawDriftRotate));

	return {
		scale: baseScale * pushInScale,
		x: baseX + driftX,
		y: baseY + driftY,
		rotateZ: driftRotate,
		baseScale,
		baseX,
		baseY,
		pushInScale,
		driftX,
		driftY,
		driftRotate,
	};
}
