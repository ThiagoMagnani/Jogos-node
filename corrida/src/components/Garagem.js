import React, { useEffect, useRef, useState } from 'react';
import { MODELOS, UPGRADES, CORES, MAX_NIVEL, custoUpgrade, calcularStats } from '../engine/carros';
import { desenharPrevia } from '../engine/render';

const barra = (v, a, b) => Math.round(Math.max(4, Math.min(100, ((v - a) / (b - a)) * 100)));

/** Garagem: compra de upgrades (cada nível melhora o carro de verdade), cores e novos carros. */
export default function Garagem({ save, atualizarSave, onVoltar }) {
  const canvasRef = useRef(null);
  const corRef = useRef({ cor: save.cor, modelo: save.modelo });
  const [aviso, setAviso] = useState('');
  const st = calcularStats(save.modelo, save.niveis);

  corRef.current = { cor: save.cor, modelo: save.modelo };
  useEffect(() => {
    const cv = canvasRef.current, ctx = cv.getContext('2d');
    let raf = 0;
    const t0 = performance.now();
    const quadro = (agora) => {
      raf = requestAnimationFrame(quadro);
      desenharPrevia(ctx, cv.width, cv.height, corRef.current.cor, corRef.current.modelo, (agora - t0) / 1000);
    };
    raf = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(raf);
  }, []);

  const dizer = (t) => { setAviso(t); setTimeout(() => setAviso(''), 2200); };

  const comprar = (id) => {
    const nivel = save.niveis[id], custo = custoUpgrade(id, nivel);
    if (nivel >= MAX_NIVEL) return;
    if (save.dinheiro < custo) { dizer('Dinheiro insuficiente. Ganhe mais corridas!'); return; }
    atualizarSave((s) => (s.niveis[id] !== nivel || s.dinheiro < custo ? s : { ...s, dinheiro: s.dinheiro - custo, niveis: { ...s.niveis, [id]: nivel + 1 } }));
    dizer('Upgrade instalado!');
  };

  const usarModelo = (m) => {
    if (save.modelos.includes(m.id)) { atualizarSave((s) => ({ ...s, modelo: m.id, cor: s.cor })); return; }
    if (m.bloqueado) return;
    if (save.dinheiro < m.preco) { dizer('Dinheiro insuficiente para este carro.'); return; }
    atualizarSave((s) => (s.dinheiro < m.preco ? s : { ...s, dinheiro: s.dinheiro - m.preco, modelos: [...s.modelos, m.id], modelo: m.id }));
    dizer(`${m.nome} comprado! Seus upgrades foram transferidos.`);
  };

  const bar = [
    ['Velocidade', barra(st.vmax, 380, 720)], ['Aceleração', barra(st.acel, 220, 520)], ['Freios', barra(st.freio, 560, 1100)],
    ['Curvas', barra(st.grip * st.giro, 8, 30)], ['Nitro', barra(st.nitroCap, 1.5, 7)],
  ];

  return (
    <main className="garagem">
      <header className="camp-topo">
        <h1 className="camp-titulo">GARAGEM</h1>
        <div className="camp-carro">
          <span className="grana">R$ {save.dinheiro}</span>
          <button type="button" className="btn-sec" onClick={onVoltar}>← VOLTAR AO CAMPEONATO</button>
        </div>
      </header>
      {aviso && <p className="toast" role="status">{aviso}</p>}

      <div className="garagem-grade">
        <section className="caixa carro-box">
          <canvas ref={canvasRef} width={320} height={190} className="previa" aria-label="Seu carro" />
          <h2>{MODELOS[save.modelo].nome}</h2>
          <p className="nivel-carro">NÍVEL <b>{st.rating}</b></p>
          <ul className="stats">
            {bar.map(([n, v]) => (
              <li key={n}><span>{n}</span><div className="barra"><i style={{ width: `${v}%` }} /></div></li>
            ))}
          </ul>
          <h3>Cor</h3>
          <div className="cores">
            {CORES.map((c) => (
              <button type="button" key={c} className={`cor ${save.cor === c ? 'sel' : ''}`} style={{ background: c }} aria-label={`Cor ${c}`}
                onClick={() => atualizarSave((s) => ({ ...s, cor: c }))} />
            ))}
          </div>
        </section>

        <section className="caixa">
          <h2>Upgrades</h2>
          <ul className="upgrades">
            {UPGRADES.map((u) => {
              const nivel = save.niveis[u.id], max = nivel >= MAX_NIVEL, custo = custoUpgrade(u.id, nivel);
              const prox = max ? null : calcularStats(save.modelo, { ...save.niveis, [u.id]: nivel + 1 }).rating - st.rating;
              return (
                <li key={u.id}>
                  <span className="up-icone">{u.icone}</span>
                  <div className="up-info">
                    <strong>{u.nome}</strong>
                    <small>{u.desc}</small>
                    <div className="pips">{Array.from({ length: MAX_NIVEL }, (_, i) => <i key={i} className={i < nivel ? 'on' : ''} />)}</div>
                  </div>
                  <button type="button" className="btn-comprar" disabled={max || save.dinheiro < custo} onClick={() => comprar(u.id)}>
                    {max ? 'MÁXIMO' : <>R$ {custo}<small>+{prox} nível</small></>}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="caixa modelos">
          <h2>Carros</h2>
          <ul>
            {Object.values(MODELOS).map((m) => {
              const tem = save.modelos.includes(m.id), uso = save.modelo === m.id;
              return (
                <li key={m.id} className={uso ? 'uso' : ''}>
                  <strong style={{ color: m.cor }}>{m.nome}</strong>
                  <small>{m.desc}</small>
                  <small>Vel. base {m.base.vmax} · Acel. {m.base.acel} · Nitro {m.base.nitro}s</small>
                  <button type="button" className="btn-comprar" disabled={uso || (m.bloqueado && !tem)} onClick={() => usarModelo(m)}>
                    {uso ? 'EM USO' : tem ? 'USAR' : m.bloqueado ? 'EM BREVE' : `COMPRAR R$ ${m.preco}`}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="nota">Os upgrades acompanham você: ao trocar de carro, eles são transferidos.</p>
        </section>
      </div>
    </main>
  );
}
