// ===== Salvamento no navegador (localStorage) =====
import { niveisZerados } from './carros';

const CHAVE = 'asfalto-neon-save-v1';

export const novoSave = (dificuldade = 'dificil') => ({
  versao: 1, dinheiro: 1500, modelo: 'besouro', modelos: ['besouro'], niveis: niveisZerados(),
  cor: '#ff3b3b', dificuldade, corridas: {}, totalCorridas: 0, vitorias: 0,
});

export function carregarSave() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const s = JSON.parse(bruto);
    if (!s || s.versao !== 1) return null;
    return { ...novoSave(), ...s, niveis: { ...niveisZerados(), ...s.niveis } };
  } catch (e) { return null; }
}

export function salvar(save) {
  try { localStorage.setItem(CHAVE, JSON.stringify(save)); } catch (e) { /* sem espaço / modo privado */ }
}

export function apagarSave() {
  try { localStorage.removeItem(CHAVE); } catch (e) { /* ignora */ }
}

/** Devolve um novo save com o resultado da corrida registrado (recorde, dinheiro, estatísticas). */
export function registrarCorrida(save, fase, resultado, premio) {
  const ant = save.corridas[fase.id];
  const melhorPos = ant ? Math.min(ant.melhorPos, resultado.pos) : resultado.pos;
  const melhorTempo = resultado.pos <= 6 && resultado.tempo != null ? Math.min(ant && ant.melhorTempo ? ant.melhorTempo : Infinity, resultado.tempo) : ant && ant.melhorTempo;
  const melhorVolta = resultado.melhorVolta != null ? Math.min(ant && ant.melhorVolta ? ant.melhorVolta : Infinity, resultado.melhorVolta) : ant && ant.melhorVolta;
  return {
    ...save,
    dinheiro: save.dinheiro + premio,
    totalCorridas: save.totalCorridas + 1,
    vitorias: save.vitorias + (resultado.pos === 1 ? 1 : 0),
    corridas: { ...save.corridas, [fase.id]: { melhorPos, melhorTempo, melhorVolta, vezes: (ant ? ant.vezes : 0) + 1 } },
  };
}
