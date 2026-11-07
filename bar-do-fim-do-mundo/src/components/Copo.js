import React from 'react';
import Medidor from './Medidor';
import { INGREDIENTE_POR_ID } from '../data/ingredients';
import { corDaMistura } from '../game/mixer';

/** O copo: mostra o líquido, os espaços de ingredientes, as técnicas e o botão de servir. */
export default function Copo({
  escolhidos,
  slots,
  tecnicas,
  tecnica,
  stats,
  alvos,
  bloqueado,
  onTecnica,
  onRemover,
  onLimpar,
  onServir,
}) {
  const cor = corDaMistura(escolhidos);
  const nivel = escolhidos.length / slots; // 0 a 1
  const vazio = escolhidos.length === 0;

  return (
    <section className="copo-painel" aria-label="Copo">
      <h3 className="painel-titulo">
        <span>🍸 Seu drink</span>
        <small>
          {escolhidos.length}/{slots} ingredientes
        </small>
      </h3>

      <div className="copo-area">
        <svg className="copo-svg" viewBox="0 0 120 150" role="img" aria-label="Taça de drink">
          <defs>
            <clipPath id="tacaBojo">
              <path d="M12 12 H108 L63 78 V78 H57 Z" />
            </clipPath>
            <linearGradient id="brilhoVidro" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".35" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g clipPath="url(#tacaBojo)">
            <rect
              className="liquido"
              x="0"
              y="12"
              width="120"
              height="70"
              fill={cor}
              style={{ transform: `translateY(${(1 - nivel) * 66}px)`, opacity: vazio ? 0 : 0.92 }}
            />
          </g>
          <path d="M12 12 H108 L63 78 H57 Z" fill="url(#brilhoVidro)" stroke="#e8d9ff" strokeWidth="3" strokeLinejoin="round" />
          <path d="M60 78 V130" stroke="#e8d9ff" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M38 134 H82" stroke="#e8d9ff" strokeWidth="4" strokeLinecap="round" />
        </svg>

        <div className="slots" role="list">
          {Array.from({ length: slots }, (_, i) => {
            const id = escolhidos[i];
            const ing = id ? INGREDIENTE_POR_ID[id] : null;
            return (
              <button
                key={i}
                type="button"
                role="listitem"
                className={`slot ${ing ? 'cheio' : ''}`}
                onClick={() => ing && onRemover(i)}
                disabled={!ing || bloqueado}
                title={ing ? `Remover ${ing.nome}` : 'Espaço livre'}
                aria-label={ing ? `Remover ${ing.nome}` : 'Espaço livre'}
              >
                {ing ? ing.icon : '＋'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="tecnicas" role="radiogroup" aria-label="Técnica de preparo">
        {tecnicas.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={tecnica === t.id}
            className={`tecnica ${tecnica === t.id ? 'ativa' : ''}`}
            onClick={() => onTecnica(t.id)}
            disabled={bloqueado}
            title={t.desc}
          >
            <span aria-hidden="true">{t.icon}</span> {t.nome}
          </button>
        ))}
      </div>

      <Medidor stats={stats} alvos={alvos} />

      <div className="copo-acoes">
        <button type="button" className="btn btn-fantasma" onClick={onLimpar} disabled={vazio || bloqueado}>
          🗑 Esvaziar
        </button>
        <button type="button" className="btn btn-neon" onClick={() => onServir(false)} disabled={vazio || bloqueado}>
          🛎 Servir
        </button>
      </div>
    </section>
  );
}
