import React, {useRef} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {ci, EASE, lerp} from './kit';

// ════════════════════════════════════════════════════════════════════════════
// ILUMINAÇÃO DE ESTÚDIO FOTOGRÁFICO EM 3 PONTOS (KEY, FILL, RIM + SPECULAR)
// ════════════════════════════════════════════════════════════════════════════

export interface StudioLightingProps {
	rimColor?: string;
	fillColor?: string;
	keyIntensity?: number;
}

export const StudioLighting: React.FC<StudioLightingProps> = ({
	rimColor = '#00E5FF',
	fillColor = '#3B82F6',
	keyIntensity = 2.4,
}) => {
	return (
		<>
			{/* Luz Ambiente de Preenchimento Noturno */}
			<ambientLight color="#64748B" intensity={1.8} />

			{/* Key Light: Luz Principal Quente Superior */}
			<directionalLight position={[6, 9, 8]} color="#FFFFFF" intensity={keyIntensity} />

			{/* Fill Light: Luz Fria Lateral de Preenchimento */}
			<directionalLight position={[-7, 3, 5]} color={fillColor} intensity={2.2} />

			{/* Rim Light: Contra-luz Traseira Rasante de Contorno */}
			<directionalLight position={[0, -6, -7]} color={rimColor} intensity={3.5} />

			{/* Ponto Especular para Reflexos no Metal */}
			<pointLight position={[0, 1.5, 5.5]} color="#FFFFFF" intensity={3.8} distance={15} />
		</>
	);
};

// ════════════════════════════════════════════════════════════════════════════
// CARTÃO METÁLICO PROCEDURAL VIP (PBR MATERIAL)
// ════════════════════════════════════════════════════════════════════════════

export interface PBRCardMeshProps {
	rotX?: number;
	rotY?: number;
	rotZ?: number;
	scale?: number;
	accentColor?: string;
}

export const PBRCardMesh: React.FC<PBRCardMeshProps> = ({
	rotX = 0,
	rotY = 0,
	rotZ = 0,
	scale = 1,
	accentColor = '#00E5FF',
}) => {
	return (
		<group rotation={[rotX, rotY, rotZ]} scale={scale}>
			{/* Corpo Principal do Cartão Metálico */}
			<mesh position={[0, 0, 0]}>
				<boxGeometry args={[4.4, 2.7, 0.08]} />
				<meshPhysicalMaterial
					color="#2C3545"
					metalness={0.70}
					roughness={0.30}
					clearcoat={0.85}
					clearcoatRoughness={0.12}
					reflectivity={0.92}
				/>
			</mesh>

			{/* Borda Chanfrada de Destaque Metálico */}
			<mesh position={[0, 0, 0]}>
				<boxGeometry args={[4.44, 2.74, 0.06]} />
				<meshPhysicalMaterial
					color={accentColor}
					metalness={0.98}
					roughness={0.1}
					clearcoat={1.0}
					clearcoatRoughness={0.05}
					emissive={accentColor}
					emissiveIntensity={0.25}
				/>
			</mesh>

			{/* Chip Metálico Dourado */}
			<mesh position={[-1.3, 0.2, 0.046]}>
				<boxGeometry args={[0.7, 0.55, 0.02]} />
				<meshPhysicalMaterial
					color="#F59E0B"
					metalness={0.80}
					roughness={0.20}
					clearcoat={0.8}
				/>
			</mesh>

			{/* Faixa / Marca Holográfica Traseira */}
			<mesh position={[0, -0.6, 0.045]}>
				<boxGeometry args={[3.8, 0.06, 0.01]} />
				<meshPhysicalMaterial
					color={accentColor}
					metalness={0.9}
					roughness={0.2}
					emissive={accentColor}
					emissiveIntensity={0.4}
				/>
			</mesh>
		</group>
	);
};

// ════════════════════════════════════════════════════════════════════════════
// MEDALHÃO / MOEDA DE ECONOMIA PROCEDURAL (PBR MATERIAL)
// ════════════════════════════════════════════════════════════════════════════

export interface PBRCoinMeshProps {
	rotX?: number;
	rotY?: number;
	rotZ?: number;
	scale?: number;
	coinColor?: string;
}

export const PBRCoinMesh: React.FC<PBRCoinMeshProps> = ({
	rotX = 0,
	rotY = 0,
	rotZ = 0,
	scale = 1,
	coinColor = '#FFD700',
}) => {
	return (
		<group rotation={[rotX, rotY, rotZ]} scale={scale}>
			{/* Disco Principal da Moeda */}
			<mesh rotation={[Math.PI / 2, 0, 0]}>
				<cylinderGeometry args={[1.8, 1.8, 0.22, 64]} />
				<meshPhysicalMaterial
					color={coinColor}
					metalness={0.96}
					roughness={0.14}
					clearcoat={0.9}
					clearcoatRoughness={0.06}
					reflectivity={0.95}
				/>
			</mesh>

			{/* Anel Externo de Chanfro */}
			<mesh rotation={[Math.PI / 2, 0, 0]}>
				<cylinderGeometry args={[1.84, 1.84, 0.18, 64]} />
				<meshPhysicalMaterial
					color={coinColor}
					metalness={0.99}
					roughness={0.08}
					clearcoat={1.0}
				/>
			</mesh>
		</group>
	);
};

// ════════════════════════════════════════════════════════════════════════════
// ESTÁGIO 3D PRINCIPAL COM CÂMERA & FÍSICAS REMOTION
// ════════════════════════════════════════════════════════════════════════════

export interface PBRStage3DProps {
	children?: React.ReactNode;
	objectType?: 'card' | 'coin';
	width?: number;
	height?: number;
	delay?: number;
	accentColor?: string;
	enableFloat?: boolean;
	baseRotX?: number;
	baseRotY?: number;
	cameraPosition?: [number, number, number];
	cameraFov?: number;
	style?: React.CSSProperties;
}

export const PBRStage3D: React.FC<PBRStage3DProps> = ({
	children,
	objectType = 'card',
	width = 800,
	height = 500,
	delay = 0,
	accentColor = '#00E5FF',
	enableFloat = true,
	baseRotX = 0.22,
	baseRotY = -0.45,
	cameraPosition,
	cameraFov = 42,
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Entrada física com curva medida snapSettle (11 frames)
	const enterProgress = ci(frame, [delay, delay + 14], [0, 1], EASE.snapSettle);
	const scale = lerp(0.4, 1.0, enterProgress);
	const opacity = enterProgress;

	// Micro-oscilação harmônica ociosa (Idle Float)
	const t = (frame - delay) / fps;
	const idleRotX = enableFloat && frame >= delay ? Math.sin(t * 1.5) * 0.08 : 0;
	const idleRotY = enableFloat && frame >= delay ? Math.cos(t * 1.2) * 0.12 : 0;
	const idleY = enableFloat && frame >= delay ? Math.sin(t * 1.7) * 0.15 : 0;

	// Rotação dinâmica contínua para moedas ou ângulo de apresentação para cartões
	const rotX = baseRotX + idleRotX;
	const rotY = objectType === 'coin' ? t * 1.6 : baseRotY + idleRotY;
	const rotZ = enableFloat && frame >= delay ? Math.sin(t * 1.1) * 0.03 : 0;

	const camPos: [number, number, number] = cameraPosition || [0, idleY, 7.8];

	return (
		<div
			style={{
				width,
				height,
				opacity,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				position: 'relative',
				...style,
			}}
		>
			<ThreeCanvas
				width={width}
				height={height}
				camera={{fov: cameraFov, position: camPos}}
				style={{width: '100%', height: '100%', pointerEvents: 'none'}}
			>
				{children ? (
					children
				) : (
					<>
						{/* Iluminação Fotográfica de Estúdio */}
						<StudioLighting rimColor={accentColor} fillColor="#1E40AF" keyIntensity={2.5} />

						{/* Renderização do Objeto Físico Selecionado */}
						{objectType === 'card' ? (
							<PBRCardMesh
								rotX={rotX}
								rotY={rotY}
								rotZ={rotZ}
								scale={scale}
								accentColor={accentColor}
							/>
						) : (
							<PBRCoinMesh
								rotX={rotX}
								rotY={rotY}
								rotZ={rotZ}
								scale={scale}
								coinColor={accentColor}
							/>
						)}
					</>
				)}
			</ThreeCanvas>
		</div>
	);
};
