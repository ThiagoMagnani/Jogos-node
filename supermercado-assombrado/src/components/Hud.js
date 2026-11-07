import React from 'react';
import { ARMAS } from '../engine/game';

const rosto = (v) => (v > 70 ? '😎' : v > 40 ? '🙂' : v > 20 ? '😟' : '😵');

/** Painel inferior: vida, arma/munição, cartões, abates e mensagens engraçadas. */
export default function Hud({ hud }) {
  const arma = ARMAS[hud.arma];
  return (
    <>
      <div className="msgs" aria-live="polite">
        {hud.msgs.map((m, i) => (
          <p key={`${m.texto}-${i}`} className={`msg ${m.tipo}`}>{m.texto}</p>
        ))}
      </div>
      <footer className="hud">
        <div className="hud-bloco hud-vida">
          <span className="hud-rotulo">VIDA</span>
          <div className="barra"><i style={{ width: `${hud.vida}%` }} className={hud.vida < 30 ? 'critica' : ''} /></div>
          <b>{hud.vida}</b>
        </div>
        <div className="hud-rosto" aria-hidden="true">{rosto(hud.vida)}</div>
        <div className="hud-bloco">
          <span className="hud-rotulo">{arma.nome.toUpperCase()}</span>
          <b className="hud-municao">{hud.municao} <small>{arma.municao}</small></b>
        </div>
        <div className="hud-armas">
          {Object.keys(ARMAS).map((k) => (
            <span key={k} className={`slot-arma ${hud.arma === k ? 'ativa' : ''} ${hud.armas[k] ? '' : 'bloq'}`}>{ARMAS[k].tecla}</span>
          ))}
        </div>
        <div className="hud-bloco hud-chaves">
          <span className="hud-rotulo">CARTÕES</span>
          <span><i className={`cartao vermelho ${hud.chaves.vermelha ? 'tem' : ''}`} /> <i className={`cartao azul ${hud.chaves.azul ? 'tem' : ''}`} /></span>
        </div>
        <div className="hud-bloco">
          <span className="hud-rotulo">ABATES</span>
          <b>{hud.abates}/{hud.total}</b>
        </div>
      </footer>
    </>
  );
}
