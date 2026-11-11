import { WOLF_SYMBOL_EMOJI, asWolfSymbol } from '../../lib/wolfGoldSymbols'
import type { WolfGoldGrid } from '../../types/wolfGold'
import './WolfGoldReels.css'

type Props = {
  grid: WolfGoldGrid
  spinning: boolean
  stoppedReels: number
  winLines: number[]
  moneyValues: (string | null)[] | null | undefined
  freeSpin: boolean
}

export function WolfGoldReels({ grid, spinning, stoppedReels, winLines, moneyValues, freeSpin }: Props) {
  return (
    <div className={`wg-reels${freeSpin ? ' wg-reels--bonus' : ''}`}>
      <div className="wg-reels__frame">
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
              const winGlow = winLines.length > 0 && !spinning
              return (
                <div
                  key={`${ci}-${ri}`}
                  className={`wg-cell wg-cell--${sym}${winGlow ? ' wg-cell--glow' : ''}${money ? ' wg-cell--money' : ''}`}
                >
                  <span className="wg-cell__glyph" aria-hidden>
                    {WOLF_SYMBOL_EMOJI[sym]}
                  </span>
                  {money && <span className="wg-cell__money-val">{money}</span>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {winLines.length > 0 && !spinning && (
        <p className="wg-reels__win-banner">
          {winLines.length} linha{winLines.length > 1 ? 's' : ''} premiada
          {winLines.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
