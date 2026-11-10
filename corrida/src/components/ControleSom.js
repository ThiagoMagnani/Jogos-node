import React, { useEffect, useState } from 'react';
import { estadoAudio, aoMudarAudio, alternarMusica, alternarSons } from '../engine/audio';

/** Mantém o React sincronizado com o estado do áudio (música ligada, sons ligados, áudio liberado). */
export function useAudio() {
  const [estado, setEstado] = useState(estadoAudio);
  useEffect(() => aoMudarAudio(setEstado), []);
  return estado;
}

/**
 * Botões para ligar/desligar a música e os sons dos carros.
 * variante: 'fixo' (canto da tela), 'sobre' (sobre a pista, só ícones) ou 'menu' (menu do ESC, com texto).
 */
export default function ControleSom({ variante = 'fixo' }) {
  const s = useAudio();
  // tira o foco depois do clique, senão a barra de espaço (freio de mão) apertaria o botão
  const clicar = (acao) => (e) => { acao(); e.currentTarget.blur(); };
  const rotulo = (nome, ligado, ligadoTxt, desligadoTxt) => (variante === 'menu' ? `${nome}: ${ligado ? ligadoTxt : desligadoTxt}` : variante === 'fixo' ? nome : '');
  return (
    <div className={`controle-som ${variante}`}>
      <button type="button" className={s.musica ? '' : 'off'} onClick={clicar(alternarMusica)} aria-pressed={s.musica} title="Música (tecla M)">
        <span aria-hidden="true">🎵</span>{variante !== 'sobre' && <b>{rotulo('MÚSICA', s.musica, 'LIGADA', 'DESLIGADA')}</b>}
      </button>
      <button type="button" className={s.sons ? '' : 'off'} onClick={clicar(alternarSons)} aria-pressed={s.sons} title="Sons dos carros (tecla V)">
        <span aria-hidden="true">{s.sons ? '🔊' : '🔇'}</span>{variante !== 'sobre' && <b>{rotulo(variante === 'menu' ? 'SONS DOS CARROS' : 'SONS', s.sons, 'LIGADOS', 'DESLIGADOS')}</b>}
      </button>
    </div>
  );
}
