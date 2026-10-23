/**
 * Catálogo Canônico de Componentes e Primitivas Registradas no Vibe Design Studio
 * Contrato TypeScript puro (zero dependência de JSX), executável em Node.js e Remotion.
 */

export const VIBE_CANONICAL_COMPONENTS = [
  'Smartphone3DMockup',
  'VectorHUDOverlay',
  'AppleKineticCard3D',
  'AnimatedBezierCurve',
  'InteractiveMacCursor',
  'AudioVisualizerBars',
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
