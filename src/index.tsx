import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {H, FPS, W} from './kit';
import {FlowMotionMaster} from './FlowMotionMaster';
import {FullBleedShowcase} from './FullBleedShowcase';
import {CarrosselEditorial} from './CarrosselEditorial';
import {Slide02Diagnostico} from './Slide02Diagnostico';
import {Slide03Solucao} from './Slide03Solucao';
import {Slide04Engenharia} from './Slide04Engenharia';
import {Slide05Final} from './Slide05Final';

const FlowMotionRoot: React.FC = () => (
	<AbsoluteFill style={{background: '#060709'}}>
		<FlowMotionMaster audioNarracao="narracao_thalita.mp3" enableSfx={true} />
	</AbsoluteFill>
);

const FullBleedRoot: React.FC = () => (
	<AbsoluteFill style={{background: '#050608'}}>
		<FullBleedShowcase audioNarracao="narracao_thalita.mp3" enableSfx={true} />
	</AbsoluteFill>
);

// ────────────────────────────────────────────────────────────────────────────
// CARROSSEL EDITORIAL — SLIDE 01 (CAPA / HOOK)
// Brutalismo de Alto Contraste (P&B + Vermelho Ferrari)
// ────────────────────────────────────────────────────────────────────────────
export const Slide01Capa: React.FC = () => (
	<CarrosselEditorial
		headerTagLeft="VIBE DESIGN STUDIO × AGENTES"
		headerTagRight="ESTÚDIO HEADLESS"
		categoryTag="— CRIATIVO 100% EM CÓDIGO PURO"
		categoryColor="#FF0022"
		titleLine1="O FIM DOS"
		titleLine2="VÍDEOS DE IA"
		titleLine3="SEM"
		highlightWord="ALMA"
		gradientColors={['#FF0022', '#FF3355', '#FF0022']}
		subtitle="Adeus plataformas no-code travadas e gradientes roxos genéricos. Conheça o estúdio criativo headless em Remotion + React para agentes criarem vídeos direto do terminal."
		subtitleColor="#475569"
		backgroundColor="#FCFCFD"
		textColor="#09090B"
		badgeNumber="01"
		badgeOthers="02  03  04  05"
		badgeOthersColor="rgba(255, 255, 255, 0.75)"
		badgeCategory="ZERO SLOP"
		badgeCategoryColor="#FFFFFF"
		stageHighlightWord="SEM SLOP"
		stageRepeatedWord="CÓDIGO PURO"
		stageWatermarkColor="rgba(255, 255, 255, 0.18)"
		stageBgColor="#FF0022"
		stageTextColor="#FFFFFF"
		underlineColor="#09090B"
		footerAuthor="GABRIEL TOLEDO"
		footerAction="ARRASTA  →"
	/>
);

// ────────────────────────────────────────────────────────────────────────────
// DYNAMIC TEMPLATE REGISTRY
// Auto-evolved templates are registered here and synchronized
// ────────────────────────────────────────────────────────────────────────────
export interface RegisteredComposition {
	id: string;
	component: React.FC<any>;
	durationInFrames: number;
	fps: number;
	width: number;
	height: number;
}

export const dynamicTemplateRegistry: RegisteredComposition[] = [];

registerRoot(() => (
	<>
		{/* Core Motion Master Compositions */}
		<Composition
			id="FullBleedShowcase"
			component={FullBleedRoot}
			durationInFrames={900}
			fps={FPS}
			width={W}
			height={H}
		/>
		<Composition
			id="Video"
			component={FullBleedRoot}
			durationInFrames={900}
			fps={FPS}
			width={W}
			height={H}
		/>
		<Composition
			id="FlowMotionMaster"
			component={FlowMotionRoot}
			durationInFrames={900}
			fps={FPS}
			width={W}
			height={H}
		/>

		{/* Editorial Carousel Compositions (Instagram 4:5 - 1080x1350, 30fps) */}
		<Composition
			id="Slide01Capa"
			component={Slide01Capa}
			durationInFrames={120}
			fps={30}
			width={1080}
			height={1350}
		/>
		<Composition
			id="Slide02Diagnostico"
			component={Slide02Diagnostico}
			durationInFrames={120}
			fps={30}
			width={1080}
			height={1350}
		/>
		<Composition
			id="Slide03Solucao"
			component={Slide03Solucao}
			durationInFrames={120}
			fps={30}
			width={1080}
			height={1350}
		/>
		<Composition
			id="Slide04Engenharia"
			component={Slide04Engenharia}
			durationInFrames={120}
			fps={30}
			width={1080}
			height={1350}
		/>
		<Composition
			id="Slide05Final"
			component={Slide05Final}
			durationInFrames={120}
			fps={30}
			width={1080}
			height={1350}
		/>
		<Composition
			id="CarrosselEditorial"
			component={Slide01Capa}
			durationInFrames={120}
			fps={30}
			width={1080}
			height={1350}
		/>

		{/* Dynamic Template Compositions */}
		{dynamicTemplateRegistry.map((tpl) => (
			<Composition
				key={tpl.id}
				id={tpl.id}
				component={tpl.component}
				durationInFrames={tpl.durationInFrames}
				fps={tpl.fps}
				width={tpl.width}
				height={tpl.height}
			/>
		))}
	</>
));
