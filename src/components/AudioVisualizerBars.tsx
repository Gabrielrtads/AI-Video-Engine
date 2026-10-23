import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export interface AudioVisualizerBarsProps {
  barCount?: number;
  width?: number;
  height?: number;
  barWidth?: number;
  barGap?: number;
  gradientColors?: string[];
  glow?: boolean;
  speed?: number;
  customAmplitudes?: number[];
  variant?: 'equalizer' | 'wave' | 'mirrored';
}

export const AudioVisualizerBars: React.FC<AudioVisualizerBarsProps> = ({
  barCount = 24,
  width = 480,
  height = 120,
  barWidth = 6,
  barGap = 4,
  gradientColors = ['#6366F1', '#38BDF8', '#10B981'],
  glow = true,
  speed = 1.0,
  customAmplitudes,
  variant = 'equalizer',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const primaryColor = gradientColors[0] || '#6366F1';
  const secondaryColor = gradientColors[1] || '#38BDF8';

  // Gera alturas harmônicas pseudo-aleatórias baseadas em senoides combinadas
  const getBarHeight = (idx: number): number => {
    if (customAmplitudes && customAmplitudes[idx] !== undefined) {
      return customAmplitudes[idx] * height;
    }

    const t = (frame / fps) * 8 * speed;
    const wave1 = Math.sin(t + idx * 0.45);
    const wave2 = Math.cos(t * 1.3 + idx * 0.25);
    const wave3 = Math.sin(t * 0.7 - idx * 0.6);

    const combined = (wave1 + wave2 + wave3 + 3) / 6; // 0.0 a 1.0
    // Curvatura em U invertido para simular curva espectral real (graves e médios mais altos que agudos)
    const spectralWeight = 1 - Math.pow((idx - barCount * 0.35) / (barCount * 0.7), 2);
    const normalizedWeight = Math.max(0.15, spectralWeight);

    return Math.max(6, combined * normalizedWeight * height);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: variant === 'mirrored' ? 'center' : 'flex-end',
        justifyContent: 'center',
        gap: barGap,
        width,
        height,
        position: 'relative',
        filter: glow ? `drop-shadow(0 0 12px ${primaryColor}55)` : 'none',
      }}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        const bHeight = getBarHeight(i);
        const colorRatio = i / (barCount - 1);

        return (
          <div
            key={`bar-${i}`}
            style={{
              width: barWidth,
              height: bHeight,
              borderRadius: barWidth / 2,
              background: `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              opacity: interpolate(bHeight, [6, height], [0.35, 1]),
              transition: 'height 0.05s ease-out',
            }}
          />
        );
      })}
    </div>
  );
};
