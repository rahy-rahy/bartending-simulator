import { Link, useParams } from 'react-router-dom'
import { BASE_LABELS, getRecipe } from '../data/recipes'
import { RecipeImage } from '../components/ui/RecipeImage'
import { DifficultyBadge, RecipeSpec } from '../components/ui/RecipeSpec'
import { useProgressStore } from '../store/progressStore'

export function RecipeDetailPage() {
  const { id } = useParams()
  const recipe = id ? getRecipe(id) : undefined
  const progress = useProgressStore((s) => (id ? s.recipes[id] : undefined))
  if (!recipe) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h1 className="font-display text-2xl text-cream-100">Recipe not found</h1>
        <Link to="/recipes" className="btn-primary mt-4 inline-block">
          Back to the library
        </Link>
      </div>
    )
  }
  return (
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4" data-testid="recipe-detail">
      <Link to="/recipes" className="text-sm text-brass-300 hover:underline">
        ← All recipes
      </Link>
      <div className="mt-3 grid gap-5 md:grid-cols-[340px_1fr]">
        <div>
          <RecipeImage recipe={recipe} className="aspect-square w-full rounded-xl border border-brass-600/30 object-cover" eager />
          <div className="mt-3 flex flex-col gap-2">
            <Link to={`/bar/guided/${recipe.id}`} className="btn-primary text-center" data-testid="btn-guided">
              Make it with guidance
            </Link>
            <Link to={`/bar/challenge/${recipe.id}`} className="btn-secondary text-center" data-testid="btn-challenge-this">
              Challenge me on this one
            </Link>
          </div>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-cream-100">{recipe.name}</h1>
            <DifficultyBadge difficulty={recipe.difficulty} />
            {recipe.iba && <span className="rounded bg-brass-600/40 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brass-300">IBA official</span>}
          </div>
          <div className="mt-1 text-sm text-cream-200/70">{BASE_LABELS[recipe.base]}{progress ? ` · Best score ${progress.best}/100 in ${progress.attempts} attempt${progress.attempts === 1 ? '' : 's'}` : ''}</div>
          <p className="mt-3 text-cream-200/90">{recipe.description}</p>
          <div className="wood-panel mt-4 rounded-xl border border-brass-600/30 p-3">
            <h2 className="font-display text-lg font-bold text-brass-300">Specification</h2>
            <RecipeSpec recipe={recipe} />
          </div>
          <div className="mt-4 rounded-xl border border-brass-600/30 bg-wood-900/50 p-3 text-sm text-cream-200/80">
            <h2 className="font-display text-lg font-bold text-brass-300">Bartender’s notes</h2>
            <p className="mt-1">{methodNote(recipe.method, recipe.ice, !!recipe.muddle, recipe.rim)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function methodNote(method: string, ice: string, muddle: boolean, rim: string): string {
  const parts: string[] = []
  if (rim !== 'none') parts.push(`Rim the glass first: wet the rim on a lime wedge, then dip it in ${rim}.`)
  if (muddle) parts.push('Muddle the solid ingredients gently to release their oils and dissolve the sugar before adding the spirit.')
  switch (method) {
    case 'shake':
      parts.push('Add ice to the shaker, shake hard for 10–12 seconds until the tin frosts, then strain.')
      break
    case 'stir':
      parts.push('Stir with ice in a mixing glass for 20–30 seconds, then strain. Never shake a drink made only of spirits.')
      break
    case 'blend':
      parts.push('Blend with crushed ice until smooth and pour straight into the glass.')
      break
    case 'layer':
      parts.push('Pour each ingredient slowly over the back of a bar spoon so it floats on the one below, heaviest first.')
      break
    default:
      parts.push('Build directly in the glass and stir gently.')
  }
  if (ice === 'none') parts.push('Serve "up" in a chilled glass with no ice.')
  else if (ice === 'crushed') parts.push('Serve over crushed ice.')
  else parts.push('Serve over ice cubes.')
  return parts.join(' ')
}
