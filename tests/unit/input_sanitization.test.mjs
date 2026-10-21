import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';

import {
  parseOptionChoice,
  sanitizeBriefing,
  createQueuedLineReader,
} from '../../scripts/studio_engine.mjs';

describe('Unit: Input Sanitization & Stream Queuing', () => {

  describe('parseOptionChoice', () => {
    it('deve aceitar números válidos de 1 a 4 em formatos variados', () => {
      assert.strictEqual(parseOptionChoice('1'), 1);
      assert.strictEqual(parseOptionChoice('2'), 2);
      assert.strictEqual(parseOptionChoice('3'), 3);
      assert.strictEqual(parseOptionChoice('4'), 4);
      assert.strictEqual(parseOptionChoice('  1  '), 1);
      assert.strictEqual(parseOptionChoice('[2]'), 2);
      assert.strictEqual(parseOptionChoice(' [3] '), 3);
      assert.strictEqual(parseOptionChoice('4.'), 4);
      assert.strictEqual(parseOptionChoice('[1].'), 1);
    });

    it('deve rejeitar números fora do intervalo [1-4]', () => {
      assert.strictEqual(parseOptionChoice('0'), null);
      assert.strictEqual(parseOptionChoice('5'), null);
      assert.strictEqual(parseOptionChoice('99'), null);
      assert.strictEqual(parseOptionChoice('-1'), null);
    });

    it('deve rejeitar entradas vazias, espaços e texto arbitrário', () => {
      assert.strictEqual(parseOptionChoice(''), null);
      assert.strictEqual(parseOptionChoice('   '), null);
      assert.strictEqual(parseOptionChoice('abc'), null);
      assert.strictEqual(parseOptionChoice('one'), null);
      assert.strictEqual(parseOptionChoice('1 2'), null);
      assert.strictEqual(parseOptionChoice(null), null);
      assert.strictEqual(parseOptionChoice(undefined), null);
    });

    it('deve rejeitar injeções de comando e caracteres nulos', () => {
      assert.strictEqual(parseOptionChoice('1\0'), null);
      assert.strictEqual(parseOptionChoice('1; rm -rf'), null);
      assert.strictEqual(parseOptionChoice('<script>alert(1)</script>'), null);
    });
  });

  describe('sanitizeBriefing', () => {
    it('deve preservar briefings objetivos em linha única', () => {
      const input = 'Venda de consultoria de IA para médicos';
      assert.strictEqual(sanitizeBriefing(input), input);
    });

    it('deve aparar bordas e colapsar espaços múltiplos', () => {
      const input = '   Tema    com    muitos   espaços    ';
      assert.strictEqual(sanitizeBriefing(input), 'Tema com muitos espaços');
    });

    it('deve achatar quebras de linha e tabulações para espaço único', () => {
      const input = 'Linha 1\nLinha 2\r\nLinha 3\tcom tab';
      assert.strictEqual(sanitizeBriefing(input), 'Linha 1 Linha 2 Linha 3 com tab');
    });

    it('deve remover sequências de escape ANSI de cores', () => {
      const input = '\u001b[31mTexto Vermelho\u001b[0m e \u001b[1mNegrito\u001b[0m';
      assert.strictEqual(sanitizeBriefing(input), 'Texto Vermelho e Negrito');
    });

    it('deve expurgar bytes nulos e caracteres de largura zero', () => {
      const input = 'Texto\0com\u200Bzero\u200Cwidth\uFEFFescondido';
      assert.strictEqual(sanitizeBriefing(input), 'Textocomzerowidthescondido');
    });

    it('deve retornar string vazia para tipos não-string', () => {
      assert.strictEqual(sanitizeBriefing(null), '');
      assert.strictEqual(sanitizeBriefing(undefined), '');
      assert.strictEqual(sanitizeBriefing(1234), '');
    });
  });

  describe('createQueuedLineReader', () => {
    it('deve ler linhas sequenciais sem perda em rajadas de stream', async () => {
      const stream = Readable.from(['primeira\nsegunda\nterceira\n']);
      const reader = createQueuedLineReader(stream);

      assert.strictEqual(await reader.nextLine(), 'primeira');
      assert.strictEqual(await reader.nextLine(), 'segunda');
      assert.strictEqual(await reader.nextLine(), 'terceira');
      assert.strictEqual(await reader.nextLine(), null);
      reader.close();
    });

    it('deve tolerar quebras de linha no formato Windows CRLF (\\r\\n)', async () => {
      const stream = Readable.from(['linhaWindows1\r\nlinhaWindows2\r\n']);
      const reader = createQueuedLineReader(stream);

      assert.strictEqual(await reader.nextLine(), 'linhaWindows1');
      assert.strictEqual(await reader.nextLine(), 'linhaWindows2');
      assert.strictEqual(await reader.nextLine(), null);
      reader.close();
    });

    it('deve resolver com null em caso de stream vazio', async () => {
      const stream = Readable.from([]);
      const reader = createQueuedLineReader(stream);

      assert.strictEqual(await reader.nextLine(), null);
      reader.close();
    });

    it('deve liberar chamadas pendentes quando o stream fechar', async () => {
      const stream = new Readable({ read() {} });
      const reader = createQueuedLineReader(stream);

      const pendingNextLine = reader.nextLine();
      stream.push(null); // fecha o stream
      const result = await pendingNextLine;

      assert.strictEqual(result, null);
      reader.close();
    });
  });
});
