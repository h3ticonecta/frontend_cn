import { useMemo } from 'react'
import { WOLF_SYMBOL_EMOJI, asWolfSymbol } from '../../lib/wolfGoldSymbols'
import {
  formatWinLinesBanner,
  paylinePolylinePoints,
  winningCellMap,
  type WolfGoldWinLine,
} from '../../lib/wolfGoldWinLines'
import type { WolfGoldGrid } from '../../types/wolfGold'
import './WolfGoldReels.css'

const LINE_STROKES = ['#fbbf24', '#34d399', '#f472b6', '#60a5fa', '#fb923c']

type Props = {
  grid: WolfGoldGrid
  spinning: boolean
  stoppedReels: number
  winLines: WolfGoldWinLine[]
  moneyValues: (string | null)[] | null | undefined
  freeSpin: boolean
}

export function WolfGoldReels({ grid, spinning, stoppedReels, winLines, moneyValues, freeSpin }: Props) {
  const showWin = winLines.length > 0 && !spinning
  const winCells = useMemo(() => winningCellMap(winLines), [winLines])
  const banner = formatWinLinesBanner(winLines)

  return (
    <div className={`wg-reels${freeSpin ? ' wg-reels--bonus' : ''}`}>
      <div className="wg-reels__frame">
        {showWin && (
          <svg className="wg-reels__paylines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {winLines.map((line, i) => (
              <polyline
                key={line.linha}
                points={paylinePolylinePoints(line)}
                className="wg-reels__payline"
                stroke={LINE_STROKES[i % LINE_STROKES.length]}
              />
            ))}
          </svg>
        )}
        {grid.map((col, ci) => (
          <div
            key={ci}
            className={`wg-reel${spinning && ci >= stoppedReels ? ' wg-reel--blur' : ''}${
              freeSpin && ci >= 1 && ci <= 3 ? ' wg-reel--giant' : ''
            }`}
          >
            {col.map((cell, ri) => {
              const sym = asWolfSymbol(cell)
              const idx = ri * 5 + ci
              const money = moneyValues?.[idx]
              const key = `${ci}-${ri}`
              const onWin = showWin && winCells.has(key)
              return (
                <div
                  key={`${ci}-${ri}`}
                  className={`wg-cell wg-cell--${sym}${onWin ? ' wg-cell--win' : ''}${money ? ' wg-cell--money' : ''}`}
                >
                  <span className="wg-cell__glyph" aria-hidden>
                    {WOLF_SYMBOL_EMOJI[sym]}
                  </span>
                  {money && <span className="wg-cell__money-val">{money}</span>}
                  {onWin && (
                    <span className="wg-cell__win-mark" aria-hidden>
                      ✓
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {banner && <p className="wg-reels__win-banner">{banner}</p>}
    </div>
  )
}