import type { Game, GamePlayMetaSlot } from './playhub'

export type WolfGoldGrid = string[][] // [col][row]

export interface WolfGoldJogoConfig {
  slug: string
  nome: string
  rtp: string
  saldo_inicial: string
  aposta_minima: string
  aposta_maxima: string
  linhas: number
  jackpots: { mini: string; major: string; mega: string }
}

export interface WolfGoldSymbolRow {
  id: string
  label: string
  pago_3: number
  pago_4: number
  pago_5: number
}

export interface WolfGoldConfig {
  jogo: WolfGoldJogoConfig
  simbolos: WolfGoldSymbolRow[]
  paylines: number[][]
  historico_recente?: { modo: string; premio: string; aposta: string; em: string }[]
}

export interface WolfGoldSessaoEstado {
  mode: string
  free_spins_left: number
  giant_symbol: string | null
  aposta_total_ref: string | null
  money_grid: (string | null)[] | null
  respins_left: number
}

export interface WolfGoldSessao {
  sessao_id: string
  apelido: string
  jogo_slug: string
  saldo: string
  estado: WolfGoldSessaoEstado
}

export interface WolfGoldSpinResult {
  giro_id: number
  modo: string
  grade: WolfGoldGrid
  aposta: string
  premio: string
  saldo: string
  estado: WolfGoldSessaoEstado
  detalhes: {
    linhas_vencedoras?: { linha: number; simbolo: string; contagem: number; premio: string; padrao: number[] }[]
    free_spins?: number
    free_spins_restantes?: number
    money_respin_inicio?: boolean
    money_respin?: { respins_left: number; novo_money: boolean }
    jackpot?: string
    giant_symbol?: string
  }
}

export interface WolfGoldGameDetail {
  card: Game
  play: GamePlayMetaSlot | null
  slot?: WolfGoldConfig
}
