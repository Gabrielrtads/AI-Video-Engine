import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
	wordsToSpeechIntervals,
	calculateDuckedVolume,
} from '../../src/auto_ducking_math.ts';

describe('AutoDuckingAudio Engine Tests', () => {
	it('converts word timestamps in seconds to speech intervals in frames', () => {
		const words = [
			{ word: 'Olá', start: 0.0, end: 0.5 },
			{ word: 'mundo', start: 0.6, end: 1.0 },
		];
		const fps = 30;
		// 0.6s is frame 18. 0.5s is frame 15. Gap is 3 frames (< pauseThreshold 12). Should merge!
		const intervals = wordsToSpeechIntervals(words, fps, 12);
		assert.strictEqual(intervals.length, 1);
		assert.strictEqual(intervals[0].startFrame, 0);
		assert.strictEqual(intervals[0].endFrame, 30);
	});

	it('separates speech intervals when pause exceeds threshold', () => {
		const words = [
			{ word: 'Bloco1', start: 0.0, end: 1.0 }, // 0 to 30 frames
			{ word: 'Bloco2', start: 3.0, end: 4.0 }, // 90 to 120 frames
		];
		const fps = 30;
		const intervals = wordsToSpeechIntervals(words, fps, 10);
		assert.strictEqual(intervals.length, 2);
		assert.strictEqual(intervals[0].startFrame, 0);
		assert.strictEqual(intervals[0].endFrame, 30);
		assert.strictEqual(intervals[1].startFrame, 90);
		assert.strictEqual(intervals[1].endFrame, 120);
	});

	it('returns baseVolume when no speech intervals exist', () => {
		const vol = calculateDuckedVolume(15, [], 0.35, 0.10);
		assert.strictEqual(vol, 0.35);
	});

	it('returns duckedVolume when currentFrame is inside speech interval', () => {
		const intervals = [{ startFrame: 30, endFrame: 60 }];
		const vol = calculateDuckedVolume(45, intervals, 0.35, 0.10);
		assert.strictEqual(vol, 0.10);
	});

	it('interpolates volume during fade down ramp before speech', () => {
		const intervals = [{ startFrame: 30, endFrame: 60 }];
		// fadeFrames = 10 -> frame 25 is midway between 20 (0.35) and 30 (0.10)
		const vol = calculateDuckedVolume(25, intervals, 0.35, 0.10, 10);
		assert.ok(vol > 0.10 && vol < 0.35, `Expected volume between 0.10 and 0.35, got ${vol}`);
		assert.ok(Math.abs(vol - 0.225) < 0.005, `Expected volume close to 0.225, got ${vol}`);
	});

	it('interpolates volume during fade up ramp after speech', () => {
		const intervals = [{ startFrame: 30, endFrame: 60 }];
		// fadeFrames = 10 -> frame 65 is midway between 60 (0.10) and 70 (0.35)
		const vol = calculateDuckedVolume(65, intervals, 0.35, 0.10, 10);
		assert.ok(vol > 0.10 && vol < 0.35, `Expected volume between 0.10 and 0.35, got ${vol}`);
		assert.ok(Math.abs(vol - 0.225) < 0.005, `Expected volume close to 0.225, got ${vol}`);
	});
});
