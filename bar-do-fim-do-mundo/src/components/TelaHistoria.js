import React, { useCallback, useEffect, useState } from 'react';
import Ceu from './Ceu';
import useMaquinaDeEscrever from '../hooks/useMaquinaDeEscrever';
import { substituirNome } from '../game/rules';
import { sfx } from '../game/sfx';

/**
 * Tela de história: mostra as páginas uma a uma, com efeito de máquina de escrever.
 * Clique / espaço / Enter: completa a página, depois avança. Ao fim chama `onFim`.
 */
export default function TelaHistoria({ cabecalho, paginas, jogador, rotuloFim = 'Continuar', onFim, escala = 1.1, children }) {
  const [pagina, setPagina] = useState(0);
  const atual = paginas[pagina];
  const texto = substituirNome(atual ? atual.texto : '', jogador);
  const { exibido, completo, pular } = useMaquinaDeEscrever(texto, atual && atual.tipo === 'carta' ? 14 : 24);
  const ultima = pagina >= paginas.length - 1;

  // Sem páginas (ex.: noite sem epílogo): segue direto.
  useEffect(() => {
    if (paginas.length === 0) onFim();
  }, [paginas.length, onFim]);

  const avancar = useCallback(() => {
    if (!completo) {
      pular();
      return;
    }
    if (ultima) return; // na última página o jogador usa o botão
    sfx.pagina();
    setPagina((p) => p + 1);
  }, [completo, pular, ultima]);

  useEffect(() => {
    const aoTeclar = (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        avancar();
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [avancar]);

  if (!atual) return null;

  const tipo = atual.tipo || 'narrador';

  return (
    <main className="historia" onClick={avancar}>
      <Ceu escala={escala} estrelas={80} />
      <div className="historia-conteudo">
        {cabecalho && <p className="historia-cabecalho">{cabecalho}</p>}

        <div className={`historia-pagina ${tipo}`} key={pagina}>
          <p className="historia-texto">{exibido}</p>
          {tipo === 'carta' && completo && atual.assinatura && <p className="carta-assinatura">{atual.assinatura}</p>}
        </div>

        <div className="historia-rodape">
          <span className="historia-contador">
            {pagina + 1} / {paginas.length}
          </span>
          {completo && !ultima && <span className="historia-dica">toque para continuar ▾</span>}
          {completo && ultima && (
            <button
              type="button"
              className="btn btn-neon btn-grande"
              onClick={(e) => {
                e.stopPropagation();
                onFim();
              }}
              autoFocus
            >
              {rotuloFim}
            </button>
          )}
        </div>

        {!ultima && (
          <button
            type="button"
            className="btn btn-link historia-pular"
            onClick={(e) => {
              e.stopPropagation();
              setPagina(paginas.length - 1);
            }}
          >
            pular história »
          </button>
        )}
        {children}
      </div>
    </main>
  );
}
