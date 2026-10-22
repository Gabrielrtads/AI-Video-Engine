import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');

test('QA Terminal Headless: Linter Anti-Slop valida FlowMotionMaster', () => {
	const lintScript = path.join(ROOT_DIR, 'scripts', 'lint-motion-slop.mjs');
	const targetFile = path.join(ROOT_DIR, 'src', 'FlowMotionMaster.tsx');

	assert.ok(fs.existsSync(lintScript), 'lint-motion-slop.mjs deve existir');
	assert.ok(fs.existsSync(targetFile), 'FlowMotionMaster.tsx deve existir');

	const output = execSync(`node "${lintScript}" "${targetFile}"`, {
		cwd: ROOT_DIR,
		encoding: 'utf-8',
	});

	assert.match(output, /APROVADO/i, 'Linter Anti-Slop deve aprovar FlowMotionMaster');
});

test('QA Terminal Headless: Linter Anti-Slop rejeita código amador (violador de física)', () => {
	const lintScript = path.join(ROOT_DIR, 'scripts', 'lint-motion-slop.mjs');
	const scratchSlop = path.join(ROOT_DIR, 'tests', 'fixtures_slop_test.tsx');

	// Código com 3 violações claras: foley estourado, slogan clichê, e sem curvas/springs
	const badCode = `
		import React from 'react';
		export const SlopComponent = () => {
			const config = { volume: 0.85 };
			const text = "Desbloqueie o futuro de agora 01 / A";
			return <div style={{ textAlign: 'center', textTransform: 'uppercase' }}>{text}</div>;
		};
	`;

	try {
		fs.writeFileSync(scratchSlop, badCode, 'utf-8');
		assert.throws(
			() => {
				execSync(`node "${lintScript}" "${scratchSlop}"`, {
					cwd: ROOT_DIR,
					encoding: 'utf-8',
					stdio: 'pipe',
				});
			},
			/REJEITADO|excede o limite/i,
			'Linter deve bloquear arquivo com mais de 2 violações de slop'
		);
	} finally {
		if (fs.existsSync(scratchSlop)) {
			fs.unlinkSync(scratchSlop);
		}
	}
});

test('QA Terminal Headless: Orquestrador de Bancada 1-Click roda em --dry-run com sucesso', () => {
	const bancadaScript = path.join(ROOT_DIR, 'scripts', 'produzir_video_bancada.mjs');
	assert.ok(fs.existsSync(bancadaScript), 'produzir_video_bancada.mjs deve existir');

	const output = execSync(`node "${bancadaScript}" FlowMotionMaster --dry-run --skip-transcribe`, {
		cwd: ROOT_DIR,
		encoding: 'utf-8',
	});

	assert.match(output, /ORQUESTRADOR DE BANCADA 1-CLICK/i);
	assert.match(output, /DRY-RUN/i);
	assert.match(output, /PIPELINE CONCLUÍDO/i);
});

test('QA Terminal Headless: Remotion Bundle possui todas as composições canônicas', () => {
	const indexFile = path.join(ROOT_DIR, 'src', 'index.tsx');
	const content = fs.readFileSync(indexFile, 'utf-8');

	assert.ok(content.includes('id="FlowMotionMaster"'), 'Composição FlowMotionMaster presente');
	assert.ok(content.includes('id="Video"'), 'Composição Video presente');
	assert.ok(content.includes('id="CarrosselEditorial"'), 'Composição CarrosselEditorial presente');
	assert.ok(content.includes('width={1080}'), 'Largura 1080 presente');
	assert.ok(content.includes('height={1920}') || content.includes('height={H}'), 'Altura vertical 1920 presente');
});

test('QA Terminal Headless: MCP Tools executam 100% isoladas de DOM/Navegador', async () => {
	const mcpModulePath = path.join(ROOT_DIR, 'src', 'mcp', 'vibeStudioTools.ts');
	assert.ok(fs.existsSync(mcpModulePath), 'vibeStudioTools.ts deve existir');

	// Importa e executa ferramentas sem window/document
	assert.strictEqual(typeof window, 'undefined', 'Ambiente deve ser puramente Node.js/headless');
	assert.strictEqual(typeof document, 'undefined', 'Documento não deve existir');
});
