import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import {
  WordItem,
  HormoziVariant,
  HighlightStyle,
  MotionIntensity,
  matchContextualEmoji,
  calculateHormoziPop,
  calculateHormoziRotation,
} from '../timeline/hormoziMath';

export interface HormoziKineticCaptionProps {
  /** Array de palavras sincronizadas via Whisper milissegundo a milissegundo */
  words: WordItem[];
  /** Preset de cor e energia */
  variant?: HormoziVariant;
  /** Estilo de destaque da palavra falada (anti-engessamento) */
  highlightStyle?: HighlightStyle;
  /** Intensidade física da mola e rotação ('subtle', 'standard', 'extreme') */
  motionIntensity?: MotionIntensity;
  /** Quantidade de palavras na janela deslizante (default: 1) */
  windowSize?: 1 | 2 | 3;
  /** Exibir emojis automáticos detectados por semântica (default: true) */
  showEmojis?: boolean;
  /** Dicionário customizado opcional de emojis { termo: 'emoji' } */
  customEmojiMap?: Record<string, string>;
  /** Caixa alta ou manter original (default: 'uppercase') */
  textTransform?: 'uppercase' | 'capitalize' | 'none';
  /** Família tipográfica (default: 'Inter, system-ui, sans-serif') */
  fontFamily?: string;
  /** Tamanho da fonte em px (default: 68 para vertical 1080x1920) */
  fontSize?: number;
  /** Largura do contorno preto em px (default: 6) */
  strokeWidth?: number;
  /** Distância do rodapé em px (default: 420 para safe-zone de Reels/TikTok) */
  bottom?: number;
  /** Alinhamento vertical ('center' para meio da tela ou 'bottom') */
  verticalAlignment?: 'center' | 'bottom';
  style?: React.CSSProperties;
}

const VARIANT_CONFIGS: Record<
  HormoziVariant,
  {
    activeText: string;
    activeBg: string;
    activeGlow: string;
    inactiveText: string;
    underlineColor: string;
  }
> = {
  'classic-yellow': {
    activeText: '#000000',
    activeBg: '#FFE500',
    activeGlow: 'rgba(255, 229, 0, 0.7)',
    inactiveText: '#FFFFFF',
    underlineColor: '#FFE500',
  },
  'cash-green': {
    activeText: '#000000',
    activeBg: '#00FF66',
    activeGlow: 'rgba(0, 255, 102, 0.7)',
    inactiveText: '#FFFFFF',
    underlineColor: '#00FF66',
  },
  'red-alert': {
    activeText: '#FFFFFF',
    activeBg: '#FF003C',
    activeGlow: 'rgba(255, 0, 60, 0.8)',
    inactiveText: '#FFFFFF',
    underlineColor: '#FF003C',
  },
  'cyber-cyan': {
    activeText: '#000000',
    activeBg: '#00E5FF',
    activeGlow: 'rgba(0, 229, 255, 0.75)',
    inactiveText: '#FFFFFF',
    underlineColor: '#00E5FF',
  },
  'dark-glass': {
    activeText: '#FFFFFF',
    activeBg: 'rgba(255, 255, 255, 0.22)',
    activeGlow: 'rgba(255, 255, 255, 0.4)',
    inactiveText: 'rgba(255, 255, 255, 0.65)',
    underlineColor: '#FFFFFF',
  },
  // Para fundos claros: palavra ativa em caixa preta, resto em tinta escura (branco sobre creme não lê bem)
  'ink-punch': {
    activeText: '#FFFFFF',
    activeBg: '#111111',
    activeGlow: 'rgba(17, 17, 17, 0.35)',
    inactiveText: '#111111',
    underlineColor: '#111111',
  },
  'white-punch': {
    activeText: '#FFE500',
    activeBg: 'transparent',
    activeGlow: 'rgba(255, 229, 0, 0.9)',
    inactiveText: '#FFFFFF',
    underlineColor: '#FFE500',
  },
};

/**
 * COMPONENTE CANÔNICO DE LEGENDA DE ALTO IMPACTO (PADRÃO ALEX HORMOZI)
 * Implementa o Conceito Fixo (retenção neurobiológica) e Estilo Livre (parametrização total).
 */
export const HormoziKineticCaption: React.FC<HormoziKineticCaptionProps> = ({
  words,
  variant = 'classic-yellow',
  highlightStyle = 'box',
  motionIntensity = 'standard',
  windowSize = 1,
  showEmojis = true,
  customEmojiMap,
  textTransform = 'uppercase',
  fontFamily = 'Inter, system-ui, sans-serif',
  fontSize = 68,
  strokeWidth = 6,
  bottom = 420,
  verticalAlignment = 'bottom',
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const cfg = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS['classic-yellow'];

  // Encontra o índice da palavra atualmente falada
  const activeWordIdx = words.findIndex((w) => t >= w.start && t <= w.end);

  // Janela deslizante de palavras visíveis
  const visibleSlice = useMemo(() => {
    if (words.length === 0) return [];
    if (t < words[0].start - 0.1 || t > words[words.length - 1].end + 0.5) {
      return [];
    }
    if (activeWordIdx === -1) {
      const nextIdx = words.findIndex((w) => w.start > t);
      const idx = nextIdx > 0 ? nextIdx - 1 : (nextIdx === 0 ? 0 : words.length - 1);
      const start = Math.max(0, idx - Math.floor(windowSize / 2));
      return words.slice(start, start + windowSize);
    }
    const start = Math.max(0, activeWordIdx - Math.floor(windowSize / 2));
    return words.slice(start, start + windowSize);
  }, [activeWordIdx, t, windowSize, words]);

  if (visibleSlice.length === 0) return null;

  const isCenter = verticalAlignment === 'center';

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        ...(isCenter
          ? { top: '50%', transform: 'translateY(-50%)' }
          : { bottom }),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 90,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: windowSize > 1 ? 16 : 8,
          flexWrap: 'wrap',
          maxWidth: '92%',
          textAlign: 'center',
        }}
      >
        {visibleSlice.map((w, idx) => {
          const isSpoken = t >= w.start && t <= w.end;
          const wordStartFrame = Math.round(w.start * fps);
          const wordAge = frame - wordStartFrame;

          // Física de mola e rotação
          const popScale = isSpoken
            ? calculateHormoziPop(wordAge, fps, motionIntensity)
            : 1.0;
          const rotationAngle = isSpoken
            ? calculateHormoziRotation(activeWordIdx >= 0 ? activeWordIdx : idx, motionIntensity)
            : 0;

          // Emoji semântico
          const emojiMatch = showEmojis && isSpoken
            ? matchContextualEmoji(w.text, customEmojiMap)
            : null;

          // Estilo de highlight
          const isBox = isSpoken && (highlightStyle === 'box' || highlightStyle === 'pill');
          const isPill = highlightStyle === 'pill';
          const isUnderline = isSpoken && highlightStyle === 'underline';

          const textColor = isSpoken
            ? (highlightStyle === 'text-only' ? cfg.underlineColor : cfg.activeText)
            : cfg.inactiveText;

          const strokeStyle = strokeWidth > 0 && !isBox
            ? `${strokeWidth}px #000000`
            : (isBox && cfg.activeText === '#FFFFFF' ? '3px #000000' : 'none');

          const dropShadow = isBox
            ? `0 12px 28px ${cfg.activeGlow}, 0 4px 10px rgba(0,0,0,0.5)`
            : '0 8px 0 #000000, 0 16px 30px rgba(0, 0, 0, 0.9)';

          const transformedText = textTransform === 'uppercase'
            ? w.text.toUpperCase()
            : (textTransform === 'capitalize'
                ? w.text.charAt(0).toUpperCase() + w.text.slice(1)
                : w.text);

          return (
            <div
              key={`${w.start}-${w.text}-${idx}`}
              style={{
                position: 'relative',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `scale(${popScale}) rotate(${rotationAngle}deg)`,
                transformOrigin: 'center bottom',
                transition: 'none',
              }}
            >
              {/* Emoji flutuante contextual */}
              {emojiMatch && (
                <div
                  style={{
                    position: 'absolute',
                    top: -54,
                    fontSize: 44,
                    filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.8))',
                    animation: 'none',
                    pointerEvents: 'none',
                  }}
                >
                  {emojiMatch.emoji}
                </div>
              )}

              {/* Corpo da Palavra */}
              <span
                style={{
                  fontFamily,
                  fontSize,
                  fontWeight: 900,
                  color: textColor,
                  backgroundColor: isBox ? cfg.activeBg : 'transparent',
                  padding: isBox ? '6px 18px' : '0 4px',
                  borderRadius: isBox ? (isPill ? 999 : 10) : 0,
                  borderBottom: isUnderline ? `8px solid ${cfg.underlineColor}` : 'none',
                  WebkitTextStroke: strokeStyle,
                  paintOrder: 'stroke fill',
                  boxShadow: isBox ? dropShadow : 'none',
                  textShadow: !isBox ? dropShadow : 'none',
                  letterSpacing: '-0.03em',
                  display: 'inline-block',
                  lineHeight: 1.15,
                }}
              >
                {transformedText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
