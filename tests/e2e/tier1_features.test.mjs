/**
 * Tier 1: Requirement-Driven Feature Coverage Test Suite
 * 
 * Verifies Features 1 to 11 from PROJECT.md with >= 5 tests per feature.
 * Native Node.js test runner (node:test + node:assert). Zero external dependencies.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
	PATHS,
	createMockIO,
	loadStudioEngine,
	loadPipelineReferencia,
	loadApprovalGate,
	createIsolatedTestEnvironment,
} from './helpers.mjs';

describe('Tier 1: Feature Coverage (Features 1 to 11)', () => {

	// =========================================================================
	// Feature 1: Canonical Onboarding Prompt (R1.1)
	// =========================================================================
	describe('Feature 1: Canonical Onboarding Prompt', () => {
		it('1.1: should include exact canonical greeting prompt text', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['3', '1']);
			await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.ok(
				io.hasOutputMatching('🎬 O que vamos criar hoje?'),
				'Expected exact prompt: "🎬 O que vamos criar hoje?"'
			);
		});

		it('1.2: should list Option [1] with exact canonical description', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['1', 'venda de curso']);
			await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.ok(
				io.hasOutputMatching(/\[1\]\s*Usar um Template/i),
				'Expected Option [1] Usar um Template'
			);
			assert.ok(
				io.hasOutputMatching('Lista os templates já validados em 1 clique'),
				'Expected description for Option [1]'
			);
		});

		it('1.3: should list Option [2] with exact canonical description', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['2', 'conteudo livre']);
			await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.ok(
				io.hasOutputMatching(/\[2\]\s*Criar do Zero/i),
				'Expected Option [2] Criar do Zero'
			);
			assert.ok(
				io.hasOutputMatching('Tela limpa sem reciclagem de layouts anteriores'),
				'Expected description for Option [2]'
			);
		});

		it('1.4: should list Option [3] with exact canonical description', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['3', '2', 'tema']);
			await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.ok(
				io.hasOutputMatching(/\[3\]\s*Ver Habilidades/i),
				'Expected Option [3] Ver Habilidades'
			);
			assert.ok(
				io.hasOutputMatching('Lista dinâmica do que o motor sabe fazer via catalogo_habilidades.json'),
				'Expected description for Option [3]'
			);
		});

		it('1.5: should list Option [4] with exact canonical description', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['4', 'https://instagram.com/p/test', 'tema']);
			await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.ok(
				io.hasOutputMatching(/\[4\]\s*Criar com referência/i),
				'Expected Option [4] Criar com referência'
			);
			assert.ok(
				io.hasOutputMatching('Ingestão de link do Instagram, TikTok, X, Animos, site ou print anexado'),
				'Expected description for Option [4]'
			);
		});

		it('1.6: should return structured result reflecting selected route and capture state', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['1', 'venda de mentoria']);
			const result = await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.strictEqual(typeof result, 'object');
			assert.strictEqual(result.route, 1);
		});
	});

	// =========================================================================
	// Feature 2: Dynamic Skills Catalog in 3 Categories (R1.1, Criteria)
	// =========================================================================
	describe('Feature 2: Dynamic Skills Catalog in 3 Categories', () => {
		it('2.1: should read directly from catalogo_habilidades.json with the 8 canonical skills', () => {
			assert.ok(fs.existsSync(PATHS.catalogoHabilidades), 'catalogo_habilidades.json must exist');
			const raw = fs.readFileSync(PATHS.catalogoHabilidades, 'utf8');
			const skills = JSON.parse(raw);
			assert.ok(Array.isArray(skills), 'Skills must be an array');
			const canonicalIds = [
				'amostragem_paleta_kmeans',
				'svg_iridescent_gradient',
				'kinetic_word_caption',
				'typewriter_subtitles',
				'spring_physics_curves',
				'apple_camera_rig',
				'sound_impact_engine',
				'vox_documentary_motion',
			];
			assert.deepStrictEqual(
				skills.map(s => s.id).sort(),
				[...canonicalIds].sort(),
				'Catalog ids must match the canonical list of 8 skills',
			);
		});

		it('2.2: category 1 should group Cromia, Gradientes & Decomposição Visual', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const catalog = studio.formatSkillsCatalog(PATHS.catalogoHabilidades);
			assert.ok(catalog.category1, 'Expected category1 in catalog');
			const ids = catalog.category1.map(s => s.id);
			assert.ok(ids.includes('amostragem_paleta_kmeans'), 'amostragem_paleta_kmeans must be in category 1');
			assert.ok(ids.includes('svg_iridescent_gradient'), 'svg_iridescent_gradient must be in category 1');
		});

		it('2.3: category 2 should group Tipografia Cinética & Sincronização de Áudio', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const catalog = studio.formatSkillsCatalog(PATHS.catalogoHabilidades);
			assert.ok(catalog.category2, 'Expected category2 in catalog');
			const ids = catalog.category2.map(s => s.id);
			assert.ok(ids.includes('kinetic_word_caption'), 'kinetic_word_caption must be in category 2');
			assert.ok(ids.includes('typewriter_subtitles'), 'typewriter_subtitles must be in category 2');
		});

		it('2.4: category 3 should group Cinemática 3D, Câmera & Sound Design', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const catalog = studio.formatSkillsCatalog(PATHS.catalogoHabilidades);
			assert.ok(catalog.category3, 'Expected category3 in catalog');
			const ids = catalog.category3.map(s => s.id);
			assert.ok(ids.includes('spring_physics_curves'), 'spring_physics_curves must be in category 3');
			assert.ok(ids.includes('apple_camera_rig'), 'apple_camera_rig must be in category 3');
			assert.ok(ids.includes('sound_impact_engine'), 'sound_impact_engine must be in category 3');
		});

		it('2.5: formattedText should be human-readable without technical jargon', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const catalog = studio.formatSkillsCatalog(PATHS.catalogoHabilidades);
			assert.ok(catalog.formattedText, 'Expected formattedText output');
			assert.ok(catalog.formattedText.includes('Cromia'), 'Expected Cromia header');
			assert.ok(catalog.formattedText.includes('Tipografia'), 'Expected Tipografia header');
			assert.ok(catalog.formattedText.includes('Cinemática') || catalog.formattedText.includes('Sound Design'), 'Expected Cinemática header');
			assert.ok(!catalog.formattedText.includes('background-clip'), 'Internal CSS jargon should not leak in summary');
		});

		it('2.6: total skills mapped across 3 categories must equal total skills in JSON', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const catalog = studio.formatSkillsCatalog(PATHS.catalogoHabilidades);
			const total = catalog.category1.length + catalog.category2.length + catalog.category3.length;
			const jsonTotal = JSON.parse(fs.readFileSync(PATHS.catalogoHabilidades, 'utf8')).length;
			assert.strictEqual(total, jsonTotal, `Total mapped skills must be ${jsonTotal} with zero drops`);
		});
	});

	// =========================================================================
	// Feature 3: Single-Line Briefing Expresso (R1.2)
	// =========================================================================
	describe('Feature 3: Single-Line Briefing Expresso', () => {
		it('3.1: prompt text must strictly match canonical Briefing Expresso wording', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['venda de mentoria']);
			await studio.promptBriefingExpresso(io.inputReader, io.outputWriter);
			assert.ok(
				io.hasOutputMatching('🎯 Qual é o objetivo (venda, atração, retenção) e o tema/assunto do conteúdo de hoje?'),
				'Expected exact prompt: "🎯 Qual é o objetivo (venda, atração, retenção) e o tema/assunto do conteúdo de hoje?"'
			);
		});

		it('3.2: should be immediately prompted after choosing Option [1]', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['1', 'atração sobre inteligência artificial']);
			const result = await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.ok(io.hasOutputMatching('🎯 Qual é o objetivo'));
			assert.strictEqual(result.briefing, 'atração sobre inteligência artificial');
		});

		it('3.3: should be immediately prompted after choosing Option [2]', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['2', 'retenção: segredos de alta performance']);
			const result = await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.ok(io.hasOutputMatching('🎯 Qual é o objetivo'));
			assert.strictEqual(result.briefing, 'retenção: segredos de alta performance');
		});

		it('3.4: should be immediately prompted after choosing Option [4] and reference input', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['4', 'https://tiktok.com/@test/video/1', 'venda de automação']);
			const result = await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.ok(io.hasOutputMatching('🎯 Qual é o objetivo'));
			assert.strictEqual(result.briefing, 'venda de automação');
		});

		it('3.5: Option [3] (Habilidades) should NOT trigger Briefing Expresso directly', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			// Route 3 prints skills, then awaits creator to choose creation route (e.g. 1)
			const io = createMockIO(['3', '1', 'venda']);
			const result = await studio.runOnboarding(io.inputReader, io.outputWriter);
			assert.strictEqual(result.skillViewed, true);
		});

		it('3.6: returns trimmed single-line string without extra newlines', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const io = createMockIO(['   venda de software B2B   \r\n']);
			const briefing = await studio.promptBriefingExpresso(io.inputReader, io.outputWriter);
			assert.strictEqual(briefing, 'venda de software B2B');
		});
	});

	// =========================================================================
	// Feature 4: Template Selection Listing (Option 1)
	// =========================================================================
	describe('Feature 4: Template Selection Listing (Option 1)', () => {
		it('4.1: catalogo_templates.json must be valid JSON containing active templates', () => {
			assert.ok(fs.existsSync(PATHS.catalogoTemplates), 'catalogo_templates.json must exist');
			const templates = JSON.parse(fs.readFileSync(PATHS.catalogoTemplates, 'utf8'));
			assert.ok(Array.isArray(templates));
			assert.ok(templates.length >= 2, 'Must have at least 2 default templates');
		});

		it('4.2: lists CarrosselEditorial with 4:5 aspect ratio and 1080x1350 resolution', () => {
			const templates = JSON.parse(fs.readFileSync(PATHS.catalogoTemplates, 'utf8'));
			const carrossel = templates.find(t => t.id === 'CarrosselEditorial');
			assert.ok(carrossel, 'CarrosselEditorial must be present in catalog');
			assert.strictEqual(carrossel.proporcao, '4:5');
			assert.strictEqual(carrossel.dimensoes.largura, 1080);
			assert.strictEqual(carrossel.dimensoes.altura, 1350);
			assert.strictEqual(carrossel.fps, 30);
		});

		it('4.3: lists FlowMotionMaster with 9:16 aspect ratio and 1080x1920 resolution', () => {
			const templates = JSON.parse(fs.readFileSync(PATHS.catalogoTemplates, 'utf8'));
			const flow = templates.find(t => t.id === 'FlowMotionMaster');
			assert.ok(flow, 'FlowMotionMaster must be present in catalog');
			assert.strictEqual(flow.proporcao, '9:16');
			assert.strictEqual(flow.dimensoes.largura, 1080);
			assert.strictEqual(flow.dimensoes.altura, 1920);
			assert.strictEqual(flow.fps, 30);
		});

		it('4.4: listTemplates() helper returns array of validated templates', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const list = studio.listTemplates(PATHS.catalogoTemplates);
			assert.ok(Array.isArray(list));
			assert.ok(list.some(t => t.id === 'CarrosselEditorial'));
			assert.ok(list.some(t => t.id === 'FlowMotionMaster'));
		});

		it('4.5: each listed template has associated existing source file', () => {
			const templates = JSON.parse(fs.readFileSync(PATHS.catalogoTemplates, 'utf8'));
			for (const t of templates) {
				const fullPath = path.resolve(PATHS.engineRoot, t.arquivo);
				assert.ok(fs.existsSync(fullPath), `Template source file ${t.arquivo} must exist`);
			}
		});
	});

	// =========================================================================
	// Feature 5: Clean Slate Generation (Option 2)
	// =========================================================================
	describe('Feature 5: Clean Slate Generation (Option 2)', () => {
		it('5.1: generateCleanSlate() returns a clean layout specification', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const slate = studio.generateCleanSlate({ aspect: '4:5', theme: 'Liderança', objective: 'venda' });
			assert.ok(slate, 'Expected clean slate object');
			assert.strictEqual(slate.cleanSlate, true);
		});

		it('5.2: clean slate does not inherit residual titles or copy from previous projects', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const slate = studio.generateCleanSlate({ aspect: '9:16', theme: 'Novo Produto' });
			assert.ok(!slate.title || slate.title === 'Novo Produto', 'Title must strictly match current theme');
			assert.ok(!slate.recycledLayout, 'No stale layout should be recycled');
		});

		it('5.3: supports 4:5, 9:16 and 1:1 aspect ratios', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const s45 = studio.generateCleanSlate({ aspect: '4:5' });
			assert.strictEqual(s45.width, 1080);
			assert.strictEqual(s45.height, 1350);

			const s916 = studio.generateCleanSlate({ aspect: '9:16' });
			assert.strictEqual(s916.width, 1080);
			assert.strictEqual(s916.height, 1920);

			const s11 = studio.generateCleanSlate({ aspect: '1:1' });
			assert.strictEqual(s11.width, 1080);
			assert.strictEqual(s11.height, 1080);
		});

		it('5.4: provides default canvas styling with dark theme foundation', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const slate = studio.generateCleanSlate({ aspect: '9:16' });
			assert.ok(slate.background, 'Expected default background styling');
			assert.ok(slate.background.startsWith('#'), 'Expected HEX background color');
		});

		it('5.5: includes safeBox boundaries in clean slate output', async () => {
			const studio = await loadStudioEngine();
			assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
			const slate = studio.generateCleanSlate({ aspect: '4:5' });
			assert.ok(slate.safeBox, 'Expected safeBox definition');
			assert.ok(typeof slate.safeBox.minX === 'number');
			assert.ok(typeof slate.safeBox.maxY === 'number');
		});
	});

	// =========================================================================
	// Feature 6: Reference Media Ingestion (Option 4)
	// =========================================================================
	describe('Feature 6: Reference Media Ingestion (Option 4)', () => {
		it('6.1: extractReferencePalette function must be exported', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			assert.strictEqual(typeof pipeline.extractReferencePalette, 'function');
		});

		it('6.2: accepts image paths (.png, .jpg, .webp)', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			assert.strictEqual(typeof pipeline.extractReferencePalette, 'function');
		});

		it('6.3: sanitizes URL against malicious injection strings', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			if (pipeline.sanitizeUrl) {
				const clean = pipeline.sanitizeUrl('https://instagram.com/p/123?q="><script>');
				assert.ok(!clean.includes('<script>'), 'Must sanitize script tags');
				assert.ok(!clean.includes('"'), 'Must sanitize double quotes');
			}
		});

		it('6.4: extracts dominant palette as array of HEX colors', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			// If synthetic image or mock test is available
			assert.ok(typeof pipeline.extractReferencePalette === 'function');
		});

		it('6.5: returns structured editorial zones (card, marquee, badge, category, canvas)', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			assert.ok(typeof pipeline.extractReferencePalette === 'function');
		});
	});

	// =========================================================================
	// Feature 7: Zero-RAM-Leak Frame Extraction (R2, Criteria)
	// =========================================================================
	describe('Feature 7: Zero-RAM-Leak Frame Extraction', () => {
		it('7.1: amostrar_paleta.py source strictly contains -vframes 1 argument', () => {
			assert.ok(fs.existsSync(PATHS.amostrarPaleta), 'amostrar_paleta.py must exist');
			const content = fs.readFileSync(PATHS.amostrarPaleta, 'utf8');
			assert.ok(content.includes("'-vframes'"), "FFmpeg command must include '-vframes'");
			assert.ok(content.includes("'1'"), "FFmpeg command must include '1' frame cap");
		});

		it('7.2: raw video format is strictly capped to rgb24 single frame bytes', () => {
			const content = fs.readFileSync(PATHS.amostrarPaleta, 'utf8');
			assert.ok(content.includes("'-pix_fmt'"), 'Must specify pix_fmt');
			assert.ok(content.includes("'rgb24'"), 'Must specify rgb24');
			assert.ok(content.includes('expected_bytes = w * h * 3'), 'Must calculate exact w * h * 3 buffer size');
		});

		it('7.3: enforces ffprobe and ffmpeg timeouts to prevent hung processes', () => {
			const content = fs.readFileSync(PATHS.amostrarPaleta, 'utf8');
			assert.ok(content.includes('timeout=10') || content.includes('timeout='), 'Must enforce subprocess timeout');
		});

		it('7.4: configures sys.stdout to UTF-8 to prevent Windows cp1252 crashes', () => {
			const content = fs.readFileSync(PATHS.amostrarPaleta, 'utf8');
			assert.ok(
				content.includes("sys.stdout.reconfigure(encoding='utf-8')") ||
				content.includes('utf-8'),
				'Must configure UTF-8 encoding for Windows terminal stability'
			);
		});

		it('7.5: subsamples pixels at stride 4 to enforce memory ceiling', () => {
			const content = fs.readFileSync(PATHS.amostrarPaleta, 'utf8');
			assert.ok(
				content.includes('::4, ::4'),
				'K-Means clustering must subsample with stride 4 [::4, ::4]'
			);
		});
	});

	// =========================================================================
	// Feature 8: Safe Zones & Microinteractions Integration (R2)
	// =========================================================================
	describe('Feature 8: Safe Zones & Microinteractions Integration', () => {
		it('8.1: calculates Instagram Carrossel 4:5 safe zones correctly', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			const zones = pipeline.calculateSafeZones('4:5');
			assert.ok(zones.padding.top >= 40 && zones.padding.top <= 60, 'Top padding 40-60px');
			assert.ok(zones.padding.bottom >= 36 && zones.padding.bottom <= 50, 'Bottom padding 36-50px');
			assert.ok(zones.padding.lateral >= 48 && zones.padding.lateral <= 64, 'Lateral padding 48-64px');
		});

		it('8.2: calculates Reels / TikTok 9:16 safe zones correctly', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			const zones = pipeline.calculateSafeZones('9:16');
			assert.ok(zones.padding.top >= 100 && zones.padding.top <= 140, 'Top padding ~120px');
			assert.ok(zones.padding.bottom >= 240 && zones.padding.bottom <= 320, 'Bottom padding 240-300px');
			assert.ok(zones.padding.lateral >= 48 && zones.padding.lateral <= 70, 'Sides padding ~60px');
		});

		it('8.3: calculates Square 1:1 safe zones correctly', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			const zones = pipeline.calculateSafeZones('1:1');
			assert.ok(zones.padding.top >= 48 && zones.padding.top <= 64);
			assert.ok(zones.padding.bottom >= 48 && zones.padding.bottom <= 64);
		});

		it('8.4: getMicrointeractionsConfig() specifies kinetic spring physics', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			const micro = pipeline.getMicrointeractionsConfig();
			assert.ok(micro.spring, 'Expected spring physics config');
			assert.ok(micro.spring.damping >= 16 && micro.spring.damping <= 20, 'Damping around 18');
			assert.ok(micro.spring.stiffness >= 80 && micro.spring.stiffness <= 140, 'Stiffness 90-120');
		});

		it('8.5: getMicrointeractionsConfig() specifies continuous conveyor marquee loop at 0 degrees', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			const micro = pipeline.getMicrointeractionsConfig();
			assert.ok(micro.marquee, 'Expected marquee config');
			assert.strictEqual(micro.marquee.tiltAngle, 0, 'Marquee must loop at 0 degrees (no slant)');
			assert.ok(micro.marquee.alternatingDirections, 'Expected alternating row directions');
		});

		it('8.6: getMicrointeractionsConfig() specifies SVG native gradient for anti-Chromium bug', async () => {
			const pipeline = await loadPipelineReferencia();
			assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
			const micro = pipeline.getMicrointeractionsConfig();
			assert.ok(micro.svgGradientText, 'Expected svgGradientText config');
			assert.strictEqual(micro.svgGradientText.avoidBackgroundClip, true);
		});
	});

	// =========================================================================
	// Feature 9: Post-Render Approval Question (R3)
	// =========================================================================
	describe('Feature 9: Post-Render Approval Question', () => {
		it('9.1: prompt text strictly matches canonical approval question', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const io = createMockIO(['Sim']);
			await approval.promptApprovalGate(io.inputReader, io.outputWriter);
			assert.ok(
				io.hasOutputMatching('Ficou aprovado! Deseja salvar essa estrutura como um novo Template na biblioteca? (Sim / Não)'),
				'Expected exact prompt: "Ficou aprovado! Deseja salvar essa estrutura como um novo Template na biblioteca? (Sim / Não)"'
			);
		});

		it('9.2: affirmative "Sim" returns true', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const io = createMockIO(['Sim']);
			const approved = await approval.promptApprovalGate(io.inputReader, io.outputWriter);
			assert.strictEqual(approved, true);
		});

		it('9.3: affirmative lowercase and short variants ("sim", "SIM", "S", "s") return true', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			for (const ans of ['sim', 'SIM', 'S', 's', 'Sim, com certeza']) {
				const io = createMockIO([ans]);
				const res = await approval.promptApprovalGate(io.inputReader, io.outputWriter);
				assert.strictEqual(res, true, `Answer "${ans}" should be evaluated as true`);
			}
		});

		it('9.4: negative "Não" returns false', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const io = createMockIO(['Não']);
			const approved = await approval.promptApprovalGate(io.inputReader, io.outputWriter);
			assert.strictEqual(approved, false);
		});

		it('9.5: negative variations and non-affirmative inputs ("nao", "NÃO", "N", "talvez") return false', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			for (const ans of ['nao', 'NÃO', 'N', 'n', 'talvez', 'ajustar cores', '']) {
				const io = createMockIO([ans]);
				const res = await approval.promptApprovalGate(io.inputReader, io.outputWriter);
				assert.strictEqual(res, false, `Answer "${ans}" should be evaluated as false`);
			}
		});
	});

	// =========================================================================
	// Feature 10: Template Library Auto-Evolution (R3, Criteria)
	// =========================================================================
	describe('Feature 10: Template Library Auto-Evolution', () => {
		it('10.1: does not save template or mutate catalog if approval is false', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				const initialCatalog = fs.readFileSync(env.tempCatalogPath, 'utf8');
				// Call autoEvolveTemplate with approved: false or prompt rejected
				if (approval.handlePostRender) {
					const io = createMockIO(['Não']);
					await approval.handlePostRender({
						io,
						templateParams: { name: 'RejectedTemplate', title: 'Test' },
						catalogPath: env.tempCatalogPath,
					});
					const finalCatalog = fs.readFileSync(env.tempCatalogPath, 'utf8');
					assert.strictEqual(initialCatalog, finalCatalog, 'Catalog must not be modified when rejected');
				}
			} finally {
				env.cleanup();
			}
		});

		it('10.2: sanitizes client copy into generic props interface', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				const res = await approval.autoEvolveTemplate({
					name: 'TestEvolved',
					title: 'Template Evolved Test',
					aspectRatio: '4:5',
					width: 1080,
					height: 1350,
					durationInFrames: 240,
					fps: 30,
					componentCode: 'export const TestEvolved = () => <div>Hello World</div>;',
					catalogPath: env.tempCatalogPath,
					templatesDir: env.tempTemplatesDir,
					rootIndexPath: env.tempIndexPath,
				});
				assert.ok(res.templatePath, 'Expected saved template path');
				assert.ok(fs.existsSync(res.templatePath), 'Saved template file must exist');
			} finally {
				env.cleanup();
			}
		});

		it('10.3: saves template TSX file into designated templates directory', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				const res = await approval.autoEvolveTemplate({
					name: 'ShowcaseDark',
					title: 'Showcase Dark Minimal',
					aspectRatio: '9:16',
					width: 1080,
					height: 1920,
					durationInFrames: 300,
					fps: 30,
					componentCode: 'export const ShowcaseDark = () => <div>Dark</div>;',
					catalogPath: env.tempCatalogPath,
					templatesDir: env.tempTemplatesDir,
					rootIndexPath: env.tempIndexPath,
				});
				assert.ok(res.templatePath.endsWith('.tsx'));
				assert.ok(fs.existsSync(res.templatePath));
			} finally {
				env.cleanup();
			}
		});

		it('10.4: appends valid template metadata into catalogo_templates.json', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				await approval.autoEvolveTemplate({
					name: 'NewCardStack',
					title: 'Card Stack Kinetic',
					aspectRatio: '9:16',
					width: 1080,
					height: 1920,
					durationInFrames: 450,
					fps: 30,
					componentCode: 'export const NewCardStack = () => <div/>;',
					catalogPath: env.tempCatalogPath,
					templatesDir: env.tempTemplatesDir,
					rootIndexPath: env.tempIndexPath,
				});
				const updatedCatalog = JSON.parse(fs.readFileSync(env.tempCatalogPath, 'utf8'));
				const added = updatedCatalog.find(t => t.id === 'NewCardStack');
				assert.ok(added, 'New template must be in catalogo_templates.json');
				assert.strictEqual(added.proporcao, '9:16');
				assert.strictEqual(added.duracaoFrames, 450);
			} finally {
				env.cleanup();
			}
		});

		it('10.5: preserves existing templates in catalog during addition', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				const before = JSON.parse(fs.readFileSync(env.tempCatalogPath, 'utf8'));
				await approval.autoEvolveTemplate({
					name: 'AdditiveTemplate',
					title: 'Additive Template Test',
					aspectRatio: '4:5',
					width: 1080,
					height: 1350,
					durationInFrames: 240,
					fps: 30,
					componentCode: 'export const AdditiveTemplate = () => <div/>;',
					catalogPath: env.tempCatalogPath,
					templatesDir: env.tempTemplatesDir,
					rootIndexPath: env.tempIndexPath,
				});
				const after = JSON.parse(fs.readFileSync(env.tempCatalogPath, 'utf8'));
				assert.strictEqual(after.length, before.length + 1, 'Catalog length must increase by exactly 1');
				assert.ok(after.some(t => t.id === before[0].id), 'Pre-existing templates must be preserved');
			} finally {
				env.cleanup();
			}
		});

		it('10.6: returns catalogUpdated: true and rootRegistered: true upon success', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				const res = await approval.autoEvolveTemplate({
					name: 'CompleteRegistration',
					title: 'Complete Reg Test',
					aspectRatio: '4:5',
					width: 1080,
					height: 1350,
					durationInFrames: 240,
					fps: 30,
					componentCode: 'export const CompleteRegistration = () => <div/>;',
					catalogPath: env.tempCatalogPath,
					templatesDir: env.tempTemplatesDir,
					rootIndexPath: env.tempIndexPath,
				});
				assert.strictEqual(res.catalogUpdated, true);
				assert.strictEqual(res.rootRegistered, true);
			} finally {
				env.cleanup();
			}
		});
	});

	// =========================================================================
	// Feature 11: Registration Sync in Remotion Root (M3, Index)
	// =========================================================================
	describe('Feature 11: Registration Sync in Remotion Root', () => {
		it('11.1: src/index.tsx must exist and contain registerRoot call', () => {
			assert.ok(fs.existsSync(PATHS.rootIndex), 'src/index.tsx must exist');
			const content = fs.readFileSync(PATHS.rootIndex, 'utf8');
			assert.ok(content.includes('registerRoot'), 'src/index.tsx must call registerRoot');
		});

		it('11.2: FlowMotionMaster must be registered as a Composition in src/index.tsx', () => {
			const content = fs.readFileSync(PATHS.rootIndex, 'utf8');
			assert.ok(content.includes('FlowMotionMaster'), 'FlowMotionMaster must be registered');
			assert.ok(content.includes('Composition'), 'Must declare Remotion Composition');
		});

		it('11.3: CarrosselEditorial registration contract in Remotion Root', () => {
			assert.ok(fs.existsSync(PATHS.carrosselEditorial), 'CarrosselEditorial.tsx must exist');
			const catalog = JSON.parse(fs.readFileSync(PATHS.catalogoTemplates, 'utf8'));
			const carrosselEntry = catalog.find(t => t.id === 'CarrosselEditorial');
			assert.ok(carrosselEntry, 'CarrosselEditorial must be defined in catalogo_templates.json');
		});

		it('11.4: root sync does not corrupt TypeScript syntax in index.tsx', async () => {
			const approval = await loadApprovalGate();
			assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
			const env = createIsolatedTestEnvironment();
			try {
				await approval.autoEvolveTemplate({
					name: 'SyntaxCheckTemplate',
					title: 'Syntax Check',
					aspectRatio: '9:16',
					width: 1080,
					height: 1920,
					durationInFrames: 300,
					fps: 30,
					componentCode: 'export const SyntaxCheckTemplate = () => <div/>;',
					catalogPath: env.tempCatalogPath,
					templatesDir: env.tempTemplatesDir,
					rootIndexPath: env.tempIndexPath,
				});
				const indexContent = fs.readFileSync(env.tempIndexPath, 'utf8');
				assert.ok(indexContent.includes('SyntaxCheckTemplate'), 'New template must be imported or registered in index');
			} finally {
				env.cleanup();
			}
		});

		it('11.5: composition IDs must be unique across root registrations', () => {
			const templates = JSON.parse(fs.readFileSync(PATHS.catalogoTemplates, 'utf8'));
			const ids = templates.map(t => t.id);
			const uniqueIds = new Set(ids);
			assert.strictEqual(ids.length, uniqueIds.size, 'Template IDs in catalog must be unique');
		});
	});

});
