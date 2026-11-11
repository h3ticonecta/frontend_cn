import type { Game } from '../types/playhub'
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

  const openGame = () => {
    if (game.play?.kind === 'roleta') {
      window.location.hash = game.play.client_route || '#/roleta'
    }
  }

  return (
    <article className="game-card">
      <button
        type="button"
        className="game-card__hit"
        aria-label={`Jogar ${game.title}`}
        onClick={openGame}
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
          <span className="game-card__play">▶ Jogar</span>
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
