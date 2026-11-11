import { PROVIDERS } from '../data/games'
import './ProvidersStrip.css'

export function ProvidersStrip() {
  return (
    <section className="providers" aria-labelledby="providers-heading">
      <h2 id="providers-heading" className="providers__title">
        Provedores de jogos
      </h2>
      <ul className="providers__list">
        {PROVIDERS.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </section>
  )
}
