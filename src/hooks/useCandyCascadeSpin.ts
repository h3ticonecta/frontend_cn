import { useCallback, useState } from 'react'
import { spinCandyCascade, type CandyCascadeSpinOptions } from '../api/candyCascade'
import { formatCredits } from '../lib/candyCascadeSymbols'
import { summarizeCascatas, winningCellsFromCascatas } from '../lib/candyCascadeWins'
import type {
  CandyCascadeGiroResult,
  CandyCascadeSessaoEstado,
} from '../types/candyCascade'

const COLS = 6
const ROWS = 5

function blankGrid(): (string | null)[][] {
  return Array.from({ length: COLS }, () => Array.from({ length: ROWS }, () => null))
}

function blankMults(): (number | null)[][] {
  return Array.from({ length: COLS }, () => Array.from({ length: ROWS }, () => null))
}

export function useCandyCascadeSpin(opts: { sessaoId: string | null }) {
  const [grade, setGrade] = useState(blankGrid)
  const [mults, setMults] = useState(blankMults)
  const [estado, setEstado] = useState<CandyCascadeSessaoEstado | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [lastPremio, setLastPremio] = useState<string | null>(null)
  const [lastCobrado, setLastCobrado] = useState<string | null>(null)
  const [avisoDemo, setAvisoDemo] = useState<string | null>(null)
  const [cascadeLog, setCascadeLog] = useState<string[]>([])
  const [winCells, setWinCells] = useState<Set<string>>(new Set())
  const [status, setStatus] = useState('Pronto para girar')

  const applyResult = useCallback((result: CandyCascadeGiroResult) => {
    setGrade(result.grade)
    setMults(result.multiplicadores)
    setEstado(result.estado)
    setLastPremio(result.premio)
    setLastCobrado(result.aposta_cobrada)
    setAvisoDemo(result.aviso_demo)
    setCascadeLog(summarizeCascatas(result.cascatas))
    setWinCells(winningCellsFromCascatas(result.cascatas))

    const p = Number(result.premio)
    if (p > 0) setStatus(`Vitória! +${formatCredits(p)}`)
    else if (result.estado.mode === 'free_spin') {
      setStatus(`Free spins · ${result.estado.free_spins_left} restantes`)
    } else setStatus('Sem ganho neste giro')
  }, [])

  const spin = useCallback(
    async (aposta: string, options: CandyCascadeSpinOptions = {}) => {
      if (spinning || !opts.sessaoId) return
      setSpinning(true)
      setWinCells(new Set())
      setCascadeLog([])
      setStatus('Girando…')
      try {
        const result = await spinCandyCascade(opts.sessaoId, aposta, options)
        applyResult(result)
        return result
      } finally {
        setSpinning(false)
      }
    },
    [applyResult, opts.sessaoId, spinning],
  )

  const setEstadoFromSession = useCallback((estadoIn: CandyCascadeSessaoEstado) => {
    setEstado(estadoIn)
    if (estadoIn.mode === 'free_spin' && estadoIn.free_spins_left > 0) {
      setStatus(`Free spins · ${estadoIn.free_spins_left} restantes`)
    }
  }, [])

  return {
    grade,
    mults,
    estado,
    spinning,
    lastPremio,
    lastCobrado,
    avisoDemo,
    cascadeLog,
    winCells,
    status,
    spin,
    setEstadoFromSession,
    applyResult,
  }
}