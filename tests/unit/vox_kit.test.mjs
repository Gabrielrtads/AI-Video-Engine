import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

describe('Vibe Design Studio — Estilo VOX (Documental 2.5D & Cartografia)', () => {
  it('1. Deve validar que as cores oficiais do VOX são HEX válidos e sem neon', async () => {
    const voxModule = await import('../../src/timeline/voxMath.ts');
    assert.ok(voxModule.VOX_COLORS, 'VOX_COLORS deve existir');
    const colors = voxModule.VOX_COLORS;

    assert.equal(colors.paperBase, '#F4F1EA', 'paperBase deve ser #F4F1EA');
    assert.equal(colors.inkPrimary, '#141413', 'inkPrimary deve ser #141413');
    assert.equal(colors.highlighterYellow, '#FFDE2E', 'highlighterYellow deve ser #FFDE2E');
    assert.equal(colors.penRed, '#D9381E', 'penRed deve ser #D9381E');
    assert.equal(colors.atlasBlue, '#2B5B84', 'atlasBlue deve ser #2B5B84');

    // Nenhuma cor pode ser ciano neon (#00E5FF) ou verde neon (#00FF66)
    for (const [key, hex] of Object.entries(colors)) {
      if (typeof hex === 'string' && hex.startsWith('#')) {
        assert.notEqual(hex.toUpperCase(), '#00E5FF', `${key} não pode ser ciano neon`);
        assert.notEqual(hex.toUpperCase(), '#00FF66', `${key} não pode ser verde neon`);
      }
    }
  });

  it('2. Deve gerar polígono determinístico rasgado com tornPolygon() e perímetro de elipse', async () => {
    const voxModule = await import('../../src/timeline/voxMath.ts');
    const poly1 = voxModule.tornPolygon('seed-teste', 24, 2);
    const poly2 = voxModule.tornPolygon('seed-teste', 24, 2);
    const polyDiff = voxModule.tornPolygon('seed-outro', 24, 2);

    assert.ok(poly1.startsWith('polygon(') && poly1.endsWith(')'), 'Deve começar com polygon( e terminar com )');
    assert.equal(poly1, poly2, 'O mesmo seed deve produzir o mesmo polígono determinístico');
    assert.notEqual(poly1, polyDiff, 'Seeds diferentes devem produzir polígonos distintos');

    const perim = voxModule.calculateHandDrawnPerimeter(280, 140);
    assert.ok(perim > 500 && perim < 800, 'Perímetro deve ser geometricamente válido');
  });

  it('3. Deve conter os 6 primitivos do VOX no VIBE_CANONICAL_COMPONENTS e metadados', async () => {
    const catalogModule = await import('../../src/timeline/componentCatalog.ts');
    const requiredVox = [
      'VoxPaperStage',
      'NewspaperCutout',
      'VoxHighlighter',
      'HandDrawnMark',
      'VoxAnimatedMap',
      'VoxEditorialTypography',
    ];

    for (const comp of requiredVox) {
      assert.ok(
        catalogModule.isCanonicalComponent(comp),
        `Componente ${comp} deve estar registrado em VIBE_CANONICAL_COMPONENTS`
      );
      assert.ok(
        catalogModule.VIBE_COMPONENT_METADATA[comp],
        `Componente ${comp} deve possuir entrada em VIBE_COMPONENT_METADATA`
      );
      assert.equal(
        catalogModule.VIBE_COMPONENT_METADATA[comp].category,
        'primitive',
        `Categoria de ${comp} deve ser primitive`
      );
    }
  });

  it('4. Deve conter o template VoxDocumentario no catalogo_templates.json', () => {
    const templatesPath = path.join(rootDir, 'src/templates/catalogo_templates.json');
    const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
    const voxTpl = templates.find((t) => t.id === 'VoxDocumentario');

    assert.ok(voxTpl, 'Template VoxDocumentario deve existir no catálogo');
    assert.equal(voxTpl.proporcao, '9:16');
    assert.equal(voxTpl.dimensoes.largura, 1080);
    assert.equal(voxTpl.dimensoes.altura, 1920);
    assert.ok(fs.existsSync(path.join(rootDir, voxTpl.arquivo)), 'Arquivo do template deve existir no disco');
  });

  it('5. Deve inferir layoutMode vox_documentario para briefings de história e geopolítica', async () => {
    const studioEngine = await import('../../scripts/studio_engine.mjs');
    const proposal1 = studioEngine.inferDirectionProposal('Quero um vídeo sobre a história da guerra fria e fronteiras');
    assert.equal(proposal1.layoutMode, 'vox_documentario');
    assert.ok(proposal1.estetica.includes('VOX'));
    assert.equal(proposal1.paleta[0], '#F4F1EA');

    const proposal2 = studioEngine.inferDirectionProposal('Reportagem investigativa estilo vox com mapas e jornais antigos');
    assert.equal(proposal2.layoutMode, 'vox_documentario');
  });
});
