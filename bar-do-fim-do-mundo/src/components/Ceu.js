import React, { useMemo } from 'react';

// Gerador pseudoaleatório simples: as estrelas ficam sempre nos mesmos lugares.
function gerador(semente) {
  let s = semente;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/** Céu estrelado com o cometa Ouroboro. `escala` controla o tamanho do cometa. */
export default function Ceu({ escala = 1, estrelas = 70, cometa = true, className = '' }) {
  const lista = useMemo(() => {
    const r = gerador(42);
    return Array.from({ length: estrelas }, (_, i) => ({
      id: i,
      x: r() * 100,
      y: r() * 100,
      tam: r() * 2.2 + 0.8,
      atraso: r() * 4,
      opac: r() * 0.7 + 0.3,
    }));
  }, [estrelas]);

  return (
    <div className={`ceu ${className}`} aria-hidden="true">
      {lista.map((e) => (
        <i
          key={e.id}
          className="estrela"
          style={{ left: `${e.x}%`, top: `${e.y}%`, width: e.tam, height: e.tam, opacity: e.opac, animationDelay: `${e.atraso}s` }}
        />
      ))}
      {cometa && (
        <div className="cometa" style={{ '--escala': escala }}>
          <span className="cometa-cauda" />
          <span className="cometa-nucleo" />
        </div>
      )}
    </div>
  );
}
