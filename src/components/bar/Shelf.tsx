import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useBarStore } from '../../store/barStore'
import { CATEGORY_LABELS, CATEGORY_ORDER, INGREDIENTS } from '../../data/ingredients'
import { GARNISHES } from '../../data/garnishes'
import type { Ingredient, IngredientCategory } from '../../data/types'
import { BottleSvg } from '../svg/BottleSvg'
import { GarnishIcon } from '../svg/GarnishIcon'
import { beginDrag } from './drag'
import { useIsTarget, useGuidedTarget } from './guidedContext'

function Bottle({ ingredient }: { ingredient: Ingredient }) {
  const isTarget = useIsTarget({ kind: 'bottle', id: ingredient.id })
  const held = useBarStore((s) => s.held)
  const hidden = held?.kind === 'bottle' && held.id === ingredient.id
  return (
    <motion.button
      type="button"
      className={`bottle-slot group relative flex shrink-0 flex-col items-center gap-1 rounded-lg px-1 pb-1 pt-2 touch-none select-none ${isTarget ? 'guided-target' : ''}`}
      data-testid={`bottle-${ingredient.id}`}
      data-bottle={ingredient.id}
      title={`${ingredient.name} — drag over a glass or shaker and hold to pour`}
      aria-label={`${ingredient.name}, drag to pour`}
      onPointerDown={(e) => beginDrag({ kind: 'bottle', id: ingredient.id }, e)}
      whileHover={{ y: -4 }}
      style={{ opacity: hidden ? 0.25 : 1 }}
    >
      <BottleSvg ingredient={ingredient} width={54} className="drop-shadow-[0_8px_6px_rgba(0,0,0,0.55)]" />
      <span className="max-w-[72px] text-center text-[10px] leading-tight text-cream-200/90 group-hover:text-brass-300">{ingredient.name}</span>
    </motion.button>
  )
}

function GarnishItem({ id, name }: { id: (typeof GARNISHES)[number]['id']; name: string }) {
  const isTarget = useIsTarget({ kind: 'garnish', id })
  return (
    <motion.button
      type="button"
      className={`group relative flex shrink-0 flex-col items-center gap-1 rounded-lg px-1 pb-1 pt-2 touch-none select-none ${isTarget ? 'guided-target' : ''}`}
      data-testid={`garnish-${id}`}
      title={`${name} — drag onto the glass`}
      aria-label={`${name}, drag onto the glass`}
      onPointerDown={(e) => beginDrag({ kind: 'garnish', id }, e)}
      whileHover={{ y: -4 }}
    >
      <div className="flex h-[74px] w-[64px] items-end justify-center rounded-md bg-wood-900/40">
        <GarnishIcon id={id} size={52} />
      </div>
      <span className="max-w-[72px] text-center text-[10px] leading-tight text-cream-200/90 group-hover:text-brass-300">{name}</span>
    </motion.button>
  )
}

export function Shelf() {
  const category = useBarStore((s) => s.shelfCategory)
  const setCategory = useBarStore((s) => s.setShelfCategory)
  const target = useGuidedTarget()
  const scroller = useRef<HTMLDivElement>(null)

  // Guided mode: open the right shelf and scroll the wanted bottle into view.
  useEffect(() => {
    if (!target) return
    if (target.kind === 'bottle') {
      const ing = INGREDIENTS.find((i) => i.id === target.id)
      if (ing && ing.category !== category) setCategory(ing.category)
    } else if (target.kind === 'garnish' && category !== 'garnishes') {
      setCategory('garnishes')
    }
  }, [target, category, setCategory])

  useEffect(() => {
    if (!target) return
    const id = target.kind === 'bottle' ? `bottle-${target.id}` : target.kind === 'garnish' ? `garnish-${target.id}` : null
    if (!id) return
    const el = scroller.current?.querySelector<HTMLElement>(`[data-testid="${id}"]`)
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [target, category])

  const tabs: { id: IngredientCategory | 'garnishes'; label: string }[] = [
    ...CATEGORY_ORDER.map((c) => ({ id: c, label: CATEGORY_LABELS[c] })),
    { id: 'garnishes', label: 'Garnishes' },
  ]
  const items = category === 'garnishes' ? [] : INGREDIENTS.filter((i) => i.category === category)

  return (
    <section className="back-bar rounded-xl border border-brass-600/30 p-2 sm:p-3" aria-label="Back bar shelves">
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin" role="tablist" aria-label="Shelf categories">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={category === t.id}
            data-testid={`shelf-tab-${t.id}`}
            onClick={() => setCategory(t.id)}
            className={`shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition sm:text-xs ${
              category === t.id
                ? 'border-brass-400 bg-brass-500 text-wood-900 shadow-[0_0_12px_rgba(217,178,90,0.5)]'
                : 'border-brass-600/40 bg-wood-800/70 text-brass-300 hover:bg-wood-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="shelf-plank relative">
        <div ref={scroller} className="flex items-end gap-1 overflow-x-auto px-2 pb-2 pt-1 scrollbar-thin sm:gap-2" data-testid="shelf-items">
          {category === 'garnishes'
            ? GARNISHES.map((g) => <GarnishItem key={g.id} id={g.id} name={g.name} />)
            : items.map((i) => <Bottle key={i.id} ingredient={i} />)}
        </div>
        <div className="shelf-edge" />
      </div>
    </section>
  )
}
