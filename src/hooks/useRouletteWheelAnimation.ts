import { useCallback, useRef, useState } from 'react'
import {
  ballRotationToLand,
  indexOfPocket,
  pocketCenterAngle,
  wheelRotationToLand,
} from '../lib/rouletteWheel'

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

const SETTLE_MS = 4800

export function useRouletteWheelAnimation() {
  const [wheelDeg, setWheelDeg] = useState(0)
  const [ballDeg, setBallDeg] = useState(0)
  const [ballRadiusFactor, setBallRadiusFactor] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const wheelRef = useRef(0)
  const ballRef = useRef(0)
  const rafRef = useRef<number>(0)
  const abortRef = useRef<AbortController | null>(null)
  const velWheelRef = useRef(0)
  const velBallRef = useRef(0)

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

  const runFastSpin = useCallback(() => {
    let last = performance.now()
    velWheelRef.current = 320
    velBallRef.current = -480
    setBallRadiusFactor(1.04)

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      velWheelRef.current = Math.max(velWheelRef.current * 1.002, 80)
      velBallRef.current *= 1.0015
      const w = wheelRef.current + velWheelRef.current * dt
      const b = ballRef.current + velBallRef.current * dt
      applyFrame(w, b, 1.04)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const finishSpin = useCallback(async (numero: number, signal?: AbortSignal) => {
    stopRaf()

    const settleBallAngle = -92
    let targetWheel = wheelRotationToLand(wheelRef.current, numero, settleBallAngle, 4)
    while (targetWheel <= wheelRef.current) {
      targetWheel += 360
    }
    const targetBall = ballRotationToLand(ballRef.current, targetWheel, numero, 7)

    let velW = Math.max(velWheelRef.current || 220, 60)
    let velB = velBallRef.current || -300

    const startWheel = wheelRef.current
    const t0 = performance.now()

    await new Promise<void>((resolve) => {
      const step = (now: number) => {
        if (signal?.aborted) {
          resolve()
          return
        }

        const elapsed = now - t0
        const p = Math.min(1, elapsed / SETTLE_MS)
        const dt = 1 / 60

        const friction = 0.97 - p * 0.04
        velW = Math.max(velW * friction, 0)
        velB *= friction

        const coupling = p > 0.45 ? Math.min(1, (p - 0.45) / 0.55) : 0
        const pocketAngle =
          pocketCenterAngle(indexOfPocket(numero)) + wheelRef.current
        const slip = ballRef.current - pocketAngle
        velB += coupling * (-velW * 0.45 - velB * 0.12 - slip * 0.02) * dt * 60

        let w = wheelRef.current
        const remaining = targetWheel - w
        if (remaining > 0.5) {
          const steer = p > 0.65 ? Math.min(1, (p - 0.65) / 0.35) : 0
          const cruise = velW * dt
          const guided = remaining * steer * 0.08
          w += Math.max(cruise, guided, 0.15)
          w = Math.min(w, targetWheel)
        } else {
          w = targetWheel
          velW = 0
        }

        w = Math.max(w, startWheel)
        let b = ballRef.current + velB * dt

        const ballSteer = p > 0.78 ? ((p - 0.78) / 0.22) ** 2 : 0
        const ballGap = targetBall - b
        if (ballGap > 0) {
          b += ballGap * ballSteer * 0.1
        } else {
          b = targetBall
        }

        const ballR = 1.04 - p * 0.06
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

    if (signal?.aborted) return
    setIsAnimating(false)
    setBallRadiusFactor(1)
  }, [])

  const beginSpin = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setIsAnimating(true)
    stopRaf()
    runFastSpin()
    return abortRef.current.signal
  }, [runFastSpin])

  const cancelSpin = useCallback(() => {
    abortRef.current?.abort()
    stopRaf()
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
