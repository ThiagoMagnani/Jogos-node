import React from 'react';
import { STATS, STAT_KEYS } from '../data/stats';
import { cumpreCondicao } from '../game/mixer';

const ESCALA = 6; // o medidor vai de 0 a 6 (temperatura: -6 a +6)

/** Medidor de sabores do copo + alvos revelados pela lupa. */
export default function Medidor({ stats, alvos = [] }) {
  return (
    <div className="medidor" aria-label="Medidor de sabores do drink">
      {STAT_KEYS.map((k) => {
        const valor = stats[k];
        const info = STATS[k];
        const ehTemp = k === 'temp';

        let esquerda = 0;
        let largura = (Math.min(Math.abs(valor), ESCALA) / ESCALA) * 100;
        if (ehTemp) {
          largura = (Math.min(Math.abs(valor), ESCALA) / ESCALA) * 50;
          esquerda = valor < 0 ? 50 - largura : 50;
        }

        const condsDoStat = alvos.filter((c) => c.stat === k);

        return (
          <div className="medidor-linha" key={k}>
            <span className="medidor-nome" title={info.label}>
              <span aria-hidden="true">{info.icon}</span> {ehTemp ? 'Temp.' : info.label}
            </span>
            <span className={`medidor-trilho ${ehTemp ? 'centro' : ''}`}>
              <span
                className="medidor-barra"
                style={{
                  left: `${esquerda}%`,
                  width: `${largura}%`,
                  background: ehTemp && valor < 0 ? '#7fd8ff' : info.cor,
                }}
              />
            </span>
            <span className="medidor-valor">{ehTemp && valor > 0 ? `+${valor}` : valor}</span>
            <span className="medidor-alvos">
              {condsDoStat.map((c, i) => (
                <span key={i} className={`alvo ${cumpreCondicao(stats, c) ? 'ok' : 'nao'}`}>
                  {c.op === 'min' ? '≥' : '≤'}
                  {c.value}
                </span>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}
