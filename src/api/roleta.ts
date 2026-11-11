import type {
  ApostaPayload,
  RoletaApiError,
  RoletaConfig,
  RoletaGiroResult,
  RoletaSessao,
} from '../types/roleta'
import { apiUrl } from './playhub'

const SESSION_KEY = 'playhub_roleta_sessao_id'

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T | RoletaApiError
  if (!res.ok) {
    const err = data as RoletaApiError
    if ('erro' in err && err.erro?.mensagem) {
      throw new Error(err.erro.mensagem)
    }
    throw new Error(`API respondeu ${res.status}`)
  }
  return data as T
}

export function getStoredRoletaSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function storeRoletaSessionId(id: string): void {
  localStorage.setItem(SESSION_KEY, id)
}

export function clearRoletaSessionId(): void {
  localStorage.removeItem(SESSION_KEY)
}

export async function fetchRoletaConfig(
  mesa = 'roleta-brasil',
  signal?: AbortSignal,
): Promise<RoletaConfig> {
  const res = await fetch(apiUrl(`/api/v1/roleta/?mesa=${encodeURIComponent(mesa)}`), {
    signal,
  })
  return parseJson(res)
}

export async function createRoletaSession(apelido = ''): Promise<RoletaSessao> {
  const res = await fetch(apiUrl('/api/v1/roleta/sessoes/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mesa_slug: 'roleta-brasil', apelido }),
  })
  const sessao = await parseJson<RoletaSessao>(res)
  storeRoletaSessionId(sessao.sessao_id)
  return sessao
}

export async function fetchRoletaSession(sessaoId: string): Promise<RoletaSessao> {
  const res = await fetch(apiUrl(`/api/v1/roleta/sessoes/${sessaoId}/`))
  return parseJson(res)
}

export async function spinRoleta(
  sessaoId: string,
  apostas: ApostaPayload[],
): Promise<RoletaGiroResult> {
  const res = await fetch(apiUrl('/api/v1/roleta/girar/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessao_id: sessaoId, apostas }),
  })
  return parseJson(res)
}
