import { symbolById, type FortuneSymbolId } from '../../lib/fortuneGemsSymbols'

type Props = {
  center: FortuneSymbolId
  top?: FortuneSymbolId
  bottom?: FortuneSymbolId
  spinning?: boolean
}

function ReelGlyph({ id, size }: { id: FortuneSymbolId; size: 'lg' | 'sm' }) {
  if (id === '7') {
    return (
      <span
        className={`fg-reel__seven fg-reel__seven--${size}`}
        aria-hidden
      >
        7
      </span>
    )
  }
  const sym = symbolById(id)
  return (
    <span className={`fg-reel__emoji fg-reel__emoji--${size}`} aria-hidden>
      {sym.emoji}
    </span>
  )
}

export function FortuneGemsReel({ center, top = 'lemon', bottom = 'grape', spinning }: Props) {
  return (
    <div className="fg-reel">
      <div className={`fg-reel__ghost ${spinning ? 'fg-reel__ghost--blur' : ''}`}>
        <ReelGlyph id={top} size="sm" />
      </div>
      <div className="fg-reel__center">
        <ReelGlyph id={center} size="lg" />
      </div>
      <div className={`fg-reel__ghost ${spinning ? 'fg-reel__ghost--blur' : ''}`}>
        <ReelGlyph id={bottom} size="sm" />
      </div>
    </div>
  )
}
