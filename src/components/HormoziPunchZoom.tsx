import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { isPunchZoomActive } from '../timeline/hormoziMath';

export interface HormoziPunchZoomProps {
  /** Lista de timestamps em segundos onde ocorrem os cortes de zoom */
  cutPointsSeconds?: number[];
  /** Escala do zoom de aproximação (default: 1.12) */
  zoomScale?: number;
  /** Duração em frames de cada pulso de zoom (default: 18 frames, ~0.6s em 30fps) */
  zoomDurationFrames?: number;
  /** Conteúdo ou composição envelopada pelo rig de zoom */
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * RIG DE MICRO-ZOOM DE ATENÇÃO (PUNCH ZOOM RIG)
 * Aplica cuts súbitos de aproximação da câmera para quebrar a monotonia
 * e resetar a atenção dopaminérgica do espectador em momentos de ênfase.
 */
export const HormoziPunchZoom: React.FC<HormoziPunchZoomProps> = ({
  cutPointsSeconds = [2.5, 6.0, 10.5],
  zoomScale = 1.12,
  zoomDurationFrames = 18,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { scale } = isPunchZoomActive(
    frame,
    fps,
    cutPointsSeconds,
    zoomDurationFrames,
    zoomScale
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        transition: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
