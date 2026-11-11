import { useCallback, useRef, useState } from 'react'
import { ballRotationToSettle, wheelRotationToLand } from '../lib/rouletteWheel'

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

function waitMs(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(resolve, ms)
    const onAbort = () => {
      clearTimeout(id)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export function useRouletteWheelAnimation() {
  const [wheelDeg, setWheelDeg] = useState(0)
  const [ballDeg, setBallDeg] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const wheelRef = useRef(0)
  const ballRef = useRef(0)
  const rafRef = useRef<number>(0)
  const abortRef = useRef<AbortController | null>(null)

  const stopRaf = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }

  const runFastSpin = useCallback(() => {
    const started = performance.now()
    const tick = (now: number) => {
      const t = (now - started) / 1000
      wheelRef.current += 14 + t * 2
      ballRef.current -= 18 + t * 2.5
      setWheelDeg(wheelRef.current)
      setBallDeg(ballRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const animateTo = useCallback(
    (fromWheel: number, toWheel: number, fromBall: number, toBall: number, durationMs: number) => {
      return new Promise<void>((resolve) => {
        const t0 = performance.now()
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / durationMs)
          const e = easeOutCubic(p)
          const w = fromWheel + (toWheel - fromWheel) * e
          const b = fromBall + (toBall - fromBall) * e
          wheelRef.current = w
          ballRef.current = b
          setWheelDeg(w)
          setBallDeg(b)
          if (p < 1) {
            requestAnimationFrame(step)
          } else {
            resolve()
          }
        }
        requestAnimationFrame(step)
      })
    },
    [],
  )

  const beginSpin = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setIsAnimating(true)
    stopRaf()
    runFastSpin()
    return abortRef.current.signal
  }, [runFastSpin])

  const finishSpin = useCallback(
    async (numero: number, signal?: AbortSignal) => {
      stopRaf()
      const fromW = wheelRef.current
      const fromB = ballRef.current
      const toW = wheelRotationToLand(fromW, numero)
      const toB = ballRotationToSettle(fromB)
      await animateTo(fromW, toW, fromB, toB, 2800)
      if (signal?.aborted) return
      setIsAnimating(false)
    },
    [animateTo],
  )

  const cancelSpin = useCallback(() => {
    abortRef.current?.abort()
    stopRaf()
    setIsAnimating(false)
  }, [])

  const ensureMinDuration = useCallback(async (startedAt: number, minMs: number, signal?: AbortSignal) => {
    const elapsed = Date.now() - startedAt
    if (elapsed < minMs) {
      await waitMs(minMs - elapsed, signal)
    }
  }, [])

  return {
    wheelDeg,
    ballDeg,
    isAnimating,
    beginSpin,
    finishSpin,
    cancelSpin,
    ensureMinDuration,
  }
}
