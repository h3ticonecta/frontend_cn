import type { HomeData } from '../types/playhub'

/**
 * Em dev, deixe vazio para usar o proxy do Vite (`/api` → Django).
 * Em produção, defina `VITE_API_URL` (ex.: https://api.seudominio.com).
 */
function resolveApiBase(): string {
  const configured = import.meta.env.VITE_API_URL as string | undefined
  if (configured !== undefined && configured.trim() !== '') {
    return configured.replace(/\/$/, '')
  }
  return import.meta.env.DEV ? '' : ''
}

export const API_BASE = resolveApiBase()

/** Texto amigável na tela de erro (não é a URL do fetch em dev com proxy). */
export const API_HINT =
  API_BASE || 'mesma origem (proxy Vite → http://127.0.0.1:8000)'

function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return API_BASE ? `${API_BASE}${p}` : p
}

export async function fetchHome(signal?: AbortSignal): Promise<HomeData> {
  const res = await fetch(apiUrl('/api/v1/home/'), { signal })
  if (!res.ok) {
    throw new Error(`API respondeu ${res.status}`)
  }
  return res.json() as Promise<HomeData>
}
