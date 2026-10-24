import React from 'react';
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * Kit "roteiro manda": três componentes sem texto de demonstração, guiados só por props
 * (texto da cena + cores do pacote de estilo).
 */

const FONTE = "Inter, 'Helvetica Neue', system-ui, sans-serif";

/** Zona segura vertical (9:16): conteúdo entre 20% e 65% da altura, a legenda fica embaixo. */
const zonaCentral: React.CSSProperties = {
	position: 'absolute',
	left: '7%',
	right: '7%',
	top: '20%',
	bottom: '35%',
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	textAlign: 'center',
	fontFamily: FONTE,
};

// ────────────────────────────────────────────────────────────────────────────
// FundoEstilo: fundo do pacote de estilo (gradiente diagonal + vinheta suave)
// ────────────────────────────────────────────────────────────────────────────
export interface FundoEstiloProps {
	fundo?: string;
	fundo2?: string;
}

export const FundoEstilo: React.FC<FundoEstiloProps> = ({ fundo = '#05070D', fundo2 = '#0B1220' }) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(120% 90% at 50% 38%, ${fundo2} 0%, ${fundo} 78%)`,
		}}
	>
		<AbsoluteFill style={{ background: 'radial-gradient(140% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.28) 100%)' }} />
	</AbsoluteFill>
);

// ────────────────────────────────────────────────────────────────────────────
// FraseDestaque: a frase da cena em tipografia grande, palavra por palavra
// ────────────────────────────────────────────────────────────────────────────
export interface FraseDestaqueProps {
	texto: string;
	variant?: 'afirmacao' | 'pergunta' | 'cta' | 'cartao';
	corTexto?: string;
	corAcento?: string;
}

export const FraseDestaque: React.FC<FraseDestaqueProps> = ({ texto, variant = 'afirmacao', corTexto = '#F8FAFC', corAcento = '#38BDF8' }) => {
	const frame = useCurrentFrame();
	const { fps, width } = useVideoConfig();
	const palavras = texto.trim().split(/\s+/);
	const maisLonga = palavras.reduce((m, p, i) => (p.replace(/[^\p{L}\p{N}]/gu, '').length > palavras[m].replace(/[^\p{L}\p{N}]/gu, '').length ? i : m), 0);
	const base = palavras.length <= 4 ? 0.135 : palavras.length <= 7 ? 0.108 : 0.09;
	const tamanho = Math.round(width * base * (variant === 'cartao' ? 0.88 : 1));
	const aparece = (i: number) => spring({ frame: frame - i * 3, fps, config: { damping: 15, mass: 0.7, stiffness: 140 } });

	const destaque = variant === 'pergunta' ? palavras.length - 1 : variant === 'cta' ? 0 : maisLonga;
	const barra = interpolate(frame, [palavras.length * 3 + 4, palavras.length * 3 + 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

	return (
		<div style={zonaCentral}>
			<div
				style={
					variant === 'cartao'
						? { padding: `${tamanho * 0.5}px ${tamanho * 0.55}px`, borderRadius: tamanho * 0.45, border: `3px solid ${corAcento}`, background: `${corTexto}14`, boxShadow: `0 ${tamanho * 0.3}px ${tamanho * 0.9}px rgba(0,0,0,0.25)`, display: 'flex', flexDirection: 'column', alignItems: 'center' }
						: { display: 'flex', flexDirection: 'column', alignItems: 'center' }
				}
			>
			{variant === 'pergunta' && (
				<div style={{ fontSize: tamanho * 2.2, lineHeight: 0.8, fontWeight: 900, color: corAcento, opacity: 0.9 * aparece(0), transform: `scale(${0.6 + 0.4 * aparece(0)})`, marginBottom: tamanho * 0.2 }}>?</div>
			)}
			<div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `${tamanho * 0.12}px ${tamanho * 0.24}px`, fontSize: tamanho, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.05, color: corTexto }}>
				{palavras.map((p, i) => {
					const s = aparece(i);
					return (
						<span key={i} style={{ display: 'inline-block', opacity: s, transform: `translateY(${(1 - s) * 40}px) scale(${0.92 + 0.08 * s})`, color: i === destaque ? corAcento : corTexto }}>
							{p}
						</span>
					);
				})}
			</div>
			<div style={{ marginTop: tamanho * 0.45, height: Math.max(6, tamanho * 0.07), width: `${(variant === 'cta' ? 46 : 30) * barra}%`, background: corAcento, borderRadius: 999 }} />
			{variant === 'cta' && (
				<div style={{ marginTop: tamanho * 0.35, fontSize: tamanho * 0.9, color: corAcento, fontWeight: 900, opacity: barra, transform: `translateX(${(1 - barra) * -30}px)` }}>→</div>
			)}
			</div>
		</div>
	);
};

// ────────────────────────────────────────────────────────────────────────────
// NumeroDestaque: o número da frase contando até o valor, com o rótulo embaixo
// ────────────────────────────────────────────────────────────────────────────
export interface NumeroDestaqueProps {
	valor: number;
	decimais?: number;
	prefixo?: string;
	sufixo?: string;
	rotulo?: string;
	corTexto?: string;
	corAcento?: string;
}

export const NumeroDestaque: React.FC<NumeroDestaqueProps> = ({ valor, decimais = 0, prefixo = '', sufixo = '', rotulo = '', corTexto = '#F8FAFC', corAcento = '#38BDF8' }) => {
	const frame = useCurrentFrame();
	const { fps, width } = useVideoConfig();
	const progresso = interpolate(frame, [0, 34], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
	const atual = valor * progresso;
	const formatado = atual.toLocaleString('pt-BR', { minimumFractionDigits: decimais, maximumFractionDigits: decimais });
	const total = `${prefixo}${valor.toLocaleString('pt-BR', { minimumFractionDigits: decimais, maximumFractionDigits: decimais })}${sufixo}`;
	const tamanho = Math.round(Math.min(width * 0.3, (width * 0.9) / Math.max(3, total.length * 0.62)));
	const entrada = spring({ frame, fps, config: { damping: 14, mass: 0.8, stiffness: 120 } });
	const rotuloOpacidade = interpolate(frame, [26, 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

	return (
		<div style={zonaCentral}>
			<div style={{ fontSize: tamanho, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, color: corAcento, transform: `scale(${0.85 + 0.15 * entrada})`, fontVariantNumeric: 'tabular-nums' }}>
				{prefixo}
				{formatado}
				{sufixo}
			</div>
			{rotulo && (
				<div style={{ marginTop: tamanho * 0.2, fontSize: Math.round(tamanho * 0.2), fontWeight: 600, lineHeight: 1.2, color: corTexto, opacity: rotuloOpacidade, maxWidth: '92%' }}>{rotulo}</div>
			)}
		</div>
	);
};
