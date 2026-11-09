import React, { useEffect, useState } from 'react';
import { tocarMusica, liberarAudio } from './engine/musica';
import TelaTitulo from './components/TelaTitulo';
import GameView from './components/GameView';
import TelaFase from './components/TelaFase';
import TelaFim from './components/TelaFim';

const lerSalvo = () => { try { return JSON.parse(localStorage.getItem('omega_salvo')) || { fase: 1, carga: null }; } catch (e) { return { fase: 1, carga: null }; } };
const gravarSalvo = (s) => { try { localStorage.setItem('omega_salvo', JSON.stringify(s)); } catch (e) { /* sem storage */ } };

/** Fluxo: título → (campanha: fase 1-3 com resumo entre elas | horda) → fim. */
export default function App() {
  const [tela, setTela] = useState('titulo');
  const [modo, setModo] = useState('campanha');
  const [fase, setFase] = useState(1);
  const [carga, setCarga] = useState(null); // armas/vida levadas para a próxima fase
  const [dev, setDev] = useState(null); // opções de teste (código secreto na tela inicial)
  const [salvo, setSalvo] = useState(lerSalvo); // { fase, carga }: a campanha recomeça no início da fase em que você parou
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

  const iniciar = (m, f = 1, c = null, d = null) => {
    if (m === 'campanha' && !d) { const s = { fase: f, carga: c }; setSalvo(s); gravarSalvo(s); }
    setModo(m); setFase(f); setCarga(c); setDev(d); setPartida((n) => n + 1); setTela('jogo');
  };
  const zerar = () => { const s = { fase: 1, carga: null }; setSalvo(s); gravarSalvo(s); };

  const aoFim = (r) => {
    setFim(r);
    if (modo === 'campanha' && !dev && r.resultado === 'venceu' && fase === 4) zerar();
    if (modo === 'campanha' && r.resultado === 'venceu') {
      if (fase < 4) { setCarga(r.carga); setTela('fase'); return; }
    }
    setTela('fim');
  };

  return (
    <div className="app">
      {tela === 'titulo' && <TelaTitulo faseSalva={salvo.fase} onCampanha={() => iniciar('campanha', salvo.fase, salvo.carga)} onNovo={() => { zerar(); iniciar('campanha'); }} onHorda={() => iniciar('horda')} onDev={(o) => iniciar(o.modo, o.fase, null, o.dev)} />}
      {tela === 'jogo' && <GameView key={partida} modo={modo} fase={fase} carga={carga} dev={dev} onFim={aoFim} onReiniciar={() => iniciar(modo, fase, carga, dev)} onTitulo={() => setTela('titulo')} />}
      {tela === 'fase' && <TelaFase fase={fase} fim={fim} onContinuar={() => iniciar('campanha', fase + 1, carga, dev)} />}
      {tela === 'fim' && (
        <TelaFim fim={fim} modo={modo} onTitulo={() => setTela('titulo')}
          onDeNovo={() => (modo === 'horda' || fim.resultado === 'venceu' ? iniciar(modo, 1, null, dev) : iniciar('campanha', fase, carga, dev))} />
      )}
    </div>
  );
}
