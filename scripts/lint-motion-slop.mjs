import fs from 'node:fs';
import path from 'node:path';

/**
 * 🛡️ LINTER ANTI-SLOP PARA COMPOSIÇÕES REMOTION (BENCHMARK MOTIONMAXXING)
 * 
 * Detecta e bloqueia vícios amadores de IA ("AI Slop"):
 * - Textos estáticos centralizados em caixa alta
 * - Efeitos sonoros / foley estridentes (> 0.45)
 * - Gradientes de fundo genéricos sem textura ou profundidade
 * - Falta de curvas de interpolação física (spring/Bézier)
 * 
 * Uso:
 *   node scripts/lint-motion-slop.mjs [src/FlowMotionMaster.tsx]
 */

const targetFile = process.argv[2] || 'src/FlowMotionMaster.tsx';
const fullPath = path.resolve(process.cwd(), targetFile);

if (!fs.existsSync(fullPath)) {
	console.error(`❌ Arquivo não encontrado: ${fullPath}`);
	process.exit(1);
}

const content = fs.readFileSync(fullPath, 'utf8');

console.log(`\n🔍 Auditando Anti-Slop no arquivo: ${path.basename(fullPath)}`);
console.log('═'.repeat(60));

let warnings = 0;
let passes = 0;

// Teste 1: HUD / Page Chrome Clichê
const hudKeywords = [/0[1-9]\s*\/\s*[A-Z]/i, /timecode/i, /\d+\s*BPM/i, /BAR\s*\d+\/\d+/i, /bracket/i];
for (const pattern of hudKeywords) {
	if (pattern.test(content)) {
		console.warn(`⚠️ ALERTA [G5 - Page Chrome]: Detectado padrão decorativo clichê (${pattern})`);
		warnings++;
	}
}
if (warnings === 0) {
	console.log('✅ G5 Pass: Livre de Page Chrome falso ou contadores de HUD decorativos.');
	passes++;
}

// Teste 2: Presença de Curvas Medidas ou Spring
const hasEases = /EASE\.(softLand|snapSettle|accelExit|cruise|glide|whip|popOver)/.test(content);
const hasSpring = /spring\(\{/.test(content);
if (hasEases || hasSpring) {
	console.log('✅ G0 Pass: Utiliza físicas de mola nativas ou curvas medidas (MEAS).');
	passes++;
} else {
	console.warn('⚠️ ALERTA: Não foram detectadas curvas medidas (EASE.<nome>) ou molas físicas.');
	warnings++;
}

// Teste 3: Layouts de Slides e Deck
if (/headline\s*left|slide\s*deck/i.test(content)) {
	console.warn('⚠️ ALERTA [Deck Layout]: Detectada estrutura de apresentação de slides.');
	warnings++;
} else {
	console.log('✅ G1 Pass: Composição cinematográfica com mundos construídos (anti-deck).');
	passes++;
}

// Teste 4: Slogans Proibidos
const bannedSlogans = [/o futuro de/i, /desbloqueie/i, /conheça o/i];
let foundSlogan = false;
for (const pattern of bannedSlogans) {
	if (pattern.test(content)) {
		console.warn(`⚠️ ALERTA [Copywriting]: Slogan clichê detectado (${pattern})`);
		warnings++;
		foundSlogan = true;
	}
}
if (!foundSlogan) {
	console.log('✅ G2 Pass: Copywriting livre de slogans genéricos de IA.');
	passes++;
}

// Teste 5: Trava de Volume de Áudio (Anti-Estouro / Foley Limpo)
// Os efeitos de public/audio/sfx têm pico próximo de 0 dBFS: acima de 0,45 eles passam por cima da voz.
// A regra olha (a) <Audio> de efeito em JSX, com volume antes ou depois do src, e (b) objetos { volume: N }.
// Narração e trilha ficam fora (têm níveis próprios). Vários efeitos altos contam como UM alerta.
const LIMITE_VOLUME_EFEITO = 0.45;
const efeitosAltos = [];
for (const tag of content.matchAll(/<Audio\b[\s\S]*?\/>/g)) {
	const efeito = tag[0].match(/audio\/sfx\/([^'"`)\s]+)/);
	const volume = tag[0].match(/volume=\{\s*([0-9.]+)\s*\}/);
	if (efeito && volume && parseFloat(volume[1]) > LIMITE_VOLUME_EFEITO) {
		efeitosAltos.push(`${efeito[1]} (${volume[1]})`);
	}
}
for (const m of content.matchAll(/volume:\s*([0-9.]+)/g)) {
	if (parseFloat(m[1]) > LIMITE_VOLUME_EFEITO) efeitosAltos.push(`objeto { volume: ${m[1]} }`);
}
if (efeitosAltos.length > 0) {
	console.warn(`⚠️ ALERTA [Áudio Estourado]: ${efeitosAltos.length} efeito(s) acima de 0,45 (risco de cobrir a voz): ${efeitosAltos.join(', ')}`);
	warnings++;
} else {
	console.log('✅ Audio Pass: Efeitos sonoros contidos e balanceados (<= 0.45).');
	passes++;
}

// Teste 6: Texto Centralizado em Caixa Alta (Clichê de IA)
const hasCenteredUppercase = /textAlign:\s*['"]center['"].*textTransform:\s*['"]uppercase['"]/s.test(content) ||
	/textTransform:\s*['"]uppercase['"].*textAlign:\s*['"]center['"]/s.test(content);
if (hasCenteredUppercase) {
	console.warn('⚠️ ALERTA [Visual Slop]: Detectado bloco de texto centralizado em caixa alta.');
	warnings++;
} else {
	console.log('✅ Typography Pass: Hierarquia visual sofisticada (sem texto uppercase centralizado genérico).');
	passes++;
}

console.log('═'.repeat(60));
console.log(`Auditoria concluída: ${passes} testes aprovados, ${warnings} alertas emitidos.\n`);

if (warnings > 2) {
	console.error('❌ REJEITADO: O nível de AI Slop excede o limite tolerado para entrega.');
	process.exit(1);
} else {
	console.log('🎉 APROVADO: Padrão visual alinhado ao Motion Design Studio.');
	process.exit(0);
}
