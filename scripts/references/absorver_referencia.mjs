#!/usr/bin/env node
/**
 * 📥 ABSORVEDOR DE REFERÊNCIAS VISUAIS (SELF-EVOLVING PIPELINE)
 * 
 * Ingesta uma referência visual da comunidade ou mantenedor:
 * 1. Sanitiza os dados contra prompt injection e caracteres de controle.
 * 2. Cria o manifesto estruturado em `references/inbox/`.
 * 3. Faz o scaffolding do componente Remotion de teste em `src/referencias/`.
 * 4. Prepara o pacote para a `/cli-revisao-cruzada`.
 * 
 * Uso:
 *   node scripts/references/absorver_referencia.mjs --url "https://..." --platform instagram --title "Card 3D Flutuante" [--author "@fulano"]
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

const url = getArg('--url');
const platform = getArg('--platform', 'instagram');
const title = getArg('--title', 'Nova Referencia');
const author = getArg('--author', 'Comunidade');
const timestamps = getArg('--timestamps', '00:00 - 00:05');

if (!url) {
	console.error('❌ Erro: URL obrigatória. Use --url "https://..."');
	console.error('Uso: node scripts/references/absorver_referencia.mjs --url <url> --title <titulo> [--platform <plataforma>] [--author <autor>]');
	process.exit(1);
}

// 1. Sanitização estrita contra prompt injection e caminhos inválidos
const sanitizeText = (str) => str.replace(/[<>'"`;\r\n\\]/g, '').slice(0, 150);
const cleanTitle = sanitizeText(title) || 'Referencia Sem Titulo';
const cleanAuthor = sanitizeText(author) || 'Anonimo';
const cleanPlatform = ['instagram', 'tiktok', 'youtube_shorts', 'twitter_x', 'dribbble', 'apple_showcase'].includes(platform)
	? platform
	: 'other';

const slug = cleanTitle
	.toLowerCase()
	.normalize('NFD')
	.replace(/[\u0300-\u036f]/g, '')
	.replace(/[^a-z0-9]+/g, '-')
	.replace(/(^-|-$)/g, '');

const year = new Date().getFullYear();
const id = `ref-${year}-${Date.now().toString().slice(-4)}`;

console.log('');
console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║ 🧠 ABSORÇÃO DE REFERÊNCIA VISUAL (LEARNING LOOP INTAKE)             ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log(`📌 ID          : ${id}`);
console.log(`🎬 Título      : ${cleanTitle}`);
console.log(`🔗 URL         : ${url}`);
console.log(`👤 Autor       : ${cleanAuthor} (${cleanPlatform})`);

// 2. Criação do manifesto estruturado
const manifest = {
	id,
	source: {
		platform: cleanPlatform,
		url,
		author: cleanAuthor,
		submittedBy: 'community',
		issueNumber: null,
	},
	aspects: {
		motionPhysics: 'spring_calibrated',
		cameraDrift: true,
		perspective3D: true,
		typographyTracking: '-0.03em',
		foleyProfile: 'whisper_quiet',
	},
	deconstruction: {
		observations: [
			`Referência ingerida via learning loop: ${cleanTitle}`,
			`Timestamps em foco: ${timestamps}`,
		],
		proposedComponent: `Ref_${slug.replace(/-/g, '_')}`,
		proposedEasing: 'EASE.softLand',
		proposedRule: null,
	},
	crossReview: {
		cli: null,
		builderVerdict: null,
		redTeamCritique: null,
		auditorVerdict: null,
		confidenceScore: null,
		visualScore: null,
		approved: false,
	},
	status: 'inbox',
	submittedAt: new Date().toISOString(),
	processedAt: null,
};

const inboxFile = path.join(ENGINE_ROOT, 'references', 'inbox', `${id}.json`);
fs.writeFileSync(inboxFile, JSON.stringify(manifest, null, 2));
console.log(`\n💾 Manifesto gravado em: references/inbox/${id}.json`);

// 3. Scaffolding do protótipo de teste em src/referencias/
const refDir = path.join(ENGINE_ROOT, 'src', 'referencias');
fs.mkdirSync(refDir, {recursive: true});

const compName = `Ref_${slug.replace(/[-_]/g, '')}`;
const compFile = path.join(refDir, `${compName}.tsx`);

const compCode = `import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, FPS, H, MONO, SANS, W} from '../kit';

/**
 * 🎬 Protótipo Gerado para a Referência: ${cleanTitle} (${id})
 * Submetido por: ${cleanAuthor} via ${cleanPlatform}
 */
export const ${compName}: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Física de mola calibrada (Anti-Slop: zero linear easing)
	const enterProgress = spring({
		frame,
		fps,
		config: {damping: 18, stiffness: 120, mass: 0.8},
	});

	const cardScale = enterProgress;
	const cardTilt = (1 - enterProgress) * 15; // 3D tilt orgânico

	return (
		<AbsoluteFill style={{background: '#07090E', justifyContent: 'center', alignItems: 'center'}}>
			<div
				style={{
					width: 860,
					padding: '48px 40px',
					borderRadius: 32,
					background: 'rgba(255, 255, 255, 0.04)',
					border: '1px solid rgba(255, 255, 255, 0.1)',
					backdropFilter: 'blur(24px)',
					transform: \`perspective(1000px) rotateX(\${cardTilt}deg) scale(\${cardScale})\`,
					boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
					display: 'flex',
					flexDirection: 'column',
					gap: 16,
				}}
			>
				<span style={{fontFamily: MONO, fontSize: 20, color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '0.05em'}}>
					${id} • ${cleanPlatform.toUpperCase()}
				</span>
				<h1 style={{fontFamily: SANS, fontSize: 52, color: C.ink, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.15}}>
					${cleanTitle}
				</h1>
			</div>
		</AbsoluteFill>
	);
};
`;

fs.writeFileSync(compFile, compCode);
console.log(`🎨 Componente de teste criado: src/referencias/${compName}.tsx`);

console.log('\n═'.repeat(60));
console.log('✅ PRÓXIMO PASSO:');
console.log(`Rode a revisão cruzada para auditar a referência com a tríade de modelos:`);
console.log(`/cli-revisao-cruzada agy --auto "Auditar referencia visual ${id} em src/referencias/${compName}.tsx"`);
console.log('═'.repeat(60) + '\n');
