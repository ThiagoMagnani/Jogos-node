import React from 'react';

const BICHOS = [
  ['🛒', 'Carrinho Furioso', 'Atropela sem dó'],
  ['🥫', 'Lata Bomba', 'Explode de ansiedade'],
  ['🍅', 'Tomate Arremessador', 'Tem boa mira'],
  ['🐔', 'Galinha Congelada', 'Esfria o clima'],
  ['🍌', 'Banana Ninja', 'Rápida e escorregadia'],
  ['👻', 'Caixa Fantasma', 'Cobra o troco em recibos'],
  ['👔', 'Gerente Supremo', 'Quer falar com você'],
];

/** Tela inicial com instruções e a "galeria" dos inimigos. */
export default function TelaTitulo({ onJogar }) {
  return (
    <main className="titulo">
      <div className="titulo-luzes" aria-hidden="true" />
      <p className="titulo-sobre">Promoção imperdível • Só hoje • Só à noite</p>
      <h1 className="logo">
        <span>SUPERMERCADO</span>
        <span className="logo-vermelho">ASSOMBRADO</span>
      </h1>
      <p className="titulo-frase">
        Você acordou preso no hipermercado depois do fechamento. As prateleiras ganharam vida, o freezer está de mau humor e o Gerente quer
        <em> “ter uma conversa”</em>. Ache os cartões, abra as portas e fuja pela SAÍDA.
      </p>

      <button type="button" className="btn-jogar" onClick={onJogar} autoFocus>
        ▶ ENTRAR NO MERCADO
      </button>

      <section className="titulo-caixas">
        <div className="caixa">
          <h2>Controles</h2>
          <ul>
            <li><kbd>W A S D</kbd> andar · <kbd>Shift</kbd> correr</li>
            <li><kbd>Mouse</kbd> ou <kbd>← →</kbd> virar</li>
            <li><kbd>Clique</kbd> ou <kbd>Espaço</kbd> atirar</li>
            <li><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> trocar de arma</li>
            <li><kbd>M</kbd> mapa · <kbd>Esc</kbd> pausa</li>
            <li>As portas abrem sozinhas se você tiver o cartão certo.</li>
          </ul>
        </div>
        <div className="caixa">
          <h2>Clientes problemáticos</h2>
          <ul className="bichos">
            {BICHOS.map(([icone, nome, nota]) => (
              <li key={nome}>
                <span>{icone}</span> <strong>{nome}</strong> <small>{nota}</small>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
