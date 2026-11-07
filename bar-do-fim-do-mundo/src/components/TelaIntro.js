import React, { useState } from 'react';
import Ceu from './Ceu';
import ChipsStats from './ChipsStats';
import TelaHistoria from './TelaHistoria';
import { getNoite, slotsDaNoite, TOTAL_NOITES } from '../data/nights';
import { INGREDIENTES } from '../data/ingredients';
import { novidadesDaNoite } from '../game/rules';
import { sfx } from '../game/sfx';

/** Introdução da noite: história curta + cartão com as novidades da despensa. */
export default function TelaIntro({ estado, dispatch }) {
  const noite = getNoite(estado.noite);
  const [fase, setFase] = useState('historia'); // 'historia' | 'novidades'
  const { ingredientes, tecnicas } = novidadesDaNoite(estado.noite);
  const slots = slotsDaNoite(estado.noite);
  const ehPrimeira = estado.noite === 1;
  // Na primeira noite mostramos a despensa inicial (todos os ingredientes da noite 1).
  const lista = ehPrimeira ? INGREDIENTES.filter((i) => !i.presente && i.noite === 1) : ingredientes;
  const retorno = estado.noite > 1 && estado.presentes.length > 0;

  if (fase === 'historia') {
    return (
      <TelaHistoria
        cabecalho={`NOITE ${noite.numero} DE ${TOTAL_NOITES} · ${noite.titulo.toUpperCase()}`}
        paginas={noite.intro}
        jogador={estado.jogador}
        escala={0.6 + noite.numero * 0.2}
        rotuloFim="Preparar o balcão"
        onFim={() => setFase('novidades')}
      />
    );
  }

  return (
    <main className="intro">
      <Ceu escala={0.6 + noite.numero * 0.2} estrelas={60} />
      <div className="intro-cartao">
        <p className="intro-contagem">Faltam {noite.faltam} {noite.faltam === 1 ? 'noite' : 'noites'}</p>
        <h2 className="intro-titulo">{noite.titulo}</h2>

        <h3>{ehPrimeira ? '🍾 Sua despensa inicial' : '🆕 Chegou na despensa'}</h3>
        <ul className="intro-lista">
          {lista.map((ing) => (
            <li key={ing.id}>
              <span className="lg-icone">{ing.icon}</span>
              <strong>{ing.nome}</strong>
              <ChipsStats stats={ing.stats} pequeno />
            </li>
          ))}
          {tecnicas.map((t) => (
            <li key={t.id} className="tecnica-nova">
              <span className="lg-icone">{t.icon}</span>
              <strong>Técnica: {t.nome}</strong>
              <span className="suave">{t.desc}</span>
            </li>
          ))}
        </ul>

        {estado.noite === 4 && <p className="intro-aviso">🥃 O copo agora aceita <strong>{slots} ingredientes</strong>!</p>}
        {retorno && (
          <p className="intro-aviso">
            🎁 Presentes na prateleira: {INGREDIENTES.filter((i) => estado.presentes.includes(i.id)).map((i) => i.icon).join(' ')}
          </p>
        )}

        <button
          type="button"
          className="btn btn-neon btn-grande"
          onClick={() => {
            sfx.sino();
            dispatch({ type: 'COMECAR_NOITE' });
          }}
          autoFocus
        >
          🔔 Abrir o bar
        </button>
      </div>
    </main>
  );
}
