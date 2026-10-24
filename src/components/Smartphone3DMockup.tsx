import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface Smartphone3DMockupProps {
  title?: string;
  /** Texto sob o título; '' esconde (o padrão é só um texto de demonstração). */
  description?: string;
  urlBadge?: string;
  screenContent?: React.ReactNode;
  children?: React.ReactNode;
  width?: number;
  height?: number;
  tiltIntensity?: number;
  showGlow?: boolean;
  theme?: 'dark' | 'glass' | 'titanium';
  scaleEntrance?: boolean;
  delayFrames?: number;
}

export const Smartphone3DMockup: React.FC<Smartphone3DMockupProps> = ({
  title = 'Vibe Studio Mobile',
  description = 'Mockup 3D procedural nativo com suporte a children e perspectiva CSS.',
  urlBadge = 'vibe.studio/preview',
  screenContent,
  children,
  width = 420,
  height = 840,
  tiltIntensity = 1,
  showGlow = true,
  theme = 'titanium',
  scaleEntrance = true,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delayFrames);

  // Entrance spring animation
  const entranceSpring = scaleEntrance
    ? spring({
        frame: adjustedFrame,
        fps,
        config: { damping: 14, stiffness: 120, mass: 0.9 },
      })
    : 1;

  // Organic idle gyro tilt (simula movimento de celular segurado ou flutuando em órbita)
  const idleTiltX = Math.sin((adjustedFrame / fps) * 1.4) * 6 * tiltIntensity;
  const idleTiltY = Math.cos((adjustedFrame / fps) * 1.1) * 9 * tiltIntensity;
  const idleFloatY = Math.sin((adjustedFrame / fps) * 2.0) * 12;

  // Estilos de acabamento físico do chassi
  const getThemeStyles = () => {
    switch (theme) {
      case 'glass':
        return {
          chassisBg: 'rgba(20, 24, 35, 0.72)',
          border: '1.5px solid rgba(255, 255, 255, 0.22)',
          glowColor: 'rgba(56, 189, 248, 0.25)',
          backdropBlur: 'blur(28px)',
        };
      case 'dark':
        return {
          chassisBg: '#090A0F',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          glowColor: 'rgba(99, 102, 241, 0.2)',
          backdropBlur: 'none',
        };
      case 'titanium':
      default:
        return {
          chassisBg: 'linear-gradient(145deg, #18191E 0%, #0D0E12 100%)',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          glowColor: 'rgba(255, 215, 0, 0.15)',
          backdropBlur: 'none',
        };
    }
  };

  const themeStyle = getThemeStyles();

  // Brilho especular dinâmico na borda superior
  const sheenSweep = interpolate(
    (adjustedFrame % (fps * 3)) / (fps * 3),
    [0, 1],
    [-100, 200]
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1200,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      {/* Halo de Iluminação Ambiental */}
      {showGlow && (
        <div
          style={{
            position: 'absolute',
            width: width * 1.2,
            height: height * 0.9,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${themeStyle.glowColor} 0%, rgba(0,0,0,0) 70%)`,
            filter: 'blur(45px)',
            transform: `translateY(${idleFloatY * 0.5}px)`,
            zIndex: 0,
          }}
        />
      )}

      {/* Chassi do Smartphone em Perspectiva 3D */}
      <div
        style={{
          position: 'relative',
          width,
          height,
          borderRadius: 48,
          background: themeStyle.chassisBg,
          border: themeStyle.border,
          boxShadow: `
            0 30px 80px -15px rgba(0, 0, 0, 0.85),
            inset 0 0 0 2px rgba(255, 255, 255, 0.08),
            0 0 30px ${themeStyle.glowColor}
          `,
          transform: `
            scale(${entranceSpring})
            translateY(${idleFloatY}px)
            rotateX(${idleTiltX}deg)
            rotateY(${idleTiltY}deg)
          `,
          transformStyle: 'preserve-3d',
          overflow: 'hidden',
          zIndex: 1,
          backdropFilter: themeStyle.backdropBlur,
        }}
      >
        {/* Dynamic Island / Notch */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 110,
            height: 28,
            borderRadius: 20,
            backgroundColor: '#000000',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
          }}
        >
          {/* Lente da Câmera */}
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#0A1128',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: 2,
                width: 3,
                height: 3,
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.8)',
              }}
            />
          </div>
        </div>

        {/* Barra de URL / Status Safari */}
        {urlBadge && (
          <div
            style={{
              position: 'absolute',
              top: 52,
              left: 24,
              right: 24,
              height: 32,
              borderRadius: 16,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9,
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 11,
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              <span style={{ fontSize: 9, opacity: 0.8 }}>🔒</span>
              {urlBadge}
            </div>
          </div>
        )}

        {/* Área Útil da Tela */}
        <div
          style={{
            position: 'absolute',
            top: urlBadge ? 96 : 56,
            left: 14,
            right: 14,
            bottom: 24,
            borderRadius: 36,
            overflow: 'hidden',
            backgroundColor: '#05070B',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {screenContent || children || (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                textAlign: 'center',
                color: '#FFFFFF',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              <div
                style={{
                  // Sem descrição, o título é o conteúdo da cena: precisa ser lido no celular
                  fontSize: description === '' ? Math.round(width * 0.085) : 20,
                  fontWeight: 700,
                  marginBottom: 8,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  padding: description === '' ? '0 24px' : 0,
                  textAlign: description === '' ? 'center' : undefined,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.5)',
                  lineHeight: 1.4,
                }}
              >
                {description}
              </div>
            </div>
          )}
        </div>

        {/* Efeito Sheen (Reflexo de Vidro que percorre o chassi) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${sheenSweep}%`,
            width: '60%',
            height: '100%',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
            transform: 'skewX(-25deg)',
            pointerEvents: 'none',
            zIndex: 15,
          }}
        />

        {/* Home Indicator do iOS */}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            zIndex: 12,
          }}
        />
      </div>
    </div>
  );
};
