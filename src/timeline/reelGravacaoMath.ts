/**
 * Timeline do "reel com a minha gravação": o vídeo gravado pelo usuário ocupa a duração toda, com a
 * legenda Hormozi (palavra por palavra) e a barra de retenção por cima. Sem dependência de Remotion.
 */
import { resolveAspectRatioMetrics } from './pipeline1ClickMath.ts';
import type { AspectRatio } from './pipeline1ClickMath.ts';
import type { ClipItem, TimelineState, TrackItem } from './types.ts';

export interface ReelGravacaoOptions {
	/** Caminho do vídeo relativo a public/ (ex.: "input/take_atual.mp4"). */
	videoSrc: string;
	duracaoSegundos: number;
	words: Array<{ text: string; start: number; end: number }>;
	aspectRatio?: AspectRatio;
	variant?: string;
	fps?: number;
	showEmojis?: boolean;
}

export function buildReelGravacaoTimeline(options: ReelGravacaoOptions): TimelineState {
	const { videoSrc, duracaoSegundos, words, aspectRatio = '9:16', variant = 'classic-yellow', fps = 30, showEmojis = true } = options;
	if (!videoSrc) throw new Error('Informe o vídeo (videoSrc) da gravação.');
	if (!Number.isFinite(duracaoSegundos) || duracaoSegundos <= 0) throw new Error('A duração do vídeo precisa ser maior que zero.');

	const metrics = resolveAspectRatioMetrics(aspectRatio);
	const totalFrames = Math.max(1, Math.ceil(duracaoSegundos * fps));

	const tracks: TrackItem[] = [
		{ id: 'T_VIDEO', kind: 'video', name: 'Gravação do usuário', zIndex: 0 },
		{ id: 'T_RETENTION', kind: 'graphics', name: 'Retention Progress', zIndex: 80 },
		{ id: 'T_CAPTIONS', kind: 'graphics', name: 'Kinetic Captions', zIndex: 90 },
	];

	const clips: ClipItem[] = [
		{
			id: 'clip_gravacao',
			trackId: 'T_VIDEO',
			kind: 'video',
			src: videoSrc,
			startFrame: 0,
			durationInFrames: totalFrames,
			volume: 1,
		},
		{
			id: 'clip_retention_bar',
			trackId: 'T_RETENTION',
			kind: 'graphics',
			componentName: 'RetentionProgressBar',
			startFrame: 0,
			durationInFrames: totalFrames,
			props: { position: 'top', height: aspectRatio === '16:9' ? 6 : 10, gradient: ['#FFE500', '#FF003C'], showGlow: true },
		},
	];

	if (words.length > 0) {
		clips.push({
			id: 'clip_hormozi_captions',
			trackId: 'T_CAPTIONS',
			kind: 'graphics',
			componentName: 'HormoziKineticCaption',
			startFrame: 0,
			durationInFrames: totalFrames,
			props: {
				words,
				variant,
				highlightStyle: 'box',
				motionIntensity: 'standard',
				windowSize: 1,
				showEmojis,
				textTransform: 'uppercase',
				fontSize: metrics.captionFontSize,
				bottom: metrics.captionBottom,
			},
		});
	}

	return { fps, width: metrics.width, height: metrics.height, durationInFrames: totalFrames, currentFrame: 0, tracks, clips, selectedClipIds: [] };
}
