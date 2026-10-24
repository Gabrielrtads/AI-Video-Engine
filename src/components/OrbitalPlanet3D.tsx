import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface OrbitalPlanet3DProps {
  /** Posição X em pixels ou % (default: 50%) */
  x?: number | string;
  /** Posição Y em pixels ou % (default: 50%) */
  y?: number | string;
  /** Diâmetro do planeta em pixels (default: 260) */
  size?: number;
  /** Frame de início da animação de entrada (default: 0) */
  startFrame?: number;
  /** Frame em que o planeta viaja até a mão do Gabriel (ex: ~18s = frame 540) */
  dockToHandFrame?: number;
  /** Tema de cor do planeta ('cyber-blue', 'saturn-gold', 'mars-crimson', 'neon-emerald') */
  theme?: 'cyber-blue' | 'saturn-gold' | 'mars-crimson' | 'neon-emerald';
  /** Exibir anéis orbitais em 3D (default: true) */
  showRings?: boolean;
  /** Exibir luas/satélites orbitando (default: true) */
  showSatellites?: boolean;
}

const THEME_PALETTES = {
  'cyber-blue': {
    primary: '#00F0FF',
    secondary: '#3B82F6',
    dark: '#0B192C',
    glow: 'rgba(0, 240, 255, 0.65)',
    atmosphere: 'rgba(59, 130, 246, 0.35)',
    ring: 'rgba(0, 240, 255, 0.75)',
  },
  'saturn-gold': {
    primary: '#FBBF24',
    secondary: '#D97706',
    dark: '#291803',
    glow: 'rgba(251, 191, 36, 0.65)',
    atmosphere: 'rgba(217, 119, 6, 0.35)',
    ring: 'rgba(251, 191, 36, 0.85)',
  },
  'mars-crimson': {
    primary: '#EF4444',
    secondary: '#B91C1C',
    dark: '#270808',
    glow: 'rgba(239, 68, 68, 0.65)',
    atmosphere: 'rgba(185, 28, 28, 0.35)',
    ring: 'rgba(239, 68, 68, 0.75)',
  },
  'neon-emerald': {
    primary: '#10B981',
    secondary: '#059669',
    dark: '#032418',
    glow: 'rgba(16, 185, 129, 0.65)',
    atmosphere: 'rgba(5, 150, 105, 0.35)',
    ring: 'rgba(16, 185, 129, 0.75)',
  },
};

/**
 * PLANETA 3D HOLOGRÁFICO ORBITAL (ORBITAL PLANET 3D)
 * Esfera volumétrica com luz direcional, atmosfera de Fresnel,
 * anel planetário inclinado em perspectiva 3D e satélites orbitais em tempo real.
 */
export const OrbitalPlanet3D: React.FC<OrbitalPlanet3DProps> = ({
  x = '50%',
  y = '40%',
  size = 280,
  startFrame = 0,
  dockToHandFrame = 540,
  theme = 'cyber-blue',
  showRings = true,
  showSatellites = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const pal = THEME_PALETTES[theme] || THEME_PALETTES['cyber-blue'];

  // Entrada em mola suave (pop de escala)
  const entrance = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.9 },
  });

  // Movimento orgânico contínuo de flutuação
  const floatY = Math.sin((frame / fps) * 2.2) * 16;
  const floatX = Math.cos((frame / fps) * 1.5) * 12;

  // Interpolação para descer até a altura da mão do Gabriel em ~18s (frame 540 a 600)
  const handProgress = interpolate(
    frame,
    [dockToHandFrame, dockToHandFrame + 40],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Posição final na altura das mãos do Gabriel (centro-direita na área peitoral/mão)
  const currentX = interpolate(handProgress, [0, 1], [0, 140]);
  const currentY = interpolate(handProgress, [0, 1], [0, 240]);
  const scaleHand = interpolate(handProgress, [0, 1], [1, 0.75]);

  // Rotação dos anéis e textura planetária
  const planetRotation = (frame * 1.8) % 360;
  const satelliteAngle1 = (frame * 2.4) * (Math.PI / 180);
  const satelliteAngle2 = (frame * 1.6 + 180) * (Math.PI / 180);

  if (entrance <= 0.01) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: x,
        transform: `translate(-50%, -50%) translate(${floatX + currentX}px, ${floatY + currentY}px) scale(${entrance * scaleHand})`,
        width: size * 1.8,
        height: size * 1.8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1000,
        pointerEvents: 'none',
        zIndex: 40,
      }}
    >
      {/* 1. Brilho Atmosférico / Glow Externo */}
      <div
        style={{
          position: 'absolute',
          width: size * 1.35,
          height: size * 1.35,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${pal.glow} 0%, ${pal.atmosphere} 50%, transparent 75%)`,
          filter: 'blur(24px)',
          opacity: 0.85,
        }}
      />

      {/* 2. Anel Planetário Traseiro (atrás da esfera) */}
      {showRings && (
        <div
          style={{
            position: 'absolute',
            width: size * 1.7,
            height: size * 0.45,
            borderRadius: '50%',
            border: `6px solid ${pal.ring}`,
            boxShadow: `0 0 16px ${pal.primary}, inset 0 0 12px ${pal.primary}`,
            transform: 'rotateX(72deg) rotateY(-18deg)',
            opacity: 0.9,
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)',
            zIndex: 1,
          }}
        />
      )}

      {/* 3. Corpo Principal do Planeta (Esfera Volumétrica 3D) */}
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 32% 30%, ${pal.primary} 0%, ${pal.secondary} 45%, ${pal.dark} 85%)
          `,
          boxShadow: `
            inset -24px -24px 48px rgba(0, 0, 0, 0.95),
            inset 12px 12px 24px rgba(255, 255, 255, 0.5),
            0 0 32px ${pal.glow}
          `,
          overflow: 'hidden',
          zIndex: 2,
        }}
      >
        {/* Faixas atmosféricas orbitais do planeta */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `repeating-linear-gradient(
              -25deg,
              transparent,
              transparent 14px,
              rgba(255, 255, 255, 0.08) 14px,
              rgba(255, 255, 255, 0.08) 28px
            )`,
            opacity: 0.7,
            transform: `translateX(${Math.sin((frame / fps) * 0.8) * 20}px)`,
          }}
        />

        {/* Efeito de Reflexo Specular Apple / VisionOS */}
        <div
          style={{
            position: 'absolute',
            top: '12%',
            left: '18%',
            width: size * 0.35,
            height: size * 0.22,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.7) 0%, transparent 80%)',
            transform: 'rotate(-25deg)',
          }}
        />
      </div>

      {/* 4. Anel Planetário Frontal (na frente da esfera para oclusão 3D) */}
      {showRings && (
        <div
          style={{
            position: 'absolute',
            width: size * 1.7,
            height: size * 0.45,
            borderRadius: '50%',
            border: `6px solid ${pal.ring}`,
            boxShadow: `0 0 16px ${pal.primary}, inset 0 0 12px ${pal.primary}`,
            transform: 'rotateX(72deg) rotateY(-18deg)',
            opacity: 0.9,
            clipPath: 'polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%)',
            zIndex: 3,
          }}
        />
      )}

      {/* 5. Satélites Holográficos Orbitando */}
      {showSatellites && (
        <>
          {/* Satélite 1 (Azul / Ciano) */}
          <div
            style={{
              position: 'absolute',
              width: 22,
              height: 22,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: `0 0 14px ${pal.primary}`,
              transform: `
                translate(${Math.cos(satelliteAngle1) * (size * 0.85)}px, ${Math.sin(satelliteAngle1) * (size * 0.38)}px)
              `,
              zIndex: Math.sin(satelliteAngle1) > 0 ? 4 : 0,
            }}
          />

          {/* Satélite 2 (Ouro / Branco) */}
          <div
            style={{
              position: 'absolute',
              width: 16,
              height: 16,
              borderRadius: '50%',
              backgroundColor: '#FFE500',
              boxShadow: '0 0 12px #FFE500',
              transform: `
                translate(${Math.cos(satelliteAngle2) * (size * 0.95)}px, ${Math.sin(satelliteAngle2) * (size * 0.45)}px)
              `,
              zIndex: Math.sin(satelliteAngle2) > 0 ? 4 : 0,
            }}
          />
        </>
      )}

      {/* 6. HUD / Telemetria 3D flutuante do Planeta */}
      <div
        style={{
          position: 'absolute',
          bottom: -36,
          padding: '4px 12px',
          borderRadius: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          border: `1px solid ${pal.primary}`,
          color: pal.primary,
          fontFamily: 'monospace',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          boxShadow: `0 0 12px rgba(0, 0, 0, 0.8)`,
          zIndex: 5,
        }}
      >
        SYS.3D // ORBIT LOCKED
      </div>
    </div>
  );
};
