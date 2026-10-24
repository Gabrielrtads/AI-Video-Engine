/**
 * carrosselEngineMath.ts
 * Motor matemático e tipológico para Carrosséis de Alta Retenção (Instagram Feed 4:5 - 1080x1350).
 * Implementa o método "DNA Fixo, Ritmo Livre" e a arquitetura Double-Bezel.
 */

export const CARROSSEL_SPECS = {
	width: 1080,
	height: 1350,
	aspectRatio: '4:5',
	safePadding: {
		top: 56,
		bottom: 52,
		horizontal: 64,
	},
} as const;

export type CarouselArchetype =
	| 'HERO_EDITORIAL'
	| 'EXTRATO_FISICO'
	| 'HARDWARE_3D_APPLE'
	| 'DOUBLE_BEZEL_DASHBOARD'
	| 'VIP_METAL_CARD'
	| 'BENTO_ASYMMETRIC'
	| 'LEDGER_TRANSFORMATION'
	| 'INVITATION_BUTTON_IN_BUTTON';

export interface SlideSequenceContract {
	slideIndex: number;
	archetype: CarouselArchetype;
	backgroundTone: 'LIGHT_OFFWHITE' | 'DEEP_OLED' | 'WARM_CREAM' | 'ESPRESSO_SLATE';
	primaryFocus: string;
}

/**
 * Validador de Anti-Engessamento
 * Garante que nenhum arquétipo de silhueta seja repetido em slides consecutivos.
 */
export function validateAntiEngessamento(sequence: SlideSequenceContract[]): {
	isValid: boolean;
	conflicts: string[];
} {
	const conflicts: string[] = [];
	for (let i = 1; i < sequence.length; i++) {
		if (sequence[i].archetype === sequence[i - 1].archetype) {
			conflicts.push(
				`Conflito no slide ${i + 1}: Arquétipo '${sequence[i].archetype}' idêntico ao slide anterior.`
			);
		}
	}
	return {
		isValid: conflicts.length === 0,
		conflicts,
	};
}

/**
 * Cálculo de Concentricidade do Double-Bezel (Doppelrand)
 * Calcula matematicamente o raio interno exato para manter curvas concêntricas perfeitas.
 */
export function calculateDoubleBezel(outerRadius: number, padding: number): {
	outerRadius: number;
	padding: number;
	innerRadius: number;
} {
	return {
		outerRadius,
		padding,
		innerRadius: Math.max(0, outerRadius - padding),
	};
}

/**
 * Matriz de Estilo do Barber.fi High-End
 */
export const BARBERFI_PALETTE = {
	bgDark: '#080A0F',
	bgDarkSurface: '#10141D',
	bgDarkElevated: '#171D2A',
	bgOffWhite: '#FBF9F5',
	bgPureWhite: '#FFFFFF',
	brandBlue: '#0066FF',
	brandBlueGlow: 'rgba(0, 102, 255, 0.25)',
	brandAmber: '#D97706',
	brandAmberGold: '#F59E0B',
	brandEmerald: '#10B981',
	brandRose: '#F43F5E',
	textDarkPrimary: '#0F172A',
	textDarkSecondary: '#64748B',
	textLightPrimary: '#F8FAFC',
	textLightSecondary: '#94A3B8',
	borderHairlineDark: 'rgba(255, 255, 255, 0.08)',
	borderHairlineLight: 'rgba(15, 23, 42, 0.08)',
};
