import React, { useEffect, useRef, useState } from 'react';
import Hud from './Hud';
import { criarJogo, atualizar } from '../engine/game';
import { criarRenderizador } from '../engine/raycaster';
import { gerarTexturas } from '../engine/textures';
import { gerarSprites } from '../engine/sprites';
import { definirMudo } from '../engine/audio';

const TECLAS = {
  KeyW: 'frente', ArrowUp: 'frente', KeyS: 'tras', ArrowDown: 'tras',
  KeyA: 'esq', KeyD: 'dir', ShiftLeft: 'correr', ShiftRight: 'correr', Space: 'atirar',
};

const snapshot = (j) => ({
  vida: Math.ceil(j.jogador.vida),
  arma: j.jogador.arma,
  armas: { ...j.jogador.armas },
  municao: j.jogador.municao[j.jogador.arma],
  chaves: { ...j.jogador.chaves },
  abates: j.estat.abates,
  total: j.estat.total,
  msgs: j.msgs.slice(-3).map((m) => ({ texto: m.texto, tipo: m.tipo })),
});

/**
 * O jogo em si: um <canvas> 320x200 (esticado com pixels grandes) + HUD em React.
 * O estado do jogo vive num useRef (muda 60x por segundo, sem re-renderizar o React);
 * só o HUD é atualizado com useState a cada ~100 ms.
 */
export default function GameView({ onFim }) {
  const canvasRef = useRef(null);
  const danoRef = useRef(null);
  const jogoRef = useRef(null);
  const inpRef = useRef({ giro: 0, mouseDX: 0, trocar: 0 });
  const ativoRef = useRef(false);
  const [ativo, setAtivo] = useState(false);
  const [hud, setHud] = useState(null);
  const [mudo, setMudo] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const j = criarJogo();
    jogoRef.current = j;
    if (window.__JOGO_DEBUG__) window.__jogo = j; // gancho usado só nos testes automáticos
    const render = criarRenderizador(canvas, { texturas: gerarTexturas(), sprites: gerarSprites() });
    const inp = inpRef.current;
    let raf = 0;
    let ultimo = performance.now();
    let acumHud = 0;
    let fimEm = 0;
    let terminou = false;

    const aoTecla = (e, valor) => {
      const k = TECLAS[e.code];
      if (k) { inp[k] = valor; e.preventDefault(); }
      if (e.code === 'ArrowLeft') { inp.giro = valor ? -1 : inp.giro === -1 ? 0 : inp.giro; e.preventDefault(); }
      if (e.code === 'ArrowRight') { inp.giro = valor ? 1 : inp.giro === 1 ? 0 : inp.giro; e.preventDefault(); }
      if (valor) {
        if (e.code === 'Digit1') inp.trocar = 1;
        if (e.code === 'Digit2') inp.trocar = 2;
        if (e.code === 'Digit3') inp.trocar = 3;
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
      if (ativoRef.current) {
        atualizar(j, dt, inp);
        acumHud += dt;
        if (acumHud > 0.1) { acumHud = 0; setHud(snapshot(j)); }
        if (danoRef.current) danoRef.current.style.opacity = Math.min(0.55, j.jogador.flashDano * 1.6);
        if (j.estado !== 'jogando' && !terminou) {
          terminou = true;
          fimEm = agora + 1400;
          setHud(snapshot(j));
        }
      }
      render.desenhar(j, j.tempo);
      if (terminou && agora > fimEm) {
        onFim({ resultado: j.estado, tempo: j.tempo, abates: j.estat.abates, total: j.estat.total, itens: j.estat.itens, vida: Math.ceil(j.jogador.vida) });
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
    try {
      const r = canvasRef.current.requestPointerLock();
      if (r && r.catch) r.catch(() => {});
    } catch (e) { /* sem pointer lock: segue só com teclado */ }
  };

  const alternarSom = () => { definirMudo(!mudo); setMudo(!mudo); };

  return (
    <div className="jogo">
      <div className="tela-jogo">
        <canvas ref={canvasRef} className="canvas" onClick={() => !ativo && comecar()} />
        <div ref={danoRef} className="flash-dano" />
        {hud && hud.vida <= 0 && <div className="aviso-fim">VOCÊ MORREU</div>}
        {!ativo && (
          <button type="button" className="pausa" onClick={comecar}>
            <strong>{hud && hud.abates > 0 ? '⏸ PAUSADO' : '🛒 SUPERMERCADO ASSOMBRADO'}</strong>
            <span>Clique para {hud && hud.abates > 0 ? 'continuar' : 'jogar'}</span>
            <small>WASD andar · mouse mirar · clique atira · 1 2 3 armas · M mapa</small>
          </button>
        )}
        <button type="button" className="btn-som" onClick={alternarSom} aria-label="Ligar ou desligar o som">{mudo ? '🔇' : '🔊'}</button>
      </div>
      {hud && <Hud hud={hud} />}
    </div>
  );
}
