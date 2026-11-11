import { useMemo } from 'react'
import { ROULETTE_COLUMNS, corDoNumero } from '../../lib/roletaLayout'
import './RoletaTable.css'

type Props = {
  vermelhos: number[]
  selectedStraight?: number | null
  onStraight: (n: number) => void
}

/** 3 linhas × 12 colunas (mesa europeia horizontal: 1–36). */
function buildHorizontalRows(): number[][] {
  return [
    ROULETTE_COLUMNS.map((col) => col[2]),
    ROULETTE_COLUMNS.map((col) => col[1]),
    ROULETTE_COLUMNS.map((col) => col[0]),
  ]
}

export function RoletaTable({ vermelhos, selectedStraight, onStraight }: Props) {
  const rows = useMemo(() => buildHorizontalRows(), [])

  return (
    <div
      className="roleta-table roleta-table--horizontal"
      role="group"
      aria-label="Mesa de apostas — números"
    >
      <button
        type="button"
        className={`roleta-table__cell roleta-table__cell--zero${
          selectedStraight === 0 ? ' roleta-table__cell--selected' : ''
        }`}
        onClick={() => onStraight(0)}
      >
        0
      </button>
      <div className="roleta-table__nums">
        {rows.map((row, ri) => (
          <div key={ri} className="roleta-table__row">
            {row.map((n) => {
              const cor = corDoNumero(n, vermelhos)
              return (
                <button
                  key={n}
                  type="button"
                  className={`roleta-table__cell roleta-table__cell--${cor}${
                    selectedStraight === n ? ' roleta-table__cell--selected' : ''
                  }`}
                  onClick={() => onStraight(n)}
                  aria-label={`Apostar no número ${n}`}
                >
                  {n}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
