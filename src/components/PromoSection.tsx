import type { Promotion } from '../types/playhub'
import './PromoSection.css'

type Props = {
  promotions: Promotion[]
}

export function PromoSection({ promotions }: Props) {
  if (promotions.length === 0) return null

  return (
    <section className="promos" id="promocoes" aria-labelledby="promos-heading">
      <h2 id="promos-heading" className="section-title">
        Promoções
      </h2>
      <div className="promos__grid">
        {promotions.map((p) => (
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
