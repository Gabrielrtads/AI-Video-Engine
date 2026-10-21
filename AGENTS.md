# AGENTS.md — vibe-design-studio (Studio Engine)

Fatos e regras **deste projeto**. As regras gerais (mesas, autorização,
qualidade) estão em `../../AGENTS.md` e não se repetem aqui. Para editar, siga a
skill `vibe-dev`.

## Identificação & Estado do Swarm

- **Projeto:** vibe-design-studio (Studio Engine de Vídeo e Carrosséis)
- **Repositório:** `projects/vibe-design-studio`
- **Executor Ativo Atual:** `gemini-local` (via Antigravity Teamwork Swarm)
- **Tarefa Registrada:** `TASK-STUDIO-ENGINE-UX-20261020` em `docs/0_swarm_infra/TASK_REGISTRY.md`
- **Branch oficial:** `main`

---

## ⚠️ Pastas e Arquivos em Mutação Ativa pelo Antigravity

Claude (`claude-local`) e Codex (`codex-local`), **NÃO sobrescrever nem reverter** as seguintes áreas enquanto a tarefa estiver ativa:

1. `scripts/`
   - `scripts/studio_engine.mjs` — CLI e motor interativo do Onboarding Canônico [1-4].
   - `scripts/references/amostrar_paleta.py` — Amostrador K-Means de paletas cromáticas via FFmpeg.
2. `src/habilidades/`
   - `src/habilidades/catalogo_habilidades.json` — Catálogo dinâmico das 7 habilidades do motor divididas nas 3 categorias canônicas.
3. `src/templates/`
   - `src/templates/catalogo_templates.json` — Catálogo de templates validados.
   - Templates salvos via auto-evolução.
4. `src/CarrosselEditorial.tsx`
   - Composição de carrossel editorial 4:5 (1080×1350) com esteira a 0° e SVG iridescente.
5. `src/index.tsx`
   - Ponto de montagem e registro das composições no Remotion (`CarrosselEditorial`, etc.).
6. `tests/`
   - Suíte de testes ponta a ponta nativa em `node:test` (Tiers 1 a 4).
7. Raiz do workspace:
   - `PROJECT.md` e `.agents/teamwork/` — Especificação e telemetria dos subagentes em execução.

---

## Regras Técnicas e Guardrails Invioláveis

1. **Bug do Chromium Clipping:** É estritamente proibido usar `-webkit-background-clip: text` com gradientes CSS dinâmicos em composições animadas do Remotion (causa vazamento de retângulos sólidos em renders multi-thread). Utilize sempre **SVG `<text fill="url(#id)">`** com gradientes lineares nativos.
2. **Prevenção de Estouro de RAM:** Todo comando FFmpeg que extrai frames de vídeo DEVE conter obrigatoriamente `-vframes 1` antes do pipe raw.
3. **Zero Bloatware / Dependências Nativas:** A suíte de testes usa exclusivamente o runner nativo do Node 24 (`node:test` + `node:assert`) e o `unittest` padrão do Python. Não instale Jest, Vitest ou frameworks pesados.
4. **Anti-Inércia / Tela Limpa:** Quando o usuário seleciona a opção `[2] Criar do Zero`, o motor não pode reciclar cenas, layouts ou timers de projetos passados.
5. **Portão de Aprovação de Templates:** O salvamento de templates em `src/templates/` só ocorre sob confirmação explícita `"Sim"` do usuário.
6. **Trailer de Commit:** Todo commit no repositório deve incluir `--trailer "Agent=<seu-id>"`.
