/**
 * Pacotes de estilo (cores, legenda, HUD) em src/data/estilos/*.json.
 *   listarEstilos()      -> [{ id, nome, clima }]
 *   carregarEstilo(id)   -> pacote completo e validado (contraste, campos, variante de legenda)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { avaliarPacote } from '../src/timeline/gosto.ts';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'estilos');

function todos() {
	return fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
}

export function listarEstilos() {
	return todos().map(({ id, nome, clima }) => ({ id, nome, clima }));
}

export function carregarEstilo(id) {
	const pacote = todos().find((p) => p.id === id);
	if (!pacote) {
		throw new Error(`Estilo "${id}" não existe. Disponíveis: ${todos().map((p) => p.id).join(', ')}.`);
	}
	const { ok, problemas } = avaliarPacote(pacote);
	if (!ok) throw new Error(`Estilo "${id}" inválido: ${problemas.join('; ')}`);
	return pacote;
}
