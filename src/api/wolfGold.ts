import type { WolfGoldConfig, WolfGoldSpinResult, WolfGoldSessao } from '../types/wolfGold'
import { apiUrl } from './playhub'

const SESSION_KEY = 'playhub_wolf_gold_sessao_id'
const SOUND_KEY = 'playhub_wolf_gold_sound'

function extractError(data: unknown, status: number): string {
  if (data && typeof data === 'object' && 'erro' in data) {
    const e = (data as { erro?: { mensagem?: string } }).erro
    if (e?.mensagem) return e.mensagem
  }
  return `API respondeu ${status}`
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as unknown
  if (!res.ok) throw new Error(extractError(data, res.status))
  return data as T
}

export function getStoredWolfGoldSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function storeWolfGoldSessionId(id: string): void {
  localStorage.setItem(SESSION_KEY, id)
}

export function clearWolfGoldSessionId(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function getWolfGoldSoundEnabled(): boolean {
  return localStorage.getItem(SOUND_KEY) !== '0'
}

export function setWolfGoldSoundEnabled(on: boolean): void {
  localStorage.setItem(SOUND_KEY, on ? '1' : '0')
}

export async function fetchWolfGoldConfig(jogo = 'wolf-gold', signal?: AbortSignal): Promise<WolfGoldConfig> {
  const res = await fetch(apiUrl(`/api/v1/slots/wolf-gold/?jogo=${encodeURIComponent(jogo)}`), { signal })
  return parseJson(res)
}

export async function createWolfGoldSession(jogoSlug = 'wolf-gold', apelido = ''): Promise<WolfGoldSessao> {
  const res = await fetch(apiUrl('/api/v1/slots/wolf-gold/sessoes/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jogo_slug: jogoSlug, apelido }),
  })
  const sessao = await parseJson<WolfGoldSessao>(res)
  storeWolfGoldSessionId(sessao.sessao_id)
  return sessao
}

export async function fetchWolfGoldSession(sessaoId: string): Promise<WolfGoldSessao> {
  const res = await fetch(apiUrl(`/api/v1/slots/wolf-gold/sessoes/${sessaoId}/`))
  return parseJson(res)
}

export async function spinWolfGold(
  sessaoId: string,
  aposta: number | string,
  forcar?: Record<string, unknown>,
): Promise<WolfGoldSpinResult> {
  const res = await fetch(apiUrl('/api/v1/slots/wolf-gold/girar/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessao_id: sessaoId, aposta, forcar }),
  })
  return parseJson(res)
}
