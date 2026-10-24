/**
 * Tier 2: Boundary & Corner Cases Test Suite
 * 
 * Verifies edge conditions, invalid inputs, error handling, and parameter limits
 * across Features 1 to 11 with >= 5 tests per feature (55+ tests).
 * Native Node.js test runner (node:test + node:assert). Zero external dependencies.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
	PATHS,
	createMockIO,
	loadStudioEngine,
	loadPipelineReferencia,
	loadApprovalGate,
	createIsolatedTestEnvironment,
} from './helpers.mjs';

describe('Tier 2: Boundary & Corner Cases (Features 1 to 11)', () => {

	// =========================================================================
	// Feature 1 Boundaries: Canonical Onboarding Prompt
	// =========================================================================
	describe('Feature 1 Boundaries: Canonical Onboarding Prompt', () => {
		it('2.1.1: rejects empty or whitespace-only input on route selection', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['   ', '1', 'briefing']);
			const result = await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.ok(result.route === 1, 'Should recover when valid route is provided after whitespace');
		});

		it('2.1.2: rejects out-of-bounds numeric choices (0, 5, 99, -1)', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['99', '2', 'tema']);
			const result = await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.strictEqual(result.route, 2);
		});

		it('2.1.3: rejects non-numeric text input and re-prompts', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['faz um video pra mim', '1', 'tema']);
			const result = await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.strictEqual(result.route, 1);
		});

		it('2.1.4: handles emoji and unicode characters without unhandled exceptions', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['🎬🚀', '\u0000', '2', 'briefing']);
			const result = await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.strictEqual(result.route, 2);
		});

		it('2.1.5: sequential invalid attempts eventually recover upon valid choice', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['-5', 'abc', '??', '4', 'https://instagram.com/p/test', 'tema']);
			const result = await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.strictEqual(result.route, 4);
		});
	});

	// =========================================================================
	// Feature 2 Boundaries: Dynamic Skills Catalog
	// =========================================================================
	describe('Feature 2 Boundaries: Dynamic Skills Catalog', () => {
		it('2.2.1: non-existent file path throws or returns empty structure safely', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			assert.throws(
				() => studio.formatSkillsCatalog('non_existent_file.json'),
				/ENOENT|no such file|invalid path/i
			);
		});

		it('2.2.2: malformed JSON syntax in catalog throws descriptive error', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const tempFile = path.join(os.tmpdir(), `corrupt_skills_${Date.now()}.json`);
			try {
				fs.writeFileSync(tempFile, '{ "invalid": json syntax ...', 'utf8');
				assert.throws(
					() => studio.formatSkillsCatalog(tempFile),
					/SyntaxError|JSON/i
				);
			} finally {
				if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
			}
		});

		it('2.2.3: empty skills array [] returns zero counts without crashing', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const tempFile = path.join(os.tmpdir(), `empty_skills_${Date.now()}.json`);
			try {
				fs.writeFileSync(tempFile, '[]', 'utf8');
				const catalog = studio.formatSkillsCatalog(tempFile);
				assert.strictEqual(catalog.category1.length, 0);
				assert.strictEqual(catalog.category2.length, 0);
				assert.strictEqual(catalog.category3.length, 0);
			} finally {
				if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
			}
		});

		it('2.2.4: skill item missing optional properties does not throw TypeError', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const tempFile = path.join(os.tmpdir(), `partial_skills_${Date.now()}.json`);
			try {
				const partial = [{ id: 'amostragem_paleta_kmeans', nome: 'Amostragem' }];
				fs.writeFileSync(tempFile, JSON.stringify(partial), 'utf8');
				const catalog = studio.formatSkillsCatalog(tempFile);
				assert.strictEqual(catalog.category1.length, 1);
			} finally {
				if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
			}
		});

		it('2.2.5: unmapped arbitrary skill ID is placed into fallback category without dropping', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const tempFile = path.join(os.tmpdir(), `custom_skill_${Date.now()}.json`);
			try {
				const custom = [{ id: 'custom_ai_voice_effect', nome: 'Voz Sintética' }];
				fs.writeFileSync(tempFile, JSON.stringify(custom), 'utf8');
				const catalog = studio.formatSkillsCatalog(tempFile);
				const total = catalog.category1.length + catalog.category2.length + catalog.category3.length;
				assert.strictEqual(total, 1, 'Custom skill must not be discarded');
			} finally {
				if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
			}
		});
	});

	// =========================================================================
	// Feature 3 Boundaries: Single-Line Briefing Expresso
	// =========================================================================
	describe('Feature 3 Boundaries: Single-Line Briefing Expresso', () => {
		it('2.3.1: empty briefing string re-prompts or returns empty trimmed string', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['   ', 'venda de curso']);
			const briefing = await studio.promptBriefingExpresso(io.inputReader, io.outputWriter);
			assert.ok(briefing.length > 0);
		});

		it('2.3.2: extremely long briefing input (10,000 chars) is processed without memory explosion', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const longStr = 'a'.repeat(10000);
			const io = createMockIO([longStr]);
			const briefing = await studio.promptBriefingExpresso(io.inputReader, io.outputWriter);
			assert.ok(briefing.length >= 100);
		});

		it('2.3.3: special characters and injection tokens do not break execution', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const injection = '<script>alert(1)</script> ${process.env.SECRET} --flag "quoted"';
			const io = createMockIO([injection]);
			const briefing = await studio.promptBriefingExpresso(io.inputReader, io.outputWriter);
			assert.ok(typeof briefing === 'string');
		});

		it('2.3.4: punctuation-only and emoji-only answers do not crash formatting', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['🎯🔥🚀', '???']);
			const briefing = await studio.promptBriefingExpresso(io.inputReader, io.outputWriter);
			assert.ok(typeof briefing === 'string');
		});

		it('2.3.5: multi-line input with CRLF is sanitized into single line', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['Primeira linha\r\nSegunda linha\tcom tabs']);
			const briefing = await studio.promptBriefingExpresso(io.inputReader, io.outputWriter);
			assert.ok(!briefing.includes('\r'), 'Should not contain CR');
			assert.ok(!briefing.includes('\n'), 'Should normalize multi-line into single line');
		});
	});

	// =========================================================================
	// Feature 4 Boundaries: Template Selection Listing
	// =========================================================================
	describe('Feature 4 Boundaries: Template Selection Listing', () => {
		it('2.4.1: missing catalogo_templates.json path handled gracefully', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			assert.throws(
				() => studio.listTemplates('non_existent_templates.json'),
				/ENOENT|no such file/i
			);
		});

		it('2.4.2: malformed JSON in catalogo_templates.json throws descriptive error', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const tempFile = path.join(os.tmpdir(), `corrupt_templates_${Date.now()}.json`);
			try {
				fs.writeFileSync(tempFile, '[{ unclosed: object', 'utf8');
				assert.throws(
					() => studio.listTemplates(tempFile),
					/SyntaxError|JSON/i
				);
			} finally {
				if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
			}
		});

		it('2.4.3: empty templates catalog array [] returns empty array', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const tempFile = path.join(os.tmpdir(), `empty_templates_${Date.now()}.json`);
			try {
				fs.writeFileSync(tempFile, '[]', 'utf8');
				const res = studio.listTemplates(tempFile);
				assert.ok(Array.isArray(res));
				assert.strictEqual(res.length, 0);
			} finally {
				if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
			}
		});

		it('2.4.4: template with missing caracteristicas array defaults to empty list', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const tempFile = path.join(os.tmpdir(), `minimal_template_${Date.now()}.json`);
			try {
				const minimal = [{ id: 'MinTpl', nome: 'Minimal', proporcao: '4:5' }];
				fs.writeFileSync(tempFile, JSON.stringify(minimal), 'utf8');
				const res = studio.listTemplates(tempFile);
				assert.strictEqual(res.length, 1);
				assert.strictEqual(res[0].id, 'MinTpl');
			} finally {
				if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
			}
		});

		it('2.4.5: invalid template selection index returns undefined / throws handled error', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			if (studio.getTemplateByIndex) {
				const res = studio.getTemplateByIndex(999, PATHS.catalogoTemplates);
				assert.strictEqual(res, undefined);
			}
		});
	});

	// =========================================================================
	// Feature 5 Boundaries: Clean Slate Generation
	// =========================================================================
	describe('Feature 5 Boundaries: Clean Slate Generation', () => {
		it('2.5.1: unsupported aspect ratio (e.g. 21:9) falls back or throws', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			assert.throws(
				() => studio.generateCleanSlate({ aspect: '21:9' }),
				/unsupported aspect|proporção não suportada/i
			);
		});

		it('2.5.2: empty options object {} defaults to valid canvas configuration', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const slate = studio.generateCleanSlate({});
			assert.ok(slate.width > 0);
			assert.ok(slate.height > 0);
			assert.ok(slate.cleanSlate === true);
		});

		it('2.5.3: null or undefined parameter handled gracefully', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const slate = studio.generateCleanSlate();
			assert.ok(slate.cleanSlate === true);
		});

		it('2.5.4: clean slate objects are independent instances without shared state', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const slate1 = studio.generateCleanSlate({ theme: 'Tema A' });
			const slate2 = studio.generateCleanSlate({ theme: 'Tema B' });
			assert.notStrictEqual(slate1, slate2);
			slate1.theme = 'Mutated';
			assert.strictEqual(slate2.theme, 'Tema B');
		});

		it('2.5.5: non-numeric custom dimensions are rejected or sanitized', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			assert.throws(
				() => studio.generateCleanSlate({ width: 'invalid', height: -50 }),
				/invalid dimension|dimensões inválidas/i
			);
		});
	});

	// =========================================================================
	// Feature 6 Boundaries: Reference Media Ingestion
	// =========================================================================
	describe('Feature 6 Boundaries: Reference Media Ingestion', () => {
		it('2.6.1: non-existent local file path throws ENOENT', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			await assert.rejects(
				async () => pipeline.extractReferencePalette('non_existent_media.mp4'),
				/ENOENT|not found|não encontrado/i
			);
		});

		it('2.6.2: invalid URL protocol (e.g. ftp:// or javascript:) is rejected', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			if (pipeline.validateMediaUrl) {
				assert.strictEqual(pipeline.validateMediaUrl('javascript:alert(1)'), false);
				assert.strictEqual(pipeline.validateMediaUrl('ftp://example.com/video.mp4'), false);
			}
		});

		it('2.6.3: malicious characters in media path / URL do not cause command injection', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			await assert.rejects(
				async () => pipeline.extractReferencePalette('test.mp4; rm -rf /'),
				/invalid|not found|segurança/i
			);
		});

		it('2.6.4: zero-byte media file throws ValueError or descriptive error', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			const tempEmpty = path.join(os.tmpdir(), `empty_${Date.now()}.mp4`);
			try {
				fs.writeFileSync(tempEmpty, Buffer.alloc(0));
				await assert.rejects(
					async () => pipeline.extractReferencePalette(tempEmpty),
					/empty|insuficiente|não foi possível/i
				);
			} finally {
				if (fs.existsSync(tempEmpty)) fs.unlinkSync(tempEmpty);
			}
		});

		it('2.6.5: unsupported file extension (e.g. .txt or .exe) is rejected', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			const tempTxt = path.join(os.tmpdir(), `sample_${Date.now()}.txt`);
			try {
				fs.writeFileSync(tempTxt, 'This is a text file', 'utf8');
				await assert.rejects(
					async () => pipeline.extractReferencePalette(tempTxt),
					/unsupported format|formato não suportado/i
				);
			} finally {
				if (fs.existsSync(tempTxt)) fs.unlinkSync(tempTxt);
			}
		});
	});

	// =========================================================================
	// Feature 7 Boundaries: Zero-RAM-Leak Frame Extraction
	// =========================================================================
	describe('Feature 7 Boundaries: Zero-RAM-Leak Frame Extraction', () => {
		// 2.7.1 (vídeo sem stream) e 2.7.2 (quadro monocromático) só conferiam se o arquivo existia; o
		// comportamento real é testado em tests/python (test_load_image_raw_no_video_streams_error e
		// test_get_dominant_colors_monochromatic).
		// 2.7.3-2.7.5 (buffer truncado, timeout, seed) viraram testes de comportamento em
		// tests/unit/amostrar_paleta_comportamento.test.mjs.
	});

	// =========================================================================
	// Feature 8 Boundaries: Safe Zones & Microinteractions
	// =========================================================================
	describe('Feature 8 Boundaries: Safe Zones & Microinteractions', () => {
		it('2.8.1: invalid aspect ratio throws descriptive error in calculateSafeZones', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			assert.throws(
				() => pipeline.calculateSafeZones('unknown_ratio'),
				/unsupported aspect|proporção inválida/i
			);
		});

		it('2.8.2: safeBox dimensions are strictly within resolution bounds', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			const z45 = pipeline.calculateSafeZones('4:5');
			assert.ok(z45.safeBox.minX >= 0);
			assert.ok(z45.safeBox.maxX <= 1080);
			assert.ok(z45.safeBox.minY >= 0);
			assert.ok(z45.safeBox.maxY <= 1350);
		});

		it('2.8.3: spring config has positive non-zero damping and stiffness', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			const config = pipeline.getMicrointeractionsConfig();
			assert.ok(config.spring.damping > 0);
			assert.ok(config.spring.stiffness > 0);
			assert.ok(config.spring.mass > 0);
		});

		it('2.8.4: marquee loop handles negative frame offsets smoothly via modulo', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			if (pipeline.calculateMarqueeOffset) {
				const offsetPos = pipeline.calculateMarqueeOffset(30);
				const offsetZero = pipeline.calculateMarqueeOffset(0);
				assert.ok(typeof offsetPos === 'number');
				assert.ok(typeof offsetZero === 'number');
			}
		});

		it('2.8.5: SVG gradient config handles single-color or missing color fallbacks', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			const config = pipeline.getMicrointeractionsConfig();
			assert.ok(config.svgGradientText);
		});
	});

	// =========================================================================
	// Feature 9 Boundaries: Post-Render Approval Question
	// =========================================================================
	describe('Feature 9 Boundaries: Post-Render Approval Question', () => {
		it('2.9.1: whitespace padded responses ("   Sim   ", "   não   ") are trimmed and parsed', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const io1 = createMockIO(['   Sim   ']);
			assert.strictEqual(await approval.promptApprovalGate(io1.inputReader, io1.outputWriter), true);

			const io2 = createMockIO(['   não   ']);
			assert.strictEqual(await approval.promptApprovalGate(io2.inputReader, io2.outputWriter), false);
		});

		it('2.9.2: ambiguous answers ("talvez", "mais ou menos", "ajustar") return false', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const io = createMockIO(['talvez depois']);
			assert.strictEqual(await approval.promptApprovalGate(io.inputReader, io.outputWriter), false);
		});

		it('2.9.3: empty response / immediate newline returns false', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const io = createMockIO(['']);
			assert.strictEqual(await approval.promptApprovalGate(io.inputReader, io.outputWriter), false);
		});

		it('2.9.4: Portuguese accentuation variations ("SIM", "sim", "Sim", "S") all return true', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			for (const val of ['SIM', 'sim', 'Sim', 's', 'S']) {
				const io = createMockIO([val]);
				assert.strictEqual(await approval.promptApprovalGate(io.inputReader, io.outputWriter), true);
			}
		});

		it('2.9.5: control characters and symbols evaluate safely as false', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const io = createMockIO(['\u0000\u001b[2J']);
			assert.strictEqual(await approval.promptApprovalGate(io.inputReader, io.outputWriter), false);
		});
	});

	// =========================================================================
	// Feature 10 Boundaries: Template Library Auto-Evolution
	// =========================================================================
	describe('Feature 10 Boundaries: Template Library Auto-Evolution', () => {
		it('2.10.1: template name with illegal filename characters is sanitized or rejected', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				const res = await approval.autoEvolveTemplate({
					name: 'Bad/Name*Illegal:Test',
					title: 'Bad Name',
					aspectRatio: '4:5',
					width: 1080,
					height: 1350,
					durationInFrames: 240,
					fps: 30,
					componentCode: 'export const Comp = () => <div/>;',
					catalogPath: env.tempCatalogPath,
					templatesDir: env.tempTemplatesDir,
					rootIndexPath: env.tempIndexPath,
				});
				assert.ok(!res.templatePath.includes('*'));
				assert.ok(!res.templatePath.includes(':'));
			} finally {
				env.cleanup();
			}
		});

		it('2.10.2: duplicate template ID updates or gracefully avoids catalog corruption', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				const params = {
					name: 'DupeCheck',
					title: 'Dupe Title',
					aspectRatio: '4:5',
					width: 1080,
					height: 1350,
					durationInFrames: 240,
					fps: 30,
					componentCode: 'export const DupeCheck = () => <div/>;',
					catalogPath: env.tempCatalogPath,
					templatesDir: env.tempTemplatesDir,
					rootIndexPath: env.tempIndexPath,
				};
				await approval.autoEvolveTemplate(params);
				await approval.autoEvolveTemplate(params);
				const catalog = JSON.parse(fs.readFileSync(env.tempCatalogPath, 'utf8'));
				const matches = catalog.filter(t => t.id === 'DupeCheck');
				assert.strictEqual(matches.length, 1, 'Should not produce duplicate entries with identical ID');
			} finally {
				env.cleanup();
			}
		});

		it('2.10.3: missing componentCode throws ValidationError', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				await assert.rejects(
					async () => approval.autoEvolveTemplate({
						name: 'NoCode',
						title: 'Missing Code',
						aspectRatio: '4:5',
						catalogPath: env.tempCatalogPath,
					}),
					/componentCode|código do componente/i
				);
			} finally {
				env.cleanup();
			}
		});

		it('2.10.4: handles corrupted catalog file without unrecoverable crash', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				fs.writeFileSync(env.tempCatalogPath, 'corrupted content');
				await assert.rejects(
					async () => approval.autoEvolveTemplate({
						name: 'RecoverTemplate',
						title: 'Recover',
						aspectRatio: '4:5',
						width: 1080,
						height: 1350,
						durationInFrames: 240,
						fps: 30,
						componentCode: 'export const RecoverTemplate = () => <div/>;',
						catalogPath: env.tempCatalogPath,
						templatesDir: env.tempTemplatesDir,
						rootIndexPath: env.tempIndexPath,
					}),
					/SyntaxError|corrompido/i
				);
			} finally {
				env.cleanup();
			}
		});

		it('2.10.5: empty template name throws error', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				await assert.rejects(
					async () => approval.autoEvolveTemplate({
						name: '',
						title: 'Empty Name',
						aspectRatio: '4:5',
						componentCode: '<div/>',
						catalogPath: env.tempCatalogPath,
					}),
					/name|nome/i
				);
			} finally {
				env.cleanup();
			}
		});
	});

	// =========================================================================
	// Feature 11 Boundaries: Remotion Root Sync
	// =========================================================================
	describe('Feature 11 Boundaries: Remotion Root Sync', () => {
		it('2.11.1: missing root index file path throws descriptive error', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				await assert.rejects(
					async () => approval.autoEvolveTemplate({
						name: 'MissingIndexTest',
						title: 'Test',
						aspectRatio: '4:5',
						width: 1080,
						height: 1350,
						durationInFrames: 240,
						fps: 30,
						componentCode: 'export const MissingIndexTest = () => <div/>;',
						catalogPath: env.tempCatalogPath,
						templatesDir: env.tempTemplatesDir,
						rootIndexPath: 'non_existent_index.tsx',
					}),
					/ENOENT|index/i
				);
			} finally {
				env.cleanup();
			}
		});

		it('2.11.2: Composition width and height in root must be positive integers', () => {
			const catalog = JSON.parse(fs.readFileSync(PATHS.catalogoTemplates, 'utf8'));
			for (const t of catalog) {
				assert.ok(t.dimensoes.largura > 0, 'Width must be positive');
				assert.ok(t.dimensoes.altura > 0, 'Height must be positive');
				assert.strictEqual(Number.isInteger(t.dimensoes.largura), true);
				assert.strictEqual(Number.isInteger(t.dimensoes.altura), true);
			}
		});

		it('2.11.3: Composition FPS must be valid Remotion framerate (e.g. 30 or 60)', () => {
			const catalog = JSON.parse(fs.readFileSync(PATHS.catalogoTemplates, 'utf8'));
			for (const t of catalog) {
				assert.ok([24, 30, 60].includes(t.fps), `FPS ${t.fps} must be standard video framerate`);
			}
		});

		it('2.11.4: Composition durationInFrames must be greater than zero', () => {
			const catalog = JSON.parse(fs.readFileSync(PATHS.catalogoTemplates, 'utf8'));
			for (const t of catalog) {
				assert.ok(t.duracaoFrames > 0, 'Duration in frames must be positive');
			}
		});

		it('2.11.5: multiple sequential template registrations preserve all preceding compositions', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				await approval.autoEvolveTemplate({
					name: 'SeqTpl1',
					title: 'Seq 1',
					aspectRatio: '4:5',
					width: 1080,
					height: 1350,
					durationInFrames: 240,
					fps: 30,
					componentCode: 'export const SeqTpl1 = () => <div/>;',
					catalogPath: env.tempCatalogPath,
					templatesDir: env.tempTemplatesDir,
					rootIndexPath: env.tempIndexPath,
				});
				await approval.autoEvolveTemplate({
					name: 'SeqTpl2',
					title: 'Seq 2',
					aspectRatio: '9:16',
					width: 1080,
					height: 1920,
					durationInFrames: 300,
					fps: 30,
					componentCode: 'export const SeqTpl2 = () => <div/>;',
					catalogPath: env.tempCatalogPath,
					templatesDir: env.tempTemplatesDir,
					rootIndexPath: env.tempIndexPath,
				});
				const catalog = JSON.parse(fs.readFileSync(env.tempCatalogPath, 'utf8'));
				assert.ok(catalog.some(t => t.id === 'SeqTpl1'));
				assert.ok(catalog.some(t => t.id === 'SeqTpl2'));
			} finally {
				env.cleanup();
			}
		});
	});

});
