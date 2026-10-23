/**
 * Catálogo Canônico de Ferramentas MCP do Vibe Design Studio
 * Auditoria realizada via Antigravity CLI (agy) e OpenAI Codex sobre OpenChatCut
 * 
 * 6 Ferramentas de Alto Nível projetadas para o Swarm (Claude, Gemini, Codex)
 */

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const VIBE_STUDIO_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'vibe_project_setup',
    description:
      'Inicializa ou reconfigura uma composição de vídeo no Vibe Design Studio. Define proporção de tela (canvas 9:16 vertical 1080x1920 ou 16:9), FPS (padrão 30) e duração total em segundos.',
    inputSchema: {
      type: 'object',
      properties: {
        ratio: {
          type: 'string',
          enum: ['9:16', '16:9', '4:5', '1:1'],
          description: 'Aspect ratio do canvas. 9:16 para Reels/TikTok, 4:5 para Carrossel Instagram.',
        },
        durationSeconds: {
          type: 'number',
          minimum: 1,
          description: 'Duração total do vídeo em segundos (ex: 30 para vídeo de retenção).',
        },
        fps: {
          type: 'number',
          enum: [30, 60],
          description: 'Taxa de quadros por segundo (padrão: 30fps).',
        },
        title: {
          type: 'string',
          description: 'Título identificador do projeto / briefing.',
        },
      },
      required: ['ratio', 'durationSeconds'],
    },
  },
  {
    name: 'vibe_import_media',
    description:
      'Ingere ativos locais (vídeos de B-Roll, logos, narração em áudio, sound effects) para a biblioteca do projeto sem necessidade de upload HTTP, retornando identificadores prontos para a timeline.',
    inputSchema: {
      type: 'object',
      properties: {
        mediaFiles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Caminho absoluto ou relativo do arquivo local.' },
              kind: { type: 'string', enum: ['video', 'audio', 'image', 'sfx'] },
              alias: { type: 'string', description: 'Nome amigável para referenciar na timeline.' },
            },
            required: ['path', 'kind'],
          },
        },
      },
      required: ['mediaFiles'],
    },
  },
  {
    name: 'vibe_compose_timeline',
    description:
      'O coração do estúdio: adiciona, atualiza ou remove clipes e camadas em lote na timeline de forma atômica. Suporta cortes de entrada/saída (trim), retiming, volume e camadas gráficas Remotion.',
    inputSchema: {
      type: 'object',
      properties: {
        adds: {
          type: 'array',
          description: 'Lista de clipes a inserir na timeline.',
          items: {
            type: 'object',
            properties: {
              trackId: { type: 'string', description: 'ID da track (ex: V1, V2, A1, CAP1, GFX1).' },
              kind: { type: 'string', enum: ['video', 'audio', 'image', 'caption', 'graphics'] },
              startFrame: { type: 'integer', minimum: 0, description: 'Frame exato de início na timeline global.' },
              durationInFrames: { type: 'integer', minimum: 1, description: 'Duração em frames.' },
              src: { type: 'string', description: 'Origem da mídia ou texto/props.' },
              volume: { type: 'number', minimum: 0, maximum: 1, description: 'Volume de áudio (0.0 a 1.0).' },
              props: { type: 'object', description: 'Propriedades customizadas para componentes gráficos.' },
            },
            required: ['trackId', 'kind', 'startFrame', 'durationInFrames'],
          },
        },
        updates: {
          type: 'array',
          description: 'Atualizações em clipes já existentes.',
          items: {
            type: 'object',
            properties: {
              clipId: { type: 'string', description: 'ID do clipe alvo.' },
              startFrame: { type: 'integer', minimum: 0 },
              durationInFrames: { type: 'integer', minimum: 1 },
              volume: { type: 'number', minimum: 0, maximum: 1 },
            },
            required: ['clipId'],
          },
        },
        deletes: {
          type: 'array',
          description: 'Lista de IDs de clipes a remover da timeline.',
          items: { type: 'string' },
        },
      },
    },
  },
  {
    name: 'vibe_style_captions',
    description:
      'Aplica estilos de legendas cinéticas (Kinetic Typography estilo Alex Hormozi/MrBeast) sincronizadas milimetricamente via transcrição Whisper, com proteção contra sobreposição facial (safe zones).',
    inputSchema: {
      type: 'object',
      properties: {
        motionPreset: {
          type: 'string',
          enum: ['slam', 'karaoke', 'pop', 'fade-up'],
          description: 'Preset de animação de entrada da palavra.',
        },
        fontSize: {
          type: 'number',
          minimum: 12,
          maximum: 120,
          description: 'Tamanho da fonte em px (padrão 54 para vertical 1080x1920).',
        },
        highlightColor: {
          type: 'string',
          description: 'Cor de destaque da palavra ativa (ex: "#FFD700" para amarelo ouro).',
        },
        avoidFaceZones: {
          type: 'boolean',
          description: 'Se verdadeiro, calcula a posição da legenda para nunca sobrepor o rosto do orador.',
        },
      },
      required: ['motionPreset'],
    },
  },
  {
    name: 'vibe_export_video',
    description:
      'Dispara a renderização final do vídeo via Remotion CLI + FFmpeg, aplicando normalização de áudio EBU R128 (-14 LUFS) e gerando o arquivo MP4 pronto para publicação.',
    inputSchema: {
      type: 'object',
      properties: {
        outputFileName: {
          type: 'string',
          description: 'Nome do arquivo de saída (ex: "Barbearia_Flow_Final.mp4").',
        },
        qualityPreset: {
          type: 'string',
          enum: ['fast_preview', 'production_high_crf', 'prores'],
          description: 'Preset de qualidade de codificação H.264/AAC.',
        },
      },
      required: ['outputFileName'],
    },
  },
  {
    name: 'vibe_render_from_json',
    description:
      'Renderiza um vídeo completo a partir de um arquivo JSON declarativo da timeline, acionando o compilador Remotion, gerando o arquivo MP4 e aplicando normalização de áudio EBU R128 (-14 LUFS). Permite aos agentes produzir vídeos sem tocar no código-fonte.',
    inputSchema: {
      type: 'object',
      properties: {
        timelinePath: {
          type: 'string',
          description: 'Caminho do arquivo JSON da timeline (ex: "src/timeline/exemplos/timeline_showcase_completo.json").',
        },
        outputFileName: {
          type: 'string',
          description: 'Nome do arquivo MP4 de saída (ex: "out/meu_video_declarativo.mp4").',
        },
        masterAudio: {
          type: 'boolean',
          description: 'Se verdadeiro, aplica normalização EBU R128 (-14 LUFS) ao áudio final. Padrão: true.',
        },
      },
      required: ['timelinePath', 'outputFileName'],
    },
  },
];
