import React, { useEffect, useState } from 'react';
import Ceu from './Ceu';
import TelaHistoria from './TelaHistoria';
import { FINAIS, paginasDoFinal } from '../data/nights';
import { INGREDIENTES } from '../data/ingredients';
import { registrarFinal } from '../game/storage';

/** Final do jogo: história do desfecho (A, B ou C) e cartão de resultados. */
export default function TelaFinal({ estado, dispatch }) {
  const [fase, setFase] = useState('historia'); // 'historia' | 'cartao'
  const tipo = estado.final || 'C';
  const info = FINAIS[tipo];

  useEffect(() => {
    registrarFinal(tipo);
  }, [tipo]);

  if (fase === 'historia') {
    return (
      <TelaHistoria
        cabecalho="DESFECHO"
        paginas={paginasDoFinal(tipo, estado.presentes)}
        jogador={estado.jogador}
        escala={tipo === 'A' ? 0.5 : 2}
        rotuloFim="Ver o resultado"
        onFim={() => setFase('cartao')}
      />
    );
  }

  const presentes = INGREDIENTES.filter((i) => estado.presentes.includes(i.id));

  return (
    <main className="intro">
      <Ceu escala={tipo === 'A' ? 0.5 : 1.5} estrelas={90} />
      <div className={`intro-cartao final-cartao final-${tipo}`}>
        <div className="final-icone" aria-hidden="true">
          {info.icon}
        </div>
        <h2 className="intro-titulo">{info.titulo}</h2>
        <p className="final-sub">{info.subtitulo}</p>

        <ul className="final-stats">
          <li>
            <strong>{estado.totais.perfeito}</strong>
            <span>drinks perfeitos</span>
          </li>
          <li>
            <strong>{estado.totais.bom}</strong>
            <span>drinks servíveis</span>
          </li>
          <li>
            <strong>{estado.totais.ruim}</strong>
            <span>drinks ruins</span>
          </li>
          <li>
            <strong>{estado.moedas}</strong>
            <span>moedas guardadas</span>
          </li>
        </ul>

        <p className="final-presentes">
          Presentes recebidos: {presentes.length ? presentes.map((p) => `${p.icon} ${p.nome}`).join(' · ') : 'nenhum'} ({presentes.length}/3)
        </p>
        {tipo !== 'A' && <p className="suave">Existe um final melhor. Tente acertar a receita da Visitante (dica: releia o Grimório!).</p>}

        <div className="pausa-opcoes">
          {tipo !== 'A' && (
            <button type="button" className="btn btn-neon btn-grande" onClick={() => dispatch({ type: 'REVIVER_ULTIMA_NOITE' })} autoFocus>
              🔁 Tentar a última noite de novo
            </button>
          )}
          <button type="button" className={`btn ${tipo === 'A' ? 'btn-neon btn-grande' : 'btn-fantasma'}`} onClick={() => dispatch({ type: 'IR', tela: 'titulo' })} autoFocus={tipo === 'A'}>
            🏠 Voltar ao título
          </button>
        </div>
      </div>
    </main>
  );
}
