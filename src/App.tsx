import { Footer } from './components/Footer'
import { GameGrid } from './components/GameGrid'
import { Header } from './components/Header'
import { HeroBanner } from './components/HeroBanner'
import { LiveStrip } from './components/LiveStrip'
import { PromoSection } from './components/PromoSection'
import { ProvidersStrip } from './components/ProvidersStrip'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <HeroBanner />
        <LiveStrip />
        <GameGrid />
        <PromoSection />
        <ProvidersStrip />
      </main>
      <Footer />
    </div>
  )
}

export default App
