import { useEffect, useRef } from 'react'
import './RoletaWinCelebration.css'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
  rot: number
  spin: number
}

const GOLD_HUES = [42, 48, 45, 38, 52]

function spawnParticles(w: number, h: number, count: number): Particle[] {
  const cx = w * 0.5
  const cy = h * 0.38
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 2.5 + Math.random() * 7
    return {
      x: cx + (Math.random() - 0.5) * w * 0.12,
      y: cy + (Math.random() - 0.5) * h * 0.08,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      life: 0,
      maxLife: 55 + Math.random() * 45,
      size: 3 + Math.random() * 5,
      hue: GOLD_HUES[Math.floor(Math.random() * GOLD_HUES.length)]!,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.2,
    }
  })
}

type Props = {
  /** Incrementa a cada vitória para reiniciar a animação. */
  burstKey: number
}

export function RoletaWinCelebration({ burstKey }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    if (burstKey <= 0) return

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const w = window.innerWidth
    const h = window.innerHeight
  const particles = spawnParticles(w, h, 72)
    const sparkles = spawnParticles(w, h, 28).map((p) => ({
      ...p,
      size: 1.5 + Math.random() * 2,
      maxLife: 30 + Math.random() * 25,
    }))
    const all = [...particles, ...sparkles]

    const drawParticle = (p: Particle, alpha: number) => {
      const t = 1 - p.life / p.maxLife
      const a = alpha * (1 - t * t)
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = a
      const g = ctx.createLinearGradient(-p.size, -p.size, p.size, p.size)
      g.addColorStop(0, `hsla(${p.hue}, 92%, 78%, 1)`)
      g.addColorStop(0.5, `hsla(${p.hue}, 85%, 55%, 1)`)
      g.addColorStop(1, `hsla(${p.hue}, 70%, 35%, 1)`)
      ctx.fillStyle = g
      ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, 0.9)`
      ctx.shadowBlur = 8
      const rw = p.size * 1.2
      const rh = p.size * 0.7
      const rx = -p.size * 0.6
      const ry = -p.size * 0.35
      ctx.beginPath()
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(rx, ry, rw, rh, 1)
      } else {
        ctx.rect(rx, ry, rw, rh)
      }
      ctx.fill()
      ctx.restore()
    }

    let frame = 0
    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      let alive = 0
      for (const p of all) {
        if (p.life < p.maxLife) {
          alive++
          p.life += 1
          p.vy += 0.12
          p.vx *= 0.992
          p.x += p.vx
          p.y += p.vy
          p.rot += p.spin
          const flash = 0.65 + 0.35 * Math.sin(frame * 0.15 + p.x)
          drawParticle(p, flash)
        }
      }
      frame++
      if (alive > 0) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, w, h)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ctx.clearRect(0, 0, w, h)
    }
  }, [burstKey])

  if (burstKey <= 0) return null

  return (
    <div className="roleta-celebration" aria-hidden="true">
      <canvas ref={canvasRef} className="roleta-celebration__canvas" />
      <p className="roleta-celebration__flash" key={burstKey}>
        Vitória!
      </p>
    </div>
  )
}
