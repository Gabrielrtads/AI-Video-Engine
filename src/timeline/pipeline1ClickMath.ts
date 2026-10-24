/**
 * Matemática e Lógica Pura para o Pipeline 1-Click Script-to-Video
 * Módulo puro em TypeScript (zero JSX), compatível com Node.js nativo e Remotion.
 * Suporta múltiplos formatos: Vertical (9:16), Widescreen Horizontal (16:9), Feed/Carrossel (4:5) e Quadrado (1:1).
 */

import type { WordItem } from './hormoziMath.ts';
import type { TimelineState, TrackItem, ClipItem } from './types.ts';

export type AspectRatio =
  | '9:16'
  | '16:9'
  | '4:5'
  | '1:1'
  | 'vertical'
  | 'horizontal'
  | 'landscape'
  | 'widescreen'
  | 'feed'
  | 'carrossel'
  | 'quadrado'
  | 'square';

export interface AspectRatioMetrics {
  width: number;
  height: number;
  standardRatio: '9:16' | '16:9' | '4:5' | '1:1';
  captionBottom: number;
  captionFontSize: number;
  mockupWidth: number;
  mockupHeight: number;
  cardWidth: number;
  cardHeight: number;
}

export interface Pipeline1ClickOptions {
  text: string;
  audioDurationSeconds: number;
  words?: WordItem[];
  audioFile?: string;
  preset?: 'hormozi' | 'editorial' | 'tech' | 'keynote';
  variant?: string;
  aspectRatio?: AspectRatio;
  layout?: 'standard' | 'split-screen' | 'keynote';
  fps?: number;
  width?: number;
  height?: number;
  showEmojis?: boolean;
}

/**
 * Resolve as dimensões de tela, safe zones e escalas visuais para qualquer proporção de vídeo
 * (Widescreen 16:9 para YouTube, Vertical 9:16 para Reels, Carrossel 4:5 ou Quadrado 1:1).
 */
export function resolveAspectRatioMetrics(
  aspectRatio?: AspectRatio,
  customWidth?: number,
  customHeight?: number
): AspectRatioMetrics {
  // Se largura e altura customizadas forem passadas, infere a métrica proporcional
  if (customWidth && customHeight && customWidth > 0 && customHeight > 0) {
    const isWidescreen = customWidth > customHeight * 1.2;
    const isSquare = Math.abs(customWidth - customHeight) <= 40;
    const isFeed = !isWidescreen && !isSquare && customHeight <= customWidth * 1.35;

    if (isWidescreen) {
      return {
        width: customWidth,
        height: customHeight,
        standardRatio: '16:9',
        captionBottom: Math.round(customHeight * 0.11),
        captionFontSize: Math.max(36, Math.round(customHeight * 0.052)),
        mockupWidth: Math.round(customHeight * 0.31),
        mockupHeight: Math.round(customHeight * 0.62),
        cardWidth: Math.round(customWidth * 0.35),
        cardHeight: Math.round(customHeight * 0.36),
      };
    }
    if (isFeed) {
      return {
        width: customWidth,
        height: customHeight,
        standardRatio: '4:5',
        captionBottom: Math.round(customHeight * 0.16),
        captionFontSize: Math.max(44, Math.round(customHeight * 0.048)),
        mockupWidth: Math.round(customWidth * 0.33),
        mockupHeight: Math.round(customHeight * 0.52),
        cardWidth: Math.round(customWidth * 0.5),
        cardHeight: Math.round(customHeight * 0.26),
      };
    }
    if (isSquare) {
      return {
        width: customWidth,
        height: customHeight,
        standardRatio: '1:1',
        captionBottom: Math.round(customHeight * 0.13),
        captionFontSize: Math.max(40, Math.round(customHeight * 0.052)),
        mockupWidth: Math.round(customWidth * 0.3),
        mockupHeight: Math.round(customHeight * 0.58),
        cardWidth: Math.round(customWidth * 0.48),
        cardHeight: Math.round(customHeight * 0.3),
      };
    }
    // Vertical padrão
    return {
      width: customWidth,
      height: customHeight,
      standardRatio: '9:16',
      captionBottom: Math.round(customHeight * 0.22),
      captionFontSize: Math.max(50, Math.round(customHeight * 0.036)),
      mockupWidth: Math.round(customWidth * 0.35),
      mockupHeight: Math.round(customHeight * 0.38),
      cardWidth: Math.round(customWidth * 0.5),
      cardHeight: Math.round(customHeight * 0.18),
    };
  }

  const rawAspect = (aspectRatio || '9:16').toLowerCase().trim();

  // 1. Widescreen 16:9 (YouTube, Aulas, Pitch Decks, Monitores)
  if (
    rawAspect === '16:9' ||
    rawAspect === 'horizontal' ||
    rawAspect === 'landscape' ||
    rawAspect === 'widescreen'
  ) {
    return {
      width: 1920,
      height: 1080,
      standardRatio: '16:9',
      captionBottom: 110,
      captionFontSize: 54,
      mockupWidth: 320,
      mockupHeight: 640,
      cardWidth: 640,
      cardHeight: 380,
    };
  }

  // 2. Carrossel / Feed 4:5 (Instagram Feed, LinkedIn)
  if (
    rawAspect === '4:5' ||
    rawAspect === 'feed' ||
    rawAspect === 'carrossel'
  ) {
    return {
      width: 1080,
      height: 1350,
      standardRatio: '4:5',
      captionBottom: 220,
      captionFontSize: 64,
      mockupWidth: 360,
      mockupHeight: 700,
      cardWidth: 540,
      cardHeight: 340,
    };
  }

  // 3. Quadrado 1:1 (Posts Clássicos)
  if (
    rawAspect === '1:1' ||
    rawAspect === 'quadrado' ||
    rawAspect === 'square'
  ) {
    return {
      width: 1080,
      height: 1080,
      standardRatio: '1:1',
      captionBottom: 140,
      captionFontSize: 56,
      mockupWidth: 300,
      mockupHeight: 600,
      cardWidth: 480,
      cardHeight: 300,
    };
  }

  // 4. Vertical Padrão 9:16 (Reels, TikTok, Shorts, Stories)
  return {
    width: 1080,
    height: 1920,
    standardRatio: '9:16',
    captionBottom: 420,
    captionFontSize: 70,
    mockupWidth: 380,
    mockupHeight: 740,
    cardWidth: 540,
    cardHeight: 340,
  };
}

/**
 * Estimador fonético determinístico de timestamps por palavra
 * Distribui as palavras proporcionalmente ao longo do tempo do áudio
 * com peso extra para palavras longas. Utilizado como fallback instantâneo resiliente.
 */
export function generateEstimatedWordTimestamps(
  text: string,
  totalDurationSeconds: number
): WordItem[] {
  if (!text || !text.trim() || totalDurationSeconds <= 0) {
    return [];
  }

  const rawWords = text.trim().split(/\s+/).filter(Boolean);
  if (rawWords.length === 0) return [];

  // Calcula pesos fonéticos proporcionais (comprimento da palavra + pausa de pontuação)
  const weights = rawWords.map((w) => {
    let weight = Math.max(1, w.length);
    if (/[.,!?;:]$/.test(w)) {
      weight += 2.5; // Pausa fonética pós-pontuação
    }
    return weight;
  });

  const totalWeight = weights.reduce((acc, curr) => acc + curr, 0);

  // Margem de segurança de fala (0.15s no início, 0.25s no final)
  const speechStart = Math.min(0.2, totalDurationSeconds * 0.05);
  const speechEnd = Math.max(speechStart + 0.5, totalDurationSeconds - 0.2);
  const usableDuration = speechEnd - speechStart;

  const wordItems: WordItem[] = [];
  let currentSec = speechStart;

  for (let i = 0; i < rawWords.length; i++) {
    const wordDuration = (weights[i] / totalWeight) * usableDuration;
    const start = Number(currentSec.toFixed(2));
    const end = Number((currentSec + wordDuration).toFixed(2));

    wordItems.push({
      text: rawWords[i],
      start,
      end,
    });

    currentSec += wordDuration;
  }

  return wordItems;
}

/**
 * Calcula cortes rítmicos de aproximação de câmera (Punch Zoom)
 * Espalha cortes secos a cada ~2.5 a 3.5 segundos para reset dopaminérgico
 */
export function calculatePunchZoomCuts(
  durationSeconds: number,
  intervalSeconds: number = 3.0
): number[] {
  if (durationSeconds < intervalSeconds * 1.5) {
    return [];
  }

  const cuts: number[] = [];
  let currentCut = intervalSeconds;

  while (currentCut < durationSeconds - 1.5) {
    cuts.push(Number(currentCut.toFixed(1)));
    currentCut += intervalSeconds + (Math.sin(currentCut) * 0.5); // Leve variação orgânica
  }

  return cuts;
}

/**
 * Constrói dinamicamente a Linha do Tempo Declarativa JSON completa
 * pronta para ser consumida e validada pelo compileTimeline / JsonTimelinePlayer
 */
export function build1ClickTimelinePayload(options: Pipeline1ClickOptions): TimelineState {
  const {
    text,
    audioDurationSeconds,
    audioFile = 'public/narracao.mp3',
    preset = 'hormozi',
    variant = 'classic-yellow',
    fps = 30,
    showEmojis = true,
  } = options;

  // Resolve dimensões e métricas de diagramação
  const metrics = resolveAspectRatioMetrics(options.aspectRatio, options.width, options.height);

  // Duração total em frames com respiração pós-fala (15 frames = 0.5s)
  const totalFrames = Math.max(90, Math.ceil(audioDurationSeconds * fps) + 15);

  // Palavras cronometradas (Whisper real ou estimador fonético resiliente)
  const words = options.words && options.words.length > 0
    ? options.words
    : generateEstimatedWordTimestamps(text, audioDurationSeconds);

  // Estrutura de Faixas (Tracks)
  const tracks: TrackItem[] = [
    { id: 'T_AUDIO', kind: 'audio', name: 'Voiceover Audio', volume: 1.0, zIndex: 0 },
    { id: 'T_BG', kind: 'graphics', name: 'Background FX', zIndex: 10 },
    { id: 'T_HERO', kind: 'graphics', name: 'Hero Motion Element', zIndex: 20 },
    { id: 'T_RETENTION', kind: 'graphics', name: 'Retention Progress', zIndex: 80 },
    { id: 'T_CAPTIONS', kind: 'graphics', name: 'Kinetic Captions', zIndex: 90 },
  ];

  const clips: ClipItem[] = [];

  // 1. Áudio da Narração
  clips.push({
    id: 'clip_voiceover',
    trackId: 'T_AUDIO',
    kind: 'audio',
    src: audioFile,
    startFrame: 0,
    durationInFrames: totalFrames,
    volume: 1.0,
  });

  if (preset === 'hormozi') {
    // 2. HUD Sci-fi de Fundo (adapta dinamicamente ao aspecto)
    clips.push({
      id: 'clip_bg_hud',
      trackId: 'T_BG',
      kind: 'graphics',
      componentName: 'VectorHUDOverlay',
      startFrame: 0,
      durationInFrames: totalFrames,
      props: {
        preset: 'cyber',
        accentColor: '#38BDF8',
        showGrid: true,
      },
    });

    // 3. Mockup 3D Central com dimensões proporcionais
    clips.push({
      id: 'clip_mockup_3d',
      trackId: 'T_HERO',
      kind: 'graphics',
      componentName: 'Smartphone3DMockup',
      startFrame: 0,
      durationInFrames: totalFrames,
      props: {
        width: metrics.mockupWidth,
        height: metrics.mockupHeight,
        theme: 'titanium',
        tiltIntensity: 0.5,
      },
    });

    // 4. Barra de Retenção Contínua no Topo
    clips.push({
      id: 'clip_retention_bar',
      trackId: 'T_RETENTION',
      kind: 'graphics',
      componentName: 'RetentionProgressBar',
      startFrame: 0,
      durationInFrames: totalFrames,
      props: {
        position: 'top',
        height: metrics.standardRatio === '16:9' ? 6 : 10,
        gradient: ['#FFE500', '#FF003C'],
        showGlow: true,
      },
    });

    // 5. Legendas Hormozi de Alto Impacto
    clips.push({
      id: 'clip_hormozi_captions',
      trackId: 'T_CAPTIONS',
      kind: 'graphics',
      componentName: 'HormoziKineticCaption',
      startFrame: 0,
      durationInFrames: totalFrames,
      props: {
        words,
        variant,
        highlightStyle: 'box',
        motionIntensity: 'standard',
        windowSize: 1,
        showEmojis,
        textTransform: 'uppercase',
        fontSize: metrics.captionFontSize,
        bottom: metrics.captionBottom,
      },
    });
  } else if (preset === 'editorial' || preset === 'keynote') {
    // Estilo Editorial / Keynote Luxo
    clips.push({
      id: 'clip_apple_card',
      trackId: 'T_HERO',
      kind: 'graphics',
      componentName: 'AppleKineticCard3D',
      startFrame: 0,
      durationInFrames: totalFrames,
      props: {
        title: preset === 'keynote' ? 'Keynote Widescreen' : 'Editorial Showcase',
        badge: metrics.standardRatio === '16:9' ? '4K CINEMATIC' : 'APPLE KINETIC',
        width: metrics.cardWidth,
        height: metrics.cardHeight,
        variant: 'dark-glass',
      },
    });

    clips.push({
      id: 'clip_retention_bar',
      trackId: 'T_RETENTION',
      kind: 'graphics',
      componentName: 'RetentionProgressBar',
      startFrame: 0,
      durationInFrames: totalFrames,
      props: {
        position: 'top',
        height: 6,
        gradient: ['#38BDF8', '#818CF8'],
        showGlow: true,
      },
    });

    clips.push({
      id: 'clip_editorial_captions',
      trackId: 'T_CAPTIONS',
      kind: 'graphics',
      componentName: 'HormoziKineticCaption',
      startFrame: 0,
      durationInFrames: totalFrames,
      props: {
        words,
        variant: 'dark-glass',
        highlightStyle: 'pill',
        motionIntensity: 'subtle',
        windowSize: 2,
        showEmojis: false,
        textTransform: 'none',
        fontSize: Math.round(metrics.captionFontSize * 0.85),
        bottom: metrics.captionBottom,
      },
    });
  } else {
    // Preset Tech / Terminal
    clips.push({
      id: 'clip_tech_curve',
      trackId: 'T_HERO',
      kind: 'graphics',
      componentName: 'AnimatedBezierCurve',
      startFrame: 0,
      durationInFrames: totalFrames,
      props: {
        strokeColor: '#38BDF8',
        fillGradient: true,
      },
    });

    clips.push({
      id: 'clip_retention_bar',
      trackId: 'T_RETENTION',
      kind: 'graphics',
      componentName: 'RetentionProgressBar',
      startFrame: 0,
      durationInFrames: totalFrames,
      props: {
        position: 'top',
        height: 6,
        gradient: ['#00F0FF', '#38BDF8'],
        showGlow: true,
      },
    });

    clips.push({
      id: 'clip_tech_captions',
      trackId: 'T_CAPTIONS',
      kind: 'graphics',
      componentName: 'HormoziKineticCaption',
      startFrame: 0,
      durationInFrames: totalFrames,
      props: {
        words,
        variant: 'cyber-cyan',
        highlightStyle: 'text-only',
        motionIntensity: 'standard',
        windowSize: 1,
        showEmojis: true,
        textTransform: 'uppercase',
        fontSize: metrics.captionFontSize,
        bottom: metrics.captionBottom,
      },
    });
  }

  return {
    fps,
    width: metrics.width,
    height: metrics.height,
    durationInFrames: totalFrames,
    currentFrame: 0,
    tracks,
    clips,
    selectedClipIds: [],
  };
}
