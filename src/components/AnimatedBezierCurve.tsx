import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface CurvePoint {
  x: number;
  y: number;
  label?: string;
  value?: string | number;
}

export interface AnimatedBezierCurveProps {
  points?: CurvePoint[];
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillGradient?: boolean;
  gradientStartColor?: string;
  gradientEndColor?: string;
  showPoints?: boolean;
  showGridLines?: boolean;
  drawDurationFrames?: number;
  delayFrames?: number;
}

export const AnimatedBezierCurve: React.FC<AnimatedBezierCurveProps> = ({
  points = [
    { x: 40, y: 320, label: '01', value: '$12k' },
    { x: 140, y: 260, label: '02', value: '$24k' },
    { x: 260, y: 290, label: '03', value: '$38k' },
    { x: 380, y: 160, label: '04', value: '$65k' },
    { x: 500, y: 90, label: '05', value: '$98k' },
    { x: 620, y: 40, label: '06', value: '$142k' },
  ],
  width = 680,
  height = 380,
  strokeColor = '#10B981',
  strokeWidth = 4,
  fillGradient = true,
  gradientStartColor,
  gradientEndColor = 'rgba(16, 185, 129, 0)',
  showPoints = true,
  showGridLines = true,
  drawDurationFrames = 60,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delayFrames);

  // Progresso do traçado animado (0 a 1)
  const drawProgress = interpolate(
    adjustedFrame,
    [0, drawDurationFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Easing suave na entrada
  const easedProgress =
    drawProgress < 0.5
      ? 2 * drawProgress * drawProgress
      : 1 - Math.pow(-2 * drawProgress + 2, 2) / 2;

  // Constrói caminho Bezier suave (Catmull-Rom para Bezier cúbico)
  const buildSmoothPath = (pts: CurvePoint[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(points);

  // Caminho fechado para a área de gradiente sob a curva
  const lastPt = points[points.length - 1];
  const firstPt = points[0];
  const areaPath = `${linePath} L ${lastPt.x} ${height - 20} L ${firstPt.x} ${height - 20} Z`;

  // Comprimento aproximado da curva para stroke-dashoffset
  const estimatedPathLength = 1200;
  const strokeDashoffset = estimatedPathLength * (1 - easedProgress);

  const startGradColor = gradientStartColor || `${strokeColor}44`;

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ overflow: 'visible', filter: `drop-shadow(0 8px 24px ${strokeColor}33)` }}
      >
        <defs>
          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={startGradColor} />
            <stop offset="100%" stopColor={gradientEndColor} />
          </linearGradient>
        </defs>

        {/* Linhas de Grade Horizontais */}
        {showGridLines &&
          [0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
            const y = (height - 40) * ratio + 20;
            return (
              <line
                key={`grid-${idx}`}
                x1={20}
                y1={y}
                x2={width - 20}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="4 6"
                strokeWidth={1}
              />
            );
          })}

        {/* Área Sombreada com Gradiente Luminoso */}
        {fillGradient && (
          <path
            d={areaPath}
            fill="url(#curveGradient)"
            opacity={interpolate(easedProgress, [0, 0.5, 1], [0, 0.5, 1])}
          />
        )}

        {/* Curva Bezier Animada */}
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={estimatedPathLength}
          strokeDashoffset={strokeDashoffset}
        />

        {/* Pontos de Ancoragem e Pulso de Radar */}
        {showPoints &&
          points.map((pt, idx) => {
            const pointThreshold = (idx + 1) / points.length;
            if (easedProgress < pointThreshold * 0.85) return null;

            const pointAge = adjustedFrame - (drawDurationFrames * pointThreshold * 0.85);
            const pointSpring = spring({
              frame: Math.max(0, pointAge),
              fps,
              config: { damping: 12, stiffness: 200 },
            });

            const pulseRing = (adjustedFrame % 45) / 45;

            return (
              <g key={`pt-${idx}`}>
                {/* Radar Pulse no Ponto Ativo Final */}
                {idx === points.length - 1 && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={6 + pulseRing * 18}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={1.5}
                    opacity={1 - pulseRing}
                  />
                )}

                {/* Círculo de Ancoragem com Borda Metálica */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={5 * pointSpring}
                  fill="#0D1117"
                  stroke={strokeColor}
                  strokeWidth={2.5}
                />

                {/* Badge Flutuante de Valor */}
                {pt.value && (
                  <g
                    transform={`translate(${pt.x}, ${pt.y - 18}) scale(${pointSpring})`}
                    style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                  >
                    <rect
                      x={-28}
                      y={-18}
                      width={56}
                      height={20}
                      rx={6}
                      fill="rgba(13, 17, 23, 0.85)"
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth={1}
                    />
                    <text
                      x={0}
                      y={-4}
                      fill="#FFFFFF"
                      fontSize={10}
                      fontWeight={700}
                      textAnchor="middle"
                    >
                      {pt.value}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
      </svg>
    </div>
  );
};
