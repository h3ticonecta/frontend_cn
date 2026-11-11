import type {
  ApostaPayload,
  RoletaConfig,
  RoletaGiroResult,
  RoletaSessao,
} from '../types/roleta'
import { apiUrl } from './playhub'

const SESSION_KEY = 'playhub_roleta_sessao_id'

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
    const parts: string[] = []
    for (const [key, val] of Object.entries(obj)) {
      if (Array.isArray(val)) {
        parts.push(`${key}: ${val.map(String).join(', ')}`)
      } else if (typeof val === 'string') {
        parts.push(`${key}: ${val}`)
      }
    }
    if (parts.length > 0) return parts.join(' · ')
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

export async function createRoletaSession(
  apelido = '',
  mesaSlug = 'roleta-brasil',
): Promise<RoletaSessao> {
  const res = await fetch(apiUrl('/api/v1/roleta/sessoes/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mesa_slug: mesaSlug, apelido }),
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
