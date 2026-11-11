import { useEffect, useState } from 'react'

export function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return hash
}

export function isRoletaRoute(hash: string): boolean {
  const path = hash.split('?')[0] ?? ''
  return path === '#/roleta' || path.startsWith('#/roleta/')
}

/** Slug do jogo na grade (ex.: `roleta-brasil`). */
export function parseRoletaGameSlug(hash: string): string {
  const raw = hash.replace(/^#/, '')
  const [path, query] = raw.split('?')
  if (path.startsWith('/roleta/')) {
    const seg = path.slice('/roleta/'.length).split('/')[0]
    if (seg) return decodeURIComponent(seg)
  }
  const params = new URLSearchParams(query ?? '')
  return params.get('game')?.trim() || 'roleta-brasil'
}

export function roletaHashForGame(play: { client_route: string; mesa_slug: string }, gameId: string): string {
  const base = play.client_route || '#/roleta'
  const [path, existingQuery] = base.split('?')
  const params = new URLSearchParams(existingQuery ?? '')
  params.set('game', gameId)
  return `${path}?${params.toString()}`
}

export function isFortuneGemsRoute(hash: string): boolean {
  const path = hash.split('?')[0] ?? ''
  return path === '#/fortune-gems' || path.startsWith('#/fortune-gems/')
}

export function fortuneGemsHash(gameId = 'fortune-gems'): string {
  const params = new URLSearchParams()
  params.set('game', gameId)
  return `#/fortune-gems?${params.toString()}`
}

export function parseFortuneGemsGameSlug(hash: string): string {
  const raw = hash.replace(/^#/, '')
  const [, query] = raw.split('?')
  const params = new URLSearchParams(query ?? '')
  return params.get('game')?.trim() || 'fortune-gems'
}

export function fortuneGemsHashForGame(play: { client_route: string }, gameId: string): string {
  const base = play.client_route || '#/fortune-gems'
  const [path, existingQuery] = base.split('?')
  const params = new URLSearchParams(existingQuery ?? '')
  params.set('game', gameId)
  return `${path}?${params.toString()}`
}
