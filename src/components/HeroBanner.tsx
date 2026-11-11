import type { HeroContent } from '../types/playhub'
import '../styles/buttons.css'
import './HeroBanner.css'

const FALLBACK_HERO: HeroContent = {
  eyebrow: 'Bônus de boas-vindas',
  title_prefix: 'Até',
  highlight: 'R$ 5.000',
  title_suffix: '+ 200 rodadas grátis',
  subtitle:
    'Milhares de jogos online — slots, mesa, crash e cassino ao vivo. Jogue com segurança, no desktop ou no celular.',
  cta_primary: 'Reivindicar bônus',
  cta_secondary: 'Ver jogos em destaque',
  trust_items: ['🔒 Pagamentos seguros', '⚡ Saques rápidos', '📱 App mobile'],
}

type Props = {
  hero: HeroContent | null
}

export function HeroBanner({ hero }: Props) {
  const h = hero ?? FALLBACK_HERO

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden />
      <div className="hero__content">
        <p className="hero__eyebrow">{h.eyebrow}</p>
        <h1 id="hero-title" className="hero__title">
          {h.title_prefix}{' '}
          <span className="hero__highlight">{h.highlight}</span> {h.title_suffix}
        </h1>
        <p className="hero__sub">{h.subtitle}</p>
        <div className="hero__ctas">
          <button type="button" className="btn btn--gold btn--lg">
            {h.cta_primary}
          </button>
          <button
            type="button"
            className="btn btn--outline btn--lg"
            onClick={() =>
              document.getElementById('jogos')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            {h.cta_secondary}
          </button>
        </div>
        <ul className="hero__trust">
          {h.trust_items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="hero__cards" aria-hidden>
        <div className="hero-card hero-card--1">🎰</div>
        <div className="hero-card hero-card--2">🃏</div>
        <div className="hero-card hero-card--3">✈️</div>
      </div>
    </section>
  )
}
