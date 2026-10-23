import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
	calculateCameraTransform,
	DEFAULT_SCENE_TIMESTAMPS,
} from '../../src/apple_camera_math.ts';

describe('AppleCameraRig Micro-Drift & Push-In Engine Tests', () => {
	const fps = 30;
	const totalFrames = 900; // 30s

	it('returns structured camera state with valid physical numeric coordinates', () => {
		const state = calculateCameraTransform(0, fps, totalFrames);
		assert.strictEqual(typeof state.scale, 'number');
		assert.strictEqual(typeof state.x, 'number');
		assert.strictEqual(typeof state.y, 'number');
		assert.strictEqual(typeof state.rotateZ, 'number');
		assert.strictEqual(typeof state.pushInScale, 'number');
		assert.strictEqual(typeof state.driftX, 'number');
		assert.strictEqual(typeof state.driftY, 'number');
		assert.strictEqual(typeof state.driftRotate, 'number');
	});

	it('eliminates dead static frames between spring cuts (organic drift active)', () => {
		// No código anterior, qualquer frame dentro da mesma cena tinha scale, x e y idênticos.
		// Agora, frames 30 e 90 (ambos na Cena 0, antes de 4.4s / 132 frames) devem ter drift mensurável.
		const frameA = calculateCameraTransform(30, fps, totalFrames);
		const frameB = calculateCameraTransform(90, fps, totalFrames);

		assert.notStrictEqual(frameA.driftX, frameB.driftX, 'driftX deve oscilar organicamente');
		assert.notStrictEqual(frameA.driftY, frameB.driftY, 'driftY deve oscilar organicamente');
		assert.notStrictEqual(frameA.scale, frameB.scale, 'scale deve incluir o slow push-in');
		assert.strictEqual(frameA.baseScale, frameB.baseScale, 'baseScale da cena deve permanecer 1.14');
	});

	it('enforces strict anti-kinetosis rotation bounds (|rotateZ| <= 0.35 deg)', () => {
		// Amostra 100 frames ao longo do vídeo de 30s
		for (let f = 0; f < totalFrames; f += 9) {
			const state = calculateCameraTransform(f, fps, totalFrames);
			assert.ok(
				Math.abs(state.rotateZ) <= 0.35,
				`rotateZ (${state.rotateZ} deg) no frame ${f} excedeu o limite seguro de 0.35 deg`
			);
			assert.ok(
				Math.abs(state.driftX) <= 5.0,
				`driftX (${state.driftX} px) no frame ${f} excedeu o teto seguro de 5px`
			);
			assert.ok(
				Math.abs(state.driftY) <= 5.0,
				`driftY (${state.driftY} px) no frame ${f} excedeu o teto seguro de 5px`
			);
		}
	});

	it('continuous push-in advances slowly and clamps at final frame', () => {
		const start = calculateCameraTransform(0, fps, totalFrames, DEFAULT_SCENE_TIMESTAMPS, {
			pushInAmount: 0.025,
		});
		const mid = calculateCameraTransform(450, fps, totalFrames, DEFAULT_SCENE_TIMESTAMPS, {
			pushInAmount: 0.025,
		});
		const end = calculateCameraTransform(900, fps, totalFrames, DEFAULT_SCENE_TIMESTAMPS, {
			pushInAmount: 0.025,
		});

		assert.strictEqual(start.pushInScale, 1.0);
		assert.ok(mid.pushInScale > 1.0 && mid.pushInScale < 1.025);
		assert.ok(Math.abs(end.pushInScale - 1.025) < 0.001);
	});

	it('honors disabled flags for deterministic backwards-compatibility', () => {
		const state = calculateCameraTransform(150, fps, totalFrames, DEFAULT_SCENE_TIMESTAMPS, {
			enableDrift: false,
			enableContinuousPushIn: false,
		});

		assert.strictEqual(state.pushInScale, 1.0);
		assert.strictEqual(state.driftX, 0);
		assert.strictEqual(state.driftY, 0);
		assert.strictEqual(state.driftRotate, 0);
		assert.strictEqual(state.scale, state.baseScale);
		assert.strictEqual(state.x, state.baseX);
		assert.strictEqual(state.y, state.baseY);
	});
});
