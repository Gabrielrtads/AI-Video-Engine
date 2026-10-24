import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {MeasuredEaseName} from './measured_eases';

export type ImpactSoundType = 'slam' | 'whoosh' | 'click' | 'boom' | 'digital' | 'final';

export interface SoundImpactTrigger {
	/** Frame inicial da animação */
	startFrame: number;
	/** Duração da animação em frames */
	durationFrames: number;
	/** Curva física utilizada para calcular o ponto de impacto */
	ease?: MeasuredEaseName;
	/** Tipo do efeito sonoro (slam, whoosh, click, boom, digital, final) */
	type?: ImpactSoundType;
	/** Volume individual do efeito (0 a 1, padrão 0.35) */
	volume?: number;
	/** Ajuste fino em frames (+/-) */
	frameOffset?: number;
}

const SFX_MAP: Record<ImpactSoundType, string> = {
	slam: 'audio/sfx/sub_impact_warm.mp3',
	whoosh: 'audio/sfx/whoosh_zoom.mp3',
	click: 'audio/sfx/click_haptic.mp3',
	boom: 'audio/sfx/hud_boom.mp3',
	digital: 'audio/sfx/transicao_digital.mp3',
	final: 'audio/sfx/impacto_final.mp3',
};

/**
 * Calcula matematicamente o frame exato do impacto sonoro
 * baseado na física da curva medida (MEAS).
 */
export const calculateImpactFrame = (
	startFrame: number,
	durationFrames: number,
	ease: MeasuredEaseName = 'softLand'
): number => {
	switch (ease) {
		case 'snapSettle':
			// 54% do percurso nos primeiros 10% do tempo. O impacto perceptivo bate em t~0.15
			return Math.round(startFrame + durationFrames * 0.15);
		case 'crashIn':
			// Slams atingem o pico do overshoot em t~0.27
			return Math.round(startFrame + durationFrames * 0.27);
		case 'popOver':
			// Overshoot tátil tardio em t~0.72
			return Math.round(startFrame + durationFrames * 0.72);
		case 'bounceHard':
			// Grande impacto elástico no pico de overshoot em t~0.62
			return Math.round(startFrame + durationFrames * 0.62);
		case 'accelExit':
		case 'crashOut':
			// Saídas aceleradas produzem o whoosh no pico de velocidade antes do corte (t~0.75)
			return Math.round(startFrame + durationFrames * 0.75);
		case 'whip':
			// Chicote de alta energia atinge a velocidade máxima em t~0.25
			return Math.round(startFrame + durationFrames * 0.25);
		case 'softLand':
		case 'glide':
		default:
			// Desaceleração suave: o impacto mais firme de aterrissagem ocorre logo no início da frenagem (t~0.25)
			return Math.round(startFrame + durationFrames * 0.25);
	}
};

export interface AutoImpactTrackProps {
	triggers: SoundImpactTrigger[];
	masterVolume?: number;
}

export const AutoImpactTrack: React.FC<AutoImpactTrackProps> = ({triggers, masterVolume = 1.0}) => {
	return (
		<>
			{triggers.map((trig, idx) => {
				const soundType =
					trig.type ||
					(trig.ease === 'accelExit' || trig.ease === 'crashOut' || trig.ease === 'whip'
						? 'whoosh'
						: 'slam');
				const impactFrame = Math.max(
					0,
					calculateImpactFrame(trig.startFrame, trig.durationFrames, trig.ease) + (trig.frameOffset || 0)
				);
				const audioSrc = SFX_MAP[soundType];
				const vol = (trig.volume ?? 0.35) * masterVolume;

				return (
					<Sequence from={impactFrame} key={`${soundType}-${impactFrame}-${idx}`}>
						<Audio src={staticFile(audioSrc)} volume={vol} />
					</Sequence>
				);
			})}
		</>
	);
};
