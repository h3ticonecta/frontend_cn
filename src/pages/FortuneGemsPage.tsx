import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clearFortuneGemsSessionId,
  createFortuneGemsSession,
  fetchFortuneGemsSession,
  getStoredFortuneGemsSessionId,
} from '../api/fortuneGems'
import { FortuneGemsCoinRain } from '../components/fortune-gems/FortuneGemsCoinRain'
import { FortuneGemsReel } from '../components/fortune-gems/FortuneGemsReel'
import { useFortuneGemsSpin } from '../hooks/useFortuneGemsSpin'
import { loadFortuneGemsBootstrap } from '../lib/loadFortuneGemsBootstrap'
import {
  FORTUNE_SYMBOLS,
  formatMoney,
  symbolById,
  type FortuneSymbolId,
} from '../lib/fortuneGemsSymbols'
import type { FortuneGemsConfig } from '../types/fortuneGems'
import '../styles/fortune-gems-studio.css'

const QUICK_BETS = [10, 50, 100, 500]

type FortuneGemsPageProps = {
  gameSlug: string
}

const REEL_TOP = ['lemon', 'cherry', 'melon'] as const
const REEL_BOTTOM = ['grape', 'bell', 'grape'] as const

const STATIC_WINNERS = [
  { name: 'Matheus_RJ', detail: '3x Sinos Dourados', amount: 5000, ago: '2 min', initial: 'M' },
  { name: 'Alex_777', detail: 'Combo Diamantes', amount: 10_000, ago: '5 min', initial: 'A' },
  { name: 'VegasQueen', detail: 'TRIPLO 7 JACKPOT', amount: 250_000, ago: '12 min', initial: 'V' },
] as const

function statusClass(tone: string): string {
  if (tone === 'spinning') return 'fg-display__value--status-spin'
  if (tone === 'win') return 'fg-display__value--status-win'
  if (tone === 'lose') return 'fg-display__value--status-lose'
  return 'fg-display__value--status-ready'
}

function reelsToLine(reels: readonly FortuneSymbolId[]): string {
  return reels.map((id) => (id === '7' ? '7' : symbolById(id).emoji)).join(' ')
}

export function FortuneGemsPage({ gameSlug }: FortuneGemsPageProps) {
  const [config, setConfig] = useState<FortuneGemsConfig | null>(null)
  const [sessaoId, setSessaoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const jogo = config?.jogo
  const spin = useFortuneGemsSpin({
    sessaoId,
    betMin: jogo ? Number(jogo.aposta_minima) : 10,
    betMax: jogo ? Number(jogo.aposta_maxima) : 1000,
    initialBalance: jogo ? Number(jogo.saldo_inicial) : 25_450,
    initialBet: 50,
  })

  const balanceSync = useRef(spin.setBalanceFromApi)
  const betSync = useRef(spin.updateBet)
  balanceSync.current = spin.setBalanceFromApi
  betSync.current = spin.updateBet

  const [history, setHistory] = useState<{ id: number; line: string; delta: string; win: boolean }[]>(
    [],
  )

  const carregarSessao = useCallback(async (jogoSlug: string) => {
    const stored = getStoredFortuneGemsSessionId()
    if (stored) {
      try {
        const s = await fetchFortuneGemsSession(stored)
        setSessaoId(s.sessao_id)
        balanceSync.current(s.saldo)
        return
      } catch {
        clearFortuneGemsSessionId()
      }
    }
    const s = await createFortuneGemsSession(jogoSlug, 'Convidado')
    setSessaoId(s.sessao_id)
    balanceSync.current(s.saldo)
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    ;(async () => {
      try {
        setLoading(true)
        setErro(null)
        const boot = await loadFortuneGemsBootstrap(gameSlug, ctrl.signal)
        setConfig(boot.config)
        const minBet = Number(boot.config.jogo.aposta_minima)
        betSync.current(Number.isNaN(minBet) ? 50 : Math.max(minBet, 50))
        await carregarSessao(boot.play.slot_slug)
        const hist = (boot.config.historico_recente ?? []).map((h, i) => ({
          id: 10_490 + i,
          line: h.carreteis
            .map((id) => (id === '7' ? '7' : symbolById(id as FortuneSymbolId).emoji))
            .join(' '),
          delta: Number(h.premio) > 0 ? `+${formatMoney(Number(h.premio))}` : `-${formatMoney(Number(h.aposta))}`,
          win: Number(h.premio) > 0,
        }))
        if (hist.length) setHistory(hist)
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Falha ao carregar Fortune Gems.')
      } finally {
        setLoading(false)
      }
    })()
    return () => ctrl.abort()
  }, [carregarSessao, gameSlug])

  useEffect(() => {
    const r = spin.lastResult
    if (!r) return
    const line = reelsToLine(r.reels)
    const delta = r.won ? `+${formatMoney(r.prize)}` : `-${formatMoney(r.bet)}`
    setHistory((h) => [{ id: r.spinId, line, delta, win: r.won }, ...h].slice(0, 6))
  }, [spin.lastResult])

  const onSpin = () => {
    void spin.spin()
  }

  const jackpotDisplay = jogo ? Number(jogo.jackpot_exibicao) : 1_489_200.5

  if (loading) {
    return (
      <main className="fg-page">
        <p style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Carregando Fortune Gems…</p>
      </main>
    )
  }

  if (erro || !config) {
    return (
      <main className="fg-page">
        <p style={{ textAlign: 'center', padding: '3rem', color: '#f87171' }} role="alert">
          {erro ?? 'Config indisponível.'}
        </p>
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
          Rode no backend: <code>python manage.py migrate</code>,{' '}
          <code>python manage.py seed_fortune_gems</code> e <code>python manage.py seed_playhub</code>.
        </p>
      </main>
    )
  }

  return (
    <main className="fg-page" id="fortune-gems-game">
      <FortuneGemsCoinRain active={spin.showCoinRain} />

      <header className="fg-page__bar">
        <div className="fg-page__bar-inner">
          <div className="fg-brand">
            <BrandBlock />
            <p className="fg-eyebrow-demo">Demo · fichas virtuais</p>
          </div>

          <div className="fg-jackpot" aria-live="polite">
            <div className="fg-jackpot__pill">
              <span className="fg-jackpot__dot" />
              <span className="fg-jackpot__label">Mega jackpot:</span>
              <span className="fg-jackpot__amount">{formatMoney(jackpotDisplay)}</span>
            </div>
          </div>

          <div className="fg-player">
            <div className="fg-credits">
              <div className="fg-credits__coin" aria-hidden>
                🪙
              </div>
              <div>
                <div className="fg-credits__label">Créditos</div>
                <div className="fg-credits__value" aria-live="polite">
                  {spin.balanceLabel}
                </div>
              </div>
            </div>
            <a
              href="#"
              className="fg-back-home"
              onClick={(e) => {
                e.preventDefault()
                window.location.hash = ''
              }}
            >
              ← PlayHub
            </a>
          </div>
        </div>
      </header>

      <div className="fg-layout">
        <aside className="fg-layout__left">
          <VipPanel rtp={config.jogo.rtp} />
          <PaytablePanel symbols={config.simbolos} />
          <LinesPanel />
        </aside>

        <section className="fg-layout__center" aria-label="Máquina caça-níquel">
          <div className="fg-slot-wrap">
            <SlotCap />
            <div className="fg-displays">
              <div className="fg-display">
                <span className="fg-display__label">Último prêmio</span>
                <span className="fg-display__value">{spin.lastWinLabel}</span>
              </div>
              <div className="fg-display fg-display--status">
                <span className="fg-display__label">Status do giro</span>
                <span className={`fg-display__value ${statusClass(spin.statusTone)}`}>
                  {spin.statusText}
                </span>
              </div>
            </div>

            <div className="fg-machine-row">
              <div className="fg-chassis-outer">
                <div className="fg-chassis-metal">
                  <div className="fg-reels-window">
                    <div className="fg-reels-window__line" />
                    <div className="fg-reels-grid">
                      {spin.reels.map((center, idx) => (
                        <FortuneGemsReel
                          key={idx}
                          center={center}
                          top={REEL_TOP[idx]}
                          bottom={REEL_BOTTOM[idx]}
                          spinning={spin.isSpinning}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`fg-lever${spin.leverActive ? ' fg-lever--active' : ''}`}
                aria-label="Puxar alavanca para girar"
                onClick={onSpin}
                disabled={spin.isSpinning}
              >
                <span className="fg-lever__knob" />
                <span className="fg-lever__shaft" />
                <span className="fg-lever__base" />
              </button>
            </div>

            <SpinActions
              onSpin={onSpin}
              isSpinning={spin.isSpinning}
              onMax={() => spin.updateBet(500)}
            />
          </div>

          <BetBar
            betLabel={spin.betLabel}
            onDec={() => spin.bumpBet(-10)}
            onInc={() => spin.bumpBet(10)}
            onQuick={spin.updateBet}
            currentBet={spin.currentBet}
            disabled={spin.isSpinning}
          />
        </section>

        <aside className="fg-layout__right">
          <WinnersPanel />
          <HistoryPanel history={history} />
          <div className="fg-panel fg-fair">
            <strong>🛡️ Provably Fair RNG</strong>
            Certificação RNG de algoritmo transparente. Jogue com moderação (+18).
          </div>
        </aside>
      </div>
    </main>
  )
}

function BrandBlock() {
  return (
    <div className="fg-brand__glow">
      <div className="fg-brand__box">
        <span className="fg-brand__icon" aria-hidden>
          💎
        </span>
        <h1 className="fg-brand__title">Fortune Gems</h1>
        <span className="fg-brand__vip">VIP</span>
      </div>
    </div>
  )
}

function VipPanel({ rtp }: { rtp: string }) {
  return (
    <div className="fg-panel">
      <div className="fg-vip-row">
        <div className="fg-vip-avatar">
          7<span className="fg-vip-badge">LV12</span>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--fg-neon-cyan)', fontWeight: 700 }}>
            DIAMOND VIP
          </div>
          <div style={{ fontWeight: 700 }}>GemHunter_BR</div>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
            RTP Oficial: <span style={{ color: 'var(--fg-neon-green)', fontWeight: 700 }}>{rtp}</span>
          </div>
        </div>
      </div>
      <div className="fg-progress">
        <div className="fg-progress__fill" />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.65rem',
          color: '#9ca3af',
          marginTop: '0.35rem',
          fontFamily: 'var(--fg-font-hud)',
        }}
      >
        <span>Progresso VIP</span>
        <span>78%</span>
      </div>
    </div>
  )
}

function PaytablePanel({ symbols }: { symbols: FortuneGemsConfig['simbolos'] }) {
  const rows = symbols.length
    ? symbols
    : FORTUNE_SYMBOLS.map((s) => ({
        id: s.id,
        label: s.label,
        multiplicador: String(s.paytableMultiplier),
      }))

  return (
    <div className="fg-panel">
      <h2 className="fg-panel__title">🏆 Tabela de prêmios</h2>
      <ul className="fg-paytable">
        {rows.map((row) => {
          const sym = FORTUNE_SYMBOLS.find((s) => s.id === row.id)
          const emoji = sym?.emoji ?? '💎'
          return (
            <li
              key={row.id}
              className={`fg-paytable__row${row.id === '7' ? ' fg-paytable__row--jackpot' : ''}`}
            >
              <span>
                {row.id === '7' ? (
                  <span
                    style={{
                      fontFamily: 'var(--fg-font-display)',
                      color: 'var(--fg-neon-red)',
                      fontWeight: 900,
                    }}
                  >
                    7 7 7
                  </span>
                ) : (
                  <span>
                    {emoji} {emoji} {emoji}
                  </span>
                )}{' '}
                {row.label}
              </span>
              <span style={{ fontFamily: 'var(--fg-font-display)', fontWeight: 900 }}>
                {row.multiplicador}x
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function LinesPanel() {
  return (
    <div className="fg-panel" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
      <div>
        <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>Linhas ativas</div>
        <div style={{ fontFamily: 'var(--fg-font-display)', fontWeight: 900, color: 'var(--fg-neon-cyan)' }}>
          5 LINHAS FIXAS
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>Multiplicador</div>
        <div style={{ fontFamily: 'var(--fg-font-display)', fontWeight: 900, color: 'var(--fg-neon-gold)' }}>
          3x COMBO
        </div>
      </div>
    </div>
  )
}

function SlotCap() {
  return (
    <div className="fg-slot-cap">
      <div className="fg-slot-cap__inner">
        <div className="fg-slot-cap__label">
          <span className="fg-jackpot__dot" style={{ width: '0.65rem', height: '0.65rem' }} />
          Fortune Gems Neon
          <span className="fg-jackpot__dot" style={{ width: '0.65rem', height: '0.65rem' }} />
        </div>
        <div className="fg-slot-cap__line" />
      </div>
    </div>
  )
}

function SpinActions({
  onSpin,
  isSpinning,
  onMax,
}: {
  onSpin: () => void
  isSpinning: boolean
  onMax: () => void
}) {
  return (
    <div className="fg-actions">
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" className="fg-btn-ghost" disabled>
          🔄 Auto (25x)
        </button>
        <button type="button" className="fg-btn-ghost" disabled>
          ⚡ Turbo
        </button>
      </div>
      <button type="button" className="fg-btn-spin" onClick={onSpin} disabled={isSpinning}>
        Girar ►►
      </button>
      <button type="button" className="fg-btn-max" onClick={onMax} disabled={isSpinning}>
        Max bet
      </button>
    </div>
  )
}

function BetBar({
  betLabel,
  currentBet,
  onDec,
  onInc,
  onQuick,
  disabled,
}: {
  betLabel: string
  currentBet: number
  onDec: () => void
  onInc: () => void
  onQuick: (n: number) => void
  disabled: boolean
}) {
  return (
    <div className="fg-panel fg-bet-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.08em' }}>
            Aposta por linha
          </div>
          <div style={{ fontFamily: 'var(--fg-font-display)', fontWeight: 700 }}>$10.00</div>
        </div>
        <div className="fg-bet-stepper">
          <button type="button" onClick={onDec} disabled={disabled} aria-label="Diminuir aposta">
            −
          </button>
          <span className="fg-bet-value">{betLabel}</span>
          <button type="button" onClick={onInc} disabled={disabled} aria-label="Aumentar aposta">
            +
          </button>
        </div>
      </div>
      <div className="fg-chips">
        <span style={{ fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase' }}>Atalhos:</span>
        {QUICK_BETS.map((v) => (
          <button
            key={v}
            type="button"
            className={`fg-chip${currentBet === v ? ' fg-chip--active' : ''}`}
            onClick={() => onQuick(v)}
            disabled={disabled}
          >
            ${v}
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700 }}>Aposta total</div>
        <div
          style={{
            fontFamily: 'var(--fg-font-display)',
            fontWeight: 900,
            color: 'var(--fg-neon-red)',
            fontSize: '1.1rem',
          }}
        >
          {betLabel}
        </div>
      </div>
    </div>
  )
}

function WinnersPanel() {
  return (
    <div className="fg-panel">
      <h2 className="fg-panel__title" style={{ color: 'var(--fg-neon-green)' }}>
        <span className="fg-jackpot__dot" style={{ width: '0.45rem', height: '0.45rem' }} />
        Ganhadores ao vivo
      </h2>
      <ul className="fg-winners">
        {STATIC_WINNERS.map((w) => (
          <li key={w.name} className="fg-winners__item">
            <WinnerRow {...w} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function WinnerRow({
  name,
  detail,
  amount,
  ago,
  initial,
}: {
  name: string
  detail: string
  amount: number
  ago: string
  initial: string
}) {
  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        >
          {initial}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{name}</div>
          <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{detail}</div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--fg-font-display)', fontWeight: 900, color: 'var(--fg-neon-green)' }}>
          +{formatMoney(amount)}
        </div>
        <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>há {ago}</div>
      </div>
    </>
  )
}

function HistoryPanel({
  history,
}: {
  history: { id: number; line: string; delta: string; win: boolean }[]
}) {
  return (
    <div className="fg-panel">
      <h2 className="fg-panel__title" style={{ color: '#cbd5e1', justifyContent: 'space-between' }}>
        <span>Últimos giros</span>
      </h2>
      <ul className="fg-history">
        {history.map((row) => (
          <li key={row.id}>
            <span>
              #{row.id} - {row.line}
            </span>
            <span
              style={{
                fontFamily: 'var(--fg-font-display)',
                fontWeight: 700,
                color: row.win ? 'var(--fg-neon-green)' : '#6b7280',
              }}
            >
              {row.delta}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
