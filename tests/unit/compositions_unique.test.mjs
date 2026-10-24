/**
 * Duas composições registradas com o mesmo componente e as mesmas dimensões renderizam o
 * mesmo vídeo com nomes diferentes: confunde agentes e inflaciona o catálogo.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const index = fs.readFileSync(path.join(root, 'src', 'index.tsx'), 'utf8');

const blocos = [...index.matchAll(/<Composition\b([\s\S]*?)\/>/g)].map((m) => {
  const attr = (nome) => (m[1].match(new RegExp(`${nome}=(?:"([^"]*)"|\{([^}]*)\})`)) || []).slice(1).find(Boolean)?.trim();
  return {
    id: attr('id'),
    component: attr('component'),
    duration: attr('durationInFrames'),
    fps: attr('fps'),
    width: attr('width'),
    height: attr('height'),
    props: /defaultProps=/.test(m[1]) ? m[1].match(/defaultProps=\{[\s\S]*?\}\s*(?=\w+=|$)/)?.[0] : '',
  };
});

test('o varredor acha as composições de index.tsx', () => {
  assert.ok(blocos.length >= 10, `achou só ${blocos.length}`);
  for (const b of blocos) assert.ok(b.id && b.component, `bloco sem id/component: ${JSON.stringify(b)}`);
});

test('ids de composição são únicos', () => {
  const ids = blocos.map((b) => b.id);
  assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), []);
});

test('nenhuma composição repete o mesmo componente com as mesmas dimensões e props', () => {
  const vistos = new Map();
  const repetidos = [];
  for (const b of blocos) {
    const chave = [b.component, b.duration, b.fps, b.width, b.height, b.props].join('|');
    if (vistos.has(chave)) repetidos.push(`${vistos.get(chave)} = ${b.id}`);
    else vistos.set(chave, b.id);
  }
  assert.deepEqual(repetidos, [], `composições duplicadas (mesmo vídeo, nomes diferentes): ${repetidos.join('; ')}`);
});
