import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

import {
  formatSkillsCatalog,
  listTemplates,
  formatTemplatesListing,
  getTemplateByIndex,
  calculateSafeZones,
  generateCleanSlate,
  PATHS,
} from '../../scripts/studio_engine.mjs';

describe('Unit: Skills Catalog, Templates & Clean Slate', () => {

  describe('formatSkillsCatalog', () => {
    it('deve agrupar as 7 habilidades nas 3 categorias canônicas', () => {
      const catalog = formatSkillsCatalog(PATHS.HABILIDADES_JSON);

      assert.strictEqual(typeof catalog, 'object');
      assert.ok(catalog.category1.length >= 2, 'Categoria 1 deve conter pelo menos 2 habilidades');
      assert.ok(catalog.category2.length >= 2, 'Categoria 2 deve conter pelo menos 2 habilidades');
      assert.ok(catalog.category3.length >= 3, 'Categoria 3 deve conter pelo menos 3 habilidades');

      // Categoria 1: Cromia, Gradientes & Decomposição Visual
      const cat1Ids = catalog.category1.map((s) => s.id);
      assert.ok(cat1Ids.includes('amostragem_paleta_kmeans'));
      assert.ok(cat1Ids.includes('svg_iridescent_gradient'));

      // Categoria 2: Tipografia Cinética & Sincronização de Áudio
      const cat2Ids = catalog.category2.map((s) => s.id);
      assert.ok(cat2Ids.includes('kinetic_word_caption'));
      assert.ok(cat2Ids.includes('typewriter_subtitles'));

      // Categoria 3: Cinemática 3D, Câmera & Sound Design
      const cat3Ids = catalog.category3.map((s) => s.id);
      assert.ok(cat3Ids.includes('spring_physics_curves'));
      assert.ok(cat3Ids.includes('apple_camera_rig'));
      assert.ok(cat3Ids.includes('sound_impact_engine'));

      // Total de 7 habilidades sem perda
      const total = catalog.category1.length + catalog.category2.length + catalog.category3.length;
      assert.strictEqual(total, 7);
    });

    it('formattedText deve conter títulos das 3 categorias e não vazar background-clip', () => {
      const catalog = formatSkillsCatalog(PATHS.HABILIDADES_JSON);
      assert.ok(catalog.formattedText.includes('Cromia, Gradientes & Decomposição Visual'));
      assert.ok(catalog.formattedText.includes('Tipografia Cinética & Sincronização de Áudio'));
      assert.ok(catalog.formattedText.includes('Cinemática 3D, Câmera & Sound Design'));
      assert.ok(!catalog.formattedText.includes('background-clip'), 'Não deve vazar jargão background-clip');
    });

    it('deve lançar ENOENT para caminho explícito inexistente', () => {
      assert.throws(
        () => formatSkillsCatalog('caminho_inexistente_skills.json'),
        /ENOENT|no such file/i
      );
    });

    it('deve lançar SyntaxError para arquivo com JSON corrompido', () => {
      const tempFile = path.join(os.tmpdir(), `corrupt_skills_${Date.now()}.json`);
      try {
        fs.writeFileSync(tempFile, 'corrupt { json [', 'utf8');
        assert.throws(
          () => formatSkillsCatalog(tempFile),
          /SyntaxError|JSON/i
        );
      } finally {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      }
    });

    it('deve lidar com array vazio sem quebrar contagens', () => {
      const tempFile = path.join(os.tmpdir(), `empty_skills_${Date.now()}.json`);
      try {
        fs.writeFileSync(tempFile, '[]', 'utf8');
        const catalog = formatSkillsCatalog(tempFile);
        assert.strictEqual(catalog.category1.length, 0);
        assert.strictEqual(catalog.category2.length, 0);
        assert.strictEqual(catalog.category3.length, 0);
        assert.strictEqual(catalog.totalSkills, 0);
      } finally {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      }
    });

    it('deve classificar novas habilidades não mapeadas via heurística de palavras-chave', () => {
      const tempFile = path.join(os.tmpdir(), `custom_skills_${Date.now()}.json`);
      try {
        const customSkills = [
          { id: 'extrator_paleta_hsl', nome: 'Paleta HSL' },
          { id: 'karaoke_whisper_sync', nome: 'Legendas Karaoke Whisper' },
          { id: 'motion_blur_foley_cam', nome: 'Camera Shake e Som' }
        ];
        fs.writeFileSync(tempFile, JSON.stringify(customSkills), 'utf8');
        const catalog = formatSkillsCatalog(tempFile);

        assert.strictEqual(catalog.category1.length, 1);
        assert.strictEqual(catalog.category1[0].id, 'extrator_paleta_hsl');
        assert.strictEqual(catalog.category2.length, 1);
        assert.strictEqual(catalog.category2[0].id, 'karaoke_whisper_sync');
        assert.strictEqual(catalog.category3.length, 1);
        assert.strictEqual(catalog.category3[0].id, 'motion_blur_foley_cam');
      } finally {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      }
    });

    it('deve ativar fallback em memória quando invocado sem caminho e sem arquivos padrão', () => {
      const catalog = formatSkillsCatalog();
      assert.ok(catalog.totalSkills >= 7);
    });
  });

  describe('listTemplates & getTemplateByIndex', () => {
    it('deve retornar array de templates com CarrosselEditorial e FlowMotionMaster', () => {
      const list = listTemplates(PATHS.TEMPLATES_JSON);
      assert.ok(Array.isArray(list), 'Deve retornar um array');
      assert.strictEqual(list.length, 2);

      const carrossel = list.find((t) => t.id === 'CarrosselEditorial');
      assert.ok(carrossel);
      assert.strictEqual(carrossel.proporcao, '4:5');
      assert.strictEqual(carrossel.dimensoes.largura, 1080);
      assert.strictEqual(carrossel.dimensoes.altura, 1350);

      const flow = list.find((t) => t.id === 'FlowMotionMaster');
      assert.ok(flow);
      assert.strictEqual(flow.proporcao, '9:16');
      assert.strictEqual(flow.dimensoes.largura, 1080);
      assert.strictEqual(flow.dimensoes.altura, 1920);
    });

    it('formatTemplatesListing deve formatar itens em texto legível', () => {
      const list = listTemplates(PATHS.TEMPLATES_JSON);
      const text = formatTemplatesListing(list);

      assert.ok(text.includes('TEMPLATES DISPONÍVEIS NA BIBLIOTECA'));
      assert.ok(text.includes('CarrosselEditorial'));
      assert.ok(text.includes('FlowMotionMaster'));
    });

    it('deve lançar ENOENT para caminho inexistente de templates', () => {
      assert.throws(
        () => listTemplates('caminho_inexistente_templates.json'),
        /ENOENT|no such file/i
      );
    });

    it('getTemplateByIndex deve retornar o template correto ou undefined', () => {
      const t1 = getTemplateByIndex(1, PATHS.TEMPLATES_JSON);
      assert.strictEqual(t1.id, 'CarrosselEditorial');

      const t2 = getTemplateByIndex(2, PATHS.TEMPLATES_JSON);
      assert.strictEqual(t2.id, 'FlowMotionMaster');

      const invalid = getTemplateByIndex(999, PATHS.TEMPLATES_JSON);
      assert.strictEqual(invalid, undefined);
    });
  });

  describe('calculateSafeZones & generateCleanSlate', () => {
    it('calculateSafeZones deve calcular limites para 9:16, 4:5 e 1:1', () => {
      const s916 = calculateSafeZones('9:16');
      assert.strictEqual(s916.width, 1080);
      assert.strictEqual(s916.height, 1920);
      assert.strictEqual(s916.safeBox.minX, 64);
      assert.strictEqual(s916.safeBox.maxX, 970);
      assert.strictEqual(s916.safeBox.minY, 150);
      assert.strictEqual(s916.safeBox.maxY, 1660);

      const s45 = calculateSafeZones('4:5');
      assert.strictEqual(s45.width, 1080);
      assert.strictEqual(s45.height, 1350);
      assert.strictEqual(s45.safeBox.minX, 64);
      assert.strictEqual(s45.safeBox.maxX, 1016);
      assert.strictEqual(s45.safeBox.minY, 100);
      assert.strictEqual(s45.safeBox.maxY, 1250);

      const s11 = calculateSafeZones('1:1');
      assert.strictEqual(s11.width, 1080);
      assert.strictEqual(s11.height, 1080);
    });

    it('calculateSafeZones deve lançar erro para proporção não suportada', () => {
      assert.throws(
        () => calculateSafeZones('21:9'),
        /unsupported aspect|proporção não suportada/i
      );
    });

    it('generateCleanSlate deve instanciar tela limpa sem reciclagem de layouts', () => {
      const slate = generateCleanSlate({ aspect: '4:5', theme: 'Liderança', objective: 'venda' });
      assert.strictEqual(slate.cleanSlate, true);
      assert.strictEqual(slate.width, 1080);
      assert.strictEqual(slate.height, 1350);
      assert.strictEqual(slate.theme, 'Liderança');
      assert.strictEqual(slate.objective, 'venda');
      assert.strictEqual(slate.recycledScenes, false);
      assert.strictEqual(slate.recycledLayout, false);
      assert.ok(slate.background);
      assert.ok(slate.surface);
    });

    it('generateCleanSlate deve criar instâncias independentes sem estado compartilhado', () => {
      const slateA = generateCleanSlate({ theme: 'Tema A' });
      const slateB = generateCleanSlate({ theme: 'Tema B' });
      assert.notStrictEqual(slateA, slateB);
      slateA.theme = 'Mutated';
      assert.strictEqual(slateB.theme, 'Tema B');
    });

    it('generateCleanSlate deve rejeitar dimensões não-numéricas ou negativas', () => {
      assert.throws(
        () => generateCleanSlate({ width: 'invalido', height: -100 }),
        /invalid dimension|dimensões inválidas/i
      );
    });
  });
});
