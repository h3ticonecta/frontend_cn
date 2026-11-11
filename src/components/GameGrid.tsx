import { useMemo, useState } from 'react'
import type { CategoryTab, Game, GameCategory } from '../types/playhub'
import { CategoryTabs } from './CategoryTabs'
import { GameCard } from './GameCard'
import './GameGrid.css'

type Props = {
  games: Game[]
  categories: CategoryTab[]
  popularIds: string[]
  newIds: string[]
}

export function GameGrid({ games, categories, popularIds, newIds }: Props) {
  const [category, setCategory] = useState<GameCategory>(
    popularIds.length > 0 ? 'populares' : 'todos',
  )
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = games

    if (category === 'populares') {
      list = list.filter((g) => popularIds.includes(g.id))
    } else if (category === 'novos') {
      list = list.filter((g) => newIds.includes(g.id) || g.badge === 'novo')
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
  }, [category, query, games, popularIds, newIds])

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

      <CategoryTabs
        categories={categories}
        active={category}
        onChange={setCategory}
      />

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
            : 'Nenhum jogo encontrado. Tente outra categoria ou busca.'}
        </p>
      )}
    </section>
  )
}
