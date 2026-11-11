/** Colunas da mesa europeia (para apostas column_1..3). */
export const ROULETTE_COLUMNS: readonly [number, number, number][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11, 12],
  [13, 14, 15],
  [16, 17, 18],
  [19, 20, 21],
  [22, 23, 24],
  [25, 26, 27],
  [28, 29, 30],
  [31, 32, 33],
  [34, 35, 36],
]

export function numeroNaColuna(n: number, col: 1 | 2 | 3): boolean {
  if (n < 1 || n > 36) return false
  return ROULETTE_COLUMNS.some((row) => row[col - 1] === n)
}

export function corDoNumero(n: number, vermelhos: number[]): 'red' | 'black' | 'green' {
  if (n === 0) return 'green'
  return vermelhos.includes(n) ? 'red' : 'black'
}

export const TIPO_APOSTA_LABEL: Record<string, string> = {
  straight: 'Número exato',
  red: 'Vermelho',
  black: 'Preto',
  odd: 'Ímpar',
  even: 'Par',
  low: '1–18',
  high: '19–36',
  dozen_1: '1ª dúzia (1–12)',
  dozen_2: '2ª dúzia (13–24)',
  dozen_3: '3ª dúzia (25–36)',
  column_1: 'Coluna 1',
  column_2: 'Coluna 2',
  column_3: 'Coluna 3',
}
