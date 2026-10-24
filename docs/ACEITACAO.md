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

## Estado conhecido (24/10/2026)

- A parte pura (portões, argumentos, placar) tem testes: `tests/unit/aceitacao_lib.test.mjs`.
- **Ainda não rodou de ponta a ponta.** A primeira execução com o `agy` mostrou que, em modo não interativo, ele recusa
  qualquer comando de shell ("a tool required the command permission that headless mode cannot prompt for") e a resposta
  vem vazia. Falta descobrir onde o `agy` lê a regra `permissions.allow` (o `settings.json` do usuário só tem `mcpServers`);
  `--dangerously-skip-permissions` existe, mas libera tudo na máquina e não deve ser usado sem decisão do dono da máquina.
- Cenário `reel-gravacao` (reel com a gravação do usuário) ainda não existe aqui: precisa de um vídeo de teste.
- O `agy` bateu no limite de uso logo depois da primeira tentativa; as próximas execuções esperam a cota voltar.
