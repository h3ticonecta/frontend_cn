import './Footer.css'

export function Footer() {
  return (
    <footer className="site-footer" id="suporte">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <strong>PlayHub</strong>
          <p>
            Demonstração de layout inspirado em portais de jogos online. Não
            oferece apostas com dinheiro real.
          </p>
        </div>
        <div className="site-footer__links">
          <a href="#jogos">Jogos</a>
          <a href="#promocoes">Promoções</a>
          <a href="#">Termos</a>
          <a href="#">Privacidade</a>
          <a href="#">Jogo responsável</a>
        </div>
      </div>
      <div className="site-footer__legal">
        <span className="badge-18">+18</span>
        <p>
          Jogue com responsabilidade. Apostas podem causar dependência. Este
          site é apenas um protótipo visual para fins educacionais.
        </p>
      </div>
    </footer>
  )
}
