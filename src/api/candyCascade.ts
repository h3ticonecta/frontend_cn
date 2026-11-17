import type {
  CandyCascadeConfig,
  CandyCascadeGiroResult,
  CandyCascadeSessao,
} from '../types/candyCascade'
import { normalizeCandyCascadeConfig } from './games'
import { apiUrl } from './playhub'

const SESSION_KEY = 'playhub_candy_cascade_sessao_id'

function extractErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (
      'erro' in obj &&
      obj.erro &&
      typeof obj.erro === 'object' &&
      'mensagem' in (obj.erro as object)
    ) {
      return String((obj.erro as { mensagem: string }).mensagem)
    }
  }
  return `API respondeu ${status}`
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as unknown
  if (!res.ok) {
    throw new Error(extractErrorMessage(data, res.status))
  }
  return data as T
}

export function getStoredCandyCascadeSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function storeCandyCascadeSessionId(id: string): void {
  localStorage.setItem(SESSION_KEY, id)
}

export function clearCandyCascadeSessionId(): void {
  localStorage.removeItem(SESSION_KEY)
}

export async function fetchCandyCascadeConfig(
  jogo = 'candy-cascade',
  signal?: AbortSignal,
): Promise<CandyCascadeConfig> {
  const res = await fetch(
    apiUrl(`/api/v1/slots/candy-cascade/?jogo=${encodeURIComponent(jogo)}`),
    { signal },
  )
  return normalizeCandyCascadeConfig(await parseJson<CandyCascadeConfig>(res))
}

export async function createCandyCascadeSession(
  jogoSlug = 'candy-cascade',
  apelido = '',
): Promise<CandyCascadeSessao> {
  const res = await fetch(apiUrl('/api/v1/slots/candy-cascade/sessoes/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jogo_slug: jogoSlug, apelido }),
  })
  const sessao = await parseJson<CandyCascadeSessao>(res)
  storeCandyCascadeSessionId(sessao.sessao_id)
  return sessao
}

export async function fetchCandyCascadeSession(sessaoId: string): Promise<CandyCascadeSessao> {
  const res = await fetch(apiUrl(`/api/v1/slots/candy-cascade/sessoes/${sessaoId}/`))
  return parseJson(res)
}

export type CandyCascadeSpinOptions = {
  aposta_extra?: boolean
  comprar_free_spins?: boolean
}

export async function spinCandyCascade(
  sessaoId: string,
  aposta: number | string,
  options: CandyCascadeSpinOptions = {},
): Promise<CandyCascadeGiroResult> {
  const res = await fetch(apiUrl('/api/v1/slots/candy-cascade/girar/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessao_id: sessaoId,
      aposta,
      aposta_extra: options.aposta_extra ?? false,
      comprar_free_spins: options.comprar_free_spins ?? false,
    }),
  })
  return parseJson(res)
}