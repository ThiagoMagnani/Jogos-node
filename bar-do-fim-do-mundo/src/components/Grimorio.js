import React, { useState } from 'react';
import Modal from './Modal';
import ChipsStats from './ChipsStats';
import { INGREDIENTES } from '../data/ingredients';
import { TECNICAS } from '../data/techniques';
import { STATS } from '../data/stats';
import { INTENSIDADES, TEMPERATURAS, SABORES, DICAS } from '../data/glossary';
import { MELHORIAS } from '../data/upgrades';

const ABAS = [
  { id: 'ingredientes', rotulo: '🍾 Ingredientes' },
  { id: 'tecnicas', rotulo: '🔥 Técnicas' },
  { id: 'dicionario', rotulo: '🗣 Dicionário' },
  { id: 'diario', rotulo: '📜 Diário' },
];

/** O Grimório do Tião: ingredientes, técnicas, dicionário de pistas e diário da história. */
export default function Grimorio({ estado, onFechar }) {
  const [aba, setAba] = useState('ingredientes');

  return (
    <Modal titulo="📖 Grimório do Tião" onFechar={onFechar} larga>
      <nav className="abas" role="tablist">
        {ABAS.map((a) => (
          <button key={a.id} type="button" role="tab" aria-selected={aba === a.id} className={`aba ${aba === a.id ? 'ativa' : ''}`} onClick={() => setAba(a.id)}>
            {a.rotulo}
          </button>
        ))}
      </nav>

      {aba === 'ingredientes' && (
        <ul className="lista-grimorio">
          {INGREDIENTES.map((ing) => {
            const liberado = ing.presente ? estado.presentes.includes(ing.id) : ing.noite <= estado.noite;
            return (
              <li key={ing.id} className={liberado ? '' : 'bloqueado'}>
                <span className="lg-icone">{liberado ? ing.icon : '❔'}</span>
                <div className="lg-texto">
                  <strong>{liberado ? ing.nome : '???'}</strong>
                  <p>
                    {liberado
                      ? ing.desc
                      : ing.presente
                      ? `Presente raro. ${ing.de} pode dar um, se o drink dele sair perfeito.`
                      : `Chega na noite ${ing.noite}.`}
                  </p>
                </div>
                {liberado && <ChipsStats stats={ing.stats} />}
              </li>
            );
          })}
        </ul>
      )}

      {aba === 'tecnicas' && (
        <ul className="lista-grimorio">
          {TECNICAS.map((t) => {
            const liberado = t.noite <= estado.noite;
            return (
              <li key={t.id} className={liberado ? '' : 'bloqueado'}>
                <span className="lg-icone">{liberado ? t.icon : '❔'}</span>
                <div className="lg-texto">
                  <strong>{liberado ? t.nome : '???'}</strong>
                  <p>{liberado ? t.desc : `Chega na noite ${t.noite}.`}</p>
                </div>
                {liberado && <ChipsStats stats={t.stats} />}
              </li>
            );
          })}
        </ul>
      )}

      {aba === 'dicionario' && (
        <div className="dicionario">
          <p className="dic-intro">Clientes falam por enigmas. Este é o dicionário que o Tião foi anotando ao longo dos anos:</p>

          <h4>Quanto?</h4>
          <table className="dic-tabela">
            <tbody>
              {INTENSIDADES.map((i) => (
                <tr key={i.regra}>
                  <td>“{i.frase}”</td>
                  <td>
                    <strong>{i.regra}</strong>
                  </td>
                  <td className="suave">{i.nota}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4>Qual sabor?</h4>
          <table className="dic-tabela">
            <tbody>
              {SABORES.map((s) => (
                <tr key={s.stat}>
                  <td>
                    {STATS[s.stat].icon} <strong>{STATS[s.stat].label}</strong>
                  </td>
                  <td className="suave">{s.palavras}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4>Temperatura</h4>
          <table className="dic-tabela">
            <tbody>
              {TEMPERATURAS.map((t) => (
                <tr key={t.frase}>
                  <td>“{t.frase}”</td>
                  <td>
                    <strong>{t.regra}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4>Dicas do Tião</h4>
          <ul className="dic-dicas">
            {DICAS.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {aba === 'diario' && (
        <div className="diario">
          <blockquote className="diario-carta">
            Quem vier, você serve. Quem sofrer, você escuta. O resto, o mundo resolve.
            <cite>— Tião, a primeira página</cite>
          </blockquote>

          {estado.noite >= 5 ? (
            <blockquote className="diario-carta destaque">
              <strong>A receita do Último Gole</strong>
              Três lembranças que brilhem. Uma saudade (doce com amargo). Uma pitada de esperança. Calor de gente: nem quente, nem frio. E nenhum arrependimento — que é azedo.
              <cite>— Tião, a última página</cite>
            </blockquote>
          ) : (
            <p className="suave">A última página do grimório está colada com cera. Talvez ela se solte quando o Tião tiver algo a dizer.</p>
          )}

          <h4>Presentes recebidos</h4>
          {estado.presentes.length === 0 ? (
            <p className="suave">Nenhum ainda. Clientes especiais deixam presentes quando o drink sai perfeito.</p>
          ) : (
            <ul className="dic-dicas">
              {INGREDIENTES.filter((i) => estado.presentes.includes(i.id)).map((i) => (
                <li key={i.id}>
                  {i.icon} <strong>{i.nome}</strong> — {i.de}
                </li>
              ))}
            </ul>
          )}

          <h4>Melhorias do bar</h4>
          {Object.keys(estado.melhorias).length === 0 ? (
            <p className="suave">O bar ainda é o mesmo de sempre.</p>
          ) : (
            <ul className="dic-dicas">
              {MELHORIAS.filter((m) => estado.melhorias[m.id]).map((m) => (
                <li key={m.id}>
                  {m.icon} {m.nome}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}
