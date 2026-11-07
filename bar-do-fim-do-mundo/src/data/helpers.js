// Pequenos construtores usados para escrever os pedidos dos clientes de forma legível.
//
// Um pedido é uma lista de pedaços: strings comuns (texto solto) e "pistas".
// Cada pista é um trecho destacado do texto e carrega as condições que o drink precisa cumprir.

export const min = (stat, value) => ({ stat, op: 'min', value });
export const max = (stat, value) => ({ stat, op: 'max', value });

export const clue = (texto, ...conds) => ({ texto, conds });
