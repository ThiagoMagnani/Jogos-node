import React, { useState } from 'react';

const BICHOS = [
  ['🪲', 'Rastejador', 'Rápido e em bando'], ['🧟', 'Infectado', 'Lento, bate forte'], ['🟣', 'Cuspidor', 'Ácido que envenena'],
  ['🫧', 'Inchado', 'Explode em gás'], ['👁', 'Sentinela', 'Flutua e atira plasma'], ['🐗', 'Bruto', 'Investe como um trem'],
  ['🛸', 'Drone', 'Voa e metralha'], ['👑', 'Chefes', 'Matriarca, Colosso e Ômega'],
];

/** Tela inicial: escolha entre Campanha e Horda. */
export default function TelaTitulo({ onCampanha, onHorda, onNovo, faseSalva, onDev }) {
  const [aberto, setAberto] = useState(false);
  const [senha, setSenha] = useState('');
  const [infinito, setInfinito] = useState(true);
  const [arsenal, setArsenal] = useState(true);
  const liberado = senha === 'thiagolindo';
  let melhor = 0;
  try { melhor = Number(localStorage.getItem('omega_melhor_onda') || 0); } catch (e) { /* sem storage */ }
  return (
    <main className="titulo">
      <div className="titulo-luzes" aria-hidden="true" />
      <p className="titulo-sobre">SINAL DE SOCORRO · ESTAÇÃO ORBITAL ÔMEGA</p>
      <h1 className="logo"><span>ESTAÇÃO</span><span className="logo-vermelho">ÔMEGA</span></h1>
      <p className="titulo-frase">
        A estação parou de responder há 9 dias. Você é o último fuzileiro da equipe de resgate.
        Algo vivo come as paredes. Descubra o que é — e destrua o coração da colmeia.
      </p>
      <div className="modos">
        <button type="button" className="modo" onClick={onCampanha}>
          <strong>{faseSalva > 1 ? `CONTINUAR · FASE ${faseSalva}` : 'CAMPANHA'}</strong><span>4 fases · 3 chefes · segredos, cartões, terminais e teletransportes</span>
          {faseSalva > 1 && <small onClick={(e) => { e.stopPropagation(); onNovo(); }} role="button" tabIndex={0}>↺ começar do zero</small>}
        </button>
        <button type="button" className="modo horda" onClick={onHorda}>
          <strong>HORDA</strong><span>Ondas infinitas · ganhe créditos · melhore armas, poderes e vida</span>
          <small>Melhor onda: {melhor}</small>
        </button>
      </div>
      <div className="titulo-caixas">
        <section className="caixa bichos"><h2>BESTIÁRIO</h2>
          <ul>{BICHOS.map(([i, n, d]) => (<li key={n}><span>{i}</span> {n}<small>{d}</small></li>))}</ul>
        </section>
        <section className="caixa"><h2>CONTROLES</h2>
          <ul>
            <li><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> andar · <kbd>Shift</kbd> correr</li>
            <li>Mouse mirar · clique/<kbd>Espaço</kbd> atirar</li>
            <li><kbd>1</kbd>–<kbd>5</kbd> trocar de arma</li>
            <li><kbd>E</kbd> usar terminal, estação médica, portas suspeitas</li>
            <li><kbd>Q</kbd> dash · <kbd>F</kbd> onda de choque · <kbd>M</kbd> mapa</li>
          </ul>
        </section>
      </div>
      <button type="button" className="dev-btn" onClick={() => setAberto(!aberto)} aria-label="opções do desenvolvedor">·</button>
      {aberto && (
        <div className="dev">
          <input type="password" placeholder="código" value={senha} onChange={(e) => setSenha(e.target.value)} />
          {liberado && (
            <>
              <div>{[1, 2, 3, 4].map((n) => <button type="button" key={n} onClick={() => onDev({ modo: 'campanha', fase: n, dev: { arsenal } })}>FASE {n}</button>)}</div>
              <label><input type="checkbox" checked={arsenal} onChange={(e) => setArsenal(e.target.checked)} /> arsenal completo</label>
              <label><input type="checkbox" checked={infinito} onChange={(e) => setInfinito(e.target.checked)} /> dinheiro infinito (Horda)</label>
              <div><button type="button" onClick={() => onDev({ modo: 'horda', fase: 1, dev: { arsenal, infinito } })}>HORDA</button></div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
