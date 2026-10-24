/**
 * Tier 4: Real-World Application Scenarios Test Suite
 * 
 * Verifies complete realistic end-to-end creator workflows:
 * - Scenario 1: Instagram High-Retention Carousel Creator (4:5 Editorial)
 * - Scenario 2: Apple Showcase / Fintech Kinetic Reel Creator (9:16 Vertical)
 * - Scenario 3: Reference Intake to Permanent Skill Promotion Workflow
 * - Scenario 4: Spontaneous "Clean Slate" Brainstorm Workflow
 * - Scenario 5: Full Creative Self-Evolution Lifecycle Loop
 * 
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

describe('Tier 4: Real-World Application Scenarios', () => {

	// =========================================================================
	// Scenario 1: High-Retention Instagram Carousel Creator (Editorial 4:5)
	// =========================================================================
	it('Scenario 1: High-Retention Instagram Carousel Creator Journey', async () => {
		const studio = await loadStudioEngine();
		const pipeline = await loadPipelineReferencia();
		const approval = await loadApprovalGate();

		assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
		assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
		assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');

		// Step 1: Creator starts interactive chat session
		const io = createMockIO([
			'1',                       // Choose Option [1] Usar um Template
			'CarrosselEditorial',       // Select pre-validated 4:5 template
			'venda de mentoria de software com foco em engenheiros sênior', // Briefing Expresso
		]);

		const session = await studio.runOnboarding(io.inputReader, io.outputWriter);
		assert.strictEqual(session.route, 1);
		assert.strictEqual(session.briefing, 'venda de mentoria de software com foco em engenheiros sênior');

		// Step 2: Validate selected template specifications from catalog
		const catalog = studio.listTemplates(PATHS.catalogoTemplates);
		const selected = catalog.find(t => t.id === 'CarrosselEditorial');
		assert.ok(selected, 'CarrosselEditorial must be found in catalog');
		assert.strictEqual(selected.proporcao, '4:5');
		assert.strictEqual(selected.dimensoes.largura, 1080);
		assert.strictEqual(selected.dimensoes.altura, 1350);
		assert.strictEqual(selected.duracaoFrames, 240);
		assert.strictEqual(selected.fps, 30);

		// Step 3: Verify Safe Zones calculation for Instagram 4:5
		const safe = pipeline.calculateSafeZones('4:5');
		assert.ok(safe.padding.top >= 40, 'Safe top margin avoids app header');
		assert.ok(safe.padding.bottom >= 36, 'Safe bottom margin avoids carousel pagination dots');

		// Step 4: Verify kinetic microinteractions parameters
		const micro = pipeline.getMicrointeractionsConfig();
		assert.strictEqual(micro.marquee.tiltAngle, 0, 'Marquee strictly at 0 degrees');
		assert.ok(micro.spring.damping >= 16, 'Elastic spring calibrated');
		assert.strictEqual(micro.svgGradientText.avoidBackgroundClip, true, 'Anti-Chromium black box bug enforced');

		// Step 5: Post-render approval gate - creator decides not to save as a new template since it used an existing one
		const approvalIO = createMockIO(['Não']);
		const approved = await approval.promptApprovalGate(approvalIO.inputReader, approvalIO.outputWriter);
		assert.strictEqual(approved, false);
		assert.ok(approvalIO.hasOutputMatching('Ficou aprovado! Deseja salvar essa estrutura'));
	});

	// =========================================================================
	// Scenario 2: Apple / Fintech Product Showcase Reel Creator (Reels 9:16)
	// =========================================================================
	it('Scenario 2: Apple Showcase & Fintech Kinetic Reel Creator Journey', async () => {
		const studio = await loadStudioEngine();
		const pipeline = await loadPipelineReferencia();
		const approval = await loadApprovalGate();

		assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
		assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
		assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');

		// Step 1: Creator selects FlowMotionMaster template for 9:16 Reels
		const io = createMockIO([
			'1',
			'FlowMotionMaster',
			'atração: lançamento do novo cartão de crédito minimalista em metal',
		]);

		const session = await studio.runOnboarding(io.inputReader, io.outputWriter);
		assert.strictEqual(session.route, 1);

		// Step 2: Validate 9:16 parameters
		const catalog = studio.listTemplates(PATHS.catalogoTemplates);
		const flow = catalog.find(t => t.id === 'FlowMotionMaster');
		assert.ok(flow);
		assert.strictEqual(flow.proporcao, '9:16');
		assert.strictEqual(flow.dimensoes.largura, 1080);
		assert.strictEqual(flow.dimensoes.altura, 1920);
		assert.strictEqual(flow.duracaoFrames, 825);
		assert.strictEqual(flow.fps, 30);

		// Step 3: Verify 9:16 safe zones (header exclusion & bottom UI exclusions for TikTok/Reels)
		const safe = pipeline.calculateSafeZones('9:16');
		assert.ok(safe.padding.top >= 100, 'Top padding excludes status bar / search');
		assert.ok(safe.padding.bottom >= 240, 'Bottom padding excludes handle, sound title, and captions');
		assert.ok(safe.padding.lateral >= 48, 'Sides padding excludes like/share buttons on right');

		// Step 4: Verify Remotion root registration for FlowMotionMaster
		assert.ok(fs.existsSync(PATHS.flowMotionMaster));
		const rootContent = fs.readFileSync(PATHS.rootIndex, 'utf8');
		assert.ok(rootContent.includes('FlowMotionMaster'));
	});

	// =========================================================================
	// Scenario 3: Community Reference Intake to Permanent Skill Promotion
	// =========================================================================
	it('Scenario 3: Community Reference Intake & Promotion Pipeline', async () => {
		const studio = await loadStudioEngine();
		const pipeline = await loadPipelineReferencia();

		assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
		assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');

		// Step 1: User picks Option [4] Criar com referência
		const io = createMockIO([
			'4',
			'https://www.instagram.com/reel/C8xyz123/',
			'atração de clientes para automações com IA',
		]);

		const session = await studio.runOnboarding(io.inputReader, io.outputWriter);
		assert.strictEqual(session.route, 4);
		assert.strictEqual(session.briefing, 'atração de clientes para automações com IA');

		// Step 2: a proteção de RAM (-vframes 1) é verificada por comportamento em
		// tests/unit/amostrar_paleta_comportamento.test.mjs.

		// Step 3: Verify skills catalog links to chromatic extraction
		const skills = JSON.parse(fs.readFileSync(PATHS.catalogoHabilidades, 'utf8'));
		const kmeansSkill = skills.find(s => s.id === 'amostragem_paleta_kmeans');
		assert.ok(kmeansSkill, 'amostragem_paleta_kmeans skill must exist');
		assert.strictEqual(kmeansSkill.script, 'scripts/references/amostrar_paleta.py');
	});

	// =========================================================================
	// Scenario 4: Spontaneous "Clean Slate" Brainstorm Workflow
	// =========================================================================
	it('Scenario 4: Spontaneous "Clean Slate" Brainstorm Workflow', async () => {
		const studio = await loadStudioEngine();
		const pipeline = await loadPipelineReferencia();
		const approval = await loadApprovalGate();

		assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
		assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
		assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');

		// Step 1: Creator picks Option [2] Criar do Zero
		const io = createMockIO([
			'2',
			'retenção: 5 lições contra-intuitivas sobre liderança técnica',
		]);

		const session = await studio.runOnboarding(io.inputReader, io.outputWriter);
		assert.strictEqual(session.route, 2);
		assert.strictEqual(session.briefing, 'retenção: 5 lições contra-intuitivas sobre liderança técnica');

		// Step 2: Enforce Tela Limpa rule
		const slate = studio.generateCleanSlate({
			aspect: '4:5',
			theme: session.briefing,
			objective: 'retenção',
		});

		assert.strictEqual(slate.cleanSlate, true);
		assert.strictEqual(slate.width, 1080);
		assert.strictEqual(slate.height, 1350);
		assert.ok(!slate.recycledScenes, 'No recycled scenes from prior projects');

		// Step 3: Approval gate on spontaneous creation - user chooses not to persist
		const approvalIO = createMockIO(['Não']);
		const approved = await approval.promptApprovalGate(approvalIO.inputReader, approvalIO.outputWriter);
		assert.strictEqual(approved, false);
	});

	// =========================================================================
	// Scenario 5: Full Creative Self-Evolution Lifecycle Loop
	// =========================================================================
	it('Scenario 5: Full Creative Self-Evolution Lifecycle Loop', async () => {
		const studio = await loadStudioEngine();
		const pipeline = await loadPipelineReferencia();
		const approval = await loadApprovalGate();

		assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
		assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');
		assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');

		const env = createIsolatedTestEnvironment();

		try {
			// Phase A: First creator creates and approves a new unique layout
			const approvalIO = createMockIO(['Sim']);
			const approved = await approval.promptApprovalGate(approvalIO.inputReader, approvalIO.outputWriter);
			assert.strictEqual(approved, true);

			// Phase B: Auto-evolution saves the component, updates catalog, registers root
			const newTemplateName = 'CarrosselAcidMinimal';
			const evolveResult = await approval.autoEvolveTemplate({
				name: newTemplateName,
				title: 'Acid Minimalist Carousel',
				aspectRatio: '4:5',
				width: 1080,
				height: 1350,
				durationInFrames: 240,
				fps: 30,
				componentCode: `import React from 'react';
export const ${newTemplateName}: React.FC = () => (
	<div style={{background: '#07090E', color: '#5fdc30'}}>Acid Minimal</div>
);`,
				catalogPath: env.tempCatalogPath,
				templatesDir: env.tempTemplatesDir,
				rootIndexPath: env.tempIndexPath,
			});

			assert.strictEqual(evolveResult.catalogUpdated, true);
			assert.strictEqual(evolveResult.rootRegistered, true);

			// Phase C: Next creator launches engine and sees new template in 1 click!
			const secondSessionTemplates = studio.listTemplates(env.tempCatalogPath);
			const found = secondSessionTemplates.find(t => t.id === newTemplateName);
			assert.ok(found, 'Evolved template must be immediately available to future creators');
			assert.strictEqual(found.nome, 'Acid Minimalist Carousel');
			assert.strictEqual(found.proporcao, '4:5');
		} finally {
			env.cleanup();
		}
	});

});
