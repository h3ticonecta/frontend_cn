import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearRoletaSessionId,
  createRoletaSession,
  fetchRoletaConfig,
  fetchRoletaSession,
  getStoredRoletaSessionId,
  spinRoleta,
} from '../api/roleta'
import type { ApostaPayload, RoletaConfig, RoletaGiroResult } from '../types/roleta'
import '../styles/buttons.css'
import './RoletaPage.css'

type PendingBet = ApostaPayload & { key: string }

const OUTSIDE_BETS: { tipo: string; label: string; cls?: string }[] = [
  { tipo: 'red', label: 'Vermelho', cls: 'red' },
  { tipo: 'black', label: 'Preto', cls: 'black' },
  { tipo: 'odd', label: 'Ímpar' },
  { tipo: 'even', label: 'Par' },
  { tipo: 'low', label: '1–18' },
  { tipo: 'high', label: '19–36' },
]

function corLabel(cor: string) {
  if (cor === 'red') return 'Vermelho'
  if (cor === 'black') return 'Preto'
  return 'Verde'
}

export function RoletaPage() {
  const [config, setConfig] = useState<RoletaConfig | null>(null)
  const [sessaoId, setSessaoId] = useState<string | null>(null)
  const [saldo, setSaldo] = useState<string>('—')
  const [valorAposta, setValorAposta] = useState('10')
  const [numeroStraight, setNumeroStraight] = useState('17')
  const [pendentes, setPendentes] = useState<PendingBet[]>([])
  const [ultimoGiro, setUltimoGiro] = useState<RoletaGiroResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [spinning, setSpinning] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const mesa = config?.mesa

  const historico = useMemo(() => {
    const recent = config?.historico_recente ?? []
    if (ultimoGiro && !recent.some((h) => h.numero === ultimoGiro.resultado.numero)) {
      return [
        {
          numero: ultimoGiro.resultado.numero,
          cor: ultimoGiro.resultado.cor,
          em: new Date().toISOString(),
        },
        ...recent,
      ].slice(0, 12)
    }
    return recent
  }, [config, ultimoGiro])

  const carregarSessao = useCallback(async () => {
    const stored = getStoredRoletaSessionId()
    if (stored) {
      try {
        const s = await fetchRoletaSession(stored)
        setSessaoId(s.sessao_id)
        setSaldo(s.saldo)
        return
      } catch {
        clearRoletaSessionId()
      }
    }
    const s = await createRoletaSession('Convidado')
    setSessaoId(s.sessao_id)
    setSaldo(s.saldo)
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    ;(async () => {
      try {
        setLoading(true)
        const cfg = await fetchRoletaConfig('roleta-brasil', ctrl.signal)
        setConfig(cfg)
        await carregarSessao()
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Falha ao carregar a roleta.')
      } finally {
        setLoading(false)
      }
    })()
    return () => ctrl.abort()
  }, [carregarSessao])

  const addBet = (tipo: string, numero?: number) => {
    const valor = valorAposta.trim()
    if (!valor || Number(valor) <= 0) {
      setErro('Informe um valor de aposta válido.')
      return
    }
    setErro(null)
    const key = `${tipo}-${numero ?? 'x'}-${valor}-${pendentes.length}`
    setPendentes((prev) => [...prev, { tipo, valor, numero, key }])
  }

  const addStraight = () => {
    const n = Number(numeroStraight)
    if (!Number.isInteger(n) || n < 0 || n > 36) {
      setErro('Número straight deve ser de 0 a 36.')
      return
    }
    addBet('straight', n)
  }

  const girar = async () => {
    if (!sessaoId || pendentes.length === 0) {
      setErro('Adicione ao menos uma aposta antes de girar.')
      return
    }
    setErro(null)
    setSpinning(true)
    try {
      const result = await spinRoleta(
        sessaoId,
        pendentes.map(({ tipo, valor, numero }) => ({ tipo, valor, numero })),
      )
      setUltimoGiro(result)
      setSaldo(result.sessao.saldo_depois)
      setPendentes([])
      const cfg = await fetchRoletaConfig('roleta-brasil')
      setConfig(cfg)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao girar.')
    } finally {
      setSpinning(false)
    }
  }

  const novaSessao = async () => {
    clearRoletaSessionId()
    setPendentes([])
    setUltimoGiro(null)
    try {
      const s = await createRoletaSession('Convidado')
      setSessaoId(s.sessao_id)
      setSaldo(s.saldo)
      setErro(null)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar sessão.')
    }
  }

  if (loading) {
    return (
      <main className="roleta-page">
        <p className="roleta-page__status">Carregando roleta…</p>
      </main>
    )
  }

  return (
    <main className="roleta-page" id="roleta-game">
      <header className="roleta-page__head">
        <div>
          <p className="roleta-page__eyebrow">Demo · fichas virtuais</p>
          <h1 className="roleta-page__title">{mesa?.nome ?? 'Roleta'}</h1>
          <p className="roleta-page__sub">
            Variante europeia (0–36). Apostas de {mesa?.aposta_minima} a{' '}
            {mesa?.aposta_maxima} fichas.
          </p>
        </div>
        <div className="roleta-page__saldo" aria-live="polite">
          <span className="roleta-page__saldo-label">Saldo</span>
          <span className="roleta-page__saldo-valor">{saldo}</span>
        </div>
      </header>

      {erro && (
        <p className="roleta-page__erro" role="alert">
          {erro}
        </p>
      )}

      <div className="roleta-page__grid">
        <section className="roleta-panel" aria-labelledby="roleta-result-heading">
          <h2 id="roleta-result-heading" className="roleta-panel__title">
            Último resultado
          </h2>
          {ultimoGiro ? (
            <div
              className={`roleta-result roleta-result--${ultimoGiro.resultado.cor}${
                spinning ? ' roleta-result--spin' : ''
              }`}
            >
              <span className="roleta-result__num">{ultimoGiro.resultado.numero}</span>
              <span className="roleta-result__cor">{corLabel(ultimoGiro.resultado.cor)}</span>
              <p className="roleta-result__meta">
                Pago: <strong>{ultimoGiro.totais.pago}</strong> · Líquido:{' '}
                <strong>{ultimoGiro.totais.lucro_liquido}</strong>
              </p>
            </div>
          ) : (
            <p className="roleta-panel__empty">Faça sua primeira aposta e gire a roda.</p>
          )}

          <h3 className="roleta-panel__subtitle">Histórico recente</h3>
          <ul className="roleta-hist">
            {historico.map((h, i) => (
              <li
                key={`${h.numero}-${h.em}-${i}`}
                className={`roleta-hist__chip roleta-hist__chip--${h.cor}`}
              >
                {h.numero}
              </li>
            ))}
          </ul>
        </section>

        <section className="roleta-panel" aria-labelledby="roleta-bets-heading">
          <h2 id="roleta-bets-heading" className="roleta-panel__title">
            Apostas
          </h2>

          <label className="roleta-field">
            <span>Valor por aposta (fichas)</span>
            <input
              type="number"
              min={mesa ? Number(mesa.aposta_minima) : 1}
              max={mesa ? Number(mesa.aposta_maxima) : 500}
              step="1"
              value={valorAposta}
              onChange={(e) => setValorAposta(e.target.value)}
            />
          </label>

          <div className="roleta-quick">
            {OUTSIDE_BETS.map((b) => (
              <button
                key={b.tipo}
                type="button"
                className={`roleta-quick__btn${b.cls ? ` roleta-quick__btn--${b.cls}` : ''}`}
                onClick={() => addBet(b.tipo)}
              >
                {b.label}
              </button>
            ))}
          </div>

          <fieldset className="roleta-straight">
            <legend>Número exato (35:1)</legend>
            <input
              type="number"
              min={0}
              max={36}
              value={numeroStraight}
              onChange={(e) => setNumeroStraight(e.target.value)}
              aria-label="Número straight"
            />
            <button type="button" className="btn btn--outline" onClick={addStraight}>
              Adicionar straight
            </button>
          </fieldset>

          {pendentes.length > 0 && (
            <ul className="roleta-pending">
              {pendentes.map((p) => (
                <li key={p.key}>
                  <span>
                    {p.tipo}
                    {p.numero != null ? ` (${p.numero})` : ''} — {p.valor}
                  </span>
                  <button
                    type="button"
                    className="roleta-pending__rm"
                    onClick={() => setPendentes((prev) => prev.filter((x) => x.key !== p.key))}
                    aria-label="Remover aposta"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="roleta-actions">
            <button
              type="button"
              className="btn btn--gold btn--lg"
              disabled={spinning || pendentes.length === 0}
              onClick={girar}
            >
              {spinning ? 'Girando…' : 'Girar roleta'}
            </button>
            <a href="#/" className="btn btn--ghost">
              Voltar ao lobby
            </a>
            <button type="button" className="btn btn--ghost" onClick={novaSessao}>
              Nova sessão (reset fichas)
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
