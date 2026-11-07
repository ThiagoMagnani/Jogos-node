import {
  CLIENTES_NOITE_1,
  CLIENTES_NOITE_2,
  CLIENTES_NOITE_3,
  CLIENTES_NOITE_4,
  CLIENTES_NOITE_5,
} from './customers';

// Páginas de história: { texto, tipo }. Tipos: 'narrador' (padrão), 'carta', 'destaque'.
// {nome} é trocado pelo nome do jogador.
const p = (texto) => ({ texto });
const carta = (texto, assinatura) => ({ texto, tipo: 'carta', assinatura });
const destaque = (texto) => ({ texto, tipo: 'destaque' });

export const PROLOGO = [
  p('Quarenta dias atrás, uma luz nova apareceu no céu. Os astrônomos a batizaram de Ouroboro: um cometa do tamanho de uma cidade, vindo de onde a matemática desiste.'),
  p('Os cálculos foram claros. Impacto em cinco noites. Os governos pararam de dar entrevistas. As igrejas lotaram, depois esvaziaram. Os bares, um por um, baixaram suas portas de ferro.'),
  destaque('Todos, menos um.'),
  p('O Último Gole fica no fim da Rua das Sombras, onde o asfalto acaba e o mundo, aparentemente, também. O dono, o velho Tião, sumiu há três dias. Deixou as chaves, um grimório de receitas e um bilhete.'),
  carta(
    '{nome}, mantenha as luzes acesas. Quem vier, você serve. Quem sofrer, você escuta. O resto, o mundo resolve.',
    '— Tião'
  ),
  p('O sino da porta toca. Cinco noites. Um balcão. O fim do mundo pode esperar até o último pedido.'),
];

export const NOITES = [
  {
    numero: 1,
    titulo: 'A Primeira Noite',
    faltam: 5,
    intro: [
      p('O céu está cor de ferrugem. O cometa já é visível a olho nu e ocupa metade da janela do bar, como uma segunda lua de mau humor.'),
      p('Você acende o letreiro, enxuga o balcão e confere as garrafas. O primeiro cliente chega antes mesmo de você terminar.'),
    ],
    outro: [
      p('Quando o último cliente sai, o céu já está cor de cobre. Debaixo do balcão, uma página nova aparece no grimório, com a letra do Tião:'),
      carta('Quem for bem servido deixa algo para trás. Guarde. Você vai precisar.', '— T.'),
    ],
    clientes: CLIENTES_NOITE_1,
  },
  {
    numero: 2,
    titulo: 'A Noite dos Esquecidos',
    faltam: 4,
    intro: [
      p('A notícia se espalhou: há um bar aberto no fim da Rua das Sombras. Hoje a fila dá a volta no quarteirão. Chegam os esquecidos, os que ninguém mais atende.'),
      p('Nas prateleiras, ingredientes novos apareceram durante o dia. Ninguém sabe quem os trouxe.'),
    ],
    outro: [
      p('Na gaveta do caixa você encontra uma fotografia antiga: Tião, jovem, ao lado de uma mulher cujo rosto é só um borrão de luz.'),
      p('No verso, escrito a caneta: "Ela voltará. Deixe a luz acesa."'),
    ],
    clientes: CLIENTES_NOITE_2,
  },
  {
    numero: 3,
    titulo: 'A Noite do Dragão',
    faltam: 3,
    intro: [
      p('O cometa agora tem cauda, e a cauda tem cor. Os pássaros pararam de cantar. A cidade inteira parece prender a respiração.'),
      p('Os clientes ficam mais estranhos... e mais honestos. É como se o fim do mundo tirasse a maquiagem de todo mundo.'),
    ],
    outro: [
      p('O dragão deixa uma gorjeta na forma de um conselho, bem baixinho, antes de sair:'),
      carta('Se alguém chegar com a luz do céu nos olhos, não pergunte nada. Sirva.', '— Brasílio'),
    ],
    clientes: CLIENTES_NOITE_3,
  },
  {
    numero: 4,
    titulo: 'A Noite das Cartas',
    faltam: 2,
    intro: [
      p('O ar zumbe. As luzes da rua piscam sem motivo. Hoje o balcão parece maior: você aprendeu a trabalhar com mais um ingrediente de uma vez só.'),
      p('Um vento estranho entra pela fresta da janela. Ele traz cheiro de papel velho e de chuva.'),
    ],
    outro: [
      p('Edgar deixou a bolsa de couro no balcão. Dentro, um único envelope, amarelado, com o seu nome na letra do Tião.'),
      carta(
        'Se o corvo já chegou, você está lendo isto. Escute, {nome}: o Ouroboro não vem destruir nada. Vem visitar. Há dez mil anos, eu a servi neste mesmo balcão. Ela é uma viajante solitária, e nunca teve uma bebida só dela. Prometi que, quando voltasse, haveria uma. A receita está no fim do grimório: três lembranças que brilhem, uma saudade (doce com amargo), uma pitada de esperança e calor de gente, nem quente nem frio. E nenhum arrependimento — e arrependimento, você sabe, é azedo. Se der certo, volto com pão.',
        '— Tião'
      ),
      p('Você lê duas vezes. Depois guarda a carta no bolso, perto do coração, e vai arrumar o bar para a última noite.'),
    ],
    clientes: CLIENTES_NOITE_4,
  },
  {
    numero: 5,
    titulo: 'A Última Noite',
    faltam: 1,
    intro: [
      p('O céu é todo luz. Lá fora, as pessoas se abraçam nas calçadas e não têm mais pressa de nada. Aqui dentro, o balcão brilha.'),
      p('Faltam poucas horas. Todos os ingredientes estão na prateleira. Se alguém vai aparecer com a luz do céu nos olhos, será esta noite.'),
      destaque('Faça a melhor noite da sua vida.'),
    ],
    outro: [],
    clientes: CLIENTES_NOITE_5,
  },
];

export const TOTAL_NOITES = NOITES.length;

export const slotsDaNoite = (numero) => (numero >= 4 ? 4 : 3);

export const getNoite = (numero) => NOITES[numero - 1];

// ------------------------------------------------------------------ FINAIS
// Retorna as páginas da história final, de acordo com o tipo (A, B ou C),
// o nome do jogador e os presentes que ele ganhou ao longo da campanha.
export function paginasDoFinal(tipo, presentes) {
  const cameos = [];
  if (presentes.includes('lembranca')) cameos.push('Alfredo aparece no canto, translúcido e emocionado, e ergue um copo vazio num brinde silencioso.');
  if (presentes.includes('faisca')) cameos.push('Unidade-7 pisca a luz azul do peito no ritmo de uma canção que ninguém lhe ensinou.');
  if (presentes.includes('escama')) cameos.push('Brasílio sopra uma fumacinha de dragão em forma de coração e finge que foi sem querer.');

  if (tipo === 'A') {
    return [
      p('A Visitante leva o copo aos lábios. Por um segundo, o mundo inteiro prende a respiração. Lá fora, o cometa para de cair.'),
      p('— Tem gosto de casa — ela sussurra. — Eu não lembrava que casa tinha gosto.'),
      p('Ouroboro nunca foi uma ameaça. É uma viajante que cruza o universo a cada dez mil anos, procurando um lugar onde alguém lhe ofereça uma cadeira. Da última vez, um jovem barman a viu passar e prometeu deixar a luz acesa.'),
      p('Ela fica até o sol nascer. Conta histórias de estrelas que nasceram ouvindo música. Ri de uma piada do Inspetor Bigode, que escutava atrás da porta.'),
      ...cameos.map(p),
      p('Quando ela se levanta, a cauda do cometa varre o céu em ouro e violeta e passa sobre a cidade sem tocar em nenhum telhado. O mundo, ao amanhecer, parece recém-lavado.'),
      p('O sino da porta toca. É Tião, com uma sacola de pão quente. — Sabia que você daria conta, {nome}. — Ele olha para o céu e sorri. — O mundo só precisava de um bar aberto.'),
      destaque('E assim, o Último Gole virou o Primeiro Gole de um novo dia.'),
    ];
  }

  if (tipo === 'B') {
    return [
      p('A Visitante prova a bebida e fica em silêncio. — Está quase — diz, gentil. — Falta alguma coisa. Mas obrigada por tentar.'),
      p('Ela não destrói o mundo. Também não consegue ficar. A cauda do cometa roça a atmosfera: o céu pega fogo em verde e rosa, os oceanos tremem, os relógios param por uma hora.'),
      ...cameos.map(p),
      p('Quando o sol nasce, o mundo está de pé: um pouco torto, um pouco mais brilhante e muito mais silencioso. As pessoas saem às ruas e se olham, sem saber o que dizer.'),
      p('Tião não volta, mas deixa um bilhete debaixo do balcão: "Na próxima passagem, a gente acerta a receita." Em dez mil anos, o Último Gole ainda estará de portas abertas.'),
      destaque('O mundo continua. E você sabe exatamente o que errou.'),
    ];
  }

  return [
    p('A Visitante olha o copo por muito tempo. — Não é isso. Mas é gentil da sua parte ter tentado. — Ela bebe mesmo assim, até a última gota.'),
    p('Lá fora, o cometa continua descendo. Não por maldade, mas por falta de um motivo para parar. O céu fica branco. O silêncio é enorme.'),
    p('Então as portas do bar se abrem. Um por um, entram os clientes dessas cinco noites. Ninguém diz nada. Alguém liga a jukebox.'),
    ...cameos.map(p),
    p('Você serve a rodada final, de graça. A Visitante se senta no meio de todo mundo e, pela primeira vez em dez mil anos, não bebe sozinha.'),
    destaque('Não era o fim que alguém queria. Mas, no fim do mundo, o Último Gole estava aberto, e ninguém bebeu sozinho.'),
  ];
}

export const FINAIS = {
  A: { titulo: 'FINAL A — O AMANHECER', subtitulo: 'O mundo foi salvo por um drink perfeito.', icon: '🌅' },
  B: { titulo: 'FINAL B — QUASE LÁ', subtitulo: 'O mundo continua, mas a receita ficou em aberto.', icon: '🌌' },
  C: { titulo: 'FINAL C — O ÚLTIMO BRINDE', subtitulo: 'O mundo acabou. Mas ninguém bebeu sozinho.', icon: '🥂' },
};
