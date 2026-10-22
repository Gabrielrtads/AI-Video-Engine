# PROJECT.md — Vibe Design Studio: QA Headless Terminal Suite

## 1. Contexto & Diretrizes da Missão
- **Missão:** QA Completo da versão 100% Terminal (Headless) do Vibe Design Studio.
- **Modo Swarm:** Virtual Mono-Modelo (Contingência por Quota — Apenas Gemini ativo).
- **Mesa de Trabalho:** `task/absorcao-timeline-mcp-20261022`
- **Ambiente:** Node.js 24 / Windows / Remotion v4 / FFMPEG

## 2. Agentes Ativos & Governança de Quota
| Agente | Status de Quota | Papel Nesta Missão |
|---|---|---|
| **gemini-local** | **ATIVA** | Orquestrador, Executor TDD, QA Auditor e Engenheiro de Infra |
| **claude-local / claude-vps** | ESGOTADA | Excluído (proibida qualquer invocação externa) |
| **codex-local** | ESGOTADA | Excluído (proibida qualquer invocação externa) |

## 3. Feature Inventory & Escopo do QA

| Feature | Tipo | Escopo / Contrato | Status |
|---|---|---|---|
| **Linter Anti-Slop** | CLI Estática | `node scripts/lint-motion-slop.mjs <file>` — valida foley, springs, hierarquia | A Validar |
| **Bancada 1-Click** | CLI Headless | `node scripts/produzir_video_bancada.mjs --dry-run` — staging, lint, render e review | A Validar |
| **Remotion Still Render** | CLI Headless | `npx remotion still Video out/still.png` — render estático 1080x1920 sem UI | A Validar |
| **Carrossel Still Render** | CLI Headless | `npx remotion still CarrosselEditorial out/slide.png` — render 1080x1350 sem UI | A Validar |
| **Timeline Math & MCP Tools** | Unit/E2E | `tests/e2e/timeline_and_mcp.test.mjs` — 5 canonical tools, gaps, assertValidTimeline | Validado (143/143) |
| **E2E Terminal QA Suite** | Test Runner | `tests/e2e/terminal_headless_qa.test.mjs` — automação de teste da bancada CLI | A Implementar |

## 4. Contratos de Execução CLI
- **Dry-run da Bancada:**
  ```bash
  node scripts/produzir_video_bancada.mjs FlowMotionMaster --dry-run
  ```
- **Linter Anti-Slop:**
  ```bash
  node scripts/lint-motion-slop.mjs src/FlowMotionMaster.tsx
  ```
- **Compilação TypeScript:**
  ```bash
  npx tsc --noEmit
  ```
- **Suíte Completa:**
  ```bash
  node --test tests/e2e/terminal_headless_qa.test.mjs
  ```

## 5. Milestones de Execução
- **[M1] Arquitetura & Especificação:** Registro de escopo e isolamento mono-modelo em `PROJECT.md` (Concluído).
- **[M2] TDD & Testes de Terminal:** Criação do runner de teste automatizado `tests/e2e/terminal_headless_qa.test.mjs`.
- **[M3] Execução de QA & Smoke Tests:** Execução do linter, tsc, renders headless e suíte de testes.
- **[M4] Auditoria Forense & Scorecard:** Checagem de integridade, memória, git status e relatório executivo.
