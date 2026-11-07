// Os 7 "sabores" medidos pelo jogo. A temperatura pode ser negativa (frio).
export const STATS = {
  doce: { label: 'Doce', icon: '🍯', cor: '#ffb347' },
  azedo: { label: 'Azedo', icon: '🍋', cor: '#d4e157' },
  amargo: { label: 'Amargo', icon: '☕', cor: '#b08968' },
  picante: { label: 'Picante', icon: '🌶️', cor: '#ff5252' },
  salgado: { label: 'Salgado', icon: '🌊', cor: '#4fc3f7' },
  magia: { label: 'Magia', icon: '✨', cor: '#c792ea' },
  temp: { label: 'Temperatura', icon: '🌡️', cor: '#ff8a65' },
};

export const STAT_KEYS = Object.keys(STATS);

export const zeroStats = () =>
  STAT_KEYS.reduce((acc, k) => {
    acc[k] = 0;
    return acc;
  }, {});
