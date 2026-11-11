import { useMemo, useState } from 'react'
import type { Game } from '../types/playhub'
import { GameCard } from './GameCard'
import './GameGrid.css'

type Props = {
  games: Game[]
}

export function GameGrid({ games }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return games
    return games.filter(
      (g) => g.title.toLowerCase().includes(q) || g.provider.toLowerCase().includes(q),
    )
  }, [query, games])

  return (
    <section className="games-section" id="jogos" aria-labelledby="games-heading">
      <div className="games-section__head">
        <div>
          <h2 id="games-heading" className="section-title">
            Jogos online
          </h2>
          <p className="section-sub">
            Escolha entre slots, mesa, crash e dealers ao vivo.
          </p>
        </div>
        <label className="search">
          <span className="visually-hidden">Buscar jogos</span>
          <input
            type="search"
            placeholder="Buscar jogo ou provedor…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="game-grid" role="list">
        {filtered.map((game) => (
          <div key={game.id} role="listitem">
            <GameCard game={game} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="games-empty">
          {games.length === 0
            ? 'Nenhum jogo na API. No backend, rode python manage.py seed_playhub (e seed_roleta).'
            : 'Nenhum jogo encontrado. Tente outra busca.'}
        </p>
      )}
    </section>
  )
}
