import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SANS} from './kit';

interface CardDef {
	tag: string;
	title: string;
	subtitle: string;
	start: number;
	end: number;
	position?: 'bottom' | 'top_center';
}

const CARDS: CardDef[] = [
	{
		tag: 'APPLE INTELLIGENCE STYLE',
		title: '100% Feito com IA.',
		subtitle: 'Sem edição manual · Zero timeline',
		start: 1.0,
		end: 4.0,
		position: 'bottom',
	},
	{
		tag: 'MOTION GRAPHICS 3D',
		title: 'Elementos em Tempo Real.',
		subtitle: 'Geometria sincronizada com a fala',
		start: 5.6,
		end: 12.0,
		position: 'bottom',
	},
	{
		tag: 'HOLOGRAFIA ESPACIAL',
		title: 'Planeta na Mão 🪐',
		subtitle: 'Ancorado na concha das mãos',
		start: 14.2,
		end: 22.5,
		position: 'top_center', // Fica no terço superior para dar destaque total ao planeta na mão
	},
	{
		tag: 'ANTIGRAVITY ENGINE',
		title: '100% Autônomo.',
		subtitle: 'Direção, cortes e áudio por IA',
		start: 24.8,
		end: 29.8,
		position: 'bottom',
	},
];

export const AppleKineticCards: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const t = frame / fps;

	return (
		<div style={{position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 80}}>
			{CARDS.map((card, idx) => {
				const startFrame = Math.round(card.start * fps);
				const endFrame = Math.round(card.end * fps);
				const duration = endFrame - startFrame;

				if (frame < startFrame - 5 || frame > endFrame + 15) {
					return null;
				}

				// Entrada com Spring elegante
				const enterSpring = spring({
					frame: frame - startFrame,
					fps,
					config: {damping: 15, mass: 0.6, stiffness: 130},
				});

				// Saída suave
				const exitProgress = interpolate(frame, [endFrame - 10, endFrame], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});

				const opacity = enterSpring * (1 - exitProgress);
				const translateY = (1 - enterSpring) * 35 + exitProgress * -25;
				const scale = interpolate(enterSpring, [0, 1], [0.94, 1.0]) * (1 - exitProgress * 0.05);

				// Posição vertical calculada: se top_center, fica no teto limpo (155px) sem encostar no rosto
				const topPos = card.position === 'top_center' ? 155 : height * 0.72;

				return (
					<div
						key={idx}
						style={{
							position: 'absolute',
							left: '50%',
							top: topPos,
							transform: `translateX(-50%) translateY(${translateY}px) scale(${scale})`,
							opacity,
							width: width * 0.84,
							borderRadius: 24,
							background: 'rgba(12, 14, 20, 0.82)',
							backdropFilter: 'blur(30px)',
							WebkitBackdropFilter: 'blur(30px)',
							border: '1px solid rgba(255, 255, 255, 0.16)',
							boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.35)',
							padding: '28px 36px',
							textAlign: 'center',
						}}
					>
						{/* Tag Pill Minimalista */}
						<div
							style={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 8,
								padding: '5px 14px',
								borderRadius: 999,
								background: 'rgba(255, 255, 255, 0.08)',
								border: '1px solid rgba(255, 255, 255, 0.14)',
								marginBottom: 12,
							}}
						>
							<span
								style={{
									width: 6,
									height: 6,
									borderRadius: '50%',
									background: '#38BDF8',
									boxShadow: '0 0 6px #38BDF8',
								}}
							/>
							<span
								style={{
									fontFamily: SANS,
									fontSize: 13,
									fontWeight: 600,
									color: 'rgba(255, 255, 255, 0.85)',
									letterSpacing: '0.12em',
									textTransform: 'uppercase',
								}}
							>
								{card.tag}
							</span>
						</div>

						{/* Título Principal Apple Style */}
						<div
							style={{
								fontFamily: SANS,
								fontSize: 42,
								fontWeight: 700,
								color: '#FFFFFF',
								letterSpacing: '-0.03em',
								lineHeight: 1.15,
								marginBottom: 8,
							}}
						>
							{card.title}
						</div>

						{/* Subtítulo Clean */}
						<div
							style={{
								fontFamily: SANS,
								fontSize: 19,
								fontWeight: 400,
								color: 'rgba(255, 255, 255, 0.65)',
								letterSpacing: '-0.01em',
							}}
						>
							{card.subtitle}
						</div>
					</div>
				);
			})}
		</div>
	);
};
