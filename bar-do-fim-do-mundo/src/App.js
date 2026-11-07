import React, { useEffect, useReducer } from 'react';
import { criarEstadoInicial, reducer } from './game/state';
import { salvarJogo } from './game/storage';
import { definirMudo } from './game/sfx';
import { getNoite, PROLOGO } from './data/nights';

import TelaTitulo from './components/TelaTitulo';
import TelaHistoria from './components/TelaHistoria';
import TelaIntro from './components/TelaIntro';
import TelaBar from './components/TelaBar';
import TelaResumo from './components/TelaResumo';
import TelaLoja from './components/TelaLoja';
import TelaFimDeJogo from './components/TelaFimDeJogo';
import TelaFinal from './components/TelaFinal';

/**
 * Componente raiz. Todo o estado do jogo vive aqui (useReducer) e cada "tela" é um componente
 * que recebe o estado e a função dispatch. A propriedade `estado.tela` decide qual aparece.
 */
export default function App() {
  const [estado, dispatch] = useReducer(reducer, undefined, () => criarEstadoInicial());

  // Mantém o módulo de áudio em sincronia com o botão de som.
  useEffect(() => {
    definirMudo(!estado.som);
  }, [estado.som]);

  // Salva o progresso a cada mudança (menos na tela de título).
  useEffect(() => {
    if (estado.tela !== 'titulo') salvarJogo(estado);
  }, [estado]);

  const noite = getNoite(estado.noite);

  let tela;
  switch (estado.tela) {
    case 'titulo':
      tela = <TelaTitulo estado={estado} dispatch={dispatch} />;
      break;
    case 'prologo':
      tela = (
        <TelaHistoria
          key="prologo"
          cabecalho="PRÓLOGO"
          paginas={PROLOGO}
          jogador={estado.jogador}
          rotuloFim="Começar a Noite 1"
          onFim={() => dispatch({ type: 'IR', tela: 'intro' })}
        />
      );
      break;
    case 'intro':
      tela = <TelaIntro key={`intro-${estado.noite}`} estado={estado} dispatch={dispatch} />;
      break;
    case 'bar':
      tela = <TelaBar estado={estado} dispatch={dispatch} />;
      break;
    case 'epilogo':
      tela = (
        <TelaHistoria
          key={`epilogo-${estado.noite}`}
          cabecalho={`FIM DA NOITE ${estado.noite}`}
          paginas={noite.outro}
          jogador={estado.jogador}
          rotuloFim="Ver o balanço da noite"
          onFim={() => dispatch({ type: 'IR', tela: 'resumo' })}
        />
      );
      break;
    case 'resumo':
      tela = <TelaResumo estado={estado} dispatch={dispatch} />;
      break;
    case 'loja':
      tela = <TelaLoja estado={estado} dispatch={dispatch} />;
      break;
    case 'fim_de_jogo':
      tela = <TelaFimDeJogo estado={estado} dispatch={dispatch} />;
      break;
    case 'final':
      tela = <TelaFinal estado={estado} dispatch={dispatch} />;
      break;
    default:
      tela = null;
  }

  return <div className="app">{tela}</div>;
}
