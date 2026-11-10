import React, { useState } from 'react';
import Game from './components/Game';
import './index.css';

function App() {
  const [uiState, setUIState] = useState('MENU'); // MENU, PLAYING, GAMEOVER

  return (
    <div className="App">
      {uiState === 'MENU' && (
        <div className="overlay">
          <h1>Gelo e Sombras</h1>
          <p>O frio não perdoa. A escuridão atrai monstros.</p>
          <div className="instructions">
            <p><span>WASD / Setas</span> - Mover personagem</p>
            <p><span>E</span> - Coletar Recursos (Árvores, Pedras, Frutas)</p>
            <p><span>F</span> - Alimentar a Fogueira (Custa 1 Madeira)</p>
            <p><span>B</span> - Contratar Trabalhador (Custa 10 Comida, 10 Madeira)</p>
            <br/>
            <p><strong>Dica:</strong> Fique perto do fogo para se aquecer.<br/>A fogueira afasta as sombras à noite.</p>
          </div>
          <button onClick={() => setUIState('PLAYING')}>INICIAR SOBREVIVÊNCIA</button>
        </div>
      )}

      {uiState === 'PLAYING' && (
        <Game setUIState={setUIState} />
      )}

      {uiState === 'GAMEOVER' && (
        <div className="overlay gameover">
          <h1>Você Pereceu</h1>
          <p>Sua chama se apagou para sempre no frio imperdoável.</p>
          <button style={{marginTop: "30px"}} onClick={() => setUIState('PLAYING')}>TENTAR NOVAMENTE</button>
        </div>
      )}
    </div>
  );
}

export default App;