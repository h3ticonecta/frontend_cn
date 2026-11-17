import { candyEmoji } from '../../lib/candyCascadeSymbols'
import './CandyCascadeGrid.css'

type Props = {
  grade: (string | null)[][]
  multiplicadores: (number | null)[][]
  highlight: Set<string>
  spinning: boolean
}

export function CandyCascadeGrid({ grade, multiplicadores, highlight, spinning }: Props) {
  return (
    <div
      className={`cc-grid${spinning ? ' cc-grid--spin' : ''}`}
      aria-label="Grade 6 por 5"
    >
      {grade.map((col, ci) => (
        <div key={ci} className="cc-grid__col">
          {col.map((sym, ri) => {
            const key = `${ci}-${ri}`
            const win = highlight.has(key)
            const mult = multiplicadores[ci]?.[ri]
            return (
              <div
                key={key}
                className={`cc-grid__cell cc-grid__cell--${sym ?? 'empty'}${win ? ' cc-grid__cell--win' : ''}`}
              >
                <span className="cc-grid__emoji" aria-hidden>
                  {candyEmoji(sym)}
                </span>
                {sym === 'bomb' && mult != null && (
                  <span className="cc-grid__mult">×{mult}</span>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}