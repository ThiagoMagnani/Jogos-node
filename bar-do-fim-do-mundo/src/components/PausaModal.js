import React from 'react';
import Modal from './Modal';

/** Menu de pausa: continuar, som, modo tranquilo e voltar ao título (o progresso fica salvo). */
export default function PausaModal({ estado, dispatch, onFechar }) {
  return (
    <Modal titulo="⏸ Pausado" onFechar={onFechar}>
      <p className="suave">O cronômetro está parado enquanto esta janela estiver aberta.</p>
      <div className="pausa-opcoes">
        <button type="button" className="btn btn-neon btn-grande" onClick={onFechar}>
          ▶ Continuar
        </button>
        <button type="button" className="btn btn-fantasma" onClick={() => dispatch({ type: 'ALTERNAR_SOM' })}>
          {estado.som ? '🔊 Som ligado' : '🔇 Som desligado'}
        </button>
        <button type="button" className="btn btn-fantasma" onClick={() => dispatch({ type: 'ALTERNAR_TRANQUILO' })}>
          {estado.tranquilo ? '🧘 Modo tranquilo: ligado (sem cronômetro)' : '⏱ Modo tranquilo: desligado'}
        </button>
        <button type="button" className="btn btn-fantasma" onClick={() => dispatch({ type: 'IR', tela: 'titulo' })}>
          🏠 Voltar ao título (progresso salvo)
        </button>
      </div>
    </Modal>
  );
}
