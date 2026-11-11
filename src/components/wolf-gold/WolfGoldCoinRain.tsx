import '../fortune-gems/FortuneGemsCoinRain.css'

type Props = { active: boolean }

const COINS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${(i * 19 + 5) % 100}%`,
  delay: `${(i % 6) * 0.1}s`,
}))

export function WolfGoldCoinRain({ active }: Props) {
  if (!active) return null
  return (
    <div className="fg-coin-rain" aria-hidden>
      {COINS.map((c) => (
        <span
          key={c.id}
          className="fg-coin-rain__coin"
          style={{ left: c.left, animationDelay: c.delay }}
        >
          🪙
        </span>
      ))}
    </div>
  )
}
