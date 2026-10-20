import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {H, FPS, W} from './kit';
import {FlowMotionMaster} from './FlowMotionMaster';

const FlowMotionRoot: React.FC = () => (
	<AbsoluteFill style={{background: '#060709'}}>
		<FlowMotionMaster />
	</AbsoluteFill>
);

registerRoot(() => (
	<>
		<Composition
			id="FlowMotionMaster"
			component={FlowMotionRoot}
			durationInFrames={825}
			fps={FPS}
			width={W}
			height={H}
		/>
		<Composition
			id="Video"
			component={FlowMotionRoot}
			durationInFrames={825}
			fps={FPS}
			width={W}
			height={H}
		/>
	</>
));
