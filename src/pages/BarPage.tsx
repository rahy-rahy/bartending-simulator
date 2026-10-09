import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useBarStore, snapshotForGuided } from '../store/barStore'
import { pickChallenge, useProgressStore } from '../store/progressStore'
import { getRecipe } from '../data/recipes'
import type { Difficulty } from '../data/types'
import { buildGuidedSteps, evaluateGuided } from '../lib/guided'
import { Shelf } from '../components/bar/Shelf'
import { Counter } from '../components/bar/Counter'
import { ContentsPanel } from '../components/bar/ContentsPanel'
import { GuidedPanel } from '../components/bar/GuidedPanel'
import { ChallengePanel } from '../components/bar/ChallengePanel'
import { ServeModal } from '../components/bar/ServeModal'
import { DragLayer } from '../components/bar/DragLayer'
import { PourEngine } from '../components/bar/PourEngine'
import { GuidedTargetContext } from '../components/bar/guidedContext'
import { Toast } from '../components/ui/Toast'

type Kind = 'free' | 'guided' | 'challenge'

const DIFFICULTIES = new Set(['easy', 'medium', 'hard', 'any'])

export function BarPage({ kind }: { kind: Kind }) {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const difficultyParam = params.get('difficulty')
  const difficulty = (difficultyParam && DIFFICULTIES.has(difficultyParam) ? difficultyParam : 'any') as Difficulty | 'any'
  const recipe = kind !== 'free' && id ? getRecipe(id) : undefined

  const setMode = useBarStore((s) => s.setMode)
  const resetBar = useBarStore((s) => s.resetBar)
  const served = useBarStore((s) => s.served)
  const glass = useBarStore((s) => s.glass)
  const shaker = useBarStore((s) => s.shaker)
  const mixing = useBarStore((s) => s.mixing)
  const blender = useBarStore((s) => s.blender)
  const animation = useBarStore((s) => s.animation)
  const recordResult = useProgressStore((s) => s.recordResult)
  const progressRecipes = useProgressStore((s) => s.recipes)

  useEffect(() => {
    resetBar()
    if (kind === 'free') setMode({ kind: 'free' })
    else if (recipe && kind === 'guided') setMode({ kind: 'guided', recipeId: recipe.id })
    else if (recipe) setMode({ kind: 'challenge', recipeId: recipe.id, difficulty })
  }, [kind, recipe, difficulty, resetBar, setMode])

  const steps = useMemo(() => (kind === 'guided' && recipe ? buildGuidedSteps(recipe) : []), [kind, recipe])
  const snapshot = useMemo(() => snapshotForGuided({ glass, shaker, mixing, blender, served }), [glass, shaker, mixing, blender, served])
  const progress = useMemo(() => evaluateGuided(steps, snapshot), [steps, snapshot])
  const target = kind === 'guided' && !served ? (steps[progress.current]?.target ?? null) : null

  const onServe = () => {
    const outcome = useBarStore.getState().serve()
    if (outcome?.result && outcome.recipe && kind !== 'free') recordResult(outcome.recipe.id, outcome.result.total, kind)
  }

  const onRetry = () => resetBar()
  const onNext = () => {
    if (kind === 'challenge') {
      const next = pickChallenge(difficulty, progressRecipes, recipe?.id)
      resetBar()
      navigate(`/bar/challenge/${next}?difficulty=${difficulty}`)
    } else if (kind === 'guided') {
      resetBar()
      navigate('/recipes')
    } else {
      resetBar()
    }
  }

  if (kind !== 'free' && !recipe) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h1 className="font-display text-2xl text-cream-100">Recipe not found</h1>
        <Link to="/recipes" className="btn-primary mt-4 inline-block">
          Back to the library
        </Link>
      </div>
    )
  }

  const modeLabel = kind === 'free' ? 'Free Bar' : kind === 'guided' ? 'Guided' : 'Challenge'
  const canServe = !!glass && !animation

  return (
    <GuidedTargetContext.Provider value={target}>
      <div className="mx-auto max-w-[1500px] px-2 pb-24 pt-2 sm:px-3 lg:pb-4" data-testid="bar-page" data-mode={kind}>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0 space-y-3">
            <Shelf />
            <Counter />
          </div>
          <aside className="wood-panel min-w-0 rounded-xl border border-brass-600/30 p-2 sm:p-3 lg:sticky lg:top-14 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto" data-testid="side-panel">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-brass-400">Mode</div>
                <div className="font-display text-base font-bold text-cream-100" data-testid="mode-label">
                  {modeLabel}
                </div>
              </div>
              <button type="button" className="btn-primary" onClick={onServe} disabled={!canServe} data-testid="btn-serve">
                Serve
              </button>
            </div>
            {kind === 'guided' && recipe && <GuidedPanel recipe={recipe} steps={steps} progress={progress} />}
            {kind === 'challenge' && recipe && <ChallengePanel recipe={recipe} />}
            <div className="mt-3">
              <div className="mb-1 text-[10px] uppercase tracking-wide text-brass-400">Current contents</div>
              <ContentsPanel />
            </div>
            {kind === 'free' && (
              <p className="mt-3 text-xs text-cream-200/60">
                Drag a bottle over the glass or shaker and hold to pour. Drag ice, garnishes and tools onto the vessels. Drag the glass to the bin to start over. Press Serve to find out what you made.
              </p>
            )}
          </aside>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-brass-600/40 bg-wood-900/95 px-3 py-2 lg:hidden" data-testid="mobile-bar">
          <span className="text-xs text-cream-200/80">{glass ? `${modeLabel} — ${glass.contents.length ? 'drink in progress' : 'empty glass'}` : 'Pick a glass to start'}</span>
          <button type="button" className="btn-primary" onClick={onServe} disabled={!canServe} data-testid="btn-serve-mobile">
            Serve
          </button>
        </div>
        <PourEngine />
        <DragLayer />
        <Toast />
        {served && <ServeModal outcome={served} overPoured={kind === 'guided' ? progress.overPoured : []} onRetry={onRetry} onNext={kind === 'free' ? undefined : onNext} nextLabel={kind === 'challenge' ? 'Next challenge' : 'Pick another recipe'} />}
      </div>
    </GuidedTargetContext.Provider>
  )
}
