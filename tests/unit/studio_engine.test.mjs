import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';

import {
  runOnboarding,
  promptBriefingExpresso,
  createQueuedLineReader,
  inferDirectionProposal,
  formatDirectionProposal,
  CANONICAL_ONBOARDING_PROMPT,
  CANONICAL_BRIEFING_PROMPT,
} from '../../scripts/studio_engine.mjs';

describe('Unit: Studio Engine Interactive Onboarding & CLI Flow', () => {

  describe('runOnboarding Flow', () => {
    it('deve completar Rota 1 (Usar Template) com seleção numérica e Briefing Expresso', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['1', '1', 'Vídeo sobre inteligência artificial'];

      const result = await runOnboarding(mockInput, writer);

      assert.strictEqual(result.route, 1);
      assert.strictEqual(result.templateId, 'CarrosselEditorial');
      assert.strictEqual(result.briefing, 'Vídeo sobre inteligência artificial');

      const fullOutput = outputBuffer.join('');
      assert.ok(fullOutput.includes('🎬 O que vamos criar hoje?'));
      assert.ok(fullOutput.includes('🎯 Qual é o objetivo'));
    });

    it('deve completar Rota 1 em 1 clique quando o criador fornece o briefing diretamente', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['1', 'venda de curso de programação'];

      const result = await runOnboarding(mockInput, writer);

      assert.strictEqual(result.route, 1);
      assert.strictEqual(result.templateId, 'CarrosselEditorial');
      assert.strictEqual(result.briefing, 'venda de curso de programação');
    });

    it('deve aceitar nome ou ID do template na Rota 1 (ex.: FlowMotionMaster)', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['1', 'FlowMotionMaster', 'showcase de fintech'];

      const result = await runOnboarding(mockInput, writer);

      assert.strictEqual(result.route, 1);
      assert.strictEqual(result.templateId, 'FlowMotionMaster');
      assert.strictEqual(result.briefing, 'showcase de fintech');
    });


    it('deve interceptar carrossel editorial 4:5 na Rota 2 e aplicar Protocolo Grill-Me', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['2', 'Quero criar um carrossel editorial 4:5 sobre IA', '7', '2', '1'];

      const result = await runOnboarding(mockInput, writer);

      assert.strictEqual(result.route, 2);
      assert.strictEqual(result.cleanSlate, true);
      assert.strictEqual(result.defaults.aspectRatio, '4:5');
      assert.strictEqual(result.defaults.width, 1080);
      assert.strictEqual(result.defaults.height, 1350);
      assert.deepStrictEqual(result.carousel, {
        slideCount: 7,
        visualUniformity: 'individual',
        targetType: 'motion',
      });

      const fullOutput = outputBuffer.join('');
      assert.ok(fullOutput.includes('Protocolo Grill-Me: Carrossel Editorial 4:5 Detectado'));
    });
    it('deve completar Rota 2 (Criar do Zero) com tela limpa e defaults de 9:16', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['2', 'Vídeo manifesto sobre criatividade'];

      const result = await runOnboarding(mockInput, writer);

      assert.strictEqual(result.route, 2);
      assert.strictEqual(result.cleanSlate, true);
      assert.strictEqual(result.briefing, 'Vídeo manifesto sobre criatividade');
      assert.deepStrictEqual(result.defaults, {
        aspectRatio: '9:16',
        width: 1080,
        height: 1920,
        fps: 30,
        durationInFrames: 300,
      });
    });

    it('deve executar Rota 3 (Ver Habilidades) em singleStep sem solicitar briefing', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['3'];

      const result = await runOnboarding(mockInput, writer, { singleStep: true });

      assert.strictEqual(result.route, 3);
      assert.strictEqual(result.skillViewed, true);
      assert.ok(result.catalog.formattedText.includes('Cromia, Gradientes & Decomposição Visual'));

      const fullOutput = outputBuffer.join('');
      assert.ok(fullOutput.includes('🧰 CATÁLOGO DE HABILIDADES VISUAIS'));
      assert.ok(!fullOutput.includes('🎯 Qual é o objetivo'), 'Não deve pedir briefing na inspeção de habilidades');
    });

    it('deve permitir inspecionar habilidades (Rota 3) e em seguida escolher Rota 2 com briefing', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['3', '2', 'Criação do zero após conferir habilidades'];

      const result = await runOnboarding(mockInput, writer);

      assert.strictEqual(result.route, 2);
      assert.strictEqual(result.skillViewed, true);
      assert.strictEqual(result.briefing, 'Criação do zero após conferir habilidades');
    });

    it('deve completar Rota 4 (Referência Externa) capturando URL e briefing', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['4', 'https://instagram.com/reel/123456789', 'Análise de estética para SaaS'];

      const result = await runOnboarding(mockInput, writer);

      assert.strictEqual(result.route, 4);
      assert.strictEqual(result.referenceUrl, 'https://instagram.com/reel/123456789');
      assert.strictEqual(result.briefing, 'Análise de estética para SaaS');
    });

    it('deve re-promptar diante de opções inválidas até obter entrada válida', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['invalido', '99', '-1', '2', 'Briefing pós erros'];

      const result = await runOnboarding(mockInput, writer);

      assert.strictEqual(result.route, 2);
      assert.strictEqual(result.briefing, 'Briefing pós erros');

      const fullOutput = outputBuffer.join('');
      assert.ok(fullOutput.includes('⚠️ Opção inválida'));
    });

    it('deve lançar UNEXPECTED_EOF quando o stream fechar precocemente sem entrada válida', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['invalido']; // fecha logo após entrada inválida

      await assert.rejects(
        async () => {
          await runOnboarding(mockInput, writer);
        },
        (err) => {
          assert.strictEqual(err.message, 'UNEXPECTED_EOF');
          return true;
        }
      );

      const fullOutput = outputBuffer.join('');
      assert.ok(fullOutput.includes('❌ Erro: Entrada padrão encerrada (EOF)'));
    });

    it('deve processar stream com createQueuedLineReader em rajada (simulação de piping shell)', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const pipedStream = Readable.from(['2\nVídeo via pipe burst\n']);
      const reader = createQueuedLineReader(pipedStream);

      const result = await runOnboarding(reader, writer);

      assert.strictEqual(result.route, 2);
      assert.strictEqual(result.briefing, 'Vídeo via pipe burst');
      reader.close();
    });
  });

  describe('promptBriefingExpresso', () => {
    it('deve re-promptar em caso de briefing em branco e aceitar o próximo', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['', '   ', 'Meu briefing finalmente preenchido'];

      const briefing = await promptBriefingExpresso(mockInput, writer);

      assert.strictEqual(briefing, 'Meu briefing finalmente preenchido');
      const fullOutput = outputBuffer.join('');
      assert.ok(fullOutput.includes('⚠️ O briefing não pode ser vazio'));
    });

    it('deve sanitizar quebras de linha e tabs transformando em espaço único', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['Linha 1\r\nLinha 2\tcom tabs'];

      const briefing = await promptBriefingExpresso(mockInput, writer);

      assert.strictEqual(briefing, 'Linha 1 Linha 2 com tabs');
    });

    it('deve lidar com emojis e caracteres especiais sem quebras', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['🎬🚀 Lançamento Épico & "High-End"'];

      const briefing = await promptBriefingExpresso(mockInput, writer);

      assert.strictEqual(briefing, '🎬🚀 Lançamento Épico & "High-End"');
    });

    it('deve lançar UNEXPECTED_EOF se o stream terminar antes do briefing ser fornecido', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const emptyStream = Readable.from([]);
      const reader = createQueuedLineReader(emptyStream);

      await assert.rejects(
        async () => {
          await promptBriefingExpresso(reader, writer);
        },
        (err) => {
          assert.strictEqual(err.message, 'UNEXPECTED_EOF');
          return true;
        }
      );
      reader.close();
    });
  });

  describe('inferDirectionProposal & formatDirectionProposal (Suggest & Confirm)', () => {
    it('deve inferir estética Full Bleed Terminal para briefings de código/terminal', () => {
      const prop = inferDirectionProposal('Vídeo de terminal em Remotion para devs');
      assert.strictEqual(prop.layoutMode, 'full_bleed_terminal');
      assert.strictEqual(prop.estetica, 'Full Bleed Terminal & Raw Code (Sem mockups/cards flutuantes)');
      assert.deepStrictEqual(prop.paleta, ['#08090C', '#00FF66', '#FF0022', '#FFFFFF']);
    });

    it('deve inferir estética Fintech High-End para briefings financeiros', () => {
      const prop = inferDirectionProposal('Showcase do app financeiro e fluxo de caixa');
      assert.strictEqual(prop.layoutMode, 'fintech_showcase');
      assert.ok(prop.estetica.includes('Fintech High-End'));
    });

    it('deve inferir estética Brutalismo Anti-Slop para briefings de IA genérica', () => {
      const prop = inferDirectionProposal('O fim dos vídeos genéricos de IA e slop');
      assert.strictEqual(prop.layoutMode, 'brutalismo_anti_slop');
      assert.ok(prop.estetica.includes('Anti-Slop'));
    });

    it('deve formatar o card visual em 1 clique sem erros', () => {
      const prop = inferDirectionProposal('Lançamento da nova skill de terminal');
      const formatted = formatDirectionProposal(prop);
      assert.ok(formatted.includes('PROPOSTA DE DIREÇÃO (1 CLIQUE)'));
      assert.ok(formatted.includes('[1] Aprovar e Gerar Direto'));
    });

    it('deve anexar directionProposal ao resultado da Rota 2 no runOnboarding', async () => {
      const outputBuffer = [];
      const writer = (chunk) => outputBuffer.push(chunk);
      const mockInput = ['2', 'Vídeo sobre automação de código no terminal'];

      const result = await runOnboarding(mockInput, writer);

      assert.strictEqual(result.route, 2);
      assert.ok(result.directionProposal);
      assert.strictEqual(result.directionProposal.layoutMode, 'full_bleed_terminal');

      const fullOutput = outputBuffer.join('');
      assert.ok(fullOutput.includes('PROPOSTA DE DIREÇÃO (1 CLIQUE)'));
    });
  });
});
