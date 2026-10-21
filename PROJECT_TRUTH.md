# PROJECT_TRUTH.md — Vibe Design Studio

## 1. Visão Geral do Produto
O **Vibe Design Studio** (`vibe-design-studio`) é o estúdio criativo headless para criação automatizada e assistida por IA de:
- **Carrosséis Editoriais (4:5 / 1080×1350)**
- **Vídeos e Motion Design Vertical (9:16 / 1080×1920)**

O motor opera via comandos conversacionais e CLI leve, integrando física elástica (`spring`), esteira de tags a 0° (`marquee`), gradientes iridescentes nativos em SVG e ingestão de referências visuais com extração de paleta por K-Means.

## 2. Stack Tecnológica
- **Framework de Renderização:** Remotion v4 (`@remotion/bundler`, `@remotion/cli`, `remotion`)
- **Linguagem & Runtime:** TypeScript / React 18 / Node.js 24
- **Processamento de Mídia:** FFmpeg nativo (com `-vframes 1` para zero-leak de RAM) e Python + NumPy para K-Means
- **Testes E2E:** `node:test` + `node:assert` nativos do Node 24 (sem dependências externas)
- **Gerenciador de Pacotes:** `pnpm` (pnpm-workspace.yaml)

## 3. Contratos de Resolução & Canvas
- **Carrossel 4:5:** 1080 × 1350 px (`fps={30}`, duração modular por slide)
- **Vídeo 9:16:** 1080 × 1920 px (`fps={30}`)
- **Safe Zones:**
  - Instagram 4:5: margens de segurança de 48px laterais e 80px superior/inferior.
  - Reels/TikTok 9:16: safe zone com 20% de respiro superior e 25% inferior para evitar sobreposição de UI.

## 4. Estrutura de Diretórios
```
projects/vibe-design-studio/
├── scripts/
│   ├── studio_engine.mjs         # CLI Canônica e orquestrador UX
│   └── references/
│       └── amostrar_paleta.py    # K-Means via FFmpeg + NumPy
├── src/
│   ├── index.tsx                 # Root do Remotion (registerRoot)
│   ├── CarrosselEditorial.tsx    # Componente 4:5 com SVG iridescente
│   ├── habilidades/
│   │   └── catalogo_habilidades.json # Catálogo das 7 habilidades
│   └── templates/
│       └── catalogo_templates.json   # Biblioteca de templates validados
└── tests/
    └── e2e/                      # Suíte de testes em node:test nativo
```

## 5. Governança e Swarm
- Tarefa ativa em `docs/0_swarm_infra/TASK_REGISTRY.md`.
- Regras de colaboração multiagente em `AGENTS.md`.

## 6. Filosofia Arquitetural: Piso, Não Teto (Floor, Not a Ceiling)
O Vibe Design Studio foi concebido para elevar a linha de base de agentes econômicos sem jamais limitar a excelência estética de modelos criativos de topo (como Claude Opus 5.5 MAX / Sonnet):
- **O Piso (Chão Inegociável):** Fornece infraestrutura técnica pronta para que nenhum modelo precise reinventar a roda ou cometer erros amadores:
  - Áudio EBU R128 (-14 LUFS / -1 dBTP) e Auto-Ducking dinâmico.
  - Alinhamento de milissegundos via Whisper (`words.json`).
  - Safe zones restritas para Instagram e TikTok.
  - Linter Anti-Slop (`lint-motion-slop.mjs`): barra apenas vícios destrutivos (foley estridente > 0.45, ausência de curvas de física, texto sem hierarquia e slogans clichês), nunca a inovação estética.
- **O Teto (Inexistente / Liberdade Criativa Plena):**
  - Modelos com alta sensibilidade de design (como Claude) **NÃO** devem ser engessados a formulários de templates básicos.
  - O ecossistema suporta Three.js nativo (`@react-three/fiber`, `@remotion/three`), shaders GLSL, cartões isométricos com iluminação PBR simulada e composições React 18 100% customizadas sob a rota `[2] Criar do Zero`.

## 7. Alimentação Headless via API (OpenRouter, LLMs Externos)
O estúdio pode ser alimentado e disparado 100% via API sem interface humana:
1. **Via OpenRouter / APIs de LLMs:**
   - Um script externo, worker ou webhook pode enviar um briefing para qualquer modelo no OpenRouter (ex.: `anthropic/claude-opus-5.5`, `anthropic/claude-3.7-sonnet`, `google/gemini-2.5-flash`, `openai/gpt-4o`).
   - O LLM retorna um JSON estruturado contendo:
     - Roteiro narrado.
     - Parâmetros visuais / `inputProps` (títulos, métricas, paleta, cards).
2. **Execução Headless em Pipeline:**
   - O JSON alimenta `node scripts/narrar.mjs "<texto>" --transcrever`.
   - O Remotion recebe as propriedades via CLI:
     `npx remotion render Video out/video.mp4 --props='{"title": "..."}'`
   - O pipeline finaliza com `node scripts/masterizar_audio.mjs`.
