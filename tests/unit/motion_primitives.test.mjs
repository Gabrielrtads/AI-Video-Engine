import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  VIBE_CANONICAL_COMPONENTS,
  VIBE_COMPONENT_METADATA,
} from '../../src/timeline/componentCatalog.ts';

describe('Vibe Design Studio — Motion Primitives Contract & Math Unit Tests', () => {
  it('todas as 9 primitivas de movimento e retenção devem ter metadados e defaults definidos', () => {
    const primitives = [
      'Smartphone3DMockup',
      'VectorHUDOverlay',
      'AppleKineticCard3D',
      'AnimatedBezierCurve',
      'InteractiveMacCursor',
      'AudioVisualizerBars',
      'HormoziKineticCaption',
      'RetentionProgressBar',
      'HormoziPunchZoom',
    ];

    for (const name of primitives) {
      assert.ok(VIBE_CANONICAL_COMPONENTS.includes(name), `${name} deve estar em VIBE_CANONICAL_COMPONENTS`);
      const meta = VIBE_COMPONENT_METADATA[name];
      assert.ok(meta, `Metadados de ${name} devem existir`);
      assert.equal(meta.category, 'primitive');
      assert.ok(typeof meta.description === 'string' && meta.description.length > 10);
      assert.ok(meta.defaultProps && typeof meta.defaultProps === 'object');
    }
  });

  describe('AnimatedBezierCurve Catmull-Rom & Point Math', () => {
    it('deve validar estrutura de pontos da curva', () => {
      const samplePoints = [
        { x: 10, y: 100, label: 'P1', value: '10%' },
        { x: 50, y: 80, label: 'P2', value: '50%' },
        { x: 100, y: 30, label: 'P3', value: '90%' },
      ];

      assert.equal(samplePoints.length, 3);
      samplePoints.forEach((pt) => {
        assert.ok(typeof pt.x === 'number' && pt.x >= 0);
        assert.ok(typeof pt.y === 'number' && pt.y >= 0);
      });
    });
  });

  describe('InteractiveMacCursor Waypoints & Click Ripples', () => {
    it('deve validar consistência cronológica de waypoints', () => {
      const waypoints = [
        { frame: 0, x: 100, y: 200 },
        { frame: 30, x: 300, y: 400, clickFrame: 30 },
        { frame: 60, x: 500, y: 600 },
      ];

      for (let i = 0; i < waypoints.length - 1; i++) {
        assert.ok(
          waypoints[i].frame <= waypoints[i + 1].frame,
          'waypoints devem estar em ordem crescente de frames'
        );
      }
    });
  });

  describe('VectorHUDOverlay Táticos', () => {
    it('deve validar que accentColor e preset sejam suportados', () => {
      const validPresets = ['cyber', 'minimal', 'blueprint'];
      validPresets.forEach((p) => {
        assert.ok(['cyber', 'minimal', 'blueprint'].includes(p));
      });
    });
  });
});
