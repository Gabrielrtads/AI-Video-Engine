#!/usr/bin/env node
/**
 * Vibe Design Studio — Pipeline 1-Click Script-to-Video
 * Orquestrador 100% autônomo: Texto do Roteiro -> Voz Neural (TTS) -> Whisper/Timestamps -> Timeline JSON -> Remotion Render -> EBU R128 Masterizer -> Espelhamento opcional -> Higiene RAM.
 *
 * Suporta proporções automáticas:
 *   - Widescreen Horizontal 16:9 (YouTube, Aulas, Pitch Decks, Landing Pages)
 *   - Vertical 9:16 (Reels, TikTok, Shorts, Stories)
 *   - Carrossel / Feed 4:5 (Instagram Feed, LinkedIn)
 *   - Quadrado 1:1 (Posts Clássicos)
 *
 * Uso:
 *   node scripts/pipeline_script_to_video.mjs "<texto>" [opções]
 *
 * Opções:
 *   --preset hormozi|editorial|tech|keynote (default: hormozi)
 *   --variant classic-yellow|cash-green|red-alert|cyber-cyan|dark-glass
 *   --aspect 16:9|9:16|4:5|1:1        (ou --horizontal, --vertical, --feed, --quadrado)
 *   --voz antonio|francisca|thalita   (default: antonio)
 *   --rate +0%                        (default: +0%)
 *   --saida out/meu_video.mp4         (default: out/video_1click_mastered.mp4)
 *   --estilo <id>                     (opcional: pacote de estilo; veja `pnpm vibe estilos`)
 *   --cenas plano.json                (opcional: o agente escolhe o visual de cenas específicas; ver src/timeline/scenePlan.ts)
 *   --sync-dir <pasta>                (opcional: copia o vídeo final para esta pasta; ou defina VIBE_SYNC_DIR)
 */

import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { narrarTexto } from './narrar.mjs';
import { masterizeAudio } from './masterizar_audio.mjs';
import {
  generateEstimatedWordTimestamps,
  build1ClickTimelinePayload,
  resolveAspectRatioMetrics,
} from '../src/timeline/pipeline1ClickMath.ts';
import { alignScriptToTimestamps } from '../src/timeline/scriptAlignment.ts';
import { carregarEstilo } from './estilos.mjs';
import { verificarVideo } from './verificar_video.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

export async function runScriptToVideoPipeline(text, options = {}) {
  const {
    preset = 'hormozi',
    variant = 'classic-yellow',
    voice = 'antonio',
    rate = '+0%',
    aspect = '9:16',
    outputFile = 'out/video_1click_mastered.mp4',
    syncDir = process.env.VIBE_SYNC_DIR || null,
    cenasFile = null,
    estiloId = null,
  } = options;

  // Pacote de estilo (cores, legenda, HUD); recusa id inexistente antes de gastar tempo com voz e render
  const estilo = estiloId ? carregarEstilo(estiloId) : undefined;

  // Plano de cenas do agente: [{ "cena": 2, "componente": "OrbitalPlanet3D", "props": {...} }]
  const planoDeCenas = cenasFile ? JSON.parse(fs.readFileSync(path.resolve(cenasFile), 'utf8')) : undefined;

  if (!text || !text.trim()) {
    throw new Error('Texto para narração não pode ser vazio.');
  }

  const metrics = resolveAspectRatioMetrics(aspect);
  const startTime = Date.now();
  console.log(`\n========================================================`);
  console.log(`🚀 [VIBE DESIGN STUDIO] PIPELINE 1-CLICK SCRIPT-TO-VIDEO`);
  console.log(`========================================================`);
  console.log(`📝 Texto: "${text.length > 80 ? text.slice(0, 80) + '...' : text}"`);
  console.log(`🎨 Preset: ${preset} (Variant: ${variant}) | 🗣️ Voz: ${voice} (${rate})`);
  console.log(`📐 Resolução: ${metrics.width}x${metrics.height} (${metrics.standardRatio})`);

  // 1. GERAÇÃO DE VOZ (TTS)
  const audioOutput = path.resolve(PROJECT_ROOT, 'public/narracao.mp3');
  console.log(`\n[Passo 1/6] Sintetizando voz neural via Edge-TTS...`);
  narrarTexto(text.trim(), audioOutput, { voice, rate, transcrever: false });

  // 2. CAPTURA DE DURAÇÃO DO ÁUDIO
  console.log(`[Passo 2/6] Analisando métricas de áudio com ffprobe...`);
  let audioDurationSec = 6.0;
  try {
    const durStr = execFileSync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', audioOutput],
      { encoding: 'utf8' },
    ).trim();
    const parsedDur = parseFloat(durStr);
    if (!isNaN(parsedDur) && parsedDur > 0) {
      audioDurationSec = parsedDur;
    }
  } catch (err) {
    console.warn(`[Aviso ffprobe] Não foi possível extrair duração exata. Estimando...`);
    // Fallback: 130 palavras por minuto (~2.16 palavras por segundo)
    const wordCount = text.trim().split(/\s+/).length;
    audioDurationSec = Math.max(3.0, Number((wordCount / 2.2).toFixed(2)));
  }
  console.log(`⏱️ Duração do áudio: ${audioDurationSec.toFixed(2)}s (${Math.ceil(audioDurationSec * 30)} frames)`);

  // 3. TRANSCRIÇÃO DE PALAVRAS (WHISPER CPP OU ESTIMADOR FONÉTICO)
  console.log(`[Passo 3/6] Sincronizando timestamps palavra por palavra...`);
  // Arquivos gerados ficam em out/temp. Gravar nos dados versionados de src/ sobrescrevia as palavras que
  // CliCrossReviewReel, GenHqReel e AppleCameraRig importam.
  const tempDir = path.resolve(PROJECT_ROOT, 'out/temp');
  fs.mkdirSync(tempDir, { recursive: true });
  const wordsJsonPath = path.join(tempDir, 'words_1click.json');
  let words = [];

  // Tenta rodar Whisper local
  try {
    const whisperScript = path.resolve(PROJECT_ROOT, 'scripts/transcrever-palavras.mjs');
    if (fs.existsSync(whisperScript)) {
      const trResult = spawnSync('node', [whisperScript, audioOutput, wordsJsonPath, 'pt'], {
        cwd: PROJECT_ROOT,
        timeout: 45000,
        windowsHide: true,
      });

      if (trResult.status === 0 && fs.existsSync(wordsJsonPath)) {
        words = JSON.parse(fs.readFileSync(wordsJsonPath, 'utf8'));
        console.log(`✨ Whisper concluído: ${words.length} palavras com timestamps exatos.`);
        // A legenda mostra o texto do roteiro (o Whisper só empresta o tempo de cada palavra).
        const alinhadas = alignScriptToTimestamps(text, words);
        if (alinhadas.length > 0) {
          const trocadas = alinhadas.filter((a, i) => a.text.replace(/[^p{L}p{N}]/gu, '').toLowerCase() !== String(words[i]?.text ?? '').replace(/[^p{L}p{N}]/gu, '').toLowerCase()).length;
          words = alinhadas;
          console.log(`🔤 Legenda alinhada ao roteiro: ${words.length} palavras (${trocadas} diferentes do que o Whisper ouviu).`);
        }
      }
    }
  } catch (wErr) {
    console.warn(`[Whisper fallback] Utilizando estimador fonético resiliente.`);
  }

  // Se Whisper não gerou palavras válidas, aplica o estimador fonético puro
  if (!words || words.length === 0) {
    words = generateEstimatedWordTimestamps(text, audioDurationSec);
    fs.mkdirSync(path.dirname(wordsJsonPath), { recursive: true });
    fs.writeFileSync(wordsJsonPath, JSON.stringify(words, null, 2));
    console.log(`⚡ Estimador fonético gerou ${words.length} palavras com distribuição temporal.`);
  }

  // 4. MONTAGEM DECLARATIVA DA TIMELINE JSON
  console.log(`[Passo 4/6] Montando Linha do Tempo Declarativa JSON...`);
  const timelinePayload = build1ClickTimelinePayload({
    text,
    audioDurationSeconds: audioDurationSec,
    words,
    audioFile: 'public/narracao.mp3',
    preset,
    variant,
    aspectRatio: metrics.standardRatio,
    fps: 30,
    showEmojis: true,
    planoDeCenas,
    estilo,
  });

  const timelineJsonPath = path.join(tempDir, 'timeline_1click.json');
  fs.writeFileSync(timelineJsonPath, JSON.stringify({ timeline: timelinePayload }, null, 2));
  console.log(`📄 Timeline gravada: out/temp/timeline_1click.json (${timelinePayload.durationInFrames} frames)`);

  // 5. RENDERIZAÇÃO HEADLESS REMOTION
  console.log(`[Passo 5/6] Renderizando vídeo headless em Remotion (${metrics.width}x${metrics.height})...`);
  const resolvedOut = path.isAbsolute(outputFile) ? outputFile : path.resolve(PROJECT_ROOT, outputFile);
  const outDir = path.dirname(resolvedOut);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const tempVideo = path.join(outDir, `temp_${Date.now()}.mp4`);

  // Chama o CLI do Remotion direto pelo Node (sem shell): nenhum argumento passa por interpretação de shell.
  const remotionCli = path.resolve(PROJECT_ROOT, 'node_modules/@remotion/cli/remotion-cli.js');
  const remotionArgs = [
    remotionCli,
    'render',
    'src/index.tsx',
    'JsonTimelineVideo',
    tempVideo,
    `--props=${timelineJsonPath}`,
    '--codec=h264',
    '--crf=16',
  ];

  const renderProc = spawnSync(process.execPath, remotionArgs, {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    windowsHide: true,
  });

  if (renderProc.status !== 0 || !fs.existsSync(tempVideo)) {
    throw new Error(`Falha na renderização Remotion (código ${renderProc.status})`);
  }

  // 6. MASTERIZAÇÃO EBU R128 (-14 LUFS)
  console.log(`[Passo 6/6] Aplicando masterização EBU R128 (-14 LUFS)...`);
  masterizeAudio(tempVideo, resolvedOut);

  // Remove arquivo temporário não masterizado
  try {
    fs.unlinkSync(tempVideo);
  } catch {}

  // Espelhamento opcional da saída: só acontece se o usuário pedir (--sync-dir ou VIBE_SYNC_DIR).
  if (syncDir) {
    try {
      fs.mkdirSync(syncDir, { recursive: true });
      const syncDest = path.join(syncDir, path.basename(resolvedOut));
      fs.copyFileSync(resolvedOut, syncDest);
      console.log(`☁️ Espelhado em: ${syncDest}`);
    } catch (syncErr) {
      console.warn(`[Aviso espelhamento] Não foi possível copiar: ${syncErr.message}`);
    }
  }

  // Portão de qualidade: formato, 30 fps, -14 LUFS, pico, imagem parada e variedade entre as cenas
  try {
    const v = verificarVideo(resolvedOut, { formato: metrics.standardRatio, timeline: timelineJsonPath });
    console.log(`\n${v.ok ? '✅ Verificação aprovada' : '⚠️ Verificação reprovou'}:`);
    for (const c of v.checagens) console.log(`   ${c.ok ? '✓' : '✗'} ${c.id}: ${c.mensagem}`);
  } catch (vErr) {
    console.warn(`[Aviso verificação] ${vErr.message}`);
  }

  // Higiene de RAM pós-render
  try {
    const cleanScript = path.resolve(PROJECT_ROOT, 'scripts/automation/desligar_motor_video.py');
    if (fs.existsSync(cleanScript)) {
      spawnSync('python', [cleanScript, '--clean-only'], { cwd: PROJECT_ROOT, timeout: 10000, windowsHide: true });
      console.log(`🧹 Limpeza de processos zumbis executada.`);
    }
  } catch {}

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n========================================================`);
  console.log(`🎉 [SUCESSO] VÍDEO CONCLUÍDO EM ${totalTimeSec}s!`);
  console.log(`📁 Arquivo: ${resolvedOut}`);
  console.log(`📊 Duração: ${audioDurationSec.toFixed(2)}s | Frames: ${timelinePayload.durationInFrames} | Resolução: ${metrics.width}x${metrics.height}`);
  console.log(`========================================================\n`);

  return {
    success: true,
    outputFile: resolvedOut,
    durationSeconds: audioDurationSec,
    durationInFrames: timelinePayload.durationInFrames,
    wordsCount: words.length,
    elapsedSeconds: totalTimeSec,
    width: metrics.width,
    height: metrics.height,
    aspectRatio: metrics.standardRatio,
  };
}

// Execução via CLI Direta
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('pipeline_script_to_video.mjs')) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(`
Uso:
  node scripts/pipeline_script_to_video.mjs "<texto>" [opções]

Opções:
  --preset hormozi|editorial|tech|keynote (default: hormozi)
  --variant classic-yellow|cash-green|red-alert|cyber-cyan|dark-glass
  --aspect 16:9|9:16|4:5|1:1        (ou --horizontal, --vertical, --feed, --quadrado)
  --voz antonio|francisca|thalita   (default: antonio)
  --rate +0%                        (default: +0%)
  --saida out/meu_video.mp4         (default: out/video_1click_mastered.mp4)
  --sync-dir <pasta>                (opcional: copia o vídeo final para esta pasta)
`);
    process.exit(0);
  }

  let text = '';
  let preset = 'hormozi';
  let variant = 'classic-yellow';
  let voice = 'antonio';
  let rate = '+0%';
  let aspect = '9:16';
  let outputFile = 'out/video_1click_mastered.mp4';
  let syncDir = process.env.VIBE_SYNC_DIR || null;
  let cenasFile = null;
  let estiloId = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--preset' && args[i + 1]) {
      preset = args[++i];
    } else if (arg === '--variant' && args[i + 1]) {
      variant = args[++i];
    } else if (arg === '--voz' && args[i + 1]) {
      voice = args[++i];
    } else if (arg === '--rate' && args[i + 1]) {
      rate = args[++i];
    } else if ((arg === '--aspect' || arg === '--ratio' || arg === '--formato') && args[i + 1]) {
      aspect = args[++i];
    } else if (arg.startsWith('--aspect=') || arg.startsWith('--ratio=') || arg.startsWith('--formato=')) {
      aspect = arg.split('=')[1];
    } else if (arg === '--horizontal' || arg === '--landscape' || arg === '--widescreen') {
      aspect = '16:9';
    } else if (arg === '--vertical' || arg === '--reels') {
      aspect = '9:16';
    } else if (arg === '--feed' || arg === '--carrossel') {
      aspect = '4:5';
    } else if (arg === '--quadrado' || arg === '--square') {
      aspect = '1:1';
    } else if (arg === '--saida' && args[i + 1]) {
      outputFile = args[++i];
    } else if (arg === '--estilo' && args[i + 1]) {
      estiloId = args[++i];
    } else if (arg === '--cenas' && args[i + 1]) {
      cenasFile = args[++i];
    } else if (arg === '--sync-dir' && args[i + 1]) {
      syncDir = args[++i];
    } else if (arg === '--sem-gdrive') {
      syncDir = null; // legado: o espelhamento agora já vem desligado por padrão
    } else if (arg.startsWith('--text=')) {
      text = arg.slice(7);
    } else if (arg === '--text' && args[i + 1]) {
      text = args[++i];
    } else if (!text && !arg.startsWith('--')) {
      text = arg;
    }
  }

  // Se o texto for um arquivo existente, lê o arquivo
  if (text && fs.existsSync(text) && fs.statSync(text).isFile()) {
    text = fs.readFileSync(text, 'utf8');
  }

  runScriptToVideoPipeline(text, {
    preset,
    variant,
    voice,
    rate,
    aspect,
    outputFile,
    syncDir,
    cenasFile,
    estiloId,
  }).catch((err) => {
    console.error(`\n❌ [Erro Pipeline 1-Click]`, err.message);
    process.exit(1);
  });
}
