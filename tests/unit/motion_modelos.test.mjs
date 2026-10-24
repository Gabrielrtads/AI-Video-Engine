/**
 * Modelos de motion graphics sem narração: o agente escolhe um modelo FECHADO e preenche os campos;
 * o resto (fundo, cena, tempo, cores, geometria) vem do código. Spec ruim é recusada com a instrução de conserto.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { MODELOS, EXEMPLOS, validarMotionSpec, montarTimelineMotion, descreverModelos } from '../../src/timeline/motionModelos.ts';
import { validateTimelineSchema } from '../../src/timeline/compileTimeline.ts';
import { isCanonicalComponent } from '../../src/timeline/componentCatalog.ts';
import { ESTILO_PADRAO } from '../../src/timeline/pipeline1ClickMath.ts';

const clonar = (o) => JSON.parse(JSON.stringify(o));

test('catálogo fechado de modelos: titulo-cinetico, cartao-de-marca e dataviz', () => {
  assert.deepEqual(Object.keys(MODELOS).sort(), ['cartao-de-marca', 'dataviz', 'titulo-cinetico']);
  for (const m of descreverModelos()) {
    assert.ok(m.descricao.length > 15 && m.campos.length > 0, m.id);
  }
});

test('todo exemplo oficial é uma spec válida (o exemplo que o agente copia nunca pode estar quebrado)', () => {
  for (const [id, exemplo] of Object.entries(EXEMPLOS)) {
    const r = validarMotionSpec(exemplo);
    assert.deepEqual(r.erros, [], `exemplo ${id}`);
    assert.equal(r.ok, true);
  }
});

test('validação: modelo desconhecido lista os disponíveis', () => {
  const r = validarMotionSpec({ ...clonar(EXEMPLOS['titulo-cinetico']), modelo: 'explosao-de-particulas' });
  assert.equal(r.ok, false);
  assert.match(r.erros.join(' '), /titulo-cinetico/);
  assert.match(r.erros.join(' '), /cartao-de-marca/);
});

test('validação: campo inventado na raiz ou no conteúdo é recusado com o nome', () => {
  const a = clonar(EXEMPLOS.dataviz);
  a.corMagica = '#fff';
  assert.match(validarMotionSpec(a).erros.join(' '), /corMagica/);
  const b = clonar(EXEMPLOS['cartao-de-marca']);
  b.conteudo.fonteGigante = true;
  assert.match(validarMotionSpec(b).erros.join(' '), /fonteGigante/);
});

test('validação: formato precisa ser um dos suportados e o nome um slug', () => {
  assert.match(validarMotionSpec({ ...clonar(EXEMPLOS.dataviz), formato: '3:2' }).erros.join(' '), /formato/);
  assert.match(validarMotionSpec({ ...clonar(EXEMPLOS.dataviz), nome: 'Meu Vídeo!' }).erros.join(' '), /nome/);
});

test('titulo-cinetico: 1 a 4 linhas curtas', () => {
  const base = clonar(EXEMPLOS['titulo-cinetico']);
  base.conteudo.linhas = [];
  assert.match(validarMotionSpec(base).erros.join(' '), /linhas/);
  base.conteudo.linhas = ['a', 'b', 'c', 'd', 'e'];
  assert.match(validarMotionSpec(base).erros.join(' '), /linhas/);
  base.conteudo.linhas = ['x'.repeat(70)];
  assert.match(validarMotionSpec(base).erros.join(' '), /caracteres/);
});

test('cartao-de-marca: marca obrigatória e curta; slogan e selo opcionais com limite', () => {
  const base = clonar(EXEMPLOS['cartao-de-marca']);
  delete base.conteudo.marca;
  assert.match(validarMotionSpec(base).erros.join(' '), /marca/);
  base.conteudo.marca = 'M'.repeat(40);
  assert.match(validarMotionSpec(base).erros.join(' '), /marca/);
  base.conteudo.marca = 'Barbearia Flow';
  base.conteudo.slogan = 's'.repeat(100);
  assert.match(validarMotionSpec(base).erros.join(' '), /slogan/);
});

test('dataviz: precisa de números ou de uma série; limites de quantidade e de valores', () => {
  const base = clonar(EXEMPLOS.dataviz);
  base.conteudo = { titulo: 'Só um título' };
  assert.match(validarMotionSpec(base).erros.join(' '), /numeros|serie/);
  base.conteudo = { numeros: Array.from({ length: 4 }, (_, i) => ({ valor: i + 1, rotulo: 'x' })) };
  assert.match(validarMotionSpec(base).erros.join(' '), /numeros/);
  base.conteudo = { serie: { valores: [1, 2] } };
  assert.match(validarMotionSpec(base).erros.join(' '), /serie/);
  base.conteudo = { numeros: [{ valor: 'muitos', rotulo: 'x' }] };
  assert.match(validarMotionSpec(base).erros.join(' '), /valor/);
});

test('timeline do titulo-cinetico: fundo do estilo + uma cena por linha, sem áudio, cenas coladas', () => {
  const spec = clonar(EXEMPLOS['titulo-cinetico']);
  const tl = montarTimelineMotion(spec, ESTILO_PADRAO);
  assert.equal(validateTimelineSchema(tl).valid, true);
  assert.equal(tl.clips.some((c) => c.kind === 'audio'), false, 'motion sem narração não leva áudio');
  const fundo = tl.clips.filter((c) => c.componentName === 'FundoEstilo');
  assert.equal(fundo.length, 1);
  assert.equal(fundo[0].durationInFrames, tl.durationInFrames);
  const cenas = tl.clips.filter((c) => c.trackId === 'T_HERO').sort((a, b) => a.startFrame - b.startFrame);
  assert.equal(cenas.length, spec.conteudo.linhas.length);
  assert.equal(cenas[0].startFrame, 0);
  for (let i = 1; i < cenas.length; i++) assert.equal(cenas[i].startFrame, cenas[i - 1].startFrame + cenas[i - 1].durationInFrames);
  const ultima = cenas[cenas.length - 1];
  assert.equal(ultima.startFrame + ultima.durationInFrames, tl.durationInFrames);
  assert.deepEqual(cenas.map((c) => c.props.texto), spec.conteudo.linhas);
});

test('todo componente usado vem do catálogo e o texto é só o do spec', () => {
  for (const [id, exemplo] of Object.entries(EXEMPLOS)) {
    const tl = montarTimelineMotion(clonar(exemplo), ESTILO_PADRAO);
    for (const c of tl.clips) assert.ok(isCanonicalComponent(c.componentName), `${id}: ${c.componentName} fora do catálogo`);
    const dump = JSON.stringify(tl);
    for (const demo of ['APPLE KINETIC', 'Apple Card', '$12k', '$142k', 'Vibe Studio Mobile']) assert.ok(!dump.includes(demo), `${id}: vazou "${demo}"`);
  }
});

test('cartao-de-marca: o cartão leva marca, slogan e selo do spec e badge vazio quando não há selo', () => {
  const spec = clonar(EXEMPLOS['cartao-de-marca']);
  delete spec.conteudo.selo;
  const tl = montarTimelineMotion(spec, ESTILO_PADRAO);
  const cartao = tl.clips.find((c) => c.componentName === 'AppleKineticCard3D');
  assert.equal(cartao.props.title, spec.conteudo.marca);
  assert.equal(cartao.props.subtitle, spec.conteudo.slogan);
  assert.equal(cartao.props.badge, '', 'sem selo, o selo de demonstração do componente não pode aparecer');
});

test('dataviz: números viram NumeroDestaque e a série vira curva com os valores reais formatados', () => {
  const spec = clonar(EXEMPLOS.dataviz);
  const tl = montarTimelineMotion(spec, ESTILO_PADRAO);
  const cenas = tl.clips.filter((c) => c.trackId === 'T_HERO').sort((a, b) => a.startFrame - b.startFrame);
  const numeros = cenas.filter((c) => c.componentName === 'NumeroDestaque');
  assert.equal(numeros.length, spec.conteudo.numeros.length);
  assert.equal(numeros[0].props.valor, spec.conteudo.numeros[0].valor);
  const curva = cenas.find((c) => c.componentName === 'AnimatedBezierCurve');
  assert.ok(curva, 'a série deveria virar uma curva');
  assert.equal(curva.props.points.length, spec.conteudo.serie.valores.length);
  assert.ok(curva.props.points.every((p) => typeof p.value === 'string' && p.value.length > 0));
});

test('formato muda a resolução da timeline', () => {
  const spec = { ...clonar(EXEMPLOS['titulo-cinetico']), formato: '16:9' };
  const tl = montarTimelineMotion(spec, ESTILO_PADRAO);
  assert.equal(tl.width, 1920);
  assert.equal(tl.height, 1080);
});

test('montarTimelineMotion recusa spec inválida em vez de montar lixo', () => {
  assert.throws(() => montarTimelineMotion({ modelo: 'dataviz' }, ESTILO_PADRAO), /inválida/i);
});

test('cartao-de-marca: o cartão é escalado para ocupar boa parte da tela em qualquer formato, sem estourar', () => {
  for (const formato of ['9:16', '4:5', '16:9', '1:1']) {
    const tl = montarTimelineMotion({ ...clonar(EXEMPLOS['cartao-de-marca']), formato }, ESTILO_PADRAO);
    const { props } = tl.clips.find((c) => c.componentName === 'AppleKineticCard3D');
    assert.ok(props.escala >= 1, `${formato}: o cartão base de 540 px é pequeno demais para um vídeo de ${tl.width} px`);
    const larg = 540 * props.escala;
    const alt = 340 * props.escala;
    assert.ok(larg <= tl.width * 0.82 && alt <= tl.height * 0.6, `${formato}: cartão ${Math.round(larg)}x${Math.round(alt)} estoura ${tl.width}x${tl.height}`);
    assert.ok(larg >= tl.width * 0.4, `${formato}: cartão ocupa só ${Math.round((larg / tl.width) * 100)}% da largura`);
  }
});

test('dataviz: a curva é desenhada pequena e escalada, para o texto dos pontos ficar legível no vídeo', () => {
  for (const formato of ['9:16', '4:5', '16:9', '1:1']) {
    const tl = montarTimelineMotion({ ...clonar(EXEMPLOS.dataviz), formato }, ESTILO_PADRAO);
    const { props } = tl.clips.find((c) => c.componentName === 'AnimatedBezierCurve');
    assert.ok(props.escala > 1.2, `${formato}: sem escala o texto de 10 px some num vídeo de ${tl.width} px`);
    assert.ok(props.width * props.escala <= tl.width * 0.9 && props.height * props.escala <= tl.height * 0.55, `${formato}: curva estoura a tela`);
    assert.ok(props.points.every((p) => p.x <= props.width && p.y <= props.height), `${formato}: ponto fora da área`);
  }
});
