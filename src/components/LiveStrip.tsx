import './LiveStrip.css'

const LIVE = [
  { name: 'Mega Roleta', viewers: 1240, dealer: 'Ana' },
  { name: 'Blackjack Party', viewers: 890, dealer: 'Carlos' },
  { name: 'Bac Bo Live', viewers: 654, dealer: 'Julia' },
]

export function LiveStrip() {
  return (
    <section className="live-strip" id="ao-vivo" aria-labelledby="live-heading">
      <div className="live-strip__inner">
        <h2 id="live-heading" className="live-strip__title">
          <span className="live-dot" aria-hidden /> Ao vivo agora
        </h2>
        <div className="live-strip__scroll">
          {LIVE.map((item) => (
            <button key={item.name} type="button" className="live-pill">
              <span className="live-pill__name">{item.name}</span>
              <span className="live-pill__meta">
                {item.dealer} · {item.viewers.toLocaleString('pt-BR')} assistindo
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
