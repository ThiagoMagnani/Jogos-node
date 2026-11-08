import React from 'react';
import { NOMES_FASE } from '../engine/map';

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Resumo ao concluir uma fase da campanha. */
export default function TelaFase({ fase, fim, onContinuar }) {
  return (
    <main className="fim vitoria">
      <h1>FASE {fase} CONCLUÍDA<br /><small>{NOMES_FASE[fase]}</small></h1>
      <ul className="fim-stats">
        <li><strong>{fmt(fim.tempo)}</strong><span>TEMPO</span></li>
        <li><strong>{fim.abates}/{fim.total}</strong><span>ABATES</span></li>
        <li><strong>{fim.segredos}/{fim.segTotal}</strong><span>SEGREDOS</span></li>
        <li><strong>{fim.itens}</strong><span>ITENS</span></li>
      </ul>
      <p className="fim-frase">Armas e munição vão com você. A estação fica mais escura daqui para frente.</p>
      <button type="button" className="btn-jogar" onClick={onContinuar}>FASE {fase + 1} ▶</button>
    </main>
  );
}
