import React, {useMemo, useRef, useEffect} from 'react';
import {
	AbsoluteFill,
	Audio,
	interpolate,
	random,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import WORDS_DATA from './data/words.json';
import {
	ci,
	lerp,
	EASE,
	E_IN,
	E_IO,
	E_OUT,
	MONO,
	SANS,
	SERIF,
	AutoImpactTrack,
	SoundImpactTrigger,
	KineticWordCaption,
} from './kit';

// ════════════════════════════════════════════════════════════════════════════
// VIBE DESIGN STUDIO — SHOWCASE REEL PONTILHISMO 3D (30.6s @ 30 FPS = 918 FRAMES)
// Direção Visual: Pontilhismo Matemático Contínuo & Live Terminal & Orquestração Multiagente
// Estética: Luxo P&B Nobre (#050505 & #EDEBE6) + Instrument Serif + JetBrains Mono
// ════════════════════════════════════════════════════════════════════════════

const W = 1080;
const H = 1920;
const CENTER_X = 540;
const CENTER_Y = 880;
const TAU = Math.PI * 2;
const N_POINTS = 3800;

type P5 = [number, number, number, number, number, string]; // x, y, z, raio, opacidade, cor

// Sementes determinísticas para consistência absoluta frame a frame
const R = Array.from({length: N_POINTS}, (_, i) => ({
	a: random('pa' + i),
	b: random('pb' + i),
	c: random('pc' + i),
	d: random('pd' + i),
}));

// Paleta Nobre de Pontilhismo de IA
const COLOR_WHITE = '#EDEBE6';
const COLOR_GOLD = '#FDE047';
const COLOR_CYAN = '#38BDF8';
const COLOR_EMERALD = '#34D399';

// Câmera Tridimensional Contínua
type Cam = {yaw: number; pitch: number; dist: number; x: number; y: number; roll: number};
const FOCAL = 1350;

const camAt = (t: number): Cam => {
	let yaw = 0;
	let pitch = 0;
	let dist = 1450;
	let x = 0;
	let y = 0;

	if (t < 5.6) {
		// Cena 1: Live Terminal de Código (Dolly-in sutil focado no terminal)
		yaw = ci(t, [0, 5.6], [-0.12, 0.12]);
		pitch = ci(t, [0, 5.6], [0.08, -0.04]);
		dist = ci(t, [0, 5.6], [1550, 1380]);
		y = ci(t, [0, 5.6], [20, -40]);
	} else if (t < 12.0) {
		// Cena 2: Monograma 3D Vibe Design Studio (Órbita e abertura de plano)
		yaw = ci(t, [5.6, 12.0], [0.12, 0.55]);
		pitch = ci(t, [5.6, 12.0], [-0.04, 0.22]);
		dist = ci(t, [5.6, 12.0], [1380, 1420]);
		y = 0;
	} else if (t < 22.2) {
		// Cena 3: Constelação Multiagente (Órbita atômica 3D inclinada)
		yaw = ci(t, [12.0, 22.2], [0.55, -0.65]);
		pitch = ci(t, [12.0, 22.2], [0.22, -0.18]);
		dist = ci(t, [12.0, 22.2], [1420, 1280]);
		y = -20;
	} else {
		// Cena 4: A Grande Estrela 3D do GitHub (Punch-in majestoso com rotação suave)
		yaw = ci(t, [22.2, 30.6], [-0.65, 0.45]);
		pitch = ci(t, [22.2, 30.6], [-0.18, 0.14]);
		dist = ci(t, [22.2, 30.6], [1280, 1150]);
		y = ci(t, [22.2, 30.6], [-20, -60]);
	}

	// Respiração orgânica contínua da câmera
	yaw += Math.sin(t * 0.75) * 0.025;
	pitch += Math.cos(t * 0.6) * 0.018;

	return {yaw, pitch, dist, x, y, roll: 0};
};

const project = (x: number, y: number, z: number, c: Cam): [number, number, number] => {
	x -= c.x;
	y -= c.y;
	const cy = Math.cos(c.yaw);
	const sy = Math.sin(c.yaw);
	const x1 = x * cy + z * sy;
	const z1 = -x * sy + z * cy;

	const cp = Math.cos(c.pitch);
	const sp = Math.sin(c.pitch);
	const y1 = y * cp - z1 * sp;
	const z2 = y * sp + z1 * cp;

	const zz = z2 + c.dist;
	if (zz < 30) return [0, 0, -1];
	const s = FOCAL / zz;
	return [CENTER_X + x1 * s, CENTER_Y + y1 * s, s];
};

// ════════════════════════════════════════════════════════════════════════════
// 4 GEOMETRIAS MATEMÁTICAS 3D (MORPH CONTÍNUO)
// ════════════════════════════════════════════════════════════════════════════

// Poeira estelar ambiente de respiro
const ambientDust = (i: number, t: number, color = COLOR_WHITE, o = 0.12): P5 => {
	const d = R[i];
	const x = (d.a - 0.5) * 2200;
	const y = (d.b - 0.5) * 3200;
	const z = (d.c - 0.5) * 2000 + Math.sin(t * 0.4 + d.a * 10) * 50;
	return [x, y, z, 1.0 + d.d * 0.8, o, color];
};

// Forma 1: Grid Matricial do Terminal 3D (0s - 5.6s)
const shapeTerminalGrid = (i: number, t: number): P5 => {
	const d = R[i];
	// 2600 pontos desenhando a tela holográfica do terminal
	if (i < 2600) {
		const u = i / 2600;
		const col = Math.floor(u * 28);
		const row = Math.floor((u * 28) % 18);
		const x = (col - 14) * 24 + (d.a - 0.5) * 6;
		const y = (row - 9) * 28 + (d.b - 0.5) * 8 - 40;
		const z = Math.sin(col * 0.2 + t * 3) * 35;
		const scan = (y + 300 + t * 180) % 600;
		const isBeam = Math.abs(scan - 300) < 40;
		return [x, y, z, isBeam ? 1.8 : 1.1, isBeam ? 0.95 : 0.45, isBeam ? COLOR_GOLD : COLOR_WHITE];
	}
	// 1200 pontos para feixe de laser superior
	const u = (i - 2600) / 1200;
	const x = (u - 0.5) * 780;
	const y = -340 + Math.sin(u * 15 + t * 4) * 15;
	const z = (d.c - 0.5) * 40;
	return [x, y, z, 1.4, 0.8, COLOR_GOLD];
};

// Forma 2: O Monograma "V" Dimensional & Estúdio Headless (5.6s - 12.0s)
const shapeStudioPrism = (i: number, t: number): P5 => {
	const d = R[i];
	// 2800 pontos para o Grande "V" Geométrico Tridimensional
	if (i < 2800) {
		const u = i / 2800;
		const arm = u < 0.5 ? -1 : 1;
		const prog = (u % 0.5) * 2;
		const x0 = arm * (180 - prog * 150);
		const y0 = -220 + prog * 360;
		const thickness = 28 * Math.sqrt(d.a);
		const a = d.b * TAU;
		const x = x0 + Math.cos(a) * thickness;
		const y = y0 + Math.sin(a) * thickness;
		const z = (prog - 0.5) * 80 + Math.sin(t * 2 + prog * 4) * 25;
		const isGold = d.c > 0.65;
		return [x, y - 30, z, isGold ? 1.8 : 1.3, isGold ? 0.95 : 0.75, isGold ? COLOR_GOLD : COLOR_WHITE];
	}
	return ambientDust(i, t, COLOR_WHITE, 0.15);
};

// Forma 3: Orquestração Multiagente — Tríade Atômica (12.0s - 22.2s)
const shapeMultiagentTriad = (i: number, t: number): P5 => {
	const d = R[i];
	// 3 Órbitas Elípticas 3D representando Claude Code, OpenAI Codex e Google Antigravity
	if (i < 3000) {
		const agentIndex = Math.floor(i / 1000); // 0 = Claude, 1 = Codex, 2 = Antigravity
		const u = ((i % 1000) / 1000) * TAU;
		const spin = t * 1.5;

		const rX = 320;
		const rY = 140;

		let x0 = Math.cos(u) * rX;
		let y0 = Math.sin(u) * rY;
		let z0 = Math.sin(u * 2 + spin) * 70;

		// Rotação espacial dos 3 anéis em ângulos distintos (120 graus entre si)
		const tiltAngle = (agentIndex * Math.PI) / 3;
		const rotSpeed = spin + agentIndex * 2.1;
		const x = x0 * Math.cos(tiltAngle) - y0 * Math.sin(tiltAngle) + Math.cos(rotSpeed) * 30;
		const y = x0 * Math.sin(tiltAngle) + y0 * Math.cos(tiltAngle);
		const z = z0 + (d.a - 0.5) * 40;

		const color = agentIndex === 0 ? COLOR_GOLD : agentIndex === 1 ? COLOR_EMERALD : COLOR_CYAN;
		const isCore = d.b > 0.8;
		return [x, y - 40, z, isCore ? 2.0 : 1.2, isCore ? 0.95 : 0.65, color];
	}

	// 800 pontos para o Núcleo Central de Código Pulsante
	const a = d.a * TAU;
	const r = 85 * Math.sqrt(d.b);
	const pulse = 1 + Math.sin(t * 5) * 0.12;
	const x = Math.cos(a) * r * pulse;
	const y = Math.sin(a) * r * pulse - 40;
	const z = (d.c - 0.5) * 70;
	return [x, y, z, 1.6, 0.85, COLOR_WHITE];
};

// Forma 4: A Grande Estrela Pentagrama 3D do GitHub ⭐ (22.2s - 30.6s)
const shapeGitHubStar = (i: number, t: number): P5 => {
	const d = R[i];
	// 3000 pontos desenhando a Estrela de 5 Pontas 3D
	if (i < 3000) {
		const u = i / 3000;
		const point = Math.floor(u * 10);
		const prog = (u * 10) % 1;
		const spin = t * 0.8;

		// Vértices externo e interno alternados
		const isOuter = point % 2 === 0;
		const a0 = (point * Math.PI) / 5 - Math.PI / 2 + spin;
		const a1 = ((point + 1) * Math.PI) / 5 - Math.PI / 2 + spin;
		const r0 = isOuter ? 260 : 110;
		const r1 = isOuter ? 110 : 260;

		const x0 = Math.cos(a0) * r0;
		const y0 = Math.sin(a0) * r0;
		const x1 = Math.cos(a1) * r1;
		const y1 = Math.sin(a1) * r1;

		const x = lerp(x0, x1, prog) + (d.a - 0.5) * 20;
		const y = lerp(y0, y1, prog) + (d.b - 0.5) * 20 - 70;
		const z = (d.c - 0.5) * 60 + Math.sin(t * 3 + u * 10) * 30;

		const isShimmer = d.d > 0.7;
		return [x, y, z, isShimmer ? 2.2 : 1.4, isShimmer ? 1.0 : 0.75, COLOR_GOLD];
	}

	// 800 pontos para os Raios Estelares em Expansão
	const u = (i - 3000) / 800;
	const angle = d.a * TAU;
	const dist = 320 + d.b * 450 + Math.sin(t * 2 + d.c * 10) * 60;
	const x = Math.cos(angle) * dist;
	const y = Math.sin(angle) * dist - 70;
	const z = (d.d - 0.5) * 200;
	return [x, y, z, 1.2, 0.45, COLOR_GOLD];
};

// ════════════════════════════════════════════════════════════════════════════
// MOTOR PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════

export interface FlowMotionMasterProps {
	audioNarracao?: string;
	audioTrilha?: string;
	enableSfx?: boolean;
}

export const FlowMotionMaster: React.FC<FlowMotionMasterProps> = ({
	audioNarracao = 'narracao.mp3',
	audioTrilha,
	enableSfx = true,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;

	// Sound Triggers Hápticos
	const soundTriggers: SoundImpactTrigger[] = useMemo(
		() => [
			{startFrame: 0, durationFrames: 25, type: 'whoosh', ease: 'glide', volume: 0.16},
			{startFrame: 45, durationFrames: 15, type: 'click', ease: 'snapSettle', volume: 0.14},
			{startFrame: 168, durationFrames: 25, type: 'whoosh', ease: 'glide', volume: 0.18},
			{startFrame: 210, durationFrames: 15, type: 'click', ease: 'snapSettle', volume: 0.14},
			{startFrame: 360, durationFrames: 28, type: 'whoosh', ease: 'glide', volume: 0.20},
			{startFrame: 440, durationFrames: 15, type: 'click', ease: 'snapSettle', volume: 0.12},
			{startFrame: 520, durationFrames: 15, type: 'click', ease: 'snapSettle', volume: 0.12},
			{startFrame: 666, durationFrames: 30, type: 'whoosh', ease: 'glide', volume: 0.22},
			{startFrame: 720, durationFrames: 18, type: 'click', ease: 'snapSettle', volume: 0.18},
		],
		[]
	);

	// Curva de Áudio
	const musicVolume = useMemo(() => {
		if (frame < 60) return interpolate(frame, [0, 60], [0.08, 0.14]);
		if (frame >= 60 && frame < 820) return 0.12;
		return interpolate(frame, [820, 918], [0.12, 0.0]);
	}, [frame]);

	// Câmera no instante t
	const cam = camAt(t);

	// Interpolação Matemática Contínua entre as 4 Formas (Morphing Puro)
	let shape: (i: number) => P5;

	if (t < 5.6) {
		shape = (i) => shapeTerminalGrid(i, t);
	} else if (t < 6.4) {
		// Transição 1 -> 2 (0.8s morph suave)
		const m = E_IO(ci(t, [5.6, 6.4], [0, 1]));
		shape = (i) => {
			const p1 = shapeTerminalGrid(i, t);
			const p2 = shapeStudioPrism(i, t);
			return [
				lerp(p1[0], p2[0], m),
				lerp(p1[1], p2[1], m),
				lerp(p1[2], p2[2], m),
				lerp(p1[3], p2[3], m),
				lerp(p1[4], p2[4], m),
				m > 0.5 ? p2[5] : p1[5],
			];
		};
	} else if (t < 12.0) {
		shape = (i) => shapeStudioPrism(i, t);
	} else if (t < 12.8) {
		// Transição 2 -> 3 (0.8s morph para o Clímax Multiagente)
		const m = E_IO(ci(t, [12.0, 12.8], [0, 1]));
		shape = (i) => {
			const p2 = shapeStudioPrism(i, t);
			const p3 = shapeMultiagentTriad(i, t);
			return [
				lerp(p2[0], p3[0], m),
				lerp(p2[1], p3[1], m),
				lerp(p2[2], p3[2], m),
				lerp(p2[3], p3[3], m),
				lerp(p2[4], p3[4], m),
				m > 0.5 ? p3[5] : p2[5],
			];
		};
	} else if (t < 22.2) {
		shape = (i) => shapeMultiagentTriad(i, t);
	} else if (t < 23.0) {
		// Transição 3 -> 4 (0.8s morph para a Estrela do GitHub)
		const m = E_IO(ci(t, [22.2, 23.0], [0, 1]));
		shape = (i) => {
			const p3 = shapeMultiagentTriad(i, t);
			const p4 = shapeGitHubStar(i, t);
			return [
				lerp(p3[0], p4[0], m),
				lerp(p3[1], p4[1], m),
				lerp(p3[2], p4[2], m),
				lerp(p3[3], p4[3], m),
				lerp(p3[4], p4[4], m),
				m > 0.5 ? p4[5] : p3[5],
			];
		};
	} else {
		shape = (i) => shapeGitHubStar(i, t);
	}

	// Projeta os 3.800 pontos do universo 3D
	const particlesNodes = [];
	for (let i = 0; i < N_POINTS; i++) {
		const p = shape(i);
		const proj = project(p[0], p[1], p[2], cam);
		if (proj[2] <= 0) continue; // Ponto atrás do plano focal

		const px = proj[0];
		const py = proj[1];
		const scale = proj[2];
		const r = p[3] * scale;
		const alpha = Math.min(1, Math.max(0.04, p[4] * (scale > 1.2 ? 1 : scale * 0.85)));

		particlesNodes.push(
			<circle
				key={i}
				cx={px.toFixed(1)}
				cy={py.toFixed(1)}
				r={r.toFixed(1)}
				fill={p[5]}
				opacity={alpha.toFixed(2)}
			/>
		);
	}

	// ────────────────────────────────────────────────────────────────────────────
	// LIVE TERMINAL TYPING EFFECT (CENA 1)
	// ────────────────────────────────────────────────────────────────────────────
	const fullTerminalCommand = 'npx skills add Gabrielrtads/vibe-design-studio';
	const typedChars = Math.min(
		fullTerminalCommand.length,
		Math.floor(ci(frame, [15, 120], [0, fullTerminalCommand.length], EASE.glide))
	);
	const displayedCommand = fullTerminalCommand.substring(0, typedChars);

	return (
		<AbsoluteFill style={{background: '#050505', overflow: 'hidden'}}>
			{/* Áudio Trilha & Narração Neural Edge-TTS */}
			{audioTrilha ? <Audio src={staticFile(audioTrilha)} volume={musicVolume} /> : null}
			{audioNarracao ? <Audio src={staticFile(audioNarracao)} volume={1.0} /> : null}
			{enableSfx ? <AutoImpactTrack triggers={soundTriggers} masterVolume={0.28} /> : null}

			{/* Grid & Retícula de Fundo Sutil */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					opacity: 0.15,
					backgroundImage: `radial-gradient(circle, rgba(237, 235, 230, 0.4) 1px, transparent 1px)`,
					backgroundSize: '56px 56px',
				}}
			/>

			{/* SVG DO UNIVERSO DE PONTILHISMO 3D */}
			<svg width={W} height={H} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
				{particlesNodes}
			</svg>

			{/* ══════════════════════════════════════════════════════════════════════
			    HEADER & STATUS EDITORIAL SUPERIOR
			══════════════════════════════════════════════════════════════════════ */}
			<div
				style={{
					position: 'absolute',
					top: 80,
					left: 64,
					right: 64,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					fontFamily: MONO,
					fontSize: 13,
					letterSpacing: '0.14em',
					color: 'rgba(237, 235, 230, 0.65)',
					borderBottom: '1px solid rgba(237, 235, 230, 0.12)',
					paddingBottom: 16,
					zIndex: 50,
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 10}}>
					<div
						style={{
							width: 8,
							height: 8,
							borderRadius: '50%',
							background: COLOR_GOLD,
							boxShadow: `0 0 10px ${COLOR_GOLD}`,
						}}
					/>
					<span style={{fontWeight: 700}}>VIBE DESIGN STUDIO // PONTILHISMO 3D</span>
				</div>
				<div>FRAME: {frame} // {t.toFixed(1)}s</div>
			</div>

			{/* ══════════════════════════════════════════════════════════════════════
			    CENA 1: LIVE TERMINAL DE CÓDIGO (0s a 5.6s)
			══════════════════════════════════════════════════════════════════════ */}
			{t < 5.8 && (
				<div
					style={{
						position: 'absolute',
						top: 170,
						left: 64,
						right: 64,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						opacity: ci(frame, [0, 20], [0, 1]) * ci(frame, [155, 172], [1, 0]),
					}}
				>
					{/* Terminal Minimalista P&B */}
					<div
						style={{
							width: '100%',
							maxWidth: 820,
							background: 'rgba(12, 12, 12, 0.88)',
							border: '1px solid rgba(237, 235, 230, 0.22)',
							borderRadius: 16,
							padding: '18px 24px',
							boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
							display: 'flex',
							flexDirection: 'column',
							gap: 12,
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								borderBottom: '1px solid rgba(237, 235, 230, 0.08)',
								paddingBottom: 10,
							}}
						>
							<div style={{display: 'flex', gap: 8}}>
								<div style={{width: 10, height: 10, borderRadius: '50%', background: '#EF4444'}} />
								<div style={{width: 10, height: 10, borderRadius: '50%', background: '#F59E0B'}} />
								<div style={{width: 10, height: 10, borderRadius: '50%', background: '#10B981'}} />
							</div>
							<span style={{fontFamily: MONO, fontSize: 11, color: 'rgba(237, 235, 230, 0.45)'}}>
								headless-code-studio // live
							</span>
							<div style={{width: 30}} />
						</div>

						<div
							style={{
								fontFamily: MONO,
								fontSize: 18,
								color: COLOR_GOLD,
								display: 'flex',
								alignItems: 'center',
								gap: 10,
							}}
						>
							<span style={{color: 'rgba(237, 235, 230, 0.4)'}}>&gt;</span>
							<span>{displayedCommand}</span>
							<span
								style={{
									width: 8,
									height: 18,
									background: COLOR_GOLD,
									opacity: frame % 16 < 8 ? 1 : 0,
								}}
							/>
						</div>
					</div>

					<h2
						style={{
							fontFamily: SERIF,
							fontStyle: 'italic',
							fontSize: 44,
							color: COLOR_WHITE,
							textAlign: 'center',
							marginTop: 32,
							letterSpacing: '-0.02em',
							lineHeight: 1.15,
						}}
					>
						Cansado do AI Slop genérico?
					</h2>
				</div>
			)}

			{/* ══════════════════════════════════════════════════════════════════════
			    CENA 2: VIBE DESIGN STUDIO (5.6s a 12.0s)
			══════════════════════════════════════════════════════════════════════ */}
			{t >= 5.6 && t < 12.2 && (
				<div
					style={{
						position: 'absolute',
						top: 170,
						left: 64,
						right: 64,
						textAlign: 'center',
						opacity: ci(frame, [168, 190], [0, 1]) * ci(frame, [345, 365], [1, 0]),
					}}
				>
					<div
						style={{
							fontFamily: MONO,
							fontSize: 13,
							letterSpacing: '0.12em',
							color: COLOR_GOLD,
							marginBottom: 12,
						}}
					>
						O Estúdio Criativo Headless
					</div>

					<h1
						style={{
							fontFamily: SERIF,
							fontStyle: 'italic',
							fontSize: 66,
							fontWeight: 400,
							color: COLOR_WHITE,
							letterSpacing: '-0.03em',
							lineHeight: 1.05,
							margin: 0,
						}}
					>
						Vibe Design Studio
					</h1>

					<p
						style={{
							fontFamily: SANS,
							fontSize: 22,
							color: 'rgba(237, 235, 230, 0.65)',
							marginTop: 14,
							fontWeight: 300,
						}}
					>
						Código Puro para Agentes Autônomos
					</p>
				</div>
			)}

			{/* ══════════════════════════════════════════════════════════════════════
			    CENA 3: CLÍMAX MULTIAGENTE — 3 ÓRBITAS (12.0s a 22.2s)
			══════════════════════════════════════════════════════════════════ */}
			{t >= 12.0 && t < 22.4 && (
				<div
					style={{
						position: 'absolute',
						top: 170,
						left: 64,
						right: 64,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						opacity: ci(frame, [360, 385], [0, 1]) * ci(frame, [650, 670], [1, 0]),
					}}
				>
					<div
						style={{
							fontFamily: MONO,
							fontSize: 12,
							letterSpacing: '0.12em',
							color: 'rgba(237, 235, 230, 0.6)',
							marginBottom: 10,
						}}
					>
						Arquitetura Multiagente
					</div>

					<h2
						style={{
							fontFamily: SERIF,
							fontStyle: 'italic',
							fontSize: 52,
							color: COLOR_WHITE,
							textAlign: 'center',
							letterSpacing: '-0.02em',
							margin: '0 0 24px 0',
						}}
					>
						Orquestração em Código Puro
					</h2>

					{/* 3 Badges de Agentes Conectados */}
					<div style={{display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center'}}>
						{[
							{name: 'Claude Code', detail: 'Sonnet & Opus', color: COLOR_GOLD},
							{name: 'OpenAI Codex', detail: 'Sandboxed Engine', color: COLOR_EMERALD},
							{name: 'Google Antigravity', detail: 'AGY Swarm SDK', color: COLOR_CYAN},
						].map((ag, idx) => (
							<div
								key={idx}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 8,
									padding: '8px 16px',
									borderRadius: 999,
									background: 'rgba(12, 12, 12, 0.85)',
									border: `1px solid ${ag.color}55`,
									boxShadow: `0 0 15px ${ag.color}22`,
								}}
							>
								<div
									style={{
										width: 8,
										height: 8,
										borderRadius: '50%',
										background: ag.color,
										boxShadow: `0 0 8px ${ag.color}`,
									}}
								/>
								<span style={{fontFamily: SANS, fontSize: 14, fontWeight: 600, color: COLOR_WHITE}}>
									{ag.name}
								</span>
								<span style={{fontFamily: MONO, fontSize: 11, color: 'rgba(237, 235, 230, 0.45)'}}>
									({ag.detail})
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* ══════════════════════════════════════════════════════════════════════
			    CENA 4: CALL TO ACTION — ESTRELA NO GITHUB (22.2s a 30.6s)
			══════════════════════════════════════════════════════════════════════ */}
			{t >= 22.2 && (
				<div
					style={{
						position: 'absolute',
						top: 170,
						left: 64,
						right: 64,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						opacity: ci(frame, [666, 690], [0, 1]),
					}}
				>
					<div
						style={{
							fontFamily: MONO,
							fontSize: 12,
							letterSpacing: '0.12em',
							color: COLOR_GOLD,
							marginBottom: 8,
						}}
					>
						100% Open-Source &middot; Custo Zero
					</div>

					<h1
						style={{
							fontFamily: SERIF,
							fontStyle: 'italic',
							fontSize: 60,
							color: COLOR_WHITE,
							textAlign: 'center',
							letterSpacing: '-0.03em',
							margin: '0 0 24px 0',
							lineHeight: 1.05,
						}}
					>
						Deixe sua estrela no GitHub
					</h1>

					{/* Card GitHub Repositório */}
					<div
						style={{
							width: '100%',
							maxWidth: 780,
							background: 'rgba(12, 12, 12, 0.9)',
							border: '1px solid rgba(253, 224, 71, 0.4)',
							borderRadius: 20,
							padding: '24px 30px',
							boxShadow: '0 25px 70px rgba(0, 0, 0, 0.8), 0 0 30px rgba(253, 224, 71, 0.15)',
							display: 'flex',
							flexDirection: 'column',
							gap: 16,
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
							}}
						>
							<div>
								<div
									style={{
										fontFamily: MONO,
										fontSize: 18,
										fontWeight: 700,
										color: COLOR_WHITE,
									}}
								>
									Gabrielrtads/vibe-design-studio
								</div>
								<div
									style={{
										fontFamily: SANS,
										fontSize: 13,
										color: 'rgba(237, 235, 230, 0.5)',
										marginTop: 4,
									}}
								>
									github.com/Gabrielrtads/vibe-design-studio
								</div>
							</div>

							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 8,
									padding: '8px 18px',
									borderRadius: 10,
									background: COLOR_GOLD,
									color: '#0A0A0A',
									fontFamily: SANS,
									fontSize: 15,
									fontWeight: 800,
									boxShadow: '0 0 20px rgba(253, 224, 71, 0.4)',
								}}
							>
								<span>★</span>
								<span>Star Repo</span>
							</div>
						</div>

						{/* One-Liner Install */}
						<div
							style={{
								padding: '12px 18px',
								borderRadius: 10,
								background: 'rgba(255, 255, 255, 0.04)',
								border: '1px solid rgba(255, 255, 255, 0.08)',
								fontFamily: MONO,
								fontSize: 15,
								color: COLOR_GOLD,
								display: 'flex',
								alignItems: 'center',
								gap: 10,
							}}
						>
							<span style={{color: 'rgba(237, 235, 230, 0.4)'}}>$</span>
							<span>npx skills add Gabrielrtads/vibe-design-studio</span>
						</div>
					</div>
				</div>
			)}

			{/* ══════════════════════════════════════════════════════════════════════
			    LEGENDAS CINÉTICAS PALAVRA POR PALAVRA (WHISPER SYNC)
			══════════════════════════════════════════════════════════════════════ */}
			<KineticWordCaption
				words={WORDS_DATA}
				preset="gold-glow"
				bottom={115}
				fontSize={32}
				windowSize={4}
			/>
		</AbsoluteFill>
	);
};
