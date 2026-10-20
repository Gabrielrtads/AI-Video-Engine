#!/usr/bin/env node
/**
 * 🎓 PROMOTOR DE APRENDIZADO (PROMOTION GATE)
 * 
 * Fecha o ciclo de auto-aprendizado:
 * 1. Verifica se a referência atingiu a nota mínima (Visual >= 8.0 e Confiança >= 85%).
 * 2. Atualiza o manifesto e move de `references/inbox/` para `references/accepted/`.
 * 3. Registra as conclusões no histórico de aprendizado do repositório.
 * 
 * Uso:
 *   node scripts/references/promover_aprendizado.mjs --id ref-2026-1234 --score 8.5 --confidence 90
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINE_ROOT = path.resolve(__dirname, '..', '..');

const args = process.argv.slice(2);
const getArg = (flag, defaultValue = '') => {
	const idx = args.indexOf(flag);
	return idx !== -1 && args[idx + 1] ? args[idx + 1].trim() : defaultValue;
};

const id = getArg('--id');
const visualScore = parseFloat(getArg('--score', '0'));
const confidenceScore = parseFloat(getArg('--confidence', '0'));
const notes = getArg('--notes', 'Aprovado via revisão cruzada.');

if (!id) {
	console.error('❌ Erro: ID obrigatório. Use --id ref-YYYY-XXXX');
	process.exit(1);
}

const inboxFile = path.join(ENGINE_ROOT, 'references', 'inbox', `${id}.json`);
const acceptedFile = path.join(ENGINE_ROOT, 'references', 'accepted', `${id}.json`);
const rejectedFile = path.join(ENGINE_ROOT, 'references', 'rejected', `${id}.json`);

if (!fs.existsSync(inboxFile)) {
	console.error(`❌ Erro: Referência ${id} não encontrada em references/inbox/`);
	process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(inboxFile, 'utf8'));

console.log('');
console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║ ⚖️ AVALIAÇÃO DE GATES DE PROMOÇÃO DE APRENDIZADO                    ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log(`📌 ID Referência   : ${id}`);
console.log(`📸 Score Visual    : ${visualScore} / 10.0 (Mínimo exigido: 8.0)`);
console.log(`🎯 Confiança Swarm : ${confidenceScore}% (Mínimo exigido: 85%)`);

const passedVisual = visualScore >= 8.0;
const passedConfidence = confidenceScore >= 85.0;

manifest.crossReview.visualScore = visualScore;
manifest.crossReview.confidenceScore = confidenceScore;
manifest.crossReview.auditorVerdict = notes;
manifest.processedAt = new Date().toISOString();

if (passedVisual && passedConfidence) {
	console.log('\n🎉 PARABÉNS: Todos os gates de qualidade foram superados!');
	manifest.status = 'accepted';
	manifest.crossReview.approved = true;

	fs.writeFileSync(acceptedFile, JSON.stringify(manifest, null, 2));
	fs.unlinkSync(inboxFile);

	console.log(`📦 Referência movida para: references/accepted/${id}.json`);
	console.log(`✨ O aprendizado agora faz parte do patrimônio permanente do repositório.`);
	process.exit(0);
} else {
	console.warn('\n🛑 REJEITADO: A referência não atingiu a régua mínima de qualidade para a main.');
	manifest.status = 'rejected';
	manifest.crossReview.approved = false;

	fs.writeFileSync(rejectedFile, JSON.stringify(manifest, null, 2));
	fs.unlinkSync(inboxFile);

	console.log(`📦 Referência movida para: references/rejected/${id}.json`);
	process.exit(1);
}
