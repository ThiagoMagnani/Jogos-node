// Técnicas de preparo: mudam o resultado final do drink.
export const TECNICAS = [
  {
    id: 'direto',
    nome: 'Direto no copo',
    icon: '🥃',
    stats: {},
    desc: 'Sem frescuras. O que você colocou é o que você serve.',
    noite: 1,
  },
  {
    id: 'gelo',
    nome: 'Com gelo',
    icon: '🧊',
    stats: { temp: -2 },
    desc: 'Esfria o drink em 2 graus.',
    noite: 1,
  },
  {
    id: 'flambar',
    nome: 'Flambar',
    icon: '🔥',
    stats: { temp: 2, amargo: 1 },
    desc: 'Esquenta 2 graus e o caramelo deixa +1 de amargo.',
    noite: 2,
  },
  {
    id: 'agitar',
    nome: 'Agitar',
    icon: '✨',
    stats: { magia: 1 },
    desc: 'Chacoalhar na coqueteleira acorda +1 de magia.',
    noite: 3,
  },
];

export const TECNICA_POR_ID = TECNICAS.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {});
