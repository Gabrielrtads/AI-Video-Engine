import React, {useMemo} from 'react';
import {Audio, useVideoConfig} from 'remotion';
import {
	SpeechInterval,
	WordTimestamp,
	wordsToSpeechIntervals,
	calculateDuckedVolume,
} from './auto_ducking_math';

export {
	SpeechInterval,
	WordTimestamp,
	wordsToSpeechIntervals,
	calculateDuckedVolume,
};

export interface AutoDuckingAudioProps {
	/** Caminho ou URL do arquivo de áudio (ex: staticFile('audio/musica/trilha_luxo.mp3')) */
	src: string;
	/** Intervalos explícitos de fala em frames */
	speechIntervals?: SpeechInterval[];
	/** Timestamps brutos de palavras (do Whisper / words.json) */
	words?: WordTimestamp[];
	/** Volume base quando NÃO há fala (música em destaque, padrão: 0.35) */
	baseVolume?: number;
	/** Volume rebaixado (ducked) DURANTE a fala (padrão: 0.10) */
	duckedVolume?: number;
	/** Quantidade de frames para rampa de transição suave (fade in/out, padrão: 8 frames) */
	fadeFrames?: number;
	/** Loop da música de fundo (padrão: true) */
	loop?: boolean;
}

/**
 * Componente Remotion de Trilha Sonora com Auto-Ducking Dinâmico.
 * Rebaixa a música automaticamente durante a voz e sobe nos silêncios.
 */
export const AutoDuckingAudio: React.FC<AutoDuckingAudioProps> = ({
	src,
	speechIntervals,
	words,
	baseVolume = 0.35,
	duckedVolume = 0.10,
	fadeFrames = 8,
	loop = true,
}) => {
	const {fps} = useVideoConfig();

	const activeIntervals = useMemo(() => {
		if (speechIntervals && speechIntervals.length > 0) {
			return speechIntervals;
		}
		if (words && words.length > 0) {
			return wordsToSpeechIntervals(words, fps);
		}
		return [];
	}, [speechIntervals, words, fps]);

	return (
		<Audio
			src={src}
			loop={loop}
			volume={(f) =>
				calculateDuckedVolume(f, activeIntervals, baseVolume, duckedVolume, fadeFrames)
			}
		/>
	);
};
