/**
 * Spec do carrossel estático: valida antes de renderizar e converte cada slide nas props do
 * CarrosselEditorial, sem deixar vazar os textos de demonstração do componente.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { validarSpec, slidesParaProps } from '../../src/timeline/carrosselSpec.ts';

const slide = (extra = {}) => ({ categoria: 'BARBEARIA CHEIA', titulo: ['SEU CAIXA', 'NÃO ESQUECE', 'DE'], destaque: 'NINGUÉM', subtitulo: 'Lembretes automáticos trazem o cliente de volta.', palco: { destaque: 'AGENDA CHEIA', repetida: 'SEM FALTAS' }, ...extra });
const spec = (extra = {}) => ({ nome: 'barbearia', estilo: 'uniforme', destino: 'estatico', autor: '@gabriel', slides: [slide(), slide({ titulo: ['O NO-SHOW', 'CUSTA'], destaque: 'CARO' }), slide({ titulo: ['AGENDE'], destaque: 'AGORA' })], ...extra });

test('spec válido passa', () => {
  assert.deepEqual(validarSpec(spec()), { ok: true, erros: [] });
});

test('protocolo Grill-Me: sem estilo (uniforme|individual) ou destino (estatico|animado) é recusado', () => {
  const semEstilo = validarSpec(spec({ estilo: undefined }));
  assert.equal(semEstilo.ok, false);
  assert.match(semEstilo.erros.join(' '), /estilo/);
  assert.equal(validarSpec(spec({ destino: 'impresso' })).ok, false);
  assert.equal(validarSpec(spec({ estilo: 'individual', destino: 'animado' })).ok, true);
});

test('número de slides: de 2 a 10', () => {
  assert.equal(validarSpec(spec({ slides: [slide()] })).ok, false);
  assert.equal(validarSpec(spec({ slides: Array.from({ length: 11 }, () => slide()) })).ok, false);
  assert.equal(validarSpec(spec({ slides: Array.from({ length: 10 }, () => slide()) })).ok, true);
});

test('campo inventado em slide ou na raiz é recusado com o nome do campo', () => {
  const r = validarSpec(spec({ slides: [slide({ corDeFundoMagica: '#fff' }), slide()] }));
  assert.equal(r.ok, false);
  assert.match(r.erros.join(' '), /corDeFundoMagica/);
  assert.match(validarSpec(spec({ extra: 1 })).erros.join(' '), /extra/);
});

test('título: 1 a 3 linhas curtas; destaque é linha própria e não pode repetir uma linha do título', () => {
  assert.equal(validarSpec(spec({ slides: [slide({ titulo: [] }), slide()] })).ok, false);
  assert.equal(validarSpec(spec({ slides: [slide({ titulo: ['A', 'B', 'C', 'D'] }), slide()] })).ok, false);
  assert.match(validarSpec(spec({ slides: [slide({ titulo: ['UMA LINHA ENORME QUE NÃO CABE NO SLIDE DE JEITO NENHUM'] }), slide()] })).erros.join(' '), /curta|caracteres/i);
  assert.match(validarSpec(spec({ slides: [slide({ titulo: ['SEU CAIXA', 'NINGUÉM'], destaque: 'NINGUÉM' }), slide()] })).erros.join(' '), /repete uma linha/);
  assert.equal(validarSpec(spec({ slides: [slide({ destaque: 'QUALQUER OUTRA' }), slide()] })).ok, true, 'destaque novo, em linha própria, é válido');
  assert.match(validarSpec(spec({ slides: [slide({ palco: { destaque: 'UMA FRASE LONGA DEMAIS' } }), slide()] })).erros.join(' '), /palco\.destaque/);
});

test('subtítulo curto e estilo visual precisa existir quando informado', () => {
  assert.equal(validarSpec(spec({ slides: [slide({ subtitulo: 'x'.repeat(200) }), slide()] })).ok, false);
});

test('slidesParaProps: numeração, rodapé e palco vêm do spec (nenhum texto de demonstração)', () => {
  const props = slidesParaProps(spec());
  assert.equal(props.length, 3);
  assert.equal(props[0].badgeNumber, '01');
  assert.equal(props[0].badgeOthers, '02  03');
  assert.equal(props[1].badgeNumber, '02');
  assert.equal(props[1].badgeOthers, '01  03');
  assert.equal(props[0].titleLine1, 'SEU CAIXA');
  assert.equal(props[0].titleLine3, 'DE');
  assert.equal(props[0].highlightWord, 'NINGUÉM');
  assert.equal(props[0].stageHighlightWord, 'AGENDA CHEIA');
  assert.equal(props[0].footerAuthor, '@gabriel');
  assert.match(props[0].footerAction, /ARRASTA/);
  assert.match(props[2].footerAction, /SALVE/);
  assert.equal(props[1].titleLine3, '', 'linha ausente vira vazia, não herda texto do componente');
  const dump = JSON.stringify(props);
  for (const demo of ['ZERO SLOP', 'GABRIEL TOLEDO', 'CÓDIGO PURO', 'SEM SLOP', 'VIBE DESIGN STUDIO', 'O FIM DOS']) assert.ok(!dump.includes(demo), `vazou "${demo}"`);
});

test('slidesParaProps aplica as cores do pacote de estilo, com texto do palco legível', () => {
  const estilo = { fundo: '#F4EFE6', fundo2: '#E8E0D0', texto: '#1C1917', acento: '#B91C1C' };
  const props = slidesParaProps(spec(), estilo);
  assert.equal(props[0].backgroundColor, '#F4EFE6');
  assert.equal(props[0].textColor, '#1C1917');
  assert.equal(props[0].stageBgColor, '#B91C1C');
  assert.equal(props[0].categoryColor, '#B91C1C');
  assert.ok(['#FFFFFF', '#09090B'].includes(props[0].stageTextColor));
});

test('slidesParaProps recusa spec inválido', () => {
  assert.throws(() => slidesParaProps(spec({ estilo: undefined })), /estilo/);
});
