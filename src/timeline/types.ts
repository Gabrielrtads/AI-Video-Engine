/**
 * Contrato Canônico de Tipagem da Timeline do Vibe Design Studio
 * Auditoria baseada em OpenChatCut e Remotion-Timeline (Codex Review)
 * 
 * Regra de Ouro: Todo cálculo e persistência ocorre em FRAMES INTEIROS (FPS fixo).
 * Zero conversão float/ms no caminho principal de renderização.
 */

export type TrackKind = 'video' | 'audio' | 'caption' | 'graphics';

export interface TrackItem {
  id: string;
  kind: TrackKind;
  name: string;
  muted?: boolean;
  locked?: boolean;
  visible?: boolean;
}

export interface ClipBase {
  id: string;
  trackId: string;
  startFrame: number;          // Frame inicial na timeline global (>= 0)
  durationInFrames: number;    // Duração total em frames (> 0)
  name?: string;
}

export type MediaClip = ClipBase & {
  kind: 'video' | 'audio' | 'image';
  src: string;
  srcInFrame?: number;         // Ponto de entrada na mídia original (slip)
  volume?: number;             // 0.0 a 1.0 (Auto-ducking compatível)
};

export type CaptionClip = ClipBase & {
  kind: 'caption';
  text: string;
  words?: Array<{
    word: string;
    startFrame: number;
    endFrame: number;
  }>;
  motionPreset?: 'slam' | 'karaoke' | 'fade-up' | 'pop';
};

export type GraphicsClip = ClipBase & {
  kind: 'graphics';
  componentName: string;       // ex: 'AppleKineticCards', 'CarrosselEditorial'
  props?: Record<string, unknown>;
};

export type ClipItem = MediaClip | CaptionClip | GraphicsClip;

export interface TimelineState {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  currentFrame: number;
  tracks: TrackItem[];
  clips: ClipItem[];
  selectedClipIds: string[];
}

export interface TimelineViewState {
  pixelsPerFrame: number;      // Escala de zoom (ex: 1 frame = 2px)
  scrollLeft: number;          // Posição de rolagem horizontal
  snapTolerancePixels: number; // Tolerância para snap magnético (padrão: 8px)
}
