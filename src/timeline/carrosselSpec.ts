/**
 * Spec do carrossel estático 4:5: valida antes de renderizar e converte cada slide nas props do
 * CarrosselEditorial. Todo texto vem do spec: nada do texto de demonstração do componente vaza.
 * Sem dependência de Remotion.
 */
import { razaoDeContraste } from './gosto.ts';

export interface SlideSpec {
	categoria: string;
	titulo: string[];
	destaque?: string;
	subtitulo?: string;
	palco?: { destaque?: string; repetida?: string };
}

export interface CarrosselSpec {
	nome: string;
	/** Protocolo Grill-Me: estilo uniforme em todos os slides ou dirigido slide a slide. */
	estilo: 'uniforme' | 'individual';
	/** Protocolo Grill-Me: só imagens estáticas ou slides preparados para depois virarem vídeo. */
	destino: 'estatico' | 'animado';
	autor?: string;
	marca?: string;
	slides: SlideSpec[];
}

export interface CoresDoEstilo {
	fundo: string;
	texto: string;
	acento: string;
}

const CAMPOS_RAIZ = ['nome', 'estilo', 'destino', 'autor', 'marca', 'slides'];
const CAMPOS_SLIDE = ['categoria', 'titulo', 'destaque', 'subtitulo', 'palco'];
const CAMPOS_PALCO = ['destaque', 'repetida'];
const MAX_LINHA = 24;
const MAX_SUBTITULO = 140;
const MAX_CATEGORIA = 42;

const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function validarSpec(spec: unknown): { ok: boolean; erros: string[] } {
	const erros: string[] = [];
	if (!ehObjeto(spec)) return { ok: false, erros: ['o spec precisa ser um objeto JSON'] };

	for (const chave of Object.keys(spec)) if (!CAMPOS_RAIZ.includes(chave)) erros.push(`campo desconhecido no spec: "${chave}" (permitidos: ${CAMPOS_RAIZ.join(', ')})`);
	if (typeof spec.nome !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(spec.nome)) erros.push('nome: use letras minúsculas, números e hífen (ex.: "barbearia-clientes")');
	if (spec.estilo !== 'uniforme' && spec.estilo !== 'individual') erros.push('estilo: informe "uniforme" (mesmo visual em todos os slides) ou "individual" (slide a slide). Pergunte ao usuário, não assuma.');
	if (spec.destino !== 'estatico' && spec.destino !== 'animado') erros.push('destino: informe "estatico" (só imagens do feed) ou "animado" (slides para virar vídeo). Pergunte ao usuário, não assuma.');

	if (!Array.isArray(spec.slides)) {
		erros.push('slides: precisa ser uma lista');
		return { ok: false, erros };
	}
	if (spec.slides.length < 2 || spec.slides.length > 10) erros.push(`slides: de 2 a 10 (recebeu ${spec.slides.length}); pergunte ao usuário a quantidade`);

	spec.slides.forEach((s: unknown, i: number) => {
		const rotulo = `slide ${i + 1}`;
		if (!ehObjeto(s)) {
			erros.push(`${rotulo}: precisa ser um objeto`);
			return;
		}
		for (const chave of Object.keys(s)) if (!CAMPOS_SLIDE.includes(chave)) erros.push(`${rotulo}: campo desconhecido "${chave}" (permitidos: ${CAMPOS_SLIDE.join(', ')})`);
		if (typeof s.categoria !== 'string' || s.categoria.trim() === '') erros.push(`${rotulo}: categoria é obrigatória`);
		else if (s.categoria.length > MAX_CATEGORIA) erros.push(`${rotulo}: categoria muito longa: ${s.categoria.length} caracteres (máximo ${MAX_CATEGORIA})`);
		if (!Array.isArray(s.titulo) || s.titulo.length < 1 || s.titulo.length > 3) erros.push(`${rotulo}: titulo precisa ter de 1 a 3 linhas`);
		else {
			s.titulo.forEach((linha: unknown, k: number) => {
				if (typeof linha !== 'string' || linha.trim() === '') erros.push(`${rotulo}: linha ${k + 1} do título está vazia`);
				else if (linha.length > MAX_LINHA) erros.push(`${rotulo}: linha ${k + 1} do título tem ${linha.length} caracteres; mantenha curta (máximo ${MAX_LINHA}) ou quebre em linhas`);
			});
			// O destaque é desenhado como uma linha própria, depois das linhas do título: repetir uma delas duplica o texto na tela.
			if (typeof s.destaque === 'string' && s.destaque !== '' && (s.titulo as string[]).some((linha) => semAcento(linha.trim()) === semAcento(s.destaque as string))) {
				erros.push(`${rotulo}: o destaque "${s.destaque}" repete uma linha do título; ele já aparece sozinho numa linha própria, depois do título`);
			}
			if (s.palco && typeof (s.palco as Record<string, unknown>).destaque === 'string' && ((s.palco as Record<string, string>).destaque.length > 14)) {
				erros.push(`${rotulo}: palco.destaque com ${(s.palco as Record<string, string>).destaque.length} caracteres; use no máximo 14 para caber no palco`);
			}
		}
		if (s.subtitulo !== undefined && (typeof s.subtitulo !== 'string' || s.subtitulo.length > MAX_SUBTITULO)) erros.push(`${rotulo}: subtitulo com no máximo ${MAX_SUBTITULO} caracteres`);
		if (s.palco !== undefined) {
			if (!ehObjeto(s.palco)) erros.push(`${rotulo}: palco precisa ser um objeto`);
			else for (const chave of Object.keys(s.palco)) if (!CAMPOS_PALCO.includes(chave)) erros.push(`${rotulo}: palco com campo desconhecido "${chave}"`);
		}
	});

	return { ok: erros.length === 0, erros };
}

const dois = (n: number) => String(n).padStart(2, '0');

/** Props do CarrosselEditorial para cada slide, já com numeração, rodapé e (opcionalmente) as cores do estilo. */
export function slidesParaProps(spec: unknown, estilo?: CoresDoEstilo): Array<Record<string, string | string[]>> {
	const v = validarSpec(spec);
	if (!v.ok) throw new Error(`Spec de carrossel inválido: ${v.erros.join('; ')}`);
	const s = spec as CarrosselSpec;
	const total = s.slides.length;

	const acento = estilo?.acento ?? '#FF0022';
	const texto = estilo?.texto ?? '#09090B';
	const fundo = estilo?.fundo ?? '#FCFCFD';
	const textoNoPalco = razaoDeContraste('#FFFFFF', acento) >= razaoDeContraste('#09090B', acento) ? '#FFFFFF' : '#09090B';
	const palcoClaro = textoNoPalco === '#FFFFFF';

	return s.slides.map((slide, i) => {
		const outros = Array.from({ length: total }, (_, k) => dois(k + 1)).filter((_, k) => k !== i);
		return {
			headerTagLeft: s.marca ?? '',
			headerTagRight: `${dois(i + 1)} / ${dois(total)}`,
			categoryTag: slide.categoria,
			categoryColor: acento,
			titleLine1: slide.titulo[0] ?? '',
			titleLine2: slide.titulo[1] ?? '',
			titleLine3: slide.titulo[2] ?? '',
			highlightWord: slide.destaque ?? '',
			gradientColors: [acento, acento],
			subtitle: slide.subtitulo ?? '',
			subtitleColor: texto,
			backgroundColor: fundo,
			textColor: texto,
			badgeNumber: dois(i + 1),
			badgeOthers: outros.join('  '),
			badgeOthersColor: palcoClaro ? 'rgba(255, 255, 255, 0.75)' : 'rgba(9, 9, 11, 0.7)',
			badgeCategory: slide.categoria.split(/\s+/).slice(0, 2).join(' '),
			badgeCategoryColor: textoNoPalco,
			stageHighlightWord: slide.palco?.destaque ?? slide.destaque ?? slide.titulo[0],
			stageRepeatedWord: slide.palco?.repetida ?? slide.categoria,
			stageWatermarkColor: palcoClaro ? 'rgba(255, 255, 255, 0.18)' : 'rgba(9, 9, 11, 0.16)',
			stageBgColor: acento,
			stageTextColor: textoNoPalco,
			underlineColor: texto,
			footerAuthor: s.autor ?? '',
			footerAction: i < total - 1 ? 'ARRASTA  →' : 'SALVE ESTE POST',
		};
	});
}
