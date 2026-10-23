import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  validateTimelineSchema,
  compileTimeline,
} from '../../src/timeline/compileTimeline.ts';
import {
  VIBE_CANONICAL_COMPONENTS,
  VIBE_COMPONENT_METADATA,
  isCanonicalComponent,
} from '../../src/timeline/componentCatalog.ts';
import { VIBE_STUDIO_MCP_TOOLS } from '../../src/mcp/vibeStudioTools.ts';

describe('Vibe Design Studio — JSON Timeline Compiler & Registry Unit Tests', () => {
  describe('validateTimelineSchema', () => {
    it('deve aprovar uma timeline válida', () => {
      const validPayload = {
        fps: 30,
        width: 1080,
        height: 1920,
        durationInFrames: 300,
        tracks: [{ id: 'T1', kind: 'graphics', name: 'Graficos' }],
        clips: [
          {
            id: 'c1',
            trackId: 'T1',
            kind: 'graphics',
            componentName: 'Smartphone3DMockup',
            startFrame: 0,
            durationInFrames: 60,
          },
        ],
      };

      const result = validateTimelineSchema(validPayload);
      assert.equal(result.valid, true, `Erros inesperados: ${result.errors.join(', ')}`);
      assert.equal(result.errors.length, 0);
    });

    it('deve reprovar payload nulo, indefinido ou não-objeto', () => {
      assert.equal(validateTimelineSchema(null).valid, false);
      assert.equal(validateTimelineSchema('string invalida').valid, false);
      assert.equal(validateTimelineSchema(12345).valid, false);
    });

    it('deve reprovar fps inválido (negativo, zero, NaN, infinito)', () => {
      const base = {
        width: 1080,
        height: 1920,
        durationInFrames: 300,
        tracks: [],
        clips: [],
      };

      assert.equal(validateTimelineSchema({ ...base, fps: 0 }).valid, false);
      assert.equal(validateTimelineSchema({ ...base, fps: -30 }).valid, false);
      assert.equal(validateTimelineSchema({ ...base, fps: Infinity }).valid, false);
    });

    it('deve reprovar dimensões negativas ou nulas', () => {
      const base = {
        fps: 30,
        durationInFrames: 300,
        tracks: [],
        clips: [],
      };

      assert.equal(validateTimelineSchema({ ...base, width: -1080, height: 1920 }).valid, false);
      assert.equal(validateTimelineSchema({ ...base, width: 1080, height: 0 }).valid, false);
    });
  });

  describe('compileTimeline', () => {
    it('deve preencher valores default e arredondar frames flutuantes', () => {
      const raw = {
        fps: 29.97,
        width: 1080.4,
        height: 1920.1,
        durationInFrames: 450.7,
        tracks: [
          { id: 'T2', zIndex: 50, kind: 'caption', name: 'Legendas' },
          { id: 'T1', zIndex: 10, kind: 'graphics', name: 'Fundo' },
        ],
        clips: [
          {
            id: 'c1',
            trackId: 'T1',
            kind: 'graphics',
            startFrame: 10.2,
            durationInFrames: 59.8,
            componentName: 'VectorHUDOverlay',
          },
        ],
      };

      const compiled = compileTimeline(raw);

      assert.equal(compiled.fps, 30);
      assert.equal(compiled.width, 1080);
      assert.equal(compiled.height, 1920);
      assert.equal(compiled.durationInFrames, 451);
      assert.equal(compiled.clips[0].startFrame, 10);
      assert.equal(compiled.clips[0].durationInFrames, 60);

      // Faixas ordenadas por zIndex crescente (T1 zIndex 10, depois T2 zIndex 50)
      assert.equal(compiled.tracks[0].id, 'T1');
      assert.equal(compiled.tracks[1].id, 'T2');
    });

    it('deve normalizar clipes gráficos, legendas e mídia com fallbacks seguros', () => {
      const raw = {
        tracks: [{ id: 'T1', kind: 'caption' }],
        clips: [
          {
            trackId: 'T1',
            kind: 'caption',
            text: 'Olá Mundo',
            startFrame: 0,
            durationInFrames: 90,
          },
        ],
      };

      const compiled = compileTimeline(raw);
      const captionClip = compiled.clips[0];

      assert.equal(captionClip.text, 'Olá Mundo');
      assert.equal(captionClip.motionPreset, 'slam');
      assert.ok(captionClip.id.startsWith('clip_'));
    });
  });

  describe('Catálogo de Componentes Canônicos', () => {
    it('deve conter todas as primitivas de movimento e showcases essenciais', () => {
      const expectedKeys = [
        'Smartphone3DMockup',
        'VectorHUDOverlay',
        'AppleKineticCard3D',
        'AnimatedBezierCurve',
        'InteractiveMacCursor',
        'AudioVisualizerBars',
        'FlowMotionMaster',
        'CarrosselEditorial',
        'FullBleedShowcase',
        'RourkeLuxuryShowcase',
      ];

      for (const key of expectedKeys) {
        assert.ok(
          isCanonicalComponent(key),
          `Componente ${key} deve ser canônico`
        );
        assert.ok(
          VIBE_COMPONENT_METADATA[key] !== undefined,
          `Metadados de ${key} devem existir`
        );
      }
    });
  });

  describe('MCP Tools: vibe_render_from_json', () => {
    it('catálogo VIBE_STUDIO_MCP_TOOLS deve conter vibe_render_from_json com schema correto', () => {
      const tool = VIBE_STUDIO_MCP_TOOLS.find((t) => t.name === 'vibe_render_from_json');
      assert.ok(tool, 'vibe_render_from_json deve estar registrado nas ferramentas MCP');
      assert.ok(tool.inputSchema.properties.timelinePath);
      assert.ok(tool.inputSchema.properties.outputFileName);
      assert.deepEqual(tool.inputSchema.required, ['timelinePath', 'outputFileName']);
    });
  });
});
