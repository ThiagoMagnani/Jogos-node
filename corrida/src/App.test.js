import { render, screen } from '@testing-library/react';
import App from './App';

test('mostra a tela inicial do jogo', () => {
  render(<App />);
  expect(screen.getByText('NOVO CAMPEONATO')).toBeInTheDocument();
});
