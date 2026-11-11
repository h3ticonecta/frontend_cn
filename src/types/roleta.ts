import type { Game, GamePlayMeta } from './playhub'

export interface RoletaMesa {
  slug: string
  nome: string
  variante: string
  saldo_inicial: string
  aposta_minima: string
  aposta_maxima: string
  max_apostas_por_giro: number
}

export interface TipoAposta {
  tipo: string
  multiplicador: string
  descricao: string
  requer_numero: boolean
}

export interface RoletaHistoricoItem {
  numero: number
  cor: string
  em: string
}

export interface RoletaConfig {
  mesa: RoletaMesa
  tipos_aposta: TipoAposta[]
  numeros: { min: number; max: number; vermelhos: number[] }
  /** Presente em GET /roleta/; pode faltar em GET /games/{slug}/ → `roleta`. */
  historico_recente?: RoletaHistoricoItem[]
}

/** GET /api/v1/games/roleta-brasil/ */
export interface RoletaGameDetail {
  card: Game
  play: GamePlayMeta | null
  roleta?: RoletaConfig
}

export interface RoletaSessao {
  sessao_id: string
  apelido: string
  mesa_slug: string
  saldo: string
  ultima_rodada: { id: number; numero: number; cor: string; criada_em: string } | null
}

export interface ApostaPayload {
  tipo: string
  valor: string
  numero?: number
}

export interface RoletaGiroResult {
  rodada_id: number
  resultado: { numero: number; cor: string }
  totais: { apostado: string; pago: string; lucro_liquido: string }
  apostas: {
    tipo: string
    numero: number | null
    valor: string
    ganhou: boolean
    pagamento: string
  }[]
  sessao: { id: string; saldo_antes: string; saldo_depois: string }
}

export interface RoletaApiError {
  erro: { codigo: string; mensagem: string }
}
