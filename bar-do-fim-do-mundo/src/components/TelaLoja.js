import React from 'react';
import Ceu from './Ceu';
import { MELHORIAS, PACOTE_PISTAS } from '../data/upgrades';
import { sfx } from '../game/sfx';

/** A Prateleira do Tião: gaste as gorjetas em melhorias antes da próxima noite. */
export default function TelaLoja({ estado, dispatch }) {
  const comprar = (item) => {
    if (estado.moedas < item.preco) {
      sfx.erro();
      return;
    }
    sfx.comprar();
    dispatch({ type: 'COMPRAR', id: item.id });
  };

  const itens = [...MELHORIAS, { ...PACOTE_PISTAS, consumivel: true }];

  return (
    <main className="intro">
      <Ceu escala={0.9} estrelas={50} cometa={false} />
      <div className="intro-cartao loja">
        <p className="intro-contagem">Entre uma noite e outra</p>
        <h2 className="intro-titulo">Prateleira do Tião</h2>
        <p className="loja-moedas">
          Você tem <strong>{estado.moedas} 🪙</strong>
          {estado.pistasExtras > 0 && <span> · 📜 {estado.pistasExtras} pista(s) extra(s) guardada(s)</span>}
        </p>

        <ul className="loja-lista">
          {itens.map((item) => {
            const comprado = !item.consumivel && estado.melhorias[item.id];
            const semDinheiro = estado.moedas < item.preco;
            return (
              <li key={item.id} className={comprado ? 'comprado' : ''}>
                <span className="lg-icone">{item.icon}</span>
                <div className="lg-texto">
                  <strong>{item.nome}</strong>
                  <p>{item.desc}</p>
                </div>
                {comprado ? (
                  <span className="loja-ok">✔ Comprado</span>
                ) : (
                  <button type="button" className={`btn ${semDinheiro ? 'btn-fantasma' : 'btn-neon'}`} onClick={() => comprar(item)} disabled={semDinheiro}>
                    {item.preco} 🪙
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <button type="button" className="btn btn-neon btn-grande" onClick={() => dispatch({ type: 'PROXIMA_NOITE' })} autoFocus>
          Seguir para a Noite {estado.noite + 1} →
        </button>
      </div>
    </main>
  );
}
