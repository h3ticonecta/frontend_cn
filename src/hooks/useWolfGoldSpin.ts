import { useCallback, useRef, useState } from 'react'
import { spinWolfGold } from '../api/wolfGold'
import { REEL_SPIN_MS, REEL_STOP_STAGGER_MS, formatCredits } from '../lib/wolfGoldSymbols'
import { getWolfGoldSoundEnabled } from '../api/wolfGold'
import { playBonusFanfare, playSpinTick, playWinChime } from '../lib/wolfGoldSound'
import type { WolfGoldGrid, WolfGoldSessaoEstado, WolfGoldSpinResult } from '../types/wolfGold'

const COLS = 5
const ROWS = 3
const POOL = ['wolf', 'buffalo', 'eagle', 'puma', 'a', 'k', 'q', 'j', 'wild', 'scatter', 'money'] as const

function blankGrid(): WolfGoldGrid {
  return Array.from({ length: COLS }, () => Array.from({ length: ROWS }, () => 'j'))
}

function randomGrid(): WolfGoldGrid {
  return Array.from({ length: COLS }, () =>
    Array.from({ length: ROWS }, () => POOL[Math.floor(Math.random() * POOL.length)]!),
  )
}

export function useWolfGoldSpin(opts: {
  sessaoId: string | null
  betMin: number
  betMax: number
  initialBalance: number
  initialBet: number
  turbo: boolean
  soundOn: boolean
}) {
  const [balance, setBalance] = useState(opts.initialBalance)
  const [bet, setBet] = useState(opts.initialBet)
  const [grid, setGrid] = useState<WolfGoldGrid>(blankGrid())
  const [spinning, setSpinning] = useState(false)
  const [stoppedReels, setStoppedReels] = useState(COLS)
  const [lastWin, setLastWin] = useState(0)
  const [estado, setEstado] = useState<WolfGoldSessaoEstado | null>(null)
  const [winLines, setWinLines] = useState<number[]>([])
  const [showCoins, setShowCoins] = useState(false)
  const [status, setStatus] = useState('Pronto para girar')
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }

  const setBalanceFromApi = useCallback((saldo: string) => {
    const n = Number(saldo)
    if (!Number.isNaN(n)) {
      setBalance(n)
      localStorage.setItem('playhub_wolf_gold_balance_mirror', String(n))
    }
  }, [])

  const bumpBet = useCallback(
    (delta: number) => setBet((b) => Math.max(opts.betMin, Math.min(b + delta, opts.betMax))),
    [opts.betMin, opts.betMax],
  )

  const applyResult = useCallback(
    (result: WolfGoldSpinResult, sound: boolean) => {
      setGrid(result.grade)
      setEstado(result.estado)
      setBalanceFromApi(result.saldo)
      const prize = Number(result.premio)
      setLastWin(prize)
      setWinLines(result.detalhes.linhas_vencedoras?.map((w) => w.linha) ?? [])
      if (prize > 0) {
        setShowCoins(true)
        window.setTimeout(() => setShowCoins(false), 2800)
        if (sound) playWinChime()
      }
      if (result.detalhes.free_spins) {
        setStatus(`FREE SPINS! +${result.detalhes.free_spins}`)
        if (sound) playBonusFanfare()
      } else if (result.detalhes.money_respin_inicio) {
        setStatus('MONEY RESPIN!')
        if (sound) playBonusFanfare()
      } else if (result.modo === 'free_spin') {
        setStatus(`Bônus · ${result.estado.free_spins_left} giros`)
      } else if (result.modo === 'money_respin') {
        setStatus(`Respin · ${result.estado.respins_left} restantes`)
      } else {
        setStatus(prize > 0 ? 'Vitória!' : 'Boa sorte na próxima!')
      }
    },
    [setBalanceFromApi],
  )

  const spin = useCallback(async () => {
    if (spinning || !opts.sessaoId) return
  const inBonus = estado?.mode === 'free_spin' || estado?.mode === 'money_respin'
    if (!inBonus && balance < bet) {
      setStatus('Saldo insuficiente')
      return
    }

    setSpinning(true)
    setStoppedReels(0)
    setWinLines([])
    setStatus('Girando…')
    clearTick()

    const stagger = opts.turbo ? REEL_STOP_STAGGER_MS * 0.35 : REEL_STOP_STAGGER_MS
    const tickMs = opts.turbo ? REEL_SPIN_MS * 0.45 : REEL_SPIN_MS
    const sound = opts.soundOn && getWolfGoldSoundEnabled()

    tickRef.current = setInterval(() => {
      setGrid(randomGrid())
      if (sound) playSpinTick()
    }, tickMs)

    try {
      const result = await spinWolfGold(opts.sessaoId, bet)
      for (let i = 0; i < COLS; i++) {
        await new Promise((r) => window.setTimeout(r, stagger))
        setStoppedReels(i + 1)
        setGrid((prev) => {
          const next = prev.map((c) => [...c])
          for (let r = 0; r < ROWS; r++) next[i]![r] = result.grade[i]![r]!
          return next
        })
      }
      clearTick()
      applyResult(result, sound)
    } catch (e) {
      clearTick()
      setStatus(e instanceof Error ? e.message : 'Erro no giro')
    } finally {
      setSpinning(false)
      setStoppedReels(COLS)
    }
  }, [applyResult, balance, bet, estado?.mode, opts.sessaoId, opts.soundOn, opts.turbo, spinning])

  return {
    balance,
    balanceLabel: formatCredits(balance),
    bet,
    betLabel: formatCredits(bet),
    grid,
    spinning,
    stoppedReels,
    lastWin,
    lastWinLabel: formatCredits(lastWin),
    estado,
    winLines,
    showCoins,
    status,
    bumpBet,
    setBet,
    spin,
    setBalanceFromApi,
  }
}
