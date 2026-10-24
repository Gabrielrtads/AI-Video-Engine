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

export const Slide05Final: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Animação física de entrada em cascata
	const titleEntrance = spring({
		frame: Math.max(0, frame - 2),
		fps,
		config: { damping: 16, mass: 0.7, stiffness: 120 },
	});

	const heroCardEntrance = spring({
		frame: Math.max(0, frame - 10),
		fps,
		config: { damping: 18, mass: 0.8, stiffness: 100 },
	});

	const commentBoxEntrance = spring({
		frame: Math.max(0, frame - 18),
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
							background: '#FF0022',
							color: '#FFFFFF',
							padding: '3px 10px',
							borderRadius: 6,
							fontSize: 14,
							fontWeight: 700,
							letterSpacing: '0.08em',
						}}
					>
						05
					</span>
					<span style={{ color: '#09090B', fontWeight: 700 }}>ACESSO LIVRE</span>
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
					— CUSTO ZERO DE API • 100% MIT LICENSE
				</span>

				<h1
					style={{
						fontFamily: fontBebas,
						fontSize: 108,
						lineHeight: 0.91,
						letterSpacing: '0.01em',
						color: '#09090B',
						margin: 0,
						textTransform: 'uppercase',
					}}
				>
					100% OPEN SOURCE.{' '}
					<span style={{ color: '#FF0022' }}>DEIXE SUA ESTRELA.</span>
				</h1>
			</div>

			{/* ══════════════ 3. HERO CARD GITHUB DO REPOSITÓRIO ══════════════ */}
			<div
				style={{
					background: '#09090B',
					borderRadius: 24,
					padding: '32px 36px',
					boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
					border: '1px solid rgba(0, 0, 0, 0.12)',
					display: 'flex',
					flexDirection: 'column',
					gap: 22,
					opacity: Math.min(Math.max(heroCardEntrance, 0), 1),
					transform: `translateY(${(1 - heroCardEntrance) * 20}px)`,
				}}
			>
				{/* Top Info Repositório */}
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
						<div
							style={{
								width: 44,
								height: 44,
								borderRadius: 12,
								background: '#18181B',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								border: '1px solid rgba(255, 255, 255, 0.1)',
							}}
						>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
								<path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
							</svg>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							<span style={{ fontFamily: fontMono, fontSize: 13, color: '#A1A1AA' }}>
								github.com/Gabrielrtads
							</span>
							<span style={{ fontFamily: fontPlusJakartaSans, fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>
								vibe-design-studio
							</span>
						</div>
					</div>

					{/* Contador de Estrelas */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 10,
							background: 'rgba(245, 158, 11, 0.15)',
							border: '1px solid rgba(245, 158, 11, 0.4)',
							borderRadius: 12,
							padding: '8px 18px',
						}}
					>
						<span style={{ fontSize: 26 }}>⭐</span>
						<span
							style={{
								fontFamily: fontBebas,
								fontSize: 36,
								color: '#FBBF24',
								letterSpacing: '0.04em',
								marginTop: 2,
							}}
						>
							STAR
						</span>
					</div>
				</div>

				{/* Caixa de Instalação 1-Click */}
				<div
					style={{
						background: '#16161B',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						borderRadius: 14,
						padding: '16px 20px',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<span
						style={{
							fontFamily: fontMono,
							fontSize: 16,
							color: '#FFFFFF',
							fontWeight: 700,
						}}
					>
						$ npx skills add Gabrielrtads/vibe-design-studio
					</span>
					<div
						style={{
							background: '#FF0022',
							color: '#FFFFFF',
							borderRadius: 8,
							padding: '6px 14px',
							fontFamily: fontMono,
							fontSize: 12,
							fontWeight: 800,
							letterSpacing: '0.08em',
						}}
					>
						COPIAR
					</div>
				</div>

				{/* Os 3 Agentes Suportados */}
				<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
					<span style={{ fontFamily: fontMono, fontSize: 11, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
						COMPATIBILIDADE NATIVA DE ENXAME:
					</span>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
						<div
							style={{
								background: 'rgba(245, 158, 11, 0.12)',
								border: '1px solid rgba(245, 158, 11, 0.3)',
								borderRadius: 10,
								padding: '10px 12px',
								textAlign: 'center',
								fontFamily: fontMono,
								fontSize: 12,
								color: '#FBBF24',
								fontWeight: 700,
							}}
						>
							Claude Code
						</div>
						<div
							style={{
								background: 'rgba(16, 185, 129, 0.12)',
								border: '1px solid rgba(16, 185, 129, 0.3)',
								borderRadius: 10,
								padding: '10px 12px',
								textAlign: 'center',
								fontFamily: fontMono,
								fontSize: 12,
								color: '#34D399',
								fontWeight: 700,
							}}
						>
							OpenAI Codex
						</div>
						<div
							style={{
								background: 'rgba(56, 189, 248, 0.12)',
								border: '1px solid rgba(56, 189, 248, 0.3)',
								borderRadius: 10,
								padding: '10px 12px',
								textAlign: 'center',
								fontFamily: fontMono,
								fontSize: 12,
								color: '#38BDF8',
								fontWeight: 700,
							}}
						>
							Antigravity
						</div>
					</div>
				</div>
			</div>

			{/* ══════════════ 4. GATILHO DE ENGAJAMENTO (COMENTE VIBE) ══════════════ */}
			<div
				style={{
					background: '#FF0022',
					borderRadius: 22,
					padding: '24px 32px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					boxShadow: '0 20px 45px -10px rgba(255, 0, 34, 0.35)',
					opacity: Math.min(Math.max(commentBoxEntrance, 0), 1),
					transform: `scale(${0.97 + commentBoxEntrance * 0.03})`,
				}}
			>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
					<span
						style={{
							fontFamily: fontPlusJakartaSans,
							fontSize: 22,
							fontWeight: 800,
							color: '#FFFFFF',
							letterSpacing: '0.04em',
							textTransform: 'uppercase',
						}}
					>
						COMENTE "VIBE" AQUI EMBAIXO
					</span>
					<span
						style={{
							fontFamily: fontPlusJakartaSans,
							fontSize: 16,
							fontWeight: 600,
							color: 'rgba(255, 255, 255, 0.9)',
							lineHeight: 1.3,
						}}
					>
						Para receber o link direto do repositório e o comando de instalação no seu Direct.
					</span>
				</div>

				<div
					style={{
						background: '#FFFFFF',
						color: '#09090B',
						padding: '14px 22px',
						borderRadius: 14,
						fontFamily: fontBebas,
						fontSize: 28,
						letterSpacing: '0.06em',
						whiteSpace: 'nowrap',
						boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
					}}
				>
					VIBE ⚡
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
				<span style={{ color: '#09090B', fontWeight: 700 }}>SALVA ESTE POST  📌</span>
			</div>
		</AbsoluteFill>
	);
};
