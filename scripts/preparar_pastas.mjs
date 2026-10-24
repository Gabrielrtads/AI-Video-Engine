#!/usr/bin/env node
/**
 * Prepara as pastas locais do Vibe Design Studio (idempotente).
 *
 * Uso:
 *   node scripts/preparar_pastas.mjs              cria o que falta e mostra o mapa
 *   node scripts/preparar_pastas.mjs --verificar  só confere (sai com código 1 se faltar algo)
 *
 * Nunca apaga nem sobrescreve nada: só cria pastas que não existem.
 * O mapa completo, com o que vai em cada pasta, está em docs/PASTAS.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * `versionada: true`  -> a pasta já vem no clone (guarda um .gitkeep).
 * `versionada: false` -> pasta local de trabalho, criada por este script.
 * Mídia pesada ou com direitos autorais nunca vai para o Git (ver .gitignore).
 */
export const PASTAS = [
  { caminho: 'public/audio', versionada: true, uso: 'Efeitos sonoros, trilhas e locuções usados pelas composições (staticFile("audio/...")).' },
  { caminho: 'public/assets', versionada: false, uso: 'Vídeos curtos de efeito (ex.: brilho, check) usados pelas composições.' },
  { caminho: 'public/input', versionada: true, uso: 'Material bruto do vídeo atual (áudio do celular, takes), copiado com nome ASCII antes de processar.' },
  { caminho: 'public/marcas', versionada: false, uso: 'Logos e fotos por marca ou cliente, uma subpasta por marca (public/marcas/<marca>/).' },
  { caminho: 'public/video', versionada: false, uso: 'Takes e B-rolls de vídeo que as composições vão usar.' },
  { caminho: 'out/videos', versionada: false, uso: 'Vídeos finais renderizados e masterizados (-14 LUFS).' },
  { caminho: 'out/stills', versionada: false, uso: 'Quadros avulsos e folhas de contato para conferir o resultado.' },
  { caminho: 'out/carrosseis', versionada: false, uso: 'Slides de carrossel exportados em imagem (4:5).' },
  { caminho: 'out/temp', versionada: false, uso: 'Arquivos temporários de render; pode esvaziar quando quiser.' },
  { caminho: 'references/inbox', versionada: true, uso: 'Referências visuais novas esperando análise.' },
  { caminho: 'references/accepted', versionada: true, uso: 'Referências aprovadas, só metadados e quadros leves.' },
  { caminho: 'references/rejected', versionada: true, uso: 'Referências recusadas, com o motivo.' },
  { caminho: 'references/evidence', versionada: true, uso: 'Quadros e folhas de contato que documentam as referências.' },
];

const RAIZ_DO_PROJETO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Cria as pastas que faltam dentro de `raiz`. Retorna o que foi criado e o que já existia. */
export function criarPastas(raiz = RAIZ_DO_PROJETO) {
  const criadas = [];
  const jaExistiam = [];
  for (const { caminho } of PASTAS) {
    const destino = path.join(raiz, ...caminho.split('/'));
    if (fs.existsSync(destino)) {
      jaExistiam.push(caminho);
    } else {
      fs.mkdirSync(destino, { recursive: true });
      criadas.push(caminho);
    }
  }
  return { criadas, jaExistiam };
}

/** Só confere, sem criar nada. */
export function verificarPastas(raiz = RAIZ_DO_PROJETO) {
  const faltando = PASTAS.filter(({ caminho }) => !fs.existsSync(path.join(raiz, ...caminho.split('/')))).map((p) => p.caminho);
  return { faltando };
}

function main() {
  if (process.argv.includes('--verificar')) {
    const { faltando } = verificarPastas();
    if (faltando.length === 0) {
      console.log('Todas as pastas do estúdio existem.');
      return;
    }
    console.log('Faltam estas pastas (rode `pnpm setup:pastas`):');
    for (const c of faltando) console.log(`  - ${c}/`);
    process.exit(1);
  }
  const { criadas, jaExistiam } = criarPastas();
  console.log(`Pastas criadas: ${criadas.length} | já existiam: ${jaExistiam.length}`);
  for (const c of criadas) console.log(`  + ${c}/`);
  console.log('\nMapa (o que vai em cada pasta):');
  for (const p of PASTAS) console.log(`  ${p.caminho}/  ${p.versionada ? '[vem no clone]' : '[local]'}  ${p.uso}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
