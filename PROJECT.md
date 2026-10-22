# PROJECT.md — Vibe Design Studio: Blindagem de Governança & Swarm

> **Status:** Homologado & Ativo  
> **Equipe Ativa (com cota confirmada):** `gemini-local`, `gemini-vps`, `codex-local` *(Claude sem cota temporariamente isolado)*  
> **Mesa Git:** `.worktrees/showcase-reel-instagram-20261021` (sincronizada com `main`)

---

## 1. Feature Inventory

| ID | Funcionalidade | Escopo & Arquivo | Status | Validação |
|---|---|---|---|---|
| **F1** | **Pontes Canônicas de Instrução** | Criação de `CLAUDE.md` e `GEMINI.md` apontando para `@AGENTS.md` | Entregue | `node scripts/instrucoes.mjs auditar` (8751 bytes / orçamento 12288) |
| **F2** | **Sincronização Bidirecional da Mesa Git** | Reconciliação dos commits da `main` (`dfc4aff`) na worktree ativa | Entregue | `git merge main` limpo (0 conflitos) |
| **F3** | **Interceptação & Trava de Carrossel 4:5** | Detecção automática de temas de carrossel no `studio_engine.mjs` com acionamento do Protocolo Grill-Me | Entregue | 90/90 testes unitários PASS |
| **F4** | **Auditoria Global de Instruções do Hub** | Atualização de `scripts/instrucoes.mjs` para auditar recursivamente `projects/*` | Entregue | `node --test scripts/instrucoes.test.mjs` (7/7 PASS) |

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

### 2.2. Saída do Onboarding Interativo (`runOnboarding`)
Quando um briefing menciona `carrossel`, `carousel`, `4:5`, `editorial` ou `slides`, a Rota 2 aciona o diálogo do Grill-Me e devolve:
```typescript
interface Route2Result {
  route: 2;
  cleanSlate: true;
  briefing: string;
  skillViewed: boolean;
  defaults: {
    aspectRatio: '4:5';
    width: 1080;
    height: 1350;
    fps: 30;
    durationInFrames: 300;
  };
  config: CleanSlateDescriptor;
  carousel: CarouselConfig;
}
```

---

## 3. Milestones Concluídos

- [x] **M1 (Diagnóstico & Revisão Cruzada):** Execução do `/cli-revisao-cruzada codex mid` com tríade `gpt-6.1-sol` e `gpt-6-luna`, identificando o drift git e a ausência de pontes.
- [x] **M2 (Alinhamento de Quota & Escopo):** Invocação de `ask_question` (/equipe) mapeando cotas (Gemini + Codex ativos, Claude em espera).
- [x] **M3 (Implementação & Sincronização):** Injeção de `CLAUDE.md`, `GEMINI.md`, trava de Carrossel no `studio_engine.mjs` e expansão do `instrucoes.mjs`.
- [x] **M4 (Validação E2E & Limpeza):** 90 testes unitários de produto e 7 testes de governança 100% verdes.
