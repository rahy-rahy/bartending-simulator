import type { Recipe } from '../../data/types'
import { RecipeImage } from '../ui/RecipeImage'
import { DifficultyBadge } from '../ui/RecipeSpec'
import { useProgressStore } from '../../store/progressStore'

export function ChallengePanel({ recipe }: { recipe: Recipe }) {
  const progress = useProgressStore((s) => s.recipes[recipe.id])
  const streak = useProgressStore((s) => s.streak)
  return (
    <div className="space-y-2" data-testid="challenge-panel">
      <div className="rounded-lg border border-brass-600/30 bg-wood-900/60 p-3">
        <div className="text-[10px] uppercase tracking-wide text-brass-400">Challenge — make this drink from memory</div>
        <h2 className="font-display text-2xl font-bold text-cream-100" data-testid="challenge-title">
          {recipe.name}
        </h2>
        <div className="mt-1 flex items-center gap-2 text-xs text-cream-200/70">
          <DifficultyBadge difficulty={recipe.difficulty} />
          {progress && <span>Best {progress.best}/100</span>}
          {streak > 0 && <span>Streak {streak}</span>}
        </div>
        <RecipeImage recipe={recipe} className="mt-2 aspect-square w-full rounded-lg object-cover" eager />
        <p className="mt-2 text-xs text-cream-200/70">No instructions. Choose the glass, ice, bottles, amounts, technique, rim and garnish yourself, then press Serve.</p>
      </div>
    </div>
  )
}
