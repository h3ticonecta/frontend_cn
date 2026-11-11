import type {
  FortuneGemsConfig,
  FortuneGemsGiroResult,
  FortuneGemsSessao,
} from '../types/fortuneGems'
import { apiUrl } from './playhub'

const SESSION_KEY = 'playhub_fortune_gems_sessao_id'

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

export function getStoredFortuneGemsSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function storeFortuneGemsSessionId(id: string): void {
  localStorage.setItem(SESSION_KEY, id)
}

export function clearFortuneGemsSessionId(): void {
  localStorage.removeItem(SESSION_KEY)
}

export async function fetchFortuneGemsConfig(
  jogo = 'fortune-gems',
  signal?: AbortSignal,
): Promise<FortuneGemsConfig> {
  const res = await fetch(
    apiUrl(`/api/v1/slots/fortune-gems/?jogo=${encodeURIComponent(jogo)}`),
    { signal },
  )
  return parseJson(res)
}

export async function createFortuneGemsSession(
  jogoSlug = 'fortune-gems',
  apelido = '',
): Promise<FortuneGemsSessao> {
  const res = await fetch(apiUrl('/api/v1/slots/fortune-gems/sessoes/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jogo_slug: jogoSlug, apelido }),
  })
  const sessao = await parseJson<FortuneGemsSessao>(res)
  storeFortuneGemsSessionId(sessao.sessao_id)
  return sessao
}

export async function fetchFortuneGemsSession(sessaoId: string): Promise<FortuneGemsSessao> {
  const res = await fetch(apiUrl(`/api/v1/slots/fortune-gems/sessoes/${sessaoId}/`))
  return parseJson(res)
}

export async function spinFortuneGems(
  sessaoId: string,
  aposta: number | string,
): Promise<FortuneGemsGiroResult> {
  const res = await fetch(apiUrl('/api/v1/slots/fortune-gems/girar/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessao_id: sessaoId, aposta }),
  })
  return parseJson(res)
}
