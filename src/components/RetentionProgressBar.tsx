import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { calculateRetentionProgress } from '../timeline/hormoziMath';

export interface RetentionProgressBarProps {
  /** Posição na tela ('top', 'bottom') (default: 'top') */
  position?: 'top' | 'bottom';
  /** Altura da barra em px (default: 8) */
  height?: number;
  /** Cores do gradiente [início, fim] (default: ['#FFE500', '#FF003C']) */
  gradient?: [string, string];
  /** Exibir glow luminoso dinâmico na ponta (default: true) */
  showGlow?: boolean;
  /** Cor do glow (default: 'rgba(255, 229, 0, 0.8)') */
  glowColor?: string;
  /** Safe-zone horizontal (margem lateral em px, default: 0 para full width) */
  marginHorizontal?: number;
  style?: React.CSSProperties;
}

/**
 * BARRA DE RETENÇÃO CINÉTICA CONTÍNUA (RETENTION PROGRESS BAR)
 * Mantém o espectador engajado mostrando o progresso dinâmico de 0% a 100%.
 */
export const RetentionProgressBar: React.FC<RetentionProgressBarProps> = ({
  position = 'top',
  height = 8,
  gradient = ['#FFE500', '#FF003C'],
  showGlow = true,
  glowColor = 'rgba(255, 229, 0, 0.85)',
  marginHorizontal = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = calculateRetentionProgress(frame, durationInFrames);
  const percent = progress * 100;

  const isTop = position === 'top';

  return (
    <div
      style={{
        position: 'absolute',
        left: marginHorizontal,
        right: marginHorizontal,
        ...(isTop ? { top: 0 } : { bottom: 0 }),
        height,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        zIndex: 100,
        pointerEvents: 'none',
        overflow: 'hidden',
        borderRadius: marginHorizontal > 0 ? 4 : 0,
        ...style,
      }}
    >
      {/* Barra de Progresso Fluida */}
      <div
        style={{
          width: `${percent}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})`,
          boxShadow: showGlow ? `0 0 16px ${glowColor}, 0 0 30px ${gradient[1]}` : 'none',
          transition: 'none',
        }}
      />
    </div>
  );
};
