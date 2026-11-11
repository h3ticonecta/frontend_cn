import { useCallback, useRef, useState } from 'react'
import {
  ballRotationToLand,
  wheelRotationToLand,
} from '../lib/rouletteWheel'
import {
  startRouletteSpinSound,
  stopRouletteSpinSound,
} from '../lib/rouletteSpinSound'

function easeOutQuart(t: number): number {
  return 1 - (1 - t) ** 4
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

const SPIN_MS = 5000
const SETTLE_BALL_WORLD = -90
const EXTRA_TURNS = 2

export function useRouletteWheelAnimation() {
  const [wheelDeg, setWheelDeg] = useState(0)
  const [ballDeg, setBallDeg] = useState(0)
  const [ballRadiusFactor, setBallRadiusFactor] = useState(1)
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

  const applyFrame = (w: number, b: number, ballR = 1) => {
    wheelRef.current = w
    ballRef.current = b
    setWheelDeg(w)
    setBallDeg(b)
    setBallRadiusFactor(ballR)
  }

  const animateSingleSpin = useCallback(
    (targetWheel: number, targetBall: number, signal?: AbortSignal) => {
      const fromW = wheelRef.current
      const fromB = ballRef.current
      const start = performance.now()

      return new Promise<void>((resolve) => {
        const step = (now: number) => {
          if (signal?.aborted) {
            resolve()
            return
          }
          const p = Math.min(1, (now - start) / SPIN_MS)
          const e = easeOutQuart(p)

          let w = fromW + (targetWheel - fromW) * e
          let b = fromB + (targetBall - fromB) * e

          if (w < wheelRef.current) w = wheelRef.current
          if (b < ballRef.current) b = ballRef.current
          const ballR = 1.04 - p * 0.05

          applyFrame(w, b, ballR)

          if (p >= 1) {
            applyFrame(targetWheel, targetBall, 1)
            resolve()
            return
          }
          rafRef.current = requestAnimationFrame(step)
        }
        rafRef.current = requestAnimationFrame(step)
      })
    },
    [],
  )

  const beginSpin = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setIsAnimating(true)
    setBallRadiusFactor(1.02)
    stopRaf()
    startRouletteSpinSound()
    return abortRef.current.signal
  }, [])

  const finishSpin = useCallback(
    async (numero: number, signal?: AbortSignal) => {
      stopRaf()

      const fromW = wheelRef.current
      let targetWheel = wheelRotationToLand(fromW, numero, SETTLE_BALL_WORLD, EXTRA_TURNS)
      if (targetWheel <= fromW) targetWheel = fromW + 360

      const targetBall = ballRotationToLand(
        ballRef.current,
        targetWheel,
        numero,
        EXTRA_TURNS,
      )

      await animateSingleSpin(targetWheel, targetBall, signal)
      if (signal?.aborted) return
      stopRouletteSpinSound()
      setIsAnimating(false)
      setBallRadiusFactor(1)
    },
    [animateSingleSpin],
  )

  const cancelSpin = useCallback(() => {
    abortRef.current?.abort()
    stopRaf()
    stopRouletteSpinSound()
    setIsAnimating(false)
    setBallRadiusFactor(1)
  }, [])

  const ensureMinDuration = useCallback(
    async (startedAt: number, minMs: number, signal?: AbortSignal) => {
      const elapsed = Date.now() - startedAt
      if (elapsed < minMs) {
        await waitMs(minMs - elapsed, signal)
      }
    },
    [],
  )

  return {
    wheelDeg,
    ballDeg,
    ballRadiusFactor,
    isAnimating,
    beginSpin,
    finishSpin,
    cancelSpin,
    ensureMinDuration,
  }
}
