import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {
	VoxPaperStage,
	NewspaperCutout,
	VoxAnimatedMap,
	HandDrawnMark,
	VoxEditorialTypography,
	VOX_COLORS,
} from '../components/vox';

export const VoxShowcase: React.FC = () => {
	return (
		<AbsoluteFill>
			<VoxPaperStage theme="light-newsprint" showGrid={true} camDrift={true}>
				{/* 1. Tipografia Editorial Superior */}
				<Sequence from={0} durationInFrames={180}>
					<div style={{position: 'absolute', top: 100, width: '100%', display: 'flex', justifyContent: 'center'}}>
						<VoxEditorialTypography
							kicker="[ ARQUIVO INVESTIGATIVO // RELATÓRIO VOX ]"
							title="O Ponto de Virada"
							subtitle="Documentos desclassificados revelam a verdadeira cronologia dos fatos."
							sourceNote="FONTE: ARQUIVO NACIONAL // BRASÍLIA, 1994"
							delay={0}
							align="center"
						/>
					</div>
				</Sequence>

				{/* 2. Recorte de Jornal Histórico com Marca-Texto */}
				<Sequence from={15} durationInFrames={165}>
					<div style={{position: 'absolute', top: 520, width: '100%', display: 'flex', justifyContent: 'center'}}>
						<NewspaperCutout
							headline="ARQUIVOS CONFIRMAM IMPACTO HISTÓRICO"
							date="SETEMBRO, 1994"
							source="GAZETA NACIONAL // REGISTRO"
							snippet="Registros de reuniões ministeriais comprovam que as diretrizes foram adotadas em regime de urgência, alterando a rota nacional."
							highlightedPhrase="alterando a rota nacional"
							w={940}
							h={420}
							angle={-1.8}
							delay={0}
						/>
					</div>
				</Sequence>

				{/* 3. Atlas Cartográfico 2.5D com Rota Animada */}
				<Sequence from={45} durationInFrames={135}>
					<div style={{position: 'absolute', top: 1040, width: '100%', display: 'flex', justifyContent: 'center'}}>
						<VoxAnimatedMap
							title="ROTA DA INFORMAÇÃO // 1994"
							subtitle="BRASÍLIA ➔ SÃO PAULO"
							width={940}
							height={520}
							startPoint={[180, 340]}
							endPoint={[740, 160]}
							delay={0}
						/>
					</div>
				</Sequence>

				{/* 4. Círculo Feito à Mão em Caneta Vermelha no Ponto Crítico */}
				<Sequence from={90} durationInFrames={90}>
					<div style={{position: 'absolute', top: 1120, right: 120}}>
						<HandDrawnMark
							type="circle"
							color={VOX_COLORS.penRed}
							width={320}
							height={180}
							delay={0}
						/>
					</div>
				</Sequence>

				{/* 5. Tarja de Legenda Editorial Documental Inferior */}
				<Sequence from={10} durationInFrames={170}>
					<div
						style={{
							position: 'absolute',
							bottom: 120,
							backgroundColor: VOX_COLORS.inkPrimary,
							padding: '16px 36px',
							borderRadius: 4,
							border: `1px solid ${VOX_COLORS.inkSecondary}`,
							boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
						}}
					>
						<span
							style={{
								fontFamily: 'Inter, sans-serif',
								fontSize: 28,
								color: VOX_COLORS.paperBase,
								fontWeight: 500,
								letterSpacing: 0.5,
							}}
						>
							E foi exatamente nesse instante que a história mudou.
						</span>
					</div>
				</Sequence>
			</VoxPaperStage>
		</AbsoluteFill>
	);
};
