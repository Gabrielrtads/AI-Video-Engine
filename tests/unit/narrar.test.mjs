import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildTTSCommand, narrarTexto, VOZES_MAP } from '../../scripts/narrar.mjs';

describe('Narrar 1-Click Multi-TTS Unit Tests', () => {
	it('maps voice aliases correctly to neural edge-tts voice names', () => {
		assert.strictEqual(VOZES_MAP.antonio, 'pt-BR-AntonioNeural');
		assert.strictEqual(VOZES_MAP.francisca, 'pt-BR-FranciscaNeural');
		assert.strictEqual(VOZES_MAP.thalita, 'pt-BR-ThalitaNeural');
	});

	it('builds valid edge-tts python script arguments', () => {
		const cmd = buildTTSCommand('Texto teste', 'out/teste.mp3', { voice: 'thalita' });
		assert.strictEqual(cmd.command, 'python');
		assert.strictEqual(cmd.voice, 'pt-BR-ThalitaNeural');
		assert.ok(cmd.args[1].includes('edge_tts.Communicate'));
		assert.ok(cmd.args[1].includes('pt-BR-ThalitaNeural'));
		assert.ok(cmd.args[1].includes('Texto teste'));
	});

	it('rejects empty text with descriptive error', () => {
		assert.throws(() => {
			narrarTexto('   ', 'out/teste.mp3');
		}, /Texto para narração não pode ser vazio/);
	});

	it('executes cleanly in dry-run mode without spawning child process', () => {
		const result = narrarTexto('Design em movimento', 'public/narracao.mp3', {
			voice: 'antonio',
			dryRun: true,
		});

		assert.strictEqual(result.success, true);
		assert.strictEqual(result.dryRun, true);
		assert.strictEqual(result.voice, 'pt-BR-AntonioNeural');
	});
});
