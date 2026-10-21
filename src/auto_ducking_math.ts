export interface SpeechInterval {
	startFrame: number;
	endFrame: number;
}

export interface WordTimestamp {
	word?: string;
	text?: string;
	start?: number; // seconds or ms
	end?: number;   // seconds or ms
	startMs?: number;
	endMs?: number;
}

/**
 * Normaliza timestamps de palavras em intervalos contínuos de fala em frames,
 * unindo palavras com pausas menores que pauseThresholdFrames para evitar pumping excessivo.
 */
export const wordsToSpeechIntervals = (
	words: WordTimestamp[],
	fps: number,
	pauseThresholdFrames: number = 12
): SpeechInterval[] => {
	if (!words || words.length === 0) return [];

	const rawIntervals: SpeechInterval[] = [];

	for (const w of words) {
		let startSec = 0;
		let endSec = 0;

		if (typeof w.startMs === 'number' && typeof w.endMs === 'number') {
			startSec = w.startMs / 1000;
			endSec = w.endMs / 1000;
		} else if (typeof w.start === 'number' && typeof w.end === 'number') {
			startSec = w.start > 100 ? w.start / 1000 : w.start;
			endSec = w.end > 100 ? w.end / 1000 : w.end;
		}

		const startFrame = Math.max(0, Math.floor(startSec * fps));
		const endFrame = Math.max(startFrame + 1, Math.ceil(endSec * fps));

		rawIntervals.push({startFrame, endFrame});
	}

	if (rawIntervals.length === 0) return [];

	rawIntervals.sort((a, b) => a.startFrame - b.startFrame);

	const merged: SpeechInterval[] = [rawIntervals[0]];

	for (let i = 1; i < rawIntervals.length; i++) {
		const current = rawIntervals[i];
		const prev = merged[merged.length - 1];

		if (current.startFrame <= prev.endFrame + pauseThresholdFrames) {
			prev.endFrame = Math.max(prev.endFrame, current.endFrame);
		} else {
			merged.push(current);
		}
	}

	return merged;
};

/**
 * Interpolação linear segura e rápida com clamp estrito.
 */
export const clampInterpolate = (
	input: number,
	inputRange: [number, number],
	outputRange: [number, number]
): number => {
	const [inMin, inMax] = inputRange;
	const [outMin, outMax] = outputRange;
	if (inMax === inMin) return outMin;
	const clamped = Math.max(inMin, Math.min(inMax, input));
	const progress = (clamped - inMin) / (inMax - inMin);
	return outMin + progress * (outMax - outMin);
};

/**
 * Calcula o multiplicador de volume instantâneo para um dado frame,
 * aplicando rampa suave nas bordas de fala.
 */
export const calculateDuckedVolume = (
	currentFrame: number,
	intervals: SpeechInterval[],
	baseVolume: number = 0.35,
	duckedVolume: number = 0.10,
	fadeFrames: number = 8
): number => {
	if (!intervals || intervals.length === 0) {
		return baseVolume;
	}

	for (const interval of intervals) {
		const {startFrame, endFrame} = interval;

		// Janela de fala ativa -> volume ducked pleno
		if (currentFrame >= startFrame && currentFrame <= endFrame) {
			return duckedVolume;
		}

		// Rampa de descida antes da fala
		if (currentFrame >= startFrame - fadeFrames && currentFrame < startFrame) {
			return clampInterpolate(
				currentFrame,
				[startFrame - fadeFrames, startFrame],
				[baseVolume, duckedVolume]
			);
		}

		// Rampa de subida após a fala
		if (currentFrame > endFrame && currentFrame <= endFrame + fadeFrames) {
			return clampInterpolate(
				currentFrame,
				[endFrame, endFrame + fadeFrames],
				[duckedVolume, baseVolume]
			);
		}
	}

	return baseVolume;
};
