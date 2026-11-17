import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearCandyCascadeSessionId,
  createCandyCascadeSession,
  fetchCandyCascadeSession,
  getStoredCandyCascadeSessionId,
} from '../api/candyCascade'
import { ChancesDemoHint } from '../components/ChancesDemoHint'
import { CandyCascadeGrid } from '../components/candy-cascade/CandyCascadeGrid'
import { useCandyCascadeSpin } from '../hooks/useCandyCascadeSpin'
import { formatCredits } from '../lib/candyCascadeSymbols'
import { loadCandyCascadeBootstrap } from '../lib/loadCandyCascadeBootstrap'
import type { CandyCascadeConfig } from '../types/candyCascade'
import '../styles/sweet-bonanza-studio.css'

type Props = { gameSlug: string }

export function SweetBonanzaPage({ gameSlug }: Props) {
  const [config, setConfig] = useState<CandyCascadeConfig | null>(null)
  const [sessaoId, setSessaoId] = useState<string | null>(null)
  const [saldo, setSaldo] = useState('0')
  const [aposta, setAposta] = useState('1.00')
  const [extraBet, setExtraBet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const jogo = config?.jogo
  const game = useCandyCascadeSpin({ sessaoId })
  const { setEstadoFromSession } = game

  const initSession = useCallback(async (slotSlug: string) => {
    const stored = getStoredCandyCascadeSessionId()
    if (stored) {
      try {
        const s = await fetchCandyCascadeSession(stored)
        setSessaoId(s.sessao_id)
        setSaldo(s.saldo)
        setEstadoFromSession(s.estado)
        return
      } catch {
        clearCandyCascadeSessionId()
      }
    }
    const s = await createCandyCascadeSession(slotSlug)
    setSessaoId(s.sessao_id)
    setSaldo(s.saldo)
    setEstadoFromSession(s.estado)
  }, [setEstadoFromSession])

  useEffect(() => {
    const ctrl = new AbortController()
    ;(async () => {
      try {
        const boot = await loadCandyCascadeBootstrap(gameSlug, ctrl.signal)
        setConfig(boot.config)
        const steps = boot.config.jogo.opcoes.apostas_permitidas
        if (steps.includes('1.00')) setAposta('1.00')
        else if (steps[0]) setAposta(steps[0])
        await initSession(boot.play.slot_slug)
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Falha ao carregar o jogo.')
      } finally {
        setLoading(false)
      }
    })()
    return () => ctrl.abort()
  }, [gameSlug, initSession])

  const inFreeSpin = game.estado?.mode === 'free_spin' && (game.estado.free_spins_left ?? 0) > 0

  const buyMult = useMemo(() => {
    const raw = jogo?.opcoes.comprar_free_spins_mult ?? '100'
    return Number(raw) || 100
  }, [jogo?.opcoes.comprar_free_spins_mult])

  const buyCostLabel = useMemo(() => {
    const base = Number(aposta)
    if (!Number.isFinite(base)) return '—'
    return formatCredits(base * buyMult)
  }, [aposta, buyMult])

  const runSpin = async (comprar = false) => {
    if (!sessaoId || game.spinning) return
    setErro(null)
    try {
      const res = await game.spin(aposta, {
        aposta_extra: comprar ? false : extraBet,
        comprar_free_spins: comprar,
      })
      if (res) setSaldo(res.saldo)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro no giro.')
    }
  }

  if (loading) {
    return (
      <main className="cc-page">
        <p className="cc-page__status">Carregando Candy Cascade…</p>
      </main>
    )
  }

  if (erro && !config) {
    return (
      <main className="cc-page">
        <p className="cc-page__erro" role="alert">
          {erro}
        </p>
      </main>
    )
  }

  const titulo = jogo?.titulo_card ?? jogo?.nome_exibicao_modal ?? 'Sweet Bonanza'
  const aviso = game.avisoDemo ?? jogo?.aviso_demo ?? 'Jogo de demonstração. Sem dinheiro real.'

  return (
    <main className="cc-page" id="sweet-bonanza-game">
      <header className="cc-page__head">
        <p className="cc-page__eyebrow">Demo · créditos virtuais</p>
        <h1 className="cc-page__title">{titulo}</h1>
        <p className="cc-page__sub">
          {jogo?.nome} · pay anywhere (mín. {jogo?.cluster_minimo} iguais) · cascatas
        </p>
        {jogo?.chances ? <ChancesDemoHint chances={jogo.chances} /> : null}
      </header>

      <section className="cc-panel" aria-label="Área do jogo">
        <div className="cc-hud">
          <div>
            <span className="cc-hud__label">Saldo</span>
            <span className="cc-hud__value">{formatCredits(saldo)}</span>
          </div>
          <div>
            <span className="cc-hud__label">Aposta</span>
            <select
              className="cc-hud__select"
              value={aposta}
              onChange={(e) => setAposta(e.target.value)}
              disabled={game.spinning || inFreeSpin}
            >
              {(jogo?.opcoes.apostas_permitidas ?? []).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="cc-hud__label">Último prêmio</span>
            <span className="cc-hud__value">
              {game.lastPremio != null ? formatCredits(game.lastPremio) : '—'}
            </span>
          </div>
          <div>
            <span className="cc-hud__label">Status</span>
            <span className="cc-hud__value cc-hud__value--sm">{game.status}</span>
          </div>
        </div>

        {inFreeSpin && (
          <p className="cc-fs-banner" role="status">
            Free spins · {game.estado?.free_spins_left} giros · acumulado {game.estado?.free_spins_total}
          </p>
        )}

        <CandyCascadeGrid
          grade={game.grade}
          multiplicadores={game.mults}
          highlight={game.winCells}
          spinning={game.spinning}
        />

        {game.cascadeLog.length > 0 && (
          <ul className="cc-cascade-log" aria-label="Resumo da cascata">
            {game.cascadeLog.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}

        <label className="cc-check">
          <input
            type="checkbox"
            checked={extraBet}
            onChange={(e) => setExtraBet(e.target.checked)}
            disabled={game.spinning || inFreeSpin}
          />
          Aposta extra (+{jogo?.opcoes.aposta_extra_markup ?? '0.25'} na aposta base)
        </label>

        {erro ? (
          <p className="cc-page__erro" role="alert">
            {erro}
          </p>
        ) : null}

        <div className="cc-actions">
          <button
            type="button"
            className="cc-spin"
            disabled={game.spinning || !sessaoId}
            onClick={() => void runSpin(false)}
          >
            {game.spinning ? 'Girando…' : inFreeSpin ? 'Giro grátis' : 'Girar'}
          </button>
          <button
            type="button"
            className="cc-buy-fs"
            disabled={game.spinning || !sessaoId || inFreeSpin}
            title={`Custa ${buyMult}× a aposta`}
            onClick={() => void runSpin(true)}
          >
            Comprar free spins ({buyCostLabel})
          </button>
        </div>

        {config?.regras_resumo?.length ? (
          <ul className="cc-rules">
            {config.regras_resumo.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <footer className="cc-footer">
        <p>{aviso}</p>
        <a className="cc-footer__back" href="#/">
          Voltar à vitrine
        </a>
      </footer>
    </main>
  )
}