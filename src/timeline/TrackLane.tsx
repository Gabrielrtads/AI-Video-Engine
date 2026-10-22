import React from 'react';
import type { TrackItem, ClipItem } from './types';
import { frameToPixel } from './timelineMath';

interface TrackLaneProps {
  track: TrackItem;
  clips: ClipItem[];
  pixelsPerFrame: number;
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
  selectedClipIds,
  onSelectClip,
}) => {
  const color = TRACK_COLORS[track.kind] ?? TRACK_COLORS.video;

  return (
    <div
      style={{
        display: 'flex',
        height: 48,
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
        <span style={{ fontSize: 10, color: color.text, textTransform: 'uppercase' }}>
          {track.kind}
        </span>
      </div>

      {/* Track Clips Container */}
      <div style={{ position: 'relative', flexGrow: 1, overflow: 'hidden' }}>
        {clips.map((clip) => {
          const left = frameToPixel(clip.startFrame, pixelsPerFrame);
          const width = frameToPixel(clip.durationInFrames, pixelsPerFrame);
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
                width: Math.max(width, 4),
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
