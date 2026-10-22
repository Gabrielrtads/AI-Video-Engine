import React from 'react';
import { AbsoluteFill, Audio, Sequence, Video, Img, useVideoConfig } from 'remotion';
import type { TimelineState, MediaClip, CaptionClip, GraphicsClip } from './types';
import { KineticWordCaption } from '../KineticWordCaption';
import { FlowMotionMaster } from '../FlowMotionMaster';
import { CarrosselEditorial } from '../CarrosselEditorial';

export interface TimelineCompositionProps {
  timeline: TimelineState;
}

const RenderMediaClip: React.FC<{ clip: MediaClip; muted?: boolean }> = ({ clip, muted }) => {
  if (clip.kind === 'video') {
    return (
      <Video
        src={clip.src}
        startFrom={clip.srcInFrame ?? 0}
        volume={muted ? 0 : clip.volume ?? 1}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
  if (clip.kind === 'audio') {
    return <Audio src={clip.src} startFrom={clip.srcInFrame ?? 0} volume={muted ? 0 : clip.volume ?? 1} />;
  }
  if (clip.kind === 'image') {
    return <Img src={clip.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  return null;
};

const RenderCaptionClip: React.FC<{ clip: CaptionClip }> = ({ clip }) => {
  const { fps } = useVideoConfig();

  // Se o clip tiver palavras sincronizadas por Whisper, usa KineticWordCaption com FPS dinâmico
  if (clip.words && clip.words.length > 0) {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
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

const RenderGraphicsClip: React.FC<{ clip: GraphicsClip }> = ({ clip }) => {
  if (clip.componentName === 'CarrosselEditorial') {
    return <CarrosselEditorial />;
  }
  if (clip.componentName === 'FlowMotionMaster') {
    return <FlowMotionMaster />;
  }
  return null;
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

        return (
          <Sequence
            key={clip.id}
            from={clip.startFrame}
            durationInFrames={clip.durationInFrames}
            name={clip.name ?? `${clip.kind}_${clip.id}`}
          >
            {clip.kind === 'video' || clip.kind === 'audio' || clip.kind === 'image' ? (
              <RenderMediaClip clip={clip as MediaClip} muted={isMuted} />
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
