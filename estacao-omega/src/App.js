import React, { useEffect, useState } from 'react';
import { tocarMusica, liberarAudio } from './engine/musica';
import TelaTitulo from './components/TelaTitulo';
import GameView from './components/GameView';
import TelaFase from './components/TelaFase';
import TelaFim from './components/TelaFim';

/** Fluxo: título → (campanha: fase 1-3 com resumo entre elas | horda) → fim. */
export default function App() {
  const [tela, setTela] = useState('titulo');
  const [modo, setModo] = useState('campanha');
  const [fase, setFase] = useState(1);
  const [carga, setCarga] = useState(null); // armas/vida levadas para a próxima fase
  const [fim, setFim] = useState(null);
  const [partida, setPartida] = useState(0); // muda a cada partida para reiniciar o GameView

  // música: título, uma por fase, uma para a Horda. O navegador só libera áudio depois do primeiro clique/tecla.
  useEffect(() => {
    tocarMusica(tela === 'titulo' || tela === 'fim' ? 'titulo' : modo === 'horda' ? 'horda' : `fase${fase}`);
  }, [tela, modo, fase]);
  useEffect(() => {
    const liberar = () => liberarAudio();
    window.addEventListener('pointerdown', liberar);
    window.addEventListener('keydown', liberar);
    return () => { window.removeEventListener('pointerdown', liberar); window.removeEventListener('keydown', liberar); };
  }, []);

  const iniciar = (m, f = 1, c = null) => { setModo(m); setFase(f); setCarga(c); setPartida((n) => n + 1); setTela('jogo'); };

  const aoFim = (r) => {
    setFim(r);
    if (modo === 'campanha' && r.resultado === 'venceu') {
      if (fase < 4) { setCarga(r.carga); setTela('fase'); return; }
    }
    setTela('fim');
  };

  return (
    <div className="app">
      {tela === 'titulo' && <TelaTitulo onCampanha={() => iniciar('campanha')} onHorda={() => iniciar('horda')} />}
      {tela === 'jogo' && <GameView key={partida} modo={modo} fase={fase} carga={carga} onFim={aoFim} onReiniciar={() => iniciar(modo, fase, carga)} onTitulo={() => setTela('titulo')} />}
      {tela === 'fase' && <TelaFase fase={fase} fim={fim} onContinuar={() => iniciar('campanha', fase + 1, carga)} />}
      {tela === 'fim' && (
        <TelaFim fim={fim} modo={modo} onTitulo={() => setTela('titulo')}
          onDeNovo={() => (modo === 'horda' || fim.resultado === 'venceu' ? iniciar(modo) : iniciar('campanha', fase, carga))} />
      )}
    </div>
  );
}
