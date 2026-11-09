import React, { useState } from 'react';
import { ARMAS, maxMun } from '../engine/game';
import { UPGRADES, COMPRAS, ARMAS_LOJA, nivelDe, comprar } from '../engine/upgrades';
import { som } from '../engine/audio';

/** Loja entre as ondas do modo Horda: gasta créditos em melhorias, itens e armas. */
export default function LojaHorda({ jogo, onContinuar }) {
  const [, forcar] = useState(0);
  const [aviso, setAviso] = useState('');
  const h = jogo.horda;
  const p = jogo.jogador;
  const comp = (tipo, id) => { const r = comprar(jogo, tipo, id, ARMAS, maxMun); setAviso(r); if (/!|comprado|recarregada/.test(r)) som.item(); else som.negado(); forcar((n) => n + 1); };
  return (
    <div className="loja" role="dialog" aria-label="Loja">
      <header>
        <h2>LOJA · ONDA {h.onda}</h2>
        <strong className="creditos">💰 {h.creditos}</strong>
        <button type="button" className="btn-jogar" onClick={onContinuar}>VOLTAR AO JOGO ▶</button>
      </header>
      <p className="aviso-loja">{aviso || 'Gaste seus créditos antes da próxima onda.'}</p>
      <div className="loja-grid">
        <section><h3>MELHORIAS</h3>
          {UPGRADES.map((u) => { const n = nivelDe(jogo, u.id); const max = n >= u.max; return (
            <button type="button" key={u.id} className="item-loja" disabled={max} onClick={() => comp('up', u.id)}>
              <span>{u.icone} <b>{u.nome}</b> <em>{n}/{u.max}</em></span><small>{u.desc}</small><i>{max ? 'MÁX' : `💰 ${u.custo(n)}`}</i>
            </button>); })}
        </section>
        <section><h3>SUPRIMENTOS</h3>
          {COMPRAS.map((c) => (
            <button type="button" key={c.id} className="item-loja" onClick={() => comp('item', c.id)}>
              <span>{c.icone} <b>{c.nome}</b></span><small>{c.desc}</small><i>💰 {c.custo}</i>
            </button>))}
          <h3>ARSENAL</h3>
          {ARMAS_LOJA.map((a) => (
            <button type="button" key={a.id} className="item-loja" onClick={() => comp('arma', a.id)}>
              <span>🔫 <b>{ARMAS[a.id].nome}</b></span><small>{ARMAS[a.id].desc}</small><i>{p.armas[a.id] ? 'RECARREGAR' : `💰 ${a.custo}`}</i>
            </button>))}
        </section>
      </div>
    </div>
  );
}
