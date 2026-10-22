# PROJECT.md — Vibe Design Studio: Governança & Motor Headless Terminal

> **Status:** Homologado & Ativo  
> **Equipe Ativa (com cota confirmada):** `gemini-local` *(Claude e Codex sem cota temporariamente isolados)*  
> **Mesa Git:** `.worktrees/absorcao-timeline-mcp-20261022` (sincronizada com `main`)

---

## 1. Feature Inventory Consolidado

| ID | Funcionalidade | Escopo & Arquivo | Status | Validação |
|---|---|---|---|---|
| **F1** | **Pontes Canônicas de Instrução** | Criação de `CLAUDE.md` e `GEMINI.md` apontando para `@AGENTS.md` | Entregue | `node scripts/instrucoes.mjs auditar` (8751 bytes / orçamento 12288) |
| **F2** | **Sincronização Bidirecional da Mesa Git** | Reconciliação dos commits da `main` (`dfc4aff`) na worktree ativa | Entregue | `git merge main` limpo |
| **F3** | **Interceptação & Trava de Carrossel 4:5** | Detecção automática de temas de carrossel no `studio_engine.mjs` com acionamento do Protocolo Grill-Me | Entregue | 90/90 testes unitários PASS |
| **F4** | **Auditoria Global de Instruções do Hub** | Atualização de `scripts/instrucoes.mjs` para auditar recursivamente `projects/*` | Entregue | `node --test scripts/instrucoes.test.mjs` (7/7 PASS) |
| **F5** | **Motor Headless de Terminal & QA** | Fix de `dotenv`, suíte de testes E2E de terminal e renderização headless via CLI Remotion | Entregue | `node --test tests/e2e/terminal_headless_qa.test.mjs` (5/5 PASS) |
| **F6** | **Timeline Math & MCP Tools** | Matemática de cortes/snapping (`timelineMath.ts`) e 5 ferramentas MCP canônicas | Entregue | `tests/e2e/timeline_and_mcp.test.mjs` (10/10 PASS) |

---

## 2. Contratos de Interface (TypeScript / Node.js)

### 2.1. Configuração de Tela Limpa (`generateCleanSlate`)
```typescript
interface CarouselConfig {
  slideCount: number;                  // Padrão: 5 (mínimo 1)
  visualUniformity: 'uniforme' | 'individual'; // Padrão: 'uniforme'
  targetType: 'motion' | 'estatico';   // Padrão: 'motion'
}

interface CleanSlateOptions {
  theme?: string;
  objective?: 'venda' | 'atracao' | 'autoridade' | 'geral';
  aspect?: '9:16' | '4:5' | '1:1';
  aspectRatio?: '9:16' | '4:5' | '1:1';
  carousel?: CarouselConfig | null;
}
```

### 2.2. Contratos de Execução CLI (Terminal Headless)
- **Dry-run da Bancada:**
  ```bash
  node scripts/produzir_video_bancada.mjs FlowMotionMaster --dry-run
  ```
- **Linter Anti-Slop:**
  ```bash
  node scripts/lint-motion-slop.mjs src/FlowMotionMaster.tsx
  ```
- **Remotion Still Render (Headless):**
  ```bash
  npx remotion still Video out/still.png --frame=0
  ```
- **Suíte Completa:**
  ```bash
  node --test tests/e2e/terminal_headless_qa.test.mjs tests/e2e/timeline_and_mcp.test.mjs
  ```

---

## 3. Milestones Concluídos

- [x] **M1 (Diagnóstico & Revisão Cruzada):** Execução do `/cli-revisao-cruzada` identificando o drift git e a ausência de pontes.
- [x] **M2 (Alinhamento de Quota & Escopo):** Invocação de `ask_question` (/equipe) mapeando cotas e escopo de QA headless.
- [x] **M3 (Implementação & Fixes de Terminal):** Adicionada dependência `dotenv`, corrigido build script do `esbuild`, implementado runner `terminal_headless_qa.test.mjs`.
- [x] **M4 (Desinchaço & Higiene de Arquitetura):** Removidos 400 linhas de componentes de UI redundantes com o Remotion Studio (`TimelineViewer.tsx`, `TimelineRuler.tsx`, `TrackLane.tsx`).
- [x] **M5 (Validação E2E & Homologação):** Todos os 15 testes de terminal e timeline 100% verdes, renders reais de frames 1080x1920 e 1080x1350 validados.
