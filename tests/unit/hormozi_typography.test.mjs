import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  HORMOZI_EMOJI_DICTIONARY,
  sanitizeWordForHighlight,
  matchContextualEmoji,
  calculateHormoziPop,
  calculateHormoziRotation,
  calculateRetentionProgress,
  isPunchZoomActive,
  MOTION_INTENSITY_CONFIGS,
} from '../../src/timeline/hormoziMath.ts';

describe('Vibe Design Studio — Hormozi Retention & Typography Math Unit Tests', () => {
  describe('Dicionário Semântico de Emojis Contextuais', () => {
    it('deve conter palavras-chave essenciais de finanças, foco, mente e escala', () => {
      assert.equal(HORMOZI_EMOJI_DICTIONARY['dinheiro'], '💰');
      assert.equal(HORMOZI_EMOJI_DICTIONARY['lucro'], '📈');
      assert.equal(HORMOZI_EMOJI_DICTIONARY['fogo'], '🔥');
      assert.equal(HORMOZI_EMOJI_DICTIONARY['mente'], '🧠');
      assert.equal(HORMOZI_EMOJI_DICTIONARY['foguete'], '🚀');
      assert.equal(HORMOZI_EMOJI_DICTIONARY['erro'], '❌');
    });

    it('sanitizeWordForHighlight deve normalizar acentos, maiúsculas e pontuação', () => {
      assert.equal(sanitizeWordForHighlight('Dinheiro!'), 'dinheiro');
      assert.equal(sanitizeWordForHighlight('Épico, incrível?'), 'epico incrivel');
      assert.equal(sanitizeWordForHighlight('RÁPIDO...'), 'rapido');
      assert.equal(sanitizeWordForHighlight(''), '');
    });

    it('matchContextualEmoji deve encontrar emoji em palavras pontuadas e flexionadas', () => {
      const matchDinheiro = matchContextualEmoji('DINHEIRO!');
      assert.ok(matchDinheiro);
      assert.equal(matchDinheiro.emoji, '💰');

      const matchLucro = matchContextualEmoji('lucros...');
      assert.ok(matchLucro);
      assert.equal(matchLucro.emoji, '📈');

      const matchFoguete = matchContextualEmoji('foguete!');
      assert.ok(matchFoguete);
      assert.equal(matchFoguete.emoji, '🚀');
    });

    it('matchContextualEmoji deve retornar null para palavras neutras sem emoji', () => {
      assert.equal(matchContextualEmoji('com'), null);
      assert.equal(matchContextualEmoji('para'), null);
      assert.equal(matchContextualEmoji('quando'), null);
    });

    it('matchContextualEmoji deve aceitar dicionário customizado passado por prop', () => {
      const customDict = { barbeiro: '💈', navalha: '🪒' };
      const matchBarbeiro = matchContextualEmoji('barbeiro', customDict);
      assert.ok(matchBarbeiro);
      assert.equal(matchBarbeiro.emoji, '💈');
    });
  });

  describe('Física de Mola e Pop Elástico (calculateHormoziPop)', () => {
    it('deve retornar 1.0 para frame negativo ou repouso distante', () => {
      assert.equal(calculateHormoziPop(-5, 30), 1.0);
      assert.equal(calculateHormoziPop(100, 30), 1.0);
    });

    it('deve atingir pico de overshoot nos primeiros frames da mola', () => {
      const popInitial = calculateHormoziPop(0, 30, 'standard');
      const popPeak = calculateHormoziPop(4, 30, 'standard');
      const popLate = calculateHormoziPop(25, 30, 'standard');

      assert.ok(popPeak > 1.0, `Pico da mola (${popPeak}) deve ser superior a 1.0`);
      assert.ok(popPeak <= MOTION_INTENSITY_CONFIGS.standard.maxScale + 0.05);
      assert.equal(popLate, 1.0);
    });

    it('deve respeitar as intensidades de movimento (subtle, standard, extreme)', () => {
      const popSubtle = calculateHormoziPop(4, 30, 'subtle');
      const popStandard = calculateHormoziPop(4, 30, 'standard');
      const popExtreme = calculateHormoziPop(4, 30, 'extreme');

      assert.ok(popSubtle < popStandard, 'Subtle deve ser menor que standard');
      assert.ok(popStandard < popExtreme, 'Standard deve ser menor que extreme');
    });
  });

  describe('Rotação Orgânica Harmônica (calculateHormoziRotation)', () => {
    it('deve alternar sinais entre palavras pares e ímpares', () => {
      const rotPar = calculateHormoziRotation(0, 'standard');
      const rotImpar = calculateHormoziRotation(1, 'standard');

      assert.ok(rotPar > 0, 'Palavra par deve ter ângulo positivo');
      assert.ok(rotImpar < 0, 'Palavra ímpar deve ter ângulo negativo');
    });

    it('deve zerar rotação quando intensidade for subtle', () => {
      assert.equal(calculateHormoziRotation(0, 'subtle'), 0);
      assert.equal(calculateHormoziRotation(1, 'subtle'), 0);
    });

    it('não deve exceder os limites angulares de segurança (-5° a +5°)', () => {
      for (let idx = 0; idx < 20; idx++) {
        const rot = calculateHormoziRotation(idx, 'extreme');
        assert.ok(Math.abs(rot) <= 5.5, `Rotação ${rot} não deve passar de 5.5°`);
      }
    });
  });

  describe('Barra de Retenção Contínua (calculateRetentionProgress)', () => {
    it('deve calcular progresso normalizado entre 0.0 e 1.0', () => {
      assert.equal(calculateRetentionProgress(0, 300), 0.0);
      assert.equal(calculateRetentionProgress(150, 300), 0.5);
      assert.equal(calculateRetentionProgress(300, 300), 1.0);
    });

    it('deve fazer clamp seguro para frames fora do intervalo', () => {
      assert.equal(calculateRetentionProgress(-10, 300), 0.0);
      assert.equal(calculateRetentionProgress(400, 300), 1.0);
      assert.equal(calculateRetentionProgress(50, 0), 0.0);
    });
  });

  describe('Rig de Micro-Zoom de Atenção (isPunchZoomActive)', () => {
    it('deve ativar o zoom na janela do corte de atenção', () => {
      const cutPoints = [2.0, 5.0]; // aos 2s e 5s
      const fps = 30;

      // Frame 60 = 2.0s
      const atCut = isPunchZoomActive(60, fps, cutPoints);
      assert.equal(atCut.active, true);
      assert.equal(atCut.scale, 1.12);

      // Frame 70 = 2.33s (ainda dentro da janela de 18 frames)
      const withinCut = isPunchZoomActive(70, fps, cutPoints);
      assert.equal(withinCut.active, true);

      // Frame 85 = 2.83s (fora da janela)
      const outsideCut = isPunchZoomActive(85, fps, cutPoints);
      assert.equal(outsideCut.active, false);
      assert.equal(outsideCut.scale, 1.0);
    });

    it('deve retornar inativo se lista de cortes for vazia', () => {
      const res = isPunchZoomActive(60, 30, []);
      assert.equal(res.active, false);
      assert.equal(res.scale, 1.0);
    });
  });
});
