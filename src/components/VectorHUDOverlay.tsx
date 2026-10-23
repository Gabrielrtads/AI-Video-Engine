import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export interface VectorHUDOverlayProps {
  preset?: 'tactical' | 'cyber' | 'minimal-blueprint';
  accentColor?: string;
  showGrid?: boolean;
  showCrosshair?: boolean;
  showScanner?: boolean;
  showTelemetry?: boolean;
  targetCoords?: { x: number; y: number };
  label?: string;
  sublabel?: string;
}

export const VectorHUDOverlay: React.FC<VectorHUDOverlayProps> = ({
  preset = 'tactical',
  accentColor,
  showGrid = true,
  showCrosshair = true,
  showScanner = true,
  showTelemetry = true,
  targetCoords = { x: 540, y: 960 },
  label = 'SYS.REC // 4K LOG',
  sublabel = 'TARGET LOCKED',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Cores por preset caso accentColor não seja informado
  const resolvedColor =
    accentColor ||
    (preset === 'cyber'
      ? '#00F0FF'
      : preset === 'tactical'
      ? '#FF003C'
      : '#38BDF8');

  // Pulso do indicador REC
  const recBlink = Math.sin((frame / fps) * 6) > 0;

  // Scanner vertical de varredura
  const scannerY = interpolate(
    (frame % (fps * 2.5)) / (fps * 2.5),
    [0, 1],
    [100, height - 100]
  );

  // Rotação suave do retículo central
  const reticleRotation = (frame * 1.5) % 360;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        fontFamily: '"JetBrains Mono", monospace, monospace',
      }}
    >
      {/* 1. Grade Blueprint Técnica (Opcional) */}
      {showGrid && (
        <svg
          width={width}
          height={height}
          style={{ position: 'absolute', inset: 0, opacity: 0.12 }}
        >
          <defs>
            <pattern
              id="hud-grid-pattern"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke={resolvedColor}
                strokeWidth="1"
              />
              <circle cx="60" cy="0" r="1.5" fill={resolvedColor} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hud-grid-pattern)" />
        </svg>
      )}

      {/* 2. Quatro Cantoneiras Angulares (L-Brackets) */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Top-Left Bracket */}
        <path
          d="M 80 140 L 80 80 L 140 80"
          fill="none"
          stroke={resolvedColor}
          strokeWidth="3"
        />
        <circle cx="80" cy="80" r="3" fill={resolvedColor} />

        {/* Top-Right Bracket */}
        <path
          d={`M ${width - 140} 80 L ${width - 80} 80 L ${width - 80} 140`}
          fill="none"
          stroke={resolvedColor}
          strokeWidth="3"
        />
        <circle cx={width - 80} cy="80" r="3" fill={resolvedColor} />

        {/* Bottom-Left Bracket */}
        <path
          d={`M 80 ${height - 140} L 80 ${height - 80} L 140 ${height - 80}`}
          fill="none"
          stroke={resolvedColor}
          strokeWidth="3"
        />
        <circle cx="80" cy={height - 80} r="3" fill={resolvedColor} />

        {/* Bottom-Right Bracket */}
        <path
          d={`M ${width - 140} ${height - 80} L ${width - 80} ${height - 80} L ${width - 80} ${height - 140}`}
          fill="none"
          stroke={resolvedColor}
          strokeWidth="3"
        />
        <circle cx={width - 80} cy={height - 80} r="3" fill={resolvedColor} />

        {/* Régua Milimetrada Lateral Esquerda */}
        {Array.from({ length: 15 }).map((_, i) => {
          const yPos = 240 + i * 40;
          const isMajor = i % 5 === 0;
          return (
            <g key={`ruler-left-${i}`}>
              <line
                x1={80}
                y1={yPos}
                x2={isMajor ? 104 : 92}
                y2={yPos}
                stroke={resolvedColor}
                strokeWidth={isMajor ? 2 : 1}
                opacity={0.6}
              />
              {isMajor && (
                <text
                  x={112}
                  y={yPos + 4}
                  fill={resolvedColor}
                  fontSize="10"
                  opacity={0.7}
                >
                  {String((i + 1) * 10).padStart(3, '0')}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* 3. Retículo de Mira Central / Alvo com Rotação Tática */}
      {showCrosshair && (
        <div
          style={{
            position: 'absolute',
            left: targetCoords.x,
            top: targetCoords.y,
            transform: 'translate(-50%, -50%)',
            width: 140,
            height: 140,
          }}
        >
          {/* Anel Externo Giratório */}
          <svg
            width="140"
            height="140"
            style={{
              position: 'absolute',
              transform: `rotate(${reticleRotation}deg)`,
            }}
          >
            <circle
              cx="70"
              cy="70"
              r="58"
              fill="none"
              stroke={resolvedColor}
              strokeWidth="1.5"
              strokeDasharray="14 10 2 10"
              opacity={0.7}
            />
          </svg>

          {/* Anel Interno Fixo com Marcadores de Cruz */}
          <svg width="140" height="140" style={{ position: 'absolute' }}>
            <circle
              cx="70"
              cy="70"
              r="24"
              fill="none"
              stroke={resolvedColor}
              strokeWidth="2"
            />
            <line
              x1="70"
              y1="34"
              x2="70"
              y2="46"
              stroke={resolvedColor}
              strokeWidth="2"
            />
            <line
              x1="70"
              y1="94"
              x2="70"
              y2="106"
              stroke={resolvedColor}
              strokeWidth="2"
            />
            <line
              x1="34"
              y1="70"
              x2="46"
              y2="70"
              stroke={resolvedColor}
              strokeWidth="2"
            />
            <line
              x1="94"
              y1="70"
              x2="106"
              y2="70"
              stroke={resolvedColor}
              strokeWidth="2"
            />
            <circle cx="70" cy="70" r="3" fill={resolvedColor} />
          </svg>

          {/* Tag de Coordenadas Flutuantes ao lado do Alvo */}
          <div
            style={{
              position: 'absolute',
              left: 148,
              top: 54,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              border: `1px solid ${resolvedColor}`,
              padding: '4px 8px',
              borderRadius: 3,
              fontSize: 10,
              color: resolvedColor,
              whiteSpace: 'nowrap',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div>X: {targetCoords.x} Y: {targetCoords.y}</div>
            <div style={{ opacity: 0.7 }}>{sublabel}</div>
          </div>
        </div>
      )}

      {/* 4. Scanner de Varredura Laser Horizontal */}
      {showScanner && (
        <div
          style={{
            position: 'absolute',
            left: 80,
            right: 80,
            top: scannerY,
            height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${resolvedColor} 50%, transparent 100%)`,
            boxShadow: `0 0 16px ${resolvedColor}`,
            opacity: 0.85,
          }}
        />
      )}

      {/* 5. Telemetria e Badges Superiores/Inferiores */}
      {showTelemetry && (
        <>
          {/* Header Superior Esquerdo */}
          <div
            style={{
              position: 'absolute',
              top: 92,
              left: 160,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: recBlink ? resolvedColor : 'transparent',
                border: `1.5px solid ${resolvedColor}`,
                boxShadow: recBlink ? `0 0 10px ${resolvedColor}` : 'none',
              }}
            />
            <div>{label}</div>
          </div>

          {/* Header Superior Direito (FPS e Timecode) */}
          <div
            style={{
              position: 'absolute',
              top: 92,
              right: 160,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 11,
              letterSpacing: '0.05em',
            }}
          >
            <div>FPS: {fps}</div>
            <div>FRAME: {String(frame).padStart(5, '0')}</div>
          </div>

          {/* Rodapé Inferior */}
          <div
            style={{
              position: 'absolute',
              bottom: 92,
              left: 160,
              right: 160,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 10,
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: 8,
            }}
          >
            <div>VIBE HUD ENGINE // ACTIVE</div>
            <div>STATUS: OPTIMAL</div>
          </div>
        </>
      )}
    </div>
  );
};
