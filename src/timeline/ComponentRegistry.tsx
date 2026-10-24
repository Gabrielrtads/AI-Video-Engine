import React from 'react';
import {
  Smartphone3DMockup,
  VectorHUDOverlay,
  AppleKineticCard3D,
  AnimatedBezierCurve,
  InteractiveMacCursor,
  AudioVisualizerBars,
  HormoziKineticCaption,
  RetentionProgressBar,
  HormoziPunchZoom,
  OrbitalPlanet3D,
  VoxPaperStage,
  NewspaperCutout,
  VoxHighlighter,
  HandDrawnMark,
  VoxAnimatedMap,
  VoxEditorialTypography,
  BigHookTopBanner,
  OrbitSplitScreenStage,
  MagazineCoverStage,
  AudioWaveformCutStage,
} from '../components';
import { FlowMotionMaster } from '../FlowMotionMaster';
import { CarrosselEditorial } from '../CarrosselEditorial';
import { FullBleedShowcase } from '../FullBleedShowcase';
import { Slide02Diagnostico } from '../Slide02Diagnostico';
import { Slide03Solucao } from '../Slide03Solucao';
import { Slide04Engenharia } from '../Slide04Engenharia';
import { Slide05Final } from '../Slide05Final';
import { RourkeLuxuryShowcase } from '../RourkeLuxuryShowcase';

/**
 * Mapa de Registro Central de Componentes Gráficos para a Linha do Tempo Declarativa.
 * Mapeia identificadores textuais serializados em JSON para seus respectivos componentes React.
 */
export const VIBE_COMPONENT_REGISTRY: Record<string, React.FC<any>> = {
  // Primitivas de Movimento (Motion Primitives)
  Smartphone3DMockup,
  VectorHUDOverlay,
  AppleKineticCard3D,
  AnimatedBezierCurve,
  InteractiveMacCursor,
  AudioVisualizerBars,
  OrbitalPlanet3D,

  // Técnicas de Retenção & Tipografia Hormozi
  HormoziKineticCaption,
  RetentionProgressBar,
  HormoziPunchZoom,

  // Estilo VOX Documentário 2.5D
  VoxPaperStage,
  NewspaperCutout,
  VoxHighlighter,
  HandDrawnMark,
  VoxAnimatedMap,
  VoxEditorialTypography,

  // Estilos Edit.IA Absorvidos (Um Pedido Pra Cada Estilo)
  BigHookTopBanner,
  OrbitSplitScreenStage,
  MagazineCoverStage,
  AudioWaveformCutStage,

  // Templates e Showcases Canônicos
  FlowMotionMaster,
  CarrosselEditorial,
  FullBleedShowcase,
  Slide02Diagnostico,
  Slide03Solucao,
  Slide04Engenharia,
  Slide05Final,
  RourkeLuxuryShowcase,
};

export interface RenderRegisteredComponentProps {
  componentName: string;
  props?: Record<string, unknown>;
}

export const RenderRegisteredComponent: React.FC<RenderRegisteredComponentProps> = ({
  componentName,
  props = {},
}) => {
  const Component = VIBE_COMPONENT_REGISTRY[componentName];

  if (!Component) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed rgba(239, 68, 68, 0.5)',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          color: '#EF4444',
          fontFamily: 'monospace',
          fontSize: 16,
          padding: 24,
          borderRadius: 12,
        }}
      >
        [Aviso: Componente &quot;{componentName}&quot; não encontrado no VIBE_COMPONENT_REGISTRY]
      </div>
    );
  }

  return <Component {...props} />;
};
