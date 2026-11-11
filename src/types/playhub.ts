export type GameCategory =
  | 'todos'
  | 'populares'
  | 'slots'
  | 'mesa'
  | 'ao-vivo'
  | 'crash'
  | 'novos'

export type GameBadge = 'novo' | 'hot' | 'jackpot' | null

export interface GamePlayMeta {
  kind: 'roleta'
  mesa_slug: string
  client_route: string
  contrato: string
  api: {
    config: string
    sessoes: string
    sessao_detail: string
    girar: string
    card: string
  }
}

export interface Game {
  id: string
  title: string
  provider: string
  category: Exclude<GameCategory, 'todos' | 'populares' | 'novos'>
  badge: GameBadge
  rtp?: string
  gradient: [string, string]
  icon: string
  play: GamePlayMeta | null
}

export interface CategoryTab {
  id: GameCategory
  label: string
}

export interface LiveItem {
  name: string
  dealer: string
  viewers: number
}

export interface Promotion {
  title: string
  desc: string
  tag: string
}

export interface HeroContent {
  eyebrow: string
  title_prefix: string
  highlight: string
  title_suffix: string
  subtitle: string
  cta_primary: string
  cta_secondary: string
  trust_items: string[]
}

export interface HomeData {
  categories: CategoryTab[]
  games: Game[]
  popular_ids: string[]
  new_ids: string[]
  providers: string[]
  live: LiveItem[]
  promotions: Promotion[]
  hero: HeroContent | null
}
