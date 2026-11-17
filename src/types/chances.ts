/** Percentuais demo casa × jogador (strings decimais, 2 casas). Config só no backend. */
export type Chances = {
  percentual_casa: string
  percentual_usuario: string
}

export const DEFAULT_CHANCES: Chances = {
  percentual_casa: '55.00',
  percentual_usuario: '45.00',
}