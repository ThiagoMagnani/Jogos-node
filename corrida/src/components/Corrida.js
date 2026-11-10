import React, { useEffect, useRef, useState } from 'react';
import Hud from './Hud';
import { criarCorrida, avancar, snapshot } from '../engine/corrida';
import { criarRenderizador } from '../engine/render';
import { iniciarMotor, atualizarSom, pararSons, definirMudo, somBip, somBatida, somParede, somVolta, somUltrap, somChegada } from '../engine/audio';

const TECLAS = {
  ArrowLeft: 'esq', KeyA: 'esq', ArrowRight: 'dir', KeyD: 'dir', ArrowUp: 'acel', KeyW: 'acel',
  ArrowDown: 'freio', KeyS: 'freio', ShiftLeft: 'nitro', ShiftRight: 'nitro', KeyN: 'nitro', Space: 'mao',
};

/**
 * A corrida em si: um <canvas> + HUD em React.
 * O estado da simulação vive num useRef (muda 120x por segundo, sem re-renderizar o React);
 * só o HUD é atualizado com useState a cada ~90 ms.
 */
export default function Corrida({ fase, save, onFim, onSair }) {
  const canvasRef = useRef(null);
  const corrRef = useRef(null);
  const teclas = useRef({});
  const reset = useRef(false);
  const ctrl = useRef({ rodando: false, pausado: false });
  const [hud, setHud] = useState(null);
  const [iniciou, setIniciou] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [mudo, setMudo] = useState(false);

  const iniciar = () => {
    if (ctrl.current.rodando) return;
    iniciarMotor();
    ctrl.current.rodando = true;
    setIniciou(true);
  };
  const alternarPausa = () => {
    if (!ctrl.current.rodando) return;
    ctrl.current.pausado = !ctrl.current.pausado;
    setPausado(ctrl.current.pausado);
  };
  const alternarSom = () => { const m = !mudo; setMudo(m); definirMudo(m); };

  useEffect(() => {
    const canvas = canvasRef.current;
    const corr = criarCorrida({ fase, save, semente: (Date.now() % 100000) + 1 });
    corrRef.current = corr;
    if (window.__CORRIDA_DEBUG__) window.__corr = corr; // gancho usado só em testes automáticos
    const render = criarRenderizador(canvas, corr);
    const inp = { dir: 0, acel: 0, freio: 0, nitro: false, mao: false, reset: false };
    let raf = 0, ultimo = performance.now(), acumHud = 0, terminou = false, ultimoCont = 99;

    const aoTecla = (e, valor) => {
      if (e.code === 'Enter' && valor && !ctrl.current.rodando) { iniciar(); e.preventDefault(); return; }
      if ((e.code === 'Escape' || e.code === 'KeyP') && valor) { alternarPausa(); e.preventDefault(); return; }
      if (e.code === 'KeyM' && valor) { alternarSom(); return; }
      if (e.code === 'KeyR' && valor) { reset.current = true; return; }
      const k = TECLAS[e.code];
      if (k) { teclas.current[k] = valor; e.preventDefault(); }
    };
    const baixo = (e) => aoTecla(e, true);
    const cima = (e) => aoTecla(e, false);
    const perdeuFoco = () => { teclas.current = {}; if (ctrl.current.rodando && !ctrl.current.pausado) alternarPausa(); };
    window.addEventListener('keydown', baixo);
    window.addEventListener('keyup', cima);
    window.addEventListener('blur', perdeuFoco);

    const eventos = () => {
      const ev = corr.ev;
      if (ev.batida) { somBatida(ev.batida); render.tremer(ev.batida / 25); }
      if (ev.parede) { somParede(ev.parede); render.tremer(ev.parede / 20); }
      if (ev.largada) somBip(true);
      if (ev.volta) somVolta();
      if (ev.ultrap) somUltrap();
      if (ev.chegada) somChegada();
    };

    const loop = (agora) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (agora - ultimo) / 1000);
      ultimo = agora;
      const c = ctrl.current, t = teclas.current;
      const ativo = c.rodando && !c.pausado;
      if (ativo) {
        inp.dir = (t.dir ? 1 : 0) - (t.esq ? 1 : 0);
        inp.acel = t.acel ? 1 : 0;
        inp.freio = t.freio ? 1 : 0;
        inp.nitro = !!t.nitro;
        inp.mao = !!t.mao;
        inp.reset = reset.current; reset.current = false;
        avancar(corr, inp, dt);
        eventos();
        if (corr.estado === 'contagem') {
          const n = Math.ceil(corr.cont);
          if (n !== ultimoCont && n >= 1 && n <= 3) somBip(false);
          ultimoCont = n;
        }
      }
      const j = corr.jogador;
      atualizarSom({
        vel01: Math.max(0, j.vf) / (j.stats.vmax * 1.1), acel: !!inp.acel && ativo, nitro: j.nitroOn && ativo,
        derrapa: ativo ? corr.ev.derrapa || 0 : 0, pausado: !ativo,
      });
      corr.ev = {};
      render.desenhar(corr, dt);
      acumHud += dt;
      if (acumHud > 0.09) { acumHud = 0; setHud(snapshot(corr)); }
      if (corr.estado === 'fim' && !terminou) { terminou = true; setTimeout(() => onFim(corr.resultado), 300); }
    };
    raf = requestAnimationFrame(loop);
    setHud(snapshot(corr));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', baixo);
      window.removeEventListener('keyup', cima);
      window.removeEventListener('blur', perdeuFoco);
      pararSons();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="corrida">
      <div className="tela-jogo">
        <canvas ref={canvasRef} className="canvas" aria-label={`Corrida em ${fase.nome}`} />
        {hud && <Hud hud={hud} />}
        {!iniciou && (
          <button type="button" className="pausa" onClick={iniciar} autoFocus>
            <strong>{fase.emoji} {fase.nome.toUpperCase()}</strong>
            <small>{fase.voltas} voltas · largada em 5º de 6 pilotos</small>
            <span>▶ ENTER OU CLIQUE PARA LARGAR</span>
            <small>Dica: {fase.dica}</small>
          </button>
        )}
        {iniciou && pausado && (
          <div className="pausa">
            <strong>PAUSA</strong>
            <button type="button" className="btn-jogar" onClick={alternarPausa}>▶ CONTINUAR</button>
            <button type="button" className="btn-link" onClick={onSair}>Abandonar corrida</button>
          </div>
        )}
        <button type="button" className="btn-som" onClick={alternarSom} aria-label={mudo ? 'Ligar som' : 'Desligar som'}>{mudo ? '🔇' : '🔊'}</button>
      </div>
      <p className="controles-linha">
        <kbd>← →</kbd> virar · <kbd>↑</kbd> acelerar · <kbd>↓</kbd> freio/ré · <kbd>Shift</kbd> nitro · <kbd>Espaço</kbd> freio de mão (derrapar) · <kbd>R</kbd> voltar à pista · <kbd>Esc</kbd> pausa · <kbd>M</kbd> som
      </p>
    </div>
  );
}
