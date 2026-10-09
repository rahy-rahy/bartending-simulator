import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useBarStore, type DropTarget, type HeldItem, type PourTarget, type VesselKind } from '../../store/barStore'
import { hitTest, pointer, POUR_TARGETS, VESSEL_TARGETS } from './drag'
import { INGREDIENT_MAP } from '../../data/ingredients'
import { GLASS_MAP } from '../../data/glasses'
import { BottleSvg } from '../svg/BottleSvg'
import { GlassView } from '../svg/GlassView'
import { GarnishIcon } from '../svg/GarnishIcon'
import { BarSpoonSvg, CrushedIceIcon, IceCubeIcon, JiggerSvg, MuddlerSvg, StrainerSvg } from '../svg/ToolSvgs'
import { formatAmount, formatAmountShort, formatMlPrecise, formatOz } from '../../lib/units'
import { aggregate, totalMl } from '../../lib/pouring'
import { mixColor } from '../../lib/colors'

/** Live counter shown next to the bottle while pouring. */
function PourCounter() {
  const pour = useBarStore((s) => s.pour)
  const glass = useBarStore((s) => s.glass)
  const shaker = useBarStore((s) => s.shaker)
  const mixing = useBarStore((s) => s.mixing)
  const blender = useBarStore((s) => s.blender)
  const jigger = useBarStore((s) => s.jigger)
  if (!pour) return null
  const ing = INGREDIENT_MAP[pour.ingredientId]
  if (!ing) return null
  const vessel = pour.target === 'glass' ? glass : pour.target === 'shaker' ? shaker : pour.target === 'mixing' ? mixing : pour.target === 'blender' ? blender : null
  const contents = pour.target === 'jigger' ? jigger.contents : (vessel?.contents ?? [])
  const inVessel = aggregate(contents).get(pour.ingredientId) ?? 0
  const label = pour.target === 'jigger' ? 'jigger' : pour.target === 'glass' ? 'glass' : pour.target === 'mixing' ? 'mixing glass' : pour.target
  return (
    <div className="pointer-events-none absolute left-7 -top-20 min-w-[150px] rounded-lg border border-brass-500/60 bg-wood-900/95 px-3 py-2 text-cream-100 shadow-xl" data-testid="pour-counter">
      <div className="text-[11px] uppercase tracking-wide text-brass-300">{ing.name}</div>
      <div className="font-display text-xl font-bold leading-tight text-white" data-testid="pour-amount">
        {ing.unit === 'ml' ? `${formatMlPrecise(pour.amount)} \u00b7 ${formatOz(pour.amount)}` : ing.unit === 'piece' ? formatAmountShort(ing, pour.amount) : formatAmount(ing, pour.amount)}
      </div>
      <div className="text-xs text-cream-200/80">
        in {label}: <span data-testid="pour-total">{ing.unit === 'ml' ? formatMlPrecise(inVessel) : formatAmountShort(ing, inVessel)}</span>
      </div>
    </div>
  )
}

function Ghost({ pouring }: { pouring: boolean }) {
  const held = useBarStore((s) => s.held)
  const glass = useBarStore((s) => s.glass)
  const jigger = useBarStore((s) => s.jigger)
  if (!held) return null
  switch (held.kind) {
    case 'bottle': {
      const ing = INGREDIENT_MAP[held.id]
      if (!ing) return null
      const w = 64
      return (
        <motion.div
          className="absolute"
          style={{ left: 0, top: 0, transformOrigin: '50% 0%', marginLeft: -w / 2, filter: 'drop-shadow(0 12px 10px rgba(0,0,0,.6))' }}
          initial={false}
          animate={pouring ? { rotate: -118, y: -4 } : { rotate: 0, y: -(w * 140) / 60 / 2 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <BottleSvg ingredient={ing} width={w} />
        </motion.div>
      )
    }
    case 'ice':
      return (
        <div className="absolute -left-7 -top-9 drop-shadow-xl">{held.id === 'cubes' ? <IceCubeIcon width={56} /> : <CrushedIceIcon width={56} />}</div>
      )
    case 'garnish':
      return (
        <div className="absolute -left-7 -top-14 drop-shadow-xl">
          <GarnishIcon id={held.id} size={60} />
        </div>
      )
    case 'tool':
      return (
        <div className="absolute -left-5 -top-20 drop-shadow-xl">
          {held.id === 'muddler' ? <MuddlerSvg width={30} /> : held.id === 'spoon' ? <BarSpoonSvg width={28} /> : <StrainerSvg width={84} />}
        </div>
      )
    case 'glass':
      if (!glass) return null
      return (
        <div className="absolute -left-14 -top-24 drop-shadow-xl">
          <GlassView type={glass.type} layers={[]} capacityMl={GLASS_MAP[glass.type].capacityMl} ice={glass.ice} rim={glass.rim} rimWet={glass.rimWet} garnishes={glass.garnishes} width={110} animateLiquid={false} />
        </div>
      )
    case 'rack-glass':
      return (
        <div className="absolute -left-12 -top-20 drop-shadow-xl">
          <GlassView type={held.id} layers={[]} capacityMl={GLASS_MAP[held.id].capacityMl} ice="none" rim="none" rimWet={false} garnishes={[]} width={96} animateLiquid={false} />
        </div>
      )
    case 'jigger': {
      const ml = totalMl(jigger.contents, (id) => INGREDIENT_MAP[id]?.unit ?? 'ml')
      return (
        <motion.div className="absolute -left-8 -top-12 drop-shadow-xl" animate={{ rotate: -40 }}>
          <JiggerSvg ml={ml} sizeMl={jigger.sizeMl} color={mixColor(jigger.contents).color} width={64} />
        </motion.div>
      )
    }
  }
}

function targetSurface(target: DropTarget): { x: number; y: number; width: number } | null {
  const el = document.querySelector<HTMLElement>(`[data-drop="${target}"]`)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  const levelAttr = el.querySelector<SVGElement>('svg[data-level]')?.getAttribute('data-level')
  const level = levelAttr ? Number(levelAttr) : 0
  const svg = el.querySelector('svg')
  const r = svg ? svg.getBoundingClientRect() : rect
  const y = r.top + r.height * (target === 'jigger' ? 0.2 : 0.18 + (1 - level) * 0.6)
  return { x: r.left + r.width / 2, y, width: r.width }
}

export function DragLayer() {
  const held = useBarStore((s) => s.held)
  if (!held) return null
  return <ActiveDrag held={held} />
}

function ActiveDrag({ held }: { held: HeldItem }) {
  const pour = useBarStore((s) => s.pour)
  const [pos, setPos] = useState(() => ({ x: pointer.x, y: pointer.y }))
  const lastTarget = useRef<DropTarget | null>(null)

  useEffect(() => {
    lastTarget.current = null
    const store = useBarStore.getState

    const applyHover = (t: DropTarget | null) => {
      if (t === lastTarget.current) return
      lastTarget.current = t
      store().setHover(t)
      if (held.kind === 'bottle') {
        if (t && POUR_TARGETS.has(t)) store().startPour(held.id, t as PourTarget)
        else store().stopPour()
      }
    }

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      setPos({ x: e.clientX, y: e.clientY })
      applyHover(hitTest(e.clientX, e.clientY))
    }

    const onUp = (e: PointerEvent) => {
      const t = hitTest(e.clientX, e.clientY)
      const s = store()
      s.stopPour()
      const vessel = t && VESSEL_TARGETS.has(t) ? (t as VesselKind) : null
      switch (held.kind) {
        case 'ice':
          if (vessel) s.addIce(vessel, held.id)
          break
        case 'garnish':
          if (t === 'glass') s.addGarnish(held.id)
          else if (vessel) s.showToast('Garnish goes on the finished drink in the glass.', 'warn')
          break
        case 'tool':
          if (held.id === 'muddler' && vessel) s.muddle(vessel)
          if (held.id === 'spoon' && t === 'mixing') s.stir()
          if (held.id === 'spoon' && t === 'glass') {
            if (s.glass && !s.glass.layerMode) {
              s.toggleLayerMode()
              s.showToast('Bar spoon hooked over the glass: pours will now layer gently.', 'info')
            }
          }
          if (held.id === 'strainer' && (t === 'shaker' || t === 'mixing')) s.strain(t)
          break
        case 'glass':
          if (t === 'bin') s.dumpGlass()
          else if (t === 'lime-dish') s.wetRim()
          else if (t === 'salt-dish') s.dipRim('salt')
          else if (t === 'sugar-dish') s.dipRim('sugar')
          break
        case 'rack-glass':
          s.pickGlass(held.id)
          break
        case 'jigger':
          if (vessel) s.pourJiggerInto(vessel)
          break
        case 'bottle':
          break
      }
      s.setHover(null)
      s.setHeld(null)
      lastTarget.current = null
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    const prevSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      document.body.style.userSelect = prevSelect
    }
  }, [held])

  const pouring = !!pour && held.kind === 'bottle'
  const ing = pouring ? INGREDIENT_MAP[pour.ingredientId] : null
  const surface = pouring ? targetSurface(pour.target) : null
  const streamTop = pos.y + 6
  const streamHeight = surface ? Math.max(0, surface.y - streamTop) : 0

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden>
      {pouring && ing && surface && (
        <>
          <div
            className="absolute pour-stream"
            style={{
              left: pos.x - 3,
              top: streamTop,
              width: 6,
              height: streamHeight,
              background: `linear-gradient(to bottom, ${ing.color}, ${ing.color})`,
              opacity: Math.max(0.55, ing.opacity),
              borderRadius: 3,
            }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ left: pos.x - 14, top: surface.y - 4, width: 28, height: 8, background: ing.color, opacity: Math.max(0.5, ing.opacity) }}
            animate={{ scaleX: [1, 1.4, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </>
      )}
      <div className="absolute" style={{ left: pos.x, top: pos.y }}>
        <Ghost pouring={pouring} />
        {pouring && <PourCounter />}
      </div>
    </div>
  )
}
