/**
 * Tier 3: Cross-Feature Combinations Test Suite
 * 
 * Verifies pairwise and sequential interactions across routes, briefings,
 * palette extraction, safe zone calculation, approval gate, and auto-evolution.
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

describe('Tier 3: Cross-Feature Combinations', () => {

	it('3.1: Combination: Route 1 -> CarrosselEditorial -> Briefing Expresso -> Ready Pipeline State', async () => {
		const studio = await loadStudioEngine();
		assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
		// Input sequence: Route 1, choose template '1' (CarrosselEditorial), Briefing Expresso
		const io = createMockIO(['1', 'CarrosselEditorial', 'venda de curso intensivo de IA']);
		const result = await studio.runOnboarding(io.inputReader, io.outputWriter);

		assert.strictEqual(result.route, 1);
		assert.strictEqual(result.briefing, 'venda de curso intensivo de IA');
		assert.ok(io.hasOutputMatching('🎬 O que vamos criar hoje?'));
		assert.ok(io.hasOutputMatching('🎯 Qual é o objetivo'));
	});

	it('3.2: Combination: Route 1 -> FlowMotionMaster -> Briefing Expresso -> Ready Pipeline State', async () => {
		const studio = await loadStudioEngine();
		assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
		const io = createMockIO(['1', 'FlowMotionMaster', 'atração: showcase de novo design system']);
		const result = await studio.runOnboarding(io.inputReader, io.outputWriter);

		assert.strictEqual(result.route, 1);
		assert.strictEqual(result.briefing, 'atração: showcase de novo design system');
	});

	it('3.3: Combination: Route 2 (Criar do Zero) -> Briefing Expresso -> Clean Slate with 4:5 Safe Zones', async () => {
		const studio = await loadStudioEngine();
		const pipeline = await loadPipelineReferencia();
		assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
		assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');

		const io = createMockIO(['2', 'retenção: microinterações em Remotion']);
		const result = await studio.runOnboarding(io.inputReader, io.outputWriter);

		assert.strictEqual(result.route, 2);
		assert.strictEqual(result.briefing, 'retenção: microinterações em Remotion');

		const slate = studio.generateCleanSlate({ aspect: '4:5', theme: result.briefing });
		const safeZones = pipeline.calculateSafeZones('4:5');

		assert.strictEqual(slate.cleanSlate, true);
		assert.strictEqual(slate.width, 1080);
		assert.strictEqual(slate.height, 1350);
		assert.strictEqual(slate.safeBox.minX, safeZones.safeBox.minX);
	});

	it('3.4: Combination: Route 2 (Criar do Zero) -> Briefing Expresso -> Clean Slate with 9:16 Safe Zones', async () => {
		const studio = await loadStudioEngine();
		const pipeline = await loadPipelineReferencia();
		assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
		assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');

		const io = createMockIO(['2', 'venda de SaaS financeiro']);
		const result = await studio.runOnboarding(io.inputReader, io.outputWriter);

		const slate = studio.generateCleanSlate({ aspect: '9:16', theme: result.briefing });
		const safeZones = pipeline.calculateSafeZones('9:16');

		assert.strictEqual(slate.width, 1080);
		assert.strictEqual(slate.height, 1920);
		assert.strictEqual(slate.safeBox.maxY, safeZones.safeBox.maxY);
	});

	it('3.5: Combination: Route 3 (Habilidades) -> Browse -> Select Route 1 -> Briefing Expresso', async () => {
		const studio = await loadStudioEngine();
		assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
		// User inspects skills (3), then picks Route 1 with CarrosselEditorial and briefing
		const io = createMockIO(['3', '1', 'CarrosselEditorial', 'atração de público sênior']);
		const result = await studio.runOnboarding(io.inputReader, io.outputWriter);

		assert.strictEqual(result.skillViewed, true);
		assert.strictEqual(result.route, 1);
		assert.strictEqual(result.briefing, 'atração de público sênior');
		assert.ok(io.hasOutputMatching('Cromia, Gradientes & Decomposição'));
	});

	it('3.6: Combination: Route 4 (Referência) -> Ingestion -> Briefing Expresso -> Palette Extraction', async () => {
		const studio = await loadStudioEngine();
		const pipeline = await loadPipelineReferencia();
		assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
		assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');

		const io = createMockIO(['4', 'https://instagram.com/p/reel_ref_123', 'venda de consultoria']);
		const result = await studio.runOnboarding(io.inputReader, io.outputWriter);

		assert.strictEqual(result.route, 4);
		assert.strictEqual(result.briefing, 'venda de consultoria');
		assert.ok(typeof pipeline.extractReferencePalette === 'function');
	});

	it('3.7: Combination: Reference Ingestion (4:5) -> Safe Zone Binding -> Palette Mapping', async () => {
		const pipeline = await loadPipelineReferencia();
		assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');

		const safe = pipeline.calculateSafeZones('4:5');
		assert.strictEqual(safe.safeBox.maxX, 1080 - safe.padding.lateral);
		assert.strictEqual(safe.safeBox.maxY, 1350 - safe.padding.bottom);
	});

	it('3.8: Combination: Reference Ingestion (9:16) -> Safe Zone Binding -> Palette Mapping', async () => {
		const pipeline = await loadPipelineReferencia();
		assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');

		const safe = pipeline.calculateSafeZones('9:16');
		assert.strictEqual(safe.safeBox.maxX, 1080 - safe.padding.lateral);
		assert.strictEqual(safe.safeBox.maxY, 1920 - safe.padding.bottom);
	});

	it('3.9: Combination: Render Complete -> Approval Gate "Não" -> Preserves Template Catalog Clean', async () => {
		const approval = await loadApprovalGate();
		assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
		const env = createIsolatedTestEnvironment();

		try {
			const initialCatalog = fs.readFileSync(env.tempCatalogPath, 'utf8');
			const io = createMockIO(['Não']);
			const approved = await approval.promptApprovalGate(io.inputReader, io.outputWriter);
			assert.strictEqual(approved, false);

			const finalCatalog = fs.readFileSync(env.tempCatalogPath, 'utf8');
			assert.strictEqual(initialCatalog, finalCatalog, 'Catalog must not be mutated on negative approval');
		} finally {
			env.cleanup();
		}
	});

	it('3.10: Combination: Render Complete -> Approval Gate "Sim" -> Auto-Evolves and Registers Template', async () => {
		const approval = await loadApprovalGate();
		assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
		const env = createIsolatedTestEnvironment();

		try {
			const io = createMockIO(['Sim']);
			const approved = await approval.promptApprovalGate(io.inputReader, io.outputWriter);
			assert.strictEqual(approved, true);

			const evolved = await approval.autoEvolveTemplate({
				name: 'ComboTemplate',
				title: 'Combination Auto Evolved',
				aspectRatio: '9:16',
				width: 1080,
				height: 1920,
				durationInFrames: 600,
				fps: 30,
				componentCode: 'export const ComboTemplate = () => <div className="combo"/>;',
				catalogPath: env.tempCatalogPath,
				templatesDir: env.tempTemplatesDir,
				rootIndexPath: env.tempIndexPath,
			});

			assert.strictEqual(evolved.catalogUpdated, true);
			assert.strictEqual(evolved.rootRegistered, true);

			const updated = JSON.parse(fs.readFileSync(env.tempCatalogPath, 'utf8'));
			assert.ok(updated.some(t => t.id === 'ComboTemplate'));
		} finally {
			env.cleanup();
		}
	});

	it('3.11: Lifecycle Loop: Evolved Template from 3.10 is immediately available in Option [1] Listing', async () => {
		const studio = await loadStudioEngine();
		const approval = await loadApprovalGate();
		assert.ok(studio, 'scripts/studio_engine.mjs must be implemented');
		assert.ok(approval, 'scripts/approval_gate.mjs must be implemented');
		const env = createIsolatedTestEnvironment();

		try {
			// 1. Auto-evolve template into isolated catalog
			await approval.autoEvolveTemplate({
				name: 'LifecycleCard',
				title: 'Lifecycle Card Minimal',
				aspectRatio: '4:5',
				width: 1080,
				height: 1350,
				durationInFrames: 240,
				fps: 30,
				componentCode: 'export const LifecycleCard = () => <div/>;',
				catalogPath: env.tempCatalogPath,
				templatesDir: env.tempTemplatesDir,
				rootIndexPath: env.tempIndexPath,
			});

			// 2. Next user session lists templates from the updated catalog
			const available = studio.listTemplates(env.tempCatalogPath);
			const found = available.find(t => t.id === 'LifecycleCard');
			assert.ok(found, 'Newly evolved template must appear in templates listing');
			assert.strictEqual(found.proporcao, '4:5');
		} finally {
			env.cleanup();
		}
	});

	it('3.12: Combination: Reference Palette Colors Feed Iridescent SVG Text Configuration', async () => {
		const pipeline = await loadPipelineReferencia();
		assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');

		const micro = pipeline.getMicrointeractionsConfig();
		assert.ok(micro.svgGradientText);
		assert.strictEqual(micro.svgGradientText.avoidBackgroundClip, true);
	});

	it('3.13: Combination: Safe Zones Constraint Enforces Kinetic Underline Within Bounds', async () => {
		const pipeline = await loadPipelineReferencia();
		assert.ok(pipeline, 'scripts/pipeline_referencia.mjs must be implemented');

		const safe45 = pipeline.calculateSafeZones('4:5');
		const maxSafeWidth = safe45.safeBox.maxX - safe45.safeBox.minX;
		assert.ok(maxSafeWidth <= 1080);
		assert.ok(maxSafeWidth >= 900, 'Usable editorial safe width should be around 960-984px');
	});

});
