import { Link } from 'react-router-dom'
import { RECIPE_MAP } from '../data/recipes'
import type { Difficulty } from '../data/types'
import { masteredByDifficulty, useProgressStore } from '../store/progressStore'
import { DifficultyBadge } from '../components/ui/RecipeSpec'

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-wood-900">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export function ProgressPage() {
  const recipes = useProgressStore((s) => s.recipes)
  const streak = useProgressStore((s) => s.streak)
  const bestStreak = useProgressStore((s) => s.bestStreak)
  const challenges = useProgressStore((s) => s.challenges)
  const passed = useProgressStore((s) => s.passed)
  const history = useProgressStore((s) => s.history)
  const reset = useProgressStore((s) => s.reset)
  const stats = masteredByDifficulty(recipes)
  const totalMastered = Object.values(stats).reduce((a, s) => a + s.mastered, 0)
  const total = Object.values(stats).reduce((a, s) => a + s.total, 0)
  const colors: Record<Difficulty, string> = { easy: '#4ade80', medium: '#fbbf24', hard: '#fb7185' }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8" data-testid="progress-page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-cream-100">Your Progress</h1>
          <p className="text-sm text-cream-200/70">Saved locally in this browser.</p>
        </div>
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={() => {
            if (window.confirm('Clear all saved progress?')) reset()
          }}
          data-testid="btn-reset-progress"
        >
          Reset progress
        </button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Mastered" value={`${totalMastered} / ${total}`} testId="stat-mastered" />
        <Stat label="Challenges" value={`${challenges}`} testId="stat-challenges" />
        <Stat label="Passed (70+)" value={`${passed}`} testId="stat-passed" />
        <Stat label="Streak / best" value={`${streak} / ${bestStreak}`} testId="stat-streak" />
      </div>
      <div className="wood-panel mt-5 rounded-xl border border-brass-600/30 p-4">
        <h2 className="font-display text-lg font-bold text-brass-300">Mastered by difficulty</h2>
        <p className="text-xs text-cream-200/60">A cocktail counts as mastered once you score 90 or more.</p>
        <div className="mt-3 space-y-3">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <div key={d} data-testid={`progress-${d}`}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-cream-100">
                  <DifficultyBadge difficulty={d} /> {stats[d].attempted} attempted
                </span>
                <span className="font-mono text-brass-300">
                  {stats[d].mastered} / {stats[d].total}
                </span>
              </div>
              <Bar value={stats[d].mastered} max={stats[d].total} color={colors[d]} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-brass-600/30 bg-wood-900/50 p-4">
        <h2 className="font-display text-lg font-bold text-brass-300">Recent results</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-cream-200/60">
            Nothing yet. <Link to="/challenge" className="text-brass-300 underline">Start a challenge</Link> or make a recipe with guidance.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-brass-600/20" data-testid="history-list">
            {history.slice(0, 20).map((h, i) => {
              const r = RECIPE_MAP[h.recipeId]
              return (
                <li key={`${h.at}-${i}`} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                  <span className="flex items-center gap-2">
                    <Link to={`/recipes/${h.recipeId}`} className="text-cream-100 hover:underline">
                      {r?.name ?? h.recipeId}
                    </Link>
                    <span className="text-[10px] uppercase tracking-wide text-cream-200/50">{h.mode}</span>
                  </span>
                  <span className={`font-mono ${h.score >= 90 ? 'text-emerald-300' : h.score >= 70 ? 'text-amber-300' : 'text-rose-300'}`}>{h.score}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="mt-5 rounded-xl border border-brass-600/30 bg-wood-900/50 p-4">
        <h2 className="font-display text-lg font-bold text-brass-300">Cocktails you have tried</h2>
        {Object.keys(recipes).length === 0 ? (
          <p className="mt-2 text-sm text-cream-200/60">None yet.</p>
        ) : (
          <ul className="mt-2 grid gap-1 sm:grid-cols-2" data-testid="tried-list">
            {Object.entries(recipes)
              .sort((a, b) => b[1].best - a[1].best)
              .map(([id, p]) => (
                <li key={id} className="flex items-center justify-between gap-2 rounded-md bg-wood-900/60 px-2 py-1 text-sm">
                  <Link to={`/recipes/${id}`} className="truncate text-cream-100 hover:underline">
                    {RECIPE_MAP[id]?.name ?? id}
                  </Link>
                  <span className="shrink-0 text-xs text-cream-200/70">
                    best <span className={`font-mono ${p.mastered ? 'text-emerald-300' : 'text-brass-300'}`}>{p.best}</span> · {p.attempts}x
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div className="wood-panel rounded-xl border border-brass-600/30 p-3" data-testid={testId}>
      <div className="text-[10px] uppercase tracking-wide text-brass-400">{label}</div>
      <div className="font-display text-2xl font-bold text-cream-100">{value}</div>
    </div>
  )
}
