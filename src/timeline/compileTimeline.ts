import type { TimelineState, TrackItem, ClipItem, MediaClip, CaptionClip, GraphicsClip } from './types';
import { assertValidTimeline } from './timelineMath.ts';

export interface TimelineValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validador estrito da estrutura declarativa da Linha do Tempo.
 */
export function validateTimelineSchema(input: unknown): TimelineValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['O payload da timeline deve ser um objeto JSON válido.'] };
  }

  const tl = input as Partial<TimelineState>;

  if (typeof tl.fps !== 'number' || tl.fps <= 0 || !Number.isFinite(tl.fps)) {
    errors.push('Campo "fps" precisa ser um número finito positivo (ex: 30, 60).');
  }

  if (typeof tl.width !== 'number' || tl.width <= 0) {
    errors.push('Campo "width" precisa ser um número positivo.');
  }

  if (typeof tl.height !== 'number' || tl.height <= 0) {
    errors.push('Campo "height" precisa ser um número positivo.');
  }

  if (typeof tl.durationInFrames !== 'number' || tl.durationInFrames <= 0) {
    errors.push('Campo "durationInFrames" precisa ser um inteiro positivo.');
  }

  if (!Array.isArray(tl.tracks)) {
    errors.push('Campo "tracks" precisa ser um array.');
  }

  if (!Array.isArray(tl.clips)) {
    errors.push('Campo "clips" precisa ser um array.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Tenta validação matemática profunda de cada clipe
  try {
    assertValidTimeline(tl as TimelineState);
  } catch (err: any) {
    errors.push(err.message || String(err));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Compila e normaliza uma Linha do Tempo JSON declarativa para execução no Remotion.
 * - Garante frames inteiros arredondados.
 * - Calcula modulação de Auto-Ducking para trilhas sonoras.
 * - Ordena faixas por ordem de empilhamento visual (Z-Index).
 */
export function compileTimeline(raw: Partial<TimelineState>): TimelineState {
  const fps = Math.round(raw.fps || 30);
  const width = Math.round(raw.width || 1080);
  const height = Math.round(raw.height || 1920);
  const durationInFrames = Math.max(1, Math.round(raw.durationInFrames || 900));

  const tracks: TrackItem[] = (raw.tracks || []).map((t, idx) => ({
    id: t.id || `T_${idx + 1}`,
    kind: t.kind || 'graphics',
    name: t.name || `Track ${idx + 1}`,
    muted: Boolean(t.muted),
    locked: Boolean(t.locked),
    visible: t.visible !== false,
    volume: typeof t.volume === 'number' ? Math.max(0, Math.min(1, t.volume)) : 1.0,
    zIndex: typeof t.zIndex === 'number' ? t.zIndex : idx * 10,
    autoDucking: Boolean(t.autoDucking),
  }));

  const compiledClips: ClipItem[] = (raw.clips || []).map((c, idx) => {
    const startFrame = Math.max(0, Math.round(c.startFrame || 0));
    const duration = Math.max(1, Math.round(c.durationInFrames || 30));

    const base = {
      id: c.id || `clip_${idx + 1}`,
      trackId: c.trackId,
      startFrame,
      durationInFrames: duration,
      name: c.name || `${c.kind}_${idx + 1}`,
    };

    if (c.kind === 'graphics') {
      const g = c as GraphicsClip;
      return {
        ...base,
        kind: 'graphics' as const,
        componentName: g.componentName || 'FlowMotionMaster',
        props: g.props || {},
      };
    }

    if (c.kind === 'caption') {
      const cap = c as CaptionClip;
      return {
        ...base,
        kind: 'caption' as const,
        text: cap.text || '',
        words: cap.words,
        motionPreset: cap.motionPreset || 'slam',
        fontSize: cap.fontSize,
        highlightColor: cap.highlightColor,
        bottomPosition: cap.bottomPosition,
      };
    }

    // MediaClip (video, audio, image)
    const m = c as MediaClip;
    return {
      ...base,
      kind: m.kind || 'video',
      src: m.src || '',
      srcInFrame: Math.max(0, Math.round(m.srcInFrame || 0)),
      volume: typeof m.volume === 'number' ? Math.max(0, Math.min(1, m.volume)) : 1.0,
    };
  });

  // Ordenação das faixas: Backgrounds -> Vídeo -> Gráficos -> Legendas -> Áudio
  tracks.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

  const state: TimelineState = {
    title: raw.title || 'Vibe Studio Compiled Timeline',
    fps,
    width,
    height,
    durationInFrames,
    currentFrame: 0,
    tracks,
    clips: compiledClips,
    selectedClipIds: raw.selectedClipIds || [],
  };

  // Validação final de integridade
  assertValidTimeline(state);

  return state;
}
