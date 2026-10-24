import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  HormoziKineticCaption,
  RetentionProgressBar,
  HormoziPunchZoom,
  VectorHUDOverlay,
  Smartphone3DMockup,
} from '../components';
import { WordItem } from '../timeline/hormoziMath';

// Frase de alto impacto demonstrando o padrão Alex Hormozi (Conceito Fixo, Estilo Livre)
const DEMO_HORMOZI_WORDS: WordItem[] = [
  { text: 'se', start: 0.2, end: 0.5 },
  { text: 'você', start: 0.5, end: 0.8 },
  { text: 'quer', start: 0.8, end: 1.1 },
  { text: 'faturar', start: 1.1, end: 1.6 }, // 💵
  { text: 'alto', start: 1.6, end: 2.0 },
  { text: 'esqueça', start: 2.1, end: 2.6 },
  { text: 'os', start: 2.6, end: 2.8 },
  { text: 'erros', start: 2.8, end: 3.3 },   // ❌
  { text: 'básicos', start: 3.3, end: 3.8 },
  { text: 'tenha', start: 3.9, end: 4.3 },
  { text: 'foco', start: 4.3, end: 4.8 },    // 🎯 / 🔥
  { text: 'na', start: 4.8, end: 5.0 },
  { text: 'mente', start: 5.0, end: 5.5 },   // 🧠
  { text: 'e', start: 5.5, end: 5.7 },
  { text: 'lance', start: 5.7, end: 6.2 },
  { text: 'o', start: 6.2, end: 6.4 },
  { text: 'foguete', start: 6.4, end: 7.0 }, // 🚀
  { text: 'da', start: 7.0, end: 7.2 },
  { text: 'escala', start: 7.2, end: 7.8 },  // 🚀
  { text: 'agora', start: 7.8, end: 8.4 },
];

export const HormoziShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#07090E',
        color: '#FFFFFF',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* 1. Rig de Micro-Zoom de Atenção (Punch Zoom) */}
      <HormoziPunchZoom cutPointsSeconds={[1.1, 2.8, 5.0, 6.4]} zoomScale={1.12}>
        {/* Fundo Cinemático com Gradiente Escuro */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 40%, rgba(30, 41, 59, 0.45) 0%, rgba(7, 9, 14, 0.95) 75%)',
          }}
        />

        {/* HUD Tático Blueprint de Fundo */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
          <VectorHUDOverlay preset="cyber" accentColor="#38BDF8" showGrid={true} />
        </div>

        {/* Mockup 3D Flutuante no Centro-Alto */}
        <div
          style={{
            position: 'absolute',
            top: 220,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: 0.9,
          }}
        >
          <Smartphone3DMockup
            width={380}
            height={740}
            theme="titanium"
            tiltIntensity={0.6}
            screenContent={
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(180deg, #0F172A 0%, #020617 100%)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 13, color: '#38BDF8', letterSpacing: '0.15em', fontWeight: 700 }}>
                  VIBE DESIGN STUDIO
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, marginTop: 12, color: '#FFFFFF' }}>
                  RETENÇÃO NEUROBIOLÓGICA
                </div>
                <div
                  style={{
                    marginTop: 20,
                    padding: '8px 16px',
                    borderRadius: 20,
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    fontSize: 14,
                    color: '#38BDF8',
                    fontWeight: 800,
                  }}
                >
                  HORMOZI STANDARD
                </div>
              </div>
            }
          />
        </div>

        {/* Badge Editorial de Topo */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: 80,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#FFE500',
              boxShadow: '0 0 12px #FFE500',
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '0.18em',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            VIBE STUDIO // HORMOZI RETENTION RIG
          </span>
        </div>

        {/* 2. Legenda Cinética de Alto Impacto (HormoziKineticCaption) */}
        <HormoziKineticCaption
          words={DEMO_HORMOZI_WORDS}
          variant="classic-yellow"
          highlightStyle="box"
          motionIntensity="standard"
          windowSize={1}
          showEmojis={true}
          textTransform="uppercase"
          fontSize={72}
          bottom={380}
        />
      </HormoziPunchZoom>

      {/* 3. Barra de Retenção Contínua (RetentionProgressBar no Topo) */}
      <RetentionProgressBar
        position="top"
        height={10}
        gradient={['#FFE500', '#FF003C']}
        showGlow={true}
        glowColor="rgba(255, 229, 0, 0.9)"
      />
    </AbsoluteFill>
  );
};
