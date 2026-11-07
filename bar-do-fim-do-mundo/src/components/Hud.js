import React from 'react';
import { TOTAL_NOITES } from '../data/nights';
import { VIDAS_BASE, horaDoBar } from '../game/rules';

/** Barra do topo: noite, relógio, progresso, vidas, moedas, lupas e botões. */
export default function Hud({ estado, noite, onGrimorio, onAjuda, onPausa }) {
  const total = noite.clientes.length;
  const maxVidas = VIDAS_BASE + (estado.melhorias.coracao ? 1 : 0);

  return (
    <header className="hud">
      <div className="hud-bloco">
        <span className="hud-noite">
          NOITE {noite.numero}/{TOTAL_NOITES}
        </span>
        <span className="hud-hora" title="Faltam poucas horas para o impacto">
          🕒 {horaDoBar(estado.indiceCliente, total)}
        </span>
      </div>

      <div className="hud-progresso" aria-label={`Cliente ${estado.indiceCliente + 1} de ${total}`}>
        {noite.clientes.map((c, i) => (
          <i key={c.id} className={`ponto ${i < estado.indiceCliente ? 'feito' : i === estado.indiceCliente ? 'atual' : ''}`} title={i <= estado.indiceCliente ? c.nome : '???'} />
        ))}
      </div>

      <div className="hud-bloco hud-direita">
        <span className="hud-vidas" aria-label={`${estado.vidas} vidas`} title="Vidas: caem quando o drink é ruim ou o cliente desiste">
          {Array.from({ length: maxVidas }, (_, i) => (
            <span key={i} className={i < estado.vidas ? 'cheio' : 'vazio'}>
              ❤
            </span>
          ))}
        </span>
        <span className="hud-item" title="Moedas">
          🪙 {estado.moedas}
        </span>
        <span className="hud-item" title="Lupas restantes nesta noite">
          🔍 {estado.pistasRestantes}
        </span>
        <button type="button" className="btn-icone" onClick={onGrimorio} aria-label="Abrir o Grimório" title="Grimório">
          📖
        </button>
        <button type="button" className="btn-icone" onClick={onAjuda} aria-label="Como jogar" title="Como jogar">
          ❓
        </button>
        <button type="button" className="btn-icone" onClick={onPausa} aria-label="Pausar" title="Pausar">
          ⏸
        </button>
      </div>
    </header>
  );
}
