/**
 * Testes Unitários e E2E para o Módulo de Timeline e Ferramentas MCP
 * Suíte nativa Node.js (node:test + node:assert). Zero dependências externas.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  frameToPixel,
  pixelToFrame,
  formatFrameToTimestamp,
  snapToNearestClip,
  assertValidTimeline,
} from '../../src/timeline/timelineMath.ts';
import { VIBE_STUDIO_MCP_TOOLS } from '../../src/mcp/vibeStudioTools.ts';

describe('Vibe Design Studio: Timeline Math & MCP Tools', () => {
  describe('Timeline Math (Conversão e Snapping em Frames)', () => {
    it('deve converter frames para pixels corretamente com escala 2.0x', () => {
      assert.equal(frameToPixel(0, 2.0), 0);
      assert.equal(frameToPixel(30, 2.0), 60);
      assert.equal(frameToPixel(900, 2.0), 1800);
      assert.equal(frameToPixel(-10, 2.0), 0, 'frames negativos devem ser clampados a zero');
    });

    it('deve converter pixels para frames inteiros arredondados', () => {
      assert.equal(pixelToFrame(60, 2.0), 30);
      assert.equal(pixelToFrame(61, 2.0), 31);
      assert.equal(pixelToFrame(0, 2.0), 0);
      assert.equal(pixelToFrame(-10, 2.0), 0, 'não deve permitir frames negativos');
    });

    it('deve formatar timecode em mm:ss:ff com precisão de 30fps', () => {
      assert.equal(formatFrameToTimestamp(0, 30), '00:00:00');
      assert.equal(formatFrameToTimestamp(15, 30), '00:00:15');
      assert.equal(formatFrameToTimestamp(30, 30), '00:01:00');
      assert.equal(formatFrameToTimestamp(900, 30), '00:30:00');
      assert.equal(formatFrameToTimestamp(1835, 30), '01:01:05');
    });

    it('deve formatar timecode longo em hh:mm:ss:ff quando exceder 1 hora', () => {
      // 1 hora = 3600s = 108000 frames a 30fps
      assert.equal(formatFrameToTimestamp(108000, 30), '01:00:00:00');
      assert.equal(formatFrameToTimestamp(108035, 30), '01:00:01:05');
    });

    it('deve realizar snap magnético para o início ou fim de clipes vizinhos', () => {
      const mockClips = [
        { id: 'clip1', trackId: 'V1', startFrame: 0, durationInFrames: 90 }, // 0 a 90
        { id: 'clip2', trackId: 'V1', startFrame: 150, durationInFrames: 60 }, // 150 a 210
      ];

      // Alvo no frame 88 (tolerância 5 frames): deve pular para 90
      const snappedEnd = snapToNearestClip(88, mockClips, 5);
      assert.equal(snappedEnd, 90, 'deve atrair para o fim do clip1 (frame 90)');

      // Alvo no frame 152 (tolerância 5 frames): deve pular para 150
      const snappedStart = snapToNearestClip(152, mockClips, 5);
      assert.equal(snappedStart, 150, 'deve atrair para o início do clip2 (frame 150)');

      // Alvo no frame 120 (longe dos clipes): não deve sofrer snap
      const unsnapped = snapToNearestClip(120, mockClips, 5);
      assert.equal(unsnapped, 120, 'fora da tolerância deve manter o frame original');

      // Tolerância zero não altera
      assert.equal(snapToNearestClip(88, mockClips, 0), 88);
    });

    it('assertValidTimeline deve aprovar timeline válida e rejeitar dados corrompidos', () => {
      const validTimeline = {
        fps: 30,
        width: 1080,
        height: 1920,
        durationInFrames: 900,
        currentFrame: 0,
        tracks: [{ id: 'V1', kind: 'video', name: 'Main Video' }],
        clips: [{ id: 'c1', trackId: 'V1', startFrame: 0, durationInFrames: 120, kind: 'video', src: 'clip.mp4' }],
        selectedClipIds: [],
      };

      assert.doesNotThrow(() => assertValidTimeline(validTimeline));

      // Rejeita FPS <= 0 ou não-finito
      assert.throws(
        () => assertValidTimeline({ ...validTimeline, fps: 0 }),
        /fps precisa ser positivo/
      );

      // Rejeita durationInFrames <= 0
      assert.throws(
        () => assertValidTimeline({ ...validTimeline, durationInFrames: -5 }),
        /durationInFrames precisa ser um inteiro positivo/
      );

      // Rejeita clip com startFrame negativo
      assert.throws(
        () =>
          assertValidTimeline({
            ...validTimeline,
            clips: [{ id: 'bad', trackId: 'V1', startFrame: -1, durationInFrames: 10, kind: 'video', src: 'x.mp4' }],
          }),
        /startFrame inválido/
      );

      // Rejeita clip com durationInFrames zero
      assert.throws(
        () =>
          assertValidTimeline({
            ...validTimeline,
            clips: [{ id: 'bad', trackId: 'V1', startFrame: 0, durationInFrames: 0, kind: 'video', src: 'x.mp4' }],
          }),
        /durationInFrames inválida/
      );
    });
  });

  describe('Catálogo de Ferramentas MCP (Vibe Studio MCP Tools)', () => {
    it('deve expor exatamente as 6 ferramentas canônicas recomendadas pela auditoria', () => {
      assert.equal(VIBE_STUDIO_MCP_TOOLS.length, 6);
      const names = VIBE_STUDIO_MCP_TOOLS.map((t) => t.name);
      assert.deepEqual(names, [
        'vibe_project_setup',
        'vibe_import_media',
        'vibe_compose_timeline',
        'vibe_style_captions',
        'vibe_export_video',
        'vibe_render_from_json',
      ]);
    });

    it('vibe_project_setup deve exigir ratio e durationSeconds com constraints', () => {
      const setupTool = VIBE_STUDIO_MCP_TOOLS.find((t) => t.name === 'vibe_project_setup');
      assert.ok(setupTool);
      assert.deepEqual(setupTool.inputSchema.required, ['ratio', 'durationSeconds']);
      assert.equal(setupTool.inputSchema.properties.durationSeconds.minimum, 1);
    });

    it('vibe_style_captions deve conter opções de animação cinéticas e bounds', () => {
      const captionTool = VIBE_STUDIO_MCP_TOOLS.find((t) => t.name === 'vibe_style_captions');
      assert.ok(captionTool);
      const presets = captionTool.inputSchema.properties.motionPreset.enum;
      assert.ok(presets.includes('slam'));
      assert.ok(presets.includes('karaoke'));
      assert.ok(captionTool.inputSchema.properties.avoidFaceZones, 'deve incluir parâmetro de safe zone facial');
      assert.equal(captionTool.inputSchema.properties.fontSize.minimum, 12);
      assert.equal(captionTool.inputSchema.properties.fontSize.maximum, 120);
    });

    it('vibe_compose_timeline deve suportar operações atômicas em lote com schemas detalhados', () => {
      const composeTool = VIBE_STUDIO_MCP_TOOLS.find((t) => t.name === 'vibe_compose_timeline');
      assert.ok(composeTool);
      assert.ok(composeTool.inputSchema.properties.adds.items);
      assert.ok(composeTool.inputSchema.properties.updates.items);
      assert.ok(composeTool.inputSchema.properties.deletes.items);
    });
  });
});
