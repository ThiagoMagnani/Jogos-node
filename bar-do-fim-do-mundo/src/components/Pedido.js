import React, { useMemo } from 'react';
import { descreverPista } from '../game/mixer';

/**
 * O balão de fala com o pedido do cliente. As pistas são botões: clicar numa pista gasta uma
 * "lupa" e revela os números exatos por trás da frase.
 * Depois de servir, todas as pistas mostram ✔/✖ e os números (aprender errando faz parte).
 */
export default function Pedido({ cliente, reveladas, avaliadas, servido, podeRevelar, onRevelar }) {
  // Numera só as pistas (as partes que não são texto solto).
  const partes = useMemo(() => {
    let n = 0;
    return cliente.pedido.map((parte) => (typeof parte === 'string' ? { texto: parte } : { pista: parte, idx: n++ }));
  }, [cliente]);

  return (
    <div className="balao">
      <p className="balao-chegada">{cliente.chegada}</p>
      <p className="balao-fala">
        <span className="balao-aspas">“</span>
        {partes.map((parte, i) => {
          if (parte.texto !== undefined) return <span key={i}>{parte.texto}</span>;

          const { pista, idx } = parte;
          const revelada = reveladas.includes(idx);
          const marca = avaliadas ? (avaliadas[idx].ok ? 'ok' : 'nao') : '';
          const mostrarAlvo = revelada || servido;
          return (
            <button
              key={i}
              type="button"
              className={`pista ${revelada ? 'revelada' : ''} ${marca}`}
              onClick={() => onRevelar(idx)}
              disabled={servido}
              title={revelada ? 'Pista revelada' : podeRevelar ? 'Usar uma lupa para revelar os números' : 'Sem lupas nesta noite'}
            >
              {pista.texto}
              {mostrarAlvo && <span className="pista-alvo">{descreverPista(pista)}</span>}
              {marca && (
                <span className="pista-marca" aria-label={marca === 'ok' ? 'cumprida' : 'não cumprida'}>
                  {marca === 'ok' ? '✔' : '✖'}
                </span>
              )}
            </button>
          );
        })}
        <span className="balao-aspas">”</span>
      </p>
    </div>
  );
}
