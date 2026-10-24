/**
 * Variedade com sentido: a receita visual de cada cena vem do CONTEÚDO da frase (número, pergunta, chamada
 * para ação) e, quando a frase não pede nada em especial, de uma rotação determinística que nunca repete
 * o visual da cena anterior.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { extrairNumero, classificarCena, escolherReceitas, receitaParaVisual } from '../../src/timeline/sceneVisuals.ts';
import { avaliarVariedade } from '../../src/timeline/gosto.ts';

const cena = (indice, texto) => ({ indice, texto, startFrame: (indice - 1) * 60, durationInFrames: 60 });

test('extrairNumero: percentual, moeda, multiplicador, "mil" e decimal', () => {
  assert.deepEqual(extrairNumero('Aumente em 70% as vendas'), { valor: 70, decimais: 0, prefixo: '', sufixo: '%' });
  assert.deepEqual(extrairNumero('Por apenas R$ 127,97 por mês'), { valor: 127.97, decimais: 2, prefixo: 'R$ ', sufixo: '' });
  assert.deepEqual(extrairNumero('Triplique: 3x mais clientes'), { valor: 3, decimais: 0, prefixo: '', sufixo: 'x' });
  assert.deepEqual(extrairNumero('Mais de 10 mil barbearias'), { valor: 10, decimais: 0, prefixo: '', sufixo: ' mil' });
});

test('extrairNumero: ignora anos e contagens pequenas sem unidade', () => {
  assert.equal(extrairNumero('Desde 2024 mudou tudo'), null);
  assert.equal(extrairNumero('Em 3 passos simples'), null);
  assert.equal(extrairNumero('Sem número nenhum aqui'), null);
});

test('classificarCena: cta só na última cena, com verbo de ação', () => {
  assert.equal(classificarCena(cena(3, 'Comece hoje mesmo.'), true), 'cta');
  assert.equal(classificarCena(cena(1, 'Comece hoje mesmo.'), false), null, 'verbo de ação no meio não é CTA');
  assert.equal(classificarCena(cena(3, 'Agende sua demonstração agora.'), true), 'cta');
});

test('classificarCena: pergunta e número; CTA vence número na última cena', () => {
  assert.equal(classificarCena(cena(1, 'Você sabe quanto perde por semana?'), false), 'pergunta');
  assert.equal(classificarCena(cena(2, 'Barbearias perdem 30% dos clientes.'), false), 'numero');
  assert.equal(classificarCena(cena(4, 'Teste grátis por 7 dias com 100% de garantia.'), true), 'cta');
});

test('escolherReceitas: nunca repete o visual da cena anterior, mesmo com 8 cenas banais', () => {
  const cenas = Array.from({ length: 8 }, (_, i) => cena(i + 1, `Frase comum número ${'a'.repeat(i + 1)} sobre trabalho.`));
  for (const preset of ['hormozi', 'editorial', 'tech']) {
    const receitas = escolherReceitas(cenas, preset);
    assert.equal(receitas.length, 8);
    for (let i = 1; i < receitas.length; i++) assert.notEqual(receitas[i], receitas[i - 1], `${preset}: cena ${i + 1} repete a anterior`);
  }
});

test('escolherReceitas: com 4+ cenas há pelo menos 3 receitas distintas', () => {
  const cenas = [1, 2, 3, 4, 5].map((i) => cena(i, `Cena banal ${i}.`));
  for (const preset of ['hormozi', 'editorial', 'tech']) {
    assert.ok(new Set(escolherReceitas(cenas, preset)).size >= 3, preset);
  }
});

test('escolherReceitas: conteúdo manda (número, pergunta, CTA aparecem nas cenas certas)', () => {
  const cenas = [cena(1, 'Você perde clientes toda semana?'), cena(2, 'Isso custa 40% do seu faturamento.'), cena(3, 'Existe um jeito simples.'), cena(4, 'Agende agora mesmo.')];
  assert.deepEqual(escolherReceitas(cenas, 'hormozi').filter((_, i) => i !== 2).sort(), ['cta', 'numero', 'pergunta']);
  const r = escolherReceitas(cenas, 'hormozi');
  assert.equal(r[0], 'pergunta');
  assert.equal(r[1], 'numero');
  assert.equal(r[3], 'cta');
});

test('escolherReceitas é determinística (mesmo roteiro, mesma escolha)', () => {
  const cenas = [1, 2, 3, 4].map((i) => cena(i, `Texto qualquer ${i}.`));
  assert.deepEqual(escolherReceitas(cenas, 'hormozi'), escolherReceitas(cenas, 'hormozi'));
});

const estilo = { id: 'escuro-tech', fundo: '#05070D', fundo2: '#0B1220', texto: '#F8FAFC', acento: '#38BDF8', captionVariant: 'cyber-cyan', hud: true, planeta: 'cyber-blue', cartao: 'dark-glass' };

test('receitaParaVisual: cada receita vira um componente do catálogo com o conteúdo da cena e as cores do estilo', () => {
  const v = (r, t) => receitaParaVisual(r, cena(1, t), estilo);
  assert.deepEqual(v('numero', 'Aumente em 70% as vendas'), { componentName: 'NumeroDestaque', props: { valor: 70, decimais: 0, prefixo: '', sufixo: '%', rotulo: 'Aumente em 70% as vendas', corTexto: '#F8FAFC', corAcento: '#38BDF8' }, chave: 'NumeroDestaque' });
  assert.equal(v('pergunta', 'Quanto você perde?').componentName, 'FraseDestaque');
  assert.equal(v('pergunta', 'Quanto você perde?').props.variant, 'pergunta');
  assert.equal(v('cta', 'Agende agora.').props.variant, 'cta');
  assert.equal(v('frase', 'Barbearia cheia é sistema.').props.corAcento, '#38BDF8');
  assert.equal(v('celular', 'Uma frase.').componentName, 'Smartphone3DMockup');
  assert.equal(v('cartao', 'Uma frase.').componentName, 'FraseDestaque');
  assert.equal(v('cartao', 'Uma frase.').props.variant, 'cartao');
  assert.equal(v('planeta', 'Uma frase.').props.theme, 'cyber-blue');
  assert.equal(v('curva', 'Uma frase.').props.strokeColor, '#38BDF8');
});

test('receitaParaVisual: a chave de variedade distingue variantes do mesmo componente', () => {
  const chave = (r) => receitaParaVisual(r, cena(1, 'Qual o problema?'), estilo).chave;
  assert.notEqual(chave('pergunta'), chave('cta'));
  assert.notEqual(chave('pergunta'), chave('frase'));
  const chaves = ['pergunta', 'frase', 'cta', 'cartao'].map(chave);
  assert.equal(avaliarVariedade(chaves).ok, true);
});

test('nenhum texto de demonstração em nenhuma receita', () => {
  for (const r of ['celular', 'cartao', 'planeta', 'frase', 'curva', 'numero', 'pergunta', 'cta']) {
    const dump = JSON.stringify(receitaParaVisual(r, cena(1, 'Minha frase real'), estilo));
    for (const demo of ['Vibe Studio Mobile', 'vibe.studio/preview', 'Editorial Showcase', 'Apple Card', 'APPLE KINETIC']) assert.ok(!dump.includes(demo), `${r} vazou "${demo}"`);
  }
});
