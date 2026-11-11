import { Footer } from './components/Footer'
import { GameGrid } from './components/GameGrid'
import { Header } from './components/Header'
import { HeroBanner } from './components/HeroBanner'
import { PromoSection } from './components/PromoSection'
import { ProvidersStrip } from './components/ProvidersStrip'
import { PlayHubProvider, usePlayHub } from './context/PlayHubContext'
import { API_HINT, isProductionApiMisconfigured } from './api/playhub'
import {
  isFortuneGemsRoute,
  isRoletaRoute,
  isWolfGoldRoute,
  parseFortuneGemsGameSlug,
  parseRoletaGameSlug,
  parseWolfGoldGameSlug,
  useHashRoute,
} from './hooks/useHashRoute'
import { FortuneGemsPage } from './pages/FortuneGemsPage'
import { RoletaPage } from './pages/RoletaPage'
import { WolfGoldPage } from './pages/WolfGoldPage'
import './App.css'

function PlayHubPage() {
  const { status, data, error, retry } = usePlayHub()

  if (status === 'loading') {
    return (
      <div className="app-shell">
        <Header />
        <main className="app-status" aria-live="polite">
          <p className="app-status__text">Carregando PlayHub…</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (status === 'error' || !data) {
    return (
      <div className="app-shell">
        <Header />
        <main className="app-status app-status--error" aria-live="assertive">
          <p className="app-status__text">Não foi possível conectar à API.</p>
          <p className="app-status__hint">{error}</p>
          {isProductionApiMisconfigured ? (
            <p className="app-status__hint">{API_HINT}</p>
          ) : (
            <p className="app-status__hint">
              Verifique o backend Django (
              <code className="app-status__code">python manage.py runserver</code>
              ). API: <code className="app-status__code">{API_HINT}</code>.
            </p>
          )}
          <button type="button" className="app-status__retry" onClick={retry}>
            Tentar novamente
          </button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Header />
      <main>
        <HeroBanner hero={data.hero} />
        <GameGrid games={data.games} />
        <PromoSection promotions={data.promotions} />
        <ProvidersStrip providers={data.providers} />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  const hash = useHashRoute()

  if (isWolfGoldRoute(hash)) {
    const gameSlug = parseWolfGoldGameSlug(hash)
    return (
      <div className="app-shell app-shell--wolf-gold">
        <Header />
        <WolfGoldPage gameSlug={gameSlug} key={gameSlug} />
        <Footer />
      </div>
    )
  }

  if (isFortuneGemsRoute(hash)) {
    const gameSlug = parseFortuneGemsGameSlug(hash)
    return (
      <div className="app-shell app-shell--fortune-gems">
        <Header />
        <FortuneGemsPage gameSlug={gameSlug} key={gameSlug} />
        <Footer />
      </div>
    )
  }

  if (isRoletaRoute(hash)) {
    const gameSlug = parseRoletaGameSlug(hash)
    return (
      <div className="app-shell">
        <Header />
        <RoletaPage gameSlug={gameSlug} key={gameSlug} />
        <Footer />
      </div>
    )
  }

  return (
    <PlayHubProvider>
      <PlayHubPage />
    </PlayHubProvider>
  )
}

export default App
