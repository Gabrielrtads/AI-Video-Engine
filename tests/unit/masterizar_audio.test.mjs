import { describe, it } from 'node:test';
import assert from 'node:assert';
import { masterizeAudio } from '../../scripts/masterizar_audio.mjs';

describe('Masterizar Audio (-14 LUFS) Unit Tests', () => {
	it('constructs exact ffmpeg loudnorm filter arguments in dry-run mode', () => {
		const result = masterizeAudio('dummy_input.mp4', 'dummy_output.mp4', {
			dryRun: true,
			targetLufs: -14,
			loudnessRange: 7,
			truePeak: -1.0,
		});

		assert.strictEqual(result.command, 'ffmpeg');
		assert.strictEqual(result.filter, 'loudnorm=I=-14:LRA=7:tp=-1');
		assert.ok(result.args.includes('-c:v'));
		assert.ok(result.args.includes('copy'));
		assert.ok(result.args.includes('-af'));
		assert.ok(result.args.includes('loudnorm=I=-14:LRA=7:tp=-1'));
		assert.ok(result.args.includes('-c:a'));
		assert.ok(result.args.includes('aac'));
	});

	it('throws descriptive error if input file does not exist in active mode', () => {
		assert.throws(() => {
			masterizeAudio('arquivo_inexistente_xyz.mp4', 'out/test.mp4', { dryRun: false });
		}, /Arquivo de entrada não encontrado/);
	});
});
