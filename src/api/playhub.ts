import type { HomeData } from '../types/playhub'

/**
 * Em dev, deixe vazio para usar o proxy do Vite (`/api` → Django).
 * Em produção, defina `VITE_API_URL` no **build** (ex.: Railway → Variables).
 */
function resolveApiBase(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined
  if (configured !== undefined && configured.trim() !== '') {
    return configured.trim().replace(/\/$/, '')
  }
  return ''
}

export type ApiBaseIssue = 'missing' | 'internal_hostname' | 'missing_protocol'

function detectApiBaseIssue(base: string): ApiBaseIssue | null {
  if (!base) {
    return import.meta.env.PROD ? 'missing' : null
  }
  if (/\.railway\.internal\b/i.test(base)) {
    return 'internal_hostname'
  }
  if (!/^https?:\/\//i.test(base)) {
    return 'missing_protocol'
  }
  return null
}

export const API_BASE = resolveApiBase()
export const apiBaseIssue = detectApiBaseIssue(API_BASE)

/** Configuração inválida para o browser em produção. */
export const isProductionApiMisconfigured =
  import.meta.env.PROD && apiBaseIssue !== null

const MESSAGES: Record<ApiBaseIssue, string> = {
  missing:
    'Defina VITE_API_URL no Railway (variável de build) com a URL pública do Django, com https:// e sem barra no final. Ex.: https://backendcn-production.up.railway.app — depois redeploy. No Django, libere CORS para o domínio do frontend.',
  internal_hostname:
    'VITE_API_URL não pode usar *.railway.internal: esse host só existe entre serviços no Railway. O React roda no navegador do usuário — use a URL pública do backend (Settings → Networking → Public domain), ex.: https://….up.railway.app. Corrija a variável, redeploy o frontend e configure CORS no Django.',
  missing_protocol:
    'VITE_API_URL precisa incluir https:// (URL absoluta). Ex.: https://seu-backend.up.railway.app — não use apenas o hostname nem *.railway.internal.',
}

export function getApiSetupMessage(): string {
  if (apiBaseIssue) return MESSAGES[apiBaseIssue]
  return MESSAGES.missing
}

/** @deprecated use getApiSetupMessage */
export const PRODUCTION_API_SETUP_MESSAGE = MESSAGES.missing

/** Texto amigável na tela de erro. */
export const API_HINT = isProductionApiMisconfigured
  ? getApiSetupMessage()
  : API_BASE
    ? API_BASE
    : import.meta.env.DEV
      ? 'mesma origem (proxy Vite → http://127.0.0.1:8000)'
      : '(não definida)'

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return API_BASE ? `${API_BASE}${p}` : p
}

function assertApiReady(): void {
  if (import.meta.env.PROD && apiBaseIssue) {
    throw new Error(getApiSetupMessage())
  }
}

async function parseResponseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('A API respondeu vazio.')
  }
  if (trimmed.startsWith('<') || trimmed.toLowerCase().startsWith('<!doctype')) {
    if (apiBaseIssue === 'internal_hostname' || apiBaseIssue === 'missing_protocol') {
      throw new Error(getApiSetupMessage())
    }
    if (apiBaseIssue === 'missing') {
      throw new Error(MESSAGES.missing)
    }
    throw new Error(
      'A API retornou HTML em vez de JSON. Confira se VITE_API_URL aponta para a URL pública do Django (não o frontend) e se /api/v1/home/ devolve JSON no navegador.',
    )
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error('Resposta da API não é JSON válido.')
  }
}

export async function fetchHome(signal?: AbortSignal): Promise<HomeData> {
  assertApiReady()
  const res = await fetch(apiUrl('/api/v1/home/'), { signal })
  if (!res.ok) {
    throw new Error(`API respondeu ${res.status}`)
  }
  return parseResponseJson<HomeData>(res)
}
