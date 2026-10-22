import React, { useState, useEffect } from 'react';
import type { TimelineState, TimelineViewState } from './types';
import { TimelineRuler } from './TimelineRuler';
import { TrackLane } from './TrackLane';
import { frameToPixel, formatFrameToTimestamp } from './timelineMath';

interface TimelineViewerProps {
  timeline: TimelineState;
  onSeek?: (frame: number) => void;
  onSelectClip?: (clipId: string) => void;
}

export const TimelineViewer: React.FC<TimelineViewerProps> = ({
  timeline,
  onSeek,
  onSelectClip,
}) => {
  const [viewState, setViewState] = useState<TimelineViewState>({
    pixelsPerFrame: 2.0,
    scrollLeft: 0,
    snapTolerancePixels: 8,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>(timeline.selectedClipIds ?? []);

  // Sincroniza seleção externa vinda da timeline
  useEffect(() => {
    setSelectedIds(timeline.selectedClipIds ?? []);
  }, [timeline.selectedClipIds]);

  const handleSeek = (f: number) => {
    onSeek?.(f);
  };

  const handleSelect = (clipId: string) => {
    setSelectedIds([clipId]);
    onSelectClip?.(clipId);
  };

  const timelineWidth = Math.ceil(timeline.durationInFrames * viewState.pixelsPerFrame);
  const playheadX = frameToPixel(timeline.currentFrame, viewState.pixelsPerFrame) + 140;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0A0B0E',
        color: '#ECEFF4',
        borderTop: '1px solid #1E222D',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Toolbar superior com zoom e timecode */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 14px',
          backgroundColor: '#12141A',
          borderBottom: '1px solid #1E222D',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, color: '#FFFFFF' }}>
            VIBE TIMELINE
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 12,
              padding: '2px 6px',
              backgroundColor: '#1A1D26',
              borderRadius: 4,
              color: '#88C0D0',
            }}
          >
            {formatFrameToTimestamp(timeline.currentFrame, timeline.fps)} /{' '}
            {formatFrameToTimestamp(timeline.durationInFrames, timeline.fps)}
          </span>
        </div>

        {/* Controles de Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#8A94A6' }}>Zoom:</span>
          <button
            onClick={() =>
              setViewState((v) => ({ ...v, pixelsPerFrame: Math.max(0.5, v.pixelsPerFrame - 0.5) }))
            }
            style={{
              padding: '2px 8px',
              backgroundColor: '#1F2330',
              border: '1px solid #2E3440',
              color: '#ECEFF4',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            -
          </button>
          <span style={{ fontSize: 11, minWidth: 32, textAlign: 'center' }}>
            {viewState.pixelsPerFrame.toFixed(1)}x
          </span>
          <button
            onClick={() =>
              setViewState((v) => ({ ...v, pixelsPerFrame: Math.min(8.0, v.pixelsPerFrame + 0.5) }))
            }
            style={{
              padding: '2px 8px',
              backgroundColor: '#1F2330',
              border: '1px solid #2E3440',
              color: '#ECEFF4',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Área da Timeline com Rolagem Horizontal Sincronizada */}
      <div
        style={{
          position: 'relative',
          overflowX: 'auto',
          maxHeight: 280,
          backgroundColor: '#0D0E12',
        }}
      >
        {/* Agulha de Playhead */}
        <div
          style={{
            position: 'absolute',
            left: playheadX,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: '#FF3B30',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: -5,
              width: 12,
              height: 12,
              backgroundColor: '#FF3B30',
              borderRadius: '50%',
            }}
          />
        </div>

        {/* Régua de Tempo */}
        <div style={{ display: 'flex', width: 140 + timelineWidth }}>
          <div
            style={{
              width: 140,
              flexShrink: 0,
              backgroundColor: '#15171E',
              borderRight: '1px solid #232733',
            }}
          />
          <TimelineRuler
            totalFrames={timeline.durationInFrames}
            fps={timeline.fps}
            pixelsPerFrame={viewState.pixelsPerFrame}
            onSeek={handleSeek}
          />
        </div>

        {/* Faixas da Timeline (Tracks) */}
        {timeline.tracks.map((track) => {
          const trackClips = timeline.clips.filter((c) => c.trackId === track.id);
          return (
            <TrackLane
              key={track.id}
              track={track}
              clips={trackClips}
              pixelsPerFrame={viewState.pixelsPerFrame}
              timelineWidth={timelineWidth}
              selectedClipIds={selectedIds}
              onSelectClip={handleSelect}
            />
          );
        })}
      </div>
    </div>
  );
};
