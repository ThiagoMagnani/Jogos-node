import React, { useState } from 'react';
import { DIFICULDADES } from '../engine/campeonato';

const RIVAIS = [
  ['🏎️', 'Rafa Nitro', 'Usa nitro em toda reta'],
  ['💨', 'Duda Drift', 'Agressiva: encosta e empurra'],
  ['🧊', 'Cadu Zero', 'Frio e preciso, quase não erra'],
  ['⚡', 'Mari Turbo', 'A mais rápida do grid'],
  ['🛑', 'Bruno Freio', 'Freia tarde e sai na frente'],
  ['🚀', 'Lu Relâmpago', 'Pilota o Cometa X'],
  ['💥', 'Kiko Kamikaze', 'Não liga para batidas'],
];

/** Tela inicial: continuar, novo campeonato (com escolha de dificuldade), controles e rivais. */
export default function TelaTitulo({ save, onContinuar, onNovo }) {
  const [etapa, setEtapa] = useState('menu'); // menu | confirmar | dificuldade

  const novo = () => setEtapa(save ? 'confirmar' : 'dificuldade');

  return (
    <main className="titulo">
      <div className="estrada" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <p className="titulo-sobre">Racha clandestino • Só à noite • Sem juízo</p>
      <h1 className="logo">
        <span>ASFALTO</span>
        <span className="logo-ciano">NEON</span>
      </h1>
      <p className="titulo-frase">
        Ganhe grana em corridas contra pilotos <em>difíceis de verdade</em>, melhore o motor, o nitro e os pneus do seu carro
        e suba no campeonato. Quanto mais forte o grid, mais caro o prêmio.
      </p>

      {etapa === 'menu' && (
        <div className="titulo-botoes">
          {save && <button type="button" className="btn-jogar" onClick={onContinuar} autoFocus>▶ CONTINUAR (R$ {save.dinheiro})</button>}
          <button type="button" className={save ? 'btn-sec' : 'btn-jogar'} onClick={novo} autoFocus={!save}>NOVO CAMPEONATO</button>
        </div>
      )}

      {etapa === 'confirmar' && (
        <div className="titulo-botoes">
          <p className="aviso">Isso apaga o seu progresso atual. Tem certeza?</p>
          <button type="button" className="btn-jogar" onClick={() => setEtapa('dificuldade')}>SIM, COMEÇAR DO ZERO</button>
          <button type="button" className="btn-link" onClick={() => setEtapa('menu')}>Voltar</button>
        </div>
      )}

      {etapa === 'dificuldade' && (
        <div className="titulo-botoes">
          <p className="aviso">Escolha a dificuldade dos rivais</p>
          <div className="dificuldades">
            {Object.values(DIFICULDADES).map((d) => (
              <button type="button" key={d.id} className={`dif ${d.id}`} onClick={() => onNovo(d.id)}>
                <strong>{d.nome}</strong>
                <small>{d.desc}</small>
                <small>Prêmios ×{d.premio}</small>
              </button>
            ))}
          </div>
          <button type="button" className="btn-link" onClick={() => setEtapa('menu')}>Voltar</button>
        </div>
      )}

      <section className="titulo-caixas">
        <div className="caixa">
          <h2>Controles</h2>
          <ul>
            <li><kbd>← →</kbd> ou <kbd>A D</kbd> virar</li>
            <li><kbd>↑</kbd> ou <kbd>W</kbd> acelerar · <kbd>↓</kbd> ou <kbd>S</kbd> freio/ré</li>
            <li><kbd>Shift</kbd> nitro (gasta o tanque)</li>
            <li><kbd>Espaço</kbd> freio de mão: derrape nas curvas fechadas</li>
            <li><kbd>R</kbd> volta para a pista · <kbd>Esc</kbd> pausa · <kbd>M</kbd> som</li>
            <li>Ande colado atrás de alguém para pegar o <b>vácuo</b>.</li>
          </ul>
        </div>
        <div className="caixa">
          <h2>Os rivais</h2>
          <ul className="bichos">
            {RIVAIS.map(([icone, nome, nota]) => (
              <li key={nome}><span>{icone}</span> <strong>{nome}</strong> <small>{nota}</small></li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
