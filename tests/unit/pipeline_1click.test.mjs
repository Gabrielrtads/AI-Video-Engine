import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  generateEstimatedWordTimestamps,
  calculatePunchZoomCuts,
  build1ClickTimelinePayload,
  resolveAspectRatioMetrics,
} from '../../src/timeline/pipeline1ClickMath.ts';
import { validateTimelineSchema } from '../../src/timeline/compileTimeline.ts';

describe('Vibe Design Studio — 1-Click Script-to-Video Pipeline Unit Tests', () => {
  describe('Estimador Fonético de Timestamps (generateEstimatedWordTimestamps)', () => {
    it('deve retornar array vazio para texto nulo, vazio ou duração não positiva', () => {
      assert.deepEqual(generateEstimatedWordTimestamps('', 10), []);
      assert.deepEqual(generateEstimatedWordTimestamps('   ', 10), []);
      assert.deepEqual(generateEstimatedWordTimestamps('teste', 0), []);
      assert.deepEqual(generateEstimatedWordTimestamps('teste', -5), []);
    });

    it('deve distribuir palavras cronologicamente dentro do intervalo de áudio', () => {
      const text = 'O futuro do design não é estático. É código vivo.';
      const totalSec = 6.0;
      const words = generateEstimatedWordTimestamps(text, totalSec);

      assert.ok(words.length > 5, 'Deve segmentar as palavras');
      assert.equal(words[0].text, 'O');

      // Verifica ordem temporal estrita
      for (let i = 0; i < words.length - 1; i++) {
        assert.ok(words[i].start <= words[i].end, `Palavra ${i} deve ter start <= end`);
        assert.ok(words[i].end <= words[i + 1].start + 0.05, `Palavra ${i} deve anteceder a próxima`);
      }

      // O último fim não deve ultrapassar a duração total
      assert.ok(words[words.length - 1].end <= totalSec);
    });

    it('deve atribuir mais tempo relativo para palavras longas ou com pontuação', () => {
      const text = 'a extraordinariamente!';
      const words = generateEstimatedWordTimestamps(text, 4.0);
      const durCurta = words[0].end - words[0].start;
      const durLonga = words[1].end - words[1].start;

      assert.ok(durLonga > durCurta * 2, 'Palavra longa com pontuação deve ter duração superior');
    });
  });

  describe('Cálculo de Cortes Rítmicos (calculatePunchZoomCuts)', () => {
    it('deve retornar cortes para áudios longos e vazio para curtos', () => {
      assert.deepEqual(calculatePunchZoomCuts(2.0, 3.0), []);
      const cuts = calculatePunchZoomCuts(12.0, 3.0);
      assert.ok(cuts.length >= 2, 'Deve gerar pelo menos 2 cortes para 12s');

      for (let i = 0; i < cuts.length - 1; i++) {
        assert.ok(cuts[i] < cuts[i + 1], 'Cortes devem estar em ordem crescente');
      }
    });
  });

  describe('Resolução de Proporções e Safe Zones (resolveAspectRatioMetrics)', () => {
    it('deve resolver 16:9 widescreen para YouTube (1920x1080) com safe zone inferior', () => {
      const m1 = resolveAspectRatioMetrics('16:9');
      assert.equal(m1.width, 1920);
      assert.equal(m1.height, 1080);
      assert.equal(m1.standardRatio, '16:9');
      assert.equal(m1.captionBottom, 110);
      assert.equal(m1.captionFontSize, 54);

      const m2 = resolveAspectRatioMetrics('horizontal');
      assert.equal(m2.width, 1920);
      assert.equal(m2.height, 1080);
      assert.equal(m2.standardRatio, '16:9');
    });

    it('deve resolver 9:16 vertical para Reels/TikTok (1080x1920)', () => {
      const m = resolveAspectRatioMetrics('9:16');
      assert.equal(m.width, 1080);
      assert.equal(m.height, 1920);
      assert.equal(m.standardRatio, '9:16');
      assert.equal(m.captionBottom, 420);
      assert.equal(m.captionFontSize, 70);
    });

    it('deve resolver 4:5 carrossel/feed (1080x1350)', () => {
      const m = resolveAspectRatioMetrics('4:5');
      assert.equal(m.width, 1080);
      assert.equal(m.height, 1350);
      assert.equal(m.standardRatio, '4:5');
      assert.equal(m.captionBottom, 220);
    });

    it('deve resolver 1:1 quadrado (1080x1080)', () => {
      const m = resolveAspectRatioMetrics('1:1');
      assert.equal(m.width, 1080);
      assert.equal(m.height, 1080);
      assert.equal(m.standardRatio, '1:1');
      assert.equal(m.captionBottom, 140);
    });

    it('deve inferir métricas a partir de dimensões customizadas', () => {
      const customWide = resolveAspectRatioMetrics(undefined, 2560, 1440);
      assert.equal(customWide.width, 2560);
      assert.equal(customWide.height, 1440);
      assert.equal(customWide.standardRatio, '16:9');
      assert.ok(customWide.captionBottom > 0);
    });
  });

  describe('Construtor da Linha do Tempo Declarativa (build1ClickTimelinePayload)', () => {
    it('deve gerar payload que passa 100% no validateTimelineSchema', () => {
      const payload = build1ClickTimelinePayload({
        text: 'Se você quer faturar alto, foque na escala.',
        audioDurationSeconds: 4.5,
        preset: 'hormozi',
        variant: 'classic-yellow',
        fps: 30,
        aspectRatio: '9:16',
      });

      const validation = validateTimelineSchema(payload);
      assert.equal(validation.valid, true, `Payload deve ser válido: ${validation.errors.join(', ')}`);
      assert.equal(payload.fps, 30);
      assert.equal(payload.width, 1080);
      assert.equal(payload.height, 1920);
      assert.ok(payload.durationInFrames > 120);
    });

    it('deve gerar payload Widescreen 16:9 para YouTube com validação total', () => {
      const payload = build1ClickTimelinePayload({
        text: 'Bem-vindo ao futuro da edição de vídeo guiada por inteligência artificial.',
        audioDurationSeconds: 6.0,
        preset: 'hormozi',
        aspectRatio: '16:9',
      });

      const validation = validateTimelineSchema(payload);
      assert.equal(validation.valid, true);
      assert.equal(payload.width, 1920);
      assert.equal(payload.height, 1080);

      const captionClip = payload.clips.find(
        (c) => c.kind === 'graphics' && c.componentName === 'HormoziKineticCaption'
      );
      assert.ok(captionClip, 'Deve conter clipe de legendas');
      assert.equal(captionClip.props.bottom, 110, 'Legenda deve estar posicionada no terço inferior 16:9');
      assert.equal(captionClip.props.fontSize, 54, 'Tamanho da fonte deve ser adaptado para widescreen');
    });

    it('deve conter clipes de retenção (HormoziKineticCaption, RetentionProgressBar) no preset hormozi', () => {
      const payload = build1ClickTimelinePayload({
        text: 'Dinheiro e foco geram lucro rápido!',
        audioDurationSeconds: 5.0,
        preset: 'hormozi',
      });

      const components = payload.clips
        .filter((c) => c.kind === 'graphics')
        .map((c) => c.componentName);
      assert.ok(components.includes('HormoziKineticCaption'), 'Deve ter HormoziKineticCaption');
      assert.ok(components.includes('RetentionProgressBar'), 'Deve ter RetentionProgressBar');
      assert.ok(components.includes('VectorHUDOverlay'), 'Deve ter VectorHUDOverlay');
      assert.ok(components.includes('Smartphone3DMockup'), 'Deve ter Smartphone3DMockup');
    });

    it('deve adaptar clipes ao preset editorial e keynote', () => {
      const payloadEditorial = build1ClickTimelinePayload({
        text: 'Elegância e minimalismo suíço.',
        audioDurationSeconds: 4.0,
        preset: 'editorial',
      });

      const componentsEd = payloadEditorial.clips
        .filter((c) => c.kind === 'graphics')
        .map((c) => c.componentName);
      assert.ok(componentsEd.includes('AppleKineticCard3D'), 'Editorial deve ter AppleKineticCard3D');
      assert.ok(componentsEd.includes('HormoziKineticCaption'), 'Editorial deve ter legendas');

      const payloadKeynote = build1ClickTimelinePayload({
        text: 'Apresentação Widescreen de Produto estilo Apple Keynote.',
        audioDurationSeconds: 5.0,
        preset: 'keynote',
        aspectRatio: '16:9',
      });
      assert.equal(payloadKeynote.width, 1920);
      assert.equal(payloadKeynote.height, 1080);
      const componentsKey = payloadKeynote.clips
        .filter((c) => c.kind === 'graphics')
        .map((c) => c.componentName);
      assert.ok(componentsKey.includes('AppleKineticCard3D'), 'Keynote deve ter AppleKineticCard3D');
    });
  });
});
