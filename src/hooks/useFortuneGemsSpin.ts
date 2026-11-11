import { useCallback, useRef, useState } from 'react'
import { spinFortuneGems } from '../api/fortuneGems'
import {
  formatMoney,
  randomFortuneSymbol,
  type FortuneSymbolId,
} from '../lib/fortuneGemsSymbols'

const TICK_MS = 80
const SPIN_TICKS_MIN = 12

export type MachineStatusTone = 'ready' | 'spinning' | 'win' | 'lose'

function parseReels(raw: [string, string, string]): [FortuneSymbolId, FortuneSymbolId, FortuneSymbolId] {
  const toId = (s: string): FortuneSymbolId => {
    const allowed: FortuneSymbolId[] = ['7', 'gem', 'bell', 'melon', 'cherry', 'lemon', 'grape']
    return allowed.includes(s as FortuneSymbolId) ? (s as FortuneSymbolId) : 'cherry'
  }
  return [toId(raw[0]), toId(raw[1]), toId(raw[2])]
}

type Options = {
  sessaoId: string | null
  betMin: number
  betMax: number
  initialBalance: number
  initialBet: number
}

export function useFortuneGemsSpin({
  sessaoId,
  betMin,
  betMax,
  initialBalance,
  initialBet,
}: Options) {
  const [balance, setBalance] = useState(initialBalance)
  const [currentBet, setCurrentBet] = useState(initialBet)
  const [reels, setReels] = useState<[FortuneSymbolId, FortuneSymbolId, FortuneSymbolId]>([
    '7',
    '7',
    '7',
  ])
  const [isSpinning, setIsSpinning] = useState(false)
  const [lastWin, setLastWin] = useState(0)
  const [statusText, setStatusText] = useState('PRONTO PARA GIRAR')
  const [statusTone, setStatusTone] = useState<MachineStatusTone>('ready')
  const [leverActive, setLeverActive] = useState(false)
  const [showCoinRain, setShowCoinRain] = useState(false)
  const [lastResult, setLastResult] = useState<{
    reels: [FortuneSymbolId, FortuneSymbolId, FortuneSymbolId]
    won: boolean
    prize: number
    bet: number
    spinId: number
  } | null>(null)
  const spinSeq = useRef(10_492)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pendingResult = useRef<Awaited<ReturnType<typeof spinFortuneGems>> | null>(null)

  const clearSpinInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const setBalanceFromApi = useCallback((saldo: string) => {
    const n = Number(saldo)
    if (!Number.isNaN(n)) setBalance(n)
  }, [])

  const updateBet = useCallback(
    (amount: number) => {
      setCurrentBet(Math.max(betMin, Math.min(amount, betMax)))
    },
    [betMin, betMax],
  )

  const bumpBet = useCallback(
    (delta: number) => {
      setCurrentBet((b) => Math.max(betMin, Math.min(b + delta, betMax)))
    },
    [betMin, betMax],
  )

  const applyServerResult = useCallback(
    (result: Awaited<ReturnType<typeof spinFortuneGems>>, bet: number) => {
      const finalReels = parseReels(result.carreteis)
      setReels(finalReels)
      setBalanceFromApi(result.saldo)
      const prize = Number(result.premio)
      setLastWin(prize)
      if (result.ganhou) {
        setStatusText('★ MEGA VITÓRIA! ★')
        setStatusTone('win')
        setShowCoinRain(true)
        window.setTimeout(() => setShowCoinRain(false), 3200)
      } else {
        setStatusText('TENTE NOVAMENTE!')
        setStatusTone('lose')
      }
      spinSeq.current += 1
      setLastResult({
        reels: finalReels,
        won: result.ganhou,
        prize,
        bet,
        spinId: result.giro_id || spinSeq.current,
      })
      setIsSpinning(false)
    },
    [setBalanceFromApi],
  )

  const spin = useCallback(async () => {
    if (isSpinning) return
    if (!sessaoId) {
      setStatusText('SESSÃO INDISPONÍVEL')
      setStatusTone('lose')
      return
    }
    if (balance < currentBet) {
      setStatusText('SALDO INSUFICIENTE')
      setStatusTone('lose')
      return
    }

    setIsSpinning(true)
    setStatusText('GIRANDO OS CARRETÉIS...')
    setStatusTone('spinning')
    setLeverActive(true)
    window.setTimeout(() => setLeverActive(false), 600)

    pendingResult.current = null
    const betSnapshot = currentBet

    const apiPromise = spinFortuneGems(sessaoId, betSnapshot)
      .then((r) => {
        pendingResult.current = r
        return r
      })
      .catch((e: Error) => {
        setStatusText(e.message.slice(0, 80).toUpperCase())
        setStatusTone('lose')
        setIsSpinning(false)
        clearSpinInterval()
        throw e
      })

    let counter = 0
    clearSpinInterval()
    intervalRef.current = setInterval(() => {
      setReels([randomFortuneSymbol(), randomFortuneSymbol(), randomFortuneSymbol()])
      counter += 1
      if (counter >= SPIN_TICKS_MIN && pendingResult.current) {
        clearSpinInterval()
        applyServerResult(pendingResult.current, betSnapshot)
      }
    }, TICK_MS)

    try {
      const result = await apiPromise
      if (!intervalRef.current) {
        applyServerResult(result, betSnapshot)
        return
      }
      if (counter >= SPIN_TICKS_MIN) {
        clearSpinInterval()
        applyServerResult(result, betSnapshot)
      }
    } catch {
      /* estado já tratado no catch da promise */
    }
  }, [applyServerResult, balance, currentBet, isSpinning, sessaoId])

  return {
    balance,
    balanceLabel: formatMoney(balance),
    currentBet,
    betLabel: formatMoney(currentBet),
    reels,
    isSpinning,
    lastWin,
    lastWinLabel: formatMoney(lastWin),
    statusText,
    statusTone,
    leverActive,
    showCoinRain,
    lastResult,
    updateBet,
    bumpBet,
    spin,
    setBalanceFromApi,
  }
}
