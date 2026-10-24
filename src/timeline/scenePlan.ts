/**
 * Plano de cenas: o roteiro vira cenas (uma por frase) e cada cena ganha um visual.
 *
 * - `planScenes` divide as palavras já cronometradas em frases, com tempo contíguo que cobre o vídeo todo.
 * - `resolveScenePlan` escolhe o componente de cada cena: o padrão do preset, ou o que o agente pediu num
 *   plano (`[{ cena: 2, componente: 'OrbitalPlanet3D', props: {...} }]`), recusando componentes inventados.
 *
 * Sem dependência de Remotion: roda no Node puro (testes) e no pipeline 1-click.
 */
import { isCanonicalComponent } from './componentCatalog.ts';
import { escolherReceitas, receitaParaVisual } from './sceneVisuals.ts';
import type { EstiloVisual } from './sceneVisuals.ts';
import { keyPhrase } from './textoCena.ts';
import type { Scene } from './textoCena.ts';
import type { TimedWord } from './scriptAlignment.ts';

export { keyPhrase };
export type { Scene };

export interface ScenePlanItem {
	cena: number; // 1-based
	componente: string;
	props?: Record<string, unknown>;
}

export interface SceneSpec extends Scene {
	componentName: string;
	props: Record<string, unknown>;
	/** true quando é o visual padrão do preset (o plano do agente não mexeu nessa cena). */
	padrao: boolean;
	/** Chave de variedade (componente, mais a variante quando o mesmo componente tem várias). */
	chave: string;
}

const FIM_DE_FRASE = /[.!?…]["'”’)\]]*$/;

/** Divide as palavras em frases; frases curtas demais (< ~1 s) são fundidas à vizinha. */
export function planScenes(words: TimedWord[], fps: number, totalFrames: number, minSegundos = 1): Scene[] {
	if (!words || words.length === 0 || totalFrames <= 0) return [];

	type Bruta = { texto: string; startFrame: number };
	const brutas: Bruta[] = [];
	let atual: TimedWord[] = [];
	for (const palavra of words) {
		atual.push(palavra);
		if (FIM_DE_FRASE.test(palavra.text)) {
			brutas.push({ texto: atual.map((x) => x.text).join(' '), startFrame: Math.round(atual[0].start * fps) });
			atual = [];
		}
	}
	if (atual.length > 0) brutas.push({ texto: atual.map((x) => x.text).join(' '), startFrame: Math.round(atual[0].start * fps) });

	brutas[0].startFrame = 0;
	const minFrames = Math.round(minSegundos * fps);
	const duracao = (lista: Bruta[], i: number) => (i + 1 < lista.length ? lista[i + 1].startFrame : totalFrames) - lista[i].startFrame;

	// Funde frases muito curtas com a seguinte (ou com a anterior, se for a última)
	let mudou = true;
	while (mudou && brutas.length > 1) {
		mudou = false;
		for (let i = 0; i < brutas.length; i++) {
			if (duracao(brutas, i) < minFrames) {
				if (i + 1 < brutas.length) {
					brutas[i + 1] = { texto: `${brutas[i].texto} ${brutas[i + 1].texto}`, startFrame: brutas[i].startFrame };
					brutas.splice(i, 1);
				} else {
					brutas[i - 1] = { texto: `${brutas[i - 1].texto} ${brutas[i].texto}`, startFrame: brutas[i - 1].startFrame };
					brutas.splice(i, 1);
				}
				mudou = true;
				break;
			}
		}
	}

	return brutas.map((b, i) => ({ indice: i + 1, texto: b.texto, startFrame: b.startFrame, durationInFrames: duracao(brutas, i) }));
}

/** Aplica o plano do agente por cima do visual padrão; recusa cena inexistente e componente inventado. */
export function resolveScenePlan(scenes: Scene[], plano: ScenePlanItem[] = [], preset = 'hormozi', estilo?: Partial<EstiloVisual>): SceneSpec[] {
	const porCena = new Map<number, ScenePlanItem>();
	for (const item of plano) {
		if (!Number.isInteger(item.cena) || item.cena < 1 || item.cena > scenes.length) {
			throw new Error(`Plano de cenas: cena ${item.cena} não existe (o roteiro tem ${scenes.length} cena(s)).`);
		}
		if (!isCanonicalComponent(item.componente)) {
			throw new Error(`Plano de cenas: componente "${item.componente}" não existe no catálogo do estúdio.`);
		}
		porCena.set(item.cena, item);
	}
	const receitas = escolherReceitas(scenes, preset);
	return scenes.map((scene, i) => {
		const escolhido = porCena.get(scene.indice);
		if (escolhido) return { ...scene, componentName: escolhido.componente, props: escolhido.props ?? {}, padrao: false, chave: escolhido.componente };
		return { ...scene, ...receitaParaVisual(receitas[i], scene, estilo), padrao: true };
	});
}
