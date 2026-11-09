import React, { useEffect, useRef, useState } from 'react';
import Hud from './Hud';
import LojaHorda from './LojaHorda';
import { criarJogo, atualizar, snapshotCarga } from '../engine/game';
import { criarRenderizador } from '../engine/raycaster';
import { gerarTexturas } from '../engine/textures';
import { gerarSprites } from '../engine/sprites';
import { definirMudo } from '../engine/audio';

const TECLAS = {
  KeyW: 'frente', ArrowUp: 'frente', KeyS: 'tras', ArrowDown: 'tras',
  KeyA: 'esq', KeyD: 'dir', ShiftLeft: 'correr', ShiftRight: 'correr', Space: 'atirar',
};

const snapshot = (j) => {
  const p = j.jogador;
  return {
    vida: Math.ceil(p.vida), vidaMax: p.vidaMax, escudo: Math.ceil(p.escudo), escudoMax: p.escudoMax,
    arma: p.arma, armas: { ...p.armas }, municao: { ...p.municao }, chaves: { ...p.chaves }, veneno: p.veneno > 0,
    dash: Math.max(0, p.dashCd) / p.mod.dashCd, onda: Math.max(0, p.ondaCd) / p.mod.ondaCd,
    tempo: j.tempo, abates: j.estat.abates, total: j.estat.total, nome: j.nome, objetivo: j.objetivo, modo: j.modo,
    horda: j.horda ? { onda: j.horda.onda, creditos: j.horda.creditos, vivos: j.horda.vivos + j.horda.fila.length, contagem: j.horda.estado === 'pausa' ? Math.ceil(j.horda.contagem) : 0 } : null,
    chefe: (() => { const c = j.inimigos.find((e) => !e.morto && e.desperto && e.hpMax > 400); return c ? c.hp / c.hpMax : null; })(),
    msgs: j.msgs.slice(-3).map((m) => ({ texto: m.texto, tipo: m.tipo })),
  };
};

/**
 * O jogo em si: <canvas> 320x200 + HUD em React. O estado vive num useRef (60 atualizações/s sem re-render);
 * só o HUD usa useState (~10x por segundo).
 */
export default function GameView({ modo, fase, carga, onFim, onReiniciar, onTitulo }) {
  const canvasRef = useRef(null);
  const danoRef = useRef(null);
  const jogoRef = useRef(null);
  const inpRef = useRef({ giro: 0, mouseDX: 0, trocar: 0 });
  const ativoRef = useRef(false);
  const [ativo, setAtivo] = useState(false);
  const [hud, setHud] = useState(null);
  const [mudo, setMudo] = useState(false);
  const [loja, setLoja] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const j = criarJogo({ modo, fase, carga });
    jogoRef.current = j;
    if (window.__JOGO_DEBUG__) window.__jogo = j;
    const render = criarRenderizador(canvas, { texturas: gerarTexturas(), sprites: gerarSprites() });
    const inp = inpRef.current;
    let raf = 0;
    let ultimo = performance.now();
    let acumHud = 0;
    let fimEm = 0;
    let terminou = false;
    let lojaAberta = false;

    const aoTecla = (e, valor) => {
      const k = TECLAS[e.code];
      if (k) { inp[k] = valor; e.preventDefault(); }
      if (e.code === 'ArrowLeft') { inp.giro = valor ? -1 : inp.giro === -1 ? 0 : inp.giro; e.preventDefault(); }
      if (e.code === 'ArrowRight') { inp.giro = valor ? 1 : inp.giro === 1 ? 0 : inp.giro; e.preventDefault(); }
      if (valor) {
        if (/^Digit[1-5]$/.test(e.code)) inp.trocar = Number(e.code.slice(5));
        if (e.code === 'KeyE') inp.usar = true;
        if (e.code === 'KeyQ') inp.dash = true;
        if (e.code === 'KeyF') inp.onda = true;
        if (e.code === 'KeyM') j.minimapa = !j.minimapa;
        if (e.code === 'Escape') { ativoRef.current = false; setAtivo(false); }
      }
    };
    const kd = (e) => aoTecla(e, true);
    const ku = (e) => aoTecla(e, false);
    const mm = (e) => { if (document.pointerLockElement === canvas) inp.mouseDX += e.movementX; };
    const md = (e) => { if (e.button === 0 && ativoRef.current) inp.atirar = true; };
    const mu = (e) => { if (e.button === 0) inp.atirar = false; };
    const pausar = () => {
      if (document.pointerLockElement !== canvas && ativoRef.current && inp.travou) { ativoRef.current = false; setAtivo(false); }
      inp.travou = document.pointerLockElement === canvas;
    };
    const blur = () => { ativoRef.current = false; setAtivo(false); };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    window.addEventListener('mousemove', mm);
    window.addEventListener('mousedown', md);
    window.addEventListener('mouseup', mu);
    window.addEventListener('blur', blur);
    document.addEventListener('pointerlockchange', pausar);

    const quadro = (agora) => {
      const dt = Math.min(0.05, (agora - ultimo) / 1000);
      ultimo = agora;
      if (j.loja && !lojaAberta) {
        lojaAberta = true; ativoRef.current = false; setAtivo(false); setLoja(true);
        inp.atirar = false; inp.frente = inp.tras = inp.esq = inp.dir = false;
        if (document.pointerLockElement) document.exitPointerLock();
      }
      if (!j.loja && lojaAberta) lojaAberta = false;
      if (ativoRef.current) {
        atualizar(j, dt, inp);
        acumHud += dt;
        if (acumHud > 0.1) { acumHud = 0; setHud(snapshot(j)); }
        if (danoRef.current) danoRef.current.style.opacity = Math.min(0.55, j.jogador.flashDano * 1.6);
        if (j.estado !== 'jogando' && !terminou) { terminou = true; fimEm = agora + 1400; setHud(snapshot(j)); }
      }
      render.desenhar(j, j.tempo);
      if (terminou && agora > fimEm) {
        onFim({
          resultado: j.estado, tempo: j.tempo, abates: j.estat.abates, total: j.estat.total, itens: j.estat.itens,
          segredos: j.estat.segredos, segTotal: j.estat.segTotal, onda: j.horda ? j.horda.onda : 0, carga: snapshotCarga(j),
        });
        return;
      }
      raf = requestAnimationFrame(quadro);
    };
    setHud(snapshot(j));
    raf = requestAnimationFrame(quadro);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('mousedown', md);
      window.removeEventListener('mouseup', mu);
      window.removeEventListener('blur', blur);
      document.removeEventListener('pointerlockchange', pausar);
      if (document.pointerLockElement) document.exitPointerLock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const comecar = () => {
    ativoRef.current = true;
    setAtivo(true);
    try { const r = canvasRef.current.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } catch (e) { /* só teclado */ }
  };
  const fecharLoja = () => {
    jogoRef.current.loja = false;
    setLoja(false);
    comecar();
  };
  const alternarSom = () => { definirMudo(!mudo); setMudo(!mudo); };
  const iniciou = hud && hud.tempo > 0.5;

  return (
    <div className="jogo">
      <div className="tela-jogo">
        <canvas ref={canvasRef} className="canvas" onClick={() => !ativo && !loja && comecar()} />
        <div ref={danoRef} className="flash-dano" />
        {hud && hud.veneno && <div className="flash-veneno" />}
        {hud && ativo && hud.tempo < 4.5 && (
          <div className="banner-fase" key={hud.nome}>
            <small>{hud.modo === 'horda' ? 'MODO HORDA' : 'FASE'}</small>
            <strong>{hud.nome}</strong>
          </div>
        )}
        {hud && hud.horda && hud.horda.contagem > 0 && ativo && <div className="contagem">PRÓXIMA ONDA EM {hud.horda.contagem}s · LOJA (E)</div>}
        {hud && hud.vida <= 0 && <div className="aviso-fim">VOCÊ MORREU</div>}
        {hud && hud.chefe !== null && <div className="barra-chefe"><i style={{ width: `${Math.max(0, hud.chefe * 100)}%` }} /></div>}
        {!ativo && !loja && (
          iniciou ? (
            <div className="pausa menu-pausa">
              <strong>⏸ PAUSADO</strong>
              <button type="button" className="btn-jogar" onClick={comecar}>CONTINUAR</button>
              <button type="button" className="btn-menu" onClick={onReiniciar}>↻ REINICIAR {modo === 'horda' ? 'A HORDA' : 'A FASE'}</button>
              <button type="button" className="btn-menu" onClick={onTitulo}>⌂ VOLTAR À TELA INICIAL</button>
              <small>WASD andar · mouse mirar · clique atira · 1-5 armas · E usar · Q dash · F onda de choque · M mapa</small>
            </div>
          ) : (
            <button type="button" className="pausa" onClick={comecar}>
              <strong>{`☣ ${hud ? hud.nome.toUpperCase() : 'ESTAÇÃO ÔMEGA'}`}</strong>
              {hud && <em>{hud.objetivo}</em>}
              <span>Clique para jogar</span>
              <small>WASD andar · mouse mirar · clique atira · 1-5 armas · E usar · Q dash · F onda de choque · M mapa · ESC pausa</small>
            </button>
          )
        )}
        {loja && jogoRef.current && <LojaHorda jogo={jogoRef.current} onContinuar={fecharLoja} />}
        <button type="button" className="btn-som" onClick={alternarSom} aria-label="Ligar ou desligar o som">{mudo ? '🔇' : '🔊'}</button>
      </div>
      {hud && <Hud hud={hud} />}
    </div>
  );
}
