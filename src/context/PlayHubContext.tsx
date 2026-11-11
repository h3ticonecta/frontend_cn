import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchHome } from '../api/playhub'
import type { HomeData } from '../types/playhub'

type PlayHubState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: HomeData; error: null }
  | { status: 'error'; data: null; error: string }

type PlayHubContextValue = PlayHubState & { retry: () => void }

const PlayHubContext = createContext<PlayHubContextValue | null>(null)

export function PlayHubProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayHubState>({
    status: 'loading',
    data: null,
    error: null,
  })
  const [attempt, setAttempt] = useState(0)

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  useEffect(() => {
    const ctrl = new AbortController()
    setState({ status: 'loading', data: null, error: null })

    fetchHome(ctrl.signal)
      .then((data) => {
        if (!ctrl.signal.aborted) {
          setState({ status: 'ready', data, error: null })
        }
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return
        const msg =
          err instanceof Error ? err.message : 'Não foi possível carregar os dados.'
        setState({ status: 'error', data: null, error: msg })
      })

    return () => ctrl.abort()
  }, [attempt])

  const value = useMemo(
    () => ({ ...state, retry }),
    [state, retry],
  )

  return (
    <PlayHubContext.Provider value={value}>{children}</PlayHubContext.Provider>
  )
}

export function usePlayHub(): PlayHubContextValue {
  const ctx = useContext(PlayHubContext)
  if (!ctx) {
    throw new Error('usePlayHub deve ser usado dentro de PlayHubProvider')
  }
  return ctx
}
