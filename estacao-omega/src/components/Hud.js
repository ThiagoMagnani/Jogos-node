import React from 'react';
import { ARMAS } from '../engine/game';

/** Painel inferior: vida, escudo, armas e munição, cartões, poderes e (na Horda) onda e créditos. */
export default function Hud({ hud }) {
  const arma = ARMAS[hud.arma];
  const pct = (v, m) => `${Math.max(0, Math.min(100, (v / m) * 100))}%`;
  return (
    <>
      <div className="msgs" aria-live="polite">
        {hud.msgs.map((m, i) => (<p key={`${m.texto}-${i}`} className={`msg ${m.tipo}`}>{m.texto}</p>))}
      </div>
      <footer className="hud">
        <div className="hud-bloco hud-vida">
          <span className="hud-rotulo">VIDA {hud.veneno && <b className="veneno">☠ VENENO</b>}</span>
          <div className="barra"><i style={{ width: pct(hud.vida, hud.vidaMax) }} className={hud.vida < 30 ? 'critica' : ''} /></div>
          <div className="barra escudo"><i style={{ width: pct(hud.escudo, hud.escudoMax) }} /></div>
          <b>{hud.vida} <small>/ {hud.escudo} 🛡</small></b>
        </div>
        <div className="hud-bloco">
          <span className="hud-rotulo">{arma.nome.toUpperCase()}</span>
          <b className="hud-municao">{hud.municao[hud.arma]} <small>{arma.mun}</small></b>
        </div>
        <div className="hud-armas">
          {Object.keys(ARMAS).map((k) => (
            <span key={k} title={ARMAS[k].nome} className={`slot-arma ${hud.arma === k ? 'ativa' : ''} ${hud.armas[k] ? '' : 'bloq'}`}>
              {ARMAS[k].tecla}<small>{hud.armas[k] ? hud.municao[k] : '-'}</small>
            </span>
          ))}
        </div>
        <div className="hud-bloco">
          <span className="hud-rotulo">PODERES</span>
          <span className="poderes">
            <i className={`poder ${hud.dash > 0 ? 'rec' : ''}`} style={{ '--r': pct(hud.dash, 1) }}>Q</i>
            <i className={`poder ${hud.onda > 0 ? 'rec' : ''}`} style={{ '--r': pct(hud.onda, 1) }}>F</i>
          </span>
        </div>
        {hud.frag != null && <div className="hud-bloco"><span className="hud-rotulo">MAPA</span><b>{hud.frag}/5</b></div>}
        {hud.modo === 'campanha' ? (
          <div className="hud-bloco hud-chaves">
            <span className="hud-rotulo">CARTÕES</span>
            <span>
              <i className={`cartao vermelho ${hud.chaves.vermelha ? 'tem' : ''}`} /> <i className={`cartao azul ${hud.chaves.azul ? 'tem' : ''}`} /> <i className={`cartao amarelo ${hud.chaves.amarela ? 'tem' : ''}`} />
            </span>
          </div>
        ) : (
          <div className="hud-bloco"><span className="hud-rotulo">ONDA {hud.horda.onda}{hud.horda.contagem > 0 ? ` · ${hud.horda.contagem}s` : ''}</span><b>💰 {hud.horda.creditos}</b></div>
        )}
        <div className="hud-bloco">
          <span className="hud-rotulo">{hud.horda ? 'RESTANTES' : 'ABATES'}</span>
          <b>{hud.horda ? hud.horda.vivos : `${hud.abates}/${hud.total}`}</b>
        </div>
      </footer>
    </>
  );
}
