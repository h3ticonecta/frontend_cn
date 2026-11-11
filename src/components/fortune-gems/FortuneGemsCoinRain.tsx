import './FortuneGemsCoinRain.css'

type Props = {
  active: boolean
}

const COINS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  delay: `${(i % 7) * 0.12}s`,
  size: 0.85 + (i % 4) * 0.15,
}))

export function FortuneGemsCoinRain({ active }: Props) {
  if (!active) return null

  return (
    <div className="fg-coin-rain" aria-hidden="true">
      {COINS.map((c) => (
        <span
          key={c.id}
          className="fg-coin-rain__coin"
          style={{
            left: c.left,
            animationDelay: c.delay,
            fontSize: `${c.size}rem`,
          }}
        >
          🪙
        </span>
      ))}
    </div>
  )
}
