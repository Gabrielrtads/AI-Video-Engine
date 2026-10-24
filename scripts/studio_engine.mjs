#!/usr/bin/env node
/**
 * 🎬 STUDIO ENGINE (UX ONBOARDING & ORQUESTRADOR DE CRIAÇÃO)
 * 
 * Camada de Experiência do Usuário (UX) e Orquestração do AI-Video-Engine:
 * - Onboarding Canônico em 1 pergunta e 4 rotas ([1] Template, [2] Do Zero, [3] Habilidades, [4] Referência).
 * - Briefing Expresso em 1 linha objetiva imediata.
 * - Formatação dinâmica do catálogo de habilidades em 3 categorias canônicas.
 * - Listagem expressa de templates validados em 1 clique e inicialização de tela limpa (Safe Zones).
 * - Imunidade a piping não-interativo, buffering em fila assíncrona contra ERR_USE_AFTER_CLOSE e EOF precoce.
 * - Suporte dual: CLI interativo via terminal e API programática via Injeção de Dependências.
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINE_ROOT = path.resolve(__dirname, '..');

export const PATHS = {
  ENGINE_ROOT,
  HABILIDADES_JSON: path.join(ENGINE_ROOT, 'src', 'habilidades', 'catalogo_habilidades.json'),
  TEMPLATES_JSON: path.join(ENGINE_ROOT, 'src', 'templates', 'catalogo_templates.json')
};

// ────────────────────────────────────────────────────────────────────────────
// PROMPTS CANÔNICOS & TEXTOS VERBATIM (R1.1 & R1.2)
// ────────────────────────────────────────────────────────────────────────────

export const CANONICAL_ONBOARDING_PROMPT = `🎬 O que vamos criar hoje?
- [1] Usar um Template (Lista os templates já validados em 1 clique)
- [2] Criar do Zero (Tela limpa sem reciclagem de layouts anteriores)
- [3] Ver Habilidades (Lista dinâmica do que o motor sabe fazer via catalogo_habilidades.json)
- [4] Criar com referência "X" (Ingestão de link do Instagram, TikTok, X, Animos, site ou print anexado)
Digite o número da sua escolha [1-4]: `;

export const CANONICAL_BRIEFING_PROMPT = `🎯 Qual é o objetivo (venda, atração, retenção) e o tema/assunto do conteúdo de hoje?
> `;

export const PROMPTS = {
  ONBOARDING_HEADER: '🎬 O que vamos criar hoje?',
  OPTION_1: '- [1] Usar um Template (Lista os templates já validados em 1 clique)',
  OPTION_2: '- [2] Criar do Zero (Tela limpa sem reciclagem de layouts anteriores)',
  OPTION_3: '- [3] Ver Habilidades (Lista dinâmica do que o motor sabe fazer via catalogo_habilidades.json)',
  OPTION_4: '- [4] Criar com referência "X" (Ingestão de link do Instagram, TikTok, X, Animos, site ou print anexado)',
  BRIEFING_EXPRESSO: '🎯 Qual é o objetivo (venda, atração, retenção) e o tema/assunto do conteúdo de hoje?'
};

// ────────────────────────────────────────────────────────────────────────────
// CATÁLOGOS EM MEMÓRIA (FALLBACK DEFENSIVO)
// ────────────────────────────────────────────────────────────────────────────

export const FALLBACK_HABILIDADES = [
  {
    id: "amostragem_paleta_kmeans",
    nome: "Amostragem Cromática Científica (K-Means)",
    descricao: "Extrai paleta exata e zonas editoriais diretamente de frames ou imagens usando FFmpeg e NumPy nativo sem achismo.",
    script: "scripts/references/amostrar_paleta.py",
    saida: "JSON com códigos HEX dominantes e zonas de card/texto"
  },
  {
    id: "svg_iridescent_gradient",
    nome: "Texto com Gradiente Iridescente em SVG Nativo",
    descricao: "Aplica gradiente multicolorido animado diretamente nas curvas vetoriais dos glifos em SVG nativo de alto impacto.",
    tecnica: "SVG <text fill='url(#gradId)'> com IDs dinâmicos via useId()"
  },
  {
    id: "kinetic_word_caption",
    nome: "Legendas Cinéticas Palavra por Palavra",
    descricao: "Sincronização milissegundo de áudio via Whisper (words.json) com destaque de cor e escala na palavra falada.",
    arquivo: "src/KineticWordCaption.tsx"
  },
  {
    id: "typewriter_subtitles",
    nome: "Efeito Digitação (Typewriter) na Transição",
    descricao: "Animação de letras reveladas progressivamente durante a transição da fala com cursor piscante opcional."
  },
  {
    id: "spring_physics_curves",
    nome: "Física de Molas e Inércia Elástica",
    descricao: "Curvas matemáticas Remotion spring() com massa, amortecimento e rigidez calibrados para sensação tátil e orgânica.",
    arquivo: "src/kit.tsx"
  },
  {
    id: "apple_camera_rig",
    nome: "Câmera Cinemática 3D com Drift Orgânico",
    descricao: "Movimento de câmera contínuo com interpolação suave em perspectiva CSS, evitando quadros estáticos e mortos.",
    arquivo: "src/AppleCameraRig.tsx"
  },
  {
    id: "sound_impact_engine",
    nome: "Sound Design e Foley de Baixa Intrusão",
    descricao: "Efeitos sonoros sincronizados com batidas e transições, mantidos abaixo de 0.45 para não sobrepor a voz humana.",
    arquivo: "src/sound_impact_engine.tsx"
  }
];

export const FALLBACK_TEMPLATES = [
  {
    id: "CarrosselEditorial",
    nome: "Capa Cinética Editorial (Instagram 4:5)",
    proporcao: "4:5",
    dimensoes: { largura: 1080, altura: 1350 },
    duracaoFrames: 240,
    fps: 30,
    estilo: "Editorial / High Retention / Motion Acid",
    caracteristicas: [
      "Tipografia Bebas Neue ultra-condensada",
      "Texto de destaque com gradiente iridescente em SVG nativo",
      "Palco com esteira contínua em loop horizontal a 0 graus",
      "Sublinhado com física elástica spring()",
      "Pílula de progresso e badge numérica 01 / 02 03 04"
    ],
    arquivo: "src/CarrosselEditorial.tsx"
  },
  {
    id: "FlowMotionMaster",
    nome: "Apple Kinetic Motion Master (Reels 9:16)",
    proporcao: "9:16",
    dimensoes: { largura: 1080, altura: 1920 },
    duracaoFrames: 825,
    fps: 30,
    estilo: "Showcase Tech / Apple / Fintech",
    caracteristicas: [
      "Cartões translúcidos 3D em perspectiva CSS flutuante",
      "Câmera orgânica com inércia e drift contínuo",
      "Legendas cinéticas palavra por palavra sincronizadas com Whisper",
      "Palco PBR com sombras suaves e profundidade"
    ],
    arquivo: "src/FlowMotionMaster.tsx"
  }
];

// ────────────────────────────────────────────────────────────────────────────
// I/O STREAMING & FILA ASSÍNCRONA DE LINHAS (BLINDAGEM CONTRA PIPE HANGS)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Cria um leitor assíncrono baseado em fila para streams de entrada.
 * Bufferiza rajadas de linhas (piped shell) e resolve com null em caso de EOF/close.
 */
export function createQueuedLineReader(inputStream) {
  const lineBuffer = [];
  const waiterQueue = [];
  let isClosed = false;

  const rl = readline.createInterface({
    input: inputStream,
    crlfDelay: Infinity,
    terminal: false,
  });

  rl.on('line', (line) => {
    if (waiterQueue.length > 0) {
      const resolve = waiterQueue.shift();
      resolve(line);
    } else {
      lineBuffer.push(line);
    }
  });

  const handleClose = () => {
    if (!isClosed) {
      isClosed = true;
      while (waiterQueue.length > 0) {
        const resolve = waiterQueue.shift();
        resolve(null);
      }
    }
  };

  rl.on('close', handleClose);
  rl.on('end', handleClose);

  return {
    async nextLine() {
      if (lineBuffer.length > 0) {
        return lineBuffer.shift();
      }
      if (isClosed) {
        return null;
      }
      return new Promise((resolve) => waiterQueue.push(resolve));
    },
    close() {
      handleClose();
      try {
        rl.close();
      } catch (e) {
        // ignora erro ao fechar stream já finalizado
      }
    }
  };
}

/**
 * Normaliza qualquer interface de leitura para o contrato `{ nextLine(): Promise<string|null>, close(): void }`.
 */
export function adaptReader(reader) {
  if (!reader) {
    return createQueuedLineReader(process.stdin);
  }
  if (typeof reader.nextLine === 'function') {
    return reader;
  }
  if (Array.isArray(reader)) {
    const queue = [...reader];
    return {
      async nextLine() {
        return queue.length > 0 ? queue.shift() : null;
      },
      close: () => {},
    };
  }
  if (typeof reader === 'function') {
    return {
      async nextLine() {
        const res = await reader();
        return res !== undefined ? res : null;
      },
      close: () => {},
    };
  }
  if (typeof reader.question === 'function') {
    return {
      async nextLine() {
        return new Promise((resolve) => {
          reader.question('', (ans) => resolve(ans !== undefined ? ans : null));
        });
      },
      close: () => {
        if (typeof reader.close === 'function') reader.close();
      },
    };
  }
  throw new TypeError('Formato de inputReader não suportado.');
}

/**
 * Normaliza qualquer interface de escrita para uma função `(text: string) => void`.
 */
export function adaptWriter(writer) {
  if (!writer) {
    return (text) => process.stdout.write(typeof text === 'string' ? text : String(text));
  }
  if (typeof writer === 'function') {
    return writer;
  }
  if (typeof writer.write === 'function') {
    return (text) => writer.write(typeof text === 'string' ? text : String(text));
  }
  throw new TypeError('Formato de outputWriter não suportado.');
}

// ────────────────────────────────────────────────────────────────────────────
// SANITIZAÇÃO E PARSING DE ENTRADA
// ────────────────────────────────────────────────────────────────────────────

/**
 * Valida e converte opção numérica [1-4]. Suporta "1", "[1]", " 1 ", "1.", "[2].".
 */
export function parseOptionChoice(input) {
  if (typeof input !== 'string') return null;
  const cleaned = input.trim();
  const match = cleaned.match(/^\[?([1-4])\]?\.?$/);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

/**
 * Sanitiza texto de briefing:
 * - Remove sequências de escape ANSI
 * - Remove bytes nulos (\0) e caracteres invisíveis de largura zero
 * - Achata quebras de linha (\r\n, \n) e tabulações para espaço único
 * - Comprime múltiplos espaços consecutivos e apara bordas
 */
export function sanitizeBriefing(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
    .replace(/[\0\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ────────────────────────────────────────────────────────────────────────────
// CATÁLOGO DE HABILIDADES (3 CATEGORIAS CANÔNICAS)
// ────────────────────────────────────────────────────────────────────────────

const CANONICAL_SKILL_MAP = {
  amostragem_paleta_kmeans: 1,
  svg_iridescent_gradient: 1,
  kinetic_word_caption: 2,
  typewriter_subtitles: 2,
  spring_physics_curves: 3,
  apple_camera_rig: 3,
  sound_impact_engine: 3,
  vox_documentary_motion: 3,
};

/**
 * Classifica uma habilidade em uma das 3 categorias canônicas:
 * 1: Cromia, Gradientes & Decomposição Visual
 * 2: Tipografia Cinética & Sincronização de Áudio
 * 3: Cinemática 3D, Câmera & Sound Design
 */
export function classifySkill(skill) {
  if (!skill || !skill.id) return 3;
  if (CANONICAL_SKILL_MAP[skill.id]) {
    return CANONICAL_SKILL_MAP[skill.id];
  }
  const text = `${skill.id} ${skill.nome || ''} ${skill.descricao || ''}`.toLowerCase();
  if (/paleta|cor|gradiente|svg|kmeans|crom|decompos/i.test(text)) return 1;
  if (/legenda|palavra|texto|tipografia|áudio|audio|whisper|digita/i.test(text)) return 2;
  return 3;
}

/**
 * Lê e formata catalogo_habilidades.json nas 3 categorias canônicas.
 * Se skillsJsonPath for fornecido explicitamente, lança erro se não existir ou se JSON for inválido.
 */
export function formatSkillsCatalog(skillsJsonPath = null) {
  let skills = null;
  let isFallback = false;
  let sourcePath = null;

  if (skillsJsonPath) {
    const resolved = path.resolve(skillsJsonPath);
    if (!fs.existsSync(resolved)) {
      const err = new Error(`ENOENT: no such file or directory, open '${resolved}'`);
      err.code = 'ENOENT';
      throw err;
    }
    const raw = fs.readFileSync(resolved, 'utf8');
    skills = JSON.parse(raw);
    if (!Array.isArray(skills)) {
      throw new TypeError(`O catálogo de habilidades deve ser uma lista (array JSON), mas ${resolved} contém ${skills === null ? 'null' : typeof skills}.`);
    }
    sourcePath = resolved;
  } else {
    // Busca caminhos padrão com tolerância a execução local ou monorepo
    const candidates = [
      PATHS.HABILIDADES_JSON,
      path.resolve(process.cwd(), 'src', 'habilidades', 'catalogo_habilidades.json'),
      path.resolve(process.cwd(), 'projects', 'AI-Video-Engine', 'src', 'habilidades', 'catalogo_habilidades.json')
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        try {
          const raw = fs.readFileSync(cand, 'utf8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            skills = parsed;
            sourcePath = cand;
            break;
          }
        } catch (e) {
          // prossegue tentando fallback
        }
      }
    }
    if (!skills) {
      skills = FALLBACK_HABILIDADES;
      isFallback = true;
      sourcePath = 'in-memory-fallback';
    }
  }

  const category1 = [];
  const category2 = [];
  const category3 = [];

  for (const s of skills) {
    const cat = classifySkill(s);
    if (cat === 1) category1.push(s);
    else if (cat === 2) category2.push(s);
    else category3.push(s);
  }

  // Gera texto legível e sem jargões obscuros (sem background-clip)
  const sanitizeForDisplay = (desc) => {
    if (!desc) return '';
    return desc.replace(/imune a falhas de background-clip do Chromium/gi, 'aplicado diretamente em curvas vetoriais nativas');
  };

  const lines = [
    '',
    '╔════════════════════════════════════════════════════════════════════╗',
    '║ 🧰 CATÁLOGO DE HABILIDADES VISUAIS (STUDIO ENGINE)                 ║',
    '╚════════════════════════════════════════════════════════════════════╝',
    '',
    '🎨 Categoria 1: Cromia, Gradientes & Decomposição Visual',
    '──────────────────────────────────────────────────────────'
  ];

  if (category1.length === 0) {
    lines.push('  (Nenhuma habilidade nesta categoria)');
  } else {
    for (const s of category1) {
      lines.push(`  • ${s.nome}`);
      lines.push(`    ${sanitizeForDisplay(s.descricao)}`);
    }
  }

  lines.push('');
  lines.push('✍️ Categoria 2: Tipografia Cinética & Sincronização de Áudio');
  lines.push('──────────────────────────────────────────────────────────');
  if (category2.length === 0) {
    lines.push('  (Nenhuma habilidade nesta categoria)');
  } else {
    for (const s of category2) {
      lines.push(`  • ${s.nome}`);
      lines.push(`    ${sanitizeForDisplay(s.descricao)}`);
    }
  }

  lines.push('');
  lines.push('🎬 Categoria 3: Cinemática 3D, Câmera & Sound Design');
  lines.push('──────────────────────────────────────────────────────────');
  if (category3.length === 0) {
    lines.push('  (Nenhuma habilidade nesta categoria)');
  } else {
    for (const s of category3) {
      lines.push(`  • ${s.nome}`);
      lines.push(`    ${sanitizeForDisplay(s.descricao)}`);
    }
  }
  lines.push('');

  return {
    category1,
    category2,
    category3,
    totalSkills: skills.length,
    formattedText: lines.join('\n'),
    isFallback,
    sourcePath
  };
}

// ────────────────────────────────────────────────────────────────────────────
// CATÁLOGO DE TEMPLATES (OPÇÃO 1)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Lê catalogo_templates.json e retorna a lista de templates validados.
 * Lança erro se customPath explícito não existir ou estiver corrompido.
 */
export function listTemplates(templatesJsonPath = null) {
  let templates = null;
  let isFallback = false;
  let sourcePath = null;

  if (templatesJsonPath) {
    const resolved = path.resolve(templatesJsonPath);
    if (!fs.existsSync(resolved)) {
      const err = new Error(`ENOENT: no such file or directory, open '${resolved}'`);
      err.code = 'ENOENT';
      throw err;
    }
    const raw = fs.readFileSync(resolved, 'utf8');
    templates = JSON.parse(raw);
    sourcePath = resolved;
  } else {
    const candidates = [
      PATHS.TEMPLATES_JSON,
      path.resolve(process.cwd(), 'src', 'templates', 'catalogo_templates.json'),
      path.resolve(process.cwd(), 'projects', 'AI-Video-Engine', 'src', 'templates', 'catalogo_templates.json')
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        try {
          const raw = fs.readFileSync(cand, 'utf8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            templates = parsed;
            sourcePath = cand;
            break;
          }
        } catch (e) {
          // tenta fallback
        }
      }
    }
    if (!templates) {
      templates = FALLBACK_TEMPLATES;
      isFallback = true;
      sourcePath = 'in-memory-fallback';
    }
  }

  const result = Array.isArray(templates) ? [...templates] : [];
  result.templates = result;
  result.formattedText = formatTemplatesListing(result);
  result.isFallback = isFallback;
  result.sourcePath = sourcePath;
  return result;
}

/**
 * Formata a listagem de templates para exibição no terminal/chat.
 */
export function formatTemplatesListing(templates) {
  const items = Array.isArray(templates) ? templates : (templates?.templates || []);
  if (items.length === 0) {
    return '📋 Nenhum template disponível no momento.\n';
  }

  const lines = [
    '',
    '📋 TEMPLATES DISPONÍVEIS NA BIBLIOTECA:',
    '════════════════════════════════════════════════════════════'
  ];

  items.forEach((t, index) => {
    const num = index + 1;
    const durSec = t.fps && t.duracaoFrames ? (t.duracaoFrames / t.fps).toFixed(1) : '8.0';
    lines.push('');
    lines.push(`[${num}] ${t.nome || t.id}`);
    const w = t.dimensoes?.largura || 1080;
    const h = t.dimensoes?.altura || 1920;
    lines.push(`    • Proporção: ${t.proporcao || '9:16'} (${w}x${h}) | ${t.duracaoFrames || 240}f @ ${t.fps || 30}fps (${durSec}s)`);
    if (t.estilo) {
      lines.push(`    • Estilo: ${t.estilo}`);
    }
    if (Array.isArray(t.caracteristicas) && t.caracteristicas.length > 0) {
      lines.push(`    • Destaques: ${t.caracteristicas.slice(0, 3).join(', ')}`);
    }
    if (t.arquivo) {
      lines.push(`    • Arquivo: ${t.arquivo}`);
    }
  });

  lines.push('');
  lines.push('════════════════════════════════════════════════════════════');
  lines.push('');
  return lines.join('\n');
}

/**
 * Recupera template por índice 1-based ou retorna undefined.
 */
export function getTemplateByIndex(index, catalogPath = null) {
  const list = listTemplates(catalogPath);
  const idx = Number(index) - 1;
  if (!isNaN(idx) && idx >= 0 && idx < list.length) {
    return list[idx];
  }
  return undefined;
}

// ────────────────────────────────────────────────────────────────────────────
// SAFE ZONES & TELA LIMPA (OPÇÃO 2)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Calcula as safe zones matemáticas e caixas úteis por proporção.
 */
export function calculateSafeZones(aspect = '9:16') {
  if (aspect === '4:5') {
    return {
      aspectRatio: '4:5',
      width: 1080,
      height: 1350,
      padding: { top: 100, bottom: 100, left: 64, right: 64 },
      safeBox: { minX: 64, maxX: 1016, minY: 100, maxY: 1250 },
      safeWidth: 952,
      safeHeight: 1150
    };
  }
  if (aspect === '1:1') {
    return {
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      padding: { top: 64, bottom: 64, left: 64, right: 64 },
      safeBox: { minX: 64, maxX: 1016, minY: 64, maxY: 1016 },
      safeWidth: 952,
      safeHeight: 952
    };
  }
  if (aspect === '9:16') {
    return {
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      padding: { top: 150, bottom: 260, left: 64, right: 110 },
      safeBox: { minX: 64, maxX: 970, minY: 150, maxY: 1660 },
      safeWidth: 906,
      safeHeight: 1510
    };
  }
  throw new Error(`Unsupported aspect ratio: ${aspect}. Proporção não suportada.`);
}

/**
 * Gera descritor de tela limpa ("Clean Slate") sem reciclagem de layouts prévios.
 */
export function generateCleanSlate(options = {}) {
  const opts = options || {};
  let aspect = opts.aspect || opts.aspectRatio;
  if (!aspect) {
    const themeStr = (opts.theme || '') + ' ' + (opts.objective || '');
    if (/carrossel|carousel|4:5|editorial|slides/i.test(themeStr)) {
      aspect = '4:5';
    } else {
      aspect = '9:16';
    }
  }

  if (opts.width !== undefined || opts.height !== undefined) {
    const w = Number(opts.width);
    const h = Number(opts.height);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      throw new Error('Invalid dimensions: width and height must be positive numbers. Dimensões inválidas.');
    }
  }

  const safe = calculateSafeZones(aspect);
  const width = opts.width ? Number(opts.width) : safe.width;
  const height = opts.height ? Number(opts.height) : safe.height;
  const fps = opts.fps ? Number(opts.fps) : 30;
  const durationInFrames = opts.durationInFrames ? Number(opts.durationInFrames) : 300;
  const theme = opts.theme || '';
  const objective = opts.objective || 'geral';

  return {
    cleanSlate: true,
    aspectRatio: aspect,
    width,
    height,
    fps,
    durationInFrames,
    theme,
    title: theme,
    objective,
    background: '#060709',
    surface: '#111317',
    ink: '#F8FAFC',
    accent: objective === 'venda' ? '#10B981' : objective === 'atracao' ? '#6366F1' : '#F59E0B',
    safeBox: { ...safe.safeBox },
    padding: { ...safe.padding },
    recycledScenes: false,
    recycledLayout: false,
      carousel: opts.carousel || (aspect === '4:5' ? {
        slideCount: opts.slideCount || 5,
        visualUniformity: opts.visualUniformity || 'uniforme',
        targetType: opts.targetType || 'motion',
      } : null)
  };
}

export const initializeCleanSlate = generateCleanSlate;

// ────────────────────────────────────────────────────────────────────────────
// PROPOSTA REVERSA DE DIREÇÃO CRIATIVA (SUGGEST & CONFIRM EM 1 CLIQUE)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Infere a melhor direção criativa a partir do briefing bruto (sem questionário burocrático)
 * evitando que o agente caia no template padrão genérico.
 */
export const ONE_SENTENCE_STYLE_ROUTES = [
  {
    id: "gancho_grande_topo",
    layoutMode: "gancho_grande_topo",
    canonicalCommand: "Abre com um gancho forte na tela",
    gancho: "EU GRAVEI ESSE VÍDEO UMA VEZ SÓ (Gancho em 3 linhas no topo)",
    estetica: "Gancho Tipográfico 3 Linhas no Topo (Acendimento Progressivo #FFFFFF/#8E849E + Sublinhado Ondulado de Erro #FF3B5C)",
    ritmo: "Impacto imediato 0.0s–3.0s com oclusão Z atrás da cabeça e onda corretiva SVG",
    paleta: ["#120D18", "#FFFFFF", "#8E849E", "#FF3B5C"],
    regex: /abre com um gancho|gancho forte na tela|primeira frase em letra grande|gancho grande no topo|gancho na tela|letra grande no alto/i,
  },
  {
    id: "capa_revista_editorial",
    layoutMode: "capa_revista_editorial",
    canonicalCommand: "Deixa com cara de capa de revista",
    gancho: "O vídeo inteiro editado por uma frase vira capa de revista",
    estetica: "Capa de Revista Editorial GQ/Vogue (Verde Editorial Inglês #1A3C2A, Masthead Serifa 210px atrás da cabeça, Moldura Champanhe 48px e Código de Barras)",
    ritmo: "Alternância fundo real emoldurado ↔ fundo sólido #1A3C2A nos picos de impacto",
    paleta: ["#1A3C2A", "#F4F1EA", "#D4CEB8"],
    regex: /cara de capa de revista|capa de revista|estilo revista|vira capa|revista editorial/i,
  },
  {
    id: "orbita_split_screen",
    layoutMode: "orbita_split_screen",
    canonicalCommand: "Divide a tela: o vídeo em cima e eu reagindo embaixo",
    gancho: "Olha o mural de cards que a IA montou em volta de mim",
    estetica: "Split-Screen 50/50 (Y=960px) + Mural de Cards Flutuantes em Órbita no Topo + Legenda Cravada na Costura Central com Destaque #FF6B2B",
    ritmo: "Reação dupla simultânea com entrada elástica de cards orbitais",
    paleta: ["#0A0A0A", "#FFFFFF", "#FF6B2B", "#141413"],
    regex: /divide a tela|tela dividida|vídeo em cima e eu reagindo embaixo|reagindo embaixo|em órbita|orbita ao meu redor|em volta de mim|mural de frases/i,
  },
  {
    id: "onda_audio_corte",
    layoutMode: "onda_audio_corte",
    canonicalCommand: "Explica essa parte com uma animação",
    gancho: "Você manda o bruto com pausa e gaguejada e a IA fatia tudo",
    estetica: "Dark UI Motion Explicativo (#0A0806, Monitor de Waveform com Setas Manuscritas Vermelhas #FF4D4D apontando erro/gaguejada/pausa e Scanner Laranja #FF6B2B)",
    ritmo: "Diagnóstico visual da onda bruta -> Varredura a laser suprimindo silêncios",
    paleta: ["#0A0806", "#FF6B2B", "#FF4D4D", "#D6D3CD"],
    regex: /explica essa parte com uma anima|onda do áudio|onda de áudio|corta as pausas|tira as pausas|última tomada|melhor tomada|waveform|bruto\.mov/i,
  },
  {
    id: "palavra_impacto_atras",
    layoutMode: "palavra_impacto_atras",
    canonicalCommand: "Põe a frase forte atrás de mim",
    gancho: "A frase forte entra gigante atrás de você sem cobrir o rosto",
    estetica: "Tipografia Monumental Ocluída por Rotoscopia (Texto gigante Z=1 atrás da cabeça Z=2)",
    ritmo: "Entrada cinética sincronizada com palavras de autoridade",
    paleta: ["#0D0F12", "#FFFFFF", "#FF6B2B"],
    regex: /frase forte atrás de mim|palavra de impacto atrás|texto grande atrás de mim|atrás da cabeça/i,
  },
];

export function matchStyleCommand(briefing = "") {
  const clean = String(briefing || "").trim();
  if (!clean) return null;
  for (const route of ONE_SENTENCE_STYLE_ROUTES) {
    if (route.regex.test(clean)) {
      return route;
    }
  }
  return null;
}

export function inferDirectionProposal(briefing = '', options = {}) {
  const text = String(briefing).toLowerCase();
  const matchedCommand = matchStyleCommand(briefing);
  if (matchedCommand) {
    return {
      isCarousel: false,
      slideCount: undefined,
      gancho: matchedCommand.gancho,
      estetica: matchedCommand.estetica,
      ritmo: matchedCommand.ritmo,
      paleta: matchedCommand.paleta,
      layoutMode: matchedCommand.layoutMode,
      matchedStyleCommand: matchedCommand.canonicalCommand,
    };
  }
  const isCarousel = /carrossel|carousel|4:5|editorial|slides/i.test(text);

  let gancho = 'Apresentar a verdade brutal do problema sem rodeios';
  let estetica = 'Dark Mode Glassmorphism Minimalista';
  let ritmo = 'Cortes secos a cada 1.8s com masterização -14 LUFS';
  let paleta = ['#0A0B0E', '#FF0022', '#FFFFFF'];
  let slideCount = isCarousel ? 5 : undefined;
  let layoutMode = isCarousel ? 'carrossel_editorial' : 'full_bleed';

  if (/código|terminal|developer|dev|engenh|hack|agent|cli|npm|git|estúdio/i.test(text)) {
    gancho = 'O fim das ferramentas genéricas e o poder do código puro';
    estetica = 'Full Bleed Terminal & Raw Code (Sem mockups/cards flutuantes)';
    ritmo = 'Cortes secos a cada 1.2s + Takeover de tela inteira a 60 FPS';
    paleta = ['#08090C', '#00FF66', '#FF0022', '#FFFFFF'];
    layoutMode = 'full_bleed_terminal';
  } else if (/vox|jornal|notícia|história|reportagem|documentário|geopolítica|investig|curiosidade|dados|política|guerra|fronteira|mapa|passado/i.test(text)) {
    gancho = 'A história que os registros oficiais tentaram esconder';
    estetica = 'Jornalismo Visual Documental VOX (Mapas Vintage, Recortes de Jornal, Marca-texto e Zero Neon)';
    ritmo = 'Cadência documental explicativa a 30 FPS com mesa 2.5D e sound design analógico';
    paleta = ['#F4F1EA', '#141413', '#D9381E', '#FFDE2E'];
    layoutMode = 'vox_documentario';
  } else if (/finance|finan|dinheiro|investir|investimento|investimentos|\binvest\b|banco|gestão|caixa/i.test(text)) {
    gancho = 'Você está perdendo dinheiro por falta de controle em tempo real';
    estetica = 'Fintech High-End (Obsidian Black, Esmeralda Glow e Tipografia Suíça)';
    ritmo = 'Transições com física de mola crítica e sound design haptic';
    paleta = ['#050807', '#00E599', '#F4F5F7'];
    layoutMode = 'fintech_showcase';
  } else if (/luxo|moda|lifestyle|barber|estilo|eleganc/i.test(text)) {
    gancho = 'A experiência que separa o amador do padrão de excelência';
    estetica = 'Editorial Luxo Cinematográfico (Preto & Dourado / P&B Alto Contraste)';
    ritmo = 'Ritmo hipnótico e respiração com Auto-Ducking refinado';
    paleta = ['#09090B', '#D4AF37', '#FAFAFA'];
    layoutMode = 'editorial_luxo';

  } else if (/slop|genéric|ia|robô|ai/i.test(text)) {
    gancho = 'Cansado de vídeos de inteligência artificial sem alma?';
    estetica = 'Brutalismo Anti-Slop (Vermelho Ferrari, Tipografia Massiva e Tela Cheia)';
    ritmo = 'Glitch sonoro, carimbo brutalista + Takeover de tela real';
    paleta = ['#050505', '#FF0022', '#FFFFFF'];
    layoutMode = 'brutalismo_anti_slop';
  }

  return {
    isCarousel,
    slideCount,
    gancho,
    estetica,
    ritmo,
    paleta,
    layoutMode,
  };
}

/**
 * Formata o card visual da Proposta Reversa para o terminal em 1 clique.
 */
export function formatDirectionProposal(proposal) {
  const line = '─'.repeat(75);
  return `
┌${line}┐
│ 🎬 VIBE DESIGN STUDIO — PROPOSTA DE DIREÇÃO (1 CLIQUE)                      │
│                                                                             │
│ Analisei seu briefing e formulei esta direção não-genérica:                 │
│                                                                             │
│ • Gancho / Tensão: "${proposal.gancho}"
│ • Estética Visual: ${proposal.estetica}
│ • Ritmo & Cortes:  ${proposal.ritmo}
│ • Paleta Básica:   ${proposal.paleta.join(', ')}
│ • Layout Mode:     ${proposal.layoutMode}
│                                                                             │
│ [1] Aprovar e Gerar Direto (Padrão - Pressione Enter)                       │
│ [2] Quero personalizar estética e formato                                   │
└${line}┘
`;
}

// ────────────────────────────────────────────────────────────────────────────
// PROMPT BRIEFING EXPRESSO
// ────────────────────────────────────────────────────────────────────────────

/**
 * Solicita o Briefing Expresso em 1 mensagem objetiva.
 * Tolera entradas vazias com reprompting seguro, normaliza quebras de linha e
 * protege contra loops infinitos em caso de mock esgotado ou EOF.
 */
export async function promptBriefingExpresso(reader, writer, maxRetries = 3) {
  const r = adaptReader(reader);
  const w = adaptWriter(writer);

  w(CANONICAL_BRIEFING_PROMPT);

  let attempts = 0;
  while (attempts < maxRetries) {
    const raw = await r.nextLine();

    if (raw === null) {
      w('❌ Erro: Entrada padrão encerrada (EOF) sem resposta ao briefing.\n');
      throw new Error('UNEXPECTED_EOF');
    }

    const sanitized = sanitizeBriefing(raw);
    if (sanitized.length > 0) {
      return sanitized;
    }

    attempts++;
    if (attempts < maxRetries) {
      w('⚠️ O briefing não pode ser vazio. Digite o objetivo e o tema:\n> ');
    }
  }

  // Fallback seguro se exceder retentativas em mock esgotado
  return 'Conteúdo autônomo de alta retenção';
}

// ────────────────────────────────────────────────────────────────────────────
// FLUXO PRINCIPAL DE ONBOARDING
// ────────────────────────────────────────────────────────────────────────────

/**
 * Executa o fluxo canônico de Onboarding do AI-Video-Engine.
 * @param {any} inputReader - Fonte de entrada (stream, array mock ou função async)
 * @param {any} outputWriter - Consumidor de saída (função ou stream)
 * @param {object} [options] - Opções de execução
 */
export async function runOnboarding(inputReader, outputWriter, options = {}) {
  const reader = adaptReader(inputReader);
  const writer = adaptWriter(outputWriter);
  const skillsPath = options.skillsPath || null;
  const templatesPath = options.templatesPath || null;

  let skillViewed = false;
  let chosenRoute = null;

  while (chosenRoute === null) {
    writer(CANONICAL_ONBOARDING_PROMPT);
    const rawChoice = await reader.nextLine();

    if (rawChoice === null) {
      writer('❌ Erro: Entrada padrão encerrada (EOF) antes de uma opção válida ser fornecida.\n');
      throw new Error('UNEXPECTED_EOF');
    }

    const option = parseOptionChoice(rawChoice);
    if (option === null) {
      writer('⚠️ Opção inválida. Escolha entre [1], [2], [3] ou [4].\n\n');
      continue;
    }

    if (option === 3) {
      // Rota 3: Ver Habilidades (inspeção informativa)
      const formattedSkills = formatSkillsCatalog(skillsPath);
      writer(formattedSkills.formattedText);
      skillViewed = true;

      if (options.singleStep) {
        return {
          route: 3,
          skillViewed: true,
          catalog: formattedSkills,
        };
      }

      writer('\nRetornando ao menu principal para seleção de criação...\n\n');
      continue;
    }

    chosenRoute = option;
  }

  // ROTA 1: USAR UM TEMPLATE
  if (chosenRoute === 1) {
    const templateCatalog = listTemplates(templatesPath);
    writer(templateCatalog.formattedText);
    writer(`Escolha o template desejado [1-${templateCatalog.length}]: `);

    let selectedTemplate = null;
    let briefing = null;

    const firstInput = await reader.nextLine();
    if (firstInput === null) {
      writer('❌ Erro: Entrada padrão encerrada (EOF) na seleção de template.\n');
      throw new Error('UNEXPECTED_EOF');
    }

    const trimmed = firstInput.trim();
    const numChoice = parseInt(trimmed, 10);
    if (!isNaN(numChoice) && numChoice >= 1 && numChoice <= templateCatalog.length) {
      selectedTemplate = templateCatalog[numChoice - 1];
    } else {
      // Verifica se forneceu o ID ou nome exato do template
      const match = templateCatalog.find(
        (t) => t.id.toLowerCase() === trimmed.toLowerCase() ||
               t.nome?.toLowerCase() === trimmed.toLowerCase() ||
               trimmed.toLowerCase().includes(t.id.toLowerCase())
      );
      if (match) {
        selectedTemplate = match;
      } else if (trimmed.length > 0) {
        // Usuário respondeu diretamente com o Briefing Expresso (1 clique express)
        selectedTemplate = templateCatalog[0];
        briefing = sanitizeBriefing(trimmed);
      }
    }

    if (!selectedTemplate) {
      selectedTemplate = templateCatalog[0];
    }

    writer(`\nTemplate selecionado: ${selectedTemplate.nome || selectedTemplate.id}\n`);

    if (!briefing) {
      briefing = await promptBriefingExpresso(reader, writer);
    } else {
      writer(CANONICAL_BRIEFING_PROMPT);
    }

    return {
      route: 1,
      templateId: selectedTemplate.id,
      template: selectedTemplate,
      briefing,
      skillViewed,
    };
  }

  // ROTA 2: CRIAR DO ZERO
  if (chosenRoute === 2) {
    writer('\n🎨 Iniciando criação do zero (sem reciclagem de layouts anteriores)...\n');
    const briefing = await promptBriefingExpresso(reader, writer);

    // Gera e apresenta a Proposta Reversa (Suggest & Confirm) em 1 clique
    const directionProposal = inferDirectionProposal(briefing);
    writer(formatDirectionProposal(directionProposal));

    const isCarousel = /carrossel|carousel|4:5|editorial|slides/i.test(briefing);
    let carouselProps = null;

    if (isCarousel) {
      writer('\n📋 [Protocolo Grill-Me: Carrossel Editorial 4:5 Detectado]\n');
      writer('1. Quantidade de slides/cards (pressione Enter para padrão 5):\n> ');
      const slideInput = await reader.nextLine();
      let slideCount = 5;
      if (slideInput !== null && /^\d+$/.test(slideInput.trim())) {
        slideCount = Math.max(1, parseInt(slideInput.trim(), 10));
      }

      writer('2. Estilo visual: [1] Uniforme / Padrão contínuo, [2] Individual / Slide por slide (pressione Enter para Uniforme):\n> ');
      const styleInput = await reader.nextLine();
      let visualUniformity = 'uniforme';
      if (styleInput !== null && styleInput.trim() === '2') {
        visualUniformity = 'individual';
      }

      writer('3. Destino: [1] Animação Motion (Vídeo), [2] Imagens Estáticas (Feed) (pressione Enter para Motion):\n> ');
      const targetInput = await reader.nextLine();
      let targetType = 'motion';
      if (targetInput !== null && targetInput.trim() === '2') {
        targetType = 'estatico';
      }

      carouselProps = {
        slideCount,
        visualUniformity,
        targetType,
      };
      writer('\n✅ Carrossel 4:5 configurado: ' + slideCount + ' slides | Estilo: ' + visualUniformity + ' | Destino: ' + targetType + '\n');
    }

    const cleanConfig = generateCleanSlate({
      theme: briefing,
      aspect: isCarousel ? '4:5' : '9:16',
      carousel: carouselProps,
    });

    return {
      route: 2,
      cleanSlate: true,
      briefing,
      skillViewed,
      directionProposal,
      defaults: {
        aspectRatio: cleanConfig.aspectRatio,
        width: cleanConfig.width,
        height: cleanConfig.height,
        fps: cleanConfig.fps,
        durationInFrames: cleanConfig.durationInFrames,
      },
      config: cleanConfig,
      carousel: cleanConfig.carousel,
    };
  }

  // ROTA 4: CRIAR COM REFERÊNCIA "X"
  if (chosenRoute === 4) {
    writer('\n📎 Rota com referência visual externa selecionada.\n');
    writer('Informe o link ou print de referência (opcional, pressione Enter para pular):\n> ');
    const rawRef = await reader.nextLine();

    if (rawRef === null) {
      writer('❌ Erro: Entrada padrão encerrada (EOF) na referência externa.\n');
      throw new Error('UNEXPECTED_EOF');
    }

    const referenceUrl = rawRef ? rawRef.trim() : '';
    const briefing = await promptBriefingExpresso(reader, writer);

    return {
      route: 4,
      referenceUrl: referenceUrl || null,
      briefing,
      skillViewed,
    };
  }

  return {
    route: chosenRoute,
    skillViewed,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// EXECUÇÃO DIRETA VIA CLI (TERMINAL INTERATIVO OU PIPED SHELL)
// ────────────────────────────────────────────────────────────────────────────

const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('studio_engine.mjs') ||
  process.argv[1] === fileURLToPath(import.meta.url) ||
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
);

if (isDirectExecution) {
  const reader = createQueuedLineReader(process.stdin);
  const writer = (msg) => process.stdout.write(typeof msg === 'string' ? msg : String(msg));
  // process.exit() logo após stdout.write TRUNCA a saída quando stdout é um pipe no Linux/macOS (a escrita é
  // assíncrona): o teste dos 100 prompts via pipe só recebia ~70. Define o código e deixa o Node esvaziar o buffer.
  const encerrar = (codigo) => {
    process.exitCode = codigo;
    process.stdin.destroy();
  };

  runOnboarding(reader, writer)
    .then((result) => {
      writer('\n════════════════════════════════════════════════════════════════════\n');
      writer('✅ ONBOARDING CONCLUÍDO COM SUCESSO!\n');
      writer(JSON.stringify(result, null, 2) + '\n');
      reader.close();
      encerrar(0);
    })
    .catch((err) => {
      writer(`\n❌ ERRO NO STUDIO ENGINE: ${err.message}\n`);
      reader.close();
      encerrar(1);
    });
}
