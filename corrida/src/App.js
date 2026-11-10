import React, { useState, useCallback } from 'react';
import TelaTitulo from './components/TelaTitulo';
import Campeonato from './components/Campeonato';
import Garagem from './components/Garagem';
import Corrida from './components/Corrida';
import Resultado from './components/Resultado';
import { carregarSave, salvar, novoSave, registrarCorrida } from './engine/salvamento';
import { FASES, calcularPremio, faseLiberada } from './engine/campeonato';

/**
 * Controla qual tela aparece: título → campeonato ⇄ garagem → corrida → resultado.
 * O progresso (dinheiro, upgrades, recordes) fica no `save` e é gravado no localStorage a cada mudança.
 */
export default function App() {
  const [save, setSave] = useState(() => carregarSave());
  const [tela, setTela] = useState('titulo');
  const [fase, setFase] = useState(null);
  const [partida, setPartida] = useState(0); // muda a cada corrida para reiniciar o componente
  const [fim, setFim] = useState(null);

  const atualizarSave = useCallback((fn) => {
    setSave((s) => { const n = fn(s); if (n !== s) salvar(n); return n; });
  }, []);

  const novoJogo = (dificuldade) => {
    const s = novoSave(dificuldade);
    salvar(s); setSave(s); setTela('campeonato');
  };

  const correr = (f) => { setFase(f); setPartida((n) => n + 1); setTela('corrida'); };

  const terminou = (resultado) => {
    const premio = calcularPremio(fase, resultado, save.dificuldade, save.corridas[fase.id]);
    const novo = registrarCorrida(save, fase, resultado, premio.total);
    salvar(novo); setSave(novo);
    setFim({ resultado, premio, fase });
    setTela('resultado');
  };

  const proxima = fim && FASES[fim.fase.numero] && save && faseLiberada(save, FASES[fim.fase.numero]) ? FASES[fim.fase.numero] : null;

  return (
    <div className="app">
      {tela === 'titulo' && <TelaTitulo save={save} onContinuar={() => setTela('campeonato')} onNovo={novoJogo} />}
      {tela === 'campeonato' && save && (
        <Campeonato save={save} onCorrer={correr} onGaragem={() => setTela('garagem')} onMenu={() => setTela('titulo')} />
      )}
      {tela === 'garagem' && save && <Garagem save={save} atualizarSave={atualizarSave} onVoltar={() => setTela('campeonato')} />}
      {tela === 'corrida' && save && fase && <Corrida key={partida} fase={fase} save={save} onFim={terminou} onSair={() => setTela('campeonato')} />}
      {tela === 'resultado' && fim && save && (
        <Resultado
          {...fim} save={save} proxima={proxima}
          onProxima={() => correr(proxima)} onRepetir={() => correr(fim.fase)}
          onGaragem={() => setTela('garagem')} onCampeonato={() => setTela('campeonato')}
        />
      )}
    </div>
  );
}
