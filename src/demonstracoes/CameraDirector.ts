import { interpolate, spring } from 'remotion';

export interface CameraBeatState {
	scale: number;
	translateX: number;
	translateY: number;
	rotateX: number;
	rotateY: number;
	shake: number;
	beatIndex: number;
	beatName: string;
}

export interface BeatDefinition {
	startFrame: number;
	endFrame: number;
	name: string;
	scale: number;
	targetX: number;
	targetY: number;
	rotX: number;
	rotY: number;
	hasImpactShake?: boolean;
}

/**
 * DIRETOR DE CÂMERA DINÂMICA (Padrão Retenção 3 Segundos - MrBeast / Rourke Heath)
 * Garante uma transição, soco de escala ou mudança de enquadramento a cada 2.5 a 3s.
 */
export const CAMERA_BEATS: BeatDefinition[] = [
	// ── ATO 1: O HOOK & QUESTIONAMENTO (0 a 140 frames) ──
	{ startFrame: 0, endFrame: 60, name: 'B1_HOOK_WIDESCREEN', scale: 1.0, targetX: 0, targetY: 0, rotX: 0, rotY: 0 },
	{ startFrame: 60, endFrame: 140, name: 'B2_PUNCH_IN_AVATAR', scale: 1.24, targetX: 0, targetY: -25, rotX: 1.2, rotY: -1.0 },

	// ── ATO 2: O PERIGO & CAOS EM PRODUÇÃO (140 a 405 frames) ──
	{ startFrame: 140, endFrame: 220, name: 'B3_CRASH_BUG_1', scale: 1.08, targetX: -20, targetY: 15, rotX: -2.5, rotY: 3.0, hasImpactShake: true },
	{ startFrame: 220, endFrame: 310, name: 'B4_ALUCINACAO_BUG_2', scale: 1.15, targetX: 20, targetY: -15, rotX: 2.5, rotY: -3.0, hasImpactShake: true },
	{ startFrame: 310, endFrame: 405, name: 'B5_CAOS_PULLBACK', scale: 0.95, targetX: 0, targetY: 0, rotX: 0, rotY: 0 },

	// ── ATO 3: A ARENA ADVERSARIAL 3 IAs (405 a 1134 frames) ──
	{ startFrame: 405, endFrame: 480, name: 'B6_TERMINAL_PROMPT_ZOOM', scale: 1.10, targetX: 0, targetY: 100, rotX: 1.5, rotY: -1.0, hasImpactShake: true },
	{ startFrame: 480, endFrame: 560, name: 'B7_DUEL_3D_PERSPECTIVE', scale: 1.0, targetX: 0, targetY: 0, rotX: -1.5, rotY: 1.5 },
	{ startFrame: 560, endFrame: 660, name: 'B8_CLAUDE_BUILDER_FOCUS', scale: 1.25, targetX: 0, targetY: 90, rotX: 1.2, rotY: -1.0 },
	{ startFrame: 660, endFrame: 760, name: 'B9_CODEX_RED_TEAM_ATTACK', scale: 1.25, targetX: 0, targetY: -10, rotX: -1.2, rotY: 1.0, hasImpactShake: true },
	{ startFrame: 760, endFrame: 860, name: 'B10_GEMINI_REFEREE_LOCK', scale: 1.25, targetX: 0, targetY: -110, rotX: 1.0, rotY: -1.0, hasImpactShake: true },
	{ startFrame: 860, endFrame: 960, name: 'B11_CONFIDENCE_ODOMETER_ZOOM', scale: 1.30, targetX: 0, targetY: -200, rotX: 0, rotY: 0 },
	{ startFrame: 960, endFrame: 1050, name: 'B12_APPROVED_STAMP_SLAM', scale: 1.04, targetX: 0, targetY: 0, rotX: 0.5, rotY: -0.5, hasImpactShake: true },
	{ startFrame: 1050, endFrame: 1134, name: 'B13_ARENA_VICTORY_PULLOUT', scale: 0.98, targetX: 0, targetY: 0, rotX: -1.0, rotY: 1.0 },

	// ── ATO 4: GITHUB HERO & LEAD MAGNET (1134 a 1600 frames) ──
	{ startFrame: 1134, endFrame: 1220, name: 'B14_GITHUB_HERO_ENTRANCE', scale: 1.06, targetX: 0, targetY: 0, rotX: 3.0, rotY: -3.5, hasImpactShake: true },
	{ startFrame: 1220, endFrame: 1300, name: 'B15_STAR_CLICK_BURST', scale: 1.32, targetX: -110, targetY: 20, rotX: 1.5, rotY: -2.0, hasImpactShake: true },
	{ startFrame: 1300, endFrame: 1390, name: 'B16_DIRECT_PUSH_ZOOM', scale: 1.18, targetX: 0, targetY: 190, rotX: -2.5, rotY: 1.5, hasImpactShake: true },
	{ startFrame: 1390, endFrame: 1480, name: 'B17_FERRARI_CTA_PULSE', scale: 1.25, targetX: 0, targetY: -170, rotX: 2.0, rotY: -2.0 },
	{ startFrame: 1480, endFrame: 1600, name: 'B18_FINALE_LOGO_STAMP', scale: 1.0, targetX: 0, targetY: 0, rotX: 0, rotY: 0, hasImpactShake: true },
];

export function getCameraBeat(frame: number, fps: number): CameraBeatState {
	const beatIndex = CAMERA_BEATS.findIndex(
		(b) => frame >= b.startFrame && frame < b.endFrame
	);

	const activeBeat = beatIndex >= 0 ? CAMERA_BEATS[beatIndex] : CAMERA_BEATS[CAMERA_BEATS.length - 1];
	const prevBeat = beatIndex > 0 ? CAMERA_BEATS[beatIndex - 1] : activeBeat;

	// Transição suave via spring na virada de cada beat (primeiros 10 frames de cada corte)
	const beatAge = frame - activeBeat.startFrame;
	const transitionSpring = spring({
		frame: Math.min(12, Math.max(0, beatAge)),
		fps,
		config: { damping: 14, mass: 0.45, stiffness: 220 },
	});

	// Interpolação entre o beat anterior e o ativo
	const scale = interpolate(transitionSpring, [0, 1], [prevBeat.scale, activeBeat.scale]);
	const translateX = interpolate(transitionSpring, [0, 1], [prevBeat.targetX, activeBeat.targetX]);
	const translateY = interpolate(transitionSpring, [0, 1], [prevBeat.targetY, activeBeat.targetY]);
	const rotateX = interpolate(transitionSpring, [0, 1], [prevBeat.rotX, activeBeat.rotX]);
	const rotateY = interpolate(transitionSpring, [0, 1], [prevBeat.rotY, activeBeat.rotY]);

	// Micro-tremor de impacto (camera shake) se o beat tiver batida forte
	let shake = 0;
	if (activeBeat.hasImpactShake && beatAge < 8) {
		const shakeDecay = 1 - beatAge / 8;
		shake = Math.sin(beatAge * 3.5) * 6 * shakeDecay;
	}

	return {
		scale,
		translateX: translateX + shake,
		translateY: translateY + shake * 0.5,
		rotateX,
		rotateY,
		shake,
		beatIndex: beatIndex >= 0 ? beatIndex + 1 : CAMERA_BEATS.length,
		beatName: activeBeat.name,
	};
}
