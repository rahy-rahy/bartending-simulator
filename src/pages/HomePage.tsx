import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RECIPES } from '../data/recipes'
import { INGREDIENTS } from '../data/ingredients'
import { GlassView } from '../components/svg/GlassView'

const CARDS = [
  {
    to: '/bar',
    title: 'Free Bar',
    text: 'Every bottle, tool and glass at your fingertips. Pour, shake, stir, rim and garnish anything you like.',
    testId: 'home-free-bar',
  },
  {
    to: '/recipes',
    title: 'Recipe Library',
    text: `${RECIPES.length} cocktails with exact specs in ml and oz. Pick one and let guided mode walk you through it step by step.`,
    testId: 'home-recipes',
  },
  {
    to: '/challenge',
    title: 'Challenge Mode',
    text: 'You get only the name and a photo. Build the drink from memory, serve it and get scored out of 100.',
    testId: 'home-challenge',
  },
]

export function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <div className="flex flex-col items-center gap-8 md:flex-row">
        <div className="flex-1 text-center md:text-left">
          <div className="text-xs uppercase tracking-[0.3em] text-brass-400">Welcome behind the bar</div>
          <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-cream-100 sm:text-5xl">Learn to mix like a pro bartender.</h1>
          <p className="mt-4 max-w-xl text-cream-200/80">
            A realistic bar simulation: free-pour from {INGREDIENTS.length} bottles, measure with a jigger, shake, stir, strain, rim and garnish. Practise {RECIPES.length} cocktails until the amounts are second nature.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link to="/bar" className="btn-primary" data-testid="cta-bar">
              Step behind the bar
            </Link>
            <Link to="/recipes" className="btn-secondary">
              Browse recipes
            </Link>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-end gap-2">
          <GlassView type="coupe" layers={[{ id: 'a', ml: 90, color: '#e8a6b8', opacity: 0.9 }]} capacityMl={180} ice="none" rim="none" rimWet={false} garnishes={['berries']} width={110} animateLiquid={false} />
          <GlassView type="highball" layers={[{ id: 'b', ml: 200, color: '#f5a623', opacity: 0.9 }]} capacityMl={300} ice="cubes" rim="none" rimWet={false} garnishes={['orange-slice']} width={110} animateLiquid={false} />
          <GlassView type="margarita" layers={[{ id: 'c', ml: 120, color: '#dfe9a8', opacity: 0.7 }]} capacityMl={350} ice="none" rim="salt" rimWet={false} garnishes={['lime-wedge']} width={120} animateLiquid={false} />
        </motion.div>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {CARDS.map((c, i) => (
          <motion.div key={c.to} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
            <Link to={c.to} className="wood-panel block h-full rounded-xl border border-brass-600/40 p-5 transition hover:border-brass-400 hover:shadow-[0_0_24px_rgba(217,178,90,0.25)]" data-testid={c.testId}>
              <h2 className="font-display text-xl font-bold text-brass-300">{c.title}</h2>
              <p className="mt-2 text-sm text-cream-200/80">{c.text}</p>
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="mt-10 grid gap-3 rounded-xl border border-brass-600/30 bg-wood-900/50 p-5 text-sm text-cream-200/80 sm:grid-cols-2">
        <div>
          <h3 className="font-display font-bold text-brass-300">How pouring works</h3>
          <p className="mt-1">Drag a bottle over a glass or the shaker and hold. Liquid flows at about 25 ml per second (just under 1 oz) and a live counter shows the amount. Release to stop. Pour too much and it stays poured — there is no undo, only the bin.</p>
        </div>
        <div>
          <h3 className="font-display font-bold text-brass-300">Tolerance and scoring</h3>
          <p className="mt-1">Amounts count as correct within ±15%. Challenges score ingredients, amounts, glass, method, ice, rim and garnish out of 100. Score 90 or more to master a cocktail. Progress is saved in your browser.</p>
        </div>
      </div>
    </div>
  )
}
