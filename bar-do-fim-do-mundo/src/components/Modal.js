import React, { useEffect } from 'react';

/** Janela sobreposta genérica. Fecha com Esc ou clicando fora. */
export default function Modal({ titulo, onFechar, children, larga = false }) {
  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.key === 'Escape') onFechar();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [onFechar]);

  return (
    <div className="modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div className={`modal ${larga ? 'larga' : ''}`} role="dialog" aria-modal="true" aria-label={titulo}>
        <header className="modal-topo">
          <h2>{titulo}</h2>
          <button type="button" className="btn-icone" onClick={onFechar} aria-label="Fechar">
            ✕
          </button>
        </header>
        <div className="modal-corpo">{children}</div>
      </div>
    </div>
  );
}
