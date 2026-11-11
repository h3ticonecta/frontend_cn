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
  return hash === '#/roleta' || hash.startsWith('#/roleta?')
}
