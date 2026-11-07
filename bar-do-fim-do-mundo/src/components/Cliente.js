import React from 'react';

/** O cliente no balcão: emoji grande, plaquinha com o nome e barra de paciência. */
export default function Cliente({ cliente, humor, paciencia }) {
  const urgente = paciencia !== null && paciencia < 0.3;
  return (
    <div className={`cliente ${urgente ? 'urgente' : ''} ${cliente.final ? 'final' : ''}`} style={{ '--cor-cliente': cliente.cor }}>
      <div className="cliente-corpo">
        <span className="cliente-emoji" role="img" aria-label={cliente.nome}>
          {cliente.icon}
        </span>
        {humor && <span className="cliente-humor">{humor}</span>}
      </div>
      <div className="cliente-placa">
        <strong>{cliente.nome}</strong>
        <small>{cliente.titulo}</small>
      </div>
      {paciencia !== null && (
        <div className="paciencia" role="progressbar" aria-label="Paciência do cliente" aria-valuenow={Math.round(paciencia * 100)} aria-valuemin={0} aria-valuemax={100}>
          <span className="paciencia-barra" style={{ width: `${paciencia * 100}%` }} />
        </div>
      )}
    </div>
  );
}
