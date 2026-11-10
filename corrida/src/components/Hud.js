import React from 'react';
import { formatarTempo } from '../engine/campeonato';

/** Camada de HUD por cima do canvas: posição, voltas, ranking, velocímetro, nitro, contagem e mensagens. */
export default function Hud({ hud }) {
  const nitroPct = Math.round(hud.nitro * 100);
  return (
    <div className="hud-corrida" aria-live="polite">
      <div className="hud-topo">
        <div className="hud-pos"><b>{hud.pos}</b><small>/{hud.total}</small></div>
        <div className="hud-info">
          <span>VOLTA <b>{hud.volta}/{hud.voltas}</b></span>
          <span>TEMPO <b>{formatarTempo(hud.t)}</b></span>
          <span>VOLTA ATUAL <b>{formatarTempo(hud.voltaAtual)}</b></span>
          <span>MELHOR <b>{formatarTempo(hud.melhor)}</b></span>
        </div>
      </div>

      <ol className="hud-ranking">
        {hud.ranking.map((r, i) => (
          <li key={r.nome} className={r.jogador ? 'eu' : ''}>
            <em>{i + 1}</em>
            <i style={{ background: r.cor }} />
            <span>{r.nome}</span>
            <small>{i === 0 ? (r.terminou ? '🏁' : 'LÍDER') : `+${r.gap.toFixed(1)}s`}</small>
          </li>
        ))}
      </ol>

      <div className="hud-base">
        <div className="hud-vel"><b>{hud.vel}</b><small>KM/H</small></div>
        <div className="hud-nitro">
          <span>NITRO {hud.vacuo > 0.5 && <em className="vacuo">VÁCUO</em>}</span>
          <div className="barra-nitro"><i className={hud.nitroOn ? 'ligado' : ''} style={{ width: `${nitroPct}%` }} /></div>
        </div>
      </div>

      <div className="hud-msgs">
        {hud.msgs.map((m) => <p key={m.t} className={`msg ${m.tipo}`}>{m.texto}</p>)}
      </div>

      {hud.estado === 'contagem' && hud.cont > 0 && hud.cont <= 3 && <div className="contagem" key={hud.cont}>{hud.cont}</div>}
      {hud.go && <div className="contagem go">VAI!</div>}
      {hud.estado === 'chegada' && <div className="banner-chegada">🏁 {hud.pos}º LUGAR 🏁</div>}
    </div>
  );
}
