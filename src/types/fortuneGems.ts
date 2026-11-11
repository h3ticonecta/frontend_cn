import type { Game, GamePlayMetaSlot } from './playhub'

export interface FortuneGemsJogoConfig {
  slug: string
  nome: string
  rtp: string
  saldo_inicial: string
  aposta_minima: string
  aposta_maxima: string
  jackpot_exibicao: string
}

export interface FortuneGemsSymbolConfig {
  id: string
  label: string
  multiplicador: string
}

export interface FortuneGemsHistoricoItem {
  carreteis: [string, string, string]
  premio: string
  aposta: string
  em: string
}

export interface FortuneGemsConfig {
  jogo: FortuneGemsJogoConfig
  simbolos: FortuneGemsSymbolConfig[]
  linhas_ativas: number
  historico_recente?: FortuneGemsHistoricoItem[]
}

export interface FortuneGemsSessao {
  sessao_id: string
  apelido: string
  jogo_slug: string
  saldo: string
  ultimo_giro: {
    carreteis: [string, string, string]
    premio: string
    aposta: string
    criada_em: string
  } | null
}

export interface FortuneGemsGiroResult {
  giro_id: number
  carreteis: [string, string, string]
  aposta: string
  premio: string
  ganhou: boolean
  motivo: string
  saldo: string
  saldo_antes: string
}

export interface FortuneGemsGameDetail {
  card: Game
  play: GamePlayMetaSlot | null
  slot?: FortuneGemsConfig
}
