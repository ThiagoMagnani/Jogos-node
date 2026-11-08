import React from 'react';

const BICHOS = [
  ['🪲', 'Rastejador', 'Rápido e em bando'], ['🧟', 'Infectado', 'Lento, bate forte'], ['🟣', 'Cuspidor', 'Ácido que envenena'],
  ['🫧', 'Inchado', 'Explode em gás'], ['👁', 'Sentinela', 'Flutua e atira plasma'], ['🐗', 'Bruto', 'Investe como um trem'],
  ['🛸', 'Drone', 'Voa e metralha'], ['👑', 'Chefes', 'Matriarca, Colosso e Ômega'],
];

/** Tela inicial: escolha entre Campanha e Horda. */
export default function TelaTitulo({ onCampanha, onHorda }) {
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
          <strong>CAMPANHA</strong><span>3 fases · 3 chefes · segredos, cartões, terminais e teletransportes</span>
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
    </main>
  );
}
