/**
 * Test Helpers & Mock Harness for AI-Video-Engine E2E Test Suite
 * Zero external dependencies: uses native Node.js fs, path, os, url modules.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ENGINE_ROOT = path.resolve(__dirname, '..', '..');
export const SCRIPTS_DIR = path.join(ENGINE_ROOT, 'scripts');
export const SRC_DIR = path.join(ENGINE_ROOT, 'src');
export const TEMPLATES_DIR = path.join(SRC_DIR, 'templates');
export const HABILIDADES_DIR = path.join(SRC_DIR, 'habilidades');

export const PATHS = {
	engineRoot: ENGINE_ROOT,
	studioEngine: path.join(SCRIPTS_DIR, 'studio_engine.mjs'),
	pipelineReferencia: path.join(SCRIPTS_DIR, 'pipeline_referencia.mjs'),
	approvalGate: path.join(SCRIPTS_DIR, 'approval_gate.mjs'),
	amostrarPaleta: path.join(SCRIPTS_DIR, 'references', 'amostrar_paleta.py'),
	catalogoHabilidades: path.join(HABILIDADES_DIR, 'catalogo_habilidades.json'),
	catalogoTemplates: path.join(TEMPLATES_DIR, 'catalogo_templates.json'),
	rootIndex: path.join(SRC_DIR, 'index.tsx'),
	carrosselEditorial: path.join(SRC_DIR, 'CarrosselEditorial.tsx'),
	flowMotionMaster: path.join(SRC_DIR, 'FlowMotionMaster.tsx'),
};

/**
 * Creates an in-memory input reader and output writer for testing interactive prompts.
 * @param {string[]} inputs - Sequence of user answers
 */
export function createMockIO(inputs = []) {
	const queue = [...inputs];
	const outputs = [];

	const inputReader = async (promptText) => {
		if (promptText) outputs.push(promptText);
		if (queue.length === 0) return '';
		return queue.shift();
	};

	const outputWriter = (text) => {
		outputs.push(typeof text === 'string' ? text : String(text));
	};

	return {
		inputReader,
		outputWriter,
		outputs,
		getOutputText: () => outputs.join('\n'),
		hasOutputMatching: (pattern) => {
			const full = outputs.join('\n');
			if (typeof pattern === 'string') return full.includes(pattern);
			return pattern.test(full);
		},
		reset: (newInputs = []) => {
			queue.length = 0;
			queue.push(...newInputs);
			outputs.length = 0;
		},
	};
}

/**
 * Dynamic module loaders that safely attempt to import the implementation files.
 */
export async function loadStudioEngine() {
	try {
		return await import('../../scripts/studio_engine.mjs');
	} catch (err) {
		return null;
	}
}

export async function loadPipelineReferencia() {
	try {
		return await import('../../scripts/pipeline_referencia.mjs');
	} catch (err) {
		return null;
	}
}

export async function loadApprovalGate() {
	try {
		return await import('../../scripts/approval_gate.mjs');
	} catch (err) {
		return null;
	}
}

/**
 * Creates an isolated temporary environment with a copy of templates and root index
 * for testing auto-evolution without corrupting real project source files.
 */
export function createIsolatedTestEnvironment() {
	const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-video-engine-test-'));
	const tempTemplatesDir = path.join(tempDir, 'src', 'templates');
	const tempSrcDir = path.join(tempDir, 'src');

	fs.mkdirSync(tempTemplatesDir, { recursive: true });

	// Copy real catalog if exists
	const realCatalogPath = PATHS.catalogoTemplates;
	const tempCatalogPath = path.join(tempTemplatesDir, 'catalogo_templates.json');
	if (fs.existsSync(realCatalogPath)) {
		fs.copyFileSync(realCatalogPath, tempCatalogPath);
	} else {
		fs.writeFileSync(tempCatalogPath, '[]', 'utf8');
	}

	// Copy or create root index
	const tempIndexPath = path.join(tempSrcDir, 'index.tsx');
	if (fs.existsSync(PATHS.rootIndex)) {
		fs.copyFileSync(PATHS.rootIndex, tempIndexPath);
	} else {
		fs.writeFileSync(tempIndexPath, '// root index stub\n', 'utf8');
	}

	const cleanup = () => {
		try {
			fs.rmSync(tempDir, { recursive: true, force: true });
		} catch (e) {
			// ignore cleanup errors
		}
	};

	return {
		tempDir,
		tempTemplatesDir,
		tempCatalogPath,
		tempIndexPath,
		cleanup,
	};
}
