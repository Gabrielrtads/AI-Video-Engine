import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const GenHqHeader: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Configuração dinâmica por Ato Narrativo
	let badgeText = 'v2.4';
	let badgeColor = '#22C55E';
	let badgeBg = 'rgba(34, 197, 94, 0.15)';
	let badgeBorder = 'rgba(34, 197, 94, 0.4)';
	let subtitleText = 'Você Realmente Confia na sua IA?';
	let subtitleColor = '#FFE600';

	if (frame >= 140 && frame < 405) {
		badgeText = 'BUGS ❌';
		badgeColor = '#EF4444';
		badgeBg = 'rgba(239, 68, 68, 0.15)';
		badgeBorder = 'rgba(239, 68, 68, 0.4)';
		subtitleText = 'Bugs Invisíveis em Produção';
		subtitleColor = '#FCA5A5';
	} else if (frame >= 405 && frame < 720) {
		badgeText = 'OPEN SOURCE';
		badgeColor = '#38BDF8';
		badgeBg = 'rgba(56, 189, 248, 0.15)';
		badgeBorder = 'rgba(56, 189, 248, 0.4)';
		subtitleText = 'Revisão Cruzada Adversarial em Tempo Real';
		subtitleColor = '#38BDF8';
	} else if (frame >= 720 && frame < 1134) {
		badgeText = '3 IAs EM GUERRA';
		badgeColor = '#10B981';
		badgeBg = 'rgba(16, 185, 129, 0.15)';
		badgeBorder = 'rgba(16, 185, 129, 0.4)';
		subtitleText = 'Builder vs Red Team vs Referee no Terminal';
		subtitleColor = '#86EFAC';
	} else if (frame >= 1134) {
		badgeText = 'ESTRELA NO GITHUB ⭐';
		badgeColor = '#F59E0B';
		badgeBg = 'rgba(245, 158, 11, 0.15)';
		badgeBorder = 'rgba(245, 158, 11, 0.4)';
		subtitleText = 'Comente "SWARM" para Receber o Link Direto';
		subtitleColor = '#FDE047';
	}

	const transitionSpring = spring({
		frame: frame % 150,
		fps,
		config: { damping: 16, mass: 0.5, stiffness: 160 },
	});

	return (
		<div
			style={{
				width: 960,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				textAlign: 'center',
				gap: 10,
				boxSizing: 'border-box',
			}}
		>
			{/* Linha Superior: Logo + Título Principal + Badge Pill */}
			<div
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: 14,
				}}
			>
				{/* Ícone Vetorial de Código / Terminal */}
				<div
					style={{
						width: 42,
						height: 42,
						borderRadius: 12,
						background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
						border: '1px solid rgba(255,255,255,0.15)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
					}}
				>
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
						<polyline points="4 17 10 11 4 5" />
						<line x1="12" y1="19" x2="20" y2="19" />
					</svg>
				</div>

				{/* Título Principal */}
				<span
					style={{
						fontFamily: fontPlusJakartaSans,
						fontSize: 44,
						fontWeight: 800,
						color: '#FFFFFF',
						letterSpacing: '-0.02em',
						lineHeight: 1,
						textShadow: '0 4px 20px rgba(0,0,0,0.8)',
					}}
				>
					CLI Cross Review
				</span>

				{/* Badge Pill com Glow */}
				<div
					style={{
						background: badgeBg,
						border: `1.5px solid ${badgeBorder}`,
						borderRadius: 999,
						padding: '6px 14px',
						fontFamily: fontMono,
						fontSize: 12,
						fontWeight: 800,
						color: badgeColor,
						letterSpacing: '0.04em',
						boxShadow: `0 0 16px ${badgeColor}30`,
						transform: `scale(${interpolate(transitionSpring, [0, 1], [0.96, 1])})`,
					}}
				>
					{badgeText}
				</div>
			</div>

			{/* Subtítulo Temático com Destaque de Cor */}
			<div
				style={{
					fontFamily: fontPlusJakartaSans,
					fontSize: 24,
					fontWeight: 700,
					color: subtitleColor,
					letterSpacing: '-0.01em',
					textShadow: `0 0 25px ${subtitleColor}40`,
					lineHeight: 1.2,
				}}
			>
				{subtitleText}
			</div>
		</div>
	);
};
