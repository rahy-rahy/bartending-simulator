import type { Recipe } from '../../data/types'
import { INGREDIENT_MAP } from '../../data/ingredients'
import { GLASS_MAP } from '../../data/glasses'
import { GARNISH_MAP } from '../../data/garnishes'
import { ICE_LABELS, METHOD_LABELS } from '../../data/recipes'
import { formatAmount } from '../../lib/units'

export function DifficultyBadge({ difficulty }: { difficulty: Recipe['difficulty'] }) {
  const cls = difficulty === 'easy' ? 'bg-emerald-700/60 text-emerald-100' : difficulty === 'medium' ? 'bg-amber-700/60 text-amber-100' : 'bg-rose-800/60 text-rose-100'
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}>{difficulty}</span>
}

/** Full specification of a recipe: ingredients with ml and oz, method, glass, ice, rim and garnish. */
export function RecipeSpec({ recipe, compact }: { recipe: Recipe; compact?: boolean }) {
  return (
    <div className={compact ? 'text-xs' : 'text-sm'} data-testid="recipe-spec">
      <ul className="divide-y divide-brass-600/20">
        {recipe.ingredients.map((i) => {
          const ing = INGREDIENT_MAP[i.id]
          return (
            <li key={i.id} className="flex items-center justify-between gap-3 py-1" data-testid={`spec-${i.id}`}>
              <span className="flex items-center gap-2 text-cream-100">
                <span className="inline-block h-3 w-3 rounded-full border border-white/30" style={{ background: ing.color }} />
                {ing.name}
                {i.note && <span className="text-[11px] text-cream-200/60">({i.note})</span>}
              </span>
              <span className="whitespace-nowrap font-mono text-brass-300">{formatAmount(ing, i.amount)}</span>
            </li>
          )
        })}
      </ul>
      <dl className={`mt-2 grid gap-x-3 gap-y-1 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
        <Row label="Glass" value={GLASS_MAP[recipe.glass].name} />
        <Row label="Method" value={`${METHOD_LABELS[recipe.method]}${recipe.muddle ? ' (muddle first)' : ''}`} />
        <Row label="Ice" value={ICE_LABELS[recipe.ice]} />
        <Row label="Rim" value={recipe.rim === 'none' ? 'None' : recipe.rim === 'salt' ? 'Salt' : 'Sugar'} />
        <Row label="Garnish" value={recipe.garnish.length ? recipe.garnish.map((g) => GARNISH_MAP[g].name).join(', ') : 'None'} />
      </dl>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-brass-400">{label}</dt>
      <dd className="text-cream-100">{value}</dd>
    </div>
  )
}
