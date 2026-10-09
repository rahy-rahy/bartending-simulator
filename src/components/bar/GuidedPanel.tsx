import { useEffect, useRef } from 'react'
import type { Recipe } from '../../data/types'
import type { GuidedProgress, GuidedStep } from '../../lib/guided'
import { RecipeImage } from '../ui/RecipeImage'
import { DifficultyBadge } from '../ui/RecipeSpec'

export function GuidedPanel({ recipe, steps, progress }: { recipe: Recipe; steps: GuidedStep[]; progress: GuidedProgress }) {
  const listRef = useRef<HTMLOListElement>(null)
  const current = progress.current
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-current="true"]')
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [current])
  const done = progress.statuses.filter((s) => s !== 'pending').length
  return (
    <div className="space-y-2" data-testid="guided-panel">
      <div className="flex items-center gap-3 rounded-lg border border-brass-600/30 bg-wood-900/60 p-2">
        <RecipeImage recipe={recipe} className="h-16 w-16 rounded-md object-cover" eager />
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wide text-brass-400">Guided recipe</div>
          <h2 className="truncate font-display text-lg font-bold text-cream-100" data-testid="guided-title">
            {recipe.name}
          </h2>
          <div className="flex items-center gap-2 text-xs text-cream-200/70">
            <DifficultyBadge difficulty={recipe.difficulty} />
            <span data-testid="guided-progress">
              {done} / {steps.length} steps
            </span>
          </div>
        </div>
      </div>
      <ol ref={listRef} className="max-h-[42vh] space-y-1 overflow-y-auto pr-1 scrollbar-thin lg:max-h-[48vh]" data-testid="guided-steps">
        {steps.map((st, i) => {
          const status = progress.statuses[i]
          const current = i === progress.current
          return (
            <li
              key={st.id}
              data-current={current}
              data-testid={`step-${st.id}`}
              data-status={status}
              className={`rounded-md border p-2 text-sm transition ${
                current ? 'guided-step-current border-brass-300 bg-brass-500/20 text-cream-100' : status === 'done' ? 'border-emerald-700/40 bg-emerald-900/20 text-cream-200/70' : status === 'over' ? 'border-amber-500/50 bg-amber-900/30 text-amber-100' : 'border-brass-600/20 bg-wood-900/40 text-cream-200/50'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${status === 'done' ? 'bg-emerald-500 text-wood-900' : status === 'over' ? 'bg-amber-400 text-wood-900' : current ? 'bg-brass-400 text-wood-900' : 'bg-wood-700 text-cream-200/60'}`}>
                  {status === 'done' ? '✓' : status === 'over' ? '!' : i + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold">{st.text}</div>
                  {current && st.detail && <div className="mt-0.5 text-xs text-cream-200/80">{st.detail}</div>}
                  {status === 'over' && <div className="mt-0.5 text-xs">Over-poured by more than 15%. There is no undo — dump the drink in the bin if you want a perfect result.</div>}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
