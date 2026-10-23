import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

const { fontFamily: fontAnton } = loadAnton();
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export interface AdversarialTerminalProps {
	startFrame?: number;
}

export const AdversarialTerminal: React.FC<AdversarialTerminalProps> = ({ startFrame = 405 }) => {
	const currentFrame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Suporta tanto frame global (GenHqReel) quanto frame local isolado
	const frame = currentFrame >= startFrame ? currentFrame - startFrame : currentFrame;

	// Comando digitado (digita entre os frames 5 e 45)
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
	const cursorVisible = Math.floor(frame / 5) % 2 === 0;

	// Entrada das fases sequenciais com molas
	// Beat 7 (global 480 / local 75): Chegada do Builder
	// Beat 9 (global 660 / local 255): Ataque do Red Team
	// Beat 10 (global 760 / local 355): Lock do Árbitro Gemini
	// Beat 11 (global 860 / local 455): Odômetro sobe de 0% a 94.2%
	// Beat 12 (global 960 / local 555): Stamp Slam APROVADO!
	const showBuilder = frame >= 50;
	const showRedTeam = frame >= 240;
	const showReferee = frame >= 340;
	const showApprovalStamp = frame >= 555;

	const builderSpring = spring({
		frame: Math.max(0, frame - 50),
		fps,
		config: { damping: 14, mass: 0.5, stiffness: 180 },
	});

	const redTeamSpring = spring({
		frame: Math.max(0, frame - 240),
		fps,
		config: { damping: 14, mass: 0.5, stiffness: 180 },
	});

	const refereeSpring = spring({
		frame: Math.max(0, frame - 340),
		fps,
		config: { damping: 14, mass: 0.5, stiffness: 180 },
	});

	const stampSpring = spring({
		frame: Math.max(0, frame - 555),
		fps,
		config: { damping: 12, mass: 0.4, stiffness: 220 },
	});

	// Odômetro de Confiança dinâmico contando de 0% a 94.2% entre frame 455 e 550
	const confidenceProgress = interpolate(frame, [455, 550], [0, 94.2], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const displayConfidence = confidenceProgress.toFixed(1);

	// Destaques ativos a cada 3s para reter a atenção
	const isBuilderActive = frame >= 50 && frame < 240;
	const isRedTeamActive = frame >= 240 && frame < 340;
	const isRefereeActive = frame >= 340 && frame < 555;

	return (
		<div
			style={{
				width: 890,
				height: 810,
				borderRadius: 20,
				overflow: 'hidden',
				boxShadow: '0 40px 100px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.25)',
				border: '1.5px solid rgba(255, 255, 255, 0.14)',
				background: '#08090D',
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: 22,
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
						paddingBottom: 12,
					}}
				>
					<div style={{ display: 'flex', gap: 8 }}>
						<div style={{ width: 13, height: 13, borderRadius: '50%', background: '#ff5f56' }} />
						<div style={{ width: 13, height: 13, borderRadius: '50%', background: '#ffbd2e' }} />
						<div style={{ width: 13, height: 13, borderRadius: '50%', background: '#27c93f' }} />
					</div>
					<span style={{ fontFamily: fontMono, fontSize: 13, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}>
						cli-cross-review — adversarial-arena
					</span>
					<div
						style={{
							background: 'rgba(56, 189, 248, 0.15)',
							border: '1px solid rgba(56, 189, 248, 0.4)',
							borderRadius: 6,
							padding: '3px 10px',
							fontFamily: fontMono,
							fontSize: 11,
							color: '#38BDF8',
							fontWeight: 800,
							letterSpacing: 0.5,
						}}
					>
						TRIUNVIRATO IA
					</div>
				</div>

				{/* Linha de Prompt */}
				<div style={{ marginTop: 14 }}>
					<div style={{ fontFamily: fontMono, fontSize: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
						<span style={{ color: '#38BDF8', fontWeight: 800 }}>repo</span>
						<span style={{ color: '#94a3b8' }}>$</span>
						<span style={{ color: '#ffffff', fontWeight: 700 }}>{displayedCommand}</span>
						{cursorVisible && (
							<span style={{ background: '#38BDF8', width: 9, height: 18, display: 'inline-block' }} />
						)}
					</div>
				</div>

				{/* Os 3 Agentes em Batalha Dinâmica */}
				<div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
					{/* Agente 1: Builder (Claude) */}
					{showBuilder && (
						<div
							style={{
								background: isBuilderActive ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.07)',
								border: isBuilderActive ? '1.5px solid #10B981' : '1px solid rgba(16, 185, 129, 0.35)',
								borderRadius: 14,
								padding: 13,
								opacity: builderSpring,
								transform: `translateY(${(1 - builderSpring) * 12}px) scale(${isBuilderActive ? 1.01 : 1.0})`,
								boxShadow: isBuilderActive ? '0 0 25px rgba(16, 185, 129, 0.35)' : 'none',
								transition: 'all 0.2s ease',
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
								<span style={{ fontFamily: fontMono, fontSize: 13, fontWeight: 800, color: '#10B981' }}>
									🟢 1. BUILDER (Claude Sonnet 3.7)
								</span>
								<span style={{ fontFamily: fontMono, fontSize: 11, color: isBuilderActive ? '#10B981' : 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
									{isBuilderActive ? '⚡ GERANDO SOLUÇÃO...' : 'Status: PROPOSTA'}
								</span>
							</div>
							<div style={{ fontFamily: fontMono, fontSize: 12, color: '#D1FAE5', lineHeight: 1.4 }}>
								Refatoração assíncrona gerada: <span style={{ color: '#6EE7B7' }}>src/services/checkout.ts:89</span>
								<br />
								<span style={{ color: '#A7F3D0' }}>+ await lockService.acquire('user_mutex'); • 3 testes unitários injetados</span>
							</div>
						</div>
					)}

					{/* Agente 2: Red Team (Codex) */}
					{showRedTeam && (
						<div
							style={{
								background: isRedTeamActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.08)',
								border: isRedTeamActive ? '1.5px solid #EF4444' : '1px solid rgba(239, 68, 68, 0.4)',
								borderRadius: 14,
								padding: 13,
								opacity: redTeamSpring,
								transform: `translateY(${(1 - redTeamSpring) * 12}px) scale(${isRedTeamActive ? 1.01 : 1.0})`,
								boxShadow: isRedTeamActive ? '0 0 30px rgba(239, 68, 68, 0.4)' : 'none',
								transition: 'all 0.2s ease',
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
								<span style={{ fontFamily: fontMono, fontSize: 13, fontWeight: 800, color: '#EF4444' }}>
									🔴 2. RED TEAM (OpenAI Codex)
								</span>
								<span
									style={{
										fontFamily: fontMono,
										background: '#EF4444',
										color: '#FFFFFF',
										fontSize: 10,
										fontWeight: 800,
										padding: '2px 8px',
										borderRadius: 4,
									}}
								>
									ALERTA CRÍTICO
								</span>
							</div>
							<div style={{ fontFamily: fontMono, fontSize: 12, color: '#FEE2E2', lineHeight: 1.4 }}>
								RACE CONDITION na linha 89! Concorrência em 1.000 req/s causa duplo debito.
								<br />
								<span style={{ color: '#FCA5A5' }}>⚠️ Deadlock potencial em Redis cluster detectado pelo analisador estático.</span>
							</div>
						</div>
					)}

					{/* Agente 3: Árbitro (Gemini) */}
					{showReferee && (
						<div
							style={{
								background: isRefereeActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(56, 189, 248, 0.08)',
								border: isRefereeActive ? '1.5px solid #38BDF8' : '1px solid rgba(56, 189, 248, 0.4)',
								borderRadius: 14,
								padding: 13,
								opacity: refereeSpring,
								transform: `translateY(${(1 - refereeSpring) * 12}px) scale(${isRefereeActive ? 1.01 : 1.0})`,
								boxShadow: isRefereeActive ? '0 0 30px rgba(56, 189, 248, 0.4)' : 'none',
								transition: 'all 0.2s ease',
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
								<span style={{ fontFamily: fontMono, fontSize: 13, fontWeight: 800, color: '#38BDF8' }}>
									🔷 3. REFEREE (Gemini 2.5 Flash)
								</span>
								<span
									style={{
										fontFamily: fontMono,
										background: '#10B981',
										color: '#064E3B',
										fontSize: 10,
										fontWeight: 800,
										padding: '2px 8px',
										borderRadius: 4,
									}}
								>
									APROVADO 94%
								</span>
							</div>
							<div style={{ fontFamily: fontMono, fontSize: 12, color: '#E0F2FE', lineHeight: 1.4 }}>
								Mutex distribuído com TTL atômico injetado. Vulnerabilidade eliminada.
								<br />
								<span style={{ color: '#BAE6FD' }}>✔ Todos os 3 testes adversariais passaram com 94.2% de consenso calibrado!</span>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Rodapé de Métricas em Badges com Odômetro Animado */}
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, position: 'relative' }}>
				<div
					style={{
						background: 'rgba(255, 255, 255, 0.03)',
						border: '1px solid rgba(255, 255, 255, 0.08)',
						borderRadius: 14,
						padding: 12,
						textAlign: 'center',
					}}
				>
					<div style={{ fontFamily: fontMono, fontSize: 10, color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>MODELOS</div>
					<div style={{ fontFamily: fontAnton, fontSize: 24, color: '#38BDF8', marginTop: 2 }}>3 IAs</div>
				</div>
				<div
					style={{
						background: frame >= 455 ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 255, 255, 0.03)',
						border: frame >= 455 ? '1.5px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
						borderRadius: 14,
						padding: 12,
						textAlign: 'center',
						boxShadow: frame >= 500 ? '0 0 25px rgba(16, 185, 129, 0.4)' : 'none',
						transition: 'all 0.3s ease',
					}}
				>
					<div style={{ fontFamily: fontMono, fontSize: 10, color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>CONFIANÇA</div>
					<div style={{ fontFamily: fontAnton, fontSize: 24, color: '#10B981', marginTop: 2 }}>
						{displayConfidence}%
					</div>
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
					<div style={{ fontFamily: fontMono, fontSize: 10, color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600 }}>ALUCINAÇÃO</div>
					<div style={{ fontFamily: fontAnton, fontSize: 24, color: '#EF4444', marginTop: 2 }}>0.0%</div>
				</div>
			</div>

			{/* Carimbo de Vitória de Aprovação (Beat 12 - frame 555 adiante) */}
			{showApprovalStamp && (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						background: 'rgba(8, 9, 13, 0.82)',
						backdropFilter: 'blur(10px)',
						zIndex: 50,
						opacity: stampSpring,
						transform: `scale(${interpolate(stampSpring, [0, 1], [1.5, 1.0])})`,
					}}
				>
					<div
						style={{
							border: '3.5px solid #10B981',
							borderRadius: 22,
							padding: '30px 48px',
							background: 'rgba(6, 78, 59, 0.96)',
							boxShadow: '0 0 70px rgba(16, 185, 129, 0.8), inset 0 0 24px rgba(16, 185, 129, 0.45)',
							textAlign: 'center',
							transform: 'rotate(-4deg)',
						}}
					>
						<div style={{ fontSize: 44 }}>🛡️</div>
						<div
							style={{
								fontFamily: fontAnton,
								fontSize: 38,
								color: '#FFFFFF',
								letterSpacing: 2.5,
								marginTop: 8,
							}}
						>
							CONFIANÇA 94.2%
						</div>
						<div
							style={{
								fontFamily: fontMono,
								fontSize: 15,
								color: '#A7F3D0',
								fontWeight: 800,
								marginTop: 6,
							}}
						>
							✔ BUILD LIBERADO PARA PRODUÇÃO
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
