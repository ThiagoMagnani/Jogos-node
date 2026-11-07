import React from 'react';
import Ceu from './Ceu';
import { estrelasDaNoite } from '../game/rules';
import { getNoite } from '../data/nights';

const ROTULOS = {
  perfeito: { texto: 'Perfeito', classe: 'perfeito', icone: '💖' },
  bom: { texto: 'Servível', classe: 'bom', icone: '😐' },
  ruim: { texto: 'Ruim', classe: 'ruim', icone: '💢' },
  tempo: { texto: 'Foi embora', classe: 'ruim', icone: '⌛' },
};

/** Balanço da noite: o que cada cliente achou, estrelas e moedas ganhas. */
export default function TelaResumo({ estado, dispatch }) {
  const noite = getNoite(estado.noite);
  const estrelas = estrelasDaNoite(estado.resultados);
  const ganhas = estado.resultados.reduce((soma, r) => soma + r.moedas, 0);

  return (
    <main className="intro">
      <Ceu escala={0.6 + noite.numero * 0.2} estrelas={50} />
      <div className="intro-cartao">
        <p className="intro-contagem">Noite {noite.numero} encerrada</p>
        <h2 className="intro-titulo">{noite.titulo}</h2>

        <div className="estrelas" aria-label={`${estrelas} de 3 estrelas`}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={n <= estrelas ? 'acesa' : ''}>
              ★
            </span>
          ))}
        </div>

        <ul className="resumo-lista">
          {estado.resultados.map((r) => {
            const info = ROTULOS[r.veredito];
            return (
              <li key={r.id} className={info.classe}>
                <span className="resumo-icone">{r.icon}</span>
                <strong>{r.nome}</strong>
                <span className="resumo-veredito">
                  {info.icone} {info.texto}
                </span>
                <span className="resumo-moedas">{r.moedas > 0 ? `+${r.moedas} 🪙` : '—'}</span>
                {r.presente && <span className="resumo-presente">🎁</span>}
              </li>
            );
          })}
        </ul>

        <p className="resumo-total">
          Gorjetas da noite: <strong>+{ganhas} 🪙</strong> · Total: <strong>{estado.moedas} 🪙</strong>
        </p>

        <button type="button" className="btn btn-neon btn-grande" onClick={() => dispatch({ type: 'IR', tela: 'loja' })} autoFocus>
          🛒 Visitar a Prateleira do Tião
        </button>
      </div>
    </main>
  );
}
