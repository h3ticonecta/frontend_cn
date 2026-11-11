import type { HomeData } from '../types/playhub'

/**
 * Em dev, deixe vazio para usar o proxy do Vite (`/api` → Django).
 * Em produção, defina `VITE_API_URL` no **build** (ex.: Railway → Variables).
 */
function resolveApiBase(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined
  if (configured !== undefined && configured.trim() !== '') {
    return configured.replace(/\/$/, '')
  }
  return ''
}

export const API_BASE = resolveApiBase()

/** Produção sem `VITE_API_URL`: fetch em `/api` cai no `index.html` do SPA. */
export const isProductionApiMisconfigured =
  import.meta.env.PROD && API_BASE === ''

export const PRODUCTION_API_SETUP_MESSAGE =
  'Defina a variável VITE_API_URL no Railway (ambiente de build) com a URL pública do Django, sem barra no final. Ex.: https://seu-backend.up.railway.app — depois faça redeploy. No Django, libere CORS para este domínio do frontend.'

/** Texto amigável na tela de erro. */
export const API_HINT = isProductionApiMisconfigured
  ? PRODUCTION_API_SETUP_MESSAGE
  : API_BASE
    ? API_BASE
    : import.meta.env.DEV
      ? 'mesma origem (proxy Vite → http://127.0.0.1:8000)'
      : '(não definida)'

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return API_BASE ? `${API_BASE}${p}` : p
}

async function parseResponseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('A API respondeu vazio.')
  }
  if (trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype')) {
    if (isProductionApiMisconfigured) {
      throw new Error(PRODUCTION_API_SETUP_MESSAGE)
    }
    throw new Error(
      'A API retornou HTML em vez de JSON. Em produção, configure VITE_API_URL no build; em dev, suba o Django na porta 8000.',
    )
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error('Resposta da API não é JSON válido.')
  }
}

export async function fetchHome(signal?: AbortSignal): Promise<HomeData> {
  if (isProductionApiMisconfigured) {
    throw new Error(PRODUCTION_API_SETUP_MESSAGE)
  }
  const res = await fetch(apiUrl('/api/v1/home/'), { signal })
  if (!res.ok) {
    throw new Error(`API respondeu ${res.status}`)
  }
  return parseResponseJson<HomeData>(res)
}
