import React from 'react';
import { STATS, STAT_KEYS } from '../data/stats';

/** Mostra os sabores de um ingrediente/técnica como etiquetinhas coloridas. */
export default function ChipsStats({ stats, pequeno = false }) {
  const itens = STAT_KEYS.filter((k) => stats[k]);
  if (itens.length === 0) return <span className="chips vazio">sem sabor</span>;
  return (
    <span className={`chips ${pequeno ? 'pequeno' : ''}`}>
      {itens.map((k) => {
        const v = stats[k];
        const texto = k === 'temp' ? (v > 0 ? `+${v}` : `${v}`) : v;
        return (
          <span key={k} className="chip" style={{ '--cor': STATS[k].cor }} title={`${STATS[k].label} ${texto}`}>
            <span className="chip-icone">{STATS[k].icon}</span>
            {texto}
          </span>
        );
      })}
    </span>
  );
}
