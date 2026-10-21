# AGENTS.md — vibe-design-studio (Creative & Motion Studio)

Fatos e regras **deste projeto**. As regras gerais (mesas, autorização,
qualidade) estão em `../../AGENTS.md` e não se repetem aqui. Para editar, siga a
skill `vibe-dev`.

## Identificação & Estado do Swarm

- **Projeto:** vibe-design-studio (Estúdio Headless de Motion Design e Carrosséis)
- **Repositório:** `projects/vibe-design-studio`
- **GitHub:** `https://github.com/Gabrielrtads/vibe-design-studio.git`
- **Estado Atual:** **LIVRE E HOMOLOGADO**. Qualquer agente (`claude-local`, `codex-local`, `gemini-local`, `gemini-vps`) pode criar vídeos, carrosséis e templates abrindo uma mesa de trabalho.
- **Branch oficial:** `main`

---

## 🛠️ Ferramentas Prontas para Uso

Todo agente tem à disposição neste repositório:

1. **CLI de Onboarding Canônico:**
   - `node scripts/studio_engine.mjs` — Fluxo interativo com 4 rotas ([1] Template, [2] Criar do zero, [3] Ver habilidades, [4] Ingerir referência visual).
2. **Narração 1-Click Multi-TTS:**
   - `node scripts/narrar.mjs "texto da narração" [--voz antonio|francisca|thalita] [--transcrever]`
   - Gera narração neural gratuita em pt-BR e dispara o Whisper para `src/data/words.json`.
3. **Sound Design Físico & Auto-Ducking:**
   - Efeitos sonoros embutidos em `public/audio/` (`click_haptic.mp3`, `sub_impact_warm.mp3`, etc.).
   - Componente `AutoDuckingAudio.tsx` para modular a trilha sonora automaticamente sob a voz.
4. **Masterização -14 LUFS:**
   - `npm run render:mastered` — Renderiza o Remotion e aplica normalização EBU R128 (-14 LUFS / -1 dBTP) ideal para Instagram e TikTok.
5. **Amostrador de Paletas por IA:**
   - `python scripts/references/amostrar_paleta.py <imagem> --json` — Extração de paletas cromáticas via K-Means com proteção de memória (-vframes 1).

---

## Regras Técnicas e Guardrails Invioláveis

1. **Bug do Chromium Clipping:** É estritamente proibido usar `-webkit-background-clip: text` com gradientes CSS dinâmicos em composições animadas do Remotion (causa vazamento de retângulos sólidos em renders multi-thread). Utilize sempre **SVG `<text fill="url(#id)">`** com gradientes lineares nativos.
2. **Prevenção de Estouro de RAM:** Todo comando FFmpeg que extrai frames de vídeo DEVE conter obrigatoriamente `-vframes 1` antes do pipe raw.
3. **Zero Bloatware / Dependências Nativas:** A suíte de testes usa exclusivamente o runner nativo do Node 24 (`node:test` + `node:assert`) e o `unittest` padrão do Python. Não instale Jest, Vitest ou frameworks pesados.
4. **Anti-Inércia / Tela Limpa:** Quando o usuário seleciona a opção `[2] Criar do Zero`, o motor não pode reciclar cenas, layouts ou timers de projetos passados sem pedido explícito.
5. **Portão de Aprovação de Templates:** O salvamento de templates em `src/templates/` só ocorre sob confirmação explícita `"Sim"` do usuário.
6. **Trailer de Commit:** Todo commit no repositório deve incluir `--trailer "Agent=<seu-id>"`.
7. **Higiene Pós-Render:** Sempre execute `node scripts/desligar-motor-video` ou verifique se processos do Chromium/Remotion foram finalizados após renderizações intensivas.
