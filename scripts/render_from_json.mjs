#!/usr/bin/env node
/**
 * Runner Headless de Linha do Tempo Declarativa JSON
 * Vibe Design Studio v2.0
 * 
 * Uso:
 *   node scripts/render_from_json.mjs <caminho_timeline.json> <saida.mp4> [--master]
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Uso:
  node scripts/render_from_json.mjs <caminho_timeline.json> <saida.mp4> [--master]

Exemplo:
  node scripts/render_from_json.mjs src/timeline/exemplos/timeline_showcase_completo.json out/showcase.mp4 --master
`);
  process.exit(1);
}

const jsonPath = path.resolve(process.cwd(), args[0]);
const outputPath = path.resolve(process.cwd(), args[1]);
const shouldMaster = args.includes('--master');

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ Erro: Arquivo de timeline JSON não encontrado: ${jsonPath}`);
  process.exit(1);
}

let timelineData;
try {
  const content = fs.readFileSync(jsonPath, 'utf-8');
  timelineData = JSON.parse(content);
} catch (err) {
  console.error(`❌ Erro de sintaxe no JSON: ${err.message}`);
  process.exit(1);
}

// Garante que o diretório de saída existe
const outDir = path.dirname(outputPath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log(`🎬 [VIBE STUDIO] Iniciando renderização declarativa via JSON...`);
console.log(`   📄 Timeline: ${jsonPath}`);
console.log(`   🎞️ Composição: JsonTimelineVideo`);
console.log(`   ⏱️ Frames: ${timelineData.durationInFrames || 900} (${timelineData.fps || 30} FPS)`);
console.log(`   📐 Resolução: ${timelineData.width || 1080}x${timelineData.height || 1920}`);
console.log(`   🎯 Saída: ${outputPath}`);

const tempRenderOutput = shouldMaster ? outputPath.replace('.mp4', '_raw.mp4') : outputPath;

// Monta argumento props
const propsArg = `--props=${jsonPath}`;

const remotionBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';

try {
  execFileSync(
    remotionBin,
    [
      'remotion',
      'render',
      'JsonTimelineVideo',
      tempRenderOutput,
      '--codec=h264',
      '--crf=18',
      propsArg,
    ],
    {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true,
    }
  );

  console.log(`✅ Renderização concluída: ${tempRenderOutput}`);

  if (shouldMaster) {
    console.log(`🎚️ Masterizando áudio para EBU R128 (-14 LUFS)...`);
    const masterScript = path.resolve(projectRoot, 'scripts/masterizar_audio.mjs');
    execFileSync('node', [masterScript, tempRenderOutput, outputPath], {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    if (fs.existsSync(tempRenderOutput) && tempRenderOutput !== outputPath) {
      fs.unlinkSync(tempRenderOutput);
    }
    console.log(`💎 Vídeo final masterizado pronto em: ${outputPath}`);
  }
} catch (err) {
  console.error(`❌ Falha na renderização:`, err.message);
  process.exit(1);
}
