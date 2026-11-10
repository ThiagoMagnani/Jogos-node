import React from 'react';
import { formatarTempo, estrelasDaPos } from '../engine/campeonato';
import { MODELOS } from '../engine/carros';

const TITULOS = { 1: ['🏆 VITÓRIA!', 'vitoria'], 2: ['🥈 PÓDIO!', 'podio'], 3: ['🥉 PÓDIO!', 'podio'] };

/** Resultado da corrida: tabela, prêmio detalhado e próximos passos. */
export default function Resultado({ fase, resultado, premio, save, proxima, onProxima, onRepetir, onGaragem, onCampeonato }) {
  const [titulo, classe] = TITULOS[resultado.pos] || [`${resultado.pos}º LUGAR`, 'derrota'];
  const lider = resultado.tabela[0];
  const est = estrelasDaPos(resultado.pos);
  const dica = resultado.pos > 3
    ? 'Fique no top 3 para liberar a próxima pista. Gaste o prêmio em upgrades e tente de novo.'
    : resultado.pos > 1 ? 'Quase! Um upgrade de motor ou pneus pode render a vitória.' : 'Dominou! Veja se a próxima pista está liberada.';

  return (
    <main className={`fim ${classe}`}>
      <p className="titulo-sobre">{fase.emoji} {fase.nome}</p>
      <h1>{titulo}</h1>
      <div className="estrelas grandes">{[1, 2, 3].map((n) => <span key={n} className={est >= n ? 'on' : ''}>★</span>)}</div>

      <div className="fim-colunas">
        <section className="caixa">
          <h2>Classificação</h2>
          <ol className="tabela">
            {resultado.tabela.map((r) => (
              <li key={r.nome} className={r.jogador ? 'eu' : ''}>
                <em>{r.pos}º</em>
                <i style={{ background: r.cor }} />
                <span>{r.nome}<small>{MODELOS[r.modelo] ? MODELOS[r.modelo].nome : ''}</small></span>
                <b>
                  {r.tempo == null ? (r.voltasFeitas < resultado.voltas ? `${resultado.voltas - r.voltasFeitas}v atrás` : '—')
                    : r.pos === 1 ? formatarTempo(r.tempo) : `+${(r.tempo - lider.tempo).toFixed(2)}s`}
                </b>
              </li>
            ))}
          </ol>
          <ul className="fim-stats">
            <li><strong>{formatarTempo(resultado.melhorVolta)}</strong><span>sua melhor volta</span></li>
            <li><strong>{resultado.ultrap}</strong><span>ultrapassagens</span></li>
            <li><strong>{resultado.batidas}</strong><span>batidas</span></li>
          </ul>
        </section>

        <section className="caixa">
          <h2>Prêmio</h2>
          <ul className="premio">
            {premio.itens.map(([nome, v]) => (
              <li key={nome} className={v < 0 ? 'neg' : ''}><span>{nome}</span><b>{v < 0 ? '−' : '+'}R$ {Math.abs(v)}</b></li>
            ))}
            <li className="total"><span>TOTAL</span><b>R$ {premio.total}</b></li>
          </ul>
          <p className="grana">Saldo: R$ {save.dinheiro}</p>
          <p className="fim-frase">{dica}</p>
        </section>
      </div>

      <div className="fim-botoes">
        {proxima && <button type="button" className="btn-jogar" onClick={onProxima} autoFocus>▶ PRÓXIMA: {proxima.nome.toUpperCase()}</button>}
        <button type="button" className={proxima ? 'btn-sec' : 'btn-jogar'} onClick={onGaragem} autoFocus={!proxima}>🔧 GARAGEM</button>
        <button type="button" className="btn-sec" onClick={onRepetir}>↻ REPETIR PISTA</button>
        <button type="button" className="btn-link" onClick={onCampeonato}>Voltar ao campeonato</button>
      </div>
    </main>
  );
}
