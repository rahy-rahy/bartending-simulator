import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Difficulty } from '../data/types'
import { RECIPES } from '../data/recipes'
import { masteredByDifficulty, pickChallenge, useProgressStore } from '../store/progressStore'

const OPTIONS: { id: Difficulty | 'any'; title: string; text: string }[] = [
  { id: 'easy', title: 'Easy', text: 'Two to four ingredients built in the glass. Highballs and simple mixes.' },
  { id: 'medium', title: 'Medium', text: 'Shaken and stirred classics, rims and a few more bottles.' },
  { id: 'hard', title: 'Hard', text: 'Tiki monsters, egg whites, muddling, layering and long ingredient lists.' },
  { id: 'any', title: 'Any', text: 'Roll the dice across the whole library.' },
]

export function ChallengePage() {
  const navigate = useNavigate()
  const recipes = useProgressStore((s) => s.recipes)
  const streak = useProgressStore((s) => s.streak)
  const stats = masteredByDifficulty(recipes)
  const start = (d: Difficulty | 'any') => {
    const id = pickChallenge(d, recipes)
    navigate(`/bar/challenge/${id}?difficulty=${d}`)
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-8" data-testid="challenge-page">
      <h1 className="font-display text-3xl font-bold text-cream-100">Challenge Mode</h1>
      <p className="mt-2 text-cream-200/80">Pick a difficulty. You will see only the cocktail’s name and photo — build it from memory and press Serve to be scored out of 100.</p>
      {streak > 0 && <p className="mt-1 text-sm text-brass-300">Current streak: {streak}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((o, i) => {
          const s = o.id === 'any' ? null : stats[o.id]
          return (
            <motion.button key={o.id} type="button" onClick={() => start(o.id)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="wood-panel rounded-xl border border-brass-600/40 p-5 text-left transition hover:border-brass-400 hover:shadow-[0_0_24px_rgba(217,178,90,0.25)]" data-testid={`challenge-${o.id}`}>
              <div className="font-display text-xl font-bold text-brass-300">{o.title}</div>
              <p className="mt-1 text-sm text-cream-200/80">{o.text}</p>
              <p className="mt-2 text-xs text-cream-200/60">{s ? `${s.mastered} of ${s.total} mastered` : `${RECIPES.length} cocktails`}</p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
