# PROJECT.md — Vibe Design Studio: Mitigação Padrão Rourke Heath / GenHQ (/equipe)

> **Status:** Em Execução  
> **Equipe Ativa (Cota Confirmada):** `gemini-local` (Orquestrador + Core Motion), `claude-local` e `codex-local` autorizados  
> **Mesa Git:** `projects/vibe-design-studio/.worktrees/showcase-reel-instagram-20261021` (branch `task/showcase-reel-instagram-20261021`)  
> **Objetivo:** Mitigar os 4 problemas críticos apontados pelo usuário no reel de divulgação do `cli-cross-review`:
> 1. Legendas feias -> Legenda minimalista de 1 palavra por vez (estilo Rourke Heath)
> 2. Vício de música -> Eliminar loop de lofi genérico; focar 100% em Sound Design foley/háptico
> 3. Painéis estáticos -> AppleCameraRig (drift 3D contínuo) + Cursor macOS animado interagindo com UI
> 4. Narração arrastada -> Ritmo acelerado e dinâmico (+16% rate) com transcrição Whisper precisa

---

## 1. Feature Inventory de Mitigação

| ID | Funcionalidade | Escopo & Arquivo | Status | Validação |
|---|---|---|---|---|
| **M1** | **Legenda Minimalista 1-Palavra** | Atualização do `KineticWordCaption.tsx` com `windowSize=1`, estilo dark frosted e escala spring | Planejado | Renderização de still frame a frame |
| **M2** | **Sound Design sem Loop de Música** | Remoção de `trilha_luxo.mp3`; sincronização de cliques hápticos (`click_haptic.mp3`) com o cursor | Planejado | Inspeção de trilha de áudio e masterização EBU R128 |
| **M3** | **Cursor macOS Animado (`AnimatedCursor.tsx`)** | Novo componente vetorial com interpolação Bézier e animação de clique no terminal e botão GitHub Star | Planejado | Frame-accurate verification |
| **M4** | **Motor de Câmera 3D (`AppleCameraRig`)** | Integração da câmera com micro-drift orgânico contínuo e perspectiva 3D (`rotateX`, `rotateY`) no palco | Planejado | Eliminação de quadros estáticos (zero dead frames) |
| **M5** | **Áudio Acelerado & Whisper Sync** | Regeneração com taxa acelerada (+16%) e novo alinhamento temporal de palavras | Planejado | `npm run check` e `npm run test:unit` (100% pass) |

---

## 2. Contratos de Interface

### 2.1. `AnimatedCursorProps`
```typescript
export interface CursorKeyframe {
  frame: number;
  x: number;       // Coordenada X na tela (0 a 1080)
  y: number;       // Coordenada Y na tela (0 a 1920)
  clicked?: boolean; // Se executa animação de clique háptico
}

export interface AnimatedCursorProps {
  keyframes: CursorKeyframe[];
  cursorColor?: string;
}
```

### 2.2. `KineticWordCaption` (Preset Minimal 1-Palavra)
```typescript
interface KineticWordCaptionProps {
  words: WordItem[];
  windowSize: 1;              // Exatamente 1 palavra ativa por vez
  preset: 'minimal-rourke';   // Fundo translúcido dark, borda sutil, fonte branca limpa
  fontSize: 26;
  bottom: number;
}
```

---

## 3. Milestones de Execução

- [ ] **Milestone 1:** Criar `AnimatedCursor.tsx` com render vetorial de cursor macOS e física de clique.
- [ ] **Milestone 2:** Refatorar `KineticWordCaption.tsx` com preset minimalista de 1 palavra.
- [ ] **Milestone 3:** Atualizar `GenHqReel.tsx` integrando `AppleCameraRig`, `AnimatedCursor`, removendo a música de loop e ajustando os SFX de clique háptico.
- [ ] **Milestone 4:** Validar TypeScript (`npm run check`) e suíte de testes unitários (`npm run test:unit`).
- [ ] **Milestone 5:** Renderizar stills de conferência e compilar o vídeo final masterizado (-14 LUFS).
