import React from 'react';
import type { TrackItem, ClipItem } from './types';

interface TrackLaneProps {
  track: TrackItem;
  clips: ClipItem[];
  pixelsPerFrame: number;
  timelineWidth: number;
  selectedClipIds: string[];
  onSelectClip: (clipId: string) => void;
}

const TRACK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  video: { bg: '#1C2942', border: '#2C4A75', text: '#7FB2FF' },
  audio: { bg: '#163328', border: '#215A42', text: '#5CE6A4' },
  caption: { bg: '#382816', border: '#66451B', text: '#FFB85C' },
  graphics: { bg: '#361C3D', border: '#5E2B6B', text: '#E573FF' },
};

export const TrackLane: React.FC<TrackLaneProps> = ({
  track,
  clips,
  pixelsPerFrame,
  timelineWidth,
  selectedClipIds,
  onSelectClip,
}) => {
  const color = TRACK_COLORS[track.kind] ?? TRACK_COLORS.video;

  return (
    <div
      style={{
        display: 'flex',
        height: 48,
        width: 140 + timelineWidth,
        borderBottom: '1px solid #1E222D',
        backgroundColor: '#0D0E12',
      }}
    >
      {/* Track Header / Name */}
      <div
        style={{
          width: 140,
          flexShrink: 0,
          backgroundColor: '#15171E',
          borderRight: '1px solid #232733',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#D8DEE9' }}>{track.name}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: color.text, textTransform: 'uppercase' }}>
            {track.kind}
          </span>
          {track.muted && (
            <span style={{ fontSize: 9, color: '#EBCB8B', backgroundColor: '#3B321D', padding: '1px 3px', borderRadius: 2 }}>
              MUTED
            </span>
          )}
          {track.visible === false && (
            <span style={{ fontSize: 9, color: '#BF616A', backgroundColor: '#3D1D24', padding: '1px 3px', borderRadius: 2 }}>
              HIDDEN
            </span>
          )}
        </div>
      </div>

      {/* Track Clips Container (com largura exatamente alinhada à régua) */}
      <div style={{ position: 'relative', width: timelineWidth, flexShrink: 0, overflow: 'hidden' }}>
        {clips.map((clip) => {
          // Cálculo preciso de borda esquerda e direita para evitar gaps de arredondamento
          const left = Math.round(clip.startFrame * pixelsPerFrame);
          const right = Math.round((clip.startFrame + clip.durationInFrames) * pixelsPerFrame);
          const width = Math.max(2, right - left);
          const isSelected = selectedClipIds.includes(clip.id);

          return (
            <div
              key={clip.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectClip(clip.id);
              }}
              style={{
                position: 'absolute',
                left,
                top: 4,
                width,
                height: 40,
                backgroundColor: color.bg,
                border: `1px solid ${isSelected ? '#FFFFFF' : color.border}`,
                borderRadius: 4,
                padding: '4px 8px',
                cursor: 'pointer',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                userSelect: 'none',
                boxShadow: isSelected ? '0 0 0 2px rgba(255,255,255,0.4)' : 'none',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 500, color: '#ECEFF4' }}>
                {clip.name ?? clip.id}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
