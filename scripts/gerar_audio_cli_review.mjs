import { narrarTexto } from './narrar.mjs';
import path from 'node:path';

const texto = `Você realmente confia no código que a sua inteligência artificial escreve? A maioria dos desenvolvedores aceita a primeira resposta que a tela cospe... e depois passa a madrugada inteira caçando bugs invisíveis em produção. Pra acabar com isso, eu criei uma ferramenta de código aberto chamada cli cross review. Ela coloca três inteligências artificiais debatendo entre si no mesmo terminal. O primeiro modelo programa a solução. O segundo ataca impiedosamente procurando falhas, gargalos e furos de segurança. E o árbitro só aprova o código se a nota de confiança passar de oitenta e cinco por cento. O projeto é cem por cento gratuito e aberto no meu GitHub. Comenta a palavra SWARM aqui embaixo que meu bot te manda o link direto no direct! E se a ferramenta salvar o seu dia, deixa uma estrelinha lá no repositório pra apoiar o open source!`;

console.log('Iniciando geração de áudio...');
narrarTexto(texto, 'public/audio/locucao/narracao_cli_review.mp3', {
  voice: 'antonio',
  rate: '+4%', // Leve boost de ritmo para estilo Reels rápido
  pitch: '+0Hz',
  transcrever: true
});
