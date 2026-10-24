import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface AppleKineticCard3DProps {
  title: string;
  subtitle?: string;
  badge?: string;
  metric?: string;
  metricLabel?: string;
  width?: number;
  height?: number;
  variant?: 'dark-glass' | 'white-frosted' | 'gold-titanium';
  tiltIntensity?: number;
  delayFrames?: number;
  showSheen?: boolean;
  children?: React.ReactNode;
}

export const AppleKineticCard3D: React.FC<AppleKineticCard3DProps> = ({
  title,
  subtitle,
  badge = 'APPLE KINETIC',
  metric,
  metricLabel,
  width = 540,
  height = 340,
  variant = 'dark-glass',
  tiltIntensity = 1,
  delayFrames = 0,
  showSheen = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delayFrames);

  // Entrance spring animation
  const entranceProgress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 13, stiffness: 110, mass: 0.8 },
  });

  // Micro tilt 3D orgânico contínuo
  const tiltX = Math.sin((adjustedFrame / fps) * 1.5) * 4 * tiltIntensity;
  const tiltY = Math.cos((adjustedFrame / fps) * 1.2) * 6 * tiltIntensity;
  const floatY = Math.sin((adjustedFrame / fps) * 2.2) * 8;

  // Sheen light sweep passando pela superfície da placa de vidro
  const sheenProgress = interpolate(
    (adjustedFrame % (fps * 3.5)) / (fps * 3.5),
    [0, 1],
    [-120, 220]
  );

  // Estilos baseados na variante selecionada
  const getVariantStyles = () => {
    switch (variant) {
      case 'white-frosted':
        return {
          background: 'rgba(255, 255, 255, 0.82)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.6)',
          textColor: '#09090B',
          subtextColor: '#52525B',
          badgeBg: 'rgba(0, 0, 0, 0.06)',
          badgeColor: '#18181B',
          glow: 'rgba(255, 255, 255, 0.4)',
        };
      case 'gold-titanium':
        return {
          background: 'linear-gradient(135deg, rgba(30, 26, 20, 0.85) 0%, rgba(18, 15, 12, 0.95) 100%)',
          border: '1px solid rgba(255, 215, 0, 0.35)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 215, 0, 0.12)',
          textColor: '#FFFDF5',
          subtextColor: 'rgba(255, 245, 220, 0.65)',
          badgeBg: 'rgba(255, 215, 0, 0.12)',
          badgeColor: '#FFD700',
          glow: 'rgba(255, 215, 0, 0.25)',
        };
      case 'dark-glass':
      default:
        return {
          background: 'linear-gradient(135deg, rgba(25, 28, 38, 0.75) 0%, rgba(12, 14, 20, 0.85) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
          textColor: '#FFFFFF',
          subtextColor: 'rgba(255, 255, 255, 0.6)',
          badgeBg: 'rgba(255, 255, 255, 0.08)',
          badgeColor: '#E2E8F0',
          glow: 'rgba(99, 102, 241, 0.2)',
        };
    }
  };

  const vStyle = getVariantStyles();

  return (
    <div
      style={{
        perspective: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          width,
          height,
          borderRadius: 32,
          background: vStyle.background,
          border: vStyle.border,
          boxShadow: vStyle.boxShadow,
          backdropFilter: 'blur(28px)',
          overflow: 'hidden',
          padding: '36px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transform: `
            scale(${entranceProgress})
            translateY(${floatY}px)
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
          `,
          transformStyle: 'preserve-3d',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top Header: Badge Pill & Status Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
          }}
        >
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              backgroundColor: vStyle.badgeBg,
              color: vStyle.badgeColor,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: badge === '' ? 'none' : 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: vStyle.badgeColor,
                boxShadow: `0 0 8px ${vStyle.badgeColor}`,
              }}
            />
            {badge}
          </div>

          <div
            style={{
              fontSize: 18,
              opacity: 0.5,
              color: vStyle.textColor,
            }}
          >
            
          </div>
        </div>

        {/* Center: Main Content or Custom Children */}
        {children || (
          <div style={{ zIndex: 2, marginTop: 16 }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: vStyle.textColor,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                marginBottom: 10,
              }}
            >
              {title}
            </div>

            {subtitle && (
              <div
                style={{
                  fontSize: 16,
                  color: vStyle.subtextColor,
                  lineHeight: 1.45,
                  maxWidth: '90%',
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        )}

        {/* Bottom Metric / Footer */}
        {metric && (
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 12,
              zIndex: 2,
              marginTop: 12,
            }}
          >
            <div
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: vStyle.textColor,
                letterSpacing: '-0.04em',
              }}
            >
              {metric}
            </div>
            {metricLabel && (
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: vStyle.subtextColor,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {metricLabel}
              </div>
            )}
          </div>
        )}

        {/* Dynamic Sheen Light Sweep Effect */}
        {showSheen && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${sheenProgress}%`,
              width: '50%',
              height: '100%',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.12) 50%, transparent 100%)',
              transform: 'skewX(-28deg)',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />
        )}
      </div>
    </div>
  );
};
