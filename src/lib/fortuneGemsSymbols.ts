export type FortuneSymbolId = '7' | 'gem' | 'bell' | 'melon' | 'cherry' | 'lemon' | 'grape'

export type FortuneSymbol = {
  id: FortuneSymbolId
  emoji: string
  label: string
  paytableMultiplier: number
}

export const FORTUNE_SYMBOLS: FortuneSymbol[] = [
  { id: '7', emoji: '7', label: 'MEGA JACKPOT', paytableMultiplier: 500 },
  { id: 'gem', emoji: '💎', label: 'Diamantes', paytableMultiplier: 200 },
  { id: 'bell', emoji: '🔔', label: 'Sinos de Ouro', paytableMultiplier: 100 },
  { id: 'melon', emoji: '🍉', label: 'Melancias', paytableMultiplier: 50 },
  { id: 'cherry', emoji: '🍒', label: 'Cerejas Clássicas', paytableMultiplier: 25 },
  { id: 'lemon', emoji: '🍋', label: 'Limão', paytableMultiplier: 10 },
  { id: 'grape', emoji: '🍇', label: 'Uva', paytableMultiplier: 10 },
]

const SPIN_POOL: FortuneSymbolId[] = ['7', 'gem', 'bell', 'melon', 'cherry', 'lemon', 'grape']

export function randomFortuneSymbol(): FortuneSymbolId {
  return SPIN_POOL[Math.floor(Math.random() * SPIN_POOL.length)]!
}

export function symbolById(id: FortuneSymbolId): FortuneSymbol {
  return FORTUNE_SYMBOLS.find((s) => s.id === id) ?? FORTUNE_SYMBOLS[0]!
}

export function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
