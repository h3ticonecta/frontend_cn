import './PromoSection.css'

const PROMOS = [
  {
    title: 'Cashback semanal',
    desc: 'Até 15% de volta nas perdas em slots selecionados.',
    tag: 'Ativo',
  },
  {
    title: 'Torneio de slots',
    desc: 'Prêmio total de R$ 50.000 — classifique-se no ranking.',
    tag: 'Limitado',
  },
  {
    title: 'Roleta ao vivo',
    desc: 'Mesa exclusiva com dealer em português, 24h.',
    tag: 'Ao vivo',
  },
]

export function PromoSection() {
  return (
    <section className="promos" id="promocoes" aria-labelledby="promos-heading">
      <h2 id="promos-heading" className="section-title">
        Promoções
      </h2>
      <div className="promos__grid">
        {PROMOS.map((p) => (
          <article key={p.title} className="promo-card">
            <span className="promo-card__tag">{p.tag}</span>
            <h3 className="promo-card__title">{p.title}</h3>
            <p className="promo-card__desc">{p.desc}</p>
            <button type="button" className="promo-card__link">
              Saiba mais →
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
