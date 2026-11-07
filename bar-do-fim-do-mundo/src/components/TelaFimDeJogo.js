import React from 'react';
import Ceu from './Ceu';
import { getNoite } from '../data/nights';

/** O bar fechou mais cedo (acabaram as vidas). Dá para tentar a mesma noite de novo. */
export default function TelaFimDeJogo({ estado, dispatch }) {
  const noite = getNoite(estado.noite);
  return (
    <main className="intro">
      <Ceu escala={1} estrelas={50} />
      <div className="intro-cartao fim-de-jogo">
        <p className="intro-contagem">A noite acabou mais cedo</p>
        <h2 className="intro-titulo">O Último Gole fechou as portas</h2>
        <p className="historia-texto">
          Depois de tantos pedidos errados, a fila foi embora e o letreiro apagou. Mas o cometa ainda não caiu: dá para tentar a{' '}
          <strong>{noite.titulo}</strong> mais uma vez. Dessa vez, você já sabe o que cada cliente quer.
        </p>
        <div className="pausa-opcoes">
          <button type="button" className="btn btn-neon btn-grande" onClick={() => dispatch({ type: 'REPETIR_NOITE' })} autoFocus>
            🔁 Tentar a noite de novo
          </button>
          <button type="button" className="btn btn-fantasma" onClick={() => dispatch({ type: 'IR', tela: 'titulo' })}>
            🏠 Voltar ao título
          </button>
        </div>
      </div>
    </main>
  );
}
