/**
 * Bom gosto como regra medida (não opinião): contraste de cor, variedade de cenas, zona segura e pacotes de
 * estilo coerentes. O julgamento final é de quem olha a tela, mas o piso é automático.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { razaoDeContraste, avaliarPacote, avaliarVariedade, dentroDaZonaSegura } from '../../src/timeline/gosto.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('razaoDeContraste: valores conhecidos da WCAG', () => {
  assert.equal(Math.round(razaoDeContraste('#000000', '#FFFFFF') * 100) / 100, 21);
  assert.equal(razaoDeContraste('#FFFFFF', '#FFFFFF'), 1);
  const cinza = razaoDeContraste('#777777', '#FFFFFF');
  assert.ok(cinza > 4.4 && cinza < 4.6, `cinza 777 sobre branco: ${cinza}`);
  assert.equal(razaoDeContraste('#FFF', '#000'), razaoDeContraste('#ffffff', '#000000'), 'aceita #RGB e ignora caixa');
});

test('razaoDeContraste recusa cor inválida', () => {
  assert.throws(() => razaoDeContraste('azul', '#fff'), /cor/i);
});

const base = { id: 'x', nome: 'X', clima: 'teste', fundo: '#05070D', fundo2: '#0B1220', texto: '#F8FAFC', acento: '#38BDF8', captionVariant: 'cyber-cyan', hud: true };

test('avaliarPacote: pacote legível passa', () => {
  assert.deepEqual(avaliarPacote(base), { ok: true, problemas: [] });
});

test('avaliarPacote: texto ilegível, acento apagado e variante inexistente reprovam', () => {
  const r = avaliarPacote({ ...base, texto: '#222222', acento: '#0B1220', captionVariant: 'neon-rosa' });
  assert.equal(r.ok, false);
  assert.ok(r.problemas.some((p) => /texto/i.test(p)));
  assert.ok(r.problemas.some((p) => /acento/i.test(p)));
  assert.ok(r.problemas.some((p) => /captionVariant|variante/i.test(p)));
});

test('avaliarPacote: campo obrigatório ausente reprova', () => {
  const { fundo, ...sem } = base;
  assert.equal(avaliarPacote(sem).ok, false);
});

test('avaliarVariedade: nunca o mesmo componente em cenas seguidas', () => {
  const r = avaliarVariedade(['Smartphone3DMockup', 'Smartphone3DMockup', 'FraseDestaque']);
  assert.equal(r.ok, false);
  assert.equal(r.repetidosEmSequencia, 1);
});

test('avaliarVariedade: com 4 ou mais cenas exige pelo menos 3 visuais distintos', () => {
  assert.equal(avaliarVariedade(['A', 'B', 'A', 'B']).ok, false);
  assert.equal(avaliarVariedade(['A', 'B', 'C', 'A']).ok, true);
});

test('avaliarVariedade: vídeo curto (1 a 3 cenas) só exige não repetir em sequência', () => {
  assert.equal(avaliarVariedade(['A']).ok, true);
  assert.equal(avaliarVariedade(['A', 'B', 'A']).ok, true);
});

test('dentroDaZonaSegura (9:16): 20% livre no topo e 25% embaixo', () => {
  assert.equal(dentroDaZonaSegura({ topo: 400, base: 1400 }, 1920), true);
  assert.equal(dentroDaZonaSegura({ topo: 100, base: 600 }, 1920), false, 'invade o topo');
  assert.equal(dentroDaZonaSegura({ topo: 800, base: 1700 }, 1920), false, 'invade a base');
});

test('todos os pacotes de estilo em src/data/estilos são legíveis e completos', () => {
  const dir = path.join(root, 'src', 'data', 'estilos');
  const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  assert.ok(arquivos.length >= 6, `esperava ao menos 6 pacotes, achou ${arquivos.length}`);
  const ids = new Set();
  for (const f of arquivos) {
    const pacote = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    assert.equal(pacote.id, f.replace('.json', ''), `${f}: id deve ser o nome do arquivo`);
    ids.add(pacote.id);
    const r = avaliarPacote(pacote);
    assert.deepEqual(r.problemas, [], `${f}: ${r.problemas.join('; ')}`);
  }
  assert.equal(ids.size, arquivos.length);
});
