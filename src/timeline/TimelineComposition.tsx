import React from 'react';
import { AbsoluteFill, Audio, Sequence, Video, Img } from 'remotion';
import type { TimelineState, ClipItem, MediaClip, CaptionClip, GraphicsClip } from './types';
import { KineticWordCaption } from '../KineticWordCaption';

export interface TimelineCompositionProps {
  timeline: TimelineState;
}

const RenderMediaClip: React.FC<{ clip: MediaClip }> = ({ clip }) => {
  if (clip.kind === 'video') {
    return (
      <Video
        src={clip.src}
        startFrom={clip.srcInFrame ?? 0}
        volume={clip.volume ?? 1}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
  if (clip.kind === 'audio') {
    return <Audio src={clip.src} startFrom={clip.srcInFrame ?? 0} volume={clip.volume ?? 1} />;
  }
  if (clip.kind === 'image') {
    return <Img src={clip.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  return null;
};

const RenderCaptionClip: React.FC<{ clip: CaptionClip }> = ({ clip }) => {
  // Se o clip tiver palavras sincronizadas por Whisper, usa KineticWordCaption
  if (clip.words && clip.words.length > 0) {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <KineticWordCaption
          words={clip.words.map((w) => ({
            text: w.word,
            start: w.startFrame / 30,
            end: w.endFrame / 30,
          }))}
          preset={clip.motionPreset === 'karaoke' ? 'gold-glow' : 'apple-clean'}
        />
      </div>
    );
  }

  // Fallback: renderiza texto cinético simples
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '22%',
        left: '5%',
        right: '5%',
        textAlign: 'center',
        color: '#FFFFFF',
        fontSize: 54,
        fontWeight: 800,
        textShadow: '0 4px 16px rgba(0,0,0,0.8)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {clip.text}
    </div>
  );
};

export const TimelineComposition: React.FC<TimelineCompositionProps> = ({ timeline }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#060709', overflow: 'hidden' }}>
      {timeline.clips.map((clip) => {
        return (
          <Sequence
            key={clip.id}
            from={clip.startFrame}
            durationInFrames={clip.durationInFrames}
            name={clip.name ?? `${clip.kind}_${clip.id}`}
          >
            {clip.kind === 'video' || clip.kind === 'audio' || clip.kind === 'image' ? (
              <RenderMediaClip clip={clip as MediaClip} />
            ) : clip.kind === 'caption' ? (
              <RenderCaptionClip clip={clip as CaptionClip} />
            ) : null}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
