import type { ClipItem } from './types';

/**
 * Converte número do frame para posição em pixels na timeline
 */
export function frameToPixel(frame: number, pixelsPerFrame: number): number {
  return Math.round(frame * pixelsPerFrame);
}

/**
 * Converte posição em pixels para número de frame inteiro
 */
export function pixelToFrame(pixel: number, pixelsPerFrame: number): number {
  if (pixelsPerFrame <= 0) return 0;
  return Math.max(0, Math.round(pixel / pixelsPerFrame));
}

/**
 * Formata um frame em timestamp amigável mm:ss:ff
 */
export function formatFrameToTimestamp(frame: number, fps: number): string {
  const totalSeconds = Math.floor(frame / fps);
  const remainderFrames = frame % fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const ff = String(remainderFrames).padStart(2, '0');

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
  let closestDistance = Infinity;
  let snappedFrame = targetFrame;

  for (const clip of clips) {
    if (excludeClipId && clip.id === excludeClipId) continue;

    const clipStart = clip.startFrame;
    const clipEnd = clip.startFrame + clip.durationInFrames;

    // Checa início do clipe
    const distStart = Math.abs(targetFrame - clipStart);
    if (distStart <= toleranceFrames && distStart < closestDistance) {
      closestDistance = distStart;
      snappedFrame = clipStart;
    }

    // Checa fim do clipe
    const distEnd = Math.abs(targetFrame - clipEnd);
    if (distEnd <= toleranceFrames && distEnd < closestDistance) {
      closestDistance = distEnd;
      snappedFrame = clipEnd;
    }
  }

  return snappedFrame;
}
