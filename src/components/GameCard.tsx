import type { Game } from '../types/playhub'
import { fortuneGemsHash, roletaHashForGame, slotHashForGame } from '../hooks/useHashRoute'
import './GameCard.css'

const BADGE_LABEL: Record<NonNullable<Game['badge']>, string> = {
  novo: 'Novo',
  hot: 'Hot',
  jackpot: 'Jackpot',
}

type Props = {
  game: Game
}

export function GameCard({ game }: Props) {
  const [from, to] = game.gradient
  const isSlotFallback = game.id === 'fortune-gems' || game.id === 'wolf-gold'
  const playable = game.play?.kind === 'roleta' || game.play?.kind === 'slot' || isSlotFallback

  const openGame = () => {
    if (game.play?.kind === 'roleta') {
      window.location.hash = roletaHashForGame(game.play, game.id)
      return
    }
    if (game.play?.kind === 'slot') {
      window.location.hash = slotHashForGame(game.play, game.id)
      return
    }
    if (game.id === 'fortune-gems') window.location.hash = fortuneGemsHash(game.id)
    if (game.id === 'wolf-gold') window.location.hash = '#/wolf-gold?game=wolf-gold'
  }

  return (
    <article className="game-card">
      <button
        type="button"
        className={`game-card__hit${playable ? '' : ' game-card__hit--static'}`}
        aria-label={playable ? `Jogar ${game.title}` : `${game.title} (em breve)`}
        onClick={openGame}
        disabled={!playable}
      >
        <div
          className="game-card__thumb"
          style={{
            background: `linear-gradient(145deg, ${from}, ${to})`,
          }}
        >
          <span className="game-card__icon" aria-hidden>
            {game.icon}
          </span>
          {game.badge && (
            <span className={`game-card__badge game-card__badge--${game.badge}`}>
              {BADGE_LABEL[game.badge]}
            </span>
          )}
          <span className="game-card__play">{playable ? '▶ Jogar' : 'Em breve'}</span>
        </div>
        <div className="game-card__meta">
          <h3 className="game-card__title">{game.title}</h3>
          <p className="game-card__provider">{game.provider}</p>
          {game.rtp && <span className="game-card__rtp">RTP {game.rtp}</span>}
        </div>
      </button>
    </article>
  )
}
