/**
 * ════════════════════════════════════════════════════════════════════════════
 * VIBE DESIGN STUDIO — ROTEADOR "UM PEDIDO PRA CADA ESTILO" & MATEMÁTICA EDIT.IA
 * Regras extraídas e destiladas no Segundo Cérebro via MCP processador-aulas:
 * - e02-gancho.conhecimento.md (Gancho Grande no Topo + Spellcheck Wave)
 * - e12-tela-dividida.conhecimento.md (Split-Screen 50/50 + Órbita de Cards)
 * - e13-revista.conhecimento.md (Capa de Revista Editorial GQ/Vogue/Forbes)
 * - e14-motion-explicativo.conhecimento.md (Onda de Áudio Cortada / Dark UI)
 * ════════════════════════════════════════════════════════════════════════════
 */

export const EDITIA_PALETTES = {
	ganchoTopo: {
		bg: '#120D18',
		rimGlow: '#A82FFC',
		wordActive: '#FFFFFF',
		wordFuture: '#8E849E',
		errorWave: '#FF3B5C',
	},
	orbitaSplit: {
		seamBlack: '#0A0A0A',
		cardBg: '#FFFFFF',
		cardText: '#141413',
		accentOrange: '#FF6B2B',
		strokeBlack: '#000000',
	},
	capaRevista: {
		editorialGreen: '#1A3C2A',
		ivoryCream: '#F4F1EA',
		champagneBorder: '#D4CEB8',
		inkDark: '#0F1F17',
	},
	ondaAudio: {
		obsidianBg: '#0A0806',
		cardDark: '#161310',
		cardBorder: '#33261E',
		barIdle: '#D6D3CD',
		barActive: '#FF6B2B',
		annotationRed: '#FF4D4D',
		gridLine: 'rgba(255, 107, 43, 0.14)',
	},
} as const;

export interface StyleCommandEntry {
	id: string;
	code: string;
	category: string;
	title: string;
	canonicalCommand: string;
	layoutMode: string;
	canonicalComponent: string;
	estetica: string;
	ritmo: string;
	paleta: string[];
	ganchoDefault: string;
	patterns: RegExp[];
}

export const EDITIA_STYLE_COMMANDS: StyleCommandEntry[] = [
	{
		id: 'gancho_grande_topo',
		code: 'e02-gancho',
		category: 'Simples · Gancho na tela',
		title: 'A primeira frase em letra grande',
		canonicalCommand: 'Abre com um gancho forte na tela',
		layoutMode: 'gancho_grande_topo',
		canonicalComponent: 'BigHookTopBanner',
		estetica:
			'Gancho Tipográfico 3 Linhas no Topo (Acendimento Progressivo #FFFFFF/#8E849E + Oclusão Z + Sublinhado Ondulado de Erro #FF3B5C)',
		ritmo: 'Impacto imediato 0.0s–3.0s com sincronia fonética e onda corretiva SVG',
		paleta: ['#120D18', '#FFFFFF', '#8E849E', '#FF3B5C'],
		ganchoDefault: 'EU GRAVEI ESSE VÍDEO UMA VEZ SÓ',
		patterns: [
			/abre com um gancho/i,
			/gancho forte na tela/i,
			/primeira frase em letra grande/i,
			/gancho grande no topo/i,
			/gancho na tela/i,
			/letra grande no alto/i,
		],
	},
	{
		id: 'capa_revista_editorial',
		code: 'e13-revista',
		category: 'Estilo revista',
		title: 'Seu vídeo com cara de capa',
		canonicalCommand: 'Deixa com cara de capa de revista',
		layoutMode: 'capa_revista_editorial',
		canonicalComponent: 'MagazineCoverStage',
		estetica:
			'Capa de Revista Editorial GQ/Vogue (Verde Editorial Inglês #1A3C2A, Masthead Serifa 210px atrás da cabeça, Moldura Champanhe 48px e Código de Barras)',
		ritmo: 'Alternância fundo real emoldurado ↔ fundo sólido #1A3C2A nos picos de impacto',
		paleta: ['#1A3C2A', '#F4F1EA', '#D4CEB8'],
		ganchoDefault: 'O vídeo inteiro editado por uma frase vira capa de revista',
		patterns: [
			/cara de capa de revista/i,
			/capa de revista/i,
			/estilo revista/i,
			/vira capa/i,
			/revista editorial/i,
		],
	},
	{
		id: 'orbita_split_screen',
		code: 'e12-tela-dividida',
		category: 'Simples · Tela dividida & Órbita',
		title: 'Você reagindo ao vídeo de cima com cards em órbita',
		canonicalCommand: 'Divide a tela: o vídeo em cima e eu reagindo embaixo',
		layoutMode: 'orbita_split_screen',
		canonicalComponent: 'OrbitSplitScreenStage',
		estetica:
			'Split-Screen 50/50 (Y=960px) + Mural de Cards Flutuantes em Órbita no Topo + Legenda Cravada na Costura Central com Destaque #FF6B2B',
		ritmo: 'Reação dupla simultânea com entrada elástica de cards orbitais',
		paleta: ['#0A0A0A', '#FFFFFF', '#FF6B2B', '#141413'],
		ganchoDefault: 'Olha o mural de cards que a IA montou em volta de mim',
		patterns: [
			/divide a tela/i,
			/tela dividida/i,
			/vídeo em cima e eu reagindo embaixo/i,
			/reagindo embaixo/i,
			/em órbita/i,
			/orbita ao meu redor/i,
			/em volta de mim/i,
			/mural de frases/i,
		],
	},
	{
		id: 'onda_audio_corte',
		code: 'e14-motion-explicativo',
		category: 'Motion explicativo · Corte de Áudio',
		title: 'A explicação vira animação da onda de áudio cortada',
		canonicalCommand: 'Explica essa parte com uma animação',
		layoutMode: 'onda_audio_corte',
		canonicalComponent: 'AudioWaveformCutStage',
		estetica:
			'Dark UI Motion Explicativo (#0A0806, Monitor de Waveform com Setas Manuscritas Vermelhas #FF4D4D apontando erro/gaguejada/pausa e Scanner Laranja #FF6B2B)',
		ritmo: 'Diagnóstico visual da onda bruta -> Varredura a laser suprimindo silêncios',
		paleta: ['#0A0806', '#FF6B2B', '#FF4D4D', '#D6D3CD'],
		ganchoDefault: 'Você manda o bruto com pausa e gaguejada e a IA fatia tudo',
		patterns: [
			/explica essa parte com uma anima/i,
			/onda do áudio/i,
			/onda de áudio/i,
			/corta as pausas/i,
			/tira as pausas/i,
			/última tomada/i,
			/melhor tomada/i,
			/waveform/i,
			/bruto\.mov/i,
		],
	},
	{
		id: 'palavra_impacto_atras',
		code: 'e04-impacto',
		category: 'Palavra de impacto',
		title: 'A frase forte atrás de você',
		canonicalCommand: 'Põe a frase forte atrás de mim',
		layoutMode: 'palavra_impacto_atras',
		canonicalComponent: 'MagazineCoverStage',
		estetica: 'Tipografia Monumental Ocluída por Rotoscopia (Texto gigante Z=1 atrás da cabeça Z=2)',
		ritmo: 'Entrada cinética sincronizada com palavras de autoridade',
		paleta: ['#0D0F12', '#FFFFFF', '#FF6B2B'],
		ganchoDefault: 'A frase forte entra gigante atrás de você sem cobrir o rosto',
		patterns: [
			/frase forte atrás de mim/i,
			/palavra de impacto atrás/i,
			/texto grande atrás de mim/i,
			/atrás da cabeça/i,
		],
	},
	{
		id: 'legenda_palavra_por_palavra',
		code: 'e03-legenda',
		category: 'Simples · Legenda animada',
		title: 'Legenda que acompanha a boca',
		canonicalCommand: 'Legenda palavra por palavra',
		layoutMode: 'legenda_hormozi',
		canonicalComponent: 'HormoziKineticCaption',
		estetica: 'Legenda Cinética Hormozi Sincronizada ao Milissegundo (Pop Elástico + Marca-Texto)',
		ritmo: 'Acendimento sílaba a sílaba na altura do peito',
		paleta: ['#0A0B0E', '#00FF66', '#FFE600', '#FFFFFF'],
		ganchoDefault: 'Cada palavra acende exatamente na hora em que é falada',
		patterns: [
			/^legenda palavra por palavra$/i,
			/legenda que acompanha a boca/i,
			/só com legenda/i,
		],
	},
];

/**
 * Roteador determinístico "Um Pedido Pra Cada Estilo":
 * Recebe uma frase em linguagem natural do usuário e devolve o estilo exato se houver match.
 */
export function matchOneSentenceStyleRequest(input: string): StyleCommandEntry | null {
	const clean = String(input || '').trim();
	if (!clean) return null;

	for (const entry of EDITIA_STYLE_COMMANDS) {
		if (clean.toLowerCase() === entry.canonicalCommand.toLowerCase()) {
			return entry;
		}
		for (const regex of entry.patterns) {
			if (regex.test(clean)) {
				return entry;
			}
		}
	}
	return null;
}

/**
 * Gera um path SVG de onda senoidal para o sublinhado vermelho de erro ortográfico (e02-gancho).
 * Fórmula analítica determinística sem leitura de DOM (zero getTotalLength()).
 */
export function generateSpellcheckWavePath(
	width: number,
	yCenter = 8,
	wavelength = 18,
	amplitude = 4.5
): { path: string; approximateLength: number } {
	const safeWidth = Math.max(18, Math.round(width));
	const halfWave = wavelength / 2;
	const steps = Math.max(2, Math.floor(safeWidth / halfWave));
	const parts: string[] = [`M 0 ${yCenter}`];

	for (let i = 0; i < steps; i++) {
		const x1 = +(i * halfWave + halfWave / 2).toFixed(2);
		const y1 = +(yCenter + (i % 2 === 0 ? -amplitude : amplitude)).toFixed(2);
		const x2 = +((i + 1) * halfWave).toFixed(2);
		const y2 = yCenter;
		parts.push(`Q ${x1} ${y1}, ${x2} ${y2}`);
	}

	// Comprimento aproximado analítico por arco parabólico
	const arcLenFactor = Math.sqrt(1 + Math.pow((2 * amplitude) / halfWave, 2));
	const approximateLength = Math.ceil(safeWidth * arcLenFactor);

	return {
		path: parts.join(' '),
		approximateLength,
	};
}

export interface WaveformBarSpec {
	index: number;
	heightRatio: number;
	kind: 'speech' | 'error' | 'stutter' | 'pause';
}

/**
 * Gera as barras determinísticas da onda de áudio para o estilo e14-motion-explicativo,
 * incluindo os trechos exatos de erro, gaguejada e pausa (amplitude ~0).
 */
export function generateDeterministicWaveformBars(count = 56): WaveformBarSpec[] {
	const bars: WaveformBarSpec[] = [];
	for (let i = 0; i < count; i++) {
		const norm = i / Math.max(1, count - 1);
		let kind: WaveformBarSpec['kind'] = 'speech';
		let heightRatio = 0.55;

		// Vale de pausa 1 (silêncio entre blocos)
		if (norm >= 0.08 && norm <= 0.13) {
			kind = 'pause';
			heightRatio = 0.06;
		}
		// Trecho de "erro" (apontado pela 1ª seta vermelha)
		else if (norm >= 0.15 && norm <= 0.21) {
			kind = 'error';
			heightRatio = 0.78 + ((i * 7) % 3) * 0.06;
		}
		// Vale curto
		else if (norm >= 0.28 && norm <= 0.32) {
			kind = 'pause';
			heightRatio = 0.06;
		}
		// Trecho de "gaguejada" (oscilação irregular no meio)
		else if (norm >= 0.36 && norm <= 0.46) {
			kind = 'stutter';
			heightRatio = 0.28 + ((i * 13) % 5) * 0.09;
		}
		// Vale de "pausa" principal (apontado pela seta inferior)
		else if (norm >= 0.47 && norm <= 0.52) {
			kind = 'pause';
			heightRatio = 0.05;
		}
		// Vale curto final
		else if (norm >= 0.82 && norm <= 0.87) {
			kind = 'pause';
			heightRatio = 0.06;
		}
		// Blocos normais de fala limpa
		else {
			const pseudo = Math.sin(i * 1.7 + 0.5) * 0.5 + 0.5;
			heightRatio = +(0.68 + pseudo * 0.26).toFixed(3);
		}

		bars.push({
			index: i,
			heightRatio: +heightRatio.toFixed(3),
			kind,
		});
	}
	return bars;
}
