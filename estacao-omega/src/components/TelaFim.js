import React from 'react';

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Fim de jogo: vitória da campanha, derrota ou fim da Horda. */
export default function TelaFim({ fim, modo, onDeNovo, onTitulo }) {
  const venceu = fim.resultado === 'venceu';
  return (
    <main className={`fim ${venceu ? 'vitoria' : 'derrota'}`}>
      <h1>{venceu ? 'ÔMEGA DESTRUÍDO' : modo === 'horda' ? `VOCÊ CAIU NA ONDA ${fim.onda}` : 'MISSÃO FALHOU'}</h1>
      <p className="fim-frase">
        {venceu ? 'A colmeia silenciou. As luzes voltam, uma a uma. Você cumpriu a missão, fuzileiro.' : modo === 'horda' ? 'Eles nunca param. Dá para chegar mais longe com melhorias melhores.' : 'A estação engoliu mais um. Tente outra estratégia.'}
      </p>
      <ul className="fim-stats">
        <li><strong>{fmt(fim.tempo)}</strong><span>TEMPO</span></li>
        <li><strong>{fim.abates}</strong><span>ABATES</span></li>
        <li><strong>{modo === 'horda' ? fim.onda : `${fim.segredos}/${fim.segTotal}`}</strong><span>{modo === 'horda' ? 'ONDA' : 'SEGREDOS (ÚLTIMA FASE)'}</span></li>
        <li><strong>{fim.itens}</strong><span>ITENS</span></li>
      </ul>
      <div className="fim-botoes">
        <button type="button" className="btn-jogar" onClick={onDeNovo}>{modo === 'horda' ? 'JOGAR HORDA DE NOVO' : venceu ? 'JOGAR DE NOVO' : fim.fase === 5 ? 'TENTAR O CHEFÃO DE NOVO' : 'TENTAR A FASE DE NOVO'}</button>
        <button type="button" className="btn-link" onClick={onTitulo}>Voltar ao título</button>
      </div>
    </main>
  );
}
