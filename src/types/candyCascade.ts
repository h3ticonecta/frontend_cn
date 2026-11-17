import type { Chances } from './chances'
import type { Game, GamePlayMetaSlot } from './playhub'

export interface CandyCascadeJogoConfig {
  slug: string
  card_slug: string
  nome: string
  titulo_card: string
  nome_exibicao_modal: string
  client_route: string
  rtp: string
  saldo_inicial: string
  aposta_minima?: string
  aposta_maxima?: string
  grade: { colunas: number; linhas: number }
  cluster_minimo: number
  aviso_demo: string
  chances: Chances
  opcoes: {
    apostas_permitidas: string[]
    aposta_extra_markup: string
    comprar_free_spins_mult: string
    max_ganho_por_giro: string
  }
  bonus: {
    scatters_para_ativar: number
    free_spins_iniciais: number
    retrigger_giros: number
  }
}

export interface CandyCascadeSymbolConfig {
  id: string
  label: string
  pagamento_8_9: string
  pagamento_10_11: string
  pagamento_12_mais: string
}

export interface CandyCascadeHistoricoItem {
  premio: string
  aposta: string
  modo: string
  em: string
}

export interface CandyCascadeConfig {
  jogo: CandyCascadeJogoConfig
  simbolos: CandyCascadeSymbolConfig[]
  regras_resumo: string[]
  historico_recente?: CandyCascadeHistoricoItem[]
}

export interface CandyCascadeSessaoEstado {
  mode: string
  free_spins_left: number
  free_spins_total: string
  aposta_ref: string | null
  extra_bet: boolean
}

export interface CandyCascadeSessao {
  sessao_id: string
  apelido: string
  jogo_slug: string
  saldo: string
  estado: CandyCascadeSessaoEstado
}

export type CandyCascadeCell = [number, number]

export interface CandyCascadeClusterGanho {
  simbolo: string
  contagem: number
  premio: string
  celulas: CandyCascadeCell[]
}

export interface CandyCascadePassoGanho {
  ganhos: CandyCascadeClusterGanho[]
  premio_parcial: string
  grade: (string | null)[][]
  multiplicadores: (number | null)[][]
}

export interface CandyCascadePassoScatter {
  evento: 'pagamento_scatter'
  scatters: number
  premio_parcial: string
  grade: (string | null)[][]
  multiplicadores: (number | null)[][]
}

export interface CandyCascadePassoMult {
  evento: 'multiplicadores_aplicados'
  fator: number
  premio_antes: string
  premio_depois: string
}

export interface CandyCascadePassoTeto {
  evento: 'teto_maximo'
  teto: string
}

export type CandyCascadePasso =
  | CandyCascadePassoGanho
  | CandyCascadePassoScatter
  | CandyCascadePassoMult
  | CandyCascadePassoTeto

export function isPassoGanho(p: CandyCascadePasso): p is CandyCascadePassoGanho {
  return 'ganhos' in p
}

export interface CandyCascadeGiroResult {
  giro_id: number
  modo: string
  aposta_cobrada: string
  premio: string
  saldo: string
  cascatas: CandyCascadePasso[]
  grade: (string | null)[][]
  multiplicadores: (number | null)[][]
  estado: CandyCascadeSessaoEstado
  aviso_demo: string
}

export interface CandyCascadeGameDetail {
  card: Game
  play: GamePlayMetaSlot | null
  slot?: CandyCascadeConfig
}