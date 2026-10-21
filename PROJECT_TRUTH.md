# PROJECT_TRUTH.md — AI-Video-Engine

## 1. Visão Geral do Produto
O **AI-Video-Engine** é o motor estúdio para criação automatizada e assistida por IA de:
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
projects/AI-Video-Engine/
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
