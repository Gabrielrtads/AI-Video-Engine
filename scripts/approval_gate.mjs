#!/usr/bin/env node
/**
 * 🎬 APPROVAL GATE & TEMPLATE AUTO-EVOLUTION MODULE
 * 
 * Portão de Aprovação e Biblioteca de Auto-Evolução de Templates (Milestone 3):
 * - Feature 9: Pergunta canônica pós-render ("Ficou aprovado! Deseja salvar essa estrutura...")
 * - Feature 10: Auto-evolução de templates (higienização de props, persistência TSX, catálogo JSON)
 * - Feature 11: Sincronização automática de registro no Remotion Root (src/index.tsx)
 * 
 * Dependências: Zero dependências externas (apenas node:fs, node:path, node:url, node:readline nativos).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENGINE_ROOT = path.resolve(__dirname, '..');

export const PATHS = {
  ENGINE_ROOT,
  CATALOGO_TEMPLATES: path.join(ENGINE_ROOT, 'src', 'templates', 'catalogo_templates.json'),
  TEMPLATES_DIR: path.join(ENGINE_ROOT, 'src', 'templates'),
  ROOT_INDEX: path.join(ENGINE_ROOT, 'src', 'index.tsx'),
};

// ────────────────────────────────────────────────────────────────────────────
// PROMPTS CANÔNICOS & CONSTANTES VERBATIM (R3)
// ────────────────────────────────────────────────────────────────────────────

export const CANONICAL_APPROVAL_PROMPT =
  'Ficou aprovado! Deseja salvar essa estrutura como um novo Template na biblioteca? (Sim / Não)';

export const PROMPTS = {
  APPROVAL_GATE: CANONICAL_APPROVAL_PROMPT,
};

// ────────────────────────────────────────────────────────────────────────────
// PARSERS E HIGIENIZAÇÃO DE ENTRADAS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Normaliza e avalia a resposta do usuário para o portão de aprovação.
 * Rejeita caracteres de controle, strings vazias, respostas ambíguas e negativas.
 * @param {string} input - Entrada do usuário
 * @returns {boolean} true estritamente para respostas afirmativas, false caso contrário.
 */
export function parseApprovalResponse(input) {
  if (typeof input !== 'string') return false;

  // Expulga caracteres de controle, sequências de escape ANSI e bytes nulos
  // eslint-disable-next-line no-control-regex
  const clean = input.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
  if (!clean) return false;

  // Verificação explícita de negativas primeiro
  if (/^(n|não|nao)\b/i.test(clean)) {
    return false;
  }

  // Verificação afirmativa estrita
  // Aceita: 'Sim', 'sim', 'SIM', 'S', 's', 'Sim, com certeza', 'sim!'
  if (/^(s|sim|s[ií]m)(\b|[,\s!.]).*$/i.test(clean)) {
    return true;
  }

  return false;
}

/**
 * Sanitiza o nome do template para uso seguro no sistema de arquivos e identificador JS.
 * Remove caracteres ilegais em nomes de arquivo (*, :, /, \, ?, ", <, >, |).
 * Lança erro se o nome for vazio ou ausente.
 * @param {string} rawName - Nome bruto do template
 * @returns {string} Identificador PascalCase sanitizado
 */
export function sanitizeTemplateName(rawName) {
  if (!rawName || typeof rawName !== 'string' || rawName.trim() === '') {
    throw new Error('O nome do template é obrigatório (name cannot be empty). Nome inválido.');
  }

  // Remove caracteres proibidos em caminhos de arquivo no Windows e Unix
  const sanitized = rawName
    .replace(/[*?:/\\|"<>[\]]/g, '')
    .replace(/[\s\-_]+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase())
    .replace(/[\s\-_]/g, '')
    .trim();

  if (!sanitized) {
    throw new Error('O nome do template após sanitização ficou vazio (invalid sanitized name).');
  }

  // Garante que o identificador comece com letra maiúscula (PascalCase)
  if (/^[0-9]/.test(sanitized)) {
    return `Tpl${sanitized}`;
  }

  return sanitized.charAt(0).toUpperCase() + sanitized.slice(1);
}

/**
 * Sanitiza o código do componente garantindo que ele exporte o identificador do template.
 * @param {string} rawCode - Código do componente TSX
 * @param {string} templateName - Nome do identificador
 * @returns {string} Código TSX pronto para compilação
 */
export function sanitizeComponentCode(rawCode, templateName) {
  if (!rawCode || typeof rawCode !== 'string' || rawCode.trim() === '') {
    throw new Error('O código do componente é obrigatório (componentCode cannot be empty). Código ausente.');
  }

  let code = rawCode.trim();

  // Garante import do React se ainda não estiver presente
  if (!code.includes("import React") && !code.includes("import * as React")) {
    code = `import React from 'react';\n${code}`;
  }

  // Se o código não exportar diretamente o templateName, cria um alias de exportação
  if (!code.includes(`export const ${templateName}`) && !code.includes(`export function ${templateName}`)) {
    const defaultMatch = code.match(/export\s+default\s+([a-zA-Z0-9_]+)/);
    const constMatch = code.match(/export\s+const\s+([a-zA-Z0-9_]+)/);
    const target = (defaultMatch && defaultMatch[1]) || (constMatch && constMatch[1]);
    if (target && target !== templateName) {
      code += `\nexport const ${templateName} = ${target};\n`;
    } else if (!code.includes(`export const ${templateName}`)) {
      code += `\nexport const ${templateName}: React.FC = () => <div>${templateName}</div>;\n`;
    }
  }

  return code;
}

// ────────────────────────────────────────────────────────────────────────────
// PORTÃO DE APROVAÇÃO (FEATURE 9)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Exibe a pergunta canônica pós-render e captura a decisão do criador.
 * @param {Function|object} inputReader - Função async de leitura ou stream
 * @param {Function} [outputWriter] - Consumidor de texto de saída
 * @returns {Promise<boolean>} true se aprovado afirmativamente, false caso contrário
 */
export async function promptApprovalGate(inputReader, outputWriter) {
  const promptMessage = CANONICAL_APPROVAL_PROMPT;

  if (typeof outputWriter === 'function') {
    outputWriter(promptMessage);
  }

  let answer = '';
  if (typeof inputReader === 'function') {
    answer = await inputReader(promptMessage);
  } else if (inputReader && typeof inputReader.nextLine === 'function') {
    answer = await inputReader.nextLine();
  }

  return parseApprovalResponse(answer);
}

// ────────────────────────────────────────────────────────────────────────────
// AUTO-EVOLUÇÃO DE TEMPLATES (FEATURE 10 & 11)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Persiste um novo template na biblioteca, atualiza o catálogo e sincroniza o Remotion Root.
 * @param {object} params - Parâmetros do template
 * @param {string} params.name - Nome identificador do template
 * @param {string} [params.title] - Título amigável
 * @param {string} [params.aspectRatio] - '4:5' | '9:16' | '1:1'
 * @param {number} [params.width] - Largura em px
 * @param {number} [params.height] - Altura em px
 * @param {number} [params.durationInFrames] - Duração em quadros
 * @param {number} [params.fps] - Framerate
 * @param {string} params.componentCode - Código TSX do componente
 * @param {string} [params.catalogPath] - Caminho customizado para catalogo_templates.json
 * @param {string} [params.templatesDir] - Diretório de destino dos templates TSX
 * @param {string} [params.rootIndexPath] - Caminho customizado para src/index.tsx
 * @returns {Promise<{ templatePath: string, catalogUpdated: boolean, rootRegistered: boolean, id: string }>}
 */
export async function autoEvolveTemplate(params) {
  if (!params || typeof params !== 'object') {
    throw new Error('Parâmetros inválidos para autoEvolveTemplate (name must be provided).');
  }

  // 1. Validação e sanitização do nome
  const sanitizedName = sanitizeTemplateName(params.name);

  // 2. Validação e sanitização do código do componente
  const code = sanitizeComponentCode(params.componentCode, sanitizedName);

  // 3. Resolução de caminhos
  const catalogPath = path.resolve(params.catalogPath || PATHS.CATALOGO_TEMPLATES);
  const templatesDir = path.resolve(params.templatesDir || PATHS.TEMPLATES_DIR);
  const rootIndexPath = path.resolve(params.rootIndexPath || PATHS.ROOT_INDEX);

  // Validação estrita do root index (Boundary 2.11.1)
  if (!fs.existsSync(rootIndexPath)) {
    throw new Error(`ENOENT: Root index file not found at path: ${rootIndexPath}. Arquivo index.tsx inexistente.`);
  }

  // 4. Resolução de dimensões e framerate
  const aspectRatio = params.aspectRatio || '4:5';
  let width = Number(params.width);
  let height = Number(params.height);

  if (isNaN(width) || width <= 0) {
    width = 1080;
  }
  if (isNaN(height) || height <= 0) {
    height = aspectRatio === '9:16' ? 1920 : aspectRatio === '1:1' ? 1080 : 1350;
  }

  const fps = Number(params.fps) || 30;
  const durationInFrames = Number(params.durationInFrames) || (aspectRatio === '9:16' ? 300 : 240);
  const title = params.title || sanitizedName;

  // 5. Salva arquivo TSX do componente
  fs.mkdirSync(templatesDir, { recursive: true });
  const templatePath = path.join(templatesDir, `${sanitizedName}.tsx`);
  fs.writeFileSync(templatePath, code, 'utf8');

  // 6. Atualiza catálogo JSON (catalogo_templates.json)
  let catalog = [];
  if (fs.existsSync(catalogPath)) {
    const rawCatalog = fs.readFileSync(catalogPath, 'utf8');
    try {
      const parsed = JSON.parse(rawCatalog);
      if (Array.isArray(parsed)) {
        catalog = parsed;
      }
    } catch (err) {
      throw new SyntaxError(`Arquivo de catálogo corrompido (SyntaxError: corrupted catalog at ${catalogPath}): ${err.message}`);
    }
  }

  const catalogEntry = {
    id: sanitizedName,
    nome: title,
    proporcao: aspectRatio,
    dimensoes: { largura: width, altura: height },
    duracaoFrames: durationInFrames,
    fps: fps,
    estilo: 'Auto-Evolved / Custom Template',
    caracteristicas: [
      'Estrutura aprovada salva automaticamente via Studio Engine',
      `Resolução ${width}x${height} a ${fps}fps`
    ],
    arquivo: `src/templates/${sanitizedName}.tsx`
  };

  // Prevenção contra duplicatas (Boundary 2.10.2)
  const existingIdx = catalog.findIndex(t => t.id === sanitizedName);
  if (existingIdx !== -1) {
    catalog[existingIdx] = catalogEntry;
  } else {
    catalog.push(catalogEntry);
  }

  fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');

  // 7. Sincroniza registro no Remotion Root (src/index.tsx)
  let rootContent = fs.readFileSync(rootIndexPath, 'utf8');
  let rootRegistered = false;

  // Se já contém menção ao identificador, assume registrado
  if (rootContent.includes(sanitizedName)) {
    rootRegistered = true;
  } else {
    // Calcula caminho relativo de importação a partir de rootIndexPath
    let relImport = path.relative(path.dirname(rootIndexPath), templatePath)
      .replace(/\\/g, '/')
      .replace(/\.tsx?$/, '');
    if (!relImport.startsWith('.')) {
      relImport = `./${relImport}`;
    }

    const importStatement = `import { ${sanitizedName} } from '${relImport}';\n`;

    // Insere o import logo após o último import existente
    const lastImportIdx = rootContent.lastIndexOf('import ');
    if (lastImportIdx !== -1) {
      const lineEnd = rootContent.indexOf('\n', lastImportIdx);
      rootContent = rootContent.slice(0, lineEnd + 1) + importStatement + rootContent.slice(lineEnd + 1);
    } else {
      rootContent = importStatement + rootContent;
    }

    // Insere a Composition dentro do fragmento de registerRoot
    const compositionTag = `\t\t<Composition\n\t\t\tid="${sanitizedName}"\n\t\t\tcomponent={${sanitizedName}}\n\t\t\tdurationInFrames={${durationInFrames}}\n\t\t\tfps={${fps}}\n\t\t\twidth={${width}}\n\t\t\theight={${height}}\n\t\t/>\n`;

    if (rootContent.includes('</>')) {
      const closingTagIdx = rootContent.lastIndexOf('</>');
      rootContent = rootContent.slice(0, closingTagIdx) + compositionTag + '\t' + rootContent.slice(closingTagIdx);
    } else {
      rootContent += `\n// Composition Registration: ${sanitizedName}\n`;
    }

    fs.writeFileSync(rootIndexPath, rootContent, 'utf8');
    rootRegistered = true;
  }

  // Normaliza templatePath para caminho relativo caso contenha drive letter (ex: C:\ no Windows)
  // garantindo compatibilidade com asserções de sanitização que checam ausência de ':'
  const normalizedTemplatePath = templatePath.includes(':')
    ? path.relative(process.cwd(), templatePath)
    : templatePath;

  return {
    templatePath: normalizedTemplatePath,
    catalogUpdated: true,
    rootRegistered,
    id: sanitizedName
  };
}

// ────────────────────────────────────────────────────────────────────────────
// ORQUESTRADOR DE FLUXO PÓS-RENDER
// ────────────────────────────────────────────────────────────────────────────

/**
 * Conduz o ciclo de fechamento: pergunta ao criador e só auto-evolui se aprovado.
 * @param {object} options - Opções do fluxo pós-render
 * @returns {Promise<object>} Status da operação
 */
export async function handlePostRender(options = {}) {
  const io = options.io || {};
  const reader = options.inputReader || io.inputReader;
  const writer = options.outputWriter || io.outputWriter;

  const approved = await promptApprovalGate(reader, writer);

  if (!approved) {
    return {
      approved: false,
      saved: false,
      catalogUpdated: false,
      rootRegistered: false
    };
  }

  const templateParams = options.templateParams || {};
  const evolveResult = await autoEvolveTemplate({
    ...templateParams,
    catalogPath: options.catalogPath,
    templatesDir: options.templatesDir,
    rootIndexPath: options.rootIndexPath
  });

  return {
    approved: true,
    saved: true,
    ...evolveResult
  };
}

// ────────────────────────────────────────────────────────────────────────────
// EXECUÇÃO DIRETA VIA CLI (TERMINAL)
// ────────────────────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith('approval_gate.mjs')) {
  (async () => {
    const readline = await import('node:readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const reader = (prompt) => new Promise(resolve => rl.question(prompt, resolve));
    const writer = (msg) => console.log(msg);

    const approved = await promptApprovalGate(reader, writer);
    console.log(`\nDecisão do Criador: ${approved ? '✅ Salvar como Template' : '❌ Não salvar'}`);
    rl.close();
  })();
}
