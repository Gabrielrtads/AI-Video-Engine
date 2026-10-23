import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadPlusJakartaSans } from '@remotion/google-fonts/PlusJakartaSans';

const { fontFamily: fontPlusJakartaSans } = loadPlusJakartaSans('normal', {
	weights: ['600', '700', '800'],
});

const fontMono = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export interface TimelineNode {
	id: number;
	label: string;
	sublabel: string;
	startFrame: number;
	endFrame: number;
	icon: string;
	accentColor: string;
}

const NODES: TimelineNode[] = [
	{
		id: 1,
		label: '01. PERGUNTA',
		sublabel: 'Confia na IA?',
		startFrame: 0,
		endFrame: 140,
		icon: '❓',
		accentColor: '#FFE600',
	},
	{
		id: 2,
		label: '02. O PERIGO',
		sublabel: 'Bugs Invisíveis',
		startFrame: 140,
		endFrame: 405,
		icon: '🚨',
		accentColor: '#EF4444',
	},
	{
		id: 3,
		label: '03. ARENA 3 IAs',
		sublabel: 'Consenso 94%',
		startFrame: 405,
		endFrame: 1134,
		icon: '⚔️',
		accentColor: '#38BDF8',
	},
	{
		id: 4,
		label: '04. GITHUB ⭐',
		sublabel: 'Link "SWARM"',
		startFrame: 1134,
		endFrame: 1600,
		icon: '⭐',
		accentColor: '#F59E0B',
	},
];

export const GenHqTimeline: React.FC = () => {
	const frame = useCurrentFrame();
	const { durationInFrames } = useVideoConfig();

	// Posição percentual do playhead ao longo de toda a duração
	const playheadProgress = interpolate(frame, [0, durationInFrames], [0, 100], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Determina a fase ativa
	const activeIndex = NODES.findIndex(
		(n) => frame >= n.startFrame && frame < n.endFrame
	);
	const activeNode = activeIndex >= 0 ? NODES[activeIndex] : NODES[NODES.length - 1];

	return (
		<div
			style={{
				width: 960,
				background: 'rgba(12, 14, 20, 0.88)',
				backdropFilter: 'blur(16px)',
				border: '1.5px solid rgba(255, 255, 255, 0.1)',
				borderRadius: 20,
				padding: '16px 24px',
				boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				gap: 14,
				boxSizing: 'border-box',
			}}
		>
			{/* Topo da Timeline: Status da Fase Atual */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<div
						style={{
							width: 8,
							height: 8,
							borderRadius: '50%',
							background: activeNode.accentColor,
							boxShadow: `0 0 12px ${activeNode.accentColor}`,
						}}
					/>
					<span
						style={{
							fontFamily: fontMono,
							fontSize: 12,
							fontWeight: 800,
							color: activeNode.accentColor,
							letterSpacing: '0.08em',
						}}
					>
						PIPELINE DE EXECUÇÃO: {activeNode.label}
					</span>
				</div>
				<div
					style={{
						background: 'rgba(255, 255, 255, 0.06)',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						borderRadius: 8,
						padding: '4px 10px',
						fontFamily: fontMono,
						fontSize: 11,
						color: '#94A3B8',
					}}
				>
					PASSOS: 4/4
				</div>
			</div>

			{/* Linha da Timeline com Playhead Animado Estilo Rourke */}
			<div
				style={{
					position: 'relative',
					height: 6,
					background: 'rgba(255, 255, 255, 0.08)',
					borderRadius: 999,
					margin: '4px 0',
				}}
			>
				{/* Preenchimento iluminado */}
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						bottom: 0,
						width: `${playheadProgress}%`,
						background: `linear-gradient(90deg, #38BDF8, ${activeNode.accentColor})`,
						borderRadius: 999,
						boxShadow: `0 0 14px ${activeNode.accentColor}`,
					}}
				/>

				{/* Playhead vertical com laser neon */}
				<div
					style={{
						position: 'absolute',
						left: `${playheadProgress}%`,
						top: -12,
						transform: 'translateX(-50%)',
						width: 4,
						height: 30,
						background: '#FFFFFF',
						borderRadius: 2,
						boxShadow: `0 0 16px 2px ${activeNode.accentColor}, 0 0 30px #FFFFFF`,
						zIndex: 10,
					}}
				/>
			</div>

			{/* Os 4 Cards de Miniatura da Timeline */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(4, 1fr)',
					gap: 12,
				}}
			>
				{NODES.map((node, idx) => {
					const isActive = idx === activeIndex;
					const isPast = idx < activeIndex;

					return (
						<div
							key={node.id}
							style={{
								background: isActive
									? 'rgba(255, 255, 255, 0.08)'
									: isPast
									? 'rgba(255, 255, 255, 0.03)'
									: 'rgba(255, 255, 255, 0.015)',
								border: isActive
									? `1.5px solid ${node.accentColor}`
									: isPast
									? '1px solid rgba(255, 255, 255, 0.15)'
									: '1px solid rgba(255, 255, 255, 0.06)',
								borderRadius: 12,
								padding: '8px 10px',
								boxShadow: isActive ? `0 0 20px ${node.accentColor}35` : 'none',
								transition: 'all 0.2s ease',
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
								overflow: 'hidden',
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
								}}
							>
								<span style={{ fontSize: 16 }}>{node.icon}</span>
								{isPast && (
									<span style={{ color: '#10B981', fontSize: 11, fontWeight: 800 }}>
										✔
									</span>
								)}
								{isActive && (
									<span
										style={{
											background: node.accentColor,
											color: '#000000',
											fontFamily: fontMono,
											fontSize: 9,
											fontWeight: 800,
											padding: '1px 5px',
											borderRadius: 4,
										}}
									>
										ATIVO
									</span>
								)}
							</div>
							<div
								style={{
									fontFamily: fontMono,
									fontSize: 10,
									fontWeight: 700,
									color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
									marginTop: 4,
								}}
							>
								{node.label}
							</div>
							<div
								style={{
									fontFamily: fontPlusJakartaSans,
									fontSize: 11,
									fontWeight: 600,
									color: isActive ? node.accentColor : 'rgba(255, 255, 255, 0.4)',
								}}
							>
								{node.sublabel}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
