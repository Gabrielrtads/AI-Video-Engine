import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

const { fontFamily: fontAnton } = loadAnton();
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const AdversarialTerminal: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Comando digitado
	const fullCommand = 'npx cli-cross-review --adversarial';
	const typingFrames = 35;
	const charsTyped = Math.min(
		fullCommand.length,
		Math.floor(
			interpolate(frame, [5, 5 + typingFrames], [0, fullCommand.length], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})
		)
	);
	const displayedCommand = fullCommand.slice(0, charsTyped);
	const cursorVisible = Math.floor(frame / 6) % 2 === 0;

	// Entrada das fases
	const showBuilder = frame >= 48;
	const showRedTeam = frame >= 110;
	const showReferee = frame >= 180;

	const builderSpring = spring({
		frame: Math.max(0, frame - 48),
		fps,
		config: { damping: 14, mass: 0.5, stiffness: 140 },
	});

	const redTeamSpring = spring({
		frame: Math.max(0, frame - 110),
		fps,
		config: { damping: 14, mass: 0.5, stiffness: 140 },
	});

	const refereeSpring = spring({
		frame: Math.max(0, frame - 180),
		fps,
		config: { damping: 14, mass: 0.5, stiffness: 160 },
	});

	return (
		<div
			style={{
				width: 620,
				height: 780,
				borderRadius: 24,
				overflow: 'hidden',
				boxShadow: '0 40px 100px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.25)',
				border: '1.5px solid rgba(255, 255, 255, 0.14)',
				background: '#08090D',
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: 24,
				boxSizing: 'border-box',
			}}
		>
			{/* Top Bar macOS */}
			<div>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
						paddingBottom: 14,
					}}
				>
					<div style={{ display: 'flex', gap: 8 }}>
						<div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
						<div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
						<div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
					</div>
					<span style={{ fontFamily: fontMono, fontSize: 12, color: 'rgba(255, 255, 255, 0.5)' }}>
						cli-cross-review — adversarial-arena
					</span>
					<div
						style={{
							background: 'rgba(56, 189, 248, 0.15)',
							border: '1px solid rgba(56, 189, 248, 0.4)',
							borderRadius: 999,
							padding: '2px 8px',
							fontFamily: fontMono,
							fontSize: 10,
							color: '#38BDF8',
							fontWeight: 700,
						}}
					>
						TRIUNVIRATO IA
					</div>
				</div>

				{/* Prompt Command Line */}
				<div
					style={{
						marginTop: 16,
						fontFamily: fontMono,
						fontSize: 13,
						lineHeight: 1.5,
						color: '#f8fafc',
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<span style={{ color: '#10B981', fontWeight: 800 }}>➜</span>
						<span style={{ color: '#38BDF8', fontWeight: 700 }}>repo</span>
						<span style={{ color: '#94a3b8' }}>$</span>
						<span style={{ color: '#ffffff', fontWeight: 600 }}>{displayedCommand}</span>
						{cursorVisible && (
							<span style={{ background: '#38BDF8', width: 8, height: 16, display: 'inline-block' }} />
						)}
					</div>
				</div>

				{/* Os 3 Agentes em Batalha */}
				<div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
					{/* Agente 1: Builder */}
					{showBuilder && (
						<div
							style={{
								background: 'rgba(16, 185, 129, 0.08)',
								border: '1px solid rgba(16, 185, 129, 0.35)',
								borderRadius: 12,
								padding: 12,
								opacity: builderSpring,
								transform: `translateY(${(1 - builderSpring) * 12}px)`,
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
								<span style={{ fontFamily: fontMono, fontSize: 11, fontWeight: 700, color: '#10B981' }}>
									🟢 1. BUILDER (Claude Sonnet 3.7)
								</span>
								<span style={{ fontFamily: fontMono, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
									Status: PROPOSTA
								</span>
							</div>
							<div style={{ fontFamily: fontMono, fontSize: 11, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
								Desenhou rota assíncrona de webhook com buffer Redis e chave de idempotência.
							</div>
						</div>
					)}

					{/* Agente 2: Red Team */}
					{showRedTeam && (
						<div
							style={{
								background: 'rgba(239, 68, 68, 0.08)',
								border: '1px solid rgba(239, 68, 68, 0.4)',
								borderRadius: 12,
								padding: 12,
								opacity: redTeamSpring,
								transform: `translateY(${(1 - redTeamSpring) * 12}px)`,
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
								<span style={{ fontFamily: fontMono, fontSize: 11, fontWeight: 700, color: '#EF4444' }}>
									🔴 2. RED TEAM (OpenAI Codex)
								</span>
								<span style={{ fontFamily: fontMono, fontSize: 10, color: '#EF4444', fontWeight: 700 }}>
									ATAQUE ATIVO ⚔️
								</span>
							</div>
							<div style={{ fontFamily: fontMono, fontSize: 11, color: '#FCA5A5', lineHeight: 1.4 }}>
								🚨 Falha detectada: Race condition na linha 38! Se dois requests chegarem juntos, há duplicidade.
							</div>
						</div>
					)}

					{/* Agente 3: Referee */}
					{showReferee && (
						<div
							style={{
								background: 'rgba(56, 189, 248, 0.1)',
								border: '1.5px solid rgba(56, 189, 248, 0.55)',
								borderRadius: 12,
								padding: 12,
								opacity: refereeSpring,
								transform: `translateY(${(1 - refereeSpring) * 12}px)`,
								boxShadow: '0 0 25px rgba(56, 189, 248, 0.2)',
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
								<span style={{ fontFamily: fontMono, fontSize: 11, fontWeight: 700, color: '#38BDF8' }}>
									⚖️ 3. REFEREE (Gemini Flash)
								</span>
								<span
									style={{
										background: '#10B981',
										color: '#000',
										fontFamily: fontMono,
										fontSize: 10,
										fontWeight: 800,
										padding: '1px 6px',
										borderRadius: 4,
									}}
								>
									APROVADO 94%
								</span>
							</div>
							<div style={{ fontFamily: fontMono, fontSize: 11, color: '#E0F2FE', lineHeight: 1.4 }}>
								Lock distribuído atômico injetado. Vulnerabilidade eliminada. Build liberado com 94% de confiança!
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Rodapé de Métricas em Badges */}
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
				<div
					style={{
						background: 'rgba(255, 255, 255, 0.03)',
						border: '1px solid rgba(255, 255, 255, 0.08)',
						borderRadius: 12,
						padding: 10,
						textAlign: 'center',
					}}
				>
					<div style={{ fontFamily: fontMono, fontSize: 9, color: 'rgba(255, 255, 255, 0.5)' }}>MODELOS</div>
					<div style={{ fontFamily: fontAnton, fontSize: 20, color: '#38BDF8', marginTop: 2 }}>3 IAs</div>
				</div>
				<div
					style={{
						background: 'rgba(255, 255, 255, 0.03)',
						border: '1px solid rgba(255, 255, 255, 0.08)',
						borderRadius: 12,
						padding: 10,
						textAlign: 'center',
					}}
				>
					<div style={{ fontFamily: fontMono, fontSize: 9, color: 'rgba(255, 255, 255, 0.5)' }}>CONFIANÇA</div>
					<div style={{ fontFamily: fontAnton, fontSize: 20, color: '#10B981', marginTop: 2 }}>94.2%</div>
				</div>
				<div
					style={{
						background: 'rgba(255, 255, 255, 0.03)',
						border: '1px solid rgba(255, 255, 255, 0.08)',
						borderRadius: 12,
						padding: 10,
						textAlign: 'center',
					}}
				>
					<div style={{ fontFamily: fontMono, fontSize: 9, color: 'rgba(255, 255, 255, 0.5)' }}>ALUCINAÇÃO</div>
					<div style={{ fontFamily: fontAnton, fontSize: 20, color: '#EF4444', marginTop: 2 }}>0.0%</div>
				</div>
			</div>
		</div>
	);
};
