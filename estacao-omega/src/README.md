# Estação Ômega — organização do código

- `index.js` / `App.js` — entrada e fluxo de telas (título → jogo → fim de fase → fim) + música por tela.
- `components/` — React: `GameView` (canvas + loop), `Hud`, `LojaHorda`, `TelaTitulo`, `TelaFase`, `TelaFim`.
- `engine/` — sem React:
  - `game.js` regras (armas, itens, portas, horda) · `enemies.js` IA dos aliens e chefes · `upgrades.js` loja
  - `map.js` fases e arena · `salas.js` divisão em salas (inimigos só acordam ao entrar na sala ou serem atacados)
  - `raycaster.js` renderização 3D · `armas.js` armas em 1ª pessoa · `textures.js`/`sprites.js` pixel art por código
  - `audio.js` efeitos · `musica.js` trilhas sintetizadas · `raio.js` colisão e raios
- Tudo é gerado por código (sem imagens/áudios externos), então o build final é pequeno e fácil de hospedar.
