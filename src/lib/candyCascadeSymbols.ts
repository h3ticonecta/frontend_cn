export const CANDY_SYMBOL_EMOJI: Record<string, string> = {
  grape: '🍇',
  cherry: '🍒',
  lemon: '🍋',
  melon: '🍈',
  plum: '🫐',
  jelly: '🍬',
  ribbon: '🎀',
  heart: '💖',
  star: '⭐',
  scatter: '🍭',
  bomb: '💣',
}

export function candyEmoji(id: string | null | undefined): string {
  if (!id) return '·'
  return CANDY_SYMBOL_EMOJI[id] ?? '❓'
}

export function formatCredits(n: number | string): string {
  const v = typeof n === 'string' ? Number(n) : n
  if (!Number.isFinite(v)) return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}