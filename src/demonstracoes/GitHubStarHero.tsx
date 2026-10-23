import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadAnton } from '@remotion/google-fonts/Anton';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

const { fontFamily: fontAnton } = loadAnton();
const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export interface GitHubStarHeroProps {
	repoName?: string;
	installCommand?: string;
	ctaWord?: string;
	ctaSubtitle?: string;
	initialStars?: number;
}

export const GitHubStarHero: React.FC<GitHubStarHeroProps> = ({
	repoName = 'vibe-design-studio',
	installCommand = '$ npx skills add Gabrielrtads/vibe-design-studio',
	ctaWord = 'VIBE',
	ctaSubtitle = 'Para receber o link direto e comando no seu Direct.',
	initialStars = 1481,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Animação do cursor de mouse do Mac entrando e clicando na estrela aos 28 frames
	const clickFrame = 28;
	const cursorSpring = spring({
		frame: Math.min(frame, clickFrame),
		fps,
		config: { damping: 18, mass: 0.6, stiffness: 120 },
	});

	const cursorX = interpolate(cursorSpring, [0, 1], [300, 195]);
	const cursorY = interpolate(cursorSpring, [0, 1], [350, 68]);

	const isClicked = frame >= clickFrame;
	const clickPopSpring = spring({
		frame: Math.max(0, frame - clickFrame),
		fps,
		config: { damping: 12, mass: 0.4, stiffness: 200 },
	});

	const buttonScale = isClicked ? interpolate(clickPopSpring, [0, 1], [0.92, 1.05]) : 1.0;
	const starNumber = isClicked ? initialStars + 1 : initialStars;
	const rippleScale = isClicked ? interpolate(clickPopSpring, [0, 1], [0.8, 2.4]) : 0;
	const rippleOpacity = isClicked ? interpolate(clickPopSpring, [0, 0.4, 1], [0.8, 0.4, 0]) : 0;

	return (
		<div
			style={{
				width: 580,
				height: 725,
				borderRadius: 26,
				overflow: 'hidden',
				boxShadow: '0 40px 100px -15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(245, 158, 11, 0.35)',
				border: '1.5px solid rgba(245, 158, 11, 0.45)',
				background: '#0B0C10',
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: 28,
				boxSizing: 'border-box',
			}}
		>
			{/* Top Bar do Repositório */}
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 8,
						background: 'rgba(245, 158, 11, 0.15)',
						border: '1px solid rgba(245, 158, 11, 0.35)',
						borderRadius: 999,
						padding: '6px 14px',
						fontFamily: fontMono,
						fontSize: 12,
						color: '#fbbf24',
						fontWeight: 700,
					}}
				>
					<span>⭐</span> 100% OPEN SOURCE • MIT LICENSE
				</div>
				<span style={{ fontFamily: fontMono, fontSize: 12, color: '#34d399', fontWeight: 700 }}>
					CUSTO ZERO DE API
				</span>
			</div>

			{/* Cartão Oficial do Repositório GitHub com Botão Star Interativo */}
			<div
				style={{
					background: 'rgba(255, 255, 255, 0.03)',
					border: '1px solid rgba(255, 255, 255, 0.1)',
					borderRadius: 22,
					padding: 24,
					display: 'flex',
					flexDirection: 'column',
					gap: 16,
					position: 'relative',
				}}
			>
				{/* Header do Repo */}
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
						<svg height="32" viewBox="0 0 16 16" width="32" fill="#ffffff">
							<path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
						</svg>
						<div>
							<div style={{ fontFamily: fontMono, fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>
								Gabrielrtads /
							</div>
							<div style={{ fontFamily: fontPlusJakartaSans, fontSize: 16, color: '#ffffff', fontWeight: 800 }}>
								{repoName}
							</div>
						</div>
					</div>

					{/* Botão Star com Clique Interativo e Ripple */}
					<div style={{ position: 'relative' }}>
						{/* Ripple de clique em partículas */}
						<div
							style={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								width: 50,
								height: 50,
								borderRadius: '50%',
								background: 'rgba(245, 158, 11, 0.4)',
								transform: `translate(-50%, -50%) scale(${rippleScale})`,
								opacity: rippleOpacity,
								pointerEvents: 'none',
							}}
						/>

						<div
							style={{
								background: isClicked ? '#fbbf24' : 'rgba(255, 255, 255, 0.08)',
								color: isClicked ? '#0a0a0f' : '#ffffff',
								border: '1px solid rgba(245, 158, 11, 0.6)',
								borderRadius: 10,
								padding: '8px 16px',
								display: 'flex',
								alignItems: 'center',
								gap: 8,
								fontFamily: fontMono,
								fontSize: 13,
								fontWeight: 800,
								transform: `scale(${buttonScale})`,
								boxShadow: isClicked ? '0 0 25px rgba(245, 158, 11, 0.6)' : 'none',
							}}
						>
							<span>★</span>
							<span>Star</span>
							<span
								style={{
									borderLeft: `1px solid ${isClicked ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'}`,
									paddingLeft: 8,
								}}
							>
								{starNumber}
							</span>
						</div>
					</div>
				</div>

				{/* Cursor físico de mouse do Mac animado */}
				<div
					style={{
						position: 'absolute',
						top: cursorY,
						left: cursorX,
						pointerEvents: 'none',
						zIndex: 30,
						filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
						transform: isClicked ? 'scale(0.85)' : 'scale(1)',
					}}
				>
					<svg width="22" height="28" viewBox="0 0 17 22" fill="none">
						<path
							d="M1 1L6.5 20.5L9.5 13L16 11.5L1 1Z"
							fill="#ffffff"
							stroke="#000000"
							strokeWidth="1.5"
							strokeLinejoin="round"
						/>
					</svg>
				</div>

				{/* Caixa de Comando Copiável */}
				<div
					style={{
						background: '#040508',
						border: '1px solid rgba(255, 255, 255, 0.08)',
						borderRadius: 14,
						padding: '12px 16px',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<span style={{ fontFamily: fontMono, fontSize: 13, color: '#f8fafc', fontWeight: 600 }}>
						{installCommand}
					</span>
					<div
						style={{
							background: isClicked ? '#10B981' : '#FF0022',
							color: '#ffffff',
							borderRadius: 8,
							padding: '6px 12px',
							fontFamily: fontMono,
							fontSize: 11,
							fontWeight: 800,
						}}
					>
						{isClicked ? 'COPIADO! ✔' : 'COPIAR'}
					</div>
				</div>
			</div>

			{/* Card CTA Ferrari Red de Conversão */}
			<div
				style={{
					background: '#FF0022',
					borderRadius: 20,
					padding: '18px 24px',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					boxShadow: '0 15px 40px rgba(255, 0, 34, 0.45)',
				}}
			>
				<div>
					<div style={{ fontFamily: fontAnton, fontSize: 22, color: '#ffffff', letterSpacing: '0.04em' }}>
						COMENTE "{ctaWord}" AQUI EMBAIXO
					</div>
					<div
						style={{
							fontFamily: fontPlusJakartaSans,
							fontSize: 12,
							color: 'rgba(255, 255, 255, 0.9)',
							marginTop: 2,
						}}
					>
						{ctaSubtitle}
					</div>
				</div>
				<div
					style={{
						background: '#ffffff',
						color: '#FF0022',
						borderRadius: 12,
						padding: '10px 18px',
						fontFamily: fontPlusJakartaSans,
						fontSize: 14,
						fontWeight: 800,
					}}
				>
					{ctaWord} ⚡
				</div>
			</div>
		</div>
	);
};
