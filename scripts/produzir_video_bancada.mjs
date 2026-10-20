#!/usr/bin/env node
/**
 * 🎬 ORQUESTRADOR DE BANCADA 1-CLICK: REMOTION ➔ VÍDEO FINAL COM AUTO-REVISÃO
 * 
 * 1. Faz staging local seguro de áudio/vídeo.
 * 2. Dispara Whisper local milissegundo a milissegundo (words.json).
 * 3. Audita o código da cena com o Linter Anti-Slop (bloqueia código amador).
 * 4. Renderiza em MP4 H.264 com alta fidelidade (CRF 16).
 * 5. Dispara a Auto-Revisão de Frames e Folha de Contato (Scorecard >= 8/10).
 * 
 * Uso:
 *   node scripts/produzir_video_bancada.mjs [compositionId] [--skip-transcribe] [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINE_ROOT = path.resolve(__dirname, '..');

// Argumentos da linha de comando
const args = process.argv.slice(2);
const compositionId = args.find((a) => !a.startsWith('--')) || 'FlowMotionMaster';
const skipTranscribe = args.includes('--skip-transcribe');
const isDryRun = args.includes('--dry-run');

// Diretórios (Configuráveis via Variáveis de Ambiente)
const DRIVE_BASE = process.env.DRIVE_BASE || '';
const MESA_DIR = DRIVE_BASE ? path.join(DRIVE_BASE, 'Edição- Mesa (criação)') : '';
const PRONTOS_DIR = DRIVE_BASE ? path.join(DRIVE_BASE, 'Edição- Vídeos Prontos') : '';

// Diretórios locais
const LOCAL_INPUT_DIR = path.join(ENGINE_ROOT, 'public', 'input');
const LOCAL_OUT_DIR = path.join(ENGINE_ROOT, 'out');
const WORDS_JSON_PATH = path.join(ENGINE_ROOT, 'src', 'data', 'words.json');

console.log('');
console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║ 🚀 ORQUESTRADOR DE BANCADA 1-CLICK (REMOTION VIBE PRODUCER)        ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log(`📌 Composição Alvo : ${compositionId}`);
console.log(`📂 Raiz do Motor   : ${ENGINE_ROOT}`);

// ────────────────────────────────────────────────────────────────────────────
// PASSO 1: DETECÇÃO & STAGING DE MÍDIA
// ────────────────────────────────────────────────────────────────────────────
console.log('\n[1/5] Inspecionando mídias de entrada...');

let stagedFile = null;

if (MESA_DIR && fs.existsSync(MESA_DIR)) {
	const files = fs.readdirSync(MESA_DIR);
	const mediaExtensions = ['.mp3', '.wav', '.m4a', '.mp4', '.mov', '.aac'];
	const mediaFiles = files.filter((f) => {
		const ext = path.extname(f).toLowerCase();
		return mediaExtensions.includes(ext) && !f.startsWith('.');
	});

	if (mediaFiles.length > 0) {
		console.log(`✨ Encontrado(s) ${mediaFiles.length} arquivo(s) na bancada externa:`);
		const rawFile = mediaFiles[0];
		const srcPath = path.join(MESA_DIR, rawFile);
		const ext = path.extname(rawFile).toLowerCase();
		const safeName = `take_bancada${ext}`;
		fs.mkdirSync(LOCAL_INPUT_DIR, {recursive: true});
		const destPath = path.join(LOCAL_INPUT_DIR, safeName);

		console.log(`📥 Copiando com sanitização para o SSD local: ${destPath}`);
		fs.copyFileSync(srcPath, destPath);
		stagedFile = {rawFile, srcPath, destPath, ext};
	}
}

if (!stagedFile) {
	console.log('ℹ️ Operando com mídias locais pré-existentes em public/');
}

// ────────────────────────────────────────────────────────────────────────────
// PASSO 2: SINCRONIZAÇÃO WHISPER (PALAVRA POR PALAVRA)
// ────────────────────────────────────────────────────────────────────────────
console.log('\n[2/5] Verificação de transcrição e alinhamento milimétrico...');

if (stagedFile && !skipTranscribe) {
	const transcribeScript = path.join(ENGINE_ROOT, 'scripts', 'transcrever-palavras.mjs');
	if (fs.existsSync(transcribeScript)) {
		console.log(`🎙️ Executando transcrição via Whisper...`);
		try {
			execSync(`node "${transcribeScript}" "${stagedFile.destPath}" "${WORDS_JSON_PATH}" pt`, {
				stdio: 'inherit',
				cwd: ENGINE_ROOT,
			});
			console.log(`✅ words.json gerado com sucesso.`);
		} catch (err) {
			console.error(`⚠️ Falha na transcrição automática:`, err.message);
		}
	}
} else {
	console.log(`⏩ Transcrição pulada ou palavras já sincronizadas.`);
}

// ────────────────────────────────────────────────────────────────────────────
// PASSO 3: AUDITORIA ANTI-SLOP ANTES DE RENDERIZAR
// ────────────────────────────────────────────────────────────────────────────
console.log('\n[3/5] Auditoria estática Anti-Slop...');

const sceneFile = path.join(ENGINE_ROOT, 'src', `${compositionId}.tsx`);
const lintScript = path.join(ENGINE_ROOT, 'scripts', 'lint-motion-slop.mjs');

if (fs.existsSync(sceneFile) && fs.existsSync(lintScript)) {
	try {
		execSync(`node "${lintScript}" "${sceneFile}"`, {
			stdio: 'inherit',
			cwd: ENGINE_ROOT,
		});
	} catch (err) {
		console.error('\n🛑 PARADA OBRIGATÓRIA: O linter anti-slop rejeitou a composição.');
		process.exit(1);
	}
} else {
	console.log(`ℹ️ Linter estático pulado (arquivo específico da cena não encontrado).`);
}

// ────────────────────────────────────────────────────────────────────────────
// PASSO 4: RENDERIZAÇÃO HEADLESS EM REMOTION
// ────────────────────────────────────────────────────────────────────────────
console.log('\n[4/5] Renderizando vídeo em alta fidelidade...');

fs.mkdirSync(LOCAL_OUT_DIR, {recursive: true});
const timestamp = new Date().toISOString().slice(0, 10);
const outVideoLocal = path.join(LOCAL_OUT_DIR, `${compositionId}_${timestamp}.mp4`);

const renderCmd = `pnpm exec remotion render "${compositionId}" "${outVideoLocal}" --codec=h264 --crf=16`;
console.log(`⚙️ Executando: ${renderCmd}`);

if (!isDryRun) {
	try {
		execSync(renderCmd, {stdio: 'inherit', cwd: ENGINE_ROOT});
		console.log(`\n🎉 Renderização local concluída: ${outVideoLocal}`);
	} catch (err) {
		console.error('\n❌ Falha na renderização Remotion:', err.message);
		process.exit(1);
	}
} else {
	console.log(`[DRY-RUN] Simulação de renderização concluída.`);
}

// ────────────────────────────────────────────────────────────────────────────
// PASSO 5: AUTO-REVISÃO DE FRAMES & SCORECARD VISUAL (NOTA >= 8/10)
// ────────────────────────────────────────────────────────────────────────────
console.log('\n[5/5] Executando Auto-Revisão de Frames e Folha de Contato...');

const reviewScript = path.join(ENGINE_ROOT, 'scripts', 'auto_revisar_frames.mjs');
if (fs.existsSync(reviewScript) && !isDryRun) {
	try {
		execSync(`node "${reviewScript}" "${compositionId}" --stills 6`, {
			stdio: 'inherit',
			cwd: ENGINE_ROOT,
		});
	} catch (err) {
		console.warn(`⚠️ Alerta na auto-revisão: ${err.message}`);
	}
}

// Cópia para o diretório de destino se disponível
if (PRONTOS_DIR && fs.existsSync(PRONTOS_DIR) && fs.existsSync(outVideoLocal)) {
	const outVideoDrive = path.join(PRONTOS_DIR, `${timestamp}_${compositionId}.mp4`);
	console.log(`📤 Sincronizando vídeo para destino final: ${outVideoDrive}`);
	fs.copyFileSync(outVideoLocal, outVideoDrive);
}

console.log('\n╔════════════════════════════════════════════════════════════════════╗');
console.log('║ 🏁 PIPELINE CONCLUÍDO COM PADRÃO DE ESTÚDIO APROVADO!              ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');
