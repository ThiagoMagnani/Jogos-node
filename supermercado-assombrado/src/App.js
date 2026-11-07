import React, { useState } from 'react';
import TelaTitulo from './components/TelaTitulo';
import GameView from './components/GameView';
import TelaFim from './components/TelaFim';

/** Controla qual tela aparece: título → jogo → fim (vitória ou derrota). */
export default function App() {
  const [tela, setTela] = useState('titulo');
  const [fim, setFim] = useState(null);
  const [partida, setPartida] = useState(0); // muda a cada nova partida para reiniciar o GameView

  const iniciar = () => {
    setPartida((n) => n + 1);
    setTela('jogo');
  };

  return (
    <div className="app">
      {tela === 'titulo' && <TelaTitulo onJogar={iniciar} />}
      {tela === 'jogo' && (
        <GameView
          key={partida}
          onFim={(resultado) => {
            setFim(resultado);
            setTela('fim');
          }}
        />
      )}
      {tela === 'fim' && <TelaFim fim={fim} onDeNovo={iniciar} onTitulo={() => setTela('titulo')} />}
    </div>
  );
}
