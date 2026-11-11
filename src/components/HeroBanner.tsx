import '../styles/buttons.css'
import './HeroBanner.css'

export function HeroBanner() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden />
      <div className="hero__content">
        <p className="hero__eyebrow">Bônus de boas-vindas</p>
        <h1 id="hero-title" className="hero__title">
          Até <span className="hero__highlight">R$ 5.000</span> + 200 rodadas
          grátis
        </h1>
        <p className="hero__sub">
          Milhares de jogos online — slots, mesa, crash e cassino ao vivo. Jogue
          com segurança, no desktop ou no celular.
        </p>
        <div className="hero__ctas">
          <button type="button" className="btn btn--gold btn--lg">
            Reivindicar bônus
          </button>
          <button type="button" className="btn btn--outline btn--lg">
            Ver jogos em destaque
          </button>
        </div>
        <ul className="hero__trust">
          <li>🔒 Pagamentos seguros</li>
          <li>⚡ Saques rápidos</li>
          <li>📱 App mobile</li>
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
