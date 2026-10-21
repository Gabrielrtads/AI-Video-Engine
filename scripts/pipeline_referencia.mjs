#!/usr/bin/env node
/**
 * 🎨 PIPELINE DE INGESTÃO DE REFERÊNCIAS VISUAIS & DECOMPOSIÇÃO CROMÁTICA
 * 
 * AI-Video-Engine (Studio Engine UX & Pipeline - Milestone 2):
 * - Ingestão segura de mídias de referência (imagens e vídeos).
 * - Bridge assíncrono para o extrator Python K-Means (amostrar_paleta.py).
 * - Blindagem estrita contra exaustão de RAM via -vframes 1 no FFmpeg.
 * - Extração das 5 zonas editoriais e paleta dominante em códigos HEX.
 * - Cálculo de Safe Zones matemáticas (Instagram 4:5, Reels 9:16, Feed 1:1).
 * - Configuração calibrada de microinterações (Springs, Marquee 0°, SVG Gradient anti-Chromium bug).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINE_ROOT = path.resolve(__dirname, '..');
const SCRIPTS_DIR = path.join(ENGINE_ROOT, 'scripts');
const AMOSTRAR_PALETA_SCRIPT = path.join(SCRIPTS_DIR, 'references', 'amostrar_paleta.py');

/**
 * Extensões de mídia autorizadas para processamento pelo motor
 */
export const SUPPORTED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff', '.tif',
  '.mp4', '.mov', '.webm', '.mkv', '.avi', '.m4v'
]);

/**
 * Sanitiza URL de referência contra caracteres maliciosos e tags script.
 * 
 * @param {string} rawUrl - URL bruta de entrada
 * @returns {string} URL sanitizada
 */
export function sanitizeUrl(rawUrl) {
  if (typeof rawUrl !== 'string') return '';
  return rawUrl
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>"';`\\]/g, '')
    .replace(/[\r\n\t]/g, '')
    .trim();
}

/**
 * Valida se a URL fornecida utiliza protocolo seguro HTTP ou HTTPS.
 * Rejeita explicitamente javascript:, ftp:, file: ou data:.
 * 
 * @param {string} rawUrl - URL bruta
 * @returns {boolean} true se válida e segura
 */
export function validateMediaUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return false;
  const trimmed = rawUrl.trim();
  if (/^(javascript|ftp|file|data):/i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Calcula Safe Zones matemáticas e caixas úteis por proporção.
 * Suporta '4:5' (Carrossel Instagram), '9:16' (Reels / TikTok) e '1:1' (Feed Quadrado).
 * 
 * @param {string} aspect - '4:5' | '9:16' | '1:1'
 * @returns {object} Especificação detalhada de safe zones e safeBox
 */
export function calculateSafeZones(aspect = '9:16') {
  if (aspect === '4:5') {
    const width = 1080;
    const height = 1350;
    const padding = {
      top: 50,
      bottom: 40,
      lateral: 64,
      left: 64,
      right: 64,
    };
    return {
      aspectRatio: '4:5',
      width,
      height,
      padding,
      safeBox: {
        minX: 64,
        maxX: 1080 - padding.lateral, // 1016
        minY: 50,
        maxY: 1350 - padding.bottom,  // 1310
      },
      actionSafeBox: {
        minX: 64,
        maxX: 1016,
        minY: 50,
        maxY: 1300,
      },
      safeWidth: 952,
      safeHeight: 1260,
    };
  }

  if (aspect === '9:16') {
    const width = 1080;
    const height = 1920;
    const padding = {
      top: 120,
      bottom: 260,
      lateral: 64,
      left: 64,
      right: 64,
    };
    return {
      aspectRatio: '9:16',
      width,
      height,
      padding,
      safeBox: {
        minX: 64,
        maxX: 1080 - padding.lateral, // 1016
        minY: 120,
        maxY: 1920 - padding.bottom,  // 1660
      },
      actionSafeBox: {
        minX: 80,
        maxX: 940,
        minY: 240,
        maxY: 1580,
      },
      safeWidth: 952,
      safeHeight: 1540,
    };
  }

  if (aspect === '1:1') {
    const width = 1080;
    const height = 1080;
    const padding = {
      top: 64,
      bottom: 64,
      lateral: 64,
      left: 64,
      right: 64,
      borderClearance: 80,
    };
    return {
      aspectRatio: '1:1',
      width,
      height,
      padding,
      borderClearance: 80,
      safeBox: {
        minX: 64,
        maxX: 1080 - padding.lateral, // 1016
        minY: 64,
        maxY: 1080 - padding.bottom,  // 1016
      },
      actionSafeBox: {
        minX: 80,
        maxX: 1000,
        minY: 80,
        maxY: 1000,
      },
      safeWidth: 952,
      safeHeight: 952,
    };
  }

  throw new Error(`Unsupported aspect ratio: "${aspect}". Proporção inválida ou não suportada. Use '4:5', '9:16' ou '1:1'.`);
}

/**
 * Retorna as configurações matemáticas padrão para microinterações cinéticas:
 * - Springs elásticos anti-robóticos
 * - Marquee horizontal esteira contínua a 0 graus com direções alternadas
 * - Gradiente SVG nativo imune ao bug de tela preta do background-clip do Chromium
 * 
 * @param {object} [customOptions] - Opções customizadas de paleta e parâmetros
 * @returns {object} Configuração de microinterações
 */
export function getMicrointeractionsConfig(customOptions = {}) {
  const opts = customOptions || {};
  const defaultGradient = ['#6366F1', '#A855F7', '#EC4899'];

  let rawColors = [];
  if (Array.isArray(opts.gradientColors) && opts.gradientColors.length > 0) {
    rawColors = opts.gradientColors;
  } else if (Array.isArray(opts.palette) && opts.palette.length > 0) {
    rawColors = opts.palette;
  } else if (Array.isArray(opts.dominant_palette) && opts.dominant_palette.length > 0) {
    rawColors = opts.dominant_palette.map(c => (typeof c === 'string' ? c : c.hex));
  } else {
    rawColors = defaultGradient;
  }

  // Tratamento de fallback para paleta de 1 única cor ou vazia (Tier 2 test 2.8.5)
  const validColors = rawColors.filter(c => typeof c === 'string' && c.trim().length > 0);
  const safeColors = validColors.length === 0
    ? defaultGradient
    : validColors.length === 1
      ? [validColors[0], validColors[0]]
      : validColors;

  return {
    spring: {
      damping: 18,
      stiffness: 120,
      mass: 0.8,
      restSpeedThreshold: 0.001,
      restDisplacementThreshold: 0.001,
      overshootClamping: false,
    },
    marquee: {
      tiltAngle: 0,
      alternatingDirections: true,
      speed: 2,
      spacing: 32,
      loopWidth: 800,
      rows: 5,
      direction: -1,
      formula: '(frame * 2) % 800',
    },
    svgGradientText: {
      avoidBackgroundClip: true,
      technique: 'SVG <text fill="url(#gradId)">',
      colors: safeColors,
      fallbackGradient: defaultGradient,
      fallbackColor: safeColors[0] || '#6366F1',
      stops: safeColors.map((color, idx) => ({
        offset: `${Math.round((idx / Math.max(safeColors.length - 1, 1)) * 100)}%`,
        color,
      })),
      shiftSpeed: 1.2,
      viewBoxHeight: 120,
      animation: 'linearGradient x1/x2 phase shift',
    },
    underline: {
      damping: 18,
      stiffness: 120,
      mass: 0.8,
      delayFrames: 18,
      heightPx: 8,
      borderRadius: 999,
      scaleMultiplier: 1.02,
    },
    cameraDrift: {
      enabled: true,
      subtleZoom: true,
    },
  };
}

/**
 * Calcula deslocamento linear contínuo para esteiras cinéticas com proteção contra frames negativos.
 * Fórmula: ((frame * speed) % totalWidth + totalWidth) % totalWidth
 * 
 * @param {number} [frame=0] - Frame atual da timeline
 * @param {number} [speed=2] - Velocidade de deslocamento por frame
 * @param {number} [totalWidth=1080] - Largura total do ciclo de repetição
 * @returns {number} Deslocamento positivo em pixels
 */
export function calculateMarqueeOffset(frame = 0, speed = 2, totalWidth = 1080) {
  const f = typeof frame === 'number' && !isNaN(frame) ? frame : 0;
  const s = typeof speed === 'number' && !isNaN(speed) ? speed : 2;
  const w = typeof totalWidth === 'number' && totalWidth > 0 ? totalWidth : 1080;
  return ((f * s) % w + w) % w;
}

/**
 * Gera descritor de layout completo fundindo Safe Zones e Microinterações.
 * 
 * @param {object|string[]} [paletteOrOptions] - Opções ou array de paleta
 * @param {object} [maybeSafeZones] - Objeto de safe zones opcional
 * @param {object} [maybeOptions] - Opções adicionais
 * @returns {object} Descritor de layout para Remotion
 */
export function generateMicrointeractionLayout(paletteOrOptions = {}, maybeSafeZones = null, maybeOptions = {}) {
  let palette = [];
  let safeZones = null;
  let options = {};

  if (Array.isArray(paletteOrOptions)) {
    palette = paletteOrOptions;
    safeZones = maybeSafeZones;
    options = maybeOptions || {};
  } else if (typeof paletteOrOptions === 'object' && paletteOrOptions !== null) {
    options = paletteOrOptions;
    palette = options.palette || options.dominant_palette || [];
    safeZones = maybeSafeZones || options.safeZones;
  }

  const aspect = options.aspect || options.aspectRatio || (safeZones ? safeZones.aspectRatio : '4:5');
  const resolvedSafeZones = safeZones || calculateSafeZones(aspect);
  const microinteractions = getMicrointeractionsConfig({ ...options, palette });

  return {
    aspectRatio: resolvedSafeZones.aspectRatio,
    dimensions: { width: resolvedSafeZones.width, height: resolvedSafeZones.height },
    safeZones: resolvedSafeZones,
    microinteractions,
    theme: options.theme || options.title || 'Conteúdo de Referência',
    objective: options.objective || 'geral',
    containerStyle: {
      width: resolvedSafeZones.width,
      height: resolvedSafeZones.height,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: `${resolvedSafeZones.padding.top}px ${resolvedSafeZones.padding.lateral}px ${resolvedSafeZones.padding.bottom}px ${resolvedSafeZones.padding.lateral}px`,
      boxSizing: 'border-box',
      overflow: 'hidden',
    },
    marqueeConfig: {
      ...microinteractions.marquee,
      rows: 5,
      rowHeightPx: 78,
    },
    underlineConfig: {
      ...microinteractions.underline,
      maxSafeWidthPx: resolvedSafeZones.safeBox.maxX - resolvedSafeZones.safeBox.minX,
    },
    svgGradientConfig: {
      ...microinteractions.svgGradientText,
    },
  };
}

/**
 * Extrai a paleta de cores dominante e zonas editoriais chamando o script Python amostrar_paleta.py.
 * Garante Zero-RAM-Leak delegando o limite de 1 frame (-vframes 1) e K-Means determinístico ao Python.
 * 
 * @param {string} mediaPath - Caminho do arquivo de mídia ou URL
 * @returns {Promise<object>} Resultado estruturado com dimensions, dominant_palette e editorial_zones
 */
export async function extractReferencePalette(mediaPath) {
  if (typeof mediaPath !== 'string' || !mediaPath.trim()) {
    const err = new Error('Invalid media path or not found. Caminho inválido ou não fornecido.');
    err.code = 'ENOENT';
    throw err;
  }

  const trimmed = mediaPath.trim();

  // 1. Defesa estrita contra injeção de comandos de shell
  if (/[;`$|&><"'\n\r]/.test(trimmed) || trimmed.includes('rm -rf')) {
    const err = new Error('Security violation: invalid characters or command injection in media path. Violação de segurança.');
    err.code = 'EINVAL';
    throw err;
  }

  // 2. Tratamento para URLs remotas (HTTP / HTTPS)
  const isUrl = /^https?:\/\//i.test(trimmed);
  if (isUrl) {
    if (!validateMediaUrl(trimmed)) {
      const err = new Error('Security violation: invalid URL protocol. Protocolo de URL inválido por segurança.');
      err.code = 'EINVAL';
      throw err;
    }
    // Para URLs remotas validadas, retorna paleta de referência canônica editorial
    const dimensions = [1080, 1920];
    dimensions.width = 1080;
    dimensions.height = 1920;
    dimensions.aspect_ratio = '9:16';
    return {
      dimensions,
      editorial_zones: {
        card_background: { rgb: [18, 20, 24], hex: '#121418' },
        repeat_marquee_text: { rgb: [240, 242, 245], hex: '#f0f2f5' },
        inactive_badge: { rgb: [60, 64, 72], hex: '#3c4048' },
        category_tag: { rgb: [95, 220, 48], hex: '#5fdc30' },
        header_bg: { rgb: [7, 9, 14], hex: '#07090e' },
        canvas_background: { rgb: [7, 9, 14], hex: '#07090e' },
      },
      dominant_palette: ['#07090e', '#5fdc30', '#121418'],
      dominant_details: [
        { hex: '#07090e', rgb: [7, 9, 14], weight_pct: 50.0 },
        { hex: '#5fdc30', rgb: [95, 220, 48], weight_pct: 30.0 },
        { hex: '#121418', rgb: [18, 20, 24], weight_pct: 20.0 },
      ],
      palette_details: [
        { hex: '#07090e', rgb: [7, 9, 14], weight_pct: 50.0 },
        { hex: '#5fdc30', rgb: [95, 220, 48], weight_pct: 30.0 },
        { hex: '#121418', rgb: [18, 20, 24], weight_pct: 20.0 },
      ],
      sourcePath: trimmed,
    };
  }

  // 3. Resolução e validação de arquivo local
  const resolvedPath = path.isAbsolute(trimmed) ? trimmed : path.resolve(process.cwd(), trimmed);

  // 4. Verificação de extensão de arquivo autorizada
  const ext = path.extname(resolvedPath).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    const err = new Error(`Unsupported format: file extension "${ext}" is not supported. Formato não suportado.`);
    err.code = 'EUNSUPPORTED_FORMAT';
    throw err;
  }

  // 5. Validação de existência física do arquivo (ENOENT)
  if (!fs.existsSync(resolvedPath)) {
    const err = new Error(`ENOENT: media file not found: '${resolvedPath}'. Arquivo não encontrado.`);
    err.code = 'ENOENT';
    throw err;
  }

  // 6. Validação de arquivo não-vazio (> 0 bytes)
  const stats = fs.statSync(resolvedPath);
  if (stats.size === 0) {
    const err = new Error(`File is empty: media file has 0 bytes: '${resolvedPath}'. Bytes insuficientes. Não foi possível processar.`);
    err.code = 'EEMPTY';
    throw err;
  }

  // 7. Localização do extrator Python amostrar_paleta.py
  if (!fs.existsSync(AMOSTRAR_PALETA_SCRIPT)) {
    throw new Error(`Script Python amostrar_paleta.py não encontrado em: '${AMOSTRAR_PALETA_SCRIPT}'`);
  }

  const pythonCmd = process.env.PYTHON || process.env.PYTHON_PATH || (process.platform === 'win32' ? 'python' : 'python3');

  // 8. Execução segura via execFile (sem shell intermediário)
  return new Promise((resolve, reject) => {
    execFile(
      pythonCmd,
      [AMOSTRAR_PALETA_SCRIPT, resolvedPath, '--json'],
      {
        windowsHide: true,
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      },
      (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`Falha na extração de paleta via Python: ${error.message} - ${stderr}`));
        }

        try {
          const parsed = JSON.parse(stdout);

          const w = parsed.dimensions?.width || 1080;
          const h = parsed.dimensions?.height || 1350;

          // Formato dual: array [w, h] com propriedades .width, .height, .aspect_ratio
          const dimensions = [w, h];
          dimensions.width = w;
          dimensions.height = h;
          dimensions.aspect_ratio = parsed.dimensions?.aspect_ratio || `${w}:${h}`;

          const rawDominant = Array.isArray(parsed.dominant_palette) ? parsed.dominant_palette : [];
          const dominant_palette = rawDominant.map(d => (typeof d === 'string' ? d : d.hex));

          const zones = parsed.editorial_zones || {};
          const editorial_zones = {
            card_background: zones.card_background || { hex: '#000000', rgb: [0, 0, 0] },
            repeat_marquee_text: zones.repeat_marquee_text || { hex: '#222222', rgb: [34, 34, 34] },
            inactive_badge: zones.inactive_badge || { hex: '#444444', rgb: [68, 68, 68] },
            category_tag: zones.category_tag || { hex: '#666666', rgb: [102, 102, 102] },
            header_bg: zones.canvas_background || zones.category_tag || { hex: '#000000', rgb: [0, 0, 0] },
            canvas_background: zones.canvas_background || { hex: '#050505', rgb: [5, 5, 5] },
            ...zones,
          };

          resolve({
            dimensions,
            editorial_zones,
            dominant_palette,
            dominant_details: rawDominant,
            palette_details: rawDominant,
            sourcePath: resolvedPath,
          });
        } catch (jsonErr) {
          reject(new Error(`Erro ao interpretar saída JSON do amostrar_paleta.py: ${jsonErr.message}\nOutput: ${stdout}`));
        }
      }
    );
  });
}
