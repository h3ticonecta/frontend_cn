import '../styles/buttons.css'
import './Header.css'

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href="/" className="logo" aria-label="Início">
          <span className="logo__icon" aria-hidden>
            ♠
          </span>
          <span className="logo__text">
            Play<span className="logo__accent">Hub</span>
          </span>
        </a>

        <nav className="main-nav" aria-label="Principal">
          <a href="#jogos">Jogos</a>
          <a href="#promocoes">Promoções</a>
          <a href="#ao-vivo">Ao vivo</a>
          <a href="#suporte">Suporte</a>
        </nav>

        <div className="header-actions">
          <button type="button" className="btn btn--ghost">
            Entrar
          </button>
          <button type="button" className="btn btn--gold">
            Criar conta
          </button>
        </div>
      </div>
    </header>
  )
}
