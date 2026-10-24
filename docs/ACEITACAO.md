# Aceitação: o estúdio eleva modelos mais fracos?

A tese do projeto é que o gosto mora no código e não no modelo. Esta pasta prova ou desmente isso: o mesmo pedido, em
linguagem natural, vai para vários modelos num **clone limpo** do repositório e o resultado é julgado **só por portões
medidos**, nunca pelo relato do agente.

## Como rodar

```bash
agy models                                              # ids dos modelos disponíveis
node scripts/aceitacao.mjs --modelo gemini-3.8-flash-high --cenario motion
node scripts/aceitacao.mjs --placar                     # passou/falhou por modelo
```

Cenários: `carrossel`, `motion`, `roteiro` (o pedido de cada um está em `tests/aceitacao/briefs/`; ele não cita comando
nenhum, o agente precisa achar o caminho pelo `AGENTS.md` e pelo `SKILL.md`). Cada execução fica em `C:\vdsacc\<data>-<modelo>-<cenario>\`
(caminho curto de propósito) com o clone, a resposta do agente, `resultado.json` e uma cópia dos arquivos gerados.

## O que é medido

| Cenário | Portões |
|---|---|
| carrossel | 5 PNG 1080x1350, diferentes entre si, nenhum em branco, spec aceita pelo validador do estúdio |
| motion | MP4 vertical mudo, 30 fps, sem trecho parado, marca e slogan do pedido presentes na timeline |
| roteiro | MP4 9:16 com -14 LUFS e pico dentro do limite, sem trecho parado, palavras da fala na legenda |

Também fica registrado, sem entrar na nota: se o agente usou `pnpm vibe` e se mexeu no código do estúdio (sinal de gambiarra).

## Regras

- Nunca resetar cota nem comprar créditos. Se o agente bater no limite, a execução é marcada `bloqueadoPorCota` e para; rode de novo quando a cota voltar.
- O que o agente diz ("pronto", "ficou lindo") não vale. Só os portões e a folha de contato, que uma pessoa precisa olhar.
- Gosto é subjetivo: os portões são o piso medido; a nota final vem de uma pessoa olhando as imagens.

## Permissões do agy em modo headless (verificado na doc oficial em 24/10/2026)

O `agy -p` nega todo comando de shell sem aviso (resposta vazia, `denied_actions` no JSON). A regra vai em
`~/.gemini/antigravity-cli/settings.json`, lista `permissions.allow`, no formato `command(prefixo)` (palavra por palavra) ou
`command(regex:padrão)` (necessário para comandos compostos no PowerShell). Regras dentro do projeto não são lidas e
`--mode auto` não existe em todas as contas. Regras mínimas que bastaram: `command(regex:pnpm vibe.*)`,
`command(regex:node scripts/.*)`, `command(regex:ls.*)`, `command(regex:cat .*)`. Remova-as depois do benchmark.
`--pular-permissoes` (--dangerously-skip-permissions) existe, mas só roda com `ACEITACAO_ISOLADA=1` e o repositório oficial.

## Estado conhecido (24/10/2026)

- A parte pura (portões, argumentos, placar) tem testes: `tests/unit/aceitacao_lib.test.mjs`.
- Primeira execução real (Gemini 3.8 Flash alto, motion): o agente leu o SKILL.md, rodou `pnpm vibe doctor` e foi barrado ao
  tentar `pnpm setup:pastas`, que o próprio doctor sugeria. Achado real, corrigido: doctor, preparar_pastas e AGENTS.md
  agora mandam para `pnpm vibe pastas`, o caminho único.
- Cenário `reel-gravacao` (reel com a gravação do usuário) ainda não existe aqui: precisa de um vídeo de teste.
