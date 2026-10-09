import { motion, AnimatePresence } from 'framer-motion'
import { useBarStore, vesselMl, BLENDER_CAPACITY, MIXING_CAPACITY, SHAKER_CAPACITY, JIGGER_SIZES, type VesselKind } from '../../store/barStore'
import { GLASSES, GLASS_MAP } from '../../data/glasses'
import { INGREDIENT_MAP } from '../../data/ingredients'
import type { GlassType } from '../../data/types'
import { mixColor } from '../../lib/colors'
import { vesselLayers } from './vesselLayers'
import { totalMl } from '../../lib/pouring'
import { GlassView } from '../svg/GlassView'
import { BarSpoonSvg, BinSvg, BlenderSvg, CrushedIceIcon, IceBucketSvg, IceCubeIcon, JiggerSvg, MixingGlassSvg, MuddlerSvg, RimDishSvg, ShakerSvg, StrainerSvg } from '../svg/ToolSvgs'
import { beginDrag } from './drag'
import { useIsTarget } from './guidedContext'

function ActionButton({ label, onClick, testId, highlight, disabled }: { label: string; onClick: () => void; testId: string; highlight?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition disabled:opacity-40 ${
        highlight ? 'guided-target border-brass-300 bg-brass-500 text-wood-900' : 'border-brass-600/50 bg-wood-800 text-brass-300 hover:bg-wood-700'
      }`}
    >
      {label}
    </button>
  )
}

function ToolStation({ kind }: { kind: Exclude<VesselKind, 'glass'> }) {
  const vessel = useBarStore((s) => s[kind])
  const animation = useBarStore((s) => s.animation)
  const hover = useBarStore((s) => s.hover)
  const held = useBarStore((s) => s.held)
  const { shake, stir, blend, strain, pourOut, dumpVessel } = useBarStore.getState()
  const isTarget = useIsTarget({ kind: 'tool', id: kind })
  const iceTarget = useIsTarget({ kind: 'ice', vessel: kind })
  const shakeTarget = useIsTarget({ kind: 'action', id: 'shake' })
  const stirTarget = useIsTarget({ kind: 'action', id: 'stir' })
  const blendTarget = useIsTarget({ kind: 'action', id: 'blend' })
  const strainTarget = useIsTarget({ kind: 'action', id: 'strain' })
  const pourTarget = useIsTarget({ kind: 'action', id: 'pour-out' })
  const busy = animation?.vessel === kind ? animation.kind : null
  const layers = vesselLayers(vessel)
  const hasContents = vessel.contents.length > 0
  const over = hover === kind && !!held
  const label = kind === 'shaker' ? 'Shaker' : kind === 'mixing' ? 'Mixing glass' : 'Blender'
  const capacity = kind === 'shaker' ? SHAKER_CAPACITY : kind === 'mixing' ? MIXING_CAPACITY : BLENDER_CAPACITY
  const highlightVessel = isTarget || iceTarget || (shakeTarget && kind === 'shaker') || (stirTarget && kind === 'mixing') || (blendTarget && kind === 'blender')

  return (
    <div className="flex flex-col items-center gap-1" data-testid={`station-${kind}`}>
      <motion.div
        data-drop={kind}
        className={`relative rounded-xl p-1 transition ${over ? 'drop-hover' : ''} ${highlightVessel ? 'guided-target' : ''}`}
        animate={busy === 'dump' ? { rotate: [0, -60, -60, 0], x: [0, 30, 30, 0] } : busy === 'strain' || busy === 'pour-out' ? { rotate: [0, -55, -55, 0], y: [0, -10, -10, 0] } : busy === 'muddle' ? { y: [0, 3, 0, 3, 0] } : busy === 'ice' ? { y: [0, 2, -2, 0] } : { rotate: 0, x: 0, y: 0 }}
        transition={{ duration: busy === 'muddle' ? 0.6 : 1.1 }}
      >
        {kind === 'shaker' && <ShakerSvg layers={layers} capacityMl={capacity} ice={vessel.ice} closed={busy === 'shake' || vessel.shaken} shaking={busy === 'shake'} width={84} />}
        {kind === 'mixing' && <MixingGlassSvg layers={layers} capacityMl={capacity} ice={vessel.ice} stirring={busy === 'stir'} width={84} />}
        {kind === 'blender' && <BlenderSvg layers={layers} capacityMl={capacity} ice={vessel.ice} blending={busy === 'blend'} width={84} />}
        {busy === 'muddle' && (
          <motion.div className="absolute left-1/2 top-0 -translate-x-1/2" animate={{ y: [0, 26, 10, 26, 0] }} transition={{ duration: 1 }}>
            <MuddlerSvg width={22} />
          </motion.div>
        )}
        {busy === 'strain' && (
          <div className="absolute -right-2 top-2">
            <StrainerSvg width={54} />
          </div>
        )}
        {hasContents && (
          <div className="absolute left-1 top-1 rounded bg-wood-900/80 px-1 text-[10px] text-brass-300" data-testid={`${kind}-ml`}>
            {Math.round(vesselMl(vessel))} ml
          </div>
        )}
      </motion.div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-brass-300">{label}</div>
      <div className="flex flex-wrap justify-center gap-1">
        {kind === 'shaker' && <ActionButton label="Shake" onClick={shake} testId="btn-shake" highlight={shakeTarget} disabled={!hasContents || !!animation} />}
        {kind === 'mixing' && <ActionButton label="Stir" onClick={stir} testId="btn-stir" highlight={stirTarget} disabled={!hasContents || !!animation} />}
        {kind === 'blender' && <ActionButton label="Blend" onClick={blend} testId="btn-blend" highlight={blendTarget} disabled={!hasContents || !!animation} />}
        {kind !== 'blender' && <ActionButton label="Strain" onClick={() => strain(kind)} testId={`btn-strain-${kind}`} highlight={strainTarget && hasContents} disabled={!hasContents || !!animation} />}
        {kind === 'blender' && <ActionButton label="Pour" onClick={pourOut} testId="btn-pour-out" highlight={pourTarget && hasContents} disabled={!hasContents || !!animation} />}
        {(hasContents || vessel.ice !== 'none') && <ActionButton label="Empty" onClick={() => dumpVessel(kind)} testId={`btn-empty-${kind}`} disabled={!!animation} />}
      </div>
    </div>
  )
}

function Jigger() {
  const jigger = useBarStore((s) => s.jigger)
  const hover = useBarStore((s) => s.hover)
  const held = useBarStore((s) => s.held)
  const setJiggerSize = useBarStore((s) => s.setJiggerSize)
  const emptyJigger = useBarStore((s) => s.emptyJigger)
  const ml = totalMl(jigger.contents, (id) => INGREDIENT_MAP[id]?.unit ?? 'ml')
  const over = hover === 'jigger' && !!held
  return (
    <div className="flex flex-col items-center gap-1" data-testid="station-jigger">
      <div
        data-drop="jigger"
        className={`relative cursor-grab rounded-xl p-1 touch-none select-none ${over ? 'drop-hover' : ''}`}
        onPointerDown={(e) => {
          if (ml > 0) beginDrag({ kind: 'jigger' }, e)
        }}
        title="Pour a bottle into the jigger to measure, then drag the jigger to a glass or shaker"
      >
        <JiggerSvg ml={ml} sizeMl={jigger.sizeMl} color={mixColor(jigger.contents).color} width={58} />
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-brass-300">Jigger</div>
      <select
        value={jigger.sizeMl}
        onChange={(e) => setJiggerSize(Number(e.target.value))}
        className="rounded border border-brass-600/50 bg-wood-800 px-1 py-0.5 text-xs text-brass-300"
        aria-label="Jigger size"
        data-testid="jigger-size"
      >
        {JIGGER_SIZES.map((s) => (
          <option key={s} value={s}>
            {s} ml
          </option>
        ))}
      </select>
      {ml > 0 && <ActionButton label="Empty" onClick={emptyJigger} testId="btn-empty-jigger" />}
    </div>
  )
}

function HandTools() {
  const muddlerTarget = useIsTarget({ kind: 'tool', id: 'muddler' })
  const spoonTarget = useIsTarget({ kind: 'tool', id: 'spoon' })
  return (
    <div className="flex items-end gap-2" data-testid="hand-tools">
      <button type="button" className={`flex flex-col items-center gap-1 rounded-lg p-1 touch-none select-none ${spoonTarget ? 'guided-target' : ''}`} onPointerDown={(e) => beginDrag({ kind: 'tool', id: 'spoon' }, e)} title="Bar spoon: drag onto the mixing glass to stir, or onto a glass to layer" data-testid="tool-spoon" aria-label="Bar spoon">
        <BarSpoonSvg width={18} />
        <span className="text-[10px] text-cream-200/80">Bar spoon</span>
      </button>
      <button type="button" className={`flex flex-col items-center gap-1 rounded-lg p-1 touch-none select-none ${muddlerTarget ? 'guided-target' : ''}`} onPointerDown={(e) => beginDrag({ kind: 'tool', id: 'muddler' }, e)} title="Muddler: drag onto a glass or shaker" data-testid="tool-muddler" aria-label="Muddler">
        <MuddlerSvg width={20} />
        <span className="text-[10px] text-cream-200/80">Muddler</span>
      </button>
      <button type="button" className="flex flex-col items-center gap-1 rounded-lg p-1 touch-none select-none" onPointerDown={(e) => beginDrag({ kind: 'tool', id: 'strainer' }, e)} title="Strainer: drag onto the shaker or mixing glass" data-testid="tool-strainer" aria-label="Strainer">
        <StrainerSvg width={58} />
        <span className="text-[10px] text-cream-200/80">Strainer</span>
      </button>
    </div>
  )
}

function IceBucket() {
  const cubesTarget = useIsTarget({ kind: 'ice', id: 'cubes' })
  const crushedTarget = useIsTarget({ kind: 'ice', id: 'crushed' })
  return (
    <div className="flex flex-col items-center gap-1" data-testid="ice-bucket">
      <IceBucketSvg width={104} />
      <div className="text-[11px] font-semibold uppercase tracking-wide text-brass-300">Ice bucket</div>
      <div className="flex gap-2">
        <button type="button" className={`flex flex-col items-center rounded-lg border border-brass-600/40 bg-wood-800/70 p-1 touch-none select-none ${cubesTarget ? 'guided-target' : ''}`} onPointerDown={(e) => beginDrag({ kind: 'ice', id: 'cubes' }, e)} title="Drag ice cubes into a glass or shaker" data-testid="ice-cubes" aria-label="Ice cubes">
          <IceCubeIcon width={34} />
          <span className="text-[10px] text-cream-200/80">Cubes</span>
        </button>
        <button type="button" className={`flex flex-col items-center rounded-lg border border-brass-600/40 bg-wood-800/70 p-1 touch-none select-none ${crushedTarget ? 'guided-target' : ''}`} onPointerDown={(e) => beginDrag({ kind: 'ice', id: 'crushed' }, e)} title="Drag crushed ice into a glass or shaker" data-testid="ice-crushed" aria-label="Crushed ice">
          <CrushedIceIcon width={34} />
          <span className="text-[10px] text-cream-200/80">Crushed</span>
        </button>
      </div>
    </div>
  )
}

function RimStation() {
  const hover = useBarStore((s) => s.hover)
  const held = useBarStore((s) => s.held)
  const limeTarget = useIsTarget({ kind: 'rim', id: 'lime' })
  const saltTarget = useIsTarget({ kind: 'rim', id: 'salt' })
  const sugarTarget = useIsTarget({ kind: 'rim', id: 'sugar' })
  const dish = (id: 'lime-dish' | 'salt-dish' | 'sugar-dish', kind: 'lime' | 'salt' | 'sugar', label: string, target: boolean) => (
    <div key={id} data-drop={id} data-testid={id} className={`flex flex-col items-center rounded-lg p-1 transition ${hover === id && held?.kind === 'glass' ? 'drop-hover' : ''} ${target ? 'guided-target' : ''}`} title={`Drag the glass here to ${kind === 'lime' ? 'wet the rim' : `dip the rim in ${kind}`}`}>
      <RimDishSvg kind={kind} width={66} />
      <span className="text-[10px] text-cream-200/80">{label}</span>
    </div>
  )
  return (
    <div className="flex flex-col items-center gap-1" data-testid="rim-station">
      <div className="flex gap-1">
        {dish('lime-dish', 'lime', 'Lime wedge', limeTarget)}
        {dish('salt-dish', 'salt', 'Salt', saltTarget)}
        {dish('sugar-dish', 'sugar', 'Sugar', sugarTarget)}
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-brass-300">Rim station</div>
    </div>
  )
}

function Bin() {
  const hover = useBarStore((s) => s.hover)
  const held = useBarStore((s) => s.held)
  const animation = useBarStore((s) => s.animation)
  const open = (hover === 'bin' && held?.kind === 'glass') || animation?.kind === 'dump'
  return (
    <div data-drop="bin" data-testid="bin" className={`flex flex-col items-center rounded-lg p-1 transition ${open ? 'drop-hover' : ''}`} title="Drag the glass here to dump the drink">
      <BinSvg width={64} open={open} />
      <span className="text-[11px] font-semibold uppercase tracking-wide text-brass-300">Bin</span>
    </div>
  )
}

function Workspace() {
  const glass = useBarStore((s) => s.glass)
  const hover = useBarStore((s) => s.hover)
  const held = useBarStore((s) => s.held)
  const animation = useBarStore((s) => s.animation)
  const session = useBarStore((s) => s.session)
  const { toggleLayerMode, stirInGlass, dumpGlass } = useBarStore.getState()
  const layerTarget = useIsTarget({ kind: 'action', id: 'layer-mode' })
  const iceTarget = useIsTarget({ kind: 'ice', vessel: 'glass' })
  const muddleTarget = useIsTarget({ kind: 'tool', id: 'muddler', vessel: 'glass' })
  const spoonTarget = useIsTarget({ kind: 'tool', id: 'spoon', vessel: 'glass' })
  const busy = animation?.vessel === 'glass' ? animation.kind : null
  const over = hover === 'glass' && !!held && held.kind !== 'glass'
  const layers = vesselLayers(glass)
  const foam = !!glass && glass.contents.some((c) => c.id === 'egg-white' || (c.id === 'cream' && glass.mixedUpTo < glass.contents.length))
  const hidden = held?.kind === 'glass'

  return (
    <div className="flex flex-col items-center" data-testid="workspace">
      <div
        data-drop="glass"
        className={`relative flex h-[250px] w-[190px] items-center justify-center rounded-xl transition sm:h-[290px] sm:w-[210px] ${over ? 'drop-hover' : ''} ${iceTarget || muddleTarget || spoonTarget ? 'guided-target' : ''}`}
      >
        <AnimatePresence mode="wait">
          {glass ? (
            <motion.div
              key={`${session}-${glass.type}`}
              className="cursor-grab touch-none select-none"
              data-testid="counter-glass"
              data-glass={glass.type}
              style={{ opacity: hidden ? 0.2 : 1 }}
              onPointerDown={(e) => beginDrag({ kind: 'glass' }, e)}
              initial={{ y: -40, opacity: 0, scale: 0.9 }}
              animate={
                busy === 'dump'
                  ? { rotate: [0, -120, -120], x: [0, 90, 120], y: [0, -40, 60], opacity: [1, 1, 0] }
                  : busy === 'rim-wet' || busy === 'rim-dip'
                    ? { rotate: [0, 180, 180, 0], y: [0, 30, 30, 0], opacity: 1 }
                    : busy === 'muddle'
                      ? { y: [0, 3, 0, 3, 0], opacity: 1 }
                      : busy === 'stir-glass'
                        ? { rotate: [0, -4, 4, -4, 4, 0], opacity: 1 }
                        : { y: 0, opacity: 1, scale: 1, rotate: 0, x: 0 }
              }
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: busy === 'dump' ? 0.9 : busy === 'muddle' ? 0.6 : busy ? 0.9 : 0.35 }}
              title="Drag the glass to the bin to dump it, or to the rim station to rim it"
            >
              <GlassView type={glass.type} layers={layers} capacityMl={GLASS_MAP[glass.type].capacityMl} ice={glass.ice} rim={glass.rim} rimWet={glass.rimWet} garnishes={glass.garnishes} spilled={glass.spilledMl > 0} width={160} foam={foam} />
              {busy === 'muddle' && (
                <motion.div className="absolute left-1/2 top-0 -translate-x-1/2" animate={{ y: [0, 40, 20, 40, 0] }} transition={{ duration: 1 }}>
                  <MuddlerSvg width={22} />
                </motion.div>
              )}
              {glass.layerMode && (
                <div className="absolute right-2 top-6 rotate-[30deg]" title="Bar spoon hooked over the glass">
                  <BarSpoonSvg width={16} />
                </div>
              )}
              {(busy === 'rim-wet' || busy === 'rim-dip') && (
                <motion.div className="absolute -bottom-2 left-1/2 -translate-x-1/2" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 0.9 }}>
                  <RimDishSvg kind={busy === 'rim-wet' ? 'lime' : glass.rim !== 'none' ? glass.rim : 'salt'} width={80} />
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" className="flex h-40 w-36 items-center justify-center rounded-xl border-2 border-dashed border-brass-600/40 text-center text-xs text-cream-200/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="empty-counter">
              Pick a glass from the rack below
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {glass && (
        <div className="mt-1 flex flex-wrap justify-center gap-1" data-testid="glass-actions">
          <span className="rounded bg-wood-900/70 px-2 py-1 text-[11px] text-brass-300">{GLASS_MAP[glass.type].name}</span>
          <ActionButton label={glass.layerMode ? 'Spoon hooked: layering' : 'Layer over spoon'} onClick={toggleLayerMode} testId="btn-layer-mode" highlight={layerTarget} />
          <ActionButton label="Stir in glass" onClick={stirInGlass} testId="btn-stir-glass" disabled={glass.contents.length === 0 || !!animation} />
          <ActionButton label="Dump" onClick={dumpGlass} testId="btn-dump" disabled={!!animation} />
        </div>
      )}
    </div>
  )
}

function GlassRack() {
  const pickGlass = useBarStore((s) => s.pickGlass)
  const current = useBarStore((s) => s.glass?.type)
  return (
    <div className="glass-rack rounded-lg border border-brass-600/30 px-2 pt-1" data-testid="glass-rack">
      <div className="text-center text-[11px] font-semibold uppercase tracking-wide text-brass-300">Glass rack — click or drag a glass to the counter</div>
      <div className="flex items-end justify-start gap-1 overflow-x-auto pb-1 scrollbar-thin sm:justify-center">
        {GLASSES.map((g) => (
          <RackGlass key={g.id} type={g.id} name={g.name} active={current === g.id} onPick={() => pickGlass(g.id)} />
        ))}
      </div>
    </div>
  )
}

function RackGlass({ type, name, active, onPick }: { type: GlassType; name: string; active: boolean; onPick: () => void }) {
  const isTarget = useIsTarget({ kind: 'glass', id: type })
  return (
    <button
      type="button"
      className={`flex shrink-0 flex-col items-center rounded-lg px-1 py-1 touch-none select-none hover:bg-wood-700/50 ${active ? 'bg-wood-700/60' : ''} ${isTarget ? 'guided-target' : ''}`}
      data-testid={`rack-${type}`}
      title={name}
      aria-label={`${name} glass`}
      onPointerDown={(e) => beginDrag({ kind: 'rack-glass', id: type }, e)}
      onClick={onPick}
    >
      <GlassView type={type} layers={[]} capacityMl={100} ice="none" rim="none" rimWet={false} garnishes={[]} width={46} animateLiquid={false} />
      <span className="w-14 truncate text-center text-[10px] text-cream-200/80">{name.replace(' (Old Fashioned)', '')}</span>
    </button>
  )
}

export function Counter() {
  return (
    <section className="counter-top rounded-xl border border-brass-600/30 p-2 sm:p-3" aria-label="Bar counter">
      <div className="flex flex-wrap items-start justify-center gap-3 sm:gap-5">
        <ToolStation kind="shaker" />
        <ToolStation kind="mixing" />
        <ToolStation kind="blender" />
        <Jigger />
        <HandTools />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
        <IceBucket />
        <Workspace />
        <div className="flex flex-col items-center gap-2">
          <RimStation />
          <Bin />
        </div>
      </div>
      <div className="mt-2">
        <GlassRack />
      </div>
    </section>
  )
}
