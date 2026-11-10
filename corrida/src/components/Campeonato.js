import React, { useMemo } from 'react';
import { FASES, DIFICULDADES, PREMIOS_POSICAO, faseLiberada, estrelasDaPos, formatarTempo } from '../engine/campeonato';
import { calcularStats, MODELOS } from '../engine/carros';
import { obterPista } from '../engine/corrida';

/** Desenho em SVG do traçado da pista. */
function MiniPista({ id }) {
  const d = useMemo(() => {
    const p = obterPista(id);
    const bw = p.caixa.x1 - p.caixa.x0, bh = p.caixa.y1 - p.caixa.y0;
    const esc = Math.min(104 / bw, 64 / bh);
    const ox = (120 - bw * esc) / 2 - p.caixa.x0 * esc, oy = (80 - bh * esc) / 2 - p.caixa.y0 * esc;
    let s = '';
    for (let i = 0; i < p.n; i += 8) s += `${i ? 'L' : 'M'}${(p.x[i] * esc + ox).toFixed(1)} ${(p.y[i] * esc + oy).toFixed(1)}`;
    return s + 'Z';
  }, [id]);
  return (
    <svg className="mini-pista" viewBox="0 0 120 80" role="img" aria-label="Traçado da pista">
      <path d={d} fill="none" stroke="#8a7fb0" strokeWidth="6" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#2a2342" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

/** Mapa do campeonato: cada fase é uma pista pronta, com rivais mais fortes a cada etapa. */
export default function Campeonato({ save, onCorrer, onGaragem, onMenu }) {
  const meu = calcularStats(save.modelo, save.niveis);
  const dif = DIFICULDADES[save.dificuldade] || DIFICULDADES.dificil;
  const estrelas = FASES.reduce((s, f) => s + (save.corridas[f.id] ? estrelasDaPos(save.corridas[f.id].melhorPos) : 0), 0);

  return (
    <main className="camp">
      <header className="camp-topo">
        <div>
          <h1 className="camp-titulo">COPA ASFALTO</h1>
          <p className="camp-sub">Dificuldade: <b>{dif.nome}</b> · ⭐ {estrelas}/{FASES.length * 3} · {save.vitorias} vitórias em {save.totalCorridas} corridas</p>
        </div>
        <div className="camp-carro">
          <span className="grana">R$ {save.dinheiro}</span>
          <span>{MODELOS[save.modelo].nome} · nível <b>{meu.rating}</b></span>
          <div className="camp-botoes">
            <button type="button" className="btn-sec" onClick={onGaragem}>🔧 GARAGEM</button>
            <button type="button" className="btn-link" onClick={onMenu}>Menu</button>
          </div>
        </div>
      </header>

      <section className="fases">
        {FASES.map((f) => {
          const liberada = faseLiberada(save, f);
          const reg = save.corridas[f.id];
          const nivelRivais = calcularStats('besouro', {
            motor: f.nivelBots + dif.nivel, turbo: f.nivelBots + dif.nivel, pneus: f.nivelBots + dif.nivel,
            freios: f.nivelBots + dif.nivel, aero: f.nivelBots + dif.nivel,
          }).rating;
          const falta = nivelRivais - meu.rating;
          const premio = Math.round(PREMIOS_POSICAO[0] * f.premio * dif.premio / 10) * 10;
          return (
            <article key={f.id} className={`fase ${liberada ? '' : 'trancada'}`}>
              <div className="fase-num">{f.numero}</div>
              <MiniPista id={f.pista} />
              <h2>{f.emoji} {f.nome}</h2>
              <p className="fase-dica">{f.dica}</p>
              <ul className="fase-dados">
                <li><span>Voltas</span><b>{f.voltas}</b></li>
                <li><span>Rivais (nível)</span><b>~{nivelRivais}</b></li>
                <li><span>Prêmio do 1º</span><b>R$ {premio}</b></li>
                <li><span>Melhor posição</span><b>{reg ? `${reg.melhorPos}º` : '—'}</b></li>
                <li><span>Melhor tempo</span><b>{reg && reg.melhorTempo ? formatarTempo(reg.melhorTempo) : '—'}</b></li>
                <li><span>Melhor volta</span><b>{reg && reg.melhorVolta ? formatarTempo(reg.melhorVolta) : '—'}</b></li>
              </ul>
              <div className="estrelas" aria-label="Estrelas">
                {[1, 2, 3].map((n) => <span key={n} className={reg && estrelasDaPos(reg.melhorPos) >= n ? 'on' : ''}>★</span>)}
              </div>
              {liberada ? (
                <>
                  <p className={`prontidao ${falta <= 0 ? 'ok' : falta > 12 ? 'ruim' : ''}`}>
                    {falta <= 0 ? 'Seu carro está à altura dos rivais.' : `Seu carro está ${falta} pontos abaixo dos rivais.`}
                  </p>
                  <button type="button" className="btn-jogar" onClick={() => onCorrer(f)}>▶ CORRER</button>
                </>
              ) : (
                <p className="trava">🔒 Termine no pódio (top 3) na fase {f.numero - 1} para liberar.</p>
              )}
            </article>
          );
        })}
        <article className="fase breve">
          <div className="fase-num">5+</div>
          <h2>🌃 Copa Neon</h2>
          <p className="fase-dica">Mais 4 pistas, novos carros, corridas aleatórias e chuva. Em breve na segunda metade do jogo.</p>
        </article>
      </section>
    </main>
  );
}
