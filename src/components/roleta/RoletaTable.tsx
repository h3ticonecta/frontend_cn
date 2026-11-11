import { ROULETTE_COLUMNS, corDoNumero } from '../../lib/roletaLayout'
import './RoletaTable.css'

type Props = {
  vermelhos: number[]
  selectedStraight?: number | null
  onStraight: (n: number) => void
}

export function RoletaTable({ vermelhos, selectedStraight, onStraight }: Props) {
  return (
    <div className="roleta-table" role="group" aria-label="Mesa de apostas — números">
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
        {ROULETTE_COLUMNS.map((row) => (
          <div key={row.join('-')} className="roleta-table__row">
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
