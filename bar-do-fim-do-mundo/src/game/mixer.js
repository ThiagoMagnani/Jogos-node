import { STATS, zeroStats } from '../data/stats';
import { INGREDIENTE_POR_ID } from '../data/ingredients';
import { TECNICA_POR_ID } from '../data/techniques';

/** Soma os sabores dos ingredientes escolhidos + o efeito da técnica de preparo. */
export function calcularMistura(ingredienteIds, tecnicaId) {
  const total = zeroStats();
  ingredienteIds.forEach((id) => {
    const ing = INGREDIENTE_POR_ID[id];
    Object.entries(ing.stats).forEach(([stat, valor]) => {
      total[stat] += valor;
    });
  });
  // Sem ingredientes não há o que preparar: a técnica não faz nada sozinha.
  const tecnica = TECNICA_POR_ID[tecnicaId];
  if (tecnica && ingredienteIds.length > 0) {
    Object.entries(tecnica.stats).forEach(([stat, valor]) => {
      total[stat] += valor;
    });
  }
  return total;
}

export function cumpreCondicao(stats, cond) {
  return cond.op === 'min' ? stats[cond.stat] >= cond.value : stats[cond.stat] <= cond.value;
}

/** As pistas de um cliente são os pedaços do pedido que não são texto solto. */
export function getPistas(cliente) {
  return cliente.pedido.filter((parte) => typeof parte !== 'string');
}

/** Marca cada pista como cumprida (ok: true) ou não, para o drink atual. */
export function avaliarPistas(cliente, stats) {
  return getPistas(cliente).map((pista) => ({
    ...pista,
    ok: pista.conds.every((c) => cumpreCondicao(stats, c)),
  }));
}

/** perfeito = todas as pistas · bom = pelo menos metade · ruim = menos que isso */
export function calcularVeredito(pistasAvaliadas) {
  const total = pistasAvaliadas.length;
  const acertos = pistasAvaliadas.filter((p) => p.ok).length;
  if (acertos === total) return 'perfeito';
  if (acertos / total >= 0.5) return 'bom';
  return 'ruim';
}

export function descreverCondicao(cond) {
  const { label } = STATS[cond.stat];
  if (cond.op === 'max' && cond.value === 0 && cond.stat !== 'temp') {
    return `Sem ${label.toLowerCase()}`;
  }
  return `${label} ${cond.op === 'min' ? '≥' : '≤'} ${cond.value}`;
}

export const descreverPista = (pista) => pista.conds.map(descreverCondicao).join(' e ');

/**
 * Procura todas as receitas (combinações de ingredientes + técnica) que deixam o cliente
 * 100% satisfeito. Usado nos testes para garantir que todo pedido tem solução,
 * e poderia alimentar um modo "dica final" no futuro.
 */
export function acharSolucoes(cliente, ingredienteIds, tecnicaIds, slots, limite = Infinity) {
  const achadas = [];

  const tentar = (escolhidos) => {
    for (const tecnica of tecnicaIds) {
      const stats = calcularMistura(escolhidos, tecnica);
      const pistas = avaliarPistas(cliente, stats);
      if (pistas.every((p) => p.ok)) {
        achadas.push({ ingredientes: [...escolhidos], tecnica });
        if (achadas.length >= limite) return true;
      }
    }
    return false;
  };

  const explorar = (inicio, escolhidos) => {
    if (escolhidos.length > 0 && tentar(escolhidos)) return true;
    if (escolhidos.length === slots) return false;
    for (let i = inicio; i < ingredienteIds.length; i++) {
      escolhidos.push(ingredienteIds[i]);
      if (explorar(i, escolhidos)) return true; // i (e não i+1): pode repetir ingrediente
      escolhidos.pop();
    }
    return false;
  };

  explorar(0, []);
  return achadas;
}

// ---------------------------------------------------------------------------
// Cores (só para deixar o copo bonito): cada ingrediente tem uma cor dominante
// e o líquido do copo é a média das cores dos ingredientes escolhidos.
// ---------------------------------------------------------------------------
export function corDoIngrediente(ing) {
  const [stat, valor] = Object.entries(ing.stats).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
  if (stat === 'temp' && valor < 0) return '#7fd8ff';
  return STATS[stat].cor;
}

const hexParaRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

export function corDaMistura(ingredienteIds) {
  if (!ingredienteIds.length) return '#ffffff';
  const soma = ingredienteIds.reduce(
    (acc, id) => {
      const [r, g, b] = hexParaRgb(corDoIngrediente(INGREDIENTE_POR_ID[id]));
      return [acc[0] + r, acc[1] + g, acc[2] + b];
    },
    [0, 0, 0]
  );
  const n = ingredienteIds.length;
  return `rgb(${Math.round(soma[0] / n)}, ${Math.round(soma[1] / n)}, ${Math.round(soma[2] / n)})`;
}
