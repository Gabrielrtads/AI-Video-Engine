import React from 'react';
import { AbsoluteFill, Audio, Sequence, Video, Img, useVideoConfig, staticFile } from 'remotion';
import type { TimelineState, MediaClip, CaptionClip, GraphicsClip } from './types';
import { RenderRegisteredComponent } from './ComponentRegistry';
import { KineticWordCaption } from '../KineticWordCaption';

export interface TimelineCompositionProps {
  timeline: TimelineState;
}

const resolveMediaSrc = (src: string): string => {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  // Se for caminho relativo simples, usa staticFile
  try {
    return staticFile(src);
  } catch {
    return src;
  }
};

const RenderMediaClip: React.FC<{ clip: MediaClip; trackVolume?: number; muted?: boolean }> = ({
  clip,
  trackVolume = 1,
  muted = false,
}) => {
  const resolvedSrc = resolveMediaSrc(clip.src);
  const effectiveVolume = muted ? 0 : (clip.volume ?? 1) * trackVolume;

  if (clip.kind === 'video') {
    return (
      <Video
        src={resolvedSrc}
        startFrom={clip.srcInFrame ?? 0}
        volume={effectiveVolume}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
  if (clip.kind === 'audio') {
    return (
      <Audio
        src={resolvedSrc}
        startFrom={clip.srcInFrame ?? 0}
        volume={effectiveVolume}
      />
    );
  }
  if (clip.kind === 'image') {
    return (
      <Img
        src={resolvedSrc}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
  return null;
};

const RenderCaptionClip: React.FC<{ clip: CaptionClip }> = ({ clip }) => {
  const { fps } = useVideoConfig();

  // Se o clip tiver palavras sincronizadas por Whisper, usa KineticWordCaption com FPS dinâmico
  if (clip.words && clip.words.length > 0) {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
        <KineticWordCaption
          words={clip.words.map((w) => ({
            text: w.word,
            start: w.startFrame / fps,
            end: w.endFrame / fps,
          }))}
          preset={clip.motionPreset === 'karaoke' ? 'gold-glow' : 'apple-clean'}
        />
      </div>
    );
  }

  // Fallback: renderiza texto cinético com props configuráveis
  const fontSize = clip.fontSize || 54;
  const highlightColor = clip.highlightColor || '#FFD700';
  const bottomPosition = clip.bottomPosition || '22%';

  return (
    <div
      style={{
        position: 'absolute',
        bottom: bottomPosition,
        left: '6%',
        right: '6%',
        textAlign: 'center',
        color: '#FFFFFF',
        fontSize,
        fontWeight: 800,
        textShadow: '0 4px 20px rgba(0,0,0,0.85), 0 2px 4px rgba(0,0,0,0.9)',
        fontFamily: 'Inter, system-ui, sans-serif',
        letterSpacing: '-0.02em',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <span style={{ color: highlightColor }}>{clip.text}</span>
    </div>
  );
};

const RenderGraphicsClip: React.FC<{ clip: GraphicsClip }> = ({ clip }) => {
  return (
    <RenderRegisteredComponent
      componentName={clip.componentName}
      props={clip.props}
    />
  );
};

export const TimelineComposition: React.FC<TimelineCompositionProps> = ({ timeline }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', overflow: 'hidden' }}>
      {timeline.clips.map((clip) => {
        const track = timeline.tracks.find((t) => t.id === clip.trackId);
        // Respeita flag de visibilidade da track
        if (track && track.visible === false) {
          return null;
        }

        const isMuted = track ? track.muted === true : false;
        const trackVol = track?.volume ?? 1;

        return (
          <Sequence
            key={clip.id}
            from={clip.startFrame}
            durationInFrames={clip.durationInFrames}
            name={clip.name ?? `${clip.kind}_${clip.id}`}
          >
            {clip.kind === 'video' || clip.kind === 'audio' || clip.kind === 'image' ? (
              <RenderMediaClip
                clip={clip as MediaClip}
                trackVolume={trackVol}
                muted={isMuted}
              />
            ) : clip.kind === 'caption' ? (
              <RenderCaptionClip clip={clip as CaptionClip} />
            ) : clip.kind === 'graphics' ? (
              <RenderGraphicsClip clip={clip as GraphicsClip} />
            ) : null}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
