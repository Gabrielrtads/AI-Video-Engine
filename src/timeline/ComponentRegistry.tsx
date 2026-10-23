import React from 'react';
import {
  Smartphone3DMockup,
  VectorHUDOverlay,
  AppleKineticCard3D,
  AnimatedBezierCurve,
  InteractiveMacCursor,
  AudioVisualizerBars,
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '2px dashed #EF4444',
          borderRadius: 16,
          color: '#EF4444',
          fontFamily: 'Inter, monospace, sans-serif',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
          ⚠️ Componente Não Registrado
        </div>
        <div style={{ fontSize: 16, color: '#FFFFFF', marginBottom: 4 }}>
          Nome: <code style={{ color: '#FCA5A5' }}>{componentName}</code>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)' }}>
          Disponíveis: {Object.keys(VIBE_COMPONENT_REGISTRY).join(', ')}
        </div>
      </div>
    );
  }

  return <Component {...props} />;
};
