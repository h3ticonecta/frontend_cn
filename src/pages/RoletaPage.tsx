import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearRoletaSessionId,
  createRoletaSession,
  fetchRoletaConfig,
  fetchRoletaSession,
  getStoredRoletaSessionId,
  spinRoleta,
} from '../api/roleta'
import { RoletaTable } from '../components/roleta/RoletaTable'
import { TIPO_APOSTA_LABEL } from '../lib/roletaLayout'
import {
  formatApostaValor,
  podeAdicionarAposta,
  somaApostas,
  valorApostaValido,
} from '../lib/roletaValidate'
import type { ApostaPayload, RoletaConfig, RoletaGiroResult } from '../types/roleta'
import '../styles/buttons.css'
import './RoletaPage.css'

type PendingBet = ApostaPayload & { key: string }

const MESA_SLUG = 'roleta-brasil'

const OUTSIDE_BETS: { tipo: string; label: string; cls?: string }[] = [
  { tipo: 'red', label: 'Vermelho', cls: 'red' },
  { tipo: 'black', label: 'Preto', cls: 'black' },
  { tipo: 'odd', label: 'Ímpar' },
  { tipo: 'even', label: 'Par' },
  { tipo: 'low', label: '1–18' },
  { tipo: 'high', label: '19–36' },
  { tipo: 'dozen_1', label: '1ª dúzia' },
  { tipo: 'dozen_2', label: '2ª dúzia' },
  { tipo: 'dozen_3', label: '3ª dúzia' },
  { tipo: 'column_1', label: 'Col. 1' },
  { tipo: 'column_2', label: 'Col. 2' },
  { tipo: 'column_3', label: 'Col. 3' },
]

function corLabel(cor: string) {
  if (cor === 'red') return 'Vermelho'
  if (cor === 'black') return 'Preto'
  return 'Verde'
}

function labelAposta(tipo: string, numero?: number) {
  const base = TIPO_APOSTA_LABEL[tipo] ?? tipo
  if (tipo === 'straight' && numero != null) return `${base} (${numero})`
  return base
}

export function RoletaPage() {
  const [config, setConfig] = useState<RoletaConfig | null>(null)
  const [sessaoId, setSessaoId] = useState<string | null>(null)
  const [saldo, setSaldo] = useState<string>('—')
  const [valorAposta, setValorAposta] = useState('10.00')
  const [numeroStraight, setNumeroStraight] = useState<number | null>(null)
  const [pendentes, setPendentes] = useState<PendingBet[]>([])
  const [ultimoGiro, setUltimoGiro] = useState<RoletaGiroResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [spinning, setSpinning] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const mesa = config?.mesa
  const vermelhos = config?.numeros.vermelhos ?? []

  const tiposMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const t of config?.tipos_aposta ?? []) {
      m.set(t.tipo, `${t.descricao} (${t.multiplicador}:1)`)
    }
    return m
  }, [config])

  const historico = useMemo(() => {
    const recent = config?.historico_recente ?? []
    if (ultimoGiro) {
      const head = {
        numero: ultimoGiro.resultado.numero,
        cor: ultimoGiro.resultado.cor,
        em: new Date().toISOString(),
      }
      const rest = recent.filter((h) => h.numero !== head.numero || h.em !== head.em)
      return [head, ...rest].slice(0, 12)
    }
    return recent
  }, [config, ultimoGiro])

  const totalPendente = useMemo(
    () => somaApostas(pendentes.map((p) => p.valor)),
    [pendentes],
  )

  const carregarSessao = useCallback(async (mesaSlug: string) => {
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
    const s = await createRoletaSession('Convidado', mesaSlug)
    setSessaoId(s.sessao_id)
    setSaldo(s.saldo)
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    ;(async () => {
      try {
        setLoading(true)
        const cfg = await fetchRoletaConfig(MESA_SLUG, ctrl.signal)
        setConfig(cfg)
        setValorAposta(cfg.mesa.aposta_minima)
        await carregarSessao(cfg.mesa.slug)
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Falha ao carregar a roleta.')
      } finally {
        setLoading(false)
      }
    })()
    return () => ctrl.abort()
  }, [carregarSessao])

  const addBet = (tipo: string, numero?: number) => {
    if (!mesa) return

    const limite = podeAdicionarAposta(pendentes.length, mesa.max_apostas_por_giro)
    if (limite) {
      setErro(limite)
      return
    }

    const check = valorApostaValido(valorAposta, mesa)
    if (!check.ok) {
      setErro(check.motivo)
      return
    }

    const tipoInfo = config?.tipos_aposta.find((t) => t.tipo === tipo)
    if (!tipoInfo) {
      setErro('Tipo de aposta não disponível nesta mesa.')
      return
    }
    if (tipoInfo.requer_numero && numero == null) {
      setErro('Esta aposta exige um número.')
      return
    }
    if (tipo !== 'straight' && numero != null) {
      setErro('Número só é permitido em aposta straight.')
      return
    }

    setErro(null)
    const key = `${tipo}-${numero ?? 'x'}-${check.valor}-${Date.now()}-${pendentes.length}`
    setPendentes((prev) => [
      ...prev,
      { tipo, valor: check.valor, numero, key },
    ])
  }

  const addStraightFromTable = (n: number) => {
    setNumeroStraight(n)
    addBet('straight', n)
  }

  const girar = async () => {
    if (!sessaoId || !mesa) return
    if (pendentes.length === 0) {
      setErro('Adicione ao menos uma aposta antes de girar.')
      return
    }
    if (totalPendente > Number(saldo)) {
      setErro(`Saldo insuficiente. Disponível: ${saldo}`)
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
      setNumeroStraight(result.resultado.numero)
      const cfg = await fetchRoletaConfig(MESA_SLUG)
      setConfig(cfg)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao girar.')
    } finally {
      setSpinning(false)
    }
  }

  const novaSessao = async () => {
    if (!mesa) return
    clearRoletaSessionId()
    setPendentes([])
    setUltimoGiro(null)
    try {
      const s = await createRoletaSession('Convidado', mesa.slug)
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

  if (!config) {
    return (
      <main className="roleta-page">
        <p className="roleta-page__erro" role="alert">
          {erro ?? 'Configuração da mesa indisponível.'}
        </p>
        <a href="#/" className="btn btn--ghost">
          Voltar ao lobby
        </a>
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
            Variante europeia ({config.numeros.min}–{config.numeros.max}). Mín.{' '}
            {mesa?.aposta_minima} · máx. {mesa?.aposta_maxima} · até{' '}
            {mesa?.max_apostas_por_giro} apostas/giro.
          </p>
        </div>
        <div className="roleta-page__saldo" aria-live="polite">
          <span className="roleta-page__saldo-label">Saldo (demo)</span>
          <span className="roleta-page__saldo-valor">{saldo}</span>
          {pendentes.length > 0 && (
            <span className="roleta-page__saldo-pending">
              Apostas neste giro: {formatApostaValor(String(totalPendente))}
            </span>
          )}
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
            <>
              <div
                className={`roleta-result roleta-result--${ultimoGiro.resultado.cor}${
                  spinning ? ' roleta-result--spin' : ''
                }`}
              >
                <span className="roleta-result__num">{ultimoGiro.resultado.numero}</span>
                <span className="roleta-result__cor">
                  {corLabel(ultimoGiro.resultado.cor)}
                </span>
                <p className="roleta-result__meta">
                  Apostado: <strong>{ultimoGiro.totais.apostado}</strong> · Pago:{' '}
                  <strong>{ultimoGiro.totais.pago}</strong> · Líquido:{' '}
                  <strong>{ultimoGiro.totais.lucro_liquido}</strong>
                </p>
              </div>
              <table className="roleta-outcome">
                <caption className="visually-hidden">Detalhe das apostas do último giro</caption>
                <thead>
                  <tr>
                    <th scope="col">Aposta</th>
                    <th scope="col">Valor</th>
                    <th scope="col">Pagamento</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimoGiro.apostas.map((a, i) => (
                    <tr key={`${a.tipo}-${a.numero}-${i}`} className={a.ganhou ? 'win' : ''}>
                      <td>{labelAposta(a.tipo, a.numero ?? undefined)}</td>
                      <td>{a.valor}</td>
                      <td>{a.pagamento}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="roleta-panel__empty">Faça sua primeira aposta e gire a roda.</p>
          )}

          <h3 className="roleta-panel__subtitle">Histórico recente</h3>
          <ul className="roleta-hist">
            {historico.map((h, i) => (
              <li
                key={`${h.numero}-${h.em}-${i}`}
                className={`roleta-hist__chip roleta-hist__chip--${h.cor}`}
                title={h.em}
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
              min={Number(mesa?.aposta_minima)}
              max={Number(mesa?.aposta_maxima)}
              step="0.01"
              value={valorAposta}
              onChange={(e) => setValorAposta(e.target.value)}
              onBlur={() => {
                if (mesa) {
                  const v = valorApostaValido(valorAposta, mesa)
                  if (v.ok) setValorAposta(v.valor)
                }
              }}
            />
          </label>

          <RoletaTable
            vermelhos={vermelhos}
            selectedStraight={numeroStraight}
            onStraight={addStraightFromTable}
          />

          <p className="roleta-hint">
            Toque em um número para apostar <strong>straight</strong> (35:1). O{' '}
            <strong>0</strong> faz perder apostas externas.
          </p>

          <div className="roleta-quick">
            {OUTSIDE_BETS.map((b) => (
              <button
                key={b.tipo}
                type="button"
                className={`roleta-quick__btn${b.cls ? ` roleta-quick__btn--${b.cls}` : ''}`}
                title={tiposMap.get(b.tipo)}
                onClick={() => addBet(b.tipo)}
              >
                {b.label}
              </button>
            ))}
          </div>

          {pendentes.length > 0 && (
            <>
              <h3 className="roleta-panel__subtitle">
                Neste giro ({pendentes.length}/{mesa?.max_apostas_por_giro})
              </h3>
              <ul className="roleta-pending">
                {pendentes.map((p) => (
                  <li key={p.key}>
                    <span>
                      {labelAposta(p.tipo, p.numero)} — {p.valor}
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
            </>
          )}

          <details className="roleta-tipos">
            <summary>Tipos de aposta (API)</summary>
            <ul>
              {config.tipos_aposta.map((t) => (
                <li key={t.tipo}>
                  <code>{t.tipo}</code> — {t.descricao} — mult. {t.multiplicador}:1
                </li>
              ))}
            </ul>
          </details>

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
