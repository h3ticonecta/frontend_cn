import type { CategoryTab, GameCategory } from '../types/playhub'
import './CategoryTabs.css'

type Props = {
  categories: CategoryTab[]
  active: GameCategory
  onChange: (id: GameCategory) => void
}

export function CategoryTabs({ categories, active, onChange }: Props) {
  return (
    <div
      className="category-tabs"
      role="tablist"
      aria-label="Categorias de jogos"
    >
      {categories.map((cat) => (
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
