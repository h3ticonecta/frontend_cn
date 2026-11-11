import './ProvidersStrip.css'

type Props = {
  providers: string[]
}

export function ProvidersStrip({ providers }: Props) {
  if (providers.length === 0) return null

  return (
    <section className="providers" aria-labelledby="providers-heading">
      <h2 id="providers-heading" className="providers__title">
        Provedores de jogos
      </h2>
      <ul className="providers__list">
        {providers.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </section>
  )
}
