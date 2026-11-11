import { useMemo, useState } from 'react'
import {
  GAMES,
  NEW_IDS,
  POPULAR_IDS,
  type GameCategory,
} from '../data/games'
import { CategoryTabs } from './CategoryTabs'
import { GameCard } from './GameCard'
import './GameGrid.css'

export function GameGrid() {
  const [category, setCategory] = useState<GameCategory>('populares')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = GAMES

    if (category === 'populares') {
      list = list.filter((g) => POPULAR_IDS.includes(g.id))
    } else if (category === 'novos') {
      list = list.filter((g) => NEW_IDS.includes(g.id) || g.badge === 'novo')
    } else if (category !== 'todos') {
      list = list.filter((g) => g.category === category)
    }

    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.provider.toLowerCase().includes(q),
      )
    }

    return list
  }, [category, query])

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

      <CategoryTabs active={category} onChange={setCategory} />

      <div className="game-grid" role="list">
        {filtered.map((game) => (
          <div key={game.id} role="listitem">
            <GameCard game={game} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="games-empty">Nenhum jogo encontrado. Tente outra busca.</p>
      )}
    </section>
  )
}
