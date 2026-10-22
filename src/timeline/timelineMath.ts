import type { ClipItem, TimelineState } from './types';

/**
 * Validador estrito de integridade da TimelineState (Auditoria Codex)
 * Garante que FPS e durações são inteiros positivos e que clips respeitam os limites.
 */
export function assertValidTimeline(timeline: TimelineState): void {
  if (!Number.isFinite(timeline.fps) || timeline.fps <= 0) {
    throw new Error(`fps precisa ser positivo e finito. Recebido: ${timeline.fps}`);
  }

  if (!Number.isInteger(timeline.durationInFrames) || timeline.durationInFrames <= 0) {
    throw new Error(
      `durationInFrames precisa ser um inteiro positivo. Recebido: ${timeline.durationInFrames}`
    );
  }

  for (const clip of timeline.clips) {
    if (!Number.isInteger(clip.startFrame) || clip.startFrame < 0) {
      throw new Error(`startFrame inválido no clipe ${clip.id}: ${clip.startFrame}`);
    }

    if (!Number.isInteger(clip.durationInFrames) || clip.durationInFrames <= 0) {
      throw new Error(
        `durationInFrames inválida no clipe ${clip.id}: ${clip.durationInFrames}`
      );
    }
  }
}

/**
 * Converte número do frame para posição em pixels na timeline
 */
export function frameToPixel(frame: number, pixelsPerFrame: number): number {
  const safeFrame = Math.max(0, Number.isFinite(frame) ? frame : 0);
  const safeScale = Math.max(0, Number.isFinite(pixelsPerFrame) ? pixelsPerFrame : 1);
  return Math.round(safeFrame * safeScale);
}

/**
 * Converte posição em pixels para número de frame inteiro
 */
export function pixelToFrame(pixel: number, pixelsPerFrame: number): number {
  if (!Number.isFinite(pixelsPerFrame) || pixelsPerFrame <= 0) return 0;
  if (!Number.isFinite(pixel) || pixel <= 0) return 0;
  return Math.max(0, Math.round(pixel / pixelsPerFrame));
}

/**
 * Formata um frame em timestamp amigável mm:ss:ff (ou hh:mm:ss:ff se > 1 hora)
 */
export function formatFrameToTimestamp(frame: number, fps: number): string {
  const safeFps = Number.isFinite(fps) && fps > 0 ? fps : 30;
  const safeFrame = Math.max(0, Number.isFinite(frame) ? Math.floor(frame) : 0);

  const totalSeconds = Math.floor(safeFrame / safeFps);
  const remainderFrames = safeFrame % safeFps;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const ff = String(remainderFrames).padStart(2, '0');

  if (hours > 0) {
    const hh = String(hours).padStart(2, '0');
    return `${hh}:${mm}:${ss}:${ff}`;
  }

  return `${mm}:${ss}:${ff}`;
}

/**
 * Encontra o ponto de snap magnético mais próximo (início ou fim de clips existentes)
 */
export function snapToNearestClip(
  targetFrame: number,
  clips: ClipItem[],
  toleranceFrames: number,
  excludeClipId?: string
): number {
  const safeTolerance = Math.max(0, Number.isFinite(toleranceFrames) ? toleranceFrames : 0);
  if (safeTolerance === 0) return targetFrame;

  let closestDistance = Infinity;
  let snappedFrame = targetFrame;

  for (const clip of clips) {
    if (excludeClipId && clip.id === excludeClipId) continue;

    const clipStart = clip.startFrame;
    const clipEnd = clip.startFrame + clip.durationInFrames;

    // Checa início do clipe
    const distStart = Math.abs(targetFrame - clipStart);
    if (distStart <= safeTolerance && distStart < closestDistance) {
      closestDistance = distStart;
      snappedFrame = clipStart;
    }

    // Checa fim do clipe
    const distEnd = Math.abs(targetFrame - clipEnd);
    if (distEnd <= safeTolerance && distEnd < closestDistance) {
      closestDistance = distEnd;
      snappedFrame = clipEnd;
    }
  }

  return snappedFrame;
}
