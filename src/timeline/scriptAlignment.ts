/**
 * Alinha o texto do ROTEIRO aos tempos do Whisper.
 *
 * O Whisper é bom em quando cada palavra foi dita e ruim em qual palavra foi dita (troca "Agende" por
 * "Agente", inventa palavras, engole outras). O roteiro é o contrário. Aqui a legenda usa o texto do
 * roteiro e empresta do Whisper só o tempo, por alinhamento de sequências (Needleman-Wunsch).
 *
 * Sem dependências de Remotion: roda no Node puro (testes) e no pipeline 1-click.
 */

export interface TimedWord {
	text: string;
	start: number; // segundos
	end: number; // segundos
}

/** Minúsculo, sem acento e sem pontuação: "Você," -> "voce". */
export function normalizeToken(token: string): string {
	return token
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '');
}

function editDistance(a: string, b: string): number {
	const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
	for (let i = 1; i <= a.length; i++) {
		let diag = prev[0];
		prev[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const tmp = prev[j];
			prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
			diag = tmp;
		}
	}
	return prev[b.length];
}

/** Pontuação de casar duas palavras: igual +3, parecida +1, diferente -2. */
function similarity(a: string, b: string): number {
	if (a === b) return 3;
	if (a.length >= 4 && b.length >= 4 && editDistance(a, b) <= Math.max(1, Math.floor(Math.min(a.length, b.length) / 4))) return 1;
	return -2;
}

const GAP = -1;

export function alignScriptToTimestamps(script: string, whisper: TimedWord[]): TimedWord[] {
	const tokens = script.split(/\s+/).filter((t) => normalizeToken(t).length > 0);
	if (tokens.length === 0 || !whisper || whisper.length === 0) return [];

	const a = tokens.map(normalizeToken);
	const b = whisper.map((x) => normalizeToken(x.text));
	const n = a.length;
	const m = b.length;

	// Matriz de pontuação do alinhamento global
	const score: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
	for (let i = 1; i <= n; i++) score[i][0] = i * GAP;
	for (let j = 1; j <= m; j++) score[0][j] = j * GAP;
	for (let i = 1; i <= n; i++) {
		for (let j = 1; j <= m; j++) {
			score[i][j] = Math.max(score[i - 1][j - 1] + similarity(a[i - 1], b[j - 1]), score[i - 1][j] + GAP, score[i][j - 1] + GAP);
		}
	}

	// Caminho de volta: para cada palavra do roteiro, qual palavra do Whisper casou (ou -1)
	const par: number[] = new Array(n).fill(-1);
	let i = n;
	let j = m;
	while (i > 0 && j > 0) {
		const s = similarity(a[i - 1], b[j - 1]);
		if (score[i][j] === score[i - 1][j - 1] + s) {
			if (s > 0) par[i - 1] = j - 1;
			i--;
			j--;
		} else if (score[i][j] === score[i - 1][j] + GAP) {
			i--;
		} else {
			j--;
		}
	}

	const out: TimedWord[] = tokens.map((text, k) => ({ text, start: NaN, end: NaN }));
	for (let k = 0; k < n; k++) {
		if (par[k] >= 0) {
			out[k].start = whisper[par[k]].start;
			out[k].end = whisper[par[k]].end;
		}
	}

	// Palavras sem par: interpolar entre as vizinhas com tempo, proporcional ao tamanho da palavra
	const spanStart = whisper[0].start;
	const spanEnd = whisper[whisper.length - 1].end;
	let k = 0;
	while (k < n) {
		if (!Number.isNaN(out[k].start)) {
			k++;
			continue;
		}
		let fim = k;
		while (fim < n && Number.isNaN(out[fim].start)) fim++;
		const de = k > 0 ? out[k - 1].end : spanStart;
		const ate = fim < n ? out[fim].start : spanEnd;
		const pesos = out.slice(k, fim).map((t) => Math.max(1, normalizeToken(t.text).length));
		const total = pesos.reduce((x, y) => x + y, 0);
		const largura = Math.max(0, ate - de);
		let cursor = de;
		for (let q = k; q < fim; q++) {
			const dur = (largura * pesos[q - k]) / total;
			out[q].start = cursor;
			out[q].end = cursor + dur;
			cursor += dur;
		}
		k = fim;
	}

	// Garante tempo monótono mesmo que o Whisper tenha devolvido pares fora de ordem
	for (let q = 1; q < n; q++) {
		if (out[q].start < out[q - 1].start) out[q].start = out[q - 1].start;
		if (out[q].end < out[q].start) out[q].end = out[q].start;
	}
	return out;
}
