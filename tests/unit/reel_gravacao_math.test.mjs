/**
 * Timeline do "reel com a minha gravação": o vídeo do usuário ocupa a duração toda, com legenda Hormozi
 * cobrindo a fala e a barra de retenção por cima. Funções puras, sem Remotion.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { buildReelGravacaoTimeline } from '../../src/timeline/reelGravacaoMath.ts';
import { validateTimelineSchema } from '../../src/timeline/compileTimeline.ts';

const palavras = [
  { text: 'Fala', start: 0.2, end: 0.5 },
  { text: 'pessoal,', start: 0.5, end: 1.0 },
  { text: 'bora', start: 1.2, end: 1.5 },
  { text: 'começar.', start: 1.5, end: 2.2 },
];

test('o vídeo do usuário ocupa a duração toda, no início, com áudio original', () => {
  const t = buildReelGravacaoTimeline({ videoSrc: 'input/take_atual.mp4', duracaoSegundos: 4, words: palavras });
  const video = t.clips.find((c) => c.kind === 'video');
  assert.ok(video, 'precisa de um clipe de vídeo');
  assert.equal(video.src, 'input/take_atual.mp4');
  assert.equal(video.startFrame, 0);
  assert.equal(video.durationInFrames, t.durationInFrames);
  assert.equal(video.volume, 1);
  assert.equal(t.durationInFrames, 120, '4 s a 30 fps');
});

test('legenda Hormozi recebe as palavras e a barra de retenção cobre o vídeo', () => {
  const t = buildReelGravacaoTimeline({ videoSrc: 'input/take_atual.mp4', duracaoSegundos: 4, words: palavras });
  const legenda = t.clips.find((c) => c.componentName === 'HormoziKineticCaption');
  assert.ok(legenda);
  assert.deepEqual(legenda.props.words, palavras);
  assert.equal(legenda.props.windowSize, 1);
  const barra = t.clips.find((c) => c.componentName === 'RetentionProgressBar');
  assert.ok(barra);
  assert.equal(barra.durationInFrames, t.durationInFrames);
});

test('as faixas ficam em ordem de camada: vídeo embaixo, retenção e legenda por cima', () => {
  const t = buildReelGravacaoTimeline({ videoSrc: 'a.mp4', duracaoSegundos: 3, words: palavras });
  const z = Object.fromEntries(t.tracks.map((tr) => [tr.id, tr.zIndex]));
  assert.ok(z.T_VIDEO < z.T_RETENTION && z.T_RETENTION < z.T_CAPTIONS);
  for (const clip of t.clips) assert.ok(z[clip.trackId] !== undefined, `clipe ${clip.id} sem faixa`);
});

test('a timeline passa no validador do estúdio', () => {
  const t = buildReelGravacaoTimeline({ videoSrc: 'input/take_atual.mp4', duracaoSegundos: 4, words: palavras });
  assert.equal(validateTimelineSchema(t).valid, true, JSON.stringify(validateTimelineSchema(t)));
});

test('formato 4:5 e 16:9 mudam as dimensões; 9:16 é o padrão', () => {
  const v = (aspecto) => buildReelGravacaoTimeline({ videoSrc: 'a.mp4', duracaoSegundos: 3, words: palavras, aspectRatio: aspecto });
  assert.deepEqual([v().width, v().height], [1080, 1920]);
  assert.deepEqual([v('4:5').width, v('4:5').height], [1080, 1350]);
  assert.deepEqual([v('16:9').width, v('16:9').height], [1920, 1080]);
});

test('sem palavras o reel sai sem legenda (e o chamador decide se isso é aceitável)', () => {
  const t = buildReelGravacaoTimeline({ videoSrc: 'a.mp4', duracaoSegundos: 3, words: [] });
  assert.equal(t.clips.some((c) => c.componentName === 'HormoziKineticCaption'), false);
});

test('duração inválida é recusada', () => {
  assert.throws(() => buildReelGravacaoTimeline({ videoSrc: 'a.mp4', duracaoSegundos: 0, words: palavras }), /duração/i);
  assert.throws(() => buildReelGravacaoTimeline({ videoSrc: '', duracaoSegundos: 3, words: palavras }), /vídeo/i);
});
