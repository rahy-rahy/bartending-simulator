import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useBarStore, type ServeOutcome } from '../../store/barStore'
import { INGREDIENT_MAP, canonicalId } from '../../data/ingredients'
import { GLASS_MAP } from '../../data/glasses'
import { GARNISH_MAP } from '../../data/garnishes'
import { ICE_LABELS, METHOD_LABELS } from '../../data/recipes'
import { formatAmount } from '../../lib/units'
import { aggregate } from '../../lib/pouring'
import { amountWithinTolerance } from '../../lib/scoring'
import { ScoreBreakdown, ScoreRing } from '../ui/ScoreBreakdown'
import { RecipeSpec } from '../ui/RecipeSpec'
import { RecipeImage } from '../ui/RecipeImage'

interface Props {
  outcome: ServeOutcome
  overPoured: string[]
  onRetry: () => void
  onNext?: () => void
  nextLabel?: string
}

function ServedSummary({ outcome }: { outcome: ServeOutcome }) {
  const d = outcome.drink
  const totals = aggregate(d.contents)
  return (
    <div className="rounded-lg border border-brass-600/30 bg-wood-900/60 p-2 text-xs" data-testid="served-summary">
      <div className="font-display text-sm font-bold text-brass-300">What you served</div>
      <ul className="mt-1 space-y-0.5">
        <li className="text-cream-200/80">
          {d.glass ? GLASS_MAP[d.glass].name : 'No glass'} · {METHOD_LABELS[d.method]} · {ICE_LABELS[d.ice]} · Rim: {d.rim}
        </li>
        {[...totals.entries()].map(([id, amount]) => {
          const ing = INGREDIENT_MAP[id]
          return (
            <li key={id} className="flex justify-between gap-2 text-cream-100">
              <span>{ing?.name ?? id}</span>
              <span className="font-mono text-brass-300">{ing ? formatAmount(ing, amount) : amount}</span>
            </li>
          )
        })}
        {totals.size === 0 && <li className="text-cream-200/60">Nothing was poured.</li>}
        {d.garnishes.length > 0 && <li className="text-cream-200/80">Garnish: {d.garnishes.map((g) => GARNISH_MAP[g].name).join(', ')}</li>}
      </ul>
    </div>
  )
}

function Comparison({ outcome }: { outcome: ServeOutcome }) {
  const recipe = outcome.recipe
  if (!recipe) return null
  const got = new Map<string, number>()
  for (const c of outcome.drink.contents) {
    const id = canonicalId(c.id)
    got.set(id, (got.get(id) ?? 0) + c.amount)
  }
  const extras = [...got.keys()].filter((id) => !recipe.ingredients.some((i) => i.id === id))
  return (
    <div className="rounded-lg border border-brass-600/30 bg-wood-900/60 p-2 text-xs" data-testid="comparison">
      <div className="font-display text-sm font-bold text-brass-300">Yours vs. the recipe</div>
      <table className="mt-1 w-full">
        <thead>
          <tr className="text-[10px] uppercase tracking-wide text-brass-400">
            <th className="text-left font-semibold">Ingredient</th>
            <th className="pl-3 text-right font-semibold">Recipe</th>
            <th className="pl-3 text-right font-semibold">You</th>
          </tr>
        </thead>
        <tbody>
          {recipe.ingredients.map((i) => {
            const ing = INGREDIENT_MAP[i.id]
            const actual = got.get(i.id) ?? 0
            const ok = actual > 0 && amountWithinTolerance(i.id, actual, i.amount)
            return (
              <tr key={i.id} className={ok ? 'text-emerald-200' : actual > 0 ? 'text-amber-200' : 'text-rose-300'}>
                <td className="py-0.5 pr-2">{ing.name}</td>
                <td className="whitespace-nowrap py-0.5 pl-3 text-right font-mono">{formatAmount(ing, i.amount)}</td>
                <td className="whitespace-nowrap py-0.5 pl-3 text-right font-mono">{actual > 0 ? formatAmount(ing, actual) : '—'}</td>
              </tr>
            )
          })}
          {extras.map((id) => {
            const ing = INGREDIENT_MAP[id]
            return (
              <tr key={id} className="text-rose-300">
                <td className="py-0.5 pr-2">{ing?.name ?? id} (not in recipe)</td>
                <td className="whitespace-nowrap py-0.5 pl-3 text-right font-mono">—</td>
                <td className="whitespace-nowrap py-0.5 pl-3 text-right font-mono">{ing ? formatAmount(ing, got.get(id) ?? 0) : ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function ServeModal({ outcome, overPoured, onRetry, onNext, nextLabel }: Props) {
  const mode = useBarStore((s) => s.mode)
  const { recipe, result } = outcome
  const title = mode.kind === 'free' ? (recipe ? `That looks like a ${recipe.name}!` : 'Drink served') : mode.kind === 'guided' ? `Guided: ${recipe?.name}` : `Challenge: ${recipe?.name}`
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label="Drink result" data-testid="serve-modal">
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="wood-panel my-4 w-full max-w-3xl rounded-2xl border border-brass-500/50 p-4 shadow-2xl">
        <div className="flex flex-wrap items-center gap-4">
          {result && <ScoreRing total={result.total} />}
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-bold text-cream-100" data-testid="serve-title">
              {title}
            </h2>
            {result && (
              <p className="mt-1 text-sm text-brass-300" data-testid="serve-verdict">
                {result.verdict}
              </p>
            )}
            {mode.kind === 'free' && !recipe && <p className="mt-1 text-sm text-cream-200/80">No recipe in the library matches closely. Keep experimenting, or open the Recipe Library for inspiration.</p>}
            {mode.kind === 'free' && recipe && result && <p className="mt-1 text-xs text-cream-200/70">Scored {result.total}/100 against the {recipe.name} recipe.</p>}
            {overPoured.length > 0 && (
              <p className="mt-1 text-xs text-amber-200" data-testid="serve-overpoured">
                Over-poured steps: {overPoured.length}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-3">
            {result && <ScoreBreakdown result={result} />}
            {!result && <ServedSummary outcome={outcome} />}
          </div>
          <div className="space-y-3">
            {recipe && (
              <div className="rounded-lg border border-brass-600/30 bg-wood-900/60 p-2">
                <div className="flex items-center gap-3">
                  <RecipeImage recipe={recipe} className="h-20 w-20 rounded-md object-cover" eager />
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-brass-400">The real recipe</div>
                    <div className="font-display text-lg font-bold text-cream-100">{recipe.name}</div>
                    <Link to={`/recipes/${recipe.id}`} className="text-xs text-brass-300 underline">
                      Open in library
                    </Link>
                  </div>
                </div>
                <div className="mt-2">
                  <RecipeSpec recipe={recipe} compact />
                </div>
              </div>
            )}
            {recipe && result && <Comparison outcome={outcome} />}
            {recipe && mode.kind === 'free' && <ServedSummary outcome={outcome} />}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onRetry} className="btn-secondary" data-testid="btn-retry">
            {mode.kind === 'free' ? 'Keep practising' : 'Try again'}
          </button>
          {onNext && (
            <button type="button" onClick={onNext} className="btn-primary" data-testid="btn-next">
              {nextLabel ?? 'Next'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
