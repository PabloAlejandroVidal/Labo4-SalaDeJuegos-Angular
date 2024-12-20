
export const gameStates = {
  notStarted: 'notStarted',
  playing: 'playing',
  paused: 'paused',
  gameOver: 'gameOver',
} as const;
export type GameState = keyof typeof gameStates;
