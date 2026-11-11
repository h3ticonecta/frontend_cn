export type WolfSymbolId =
  | 'wolf'
  | 'buffalo'
  | 'eagle'
  | 'puma'
  | 'a'
  | 'k'
  | 'q'
  | 'j'
  | 'wild'
  | 'scatter'
  | 'money'

export const WOLF_SYMBOL_EMOJI: Record<WolfSymbolId, string> = {
  wolf: '🐺',
  buffalo: '🦬',
  eagle: '🦅',
  puma: '🐆',
  a: 'A',
  k: 'K',
  q: 'Q',
  j: 'J',
  wild: '✨🐺',
  scatter: '🏔️',
  money: '🪙',
}

export const WOLF_SYMBOL_LABEL: Record<WolfSymbolId, string> = {
  wolf: 'Lobo',
  buffalo: 'Búfalo',
  eagle: 'Águia',
  puma: 'Puma',
  a: 'Ás',
  k: 'Rei',
  q: 'Dama',
  j: 'Valete',
  wild: 'Wild dourado',
  scatter: 'Lua nas montanhas',
  money: 'Moeda lunar',
}

export function asWolfSymbol(id: string): WolfSymbolId {
  const allowed = Object.keys(WOLF_SYMBOL_EMOJI) as WolfSymbolId[]
  return allowed.includes(id as WolfSymbolId) ? (id as WolfSymbolId) : 'j'
}

export function formatCredits(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const REEL_SPIN_MS = 110
export const REEL_STOP_STAGGER_MS = 180
