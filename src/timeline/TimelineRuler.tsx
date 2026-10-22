import React from 'react';
import { frameToPixel, formatFrameToTimestamp } from './timelineMath';

interface TimelineRulerProps {
  totalFrames: number;
  fps: number;
  pixelsPerFrame: number;
  onSeek: (frame: number) => void;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  totalFrames,
  fps,
  pixelsPerFrame,
  onSeek,
}) => {
  const widthPx = frameToPixel(totalFrames, pixelsPerFrame);

  // Nível de Detalhe Adaptativo (LOD): evita estouro de DOM em timelines longas com zoom baixo
  let stepFrames = fps;
  if (pixelsPerFrame > 4) {
    stepFrames = Math.max(1, Math.round(fps / 2)); // 0.5s
  } else if (pixelsPerFrame < 0.3) {
    stepFrames = fps * 10; // 10s
  } else if (pixelsPerFrame < 0.8) {
    stepFrames = fps * 5; // 5s
  }

  const markers: number[] = [];
  for (let f = 0; f <= totalFrames; f += stepFrames) {
    markers.push(f);
  }

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetFrame = Math.max(0, Math.min(totalFrames, Math.round(clickX / pixelsPerFrame)));
    onSeek(targetFrame);
  };

  return (
    <div
      onClick={handleRulerClick}
      style={{
        position: 'relative',
        height: 28,
        width: widthPx,
        backgroundColor: '#12141A',
        borderBottom: '1px solid #232733',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {markers.map((f) => {
        const left = frameToPixel(f, pixelsPerFrame);
        const isMajor = f % (fps * 5) === 0;
        return (
          <div
            key={f}
            style={{
              position: 'absolute',
              left,
              top: 0,
              height: isMajor ? 16 : 8,
              width: 1,
              backgroundColor: isMajor ? '#7A839E' : '#393E52',
            }}
          >
            {isMajor && (
              <span
                style={{
                  position: 'absolute',
                  left: 4,
                  top: 2,
                  fontSize: 10,
                  color: '#8A94A6',
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatFrameToTimestamp(f, fps)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
