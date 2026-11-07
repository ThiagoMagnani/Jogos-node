import React, { useState } from 'react';
import Ceu from './Ceu';
import AjudaModal from './AjudaModal';
import { carregarFinais, carregarJogo, apagarJogo } from '../game/storage';
import { FINAIS } from '../data/nights';
import { sfx } from '../game/sfx';

/** Tela de título: nome do jogador, modo de jogo, continuar, ajuda e finais descobertos. */
export default function TelaTitulo({ estado, dispatch }) {
  const [nome, setNome] = useState(estado.jogador === 'Barman' ? '' : estado.jogador);
  const [tranquilo, setTranquilo] = useState(estado.tranquilo);
  const [ajuda, setAjuda] = useState(false);
  const [save] = useState(() => carregarJogo()); // lido uma vez ao abrir a tela
  const [finais] = useState(() => carregarFinais());

  const podeContinuar = save && save.tela && save.tela !== 'titulo';

  const comecar = (e) => {
    e.preventDefault();
    sfx.sino();
    if (save) apagarJogo();
    dispatch({ type: 'NOVO_JOGO', jogador: nome.trim() || 'Barman', tranquilo });
  };

  const continuar = () => {
    sfx.clique();
    dispatch({ type: 'CARREGAR', save: { ...save, som: estado.som } });
  };

  return (
    <main className="titulo">
      <Ceu escala={1.6} estrelas={110} />

      <button
        type="button"
        className="btn-icone titulo-som"
        onClick={() => dispatch({ type: 'ALTERNAR_SOM' })}
        aria-label={estado.som ? 'Desligar o som' : 'Ligar o som'}
        title={estado.som ? 'Som ligado' : 'Som desligado'}
      >
        {estado.som ? '🔊' : '🔇'}
      </button>

      <div className="titulo-conteudo">
        <p className="titulo-sobre">Faltam 5 noites para o fim do mundo</p>
        <h1 className="logo" aria-label="Bar do Fim do Mundo">
          <span>BAR DO</span>
          <span>FIM DO</span>
          <span>MUNDO</span>
        </h1>
        <p className="titulo-frase">
          Um cometa a caminho. Um balcão. Clientes impossíveis.
          <br />
          Sirva o drink certo antes do último pedido.
        </p>

        <form className="titulo-form" onSubmit={comecar}>
          <label htmlFor="nome" className="titulo-rotulo">
            Como devemos te chamar, barman?
          </label>
          <input
            id="nome"
            className="campo"
            type="text"
            value={nome}
            maxLength={14}
            placeholder="Barman"
            autoComplete="off"
            onChange={(e) => setNome(e.target.value)}
          />

          <div className="modos" role="radiogroup" aria-label="Modo de jogo">
            <button type="button" role="radio" aria-checked={!tranquilo} className={`modo ${!tranquilo ? 'ativo' : ''}`} onClick={() => setTranquilo(false)}>
              <strong>⏱ Normal</strong>
              <small>Clientes perdem a paciência</small>
            </button>
            <button type="button" role="radio" aria-checked={tranquilo} className={`modo ${tranquilo ? 'ativo' : ''}`} onClick={() => setTranquilo(true)}>
              <strong>🧘 Tranquilo</strong>
              <small>Sem cronômetro, só você e a receita</small>
            </button>
          </div>

          <button type="submit" className="btn btn-neon btn-grande">
            🍸 {podeContinuar ? 'Novo jogo' : 'Abrir o bar'}
          </button>
          {podeContinuar && (
            <button type="button" className="btn btn-fantasma btn-grande" onClick={continuar}>
              ▶ Continuar (Noite {save.noite}/5)
            </button>
          )}
          <button type="button" className="btn btn-link" onClick={() => setAjuda(true)}>
            ❓ Como jogar
          </button>
        </form>

        <div className="finais-descobertos" aria-label="Finais descobertos">
          {['A', 'B', 'C'].map((tipo) => (
            <span key={tipo} className={`final-medalha ${finais.includes(tipo) ? 'ganha' : ''}`} title={finais.includes(tipo) ? FINAIS[tipo].titulo : 'Final ainda não descoberto'}>
              {finais.includes(tipo) ? FINAIS[tipo].icon : '❔'}
            </span>
          ))}
          <small>{finais.length}/3 finais</small>
        </div>
      </div>

      {ajuda && <AjudaModal onFechar={() => setAjuda(false)} />}
    </main>
  );
}
