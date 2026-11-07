import React from 'react';
import ChipsStats from './ChipsStats';

/** A prateleira de ingredientes: um botão por garrafa. */
export default function Prateleira({ ingredientes, contagem, cheio, bloqueado, onEscolher }) {
  return (
    <section className="prateleira" aria-label="Ingredientes">
      <h3 className="painel-titulo">
        <span>🍾 Prateleira</span>
        <small>clique para adicionar ao copo</small>
      </h3>
      <div className="garrafas">
        {ingredientes.map((ing) => {
          const qtd = contagem[ing.id] || 0;
          return (
            <button
              key={ing.id}
              type="button"
              className={`garrafa ${ing.presente ? 'presente' : ''} ${qtd ? 'usada' : ''}`}
              onClick={() => onEscolher(ing.id)}
              disabled={bloqueado || cheio}
              title={ing.desc}
            >
              {ing.presente && <span className="fita">presente</span>}
              {qtd > 0 && <span className="garrafa-qtd">×{qtd}</span>}
              <span className="garrafa-icone" aria-hidden="true">
                {ing.icon}
              </span>
              <span className="garrafa-nome">{ing.nome}</span>
              <ChipsStats stats={ing.stats} pequeno />
            </button>
          );
        })}
      </div>
    </section>
  );
}
