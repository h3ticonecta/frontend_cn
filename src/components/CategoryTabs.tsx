import type { GameCategory } from '../data/games'
import { CATEGORIES } from '../data/games'
import './CategoryTabs.css'

type Props = {
  active: GameCategory
  onChange: (id: GameCategory) => void
}

export function CategoryTabs({ active, onChange }: Props) {
  return (
    <div
      className="category-tabs"
      role="tablist"
      aria-label="Categorias de jogos"
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          role="tab"
          aria-selected={active === cat.id}
          className={`category-tabs__item${active === cat.id ? ' category-tabs__item--active' : ''}`}
          onClick={() => onChange(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
