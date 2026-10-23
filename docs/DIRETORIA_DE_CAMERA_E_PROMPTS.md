# Dicionário de Direção de Câmera, Iluminação e Estilos Visuais
**Vibe Design Studio — Gramática Cinematográfica para Criadores e Agentes de IA**

Este documento compila a taxonomia canônica de movimentos de câmera, atmosferas, estilos de iluminação e efeitos de produto para utilização tanto em **prompts de vídeo generativo (Kling, Runway Gen-3, Midjourney, Luma)** quanto em **câmeras matemáticas procedurais do Remotion (AppleCameraRig e Linha do Tempo Declarativa)**.

---

## 1. Movimentos e Enquadramentos de Câmera

| Comando | Descrição Técnica | Aplicação no Remotion / Vibe Studio |
|---|---|---|
| `/flythrough` | Movimento contínuo de voo atravessando um cenário ou interface em alta velocidade. | Câmera 3D atravessando cards e telas em sequência linear (Z-depth travel). |
| `/dollyin` | Aproximação suave da câmera em direção ao sujeito (push-in óptico/físico). | `scale` aumentando suavemente de 1.0 para 1.08 com amortecimento de mola (*slow push-in* anti-tédio). |
| `/dollyout` | Afastamento suave da câmera, revelando o contexto ao redor do objeto principal. | Transição de encerramento revelando o mockup completo a partir de um detalhe. |
| `/pan` | Movimento panorâmico horizontal sobre o eixo fixo da câmera (esquerda/direita). | Deslocamento horizontal do palco visual (`translateX` interpolado). |
| `/tilt` | Movimento vertical da câmera para cima ou para baixo sobre seu eixo. | Rotação em torno do eixo X (`rotateX`), simulando olhar de baixo para cima. |
| `/zoom` | Alteração da distância focal da lente (aproximação/afastamento óptico). | Zoom focal sem alteração de perspectiva de paralaxe. |
| `/establishing` | Plano aberto (wide shot) que estabelece o ambiente, contexto e proporção da cena. | Vista completa do dashboard/terminal/palco no primeiro segundo do vídeo. |
| `/closeup` | Plano fechado com foco em microdetalhes, tipografia, botões ou expressões. | Enquadramento macro focado no Dynamic Island ou no badge numérico do card. |
| `/wideangle` | Lente grande angular (14mm-24mm) com distorção periférica sutil e campo amplo. | Perspectiva CSS agressiva (`perspective: 600px`) expandindo as bordas do vídeo. |
| `/pov` | Visão em primeira pessoa (Point of View), como se a câmera fosse os olhos do usuário. | Interação de cursor macOS clicando e digitando na primeira pessoa. |
| `/overhead` | Visão reta zenital (90º de cima para baixo), estilo plano de mesa de trabalho. | Câmera plana superior mostrando cartões distribuídos sobre a bancada. |
| `/aerial` | Vista aérea em grande altitude, estabelecendo grandiosidade e escala. | Câmera panorâmica superior mostrando o grafo completo de dados ou ecossistema. |
| `/droneview` | Movimento fluido simulando voo de drone com curvas suaves e aceleração aerodinâmica. | Curva Bezier tridimensional de câmera com inclinação nos cantos (*banked turn*). |

---

## 2. Tempo, Transformação e Clima

| Comando | Descrição Técnica | Aplicação no Remotion / Vibe Studio |
|---|---|---|
| `/timelapse` | Compressão de tempo com câmera rigorosamente estática, acelerando horas em segundos. | Gravação de terminal ou linha de montagem com frame rate acelerado (10x). |
| `/hyperlapse` | Compressão de tempo combinada com movimento espacial contínuo da câmera. | Câmera deslizando através de 5 telas de código acelerado. |
| `/slomotion` | Câmera lenta dramática (60fps/120fps desacelerados), capturando microdetalhes físicos. | Queda suave de cards com física de mola estendida e partículas suspensas. |
| `/daytonight` | Transição luminosa contínua do dia para a noite em um único plano-sequência. | Mudança dinâmica de tema claro (Daylight) para tema escuro (Dark Obsidian). |
| `/seasonchange` | Transição climática e visual entre estações (primavera, verão, outono, inverno). | Modulação da paleta cromática e reflexos ambientais ao longo da timeline. |
| `/goldenhour` | Iluminação quente e difusa de sol baixo (dourado/âmbar), sombras longas e suaves. | Gradientes dourados (#FFD700 / #F59E0B) com iluminação rim-light suave. |
| `/rainynight` | Atmosfera noturna úmida com reflexos de poças, gotas no vidro e contrastes frios. | Texturas de reflexo especular dinâmico com iluminação ciano/azul profundo. |
| `/snowworld` | Ambiente monocromático de alta claridade, brancos puros e reflexão difusa de neve. | Estética brutalista minimalista P&B com altos índices de luminância. |
| `/fog` | Neblina e atmosfera volumétrica que esconde o fundo e revela formas por silhueta. | Efeito de névoa por máscara radial e desfoque progressivo (`backdrop-filter: blur`). |
| `/autumn` | Tons terrosos quentes (ocre, ferrugem, terracota) e iluminação outonal acolhedora. | Paleta editorial sofisticada com tipografia serifada e contrastes ricos. |

---

## 3. Estilos Visuais e Retratos

| Comando | Descrição Técnica | Aplicação no Remotion / Vibe Studio |
|---|---|---|
| `/studiopro` | Iluminação de estúdio profissional em 3 pontos (Key Light, Fill Light, Rim Light). | Mockups 3D com luz de contorno nítida e sombras volumétricas controladas. |
| `/moviescene` | Enquadramento cinematográfico (2.39:1 letterbox), granulação de 35mm e cor dramática. | Color grading cinematográfico com look teal & orange e barras pretas anamórficas. |
| `/neoncity` | Estética cyberpunk noturna com brilhos neon saturados, ciano e magenta. | HUDs táticos com linhas de laser neon brilhantes e grade de escaneamento. |
| `/magazine` | Estilo editorial de capa de revista de alta costura (Vogue/Kinfolk/GQ). | Layout tipográfico editorial triptico, fontes Instrument Serif e espaços vazios nobres. |
| `/oldmoney` | Estética clássica, tradicional, aristocrática e atemporal (verde caçador, ouro, madeira). | Cartões com acabamento em ouro fosco titânio, bordas finas e micro-ornamentos. |
| `/vintagefilm` | Textura nostálgica de película analógica antiga (Kodak Portra, halation, grain, scratches). | Filtros de ruído sutil (film grain SVG overlay) e aberração cromática nas bordas. |
| `/lowanglehero` | Câmera posicionada abaixo do sujeito apontando para cima (imponência e autoridade). | Perspectiva de tela inclinada para trás que faz o app parecer monumental. |
| `/doubleexposure` | Sobreposição artística de duas camadas visuais fundidas por transparência e luz. | Fusão de código terminal rodando por dentro da silhueta do logo ou do orador. |
| `/profheadshot` | Retrato corporativo padronizado com foco nítido nos olhos e fundo bokeh suave. | Enquadramento central perfeito para cortes de podcast e oradores convidados. |
| `/luxuryad` | Padrão Apple / Rolex / Porsche: minimalismo extremo, macro-closeups, som tactile. | Rourke Luxury Showcase com motion easing suave, sheen especular e sound design físico. |
| `/miniworld` | Efeito miniatura diorama obtido por lente tilt-shift (desfocagem seletiva superior/inferior). | Desfoque gaussiano em faixas nas bordas superior e inferior, encolhendo a escala percebida. |

---

## 4. Exibição de Produtos e Efeitos Específicos

| Comando | Descrição Técnica | Aplicação no Remotion / Vibe Studio |
|---|---|---|
| `/teardown` | Desmontagem cronológica de um equipamento mostrando seus componentes internos. | Animação onde o smartphone se divide em chassi, tela de vidro e placa de circuito. |
| `/explodedview` | Vista explodida isométrica com todas as camadas suspensas no ar em profundidade Z. | Cards do ecossistema flutuando paralelos no espaço 3D (Fan-out e Stack expandida). |
| `/reveal` | Animação elegante de revelação inicial de um produto a partir de sombras ou luz de recorte. | Brilho especular varrendo a silhueta escura do smartphone até acender a tela completa. |
