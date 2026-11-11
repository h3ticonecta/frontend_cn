export type GameCategory =
  | 'todos'
  | 'populares'
  | 'slots'
  | 'mesa'
  | 'ao-vivo'
  | 'crash'
  | 'novos'

export type GameBadge = 'novo' | 'hot' | 'jackpot' | null

export interface Game {
  id: string
  title: string
  provider: string
  category: Exclude<GameCategory, 'todos' | 'populares'>
  badge: GameBadge
  rtp?: string
  gradient: [string, string]
  icon: string
}

export const CATEGORIES: { id: GameCategory; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'populares', label: 'Populares' },
  { id: 'slots', label: 'Slots' },
  { id: 'mesa', label: 'Mesa' },
  { id: 'ao-vivo', label: 'Ao vivo' },
  { id: 'crash', label: 'Crash' },
  { id: 'novos', label: 'Novos' },
]

export const GAMES: Game[] = [
  {
    id: 'fortune-gems',
    title: 'Fortune Gems',
    provider: 'Pragmatic Play',
    category: 'slots',
    badge: 'hot',
    rtp: '96.5%',
    gradient: ['#5b21b6', '#db2777'],
    icon: '💎',
  },
  {
    id: 'roleta-brasil',
    title: 'Roleta Brasil',
    provider: 'Evolution',
    category: 'ao-vivo',
    badge: 'hot',
    gradient: ['#065f46', '#047857'],
    icon: '🎡',
  },
  {
    id: 'aviator',
    title: 'Aviator',
    provider: 'Spribe',
    category: 'crash',
    badge: 'hot',
    gradient: ['#dc2626', '#f97316'],
    icon: '✈️',
  },
  {
    id: 'blackjack-vip',
    title: 'Blackjack VIP',
    provider: 'Ezugi',
    category: 'mesa',
    badge: null,
    rtp: '99.2%',
    gradient: ['#1e3a5f', '#0f172a'],
    icon: '🃏',
  },
  {
    id: 'gates-olympus',
    title: 'Gates of Olympus',
    provider: 'Pragmatic Play',
    category: 'slots',
    badge: 'jackpot',
    gradient: ['#fbbf24', '#b45309'],
    icon: '⚡',
  },
  {
    id: 'crazy-time',
    title: 'Crazy Time',
    provider: 'Evolution',
    category: 'ao-vivo',
    badge: 'jackpot',
    gradient: ['#7c3aed', '#2563eb'],
    icon: '🎪',
  },
  {
    id: 'spaceman',
    title: 'Spaceman',
    provider: 'Pragmatic Play',
    category: 'crash',
    badge: 'novo',
    gradient: ['#312e81', '#6366f1'],
    icon: '🚀',
  },
  {
    id: 'sweet-bonanza',
    title: 'Sweet Bonanza',
    provider: 'Pragmatic Play',
    category: 'slots',
    badge: null,
    rtp: '96.4%',
    gradient: ['#ec4899', '#a855f7'],
    icon: '🍬',
  },
  {
    id: 'bac-bo',
    title: 'Bac Bo',
    provider: 'Evolution',
    category: 'mesa',
    badge: 'novo',
    gradient: ['#0d9488', '#134e4a'],
    icon: '🎲',
  },
  {
    id: 'wolf-gold',
    title: 'Wolf Gold',
    provider: 'Pragmatic Play',
    category: 'slots',
    badge: null,
    gradient: ['#78350f', '#eab308'],
    icon: '🐺',
  },
  {
    id: 'lightning-roulette',
    title: 'Lightning Roulette',
    provider: 'Evolution',
    category: 'ao-vivo',
    badge: 'hot',
    gradient: ['#1d4ed8', '#fcd34d'],
    icon: '⚡',
  },
  {
    id: 'mines',
    title: 'Mines',
    provider: 'Spribe',
    category: 'crash',
    badge: null,
    gradient: ['#374151', '#6b7280'],
    icon: '💣',
  },
]

export const POPULAR_IDS = [
  'fortune-gems',
  'aviator',
  'roleta-brasil',
  'gates-olympus',
  'crazy-time',
]

export const NEW_IDS = ['spaceman', 'bac-bo']

export const PROVIDERS = [
  'Pragmatic Play',
  'Evolution',
  'Spribe',
  'Ezugi',
  'NetEnt',
  'Play\'n GO',
  'Red Tiger',
  'PG Soft',
]
