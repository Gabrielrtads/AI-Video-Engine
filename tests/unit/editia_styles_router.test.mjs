import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  EDITIA_PALETTES,
  EDITIA_STYLE_COMMANDS,
  generateDeterministicWaveformBars,
  generateSpellcheckWavePath,
  matchOneSentenceStyleRequest,
} from '../../src/timeline/editiaStylesMath.ts';
import {
  VIBE_CANONICAL_COMPONENTS,
  VIBE_COMPONENT_METADATA,
} from '../../src/timeline/componentCatalog.ts';
import { inferDirectionProposal, matchStyleCommand } from '../../scripts/studio_engine.mjs';

describe('Vibe Design Studio — Roteador "Um Pedido Pra Cada Estilo" & 4 Estilos Absorvidos', () => {
  it('1. Deve rotear pedidos de 1 frase para cada estilo exato em matchOneSentenceStyleRequest', () => {
    const g1 = matchOneSentenceStyleRequest('Abre com um gancho forte na tela');
    assert.ok(g1);
    assert.strictEqual(g1.id, 'gancho_grande_topo');
    assert.strictEqual(g1.canonicalComponent, 'BigHookTopBanner');

    const g2 = matchOneSentenceStyleRequest('Deixa com cara de capa de revista');
    assert.ok(g2);
    assert.strictEqual(g2.id, 'capa_revista_editorial');
    assert.strictEqual(g2.canonicalComponent, 'MagazineCoverStage');

    const g3 = matchOneSentenceStyleRequest('Divide a tela: o vídeo em cima e eu reagindo embaixo');
    assert.ok(g3);
    assert.strictEqual(g3.id, 'orbita_split_screen');
    assert.strictEqual(g3.canonicalComponent, 'OrbitSplitScreenStage');

    const g4 = matchOneSentenceStyleRequest('Explica essa parte com uma animação da onda do áudio');
    assert.ok(g4);
    assert.strictEqual(g4.id, 'onda_audio_corte');
    assert.strictEqual(g4.canonicalComponent, 'AudioWaveformCutStage');
  });

  it('2. Deve integrar matchStyleCommand ao inferDirectionProposal no studio_engine.mjs', () => {
    const p1 = inferDirectionProposal('Quero a primeira frase em letra grande no topo');
    assert.strictEqual(p1.layoutMode, 'gancho_grande_topo');

    const p2 = inferDirectionProposal('Deixa com cara de capa de revista editorial');
    assert.strictEqual(p2.layoutMode, 'capa_revista_editorial');
    assert.deepStrictEqual(p2.paleta, ['#1A3C2A', '#F4F1EA', '#D4CEB8']);

    const p3 = inferDirectionProposal('Divide a tela e coloca cards em órbita em volta de mim');
    assert.strictEqual(p3.layoutMode, 'orbita_split_screen');

    const p4 = inferDirectionProposal('Corta as pausas e fica com a melhor tomada na onda de áudio');
    assert.strictEqual(p4.layoutMode, 'onda_audio_corte');
  });

  it('3. Deve gerar onda senoidal SVG determinística para o sublinhado de erro (e02-gancho)', () => {
    const wave = generateSpellcheckWavePath(340, 10, 22, 5.5);
    assert.ok(wave.path.startsWith('M 0 10 Q'));
    assert.ok(wave.approximateLength > 340);
  });

  it('4. Deve gerar barras determinísticas de waveform com erro, gaguejada e pausa (e14-motion-explicativo)', () => {
    const bars = generateDeterministicWaveformBars(56);
    assert.strictEqual(bars.length, 56);
    const kinds = new Set(bars.map((b) => b.kind));
    assert.ok(kinds.has('speech'));
    assert.ok(kinds.has('error'));
    assert.ok(kinds.has('stutter'));
    assert.ok(kinds.has('pause'));
  });

  it('5. Deve registrar os 4 novos componentes canônicos no componentCatalog.ts', () => {
    const required = [
      'BigHookTopBanner',
      'OrbitSplitScreenStage',
      'MagazineCoverStage',
      'AudioWaveformCutStage',
    ];
    for (const comp of required) {
      assert.ok(VIBE_CANONICAL_COMPONENTS.includes(comp), `Falta ${comp} no catálogo`);
      assert.ok(VIBE_COMPONENT_METADATA[comp], `Faltam metadados de ${comp}`);
      assert.strictEqual(VIBE_COMPONENT_METADATA[comp].category, 'primitive');
    }
    assert.strictEqual(EDITIA_PALETTES.capaRevista.editorialGreen, '#1A3C2A');
    assert.ok(EDITIA_STYLE_COMMANDS.length >= 6);
  });
});
