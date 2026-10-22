import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {H, FPS, W} from './kit';
import {FlowMotionMaster} from './FlowMotionMaster';
import {CarrosselEditorial} from './CarrosselEditorial';

const FlowMotionRoot: React.FC = () => (
	<AbsoluteFill style={{background: '#060709'}}>
		<FlowMotionMaster audioNarracao="narracao.mp3" enableSfx={true} />
	</AbsoluteFill>
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
			id="FlowMotionMaster"
			component={FlowMotionRoot}
			durationInFrames={918}
			fps={FPS}
			width={W}
			height={H}
		/>
		<Composition
			id="Video"
			component={FlowMotionRoot}
			durationInFrames={918}
			fps={FPS}
			width={W}
			height={H}
		/>

		{/* Editorial Carousel Composition (Instagram 4:5 - 1080x1350, 30fps, 240 frames) */}
		<Composition
			id="CarrosselEditorial"
			component={CarrosselEditorial}
			durationInFrames={240}
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
