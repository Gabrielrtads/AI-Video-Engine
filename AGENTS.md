# AGENTS.md — vibe-design-studio

Regras deste projeto para qualquer agente de IA (Claude, Codex, Gemini, Cursor...). Se o repositório estiver dentro de
um workspace maior, as regras gerais dele valem em conjunto com estas.

## Para produzir algo: leia o SKILL.md

Todo pedido de reel, TikTok, Short, carrossel, motion graphics ou legenda tem **um único caminho**: `pnpm vibe <comando>`.
O `SKILL.md` diz qual comando usar, como preencher e como conferir. Resumo:

1. `pnpm vibe doctor` (uma vez; corrija o que estiver vermelho).
2. `pnpm vibe roteiro`, `reel-gravacao`, `carrossel` ou `motion`, conforme o pedido.
3. `pnpm vibe verificar` e **olhar a folha de contato** antes de dizer que está pronto.

Não escreva TSX nem timeline JSON à mão, e não invente componente, estilo, arquivo ou prop: pergunte ao estúdio
(`pnpm vibe componentes`, `pnpm vibe estilos`, `pnpm vibe motion modelos`). O estúdio é um **piso de gosto garantido**
para qualquer modelo, do mais barato ao mais capaz; a escotilha para modelos criativos está no `SKILL.md`.

## Estado

- **GitHub:** `https://github.com/Gabrielrtads/vibe-design-studio.git`, branch `main`.
- Qualquer agente pode criar vídeos, carrosséis e templates abrindo uma mesa de trabalho (ver as regras gerais do workspace).
- Mídia pesada ou com direitos autorais nunca vai para o Git; veja `docs/PASTAS.md` e rode `pnpm setup:pastas`.

## Ferramentas por trás do `pnpm vibe` (use só se o comando não bastar)

- Narração com voz neural gratuita em pt-BR e Whisper: `node scripts/narrar.mjs "texto" [--voz antonio|francisca|thalita] [--transcrever]`.
- Render de uma timeline JSON: `node scripts/render_from_json.mjs timeline.json out/x.mp4 --master` (masteriza em -14 LUFS).
- Paleta de uma imagem: `python scripts/references/amostrar_paleta.py <imagem> --json`.
- Pasta de mídia: `pnpm assets:check` confirma que o arquivo existe antes de usá-lo; nunca invente nome de arquivo.
- O motor interativo `node scripts/studio_engine.mjs` é legado (perguntas no terminal); agentes não devem depender dele.

## Regras técnicas inegociáveis

1. **Chromium Clipping:** nunca use `-webkit-background-clip: text` com gradiente em composição animada do Remotion (vaza retângulo sólido no render multi-thread). Use SVG `<text fill="url(#id)">`.
2. **RAM:** todo FFmpeg que extrai frame leva `-vframes 1` antes do pipe raw.
3. **Sem peso morto:** testes só com o runner nativo do Node 24 (`node:test`) e `unittest`; sem Jest nem Vitest.
4. **Tela limpa:** ao criar do zero, não recicle cenas, layouts ou timers de outros projetos sem pedido.
5. **Templates:** salvar em `src/templates/` só com um "Sim" explícito do usuário.
6. **Commits** levam `--trailer "Agent=<seu-id>"` (hook e CI recusam sem ele).
7. **Higiene pós-render:** confira que não sobrou processo do Chromium (`chrome-headless-shell`) nem do Remotion rodando; encerre só os que você iniciou.
8. **Testes que ensinam:** um bug achado vira teste que falha sem a correção; nunca afrouxe um teste para passar.
9. **Carrossel:** pergunte ao usuário quantos slides, se o estilo é uniforme ou slide a slide, e se é estático ou para animar depois. Nunca assuma.
10. **Nada roda em paralelo no render:** dois renders do Remotion ao mesmo tempo travam; por isso `pnpm test:e2e` roda um arquivo por vez.

## Mudou algo que o agente vê?

Os docs de agente são testados (`tests/unit/docs_agentes_um_caminho.test.mjs`): cada comando do `pnpm vibe` precisa estar
no `SKILL.md`, e nenhum comando citado pode deixar de existir. Ao criar ou renomear um comando, atualize o `SKILL.md`.
