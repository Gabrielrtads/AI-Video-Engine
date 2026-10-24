/**
 * Catálogo Canônico de Componentes e Primitivas Registradas no Vibe Design Studio
 * Contrato TypeScript puro (zero dependência de JSX), executável em Node.js e Remotion.
 */

export const VIBE_CANONICAL_COMPONENTS = [
  'FundoEstilo',
  'FraseDestaque',
  'NumeroDestaque',
  'Smartphone3DMockup',
  'VectorHUDOverlay',
  'AppleKineticCard3D',
  'AnimatedBezierCurve',
  'InteractiveMacCursor',
  'AudioVisualizerBars',
  'HormoziKineticCaption',
  'RetentionProgressBar',
  'HormoziPunchZoom',
  'OrbitalPlanet3D',
  'VoxPaperStage',
  'NewspaperCutout',
  'VoxHighlighter',
  'HandDrawnMark',
  'VoxAnimatedMap',
  'VoxEditorialTypography',
  'BigHookTopBanner',
  'OrbitSplitScreenStage',
  'MagazineCoverStage',
  'AudioWaveformCutStage',
  'FlowMotionMaster',
  'CarrosselEditorial',
  'FullBleedShowcase',
  'Slide02Diagnostico',
  'Slide03Solucao',
  'Slide04Engenharia',
  'Slide05Final',
  'RourkeLuxuryShowcase',
] as const;

export type VibeCanonicalComponentName = (typeof VIBE_CANONICAL_COMPONENTS)[number];

export function isCanonicalComponent(name: string): name is VibeCanonicalComponentName {
  return (VIBE_CANONICAL_COMPONENTS as readonly string[]).includes(name);
}

export interface ComponentMetadata {
  name: VibeCanonicalComponentName;
  category: 'primitive' | 'template' | 'showcase';
  description: string;
  defaultProps: Record<string, unknown>;
}

export const VIBE_COMPONENT_METADATA: Record<VibeCanonicalComponentName, ComponentMetadata> = {
  FundoEstilo: {
    name: 'FundoEstilo',
    category: 'primitive',
    description: 'Fundo do pacote de estilo: gradiente suave com vinheta (props: fundo, fundo2).',
    defaultProps: { fundo: '#05070D', fundo2: '#0B1220' },
  },
  FraseDestaque: {
    name: 'FraseDestaque',
    category: 'primitive',
    description: 'Frase da cena em tipografia grande, palavra por palavra (variant: afirmacao, pergunta, cta ou cartao).',
    defaultProps: { texto: '', variant: 'afirmacao', corTexto: '#F8FAFC', corAcento: '#38BDF8' },
  },
  NumeroDestaque: {
    name: 'NumeroDestaque',
    category: 'primitive',
    description: 'Número que conta até o valor, com prefixo, sufixo e rótulo (ex.: 70%, R$ 127,97, 3x).',
    defaultProps: { valor: 0, decimais: 0, prefixo: '', sufixo: '', rotulo: '', corTexto: '#F8FAFC', corAcento: '#38BDF8' },
  },
  Smartphone3DMockup: {
    name: 'Smartphone3DMockup',
    category: 'primitive',
    description: 'Mockup 3D de celular com perspectiva CSS, Dynamic Island e rotação orgânica.',
    defaultProps: { width: 420, height: 840, theme: 'titanium', tiltIntensity: 1 },
  },
  VectorHUDOverlay: {
    name: 'VectorHUDOverlay',
    category: 'primitive',
    description: 'HUD tático sci-fi/blueprint com cantoneiras, retículo de mira e scanner laser.',
    defaultProps: { preset: 'cyber', accentColor: '#38BDF8', showGrid: true, showCrosshair: true },
  },
  AppleKineticCard3D: {
    name: 'AppleKineticCard3D',
    category: 'primitive',
    description: 'Cartão translúcido estilo Apple Card com física de mola e reflexo de brilho especular.',
    defaultProps: { title: 'Apple Card', variant: 'dark-glass', tiltIntensity: 1 },
  },
  AnimatedBezierCurve: {
    name: 'AnimatedBezierCurve',
    category: 'primitive',
    description: 'Curva vetorial animada procedural com gradiente luminoso e pontos de ancoragem.',
    defaultProps: { width: 680, height: 380, strokeColor: '#10B981', fillGradient: true },
  },
  InteractiveMacCursor: {
    name: 'InteractiveMacCursor',
    category: 'primitive',
    description: 'Cursor macOS nativo com easing humano de trajetória e efeitos de onda de choque no clique.',
    defaultProps: { pointerType: 'arrow', showRipple: true, rippleColor: 'rgba(56, 189, 248, 0.7)' },
  },
  AudioVisualizerBars: {
    name: 'AudioVisualizerBars',
    category: 'primitive',
    description: 'Equalizador de barras de frequência com bounce procedural e gradiente.',
    defaultProps: { barCount: 24, width: 480, height: 120, variant: 'equalizer' },
  },
  HormoziKineticCaption: {
    name: 'HormoziKineticCaption',
    category: 'primitive',
    description: 'Legendas cinéticas Alex Hormozi com pop elástico, rotação sutil e tarja amarela.',
    defaultProps: { highlightColor: '#FFE600', maxWordsOnScreen: 3 },
  },
  RetentionProgressBar: {
    name: 'RetentionProgressBar',
    category: 'primitive',
    description: 'Barra de progresso de retenção contínua no topo para Reels e Shorts.',
    defaultProps: { barHeight: 6, gradientColors: ['#00F5A0', '#00D9F5'] },
  },
  HormoziPunchZoom: {
    name: 'HormoziPunchZoom',
    category: 'primitive',
    description: 'Efeito Punch-Zoom com corte dinâmico de câmera simulando troca de enquadramento.',
    defaultProps: { zoomScale: 1.12, zoomDurationFrames: 18 },
  },
  OrbitalPlanet3D: {
    name: 'OrbitalPlanet3D',
    category: 'primitive',
    description: 'Planeta 3D volumétrico com iluminação especular, anéis estilo Saturno e satélites orbitais.',
    defaultProps: { size: 260, colorPrimary: '#38BDF8', hasRings: true },
  },
  VoxPaperStage: {
    name: 'VoxPaperStage',
    category: 'primitive',
    description: 'Mesa de trabalho editorial 2.5D com textura de papel, grade milimetrada e drift de câmera 30fps.',
    defaultProps: { theme: 'light-newsprint', showGrid: true, camDrift: true },
  },
  NewspaperCutout: {
    name: 'NewspaperCutout',
    category: 'primitive',
    description: 'Recorte de jornal histórico com borda rasgada procedural, tipografia serifada e greeking.',
    defaultProps: { headline: 'RELATÓRIO CONFIRMA IMPACTO HISTÓRICO', w: 880, h: 480, angle: -2 },
  },
  VoxHighlighter: {
    name: 'VoxHighlighter',
    category: 'primitive',
    description: 'Marca-texto amarelo fluorescente animado da esquerda para a direita sobre texto.',
    defaultProps: { text: 'EVIDÊNCIA DOCUMENTAL', color: '#FFDE2E', fontSize: 38 },
  },
  HandDrawnMark: {
    name: 'HandDrawnMark',
    category: 'primitive',
    description: 'Círculo ou grifo manuscrito com caneta vermelha e imprecisão orgânica calculada.',
    defaultProps: { type: 'circle', color: '#D9381E', width: 280, height: 140 },
  },
  VoxAnimatedMap: {
    name: 'VoxAnimatedMap',
    category: 'primitive',
    description: 'Atlas cartográfico vetorial local em SVG limpo com traçado animado de rotas.',
    defaultProps: { title: 'ROTA TRANSATLÂNTICA // ARQUIVO', width: 900, height: 540 },
  },
  VoxEditorialTypography: {
    name: 'VoxEditorialTypography',
    category: 'primitive',
    description: 'Hierarquia tipográfica documental com serifa imponente, mono kicker e citações de fontes.',
    defaultProps: { kicker: '[ ARQUIVO INVESTIGATIVO ]', title: 'A Verdade Revelada', align: 'center' },
  },
  BigHookTopBanner: {
    name: 'BigHookTopBanner',
    category: 'primitive',
    description: 'Gancho tipográfico 3 linhas no terço superior com acendimento progressivo e sublinhado ondulado de erro SVG (e02-gancho).',
    defaultProps: { lines: ['EU GRAVEI', 'ESSE VÍDEO', 'UMA VEZ SÓ'], errorWords: ['ERREI', 'GAGUEJEI'] },
  },
  OrbitSplitScreenStage: {
    name: 'OrbitSplitScreenStage',
    category: 'primitive',
    description: 'Split-screen 50/50 (Y=960px) com mural de cards flutuantes em órbita no topo e legenda cravada na costura central (e12-tela-dividida).',
    defaultProps: { topTitle: 'ÓRBITA', captionHighlight: 'em volta' },
  },
  MagazineCoverStage: {
    name: 'MagazineCoverStage',
    category: 'primitive',
    description: 'Capa de revista editorial GQ/Vogue em Verde Editorial Inglês (#1A3C2A), Masthead 210px atrás da cabeça, moldura 48px e código de barras (e13-revista).',
    defaultProps: { masthead: 'CLAUDE', solidGreenBackdrop: true, pillCaption: 'vira capa de revista.' },
  },
  AudioWaveformCutStage: {
    name: 'AudioWaveformCutStage',
    category: 'primitive',
    description: 'Dark UI Motion explicativo de onda de áudio com setas manuscritas vermelhas (erro, gaguejada, pausa) e scanner laranja de corte (e14-motion-explicativo).',
    defaultProps: { fileName: 'bruto.mov', durationLabel: '2:03', scanStartFrame: 35 },
  },
  FlowMotionMaster: {
    name: 'FlowMotionMaster',
    category: 'showcase',
    description: 'Composição de movimento full-bleed de alto impacto.',
    defaultProps: {},
  },
  CarrosselEditorial: {
    name: 'CarrosselEditorial',
    category: 'template',
    description: 'Template de carrossel editorial 4:5 estilo revista de luxo.',
    defaultProps: {},
  },
  FullBleedShowcase: {
    name: 'FullBleedShowcase',
    category: 'showcase',
    description: 'Showcase em tela cheia com terminal e demonstradores.',
    defaultProps: {},
  },
  Slide02Diagnostico: {
    name: 'Slide02Diagnostico',
    category: 'template',
    description: 'Slide 02 de diagnóstico brutalista.',
    defaultProps: {},
  },
  Slide03Solucao: {
    name: 'Slide03Solucao',
    category: 'template',
    description: 'Slide 03 de engenharia e solução.',
    defaultProps: {},
  },
  Slide04Engenharia: {
    name: 'Slide04Engenharia',
    category: 'template',
    description: 'Slide 04 com especificações técnicas e áudio EBU R128.',
    defaultProps: {},
  },
  Slide05Final: {
    name: 'Slide05Final',
    category: 'template',
    description: 'Slide 05 com encerramento e CTA.',
    defaultProps: {},
  },
  RourkeLuxuryShowcase: {
    name: 'RourkeLuxuryShowcase',
    category: 'showcase',
    description: 'Showcase padrão Rourke Heath com 3D fan-out e luxo editorial.',
    defaultProps: {},
  },
};
