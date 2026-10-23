import React from 'react';
import {
	AbsoluteFill,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import { loadFont as loadBebasNeue } from '@remotion/google-fonts/BebasNeue';
import { loadFont as loadInstrumentSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

// Fontes editoriais de alto padrão
const { fontFamily: fontBebas } = loadBebasNeue();
const { fontFamily: fontInstrumentSerif } = loadInstrumentSerif('italic');
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['500', '600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const Slide03Solucao: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Animação física de entrada escalonada dos elementos
	const titleEntrance = spring({
		frame: Math.max(0, frame - 2),
		fps,
		config: { damping: 16, mass: 0.7, stiffness: 120 },
	});

	const terminalEntrance = spring({
		frame: Math.max(0, frame - 12),
		fps,
		config: { damping: 18, mass: 0.8, stiffness: 95 },
	});

	const metricsEntrance = spring({
		frame: Math.max(0, frame - 24),
		fps,
		config: { damping: 18, mass: 0.8, stiffness: 95 },
	});

	return (
		<AbsoluteFill
			style={{
				width: 1080,
				height: 1350,
				background: '#FCFCFD',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: '44px 52px 38px 52px',
				boxSizing: 'border-box',
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			{/* ══════════════ 1. HEADER EDITORIAL MINIMALISTA ══════════════ */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					paddingBottom: 20,
					borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
					fontFamily: fontMono,
					fontSize: 18,
					letterSpacing: '0.24em',
					fontWeight: 600,
					textTransform: 'uppercase',
				}}
			>
				<span style={{ color: '#09090B' }}>VIBE DESIGN STUDIO</span>
				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<span
						style={{
							background: '#09090B',
							color: '#FFFFFF',
							padding: '3px 10px',
							borderRadius: 6,
							fontSize: 14,
							fontWeight: 700,
							letterSpacing: '0.08em',
						}}
					>
						03
					</span>
					<span style={{ color: '#FF0022', fontWeight: 700 }}>A SOLUÇÃO</span>
				</div>
			</div>

			{/* ══════════════ 2. TÍTULO BRUTALISTA DE IMPACTO ══════════════ */}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 10,
					marginTop: 8,
					opacity: Math.min(Math.max(titleEntrance, 0), 1),
					transform: `translateY(${(1 - titleEntrance) * 15}px)`,
				}}
			>
				<span
					style={{
						fontFamily: fontPlusJakartaSans,
						fontSize: 16,
						fontWeight: 800,
						letterSpacing: '0.2em',
						color: '#FF0022',
						textTransform: 'uppercase',
					}}
				>
					— ARQUITETURA HEADLESS PARA AGENTES
				</span>

				<h1
					style={{
						fontFamily: fontBebas,
						fontSize: 110,
						lineHeight: 0.91,
						letterSpacing: '0.01em',
						color: '#09090B',
						margin: 0,
						textTransform: 'uppercase',
					}}
				>
					CRIAMOS O <span style={{ color: '#FF0022' }}>VIBE DESIGN STUDIO:</span>
					<br />
					O ESTÚDIO EM CÓDIGO PURO.
				</h1>
			</div>

			{/* ══════════════ 3. HERO: O TERMINAL HEADLESS DO AGENTE ══════════════ */}
			<div
				style={{
					background: '#09090B',
					borderRadius: 24,
					overflow: 'hidden',
					boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
					border: '1px solid rgba(0, 0, 0, 0.12)',
					display: 'flex',
					flexDirection: 'column',
					opacity: Math.min(Math.max(terminalEntrance, 0), 1),
					transform: `translateY(${(1 - terminalEntrance) * 20}px)`,
				}}
			>
				{/* Top Bar macOS */}
				<div
					style={{
						height: 46,
						background: '#16161B',
						borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
						display: 'flex',
						alignItems: 'center',
						padding: '0 20px',
						justifyContent: 'space-between',
					}}
				>
					<div style={{ display: 'flex', gap: 8 }}>
						<div style={{ width: 12, height: 12, borderRadius: 6, background: '#FF5F56' }} />
						<div style={{ width: 12, height: 12, borderRadius: 6, background: '#FFBD2E' }} />
						<div style={{ width: 12, height: 12, borderRadius: 6, background: '#27C93F' }} />
					</div>
					<span style={{ fontFamily: fontMono, fontSize: 13, color: 'rgba(255, 255, 255, 0.6)' }}>
						vibe-design-studio — zsh
					</span>
					<span
						style={{
							fontFamily: fontMono,
							fontSize: 11,
							color: '#10B981',
							fontWeight: 700,
							letterSpacing: '0.08em',
						}}
					>
						● HEADLESS ACTIVE
					</span>
				</div>

				{/* Linha de Comando de Instalação */}
				<div
					style={{
						padding: '20px 26px 14px 26px',
						borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
						background: '#0D0D12',
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						fontFamily: fontMono,
						fontSize: 16,
					}}
				>
					<span style={{ color: '#FF0022', fontWeight: 800 }}>➜</span>
					<span style={{ color: '#A1A1AA' }}>workspace</span>
					<span style={{ color: '#FFFFFF', fontWeight: 700 }}>
						$ npx skills add Gabrielrtads/vibe-design-studio
					</span>
				</div>

				{/* Os 3 Pilares da Arquitetura */}
				<div
					style={{
						padding: '24px 26px',
						display: 'flex',
						flexDirection: 'column',
						gap: 18,
					}}
				>
					{/* Pilar 1 */}
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
						<div
							style={{
								background: 'rgba(255, 0, 34, 0.15)',
								border: '1px solid rgba(255, 0, 34, 0.4)',
								borderRadius: 8,
								padding: '6px 10px',
								fontFamily: fontMono,
								fontSize: 12,
								color: '#FF4D6D',
								fontWeight: 800,
								whiteSpace: 'nowrap',
							}}
						>
							01. ENGINE
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<span style={{ fontFamily: fontPlusJakartaSans, fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>
								Remotion + React 18 Puro
							</span>
							<span style={{ fontFamily: fontPlusJakartaSans, fontSize: 15, color: '#94A3B8', lineHeight: 1.4 }}>
								Zero interfaces web lentas. Cada segundo é um componente React programável em 4K e 60 FPS com vetores nativos.
							</span>
						</div>
					</div>

					{/* Pilar 2 */}
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
						<div
							style={{
								background: 'rgba(16, 185, 129, 0.15)',
								border: '1px solid rgba(16, 185, 129, 0.4)',
								borderRadius: 8,
								padding: '6px 10px',
								fontFamily: fontMono,
								fontSize: 12,
								color: '#34D399',
								fontWeight: 800,
								whiteSpace: 'nowrap',
							}}
						>
							02. SYNC
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<span style={{ fontFamily: fontPlusJakartaSans, fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>
								Whisper C++ Local Sub-15ms
							</span>
							<span style={{ fontFamily: fontPlusJakartaSans, fontSize: 15, color: '#94A3B8', lineHeight: 1.4 }}>
								Alinhamento de legendas no milissegundo exato da voz. Roda 100% offline na máquina sem custos de API por minuto.
							</span>
						</div>
					</div>

					{/* Pilar 3 */}
					<div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
						<div
							style={{
								background: 'rgba(56, 189, 248, 0.15)',
								border: '1px solid rgba(56, 189, 248, 0.4)',
								borderRadius: 8,
								padding: '6px 10px',
								fontFamily: fontMono,
								fontSize: 12,
								color: '#38BDF8',
								fontWeight: 800,
								whiteSpace: 'nowrap',
							}}
						>
							03. AGENTES
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<span style={{ fontFamily: fontPlusJakartaSans, fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>
								Orquestração Nativa de Enxame
							</span>
							<span style={{ fontFamily: fontPlusJakartaSans, fontSize: 15, color: '#94A3B8', lineHeight: 1.4 }}>
								Claude Code, OpenAI Codex e Antigravity constroem, alteram e renderizam vídeos inteiros com um único comando de chat.
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* ══════════════ 4. GRID DE MÉTRICAS BRUTALISTAS ══════════════ */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr 1fr',
					gap: 14,
					opacity: Math.min(Math.max(metricsEntrance, 0), 1),
					transform: `scale(${0.97 + metricsEntrance * 0.03})`,
				}}
			>
				<div
					style={{
						background: '#FFFFFF',
						border: '1px solid rgba(0, 0, 0, 0.08)',
						borderRadius: 16,
						padding: '16px 20px',
						boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.04)',
					}}
				>
					<div style={{ fontFamily: fontMono, fontSize: 11, color: '#64748B', fontWeight: 700 }}>
						CUSTO DE API
					</div>
					<div style={{ fontFamily: fontBebas, fontSize: 40, color: '#10B981', marginTop: 2 }}>
						R$ 0,00
					</div>
				</div>

				<div
					style={{
						background: '#FFFFFF',
						border: '1px solid rgba(0, 0, 0, 0.08)',
						borderRadius: 16,
						padding: '16px 20px',
						boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.04)',
					}}
				>
					<div style={{ fontFamily: fontMono, fontSize: 11, color: '#64748B', fontWeight: 700 }}>
						CONTROLE GIT
					</div>
					<div style={{ fontFamily: fontBebas, fontSize: 40, color: '#09090B', marginTop: 2 }}>
						100% CÓDIGO
					</div>
				</div>

				<div
					style={{
						background: '#FFFFFF',
						border: '1px solid rgba(0, 0, 0, 0.08)',
						borderRadius: 16,
						padding: '16px 20px',
						boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.04)',
					}}
				>
					<div style={{ fontFamily: fontMono, fontSize: 11, color: '#64748B', fontWeight: 700 }}>
						LICENÇA
					</div>
					<div style={{ fontFamily: fontBebas, fontSize: 40, color: '#FF0022', marginTop: 2 }}>
						OPEN SOURCE
					</div>
				</div>
			</div>

			{/* ══════════════ 5. FOOTER EDITORIAL INFERIOR ══════════════ */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					paddingTop: 18,
					borderTop: '1px solid rgba(0, 0, 0, 0.08)',
					fontFamily: fontMono,
					fontSize: 18,
					letterSpacing: '0.24em',
					fontWeight: 600,
					textTransform: 'uppercase',
				}}
			>
				<span style={{ color: '#64748B' }}>GABRIEL TOLEDO</span>
				<span style={{ color: '#09090B' }}>ARRASTA PRO LADO  →</span>
			</div>
		</AbsoluteFill>
	);
};
