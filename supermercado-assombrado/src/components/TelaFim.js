import React, { useMemo } from 'react';

const DERROTAS = [
  'Você foi demitido do mercado (e da vida).',
  'O carrinho apresentou a conta. Era alta.',
  'Fim de expediente. O seu.',
  'Foi nota fiscal sem cupom: não tem troco.',
  'Você virou promoção: leve 1, pague nada.',
];

/** Tela de vitória ou derrota, com estatísticas da partida. */
export default function TelaFim({ fim, onDeNovo, onTitulo }) {
  const vitoria = fim && fim.resultado === 'venceu';
  const frase = useMemo(() => DERROTAS[Math.floor(Math.random() * DERROTAS.length)], []);
  const seg = Math.round(fim ? fim.tempo : 0);
  const tempo = `${Math.floor(seg / 60)}min ${String(seg % 60).padStart(2, '0')}s`;

  return (
    <main className={`fim ${vitoria ? 'vitoria' : 'derrota'}`}>
      <h1>{vitoria ? '🌅 VOCÊ ESCAPOU!' : '💀 FIM DE EXPEDIENTE'}</h1>
      <p className="fim-frase">
        {vitoria
          ? 'O sol nasce na porta do mercado. O Gerente foi demitido, os carrinhos voltaram a ser carrinhos e você nunca mais vai fazer compras à noite.'
          : frase}
      </p>
      <ul className="fim-stats">
        <li><strong>{fim ? fim.abates : 0}/{fim ? fim.total : 0}</strong><span>inimigos derrotados</span></li>
        <li><strong>{tempo}</strong><span>tempo de jogo</span></li>
        <li><strong>{fim ? fim.itens : 0}</strong><span>itens coletados</span></li>
        <li><strong>{fim ? fim.vida : 0}%</strong><span>vida restante</span></li>
      </ul>
      <div className="fim-botoes">
        <button type="button" className="btn-jogar" onClick={onDeNovo} autoFocus>
          ↻ {vitoria ? 'JOGAR DE NOVO' : 'TENTAR DE NOVO'}
        </button>
        <button type="button" className="btn-link" onClick={onTitulo}>
          voltar ao título
        </button>
      </div>
    </main>
  );
}
