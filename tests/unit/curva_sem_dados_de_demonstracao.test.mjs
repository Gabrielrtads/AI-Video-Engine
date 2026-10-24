/**
 * A curva que aparece nas cenas de um reel não pode mostrar os valores de demonstração do componente
 * ("$12k ... $142k"): o espectador leria dinheiro que ninguém falou. Sem número no roteiro, a curva é só forma.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { build1ClickTimelinePayload } from '../../src/timeline/pipeline1ClickMath.ts';

const ROTEIRO = 'A agenda lota e o caixa cresce todo mês. Sem falta, sem buraco no dia. Você só corta cabelo. O resto roda sozinho.';

test('cena de curva: pontos calculados na área do clipe e nenhum valor de demonstração', () => {
  const tl = build1ClickTimelinePayload({ text: ROTEIRO, audioDurationSeconds: 14, preset: 'tech', aspectRatio: '9:16' });
  const curvas = tl.clips.filter((c) => c.componentName === 'AnimatedBezierCurve');
  assert.ok(curvas.length > 0, 'o preset tech deveria usar a curva em alguma cena');
  for (const c of curvas) {
    assert.ok(Array.isArray(c.props.points) && c.props.points.length >= 5, 'sem pontos próprios o componente usa os de demonstração');
    assert.ok(c.props.points.every((p) => p.value === undefined && p.label === undefined), 'a curva decorativa não mostra números');
    assert.ok(c.props.points.every((p) => p.x <= c.props.width && p.y <= c.props.height), 'ponto fora da área da curva');
  }
  assert.ok(!JSON.stringify(tl).includes('$12k'));
});
