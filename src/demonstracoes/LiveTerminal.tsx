import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

const { fontFamily: fontAnton } = loadAnton();
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const LiveTerminal: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Animação de digitação em tempo real do comando
	const fullCommand = 'npx skills add Gabrielrtads/vibe-design-studio';
	const typingFrames = 40;
	const charsTyped = Math.min(
		fullCommand.length,
		Math.floor(interpolate(frame, [8, 8 + typingFrames], [0, fullCommand.length], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}))
	);
	const displayedCommand = fullCommand.slice(0, charsTyped);

	// Cursor piscando
	const cursorVisible = Math.floor(frame / 6) % 2 === 0;

	// Saída do comando após ser digitado
	const isExecuted = frame >= 8 + typingFrames + 8;
	const outputSpring = spring({
		frame: Math.max(0, frame - (8 + typingFrames + 8)),
		fps,
		config: { damping: 16, mass: 0.5, stiffness: 150 },
	});

	return (
		<div
			style={{
				width: 580,
				height: 725,
				borderRadius: 26,
				overflow: 'hidden',
				boxShadow: '0 35px 90px -15px rgba(0, 0, 0, 0.8), 0 10px 30px -5px rgba(0, 0, 0, 0.4)',
				border: '1.5px solid rgba(255, 255, 255, 0.12)',
				background: '#0B0C10',
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: 28,
				boxSizing: 'border-box',
			}}
		>
			{/* Top Bar do Terminal Mac */}
			<div>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
						paddingBottom: 16,
					}}
				>
					<div style={{ display: 'flex', gap: 8 }}>
						<div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
						<div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
						<div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
					</div>
					<span style={{ fontFamily: fontMono, fontSize: 12, color: 'rgba(255, 255, 255, 0.5)' }}>
						vibe-studio — headless — 60 FPS
					</span>
					<div
						style={{
							background: 'rgba(16, 185, 129, 0.15)',
							border: '1px solid rgba(16, 185, 129, 0.4)',
							borderRadius: 999,
							padding: '2px 8px',
							fontFamily: fontMono,
							fontSize: 10,
							color: '#10B981',
							fontWeight: 700,
						}}
					>
						CLI NATIVO
					</div>
				</div>

				{/* Janela de Console com Digitação ao Vivo */}
				<div
					style={{
						marginTop: 20,
						fontFamily: fontMono,
						fontSize: 14,
						lineHeight: 1.6,
						color: '#f8fafc',
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<span style={{ color: '#10B981', fontWeight: 800 }}>➜</span>
						<span style={{ color: '#38BDF8', fontWeight: 700 }}>workspace</span>
						<span style={{ color: '#94a3b8' }}>$</span>
						<span style={{ color: '#ffffff', fontWeight: 600 }}>{displayedCommand}</span>
						{cursorVisible && (
							<span style={{ background: '#10B981', width: 8, height: 16, display: 'inline-block' }} />
						)}
					</div>

					{/* Log de Instalação e Execução em Código Puro */}
					{isExecuted && (
						<div
							style={{
								marginTop: 18,
								display: 'flex',
								flexDirection: 'column',
								gap: 8,
								opacity: outputSpring,
								transform: `translateY(${(1 - outputSpring) * 10}px)`,
							}}
						>
							<div style={{ color: '#10B981', display: 'flex', gap: 8 }}>
								<span>✔</span>
								<span>Motor Remotion + Whisper C++ injetado com sucesso</span>
							</div>
							<div style={{ color: '#10B981', display: 'flex', gap: 8 }}>
								<span>✔</span>
								<span>8 habilidades canônicas registradas no enxame</span>
							</div>
							<div style={{ color: '#38BDF8', display: 'flex', gap: 8 }}>
								<span>✔</span>
								<span>Studio compilado: http://localhost:3000 (0.6s)</span>
							</div>
							<div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, marginTop: 4 }}>
								[HEADLESS]: Nenhum navegador pesado aberto. Render 100% código.
							</div>
						</div>
					)}
				</div>
			</div>

			{/* 3 Pilares de Arquitetura em Badges Neon */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
					<div
						style={{
							background: 'rgba(255, 255, 255, 0.03)',
							border: '1px solid rgba(255, 255, 255, 0.08)',
							borderRadius: 14,
							padding: 12,
							textAlign: 'center',
						}}
					>
						<div style={{ fontFamily: fontMono, fontSize: 10, color: 'rgba(255, 255, 255, 0.5)' }}>CUSTO</div>
						<div style={{ fontFamily: fontAnton, fontSize: 24, color: '#10B981', marginTop: 2 }}>R$ 0,00</div>
					</div>
					<div
						style={{
							background: 'rgba(255, 255, 255, 0.03)',
							border: '1px solid rgba(255, 255, 255, 0.08)',
							borderRadius: 14,
							padding: 12,
							textAlign: 'center',
						}}
					>
						<div style={{ fontFamily: fontMono, fontSize: 10, color: 'rgba(255, 255, 255, 0.5)' }}>CONTROLE</div>
						<div style={{ fontFamily: fontAnton, fontSize: 24, color: '#38BDF8', marginTop: 2 }}>100% CÓDIGO</div>
					</div>
					<div
						style={{
							background: 'rgba(255, 255, 255, 0.03)',
							border: '1px solid rgba(255, 255, 255, 0.08)',
							borderRadius: 14,
							padding: 12,
							textAlign: 'center',
						}}
					>
						<div style={{ fontFamily: fontMono, fontSize: 10, color: 'rgba(255, 255, 255, 0.5)' }}>LICENÇA</div>
						<div style={{ fontFamily: fontAnton, fontSize: 24, color: '#FF0022', marginTop: 2 }}>MIT OPEN</div>
					</div>
				</div>

				{/* Enxame de Agentes Suportados */}
				<div
					style={{
						background: 'rgba(255, 255, 255, 0.02)',
						border: '1px solid rgba(255, 255, 255, 0.06)',
						borderRadius: 12,
						padding: '10px 16px',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<span style={{ fontFamily: fontMono, fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>
						ENXAME NATIVO:
					</span>
					<div style={{ display: 'flex', gap: 12 }}>
						<span style={{ fontFamily: fontMono, fontSize: 11, color: '#fbbf24', fontWeight: 700 }}>
							Claude Code
						</span>
						<span style={{ fontFamily: fontMono, fontSize: 11, color: '#34d399', fontWeight: 700 }}>
							OpenAI Codex
						</span>
						<span style={{ fontFamily: fontMono, fontSize: 11, color: '#38bdf8', fontWeight: 700 }}>
							Antigravity
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};
