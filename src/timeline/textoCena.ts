/** Tipos e utilitários de texto de cena, sem dependências (usados por scenePlan e sceneVisuals). */

export interface Scene {
	indice: number; // 1, 2, 3...
	texto: string;
	startFrame: number;
	durationInFrames: number;
}

/** Frase-chave curta da cena (até 5 palavras, sem pontuação final) para títulos de cartões. */
export function keyPhrase(texto: string, maxPalavras = 5): string {
	const palavras = texto.trim().split(/\s+/).slice(0, maxPalavras).join(' ');
	return palavras.replace(/[.!?…,;:]+$/u, '');
}
