import { getNoite, TOTAL_NOITES } from '../data/nights';
import { MELHORIAS, PACOTE_PISTAS } from '../data/upgrades';
import { VIDAS_BASE, tipoDoFinal } from './rules';

// ---------------------------------------------------------------------------
// Estado global do jogo (useReducer). Telas possíveis:
//  titulo · prologo · intro (introdução da noite) · bar · epilogo (história do fim da noite)
//  resumo · loja · fim_de_jogo · final
// ---------------------------------------------------------------------------

export const criarEstadoInicial = (preferencias = {}) => ({
  tela: 'titulo',
  jogador: 'Barman',
  tranquilo: false, // modo tranquilo: sem cronômetro
  som: true,
  ...preferencias,

  noite: 1,
  indiceCliente: 0,
  vidas: VIDAS_BASE,
  moedas: 0,
  presentes: [], // ids dos ingredientes ganhos de presente
  melhorias: {}, // { relogio: true, ... }
  pistasExtras: 0, // pacotes de pista comprados para a próxima noite
  pistasRestantes: 0,
  copoUsado: false,
  resultados: [], // resultados dos clientes da noite atual
  totais: { perfeito: 0, bom: 0, ruim: 0 },
  checkpoint: null, // foto do estado no início da noite (para "tentar de novo")
  final: null, // 'A' | 'B' | 'C'
  tutorialVisto: false,
});

const vidasMaximas = (estado) => VIDAS_BASE + (estado.melhorias.coracao ? 1 : 0);

function iniciarNoite(estado) {
  return {
    ...estado,
    tela: 'bar',
    indiceCliente: 0,
    vidas: vidasMaximas(estado),
    copoUsado: false,
    resultados: [],
    pistasRestantes: 1 + (estado.melhorias.lupa ? 2 : 0) + estado.pistasExtras,
    pistasExtras: 0,
    checkpoint: {
      moedas: estado.moedas,
      presentes: estado.presentes,
      pistasExtras: estado.pistasExtras,
      totais: estado.totais,
    },
  };
}

export function reducer(estado, acao) {
  switch (acao.type) {
    case 'NOVO_JOGO':
      return {
        ...criarEstadoInicial({ jogador: acao.jogador, tranquilo: acao.tranquilo, som: estado.som }),
        tela: 'prologo',
      };

    case 'CARREGAR':
      return { ...criarEstadoInicial(), ...acao.save };

    case 'IR':
      return { ...estado, tela: acao.tela };

    case 'ALTERNAR_SOM':
      return { ...estado, som: !estado.som };

    case 'ALTERNAR_TRANQUILO':
      return { ...estado, tranquilo: !estado.tranquilo };

    case 'TUTORIAL_VISTO':
      return { ...estado, tutorialVisto: true };

    case 'COMECAR_NOITE':
      return iniciarNoite(estado);

    case 'REPETIR_NOITE': {
      const cp = estado.checkpoint;
      if (!cp) return iniciarNoite(estado);
      return iniciarNoite({ ...estado, ...cp });
    }

    case 'USAR_PISTA':
      return estado.pistasRestantes > 0 ? { ...estado, pistasRestantes: estado.pistasRestantes - 1 } : estado;

    case 'SERVIDO': {
      // acao: { cliente, veredito, moedas }
      const { cliente, veredito, moedas } = acao;
      const falhou = veredito === 'ruim' || veredito === 'tempo';

      let vidas = estado.vidas;
      let copoUsado = estado.copoUsado;
      if (falhou) {
        if (estado.melhorias.copo && !copoUsado) copoUsado = true; // o Copo Encantado perdoa
        else vidas -= 1;
      }

      const ganhouPresente = veredito === 'perfeito' && cliente.presente && !estado.presentes.includes(cliente.presente.id);
      const chave = veredito === 'tempo' ? 'ruim' : veredito;

      return {
        ...estado,
        vidas,
        copoUsado,
        moedas: estado.moedas + moedas,
        presentes: ganhouPresente ? [...estado.presentes, cliente.presente.id] : estado.presentes,
        totais: { ...estado.totais, [chave]: estado.totais[chave] + 1 },
        resultados: [
          ...estado.resultados,
          { id: cliente.id, nome: cliente.nome, icon: cliente.icon, veredito, moedas, presente: ganhouPresente },
        ],
        final: cliente.final ? tipoDoFinal(veredito) : estado.final,
      };
    }

    case 'PROXIMO': {
      const noite = getNoite(estado.noite);
      const cliente = noite.clientes[estado.indiceCliente];
      if (cliente.final) return { ...estado, tela: 'final' };
      if (estado.vidas <= 0) return { ...estado, tela: 'fim_de_jogo' };
      if (estado.indiceCliente + 1 >= noite.clientes.length) return { ...estado, tela: 'epilogo' };
      return { ...estado, indiceCliente: estado.indiceCliente + 1 };
    }

    case 'COMPRAR': {
      const item = MELHORIAS.find((m) => m.id === acao.id) || (acao.id === PACOTE_PISTAS.id ? PACOTE_PISTAS : null);
      if (!item || estado.moedas < item.preco) return estado;
      if (item.id === PACOTE_PISTAS.id) {
        return { ...estado, moedas: estado.moedas - item.preco, pistasExtras: estado.pistasExtras + 1 };
      }
      if (estado.melhorias[item.id]) return estado;
      return { ...estado, moedas: estado.moedas - item.preco, melhorias: { ...estado.melhorias, [item.id]: true } };
    }

    case 'PROXIMA_NOITE':
      if (estado.noite >= TOTAL_NOITES) return estado;
      return { ...estado, noite: estado.noite + 1, tela: 'intro', indiceCliente: 0, resultados: [] };

    case 'REVIVER_ULTIMA_NOITE':
      // Volta ao começo da última noite, com as moedas e presentes que tinha antes dela.
      return iniciarNoite({ ...estado, ...(estado.checkpoint || {}), final: null, noite: TOTAL_NOITES });

    default:
      return estado;
  }
}
