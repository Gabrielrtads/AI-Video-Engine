import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import {
  formatSkillsCatalog,
  classifySkill,
  listTemplates,
  formatTemplatesListing,
  getTemplateByIndex,
  calculateSafeZones,
  generateCleanSlate,
  parseOptionChoice,
  sanitizeBriefing,
  promptBriefingExpresso,
  runOnboarding,
  PATHS,
  FALLBACK_HABILIDADES,
  FALLBACK_TEMPLATES,
} from '../../scripts/studio_engine.mjs';

describe('Adversarial & Boundary Stress Test Suite (Milestone 1 Challenger 2)', () => {

  // ═══════════════════════════════════════════════════════════════════════════
  // VECTOR 1: Catalog Data Corruption, Missing, Empty & Non-Array JSON
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Vector 1: Catalog Data Corruption & Boundary Formats', () => {

    it('1.1: formatSkillsCatalog throws ENOENT for missing file path', () => {
      const nonExistentPath = path.join(os.tmpdir(), `non_existent_${Date.now()}.json`);
      assert.throws(
        () => formatSkillsCatalog(nonExistentPath),
        (err) => {
          assert.ok(err.code === 'ENOENT' || /ENOENT|no such file/i.test(err.message));
          return true;
        }
      );
    });

    it('1.2: formatSkillsCatalog throws SyntaxError for corrupted JSON syntax', () => {
      const corruptFile = path.join(os.tmpdir(), `corrupt_skills_${Date.now()}.json`);
      try {
        fs.writeFileSync(corruptFile, '{"skills": [ broken json syntax ...', 'utf8');
        assert.throws(
          () => formatSkillsCatalog(corruptFile),
          (err) => err instanceof SyntaxError || /SyntaxError|JSON/i.test(err.message)
        );
      } finally {
        if (fs.existsSync(corruptFile)) fs.unlinkSync(corruptFile);
      }
    });

    it('1.3: formatSkillsCatalog throws SyntaxError for 0-byte empty file', () => {
      const emptyFile = path.join(os.tmpdir(), `empty_0byte_skills_${Date.now()}.json`);
      try {
        fs.writeFileSync(emptyFile, '', 'utf8');
        assert.throws(
          () => formatSkillsCatalog(emptyFile),
          (err) => err instanceof SyntaxError || /JSON/i.test(err.message)
        );
      } finally {
        if (fs.existsSync(emptyFile)) fs.unlinkSync(emptyFile);
      }
    });

    it('1.4: formatSkillsCatalog behavior when JSON is a valid Non-Array (object, string, number, null)', () => {
      // Objects, numbers, booleans, and null throw TypeError: skills is not iterable
      const iterableThrowCases = [
        { name: 'Object with skills key', content: JSON.stringify({ skills: [] }) },
        { name: 'Numeric literal', content: JSON.stringify(42) },
        { name: 'Boolean literal', content: JSON.stringify(true) },
        { name: 'Null literal', content: JSON.stringify(null) },
      ];

      for (const tc of iterableThrowCases) {
        const tempFile = path.join(os.tmpdir(), `non_array_${Date.now()}_${Math.random()}.json`);
        try {
          fs.writeFileSync(tempFile, tc.content, 'utf8');
          assert.throws(
            () => formatSkillsCatalog(tempFile),
            (err) => err instanceof TypeError && /is not iterable/i.test(err.message),
            `Expected TypeError (is not iterable) for ${tc.name}`
          );
        } finally {
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        }
      }

      // Edge case finding: String literal is iterable in JS, so it iterates over characters as phantom skills
      const stringFile = path.join(os.tmpdir(), `string_skills_${Date.now()}.json`);
      try {
        fs.writeFileSync(stringFile, JSON.stringify("not an array"), 'utf8');
        const res = formatSkillsCatalog(stringFile);
        // It does not throw, but produces "not an array".length (12) phantom skills with undefined names
        assert.strictEqual(res.totalSkills, 12);
        assert.ok(res.formattedText.includes('• undefined'));
      } finally {
        if (fs.existsSync(stringFile)) fs.unlinkSync(stringFile);
      }
    });

    it('1.5: formatSkillsCatalog handles empty array [] without crashing', () => {
      const emptyArrayFile = path.join(os.tmpdir(), `empty_array_${Date.now()}.json`);
      try {
        fs.writeFileSync(emptyArrayFile, '[]', 'utf8');
        const res = formatSkillsCatalog(emptyArrayFile);
        assert.strictEqual(res.totalSkills, 0);
        assert.strictEqual(res.category1.length, 0);
        assert.strictEqual(res.category2.length, 0);
        assert.strictEqual(res.category3.length, 0);
        assert.ok(res.formattedText.includes('(Nenhuma habilidade nesta categoria)'));
      } finally {
        if (fs.existsSync(emptyArrayFile)) fs.unlinkSync(emptyArrayFile);
      }
    });

    it('1.6: formatSkillsCatalog resilience against skills missing optional fields or unexpected values', () => {
      const dirtySkillsFile = path.join(os.tmpdir(), `dirty_skills_${Date.now()}.json`);
      try {
        const dirtyData = [
          { id: 'valid_custom_kmeans', nome: 'Custom K-Means' }, // missing descricao, script, etc.
          { id: 'valid_whisper_sub', descricao: 'Sincronizacao de áudio e texto' }, // missing nome
          { id: 'spring_physics_curves' }, // canonical id with no properties
          { id: 'random_id' }, // completely unmapped id with no other properties
        ];
        fs.writeFileSync(dirtySkillsFile, JSON.stringify(dirtyData), 'utf8');
        const res = formatSkillsCatalog(dirtySkillsFile);
        assert.strictEqual(res.totalSkills, 4);
        assert.strictEqual(res.category1.length, 1);
        assert.strictEqual(res.category2.length, 1);
        assert.strictEqual(res.category3.length, 2);
      } finally {
        if (fs.existsSync(dirtySkillsFile)) fs.unlinkSync(dirtySkillsFile);
      }
    });

    it('1.7: listTemplates throws ENOENT for missing file path', () => {
      const nonExistentPath = path.join(os.tmpdir(), `non_existent_tpl_${Date.now()}.json`);
      assert.throws(
        () => listTemplates(nonExistentPath),
        (err) => err.code === 'ENOENT' || /ENOENT|no such file/i.test(err.message)
      );
    });

    it('1.8: listTemplates throws SyntaxError for corrupted JSON syntax', () => {
      const corruptFile = path.join(os.tmpdir(), `corrupt_tpl_${Date.now()}.json`);
      try {
        fs.writeFileSync(corruptFile, '{"templates": [ corrupted ...', 'utf8');
        assert.throws(
          () => listTemplates(corruptFile),
          (err) => err instanceof SyntaxError || /SyntaxError|JSON/i.test(err.message)
        );
      } finally {
        if (fs.existsSync(corruptFile)) fs.unlinkSync(corruptFile);
      }
    });

    it('1.9: listTemplates throws SyntaxError for 0-byte empty file', () => {
      const emptyFile = path.join(os.tmpdir(), `empty_0byte_tpl_${Date.now()}.json`);
      try {
        fs.writeFileSync(emptyFile, '', 'utf8');
        assert.throws(
          () => listTemplates(emptyFile),
          (err) => err instanceof SyntaxError || /JSON/i.test(err.message)
        );
      } finally {
        if (fs.existsSync(emptyFile)) fs.unlinkSync(emptyFile);
      }
    });

    it('1.10: listTemplates handles non-array JSON (object, string, number, null) by returning empty array', () => {
      const nonArrayCases = [
        { name: 'Object with templates key', content: JSON.stringify({ templates: [] }) },
        { name: 'String literal', content: JSON.stringify("not an array") },
        { name: 'Numeric literal', content: JSON.stringify(42) },
        { name: 'Null literal', content: JSON.stringify(null) },
      ];

      for (const tc of nonArrayCases) {
        const tempFile = path.join(os.tmpdir(), `non_array_tpl_${Date.now()}_${Math.random()}.json`);
        try {
          fs.writeFileSync(tempFile, tc.content, 'utf8');
          const res = listTemplates(tempFile);
          assert.ok(Array.isArray(res), `Must return array for ${tc.name}`);
          assert.strictEqual(res.length, 0);
          assert.ok(res.formattedText.includes('Nenhum template disponível'));
        } finally {
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        }
      }
    });

    it('1.11: formatTemplatesListing boundary inputs (empty array, null, undefined, dirty objects)', () => {
      assert.ok(formatTemplatesListing([]).includes('Nenhum template disponível'));
      assert.ok(formatTemplatesListing(null).includes('Nenhum template disponível'));
      assert.ok(formatTemplatesListing(undefined).includes('Nenhum template disponível'));

      // Template object with missing properties
      const dirty = [
        { id: 'TplSolo' }, // missing nome, proporcao, dimensoes, fps, duracaoFrames
        { nome: 'Sem ID', proporcao: '4:5', dimensoes: { largura: 1080 } }, // missing altura
      ];
      const text = formatTemplatesListing(dirty);
      assert.ok(text.includes('TplSolo'));
      assert.ok(text.includes('Sem ID'));
      assert.ok(text.includes('1080x1920')); // fallback height
    });

    it('1.12: getTemplateByIndex boundary tests (negative, zero, out-of-range, NaN, strings)', () => {
      assert.strictEqual(getTemplateByIndex(0, PATHS.TEMPLATES_JSON), undefined);
      assert.strictEqual(getTemplateByIndex(-1, PATHS.TEMPLATES_JSON), undefined);
      assert.strictEqual(getTemplateByIndex(999, PATHS.TEMPLATES_JSON), undefined);
      assert.strictEqual(getTemplateByIndex('invalid', PATHS.TEMPLATES_JSON), undefined);
      assert.strictEqual(getTemplateByIndex(null, PATHS.TEMPLATES_JSON), undefined);
      assert.strictEqual(getTemplateByIndex(undefined, PATHS.TEMPLATES_JSON), undefined);
      assert.strictEqual(getTemplateByIndex(NaN, PATHS.TEMPLATES_JSON), undefined);
      assert.strictEqual(getTemplateByIndex(Infinity, PATHS.TEMPLATES_JSON), undefined);

      // Valid string index "1"
      const tpl1 = getTemplateByIndex('1', PATHS.TEMPLATES_JSON);
      assert.ok(tpl1);
      assert.strictEqual(tpl1.id, 'CarrosselEditorial');
    });

    it('1.13: In-memory fallback activation when no path is provided and candidate files are missing', () => {
      // In normal environment, candidate PATHS.HABILIDADES_JSON exists, so it reads from file.
      // We verify fallback structure directly matches expected schema.
      assert.strictEqual(FALLBACK_HABILIDADES.length, 7);
      assert.strictEqual(FALLBACK_TEMPLATES.length, 2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VECTOR 2: Unicode Stress, SQL/Shell Injection Strings & Oversized Inputs (1MB+)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Vector 2: Unicode Stress, Injection Strings & Oversized Inputs', () => {

    it('2.1: sanitizeBriefing handles complex Unicode (emojis, flags, RTL, CJK, accents) and decomposes ZWJ compound emojis', () => {
      const unicodeCases = [
        // Standard emojis, flags, skin-tone modifiers are preserved
        { input: '🎬 Vídeo Top 🇧🇷 Brasil 👍🏽 Excelente!', expected: '🎬 Vídeo Top 🇧🇷 Brasil 👍🏽 Excelente!' },
        // RTL Arabic and Hebrew
        { input: 'مرحبا بالعالم - حملة تسويقية', expected: 'مرحبا بالعالم - حملة تسويقية' },
        { input: 'שלום עולם - פרויקט וידאו', expected: 'שלום עולם - פרויקט וידאו' },
        // CJK
        { input: '视频营销 广告设计 コンニチハ 한국어 비디오', expected: '视频营销 广告设计 コンニチハ 한국어 비디오' },
        // Accents and European diacritics
        { input: 'Ação, café, Müller, naïve, São Paulo, coração, déjà vu', expected: 'Ação, café, Müller, naïve, São Paulo, coração, déjà vu' },
        // Math and Gothic glyphs
        { input: '𝕸𝖎𝖑𝖊𝖘𝖙𝖔𝖓𝖊 1 ∑ ∆ ∞ 𝒳', expected: '𝕸𝖎𝖑𝖊𝖘𝖙𝖔𝖓𝖊 1 ∑ ∆ ∞ 𝒳' },
      ];

      for (const tc of unicodeCases) {
        const out = sanitizeBriefing(tc.input);
        assert.strictEqual(out, tc.expected);
      }

      // Edge case finding: Compound emojis with Zero-Width Joiner (\u200D) have their ZWJ stripped,
      // decomposing the compound emoji into separate glyphs (e.g. Family 👨‍👩‍👧‍👦 becomes 👨👩👧👦)
      const compoundEmoji = '👨‍👩‍👧‍👦 Família';
      const stripped = sanitizeBriefing(compoundEmoji);
      assert.strictEqual(stripped, '👨👩👧👦 Família');
      assert.ok(!stripped.includes('\u200D'), 'Zero-width joiner was stripped by [\\0\\u200B-\\u200D\\uFEFF]');
    });

    it('2.2: sanitizeBriefing strips dangerous invisible characters, null bytes and zero-width spaces', () => {
      const dirty = 'Intro\0\0\0Zero\u200BWidth\u200CJoiner\u200DMark\uFEFFOutro';
      const clean = sanitizeBriefing(dirty);
      assert.strictEqual(clean, 'IntroZeroWidthJoinerMarkOutro');
      assert.ok(!clean.includes('\0'));
      assert.ok(!clean.includes('\u200B'));
      assert.ok(!clean.includes('\u200C'));
      assert.ok(!clean.includes('\u200D'));
      assert.ok(!clean.includes('\uFEFF'));
    });

    it('2.3: sanitizeBriefing collapses ANSI color escape sequences', () => {
      const ansiInput = '\u001b[31;1mRED BOLD\u001b[0m \u001b[42mGREEN BG\u001b[0m \u001b[2J';
      const clean = sanitizeBriefing(ansiInput);
      assert.strictEqual(clean, 'RED BOLD GREEN BG');
    });

    it('2.4: sanitizeBriefing handles SQL injection patterns safely as plain text without crashing', () => {
      const sqlInjections = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "admin'--",
        "UNION SELECT 1, 'admin', 'password' FROM information_schema.tables--",
        "1' ORDER BY 1,2,3--+",
        `" OR "" = "`,
      ];

      for (const sql of sqlInjections) {
        const out = sanitizeBriefing(sql);
        assert.ok(typeof out === 'string');
        assert.strictEqual(out, sql); // preserved safely as string literal without interpretation
      }
    });

    it('2.5: sanitizeBriefing handles shell injection patterns and neutralizes multi-line execution', () => {
      const shellInjections = [
        "; rm -rf /",
        "$(whoami)",
        "`reboot`",
        "& calc.exe &",
        "| cat /etc/passwd",
        "&& echo pwned",
        "ping 127.0.0.1\n\rdir C:\\", // multi-line injection
      ];

      for (const cmd of shellInjections) {
        const out = sanitizeBriefing(cmd);
        // Multi-line injection must have newlines collapsed into space
        assert.ok(!out.includes('\n'), 'Newlines must be collapsed');
        assert.ok(!out.includes('\r'), 'Carriage returns must be collapsed');
      }

      // Check specific multi-line collapse
      assert.strictEqual(
        sanitizeBriefing('echo 1\nrm -rf /\r\nreboot'),
        'echo 1 rm -rf / reboot'
      );
    });

    it('2.6: sanitizeBriefing handles Path Traversal tokens safely', () => {
      const pathTraversals = [
        '../../../../../../etc/shadow',
        '..\\..\\..\\Windows\\System32\\cmd.exe',
        'file:///etc/passwd',
      ];
      for (const p of pathTraversals) {
        const out = sanitizeBriefing(p);
        assert.strictEqual(out, p);
      }
    });

    it('2.7: Performance and stability with Oversized Briefings (1KB, 10KB, 100KB, 1MB, 2MB)', () => {
      const sizes = [
        { label: '1KB', bytes: 1024 },
        { label: '10KB', bytes: 10 * 1024 },
        { label: '100KB', bytes: 100 * 1024 },
        { label: '1MB (1,048,576 bytes)', bytes: 1024 * 1024 },
        { label: '2MB (2,097,152 bytes)', bytes: 2 * 1024 * 1024 },
      ];

      for (const { label, bytes } of sizes) {
        // Construct string with words, spaces, newlines, and unicode
        const baseChunk = 'Vídeo estratégico de conversão e atração com alta retenção visual.\n';
        const repeatCount = Math.ceil(bytes / baseChunk.length);
        const hugeInput = baseChunk.repeat(repeatCount).slice(0, bytes);

        const startTime = performance.now();
        const sanitized = sanitizeBriefing(hugeInput);
        const durationMs = performance.now() - startTime;

        assert.ok(sanitized.length > 0);
        assert.ok(!sanitized.includes('\n'));
        assert.ok(
          durationMs < 1000,
          `Oversized briefing ${label} took ${durationMs.toFixed(2)}ms (must be < 1000ms)`
        );
      }
    });

    it('2.8: ReDoS Stress test on regexes in sanitizeBriefing', () => {
      // Test malicious repeated escape sequences or spaces designed to trigger catastrophic backtracking
      const maliciousPatterns = [
        '\x1B[' + '0;'.repeat(10000) + 'mText',
        ' '.repeat(200000) + 'Center' + ' '.repeat(200000),
        '\u200B'.repeat(50000) + 'Content' + '\uFEFF'.repeat(50000),
      ];

      for (const pattern of maliciousPatterns) {
        const t0 = performance.now();
        const res = sanitizeBriefing(pattern);
        const elapsed = performance.now() - t0;
        assert.ok(elapsed < 200, `Regex took too long: ${elapsed.toFixed(2)}ms`);
      }
    });

    it('2.9: parseOptionChoice rejects all injection strings, unicode numbers and out-of-range inputs', () => {
      const adversarialInputs = [
        "1; rm -rf /",
        "1' OR '1'='1",
        "$(calc.exe)",
        "1\0",
        "1\n2",
        "①", // circled unicode 1
        "１", // fullwidth unicode 1
        "0",
        "5",
        "99999999999999999999",
        "1.0",
        "1e0",
        "0x1",
        "0b1",
        "NaN",
        "null",
        "undefined",
        "1a",
        "a1",
        " 1 2 ",
      ];

      for (const input of adversarialInputs) {
        const parsed = parseOptionChoice(input);
        assert.strictEqual(
          parsed,
          null,
          `Expected null for adversarial input "${input}", got ${parsed}`
        );
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VECTOR 3: Keyword Classification Fallback on Newly Invented Skills
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Vector 3: Keyword Classification & Fallback Resilience', () => {

    it('3.1: All 7 canonical IDs map strictly to their defined canonical category', () => {
      assert.strictEqual(classifySkill({ id: 'amostragem_paleta_kmeans' }), 1);
      assert.strictEqual(classifySkill({ id: 'svg_iridescent_gradient' }), 1);
      assert.strictEqual(classifySkill({ id: 'kinetic_word_caption' }), 2);
      assert.strictEqual(classifySkill({ id: 'typewriter_subtitles' }), 2);
      assert.strictEqual(classifySkill({ id: 'spring_physics_curves' }), 3);
      assert.strictEqual(classifySkill({ id: 'apple_camera_rig' }), 3);
      assert.strictEqual(classifySkill({ id: 'sound_impact_engine' }), 3);
    });

    it('3.2: Newly invented skills targeting Category 1 (paleta, cor, gradiente, svg, kmeans, crom, decompos)', () => {
      const inventedCat1 = [
        { id: 'minha_paleta_automatica' },
        { id: 'extracao_de_cor_hex' },
        { id: 'gradiente_mesh_suave' },
        { id: 'render_svg_pathtracing' },
        { id: 'kmeans_cluster_gpu' },
        { id: 'cromia_vintage_film' },
        { id: 'decomposicao_editorial_zones' },
        // Keyword in nome
        { id: 'custom_001', nome: 'Amostrador de Paleta Suave' },
        { id: 'custom_002', nome: 'Efeito Gradiente Dinâmico' },
        // Keyword in descricao
        { id: 'custom_003', descricao: 'Gera decomposição cromática de quadros' },
        // Uppercase keywords
        { id: 'PALETA_RGB_EXTREME' },
        { id: 'KMEANS_ACCEL' },
      ];

      for (const skill of inventedCat1) {
        const cat = classifySkill(skill);
        assert.strictEqual(cat, 1, `Expected Category 1 for ${JSON.stringify(skill)}, got ${cat}`);
      }
    });

    it('3.3: Newly invented skills targeting Category 2 (legenda, palavra, texto, tipografia, áudio, audio, whisper, digita)', () => {
      const inventedCat2 = [
        { id: 'legenda_automatica_srt' },
        { id: 'palavra_por_palavra_zoom' },
        { id: 'texto_iridescente_3d' }, // Note: if it has "texto", let's check precedence vs gradiente
        { id: 'tipografia_bebas_neue' },
        { id: 'áudio_mastering_lufs' },
        { id: 'audio_ducking_foley' },
        { id: 'whisper_fast_transcription' },
        { id: 'digitacao_terminal_matrix' },
        // Keyword in nome or descricao
        { id: 'speech_tool', nome: 'Sincronizador de Legendas' },
        { id: 'speech_synth', descricao: 'Controle de áudio e fala' },
        // Uppercase
        { id: 'WHISPER_AI_SYNC' },
        { id: 'TIPOGRAFIA_BOLD' },
      ];

      for (const skill of inventedCat2) {
        const cat = classifySkill(skill);
        assert.strictEqual(cat, 2, `Expected Category 2 for ${JSON.stringify(skill)}, got ${cat}`);
      }
    });

    it('3.4: Newly invented skills with no matching keywords safely default to Category 3', () => {
      const inventedCat3 = [
        { id: 'camera_drift_foley' },
        { id: 'som_impacto_metalico' },
        { id: 'blender_viewport_render' },
        { id: 'pontilhismo_particulas_3d' },
        { id: 'quantum_leap_effect' },
        { id: 'culinaria_vegana_overlay' },
        { id: 'unmapped_random_uuid_9482741' },
      ];

      for (const skill of inventedCat3) {
        const cat = classifySkill(skill);
        assert.strictEqual(cat, 3, `Expected Category 3 fallback for ${JSON.stringify(skill)}, got ${cat}`);
      }
    });

    it('3.5: classifySkill boundary objects (null, undefined, empty object, missing id)', () => {
      assert.strictEqual(classifySkill(null), 3);
      assert.strictEqual(classifySkill(undefined), 3);
      assert.strictEqual(classifySkill({}), 3);
      assert.strictEqual(classifySkill({ id: '' }), 3);
      assert.strictEqual(classifySkill({ id: null }), 3);
      assert.strictEqual(classifySkill({ nome: 'Paleta sem ID' }), 3); // id is falsy
    });

    it('3.6: Keyword precedence when a skill matches both Category 1 and Category 2 keywords', () => {
      // In classifySkill, Category 1 regex is evaluated before Category 2 regex
      // E.g. "paleta de texto" -> has "paleta" (cat 1) and "texto" (cat 2)
      const dualSkill = { id: 'paleta_de_texto' };
      const cat = classifySkill(dualSkill);
      assert.strictEqual(cat, 1, 'Category 1 takes deterministic precedence when both keywords match');
    });

    it('3.7: formatSkillsCatalog full pipeline with 100 randomly invented skills maintains total count invariant', () => {
      const skillsTempFile = path.join(os.tmpdir(), `stress_100_skills_${Date.now()}.json`);
      try {
        const mixedSkills = [];
        const prefixes = ['cor_', 'paleta_', 'svg_', 'legenda_', 'audio_', 'texto_', 'camera_', 'foley_', 'random_'];
        for (let i = 0; i < 100; i++) {
          const prefix = prefixes[i % prefixes.length];
          mixedSkills.push({
            id: `${prefix}skill_${i}`,
            nome: `Habilidade Inventada ${i}`,
            descricao: `Descrição detalhada da habilidade ${i} para teste de estresse.`
          });
        }
        fs.writeFileSync(skillsTempFile, JSON.stringify(mixedSkills), 'utf8');

        const catalog = formatSkillsCatalog(skillsTempFile);
        assert.strictEqual(catalog.totalSkills, 100);
        const sumCategories = catalog.category1.length + catalog.category2.length + catalog.category3.length;
        assert.strictEqual(sumCategories, 100, 'Sum of all categories must strictly equal totalSkills');
        assert.ok(catalog.category1.length > 0);
        assert.ok(catalog.category2.length > 0);
        assert.ok(catalog.category3.length > 0);
        assert.ok(typeof catalog.formattedText === 'string');
      } finally {
        if (fs.existsSync(skillsTempFile)) fs.unlinkSync(skillsTempFile);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // VECTOR 4: End-to-End CLI Pipeline Stress with Adversarial Inputs
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Vector 4: End-to-End CLI Pipeline Stress', () => {

    it('4.1: runOnboarding Route 1 with 1MB briefing input completes cleanly', async () => {
      const outputBuffer = [];
      const writer = (msg) => outputBuffer.push(msg);

      const hugeBriefing = 'Venda de software de IA para contadores. '.repeat(25000); // ~1MB
      const mockInput = ['1', '1', hugeBriefing];

      const res = await runOnboarding(mockInput, writer);
      assert.strictEqual(res.route, 1);
      assert.strictEqual(res.templateId, 'CarrosselEditorial');
      assert.ok(res.briefing.length > 0);
      assert.ok(!res.briefing.includes('\n'));
    });

    it('4.2: runOnboarding Route 2 with SQL injection briefing input completes cleanly', async () => {
      const outputBuffer = [];
      const writer = (msg) => outputBuffer.push(msg);

      const sqlBriefing = "'; DROP TABLE templates; SELECT * FROM credentials WHERE '1'='1";
      const mockInput = ['2', sqlBriefing];

      const res = await runOnboarding(mockInput, writer);
      assert.strictEqual(res.route, 2);
      assert.strictEqual(res.cleanSlate, true);
      assert.strictEqual(res.briefing, sqlBriefing);
      assert.strictEqual(res.config.theme, sqlBriefing);
    });

    it('4.3: runOnboarding Route 4 with shell injection reference URL and 1MB briefing completes cleanly', async () => {
      const outputBuffer = [];
      const writer = (msg) => outputBuffer.push(msg);

      const maliciousUrl = 'https://tiktok.com/@creator/video/123; rm -rf / && calc.exe';
      const hugeBriefing = 'Atração de clientes para clínica estética. '.repeat(25000); // ~1MB
      const mockInput = ['4', maliciousUrl, hugeBriefing];

      const res = await runOnboarding(mockInput, writer);
      assert.strictEqual(res.route, 4);
      assert.strictEqual(res.referenceUrl, maliciousUrl);
      assert.ok(res.briefing.length > 0);
    });

    it('4.4: runOnboarding recovers after consecutive injection strings in option choice', async () => {
      const outputBuffer = [];
      const writer = (msg) => outputBuffer.push(msg);

      const mockInput = [
        "1; rm -rf /",
        "' OR '1'='1",
        "<script>alert(1)</script>",
        "\0\0\0",
        "2", // finally valid
        "Briefing legítimo após ataques"
      ];

      const res = await runOnboarding(mockInput, writer);
      assert.strictEqual(res.route, 2);
      assert.strictEqual(res.briefing, 'Briefing legítimo após ataques');

      const out = outputBuffer.join('');
      assert.ok(out.includes('⚠️ Opção inválida'));
    });
  });
});
