/**
 * Matemática e Lógica Pura para Técnicas de Retenção e Tipografia Hormozi
 * Módulo puro em TypeScript (zero JSX), compatível com Node.js nativo e Remotion.
 * Diretriz: Conceito Fixo (retenção neurobiológica) e Estilo Livre (anti-engessamento).
 */

export interface WordItem {
  text: string;
  start: number; // segundos
  end: number;   // segundos
}

export interface EmojiMatch {
  emoji: string;
  keyword: string;
}

export type MotionIntensity = 'subtle' | 'standard' | 'extreme';
export type HighlightStyle = 'box' | 'pill' | 'text-only' | 'underline';
export type HormoziVariant =
  | 'classic-yellow'
  | 'cash-green'
  | 'red-alert'
  | 'cyber-cyan'
  | 'dark-glass'
  | 'white-punch'
  | 'ink-punch';

/**
 * Dicionário Semântico Canônico de Emojis Contextuais (PT-BR e EN)
 */
export const HORMOZI_EMOJI_DICTIONARY: Record<string, string> = {
  // Finanças, Lucro & Vendas
  dinheiro: '💰',
  grana: '💰',
  lucro: '📈',
  faturar: '💵',
  faturamento: '💵',
  venda: '🏷️',
  vendas: '🏷️',
  preco: '🏷️',
  rico: '🤑',
  milionario: '💎',
  dolar: '💵',
  money: '💰',
  cash: '💵',
  profit: '📈',
  sales: '🏷️',
  rich: '🤑',

  // Fogo, Intensidade & Foco
  fogo: '🔥',
  quente: '🔥',
  foco: '🎯',
  meta: '🎯',
  segredo: '🔑',
  chave: '🔑',
  energia: '⚡',
  explosao: '💥',
  fire: '🔥',
  hot: '🔥',
  focus: '🎯',
  target: '🎯',
  secret: '🔑',
  key: '🔑',

  // Mente, Ideias & Inteligência
  mente: '🧠',
  cerebro: '🧠',
  pensar: '💡',
  pensamento: '💡',
  ideia: '💡',
  sacada: '💡',
  visao: '👁️',
  mind: '🧠',
  brain: '🧠',
  think: '💡',
  idea: '💡',
  vision: '👁️',

  // Crescimento, Escala & Velocidade
  foguete: '🚀',
  escala: '🚀',
  escalar: '🚀',
  crescer: '📈',
  rapido: '⚡',
  tempo: '⏱️',
  segundos: '⏱️',
  acelerar: '🏎️',
  rocket: '🚀',
  scale: '🚀',
  fast: '⚡',
  time: '⏱️',

  // Erros, Perigo & Bloqueios
  erro: '❌',
  errado: '❌',
  nunca: '🚫',
  pare: '🛑',
  bloqueio: '🛑',
  perigo: '⚠️',
  alerta: '⚠️',
  cuidado: '⚠️',
  wrong: '❌',
  never: '🚫',
  stop: '🛑',
  warning: '⚠️',
  danger: '⚠️',

  // Pessoas, Clientes & Autoridade
  cliente: '👥',
  clientes: '👥',
  pessoas: '👥',
  audiencia: '📢',
  lead: '🎯',
  time_equipe: '🤝',
  trofeu: '🏆',
  vitoria: '🏆',
  campeao: '🥇',
  client: '👥',
  people: '👥',
  audience: '📢',
  winner: '🏆',
};

/**
 * Remove pontuações e acentos para correspondência de busca semântica
 */
export function sanitizeWordForHighlight(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .trim();
}

/**
 * Encontra emoji contextual para a palavra dada
 */
export function matchContextualEmoji(
  text: string,
  customDict?: Record<string, string>
): EmojiMatch | null {
  const sanitized = sanitizeWordForHighlight(text);
  if (!sanitized) return null;

  const dict = customDict
    ? { ...HORMOZI_EMOJI_DICTIONARY, ...customDict }
    : HORMOZI_EMOJI_DICTIONARY;

  // Busca exata
  if (dict[sanitized]) {
    return { emoji: dict[sanitized], keyword: sanitized };
  }

  // Busca parcial (raiz)
  for (const [key, emoji] of Object.entries(dict)) {
    if (sanitized.includes(key) || (key.length >= 4 && key.includes(sanitized))) {
      return { emoji, keyword: key };
    }
  }

  return null;
}

/**
 * Parâmetros de calibração física da mola pop conforme a intensidade escolhida
 */
export const MOTION_INTENSITY_CONFIGS: Record<
  MotionIntensity,
  { maxScale: number; maxRotation: number; springDurationFrames: number }
> = {
  subtle: {
    maxScale: 1.12,
    maxRotation: 0,
    springDurationFrames: 8,
  },
  standard: {
    maxScale: 1.28,
    maxRotation: 2.5,
    springDurationFrames: 10,
  },
  extreme: {
    maxScale: 1.36,
    maxRotation: 4.0,
    springDurationFrames: 12,
  },
};

/**
 * Calcula a curva elástica de overshoot pop para a palavra recém falada
 * Retorna o multiplicador de escala (ex: 1.0 -> 1.28 -> 1.0)
 */
export function calculateHormoziPop(
  wordAgeFrames: number,
  fps: number,
  intensity: MotionIntensity = 'standard'
): number {
  if (wordAgeFrames < 0) return 1.0;

  const cfg = MOTION_INTENSITY_CONFIGS[intensity] || MOTION_INTENSITY_CONFIGS.standard;
  const duration = cfg.springDurationFrames;

  if (wordAgeFrames > duration * 2.5) {
    return 1.0;
  }

  // Curva de mola analítica amortecida com overshoot (física harmônica pura)
  const t = wordAgeFrames / duration;
  if (t >= 2.0) return 1.0;

  // Função envelope senoidal decrescente: e^(-3*t) * sin(pi * t * 1.5)
  const envelope = Math.exp(-2.2 * t);
  const oscillation = Math.sin(Math.PI * t * 1.2);
  const factor = Math.max(0, envelope * oscillation * 1.8);

  const scale = 1.0 + (cfg.maxScale - 1.0) * factor;
  return Number(scale.toFixed(4));
}

/**
 * Rotação orgânica alternada para quebrar a monotonia visual
 * Palavras pares rotacionam para um lado, ímpares para o outro (-3° a +3°)
 */
export function calculateHormoziRotation(
  wordIndex: number,
  intensity: MotionIntensity = 'standard'
): number {
  const cfg = MOTION_INTENSITY_CONFIGS[intensity] || MOTION_INTENSITY_CONFIGS.standard;
  if (cfg.maxRotation === 0) return 0;

  // Alterna o sinal baseado no índice e usa um hash sutil para variação
  const sign = wordIndex % 2 === 0 ? 1 : -1;
  const variance = 0.8 + ((Math.abs(wordIndex * 7) % 5) / 10); // 0.8 a 1.2
  const angle = sign * cfg.maxRotation * variance;
  return Number(angle.toFixed(2));
}

/**
 * Calcula a porcentagem contínua da barra de retenção (0.0 a 1.0)
 */
export function calculateRetentionProgress(
  currentFrame: number,
  totalDurationFrames: number
): number {
  if (totalDurationFrames <= 0) return 0;
  const progress = currentFrame / totalDurationFrames;
  return Number(Math.max(0, Math.min(1, progress)).toFixed(4));
}

/**
 * Avalia se o micro-zoom de atenção (Punch Zoom) está ativo no frame atual
 */
export function isPunchZoomActive(
  currentFrame: number,
  fps: number,
  cutPointsSeconds: number[],
  zoomDurationFrames: number = 18,
  zoomScale: number = 1.12
): { active: boolean; scale: number } {
  if (!cutPointsSeconds || cutPointsSeconds.length === 0) {
    return { active: false, scale: 1.0 };
  }

  for (const cutSec of cutPointsSeconds) {
    const cutFrame = Math.round(cutSec * fps);
    if (currentFrame >= cutFrame && currentFrame < cutFrame + zoomDurationFrames) {
      // Zoom ativo durante a janela do corte
      return { active: true, scale: zoomScale };
    }
  }

  return { active: false, scale: 1.0 };
}
