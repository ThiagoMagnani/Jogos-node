import React, { useState } from 'react';
import Hud from './Hud';
import Servico from './Servico';
import Grimorio from './Grimorio';
import AjudaModal from './AjudaModal';
import PausaModal from './PausaModal';
import { getNoite } from '../data/nights';

/** Tela principal do jogo: o bar. Cuida do HUD, das janelas (modais) e do cliente atual. */
export default function TelaBar({ estado, dispatch }) {
  const noite = getNoite(estado.noite);
  const cliente = noite.clientes[estado.indiceCliente];

  // Na primeira vez, o tutorial abre sozinho.
  const [modal, setModal] = useState(estado.tutorialVisto ? null : 'ajuda');
  const pausado = modal !== null; // com qualquer janela aberta, o tempo para

  const fechar = () => {
    if (modal === 'ajuda' && !estado.tutorialVisto) dispatch({ type: 'TUTORIAL_VISTO' });
    setModal(null);
  };

  return (
    <div className="tela-bar">
      <Hud
        estado={estado}
        noite={noite}
        onGrimorio={() => setModal('grimorio')}
        onAjuda={() => setModal('ajuda')}
        onPausa={() => setModal('pausa')}
      />

      {/* A key faz o React criar um Servico novo (estado limpo) para cada cliente. */}
      <Servico
        key={`${estado.noite}-${estado.indiceCliente}`}
        estado={estado}
        dispatch={dispatch}
        noite={noite}
        cliente={cliente}
        indice={estado.indiceCliente}
        pausado={pausado}
      />

      {modal === 'grimorio' && <Grimorio estado={estado} onFechar={fechar} />}
      {modal === 'ajuda' && <AjudaModal onFechar={fechar} />}
      {modal === 'pausa' && <PausaModal estado={estado} dispatch={dispatch} onFechar={fechar} />}
    </div>
  );
}
