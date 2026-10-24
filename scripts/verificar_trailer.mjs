#!/usr/bin/env node
/**
 * Confere se todo commit de um intervalo tem o trailer `Agent=<id>` (regra do projeto).
 *
 * Uso:
 *   node scripts/verificar_trailer.mjs origin/main..HEAD
 *
 * Commits de merge (mais de um pai) não exigem trailer. Sai com código 1 se algum commit tiver problema.
 */
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const AGENTES = ['claude', 'codex', 'gemini'];
const LOCAIS = ['local', 'vps'];
export const IDS_VALIDOS = AGENTES.flatMap((a) => LOCAIS.map((l) => `${a}-${l}`));

/** Lista os commits do intervalo que não têm trailer Agent válido. */
export function commitsComProblema(intervalo, cwd = process.cwd()) {
  const sep = '\x1f';
  const fim = '\x1e';
  const r = spawnSync('git', ['log', '--format=%H' + sep + '%P' + sep + '%s' + sep + '%(trailers:key=Agent,valueonly,separator=,)' + fim, intervalo], { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git log falhou para ${intervalo}: ${r.stderr}`);
  const problemas = [];
  for (const bruto of r.stdout.split(fim)) {
    const registro = bruto.replace(/^\n/, '');
    if (!registro) continue;
    const [hash, pais, assunto, trailer] = registro.split(sep);
    if (pais.trim().split(/\s+/).filter(Boolean).length > 1) continue; // merge
    const ids = trailer.trim().split(',').map((v) => v.trim()).filter(Boolean);
    if (ids.length === 0) problemas.push({ hash, assunto, motivo: 'commit sem trailer Agent=<id>' });
    else {
      const ruim = ids.find((id) => !IDS_VALIDOS.includes(id));
      if (ruim) problemas.push({ hash, assunto, motivo: `id de agente desconhecido: ${ruim} (válidos: ${IDS_VALIDOS.join(', ')})` });
    }
  }
  return problemas;
}

function main() {
  const intervalo = process.argv[2];
  if (!intervalo) {
    console.error('Uso: node scripts/verificar_trailer.mjs <base>..<head>');
    process.exit(2);
  }
  const problemas = commitsComProblema(intervalo);
  if (problemas.length === 0) {
    console.log(`Todos os commits de ${intervalo} têm trailer Agent válido.`);
    return;
  }
  console.error(`Commits com problema em ${intervalo}:`);
  for (const p of problemas) console.error(`  ${p.hash.slice(0, 8)} ${p.assunto} -> ${p.motivo}`);
  console.error('\nCorrija com: git commit --amend --trailer "Agent=<seu-id>" (ou rebase) e envie de novo.');
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
