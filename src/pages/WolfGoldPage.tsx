import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clearWolfGoldSessionId,
  createWolfGoldSession,
  fetchWolfGoldSession,
  getStoredWolfGoldSessionId,
  getWolfGoldSoundEnabled,
  setWolfGoldSoundEnabled,
} from '../api/wolfGold'
import { WolfGoldCoinRain } from '../components/wolf-gold/WolfGoldCoinRain'
import { WolfGoldReels } from '../components/wolf-gold/WolfGoldReels'
import { useWolfGoldSpin } from '../hooks/useWolfGoldSpin'
import { loadWolfGoldBootstrap } from '../lib/loadWolfGoldBootstrap'
import { WOLF_SYMBOL_EMOJI, asWolfSymbol } from '../lib/wolfGoldSymbols'
import type { WolfGoldConfig } from '../types/wolfGold'
import '../styles/wolf-gold-studio.css'

type Props = { gameSlug: string }

export function WolfGoldPage({ gameSlug }: Props) {
  const [config, setConfig] = useState<WolfGoldConfig | null>(null)
  const [sessaoId, setSessaoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [turbo, setTurbo] = useState(false)
  const [soundOn, setSoundOn] = useState(getWolfGoldSoundEnabled())
  const [showPaytable, setShowPaytable] = useState(false)
  const [autoLeft, setAutoLeft] = useState(0)
  const autoRef = useRef(0)

  const jogo = config?.jogo
  const game = useWolfGoldSpin({
    sessaoId,
    betMin: jogo ? Number(jogo.aposta_minima) : 0.25,
    betMax: jogo ? Number(jogo.aposta_maxima) : 125,
    initialBalance: jogo ? Number(jogo.saldo_inicial) : 10_000,
    initialBet: 2.5,
    turbo,
    soundOn,
  })

  const balanceSync = useRef(game.setBalanceFromApi)
  const betSync = useRef(game.setBet)
  balanceSync.current = game.setBalanceFromApi
  betSync.current = game.setBet

  const carregarSessao = useCallback(async (slug: string) => {
    const stored = getStoredWolfGoldSessionId()
    if (stored) {
      try {
        const s = await fetchWolfGoldSession(stored)
        setSessaoId(s.sessao_id)
        balanceSync.current(s.saldo)
        return
      } catch {
        clearWolfGoldSessionId()
      }
    }
    const s = await createWolfGoldSession(slug, 'Convidado')
    setSessaoId(s.sessao_id)
    balanceSync.current(s.saldo)
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    ;(async () => {
      try {
        setLoading(true)
        const boot = await loadWolfGoldBootstrap(gameSlug, ctrl.signal)
        setConfig(boot.config)
        const min = Number(boot.config.jogo.aposta_minima)
        betSync.current(Number.isNaN(min) ? 2.5 : Math.max(min, 2.5))
        await carregarSessao(boot.play.slot_slug)
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Falha ao carregar Wolf Gold.')
      } finally {
        setLoading(false)
      }
    })()
    return () => ctrl.abort()
  }, [carregarSessao, gameSlug])

  const doSpin = useCallback(async () => {
    await game.spin()
    if (autoRef.current > 0) {
      autoRef.current -= 1
      setAutoLeft(autoRef.current)
      if (autoRef.current > 0) window.setTimeout(() => void doSpin(), turbo ? 400 : 900)
    }
  }, [game, turbo])

  const startAuto = (n: number) => {
    autoRef.current = n
    setAutoLeft(n)
    void doSpin()
  }

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    setWolfGoldSoundEnabled(next)
  }

  if (loading) {
    return (
      <main className="wg-page">
        <p style={{ textAlign: 'center', padding: '3rem' }}>Carregando Wolf Gold…</p>
      </main>
    )
  }

  if (erro || !config) {
    return (
      <main className="wg-page">
        <p role="alert" style={{ color: '#fca5a5', textAlign: 'center', padding: '2rem' }}>
          {erro}
        </p>
        <p style={{ textAlign: 'center', fontSize: '0.85rem' }}>
          Rode: <code>python manage.py migrate</code>, <code>seed_wolf_gold</code>, <code>seed_playhub</code>
        </p>
      </main>
    )
  }

  const freeSpin = game.estado?.mode === 'free_spin'

  return (
    <main className="wg-page" id="wolf-gold-game">
      <WolfGoldCoinRain active={game.showCoins} />
      <div className="wg-moon" aria-hidden />
      <div className="wg-wrap">
        <header className="wg-top">
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.8 }}>Demo · créditos virtuais</p>
            <h1 className="wg-title">Wolf Gold — Wild Canyon</h1>
          </div>
          <a
            href="#"
            className="wg-back"
            onClick={(e) => {
              e.preventDefault()
              window.location.hash = ''
            }}
          >
            ← PlayHub
          </a>
        </header>

        <div className="wg-hud">
          <span className="wg-pill">
            Saldo <strong>{game.balanceLabel}</strong>
          </span>
          <span className="wg-pill">
            Aposta <strong>{game.betLabel}</strong>
          </span>
          <span className="wg-pill">
            Último prêmio <strong>{game.lastWinLabel}</strong>
          </span>
          <span className="wg-pill">
            {game.estado?.mode === 'free_spin' && (
              <>
                Free spins <strong>{game.estado.free_spins_left}</strong>
              </>
            )}
            {game.estado?.mode === 'money_respin' && (
              <>
                Respins <strong>{game.estado.respins_left}</strong>
              </>
            )}
            {game.estado?.mode === 'base' && <span>{game.status}</span>}
          </span>
        </div>

        <WolfGoldReels
          grid={game.grid}
          spinning={game.spinning}
          stoppedReels={game.stoppedReels}
          winLines={game.winLines}
          moneyValues={game.estado?.money_grid}
          freeSpin={freeSpin}
        />

        <LinkPaytable
          open={showPaytable}
          symbols={config.simbolos}
          jackpots={config.jogo.jackpots}
          onClose={() => setShowPaytable(false)}
        />

        <WolfGoldControls
          onSpin={() => void doSpin()}
          spinning={game.spinning}
          onBetDown={() => game.bumpBet(-0.25)}
          onBetUp={() => game.bumpBet(0.25)}
          turbo={turbo}
          onTurbo={() => setTurbo((t) => !t)}
          soundOn={soundOn}
          onSound={toggleSound}
          onPaytable={() => setShowPaytable((s) => !s)}
          onAuto10={() => startAuto(10)}
          onAuto25={() => startAuto(25)}
          autoLeft={autoLeft}
        />

        <p style={{ textAlign: 'center', fontSize: '0.7rem', opacity: 0.75, marginTop: '1rem' }}>
          25 linhas fixas · Wild substitui símbolos normais · 3 Scatters = Free Spins · 6+ Money = Hold &amp; Win
        </p>
      </div>
    </main>
  )
}

function WolfGoldControls({
  onSpin,
  spinning,
  onBetDown,
  onBetUp,
  turbo,
  onTurbo,
  soundOn,
  onSound,
  onPaytable,
  onAuto10,
  onAuto25,
  autoLeft,
}: {
  onSpin: () => void
  spinning: boolean
  onBetDown: () => void
  onBetUp: () => void
  turbo: boolean
  onTurbo: () => void
  soundOn: boolean
  onSound: () => void
  onPaytable: () => void
  onAuto10: () => void
  onAuto25: () => void
  autoLeft: number
}) {
  return (
    <div className="wg-controls">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        <button type="button" className="wg-btn" onClick={onBetDown} disabled={spinning}>
          Bet −
        </button>
        <button type="button" className="wg-btn" onClick={onBetUp} disabled={spinning}>
          Bet +
        </button>
        <button type="button" className={`wg-btn${turbo ? ' wg-btn--active' : ''}`} onClick={onTurbo}>
          Turbo
        </button>
        <button type="button" className="wg-btn" onClick={onAuto10} disabled={spinning}>
          Auto 10
        </button>
        <button type="button" className="wg-btn" onClick={onAuto25} disabled={spinning}>
          Auto 25
        </button>
        {autoLeft > 0 && <span className="wg-pill">Auto: {autoLeft}</span>}
      </div>
      <button type="button" className="wg-btn wg-btn--spin" onClick={onSpin} disabled={spinning}>
        Spin
      </button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'flex-end' }}>
        <button type="button" className={`wg-btn${soundOn ? ' wg-btn--active' : ''}`} onClick={onSound}>
          Sound
        </button>
        <button type="button" className="wg-btn" onClick={onPaytable}>
          Paytable
        </button>
      </div>
    </div>
  )
}

function LinkPaytable({
  open,
  symbols,
  jackpots,
  onClose,
}: {
  open: boolean
  symbols: WolfGoldConfig['simbolos']
  jackpots: WolfGoldConfig['jogo']['jackpots']
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="wg-paytable" role="dialog" onClick={onClose} onKeyDown={() => {}}>
      <h2 style={{ margin: '0 0 0.5rem', fontFamily: 'Oswald', fontSize: '1rem' }}>Tabela de pagamentos</h2>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem' }}>
        Jackpots Money: Mini {jackpots.mini} · Major {jackpots.major} · Mega {jackpots.mega}
      </p>
      <table>
        <thead>
          <tr>
            <th>Símbolo</th>
            <th>×3</th>
            <th>×4</th>
            <th>×5</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((s) => (
            <tr key={s.id}>
              <td>
                {WOLF_SYMBOL_EMOJI[asWolfSymbol(s.id)]} {s.label}
              </td>
              <td>{s.pago_3}</td>
              <td>{s.pago_4}</td>
              <td>{s.pago_5}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
