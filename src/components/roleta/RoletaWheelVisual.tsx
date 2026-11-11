import { useMemo } from 'react'
import {
  EUROPEAN_WHEEL_ORDER,
  WHEEL_SLOT_ANGLE,
  pocketFill,
} from '../../lib/rouletteWheel'
import './RoletaWheelVisual.css'

type Props = {
  vermelhos: number[]
  wheelRotation: number
  ballRotation: number
  isAnimating: boolean
  highlightNumber?: number | null
}

const CX = 200
const CY = 200
const R_OUT = 188
const R_IN = 138
const R_LABEL = 162

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function wedgePath(startDeg: number, endDeg: number) {
  const large = endDeg - startDeg > 180 ? 1 : 0
  const p1 = polarToCartesian(CX, CY, R_OUT, startDeg)
  const p2 = polarToCartesian(CX, CY, R_OUT, endDeg)
  const p3 = polarToCartesian(CX, CY, R_IN, endDeg)
  const p4 = polarToCartesian(CX, CY, R_IN, startDeg)
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${R_OUT} ${R_OUT} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${R_IN} ${R_IN} 0 ${large} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ')
}

const FILL: Record<string, string> = {
  green: '#0d7a4c',
  red: '#c41e1e',
  black: '#141414',
}

export function RoletaWheelVisual({
  vermelhos,
  wheelRotation,
  ballRotation,
  isAnimating,
  highlightNumber,
}: Props) {
  const segments = useMemo(() => {
    return EUROPEAN_WHEEL_ORDER.map((num, i) => {
      const start = -90 + i * WHEEL_SLOT_ANGLE
      const end = start + WHEEL_SLOT_ANGLE
      const mid = start + WHEEL_SLOT_ANGLE / 2
      const label = polarToCartesian(CX, CY, R_LABEL, mid)
      const kind = pocketFill(num, vermelhos)
      return { num, path: wedgePath(start, end), mid, label, kind }
    })
  }, [vermelhos])

  return (
    <div
      className={`roleta-wheel${isAnimating ? ' roleta-wheel--animating' : ''}`}
      aria-hidden
    >
      <div className="roleta-wheel__frame">
        <svg viewBox="0 0 400 400" className="roleta-wheel__svg" role="presentation">
          <defs>
            <radialGradient id="woodGrad" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#7a4a24" />
              <stop offset="100%" stopColor="#3f2512" />
            </radialGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5e6a8" />
              <stop offset="50%" stopColor="#c9a227" />
              <stop offset="100%" stopColor="#8b6914" />
            </linearGradient>
          </defs>
          <circle cx={CX} cy={CY} r={198} fill="url(#goldGrad)" />
          <circle cx={CX} cy={CY} r={192} fill="url(#woodGrad)" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const p = polarToCartesian(CX, CY, 178, a)
            return <circle key={a} cx={p.x} cy={p.y} r={5} fill="url(#goldGrad)" />
          })}
          <g
            className="roleta-wheel__disc"
            transform={`rotate(${wheelRotation} ${CX} ${CY})`}
          >
            {segments.map((s) => (
              <g key={s.num}>
                <path
                  d={s.path}
                  fill={FILL[s.kind]}
                  stroke="#c9a227"
                  strokeWidth={0.6}
                  className={
                    highlightNumber === s.num ? 'roleta-wheel__pocket--lit' : undefined
                  }
                />
                <text
                  x={s.label.x}
                  y={s.label.y}
                  fill="#f8fafc"
                  fontSize={11}
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${s.mid + 90}, ${s.label.x}, ${s.label.y})`}
                >
                  {s.num}
                </text>
              </g>
            ))}
            <circle cx={CX} cy={CY} r={R_IN - 4} fill="url(#woodGrad)" />
            <g transform={`translate(${CX} ${CY})`}>
              {[0, 90, 180, 270].map((a) => (
                <rect
                  key={a}
                  x={-5}
                  y={-52}
                  width={10}
                  height={46}
                  rx={3}
                  fill="url(#goldGrad)"
                  transform={`rotate(${a})`}
                />
              ))}
              <circle r={16} fill="url(#goldGrad)" />
            </g>
          </g>
          <path
            d="M 195 18 L 205 18 L 200 42 Z"
            className="roleta-wheel__deflector"
            fill="url(#goldGrad)"
          />
        </svg>
        <div
          className="roleta-wheel__ball"
          style={{
            transform: `rotate(${ballRotation}deg) translateY(-${R_OUT - 22}px)`,
          }}
        />
      </div>
      <p className="roleta-wheel__caption">Roleta europeia</p>
    </div>
  )
}
