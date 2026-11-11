export type GameCategory =
  | 'todos'
  | 'populares'
  | 'slots'
  | 'mesa'
  | 'ao-vivo'
  | 'crash'
  | 'novos'

export type GameBadge = 'novo' | 'hot' | 'jackpot' | null

/** Metadados `play` do card (home e GET /games/{slug}/). */
export interface GamePlayMetaRoleta {
  kind: 'roleta'
  mesa_slug: string
  client_route: string
  /** Legado / docs no backend; opcional no JSON. */
  contrato?: string
  api: {
    config: string
    sessoes: string
    girar: string
    card: string
    sessao_detail?: string
  }
}

export interface GamePlayMetaSlot {
  kind: 'slot'
  slot_slug: string
  client_route: string
  api: {
    config: string
    sessoes: string
    girar: string
    card: string
    sessao_detail?: string
  }
}

export type GamePlayMeta = GamePlayMetaRoleta | GamePlayMetaSlot

export interface Game {
  id: string
  title: string
  provider: string
  category: Exclude<GameCategory, 'todos' | 'populares' | 'novos'>
  badge: GameBadge
  rtp?: string
  gradient: [string, string]
  icon: string
  /** `null` para jogos só vitrine. */
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
