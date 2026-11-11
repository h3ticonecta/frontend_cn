import type { RoletaConfig, RoletaGameDetail } from '../types/roleta'
import { apiUrl } from './playhub'

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as unknown
  if (!res.ok) {
    const detail =
      data && typeof data === 'object' && 'detail' in data
        ? String((data as { detail: string }).detail)
        : `API respondeu ${res.status}`
    throw new Error(detail)
  }
  return data as T
}

export async function fetchRoletaGameDetail(
  gameSlug: string,
  signal?: AbortSignal,
): Promise<RoletaGameDetail> {
  const res = await fetch(apiUrl(`/api/v1/games/${encodeURIComponent(gameSlug)}/`), { signal })
  return parseJson(res)
}

/** Normaliza config da mesa (histórico opcional no card aggregate). */
export function normalizeRoletaConfig(partial: RoletaConfig): RoletaConfig {
  return {
    ...partial,
    historico_recente: partial.historico_recente ?? [],
  }
}
