/**
 * 🥊 ADVERSARIAL STRESS CHALLENGE TEST SUITE (Milestone 1)
 * Target: scripts/studio_engine.mjs
 * 
 * Verifies:
 * - createQueuedLineReader rapid burst inputs, multi-line pipes, partial chunks, delayed streams
 * - adversarial shell piping: empty pipes (0 bytes), EOF, 100 invalid choices followed by EOF
 * - process hang prevention, memory leak boundaries, unhandled promise rejections
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { PassThrough, Readable } from 'node:stream';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINE_ROOT = path.resolve(__dirname, '..', '..');
const STUDIO_ENGINE_PATH = path.join(ENGINE_ROOT, 'scripts', 'studio_engine.mjs');

// Dynamically import module under test using pathToFileURL for Windows compatibility
const studioEngine = await import(pathToFileURL(STUDIO_ENGINE_PATH).href);
const {
  createQueuedLineReader,
  adaptReader,
  adaptWriter,
  parseOptionChoice,
  sanitizeBriefing,
  formatSkillsCatalog,
  listTemplates,
  calculateSafeZones,
  generateCleanSlate,
  promptBriefingExpresso,
  runOnboarding,
  CANONICAL_ONBOARDING_PROMPT,
  CANONICAL_BRIEFING_PROMPT,
} = studioEngine;

/**
 * Spawns studio_engine.mjs as an independent child process to verify real CLI piping behavior.
 */
function spawnEngineProcess({ timeoutMs = 4000 } = {}) {
  const child = spawn(process.execPath, [STUDIO_ENGINE_PATH], {
    cwd: ENGINE_ROOT,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, NODE_NO_WARNINGS: '1' }
  });

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  const completionPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Process timed out after ${timeoutMs}ms (Process Hang Detected)`));
    }, timeoutMs);

    child.on('close', (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal, stdout, stderr });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });

  return {
    child,
    completionPromise,
    write: (data) => child.stdin.write(data),
    end: (data) => child.stdin.end(data)
  };
}

describe('🥊 M1 Empirical Challenge: createQueuedLineReader Stress & Streams', () => {

  test('1.1 Rapid burst: 1,000 lines pushed synchronously before reading', async () => {
    const stream = new PassThrough();
    const reader = createQueuedLineReader(stream);

    // Push 1000 lines in rapid succession
    for (let i = 0; i < 1000; i++) {
      stream.write(`line_${i}\n`);
    }
    stream.end();

    // Consume all 1000 lines
    for (let i = 0; i < 1000; i++) {
      const line = await reader.nextLine();
      assert.strictEqual(line, `line_${i}`);
    }

    // Next line should be null (EOF)
    const eof = await reader.nextLine();
    assert.strictEqual(eof, null);
    reader.close();
  });

  test('1.2 Multi-line chunks: 200 lines packed into a single chunk write', async () => {
    const stream = new PassThrough();
    const reader = createQueuedLineReader(stream);

    const chunk = Array.from({ length: 200 }, (_, i) => `chunk_line_${i}`).join('\r\n') + '\r\n';
    stream.write(chunk);
    stream.end();

    for (let i = 0; i < 200; i++) {
      const line = await reader.nextLine();
      assert.strictEqual(line, `chunk_line_${i}`);
    }

    const eof = await reader.nextLine();
    assert.strictEqual(eof, null);
    reader.close();
  });

  test('1.3 Partial chunks across network/pipe packet boundaries', async () => {
    const stream = new PassThrough();
    const reader = createQueuedLineReader(stream);

    const nextPromise = reader.nextLine();

    // Emit partial bytes with delays
    stream.write('Par');
    await new Promise((r) => setTimeout(r, 20));
    stream.write('tial ');
    await new Promise((r) => setTimeout(r, 20));
    stream.write('Line Content\n');

    const result = await nextPromise;
    assert.strictEqual(result, 'Partial Line Content');

    stream.end();
    const eof = await reader.nextLine();
    assert.strictEqual(eof, null);
    reader.close();
  });

  test('1.4 Incomplete line followed immediately by EOF (unterminated chunk)', async () => {
    const stream = new PassThrough();
    const reader = createQueuedLineReader(stream);

    stream.write('Final line without trailing newline');
    stream.end();

    const line = await reader.nextLine();
    assert.strictEqual(line, 'Final line without trailing newline');

    const eof = await reader.nextLine();
    assert.strictEqual(eof, null);
    reader.close();
  });

  test('1.5 Concurrent waiters burst: 200 nextLine calls before data arrives', async () => {
    const stream = new PassThrough();
    const reader = createQueuedLineReader(stream);

    // Call nextLine 200 times concurrently
    const promises = Array.from({ length: 200 }, () => reader.nextLine());

    // Now write 200 lines
    for (let i = 0; i < 200; i++) {
      stream.write(`concurrent_${i}\n`);
    }
    stream.end();

    const results = await Promise.all(promises);
    for (let i = 0; i < 200; i++) {
      assert.strictEqual(results[i], `concurrent_${i}`);
    }

    const eof = await reader.nextLine();
    assert.strictEqual(eof, null);
    reader.close();
  });

  test('1.6 Delayed streams: Slow ticker streaming line by line', async () => {
    const stream = new PassThrough();
    const reader = createQueuedLineReader(stream);

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      stream.write(`tick_${counter}\n`);
      if (counter === 5) {
        clearInterval(interval);
        stream.end();
      }
    }, 15);

    for (let i = 1; i <= 5; i++) {
      const line = await reader.nextLine();
      assert.strictEqual(line, `tick_${i}`);
    }

    const eof = await reader.nextLine();
    assert.strictEqual(eof, null);
    reader.close();
  });

  test('1.7 Immediate 0-byte EOF resolves to null without hanging', async () => {
    const stream = new PassThrough();
    const reader = createQueuedLineReader(stream);

    stream.end(); // 0 bytes

    const first = await reader.nextLine();
    assert.strictEqual(first, null);

    const second = await reader.nextLine();
    assert.strictEqual(second, null);
    reader.close();
  });

  test('1.8 Pending waiters when stream ends prematurely resolve to null', async () => {
    const stream = new PassThrough();
    const reader = createQueuedLineReader(stream);

    const p1 = reader.nextLine();
    const p2 = reader.nextLine();
    const p3 = reader.nextLine();

    stream.end();

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
    assert.strictEqual(r1, null);
    assert.strictEqual(r2, null);
    assert.strictEqual(r3, null);
    reader.close();
  });

  test('1.9 Manual reader.close() resolves pending waiters and idempotently closes', async () => {
    const stream = new PassThrough();
    const reader = createQueuedLineReader(stream);

    const pending = reader.nextLine();
    reader.close();
    reader.close(); // idempotent

    const result = await pending;
    assert.strictEqual(result, null);

    const afterClose = await reader.nextLine();
    assert.strictEqual(afterClose, null);
  });
});

describe('🥊 M2 Empirical Challenge: Adversarial Shell Piping & CLI Execution', () => {

  test('2.1 Empty pipe (0 bytes) -> exits code 1 with UNEXPECTED_EOF error message, no hang', async () => {
    const { child, completionPromise, end } = spawnEngineProcess();
    end(); // Send 0 bytes and close stdin immediately

    const { code, stdout, stderr } = await completionPromise;

    assert.strictEqual(code, 1, 'Process should exit with failure code 1 on 0-byte EOF');
    assert.match(stdout, /🎬 O que vamos criar hoje\?/);
    assert.match(stdout, /Entrada padrão encerrada \(EOF\)/);
    assert.strictEqual(stderr.includes('UnhandledPromiseRejection'), false);
  });

  test('2.2 100 invalid choices followed by EOF -> reprompts 100 times, exits code 1, no leak', async () => {
    const { child, completionPromise, write, end } = spawnEngineProcess({ timeoutMs: 6000 });

    const payload = 'invalid_choice\n'.repeat(100);
    write(payload);
    end();

    const { code, stdout, stderr } = await completionPromise;

    assert.strictEqual(code, 1);
    // Count occurrences of invalid option warning
    const warningMatches = stdout.match(/⚠️ Opção inválida/g);
    assert.ok(warningMatches, 'Should contain invalid option warnings');
    assert.strictEqual(warningMatches.length, 100, 'Should have reprompted exactly 100 times');
    assert.match(stdout, /Entrada padrão encerrada \(EOF\)/);
    assert.strictEqual(stderr.includes('UnhandledPromiseRejection'), false);
  });

  test('2.3 Rapid burst piping for Route 1: 1 -> 1 -> Briefing in single chunk', async () => {
    const { completionPromise, end } = spawnEngineProcess();
    
    // Pipe all inputs in a single burst
    end('1\n1\nCampanha Dia das Mães High Retention\n');

    const { code, stdout, stderr } = await completionPromise;

    assert.strictEqual(code, 0, 'Process should exit cleanly with code 0');
    assert.match(stdout, /✅ ONBOARDING CONCLUÍDO COM SUCESSO!/);
    assert.match(stdout, /"route": 1/);
    assert.match(stdout, /"briefing": "Campanha Dia das Mães High Retention"/);
    assert.strictEqual(stderr, '');
  });

  test('2.4 Rapid burst piping for Route 2: Clean Slate', async () => {
    const { completionPromise, end } = spawnEngineProcess();
    
    end('2\nLançamento SaaS B2B\n');

    const { code, stdout, stderr } = await completionPromise;

    assert.strictEqual(code, 0);
    assert.match(stdout, /🎨 Iniciando criação do zero/);
    assert.match(stdout, /"route": 2/);
    assert.match(stdout, /"cleanSlate": true/);
    assert.match(stdout, /"theme": "Lançamento SaaS B2B"/);
    assert.strictEqual(stderr, '');
  });

  test('2.5 Route 3 View Skills -> Returns to menu -> Selects Route 2 Clean Slate', async () => {
    const { completionPromise, end } = spawnEngineProcess();

    end('3\n2\nVídeo Institucional\n');

    const { code, stdout, stderr } = await completionPromise;

    assert.strictEqual(code, 0);
    assert.match(stdout, /🧰 CATÁLOGO DE HABILIDADES VISUAIS/);
    assert.match(stdout, /Categoria 1: Cromia/);
    assert.match(stdout, /Categoria 2: Tipografia/);
    assert.match(stdout, /Categoria 3: Cinemática/);
    assert.match(stdout, /Retornando ao menu principal/);
    assert.match(stdout, /"route": 2/);
    assert.match(stdout, /"skillViewed": true/);
    assert.strictEqual(stderr, '');
  });

  test('2.6 Route 4 Reference: URL provided + Briefing', async () => {
    const { completionPromise, end } = spawnEngineProcess();

    end('4\nhttps://instagram.com/reel/xyz123\nConteúdo Viral Inspirado\n');

    const { code, stdout, stderr } = await completionPromise;

    assert.strictEqual(code, 0);
    assert.match(stdout, /"route": 4/);
    assert.match(stdout, /"referenceUrl": "https:\/\/instagram\.com\/reel\/xyz123"/);
    assert.match(stdout, /"briefing": "Conteúdo Viral Inspirado"/);
  });

  test('2.7 Route 4 Reference: Empty URL (Enter to skip) + Briefing', async () => {
    const { completionPromise, end } = spawnEngineProcess();

    end('4\n\nBriefing Direto Sem Link\n');

    const { code, stdout, stderr } = await completionPromise;

    assert.strictEqual(code, 0);
    assert.match(stdout, /"route": 4/);
    assert.match(stdout, /"referenceUrl": null/);
    assert.match(stdout, /"briefing": "Briefing Direto Sem Link"/);
  });

  test('2.8 Premature EOF during Route 1 template index choice -> exits code 1', async () => {
    const { completionPromise, end } = spawnEngineProcess();

    end('1\n'); // User selects [1], but stream closes before choosing template

    const { code, stdout, stderr } = await completionPromise;

    assert.strictEqual(code, 1);
    assert.match(stdout, /Entrada padrão encerrada \(EOF\) na seleção de template/);
  });

  test('2.9 Premature EOF during Route 2 briefing prompt -> exits code 1', async () => {
    const { completionPromise, end } = spawnEngineProcess();

    end('2\n'); // User selects [2], but stream closes before briefing

    const { code, stdout, stderr } = await completionPromise;

    assert.strictEqual(code, 1);
    assert.match(stdout, /Entrada padrão encerrada \(EOF\) sem resposta ao briefing/);
  });

  test('2.10 Premature EOF during Route 4 reference URL prompt -> exits code 1', async () => {
    const { completionPromise, end } = spawnEngineProcess();

    end('4\n'); // User selects [4], but stream closes on reference input

    const { code, stdout, stderr } = await completionPromise;

    assert.strictEqual(code, 1);
    assert.match(stdout, /Entrada padrão encerrada \(EOF\) na referência externa/);
  });
});

describe('🥊 M3 Empirical Challenge: Memory Leak & Payload Extremes', () => {

  test('3.1 5,000 invalid choices via runOnboarding: Memory stress & stability', async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    const invalidInputs = Array.from({ length: 5000 }, () => 'invalid_opt');
    invalidInputs.push('2'); // Finally pick 2
    invalidInputs.push('Stress Test Completed'); // Briefing

    let outputCount = 0;
    const dummyWriter = () => { outputCount++; };

    const result = await runOnboarding(invalidInputs, dummyWriter);

    assert.strictEqual(result.route, 2);
    assert.strictEqual(result.briefing, 'Stress Test Completed');

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryGrowthMB = (finalMemory - initialMemory) / (1024 * 1024);

    // Memory growth should be modest (< 30 MB for 5,000 iterations in V8)
    assert.ok(memoryGrowthMB < 30, `Memory grew by ${memoryGrowthMB.toFixed(2)} MB, exceeding safe boundary`);
  });

  test('3.2 Megabyte-sized briefing payload processed without stack overflow', () => {
    const megaPayload = 'Tema Gigante '.repeat(50000); // ~650 KB
    const sanitized = sanitizeBriefing(megaPayload);

    assert.ok(sanitized.startsWith('Tema Gigante'));
    assert.ok(sanitized.length > 500000);
  });

  test('3.3 Hostile ANSI flooding and null byte injections', () => {
    const hostileInput = '\x1b[31;1m\x1b[42m\0\0\u200B\uFEFFVenda \x1b[0m\t\t\r\n\x1b[33mde SaaS\x1b[0m';
    const sanitized = sanitizeBriefing(hostileInput);

    assert.strictEqual(sanitized, 'Venda de SaaS');
  });

  test('3.4 Repeated Ver Habilidades loop (50 times) without memory leak', async () => {
    const inputs = [];
    for (let i = 0; i < 50; i++) {
      inputs.push('3'); // View skills
    }
    inputs.push('2'); // Then clean slate
    inputs.push('Briefing pos 50 skills');

    let output = '';
    const writer = (chunk) => { output += chunk; };

    const result = await runOnboarding(inputs, writer);

    assert.strictEqual(result.route, 2);
    assert.strictEqual(result.skillViewed, true);
    assert.strictEqual(result.briefing, 'Briefing pos 50 skills');
  });
});
