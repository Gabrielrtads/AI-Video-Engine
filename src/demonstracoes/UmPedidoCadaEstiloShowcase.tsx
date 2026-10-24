import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {
	AudioWaveformCutStage,
	BigHookTopBanner,
	MagazineCoverStage,
	OrbitSplitScreenStage,
} from '../components/editia';
import {MONO, SANS} from '../kit';

const CommandHudBadge: React.FC<{command: string; tag: string}> = ({command, tag}) => (
	<div
		style={{
			position: 'absolute',
			top: 38,
			left: 44,
			right: 44,
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			padding: '12px 22px',
			borderRadius: 999,
			backgroundColor: 'rgba(10, 10, 12, 0.82)',
			border: '1px solid rgba(255, 107, 43, 0.5)',
			backdropFilter: 'blur(12px)',
			zIndex: 99,
		}}
	>
		<span
			style={{
				fontFamily: MONO,
				fontWeight: 700,
				fontSize: 18,
				letterSpacing: '0.12em',
				color: '#FF6B2B',
				textTransform: 'uppercase',
			}}
		>
			{tag}
		</span>
		<span
			style={{
				fontFamily: SANS,
				fontWeight: 700,
				fontSize: 22,
				color: '#FFFFFF',
			}}
		>
			&ldquo;{command}&rdquo;
		</span>
	</div>
);

export const UmPedidoCadaEstiloShowcase: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#0A0806'}}>
			{/* 00s - 03s (Frames 0..90): Estilo 1 — Gancho Grande no Topo + Onda de Erro */}
			<Sequence from={0} durationInFrames={90}>
				<BigHookTopBanner
					lines={['EU GRAVEI', 'ESSE VÍDEO', 'UMA VEZ SÓ']}
					errorWords={['ERREI', 'GAGUEJEI']}
					switchFrame={45}
					videoSrc="video/gabriel_rotoscopiado.webm"
				/>
				<CommandHudBadge
					tag="ESTILO 01 · GANCHO"
					command="Abre com um gancho forte na tela"
				/>
			</Sequence>

			{/* 03s - 06s (Frames 90..180): Estilo 2 — Split-Screen 50/50 + Órbita de Cards */}
			<Sequence from={90} durationInFrames={90}>
				<OrbitSplitScreenStage
					topTitle=""
					captionPrefix="e coloca eles "
					captionHighlight="em volta"
					captionSuffix=" de mim"
					topVideoSrc="video/gabriel_rotoscopiado.webm"
					bottomVideoSrc="video/gabriel_rotoscopiado.webm"
				/>
				<CommandHudBadge
					tag="ESTILO 02 · ÓRBITA SPLIT"
					command="Divide a tela e mostra em órbita"
				/>
			</Sequence>

			{/* 06s - 09s (Frames 180..270): Estilo 3 — Capa de Revista Editorial GQ/Vogue */}
			<Sequence from={180} durationInFrames={90}>
				<MagazineCoverStage
					masthead="CLAUDE"
					kickerTop="UMA FRASE"
					kickerHeadline={'O vídeo inteiro,\neditado.'}
					issueLine="Nº 01  ·  OUTUBRO 2026  ·  EDITADO PELO CLAUDE"
					pillCaption="vira capa de revista."
					solidGreenBackdrop={true}
					videoSrc="video/gabriel_rotoscopiado.webm"
				/>
			</Sequence>

			{/* 09s - 12s (Frames 270..360): Estilo 4 — Motion Explicativo de Onda de Áudio Cortada */}
			<Sequence from={270} durationInFrames={90}>
				<AudioWaveformCutStage
					fileName="bruto.mov"
					durationLabel="2:03"
					scanStartFrame={35}
				/>
				<CommandHudBadge
					tag="ESTILO 04 · MOTION AUDIO"
					command="Explica essa parte com uma animação"
				/>
			</Sequence>
		</AbsoluteFill>
	);
};
