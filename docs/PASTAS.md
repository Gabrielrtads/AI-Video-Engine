# Pastas do computador

O estúdio trabalha com pastas fixas. Para criar todas de uma vez (sem apagar nem sobrescrever nada):

```bash
pnpm setup:pastas                              # cria o que falta e mostra o mapa
node scripts/preparar_pastas.mjs --verificar   # só confere
```

Regra de ouro: **mídia pesada ou com direitos autorais nunca vai para o Git** (música comercial, locuções,
fotos de cliente, vídeos). O `.gitignore` já bloqueia `.mp3`, `.mp4`, `.png`, `.jpg` e a pasta `out/`.
Use nomes em ASCII simples (sem acento ou espaço), porque o FFmpeg e o Chromium sem tela falham com eles.
Mantenha o projeto em um caminho curto (por exemplo `C:\vds`): no Windows, caminhos acima de 260
caracteres quebram o binário do Remotion.

## Dentro do projeto

| Pasta | Vem no clone? | O que vai aqui |
| --- | --- | --- |
| `public/audio/` | sim (vazia) | Efeitos sonoros, trilhas e locuções que as composições chamam por `staticFile("audio/...")`. |
| `public/assets/` | não, local | Vídeos curtos de efeito (brilho, check) usados pelas composições. |
| `public/input/` | sim (vazia) | Material bruto do vídeo atual (áudio do celular, takes), com nome ASCII, antes de processar. |
| `public/marcas/` | não, local | Logos e fotos por marca ou cliente, uma subpasta por marca: `public/marcas/<marca>/`. |
| `public/video/` | não, local | Takes e B-rolls de vídeo que as composições vão usar. |
| `out/videos/` | não, local | Vídeos finais renderizados e masterizados (-14 LUFS). Use `--saida out/videos/<nome>.mp4`. |
| `out/stills/` | não, local | Quadros avulsos e folhas de contato para conferir o resultado. |
| `out/carrosseis/` | não, local | Slides de carrossel exportados em imagem (4:5). |
| `out/temp/` | não, local | Temporários de render; pode esvaziar quando quiser. |
| `references/inbox/` | sim (vazia) | Referências visuais novas esperando análise. |
| `references/accepted/` | sim (vazia) | Referências aprovadas: só metadados e quadros leves. |
| `references/rejected/` | sim (vazia) | Referências recusadas, com o motivo. |
| `references/evidence/` | sim (vazia) | Quadros e folhas de contato que documentam as referências. |

"Vem no clone" significa que a pasta já existe depois do `git clone`. As outras são criadas por
`pnpm setup:pastas` na primeira vez.

## Fora do projeto (opcional)

Quem grava áudio ou vídeo no celular pode manter uma bancada no Google Drive, em qualquer lugar do
computador. O estúdio não exige nenhuma pasta fora do projeto: o espelhamento da saída só acontece
com `--sync-dir <pasta>` ou `VIBE_SYNC_DIR`.

Sugestão de organização para a bancada:

```text
<sua pasta>/Skill de video/
├── Edicao- Mesa (criacao)/     material do vídeo atual (esvaziada depois do render)
├── Edicao- Midia/              brutos e histórico
├── Edicao- Roteiros/           roteiros prontos
└── Edicao- Videos Prontos/     produto final
```
