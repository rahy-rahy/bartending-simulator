import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BASE_LABELS, METHOD_LABELS, RECIPES } from '../data/recipes'
import { GLASSES } from '../data/glasses'
import type { BaseSpirit, Difficulty, GlassType, Method } from '../data/types'
import { RecipeImage } from '../components/ui/RecipeImage'
import { DifficultyBadge } from '../components/ui/RecipeSpec'
import { useProgressStore } from '../store/progressStore'

const BASES = Object.keys(BASE_LABELS) as BaseSpirit[]
const METHODS = Object.keys(METHOD_LABELS) as Method[]

function Select<T extends string>({ label, value, onChange, options, testId }: { label: string; value: T | ''; onChange: (v: T | '') => void; options: { value: T; label: string }[]; testId: string }) {
  return (
    <label className="flex flex-col text-[10px] uppercase tracking-wide text-brass-400">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value as T | '')} className="mt-0.5 rounded-md border border-brass-600/40 bg-wood-800 px-2 py-1.5 text-sm normal-case tracking-normal text-cream-100" data-testid={testId}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function RecipesPage() {
  const [query, setQuery] = useState('')
  const [base, setBase] = useState<BaseSpirit | ''>('')
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('')
  const [method, setMethod] = useState<Method | ''>('')
  const [glass, setGlass] = useState<GlassType | ''>('')
  const progress = useProgressStore((s) => s.recipes)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return RECIPES.filter(
      (r) =>
        (!q || r.name.toLowerCase().includes(q) || r.tags.some((t) => t.includes(q))) &&
        (!base || r.base === base) &&
        (!difficulty || r.difficulty === difficulty) &&
        (!method || r.method === method) &&
        (!glass || r.glass === glass),
    ).sort((a, b) => a.name.localeCompare(b.name))
  }, [query, base, difficulty, method, glass])

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4" data-testid="recipes-page">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-cream-100">Recipe Library</h1>
          <p className="text-sm text-cream-200/70">
            {RECIPES.length} cocktails. Showing {results.length}.
          </p>
        </div>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name…" className="w-full rounded-md border border-brass-600/40 bg-wood-800 px-3 py-2 text-sm text-cream-100 placeholder:text-cream-200/40 sm:w-72" data-testid="recipe-search" aria-label="Search recipes" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Select label="Base spirit" value={base} onChange={setBase} options={BASES.map((b) => ({ value: b, label: BASE_LABELS[b] }))} testId="filter-base" />
        <Select label="Difficulty" value={difficulty} onChange={setDifficulty} options={(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => ({ value: d, label: d }))} testId="filter-difficulty" />
        <Select label="Method" value={method} onChange={setMethod} options={METHODS.map((m) => ({ value: m, label: METHOD_LABELS[m] }))} testId="filter-method" />
        <Select label="Glass" value={glass} onChange={setGlass} options={GLASSES.map((g) => ({ value: g.id, label: g.name }))} testId="filter-glass" />
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" data-testid="recipe-grid">
        {results.map((r) => {
          const p = progress[r.id]
          return (
            <li key={r.id}>
              <Link to={`/recipes/${r.id}`} className="wood-panel block h-full overflow-hidden rounded-xl border border-brass-600/30 transition hover:border-brass-400" data-testid={`recipe-card-${r.id}`}>
                <div className="relative aspect-square overflow-hidden bg-wood-900">
                  <RecipeImage recipe={r} className="h-full w-full object-cover" />
                  {p?.mastered && <span className="absolute left-2 top-2 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Mastered</span>}
                </div>
                <div className="p-2">
                  <div className="flex items-start justify-between gap-1">
                    <h2 className="font-display text-sm font-bold leading-tight text-cream-100">{r.name}</h2>
                    <DifficultyBadge difficulty={r.difficulty} />
                  </div>
                  <div className="mt-1 text-[11px] text-cream-200/60">
                    {BASE_LABELS[r.base]} · {METHOD_LABELS[r.method]}
                    {p ? ` · best ${p.best}` : ''}
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
      {results.length === 0 && <p className="mt-8 text-center text-cream-200/60">No cocktails match those filters.</p>}
    </div>
  )
}
