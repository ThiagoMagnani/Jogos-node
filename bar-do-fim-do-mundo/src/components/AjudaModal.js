import React, { useState } from 'react';
import Modal from './Modal';
import { INTENSIDADES } from '../data/glossary';

const PASSOS = [
  {
    icone: '👂',
    titulo: '1. Ouça o cliente',
    corpo: (
      <>
        <p>
          Cada cliente pede um drink falando por enigmas. As <span className="pista exemplo">frases destacadas</span> são as pistas: cada uma
          esconde uma condição sobre o sabor do drink (doce, azedo, amargo, picante, salgado, magia ou temperatura).
        </p>
        <p>A intensidade também vem no texto:</p>
        <ul className="mini-lista">
          {INTENSIDADES.map((i) => (
            <li key={i.regra}>
              “{i.frase}” → <strong>{i.regra}</strong>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    icone: '🍸',
    titulo: '2. Monte o drink',
    corpo: (
      <>
        <p>
          Clique nos ingredientes da prateleira para colocá-los no copo (3 espaços; 4 a partir da noite 4). Os sabores <strong>se somam</strong>,
          e o medidor mostra o resultado na hora.
        </p>
        <p>
          As <strong>técnicas</strong> (gelo, flambar, agitar) também mexem nos números. Clique num espaço do copo para tirar um ingrediente.
        </p>
      </>
    ),
  },
  {
    icone: '🛎',
    titulo: '3. Sirva antes que ele desista',
    corpo: (
      <>
        <p>
          Cumpriu <strong>todas</strong> as pistas? Drink perfeito: gorjeta cheia e, para alguns clientes, um presente raro. Cumpriu pelo menos
          metade? Servível. Menos que isso? Você perde uma vida ❤.
        </p>
        <p>
          Travou? Toque numa frase para gastar uma <strong>lupa 🔍</strong> e ver os números exatos. O <strong>Grimório 📖</strong> tem o
          dicionário completo. Se preferir sem pressa, ative o <strong>modo tranquilo</strong> no menu de pausa.
        </p>
      </>
    ),
  },
];

/** Tutorial em 3 passos (abre sozinho na primeira noite). */
export default function AjudaModal({ onFechar }) {
  const [passo, setPasso] = useState(0);
  const atual = PASSOS[passo];
  const ultimo = passo === PASSOS.length - 1;

  return (
    <Modal titulo="Como jogar" onFechar={onFechar}>
      <div className="ajuda-passo">
        <div className="ajuda-icone" aria-hidden="true">
          {atual.icone}
        </div>
        <h3>{atual.titulo}</h3>
        {atual.corpo}
      </div>
      <footer className="modal-rodape">
        <div className="pontos-passo" aria-hidden="true">
          {PASSOS.map((_, i) => (
            <i key={i} className={i === passo ? 'ativo' : ''} />
          ))}
        </div>
        <div className="modal-botoes">
          {passo > 0 && (
            <button type="button" className="btn btn-fantasma" onClick={() => setPasso(passo - 1)}>
              ← Voltar
            </button>
          )}
          {ultimo ? (
            <button type="button" className="btn btn-neon" onClick={onFechar}>
              Entendi, vamos lá!
            </button>
          ) : (
            <button type="button" className="btn btn-neon" onClick={() => setPasso(passo + 1)}>
              Próximo →
            </button>
          )}
        </div>
      </footer>
    </Modal>
  );
}
