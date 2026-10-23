import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface MacCursorWaypoint {
  frame: number;
  x: number;
  y: number;
  clickFrame?: number;
  actionLabel?: string;
}

export interface InteractiveMacCursorProps {
  waypoints: MacCursorWaypoint[];
  visibleStartFrame?: number;
  visibleEndFrame?: number;
  pointerType?: 'arrow' | 'hand';
  showRipple?: boolean;
  rippleColor?: string;
  size?: number;
}

export const InteractiveMacCursor: React.FC<InteractiveMacCursorProps> = ({
  waypoints,
  visibleStartFrame = 0,
  visibleEndFrame = 9999,
  pointerType = 'arrow',
  showRipple = true,
  rippleColor = 'rgba(56, 189, 248, 0.7)',
  size = 28,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < visibleStartFrame || frame > visibleEndFrame || waypoints.length === 0) {
    return null;
  }

  let currentX = waypoints[0].x;
  let currentY = waypoints[0].y;
  let currentActionLabel: string | undefined = undefined;

  if (frame <= waypoints[0].frame) {
    currentX = waypoints[0].x;
    currentY = waypoints[0].y;
    currentActionLabel = waypoints[0].actionLabel;
  } else if (frame >= waypoints[waypoints.length - 1].frame) {
    const last = waypoints[waypoints.length - 1];
    currentX = last.x;
    currentY = last.y;
    currentActionLabel = last.actionLabel;
  } else {
    // Localiza segmento ativo
    let segIdx = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      if (frame >= waypoints[i].frame && frame <= waypoints[i + 1].frame) {
        segIdx = i;
        break;
      }
    }

    const p1 = waypoints[segIdx];
    const p2 = waypoints[segIdx + 1];

    const segmentProgress = interpolate(frame, [p1.frame, p2.frame], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    // Human motion easing (aceleração e desaceleração orgânica)
    const smoothProgress =
      segmentProgress < 0.5
        ? 4 * segmentProgress * segmentProgress * segmentProgress
        : 1 - Math.pow(-2 * segmentProgress + 2, 3) / 2;

    currentX = p1.x + (p2.x - p1.x) * smoothProgress;
    currentY = p1.y + (p2.y - p1.y) * smoothProgress;
    currentActionLabel = smoothProgress > 0.6 ? p2.actionLabel : p1.actionLabel;
  }

  // Detecção de Clique e Efeito Click Ripple
  let isClicking = false;
  let clickProgress = 0;
  let activeClickFrame = -1;

  for (const wp of waypoints) {
    if (wp.clickFrame !== undefined && frame >= wp.clickFrame && frame <= wp.clickFrame + 18) {
      isClicking = true;
      activeClickFrame = wp.clickFrame;
      const clickAge = frame - wp.clickFrame;
      clickProgress = spring({
        frame: clickAge,
        fps,
        config: { damping: 14, stiffness: 220 },
      });
      break;
    }
  }

  const cursorScale = isClicking
    ? interpolate(clickProgress, [0, 0.4, 1], [1.0, 0.84, 1.0])
    : 1.0;

  // Ripple de expansão circular
  const rippleRadius = isClicking ? interpolate(clickProgress, [0, 1], [4, 38]) : 0;
  const rippleOpacity = isClicking ? interpolate(clickProgress, [0, 0.8, 1], [0.9, 0.4, 0]) : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: currentX,
        top: currentY,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: `scale(${cursorScale})`,
        transformOrigin: '0 0',
      }}
    >
      {/* Click Ripple Effect */}
      {showRipple && isClicking && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: rippleRadius * 2,
            height: rippleRadius * 2,
            borderRadius: '50%',
            backgroundColor: rippleColor,
            border: `1.5px solid ${rippleColor}`,
            transform: 'translate(-50%, -50%)',
            opacity: rippleOpacity,
            boxShadow: `0 0 16px ${rippleColor}`,
          }}
        />
      )}

      {/* Vetor do Cursor macOS (Pixel-Perfect Sonoma/Sequoia) */}
      <svg
        width={size}
        height={size * 1.3}
        viewBox="0 0 24 32"
        style={{
          filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.45)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
        }}
      >
        {pointerType === 'arrow' ? (
          <path
            d="M 1 1 L 1 24 L 6.5 19 L 11 29 L 14.5 27.5 L 10 17.5 L 17 17.5 Z"
            fill="#FFFFFF"
            stroke="#1C1C1E"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        ) : (
          /* Hand Pointer Pointer */
          <path
            d="M 10 2 C 8.5 2 7.5 3.2 7.5 4.8 L 7.5 14 L 6.5 14 C 5 14 3.8 15.2 3.8 16.8 L 3.8 20 C 3.8 25 8 29 13.5 29 C 19 29 22.5 25 22.5 19.5 L 22.5 11.5 C 22.5 10 21.2 8.8 19.8 8.8 C 19.2 8.8 18.5 9 18 9.5 L 18 8.8 C 18 7.2 16.8 6 15.2 6 C 14.8 6 14.2 6.2 13.8 6.5 L 13.8 4.8 C 13.8 3.2 12.6 2 11 2 Z"
            fill="#FFFFFF"
            stroke="#1C1C1E"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        )}
      </svg>

      {/* Action Tag Flutuante (Opcional, estilo Figma/Multiplayer) */}
      {currentActionLabel && (
        <div
          style={{
            position: 'absolute',
            left: 20,
            top: 20,
            backgroundColor: '#0F172A',
            color: '#F8FAFC',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 6,
            padding: '3px 8px',
            fontSize: 10,
            fontWeight: 600,
            fontFamily: 'Inter, system-ui, sans-serif',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {currentActionLabel}
        </div>
      )}
    </div>
  );
};
