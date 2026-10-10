# Plano de Implementação: Stack Modular de Edição com IA 🎬🤖

Este documento detalha o roteiro para construir a sua própria "linha de montagem" de edição assistida por IA, unindo as melhores práticas da comunidade (Whisper, LLMs, DaVinci Resolve e Scripts Nativos) para processar vídeos (como os cursos que baixamos) em escala.

---

## 🛑 Fase 1: Fundação & Infraestrutura Local (Sem Mensalidades)
O objetivo desta fase é parar de depender de ferramentas "tudo-em-um" pagas e trazer o processamento pesado (grunt work) para a sua máquina.

- [ ] **Instalar DaVinci Resolve (Free ou Studio):**
  - **Função:** Será o destino final de toda edição. O motor principal.
  - *Nota:* A versão Studio destrava os recursos "Magic" (Voice Isolation, Auto-Subtitle), mas a Free já aceita os arquivos da nossa stack local.
- [ ] **Configurar Whisper AI Local (Transcrição 100% Gratuita e Offline):**
  - **Função:** Gerar legendas (.SRT) e textos limpos (.TXT) de qualquer aula/vídeo sem pagar por minuto.
  - **Ação:** Instalar o `WhisperDesktop` (para Windows) ou usar script Python `openai-whisper` com aceleração CUDA.
- [ ] **Configurar Ambiente LLM (Claude ou Ollama):**
  - **Função:** O "Assistente de Direção". Vai ler os TXTs do Whisper e nos dar os "Timecodes" das partes mais importantes.
  - **Ação:** Instalar `Ollama` localmente (com o modelo `llama3` ou `qwen`) para não gastar com tokens, ou criar um script Python linkado à API do Claude (Anthropic).

---

## ⚙️ Fase 2: Construção da Automação (O "Agente de Decupagem")
Aqui eu (o Swarm) entro para programar a "cola" entre as ferramentas. 

- [ ] **Script 1: Extração de Áudio e Texto (Python + FFmpeg + Whisper)**
  - O script vai olhar para a pasta do curso recém baixado.
  - Extrairá apenas o áudio de cada aula (MP3) em segundos via `FFmpeg`.
  - Passará o áudio pelo Whisper, gerando um `aula.srt` e um `aula.txt` na mesma pasta do vídeo.
- [ ] **Script 2: Garimpeiro de Cortes (Python + LLM)**
  - O script enviará a transcrição (`aula.txt`) para o Claude/Ollama com o seguinte prompt estruturado:
    > *"Você é um Diretor de Corte. Analise esta aula. Identifique os 3 momentos de maior valor prático (Dicas de Ouro) ou ganchos virais. Retorne estritamente os minutos de início e fim no formato [MM:SS] - [MM:SS] e um título."*
  - O script gera um arquivo `cortes_sugeridos.md` para cada módulo.

---

## ✂️ Fase 3: Workflow de Montagem Híbrida (Prática)
O que o humano (Você) faz na prática no dia a dia:

1. **Ingestão:** Você aciona o Agente (eu) passando uma pasta de vídeos. O Script 1 e 2 rodam sozinhos no plano de fundo.
2. **Revisão:** Você lê o `cortes_sugeridos.md` gerado pela IA. Lá estão as minutagens de ouro.
3. **Timeline (DaVinci Resolve):**
   - Importa o `.MP4` e o `.SRT` perfeito gerado pelo Whisper direto na Timeline.
   - Faz os cortes exatos guiado pelo `cortes_sugeridos.md`.
   - Limpa o áudio final (se tiver versão Studio) ou aplica color grading.
4. **Cortes Curtos (Opcional):**
   - Se for para TikTok/Shorts, usa as partes extraídas na Etapa 3 e envia para ferramentas dedicadas de dinamismo visual (como o CapCut desktop apenas para jogar os letreiros animados, ou OpusClip se quiser automação zero-touch).

---

## 🛠️ O Que Precisamos Para Começar Agora?
Se quiser dar o pontapé inicial, me responda:
1. **Você possui Placa de Vídeo (NVIDIA) forte no PC local?** (Isso define se rodamos Whisper e Ollama no seu PC ou na VPS).
2. **Já tem o DaVinci Resolve instalado?**
3. **Quer que eu crie o Script 1 (Extração de Áudio + Whisper) agora para testarmos em uma das aulas do JefeVilanova que acabamos de baixar?**
