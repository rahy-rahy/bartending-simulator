import { useBarStore, type Vessel } from '../../store/barStore'
import { INGREDIENT_MAP } from '../../data/ingredients'
import { GLASS_MAP } from '../../data/glasses'
import { GARNISH_MAP } from '../../data/garnishes'
import { formatAmount } from '../../lib/units'
import { aggregate, totalMl } from '../../lib/pouring'
import { ICE_LABELS } from '../../data/recipes'

function VesselContents({ title, vessel, testId }: { title: string; vessel: Vessel | null; testId: string }) {
  if (!vessel) return null
  const totals = aggregate(vessel.contents)
  const empty = totals.size === 0 && vessel.ice === 'none'
  const ml = totalMl(vessel.contents, (id) => INGREDIENT_MAP[id]?.unit ?? 'ml')
  return (
    <div className="rounded-lg border border-brass-600/30 bg-wood-900/60 p-2" data-testid={testId}>
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-sm font-bold text-brass-300">{title}</h3>
        {ml > 0 && <span className="text-[11px] text-cream-200/70">{Math.round(ml)} ml total</span>}
      </div>
      {empty ? (
        <div className="text-xs text-cream-200/50">Empty</div>
      ) : (
        <ul className="mt-1 space-y-0.5 text-xs">
          {vessel.ice !== 'none' && <li className="text-cream-200/80">{ICE_LABELS[vessel.ice]}</li>}
          {[...totals.entries()].map(([id, amount]) => {
            const ing = INGREDIENT_MAP[id]
            return (
              <li key={id} className="flex items-center justify-between gap-2" data-testid={`content-${id}`}>
                <span className="flex items-center gap-1.5 text-cream-100">
                  <span className="inline-block h-2.5 w-2.5 rounded-full border border-white/30" style={{ background: ing?.color ?? '#999' }} />
                  {ing?.name ?? id}
                </span>
                <span className="whitespace-nowrap font-mono text-[11px] text-brass-300">{ing ? formatAmount(ing, amount) : amount}</span>
              </li>
            )
          })}
          {vessel.muddled && <li className="text-cream-200/70">Muddled</li>}
          {vessel.shaken && <li className="text-cream-200/70">Shaken{vessel.chilledWithIce ? ' with ice' : ' (no ice!)'}</li>}
          {vessel.stirred && <li className="text-cream-200/70">Stirred{vessel.chilledWithIce ? ' with ice' : ''}</li>}
          {vessel.blended && <li className="text-cream-200/70">Blended</li>}
          {vessel.spilledMl > 0 && <li className="text-red-300">Overflowed by about {Math.round(vessel.spilledMl)} ml</li>}
        </ul>
      )}
    </div>
  )
}

export function ContentsPanel() {
  const glass = useBarStore((s) => s.glass)
  const shaker = useBarStore((s) => s.shaker)
  const mixing = useBarStore((s) => s.mixing)
  const blender = useBarStore((s) => s.blender)
  const jigger = useBarStore((s) => s.jigger)
  const showShaker = shaker.contents.length > 0 || shaker.ice !== 'none' || shaker.shaken
  const showMixing = mixing.contents.length > 0 || mixing.ice !== 'none' || mixing.stirred
  const showBlender = blender.contents.length > 0 || blender.ice !== 'none' || blender.blended
  const jiggerMl = totalMl(jigger.contents, (id) => INGREDIENT_MAP[id]?.unit ?? 'ml')
  return (
    <div className="space-y-2" data-testid="contents-panel">
      <div className="rounded-lg border border-brass-600/30 bg-wood-900/60 p-2" data-testid="contents-glass">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-sm font-bold text-brass-300">{glass ? GLASS_MAP[glass.type].name : 'Glass'}</h3>
          {glass && <span className="text-[11px] text-cream-200/70">{Math.round(totalMl(glass.contents, (id) => INGREDIENT_MAP[id]?.unit ?? 'ml'))} / {GLASS_MAP[glass.type].capacityMl} ml</span>}
        </div>
        {!glass ? (
          <div className="text-xs text-cream-200/50">No glass on the counter</div>
        ) : (
          <>
            <VesselContentsInline vessel={glass} />
            {(glass.rim !== 'none' || glass.rimWet) && (
              <div className="mt-1 text-xs text-cream-200/80" data-testid="glass-rim">
                Rim: {glass.rim !== 'none' ? glass.rim : 'wet (no salt or sugar yet)'}
              </div>
            )}
            {glass.garnishes.length > 0 && (
              <div className="mt-1 text-xs text-cream-200/80" data-testid="glass-garnish">
                Garnish: {glass.garnishes.map((g) => GARNISH_MAP[g].name).join(', ')}
              </div>
            )}
            {glass.layerMode && <div className="mt-1 text-xs text-cream-200/80">Pouring over the bar spoon (layering)</div>}
            {glass.receivedFrom.length > 0 && <div className="mt-1 text-xs text-cream-200/80">Strained from: {glass.receivedFrom.map((v) => (v === 'mixing' ? 'mixing glass' : v)).join(', ')}</div>}
          </>
        )}
      </div>
      {showShaker && <VesselContents title="Shaker" vessel={shaker} testId="contents-shaker" />}
      {showMixing && <VesselContents title="Mixing glass" vessel={mixing} testId="contents-mixing" />}
      {showBlender && <VesselContents title="Blender" vessel={blender} testId="contents-blender" />}
      {jiggerMl > 0 && (
        <div className="rounded-lg border border-brass-600/30 bg-wood-900/60 p-2 text-xs text-cream-100" data-testid="contents-jigger">
          <span className="font-display font-bold text-brass-300">Jigger:</span> {[...aggregate(jigger.contents).entries()].map(([id, a]) => `${INGREDIENT_MAP[id]?.name ?? id} ${Math.round(a)} ml`).join(', ')}
        </div>
      )}
    </div>
  )
}

function VesselContentsInline({ vessel }: { vessel: Vessel }) {
  const totals = aggregate(vessel.contents)
  if (totals.size === 0 && vessel.ice === 'none') return <div className="text-xs text-cream-200/50">Empty</div>
  return (
    <ul className="mt-1 space-y-0.5 text-xs">
      {vessel.ice !== 'none' && <li className="text-cream-200/80">{ICE_LABELS[vessel.ice]}</li>}
      {[...totals.entries()].map(([id, amount]) => {
        const ing = INGREDIENT_MAP[id]
        return (
          <li key={id} className="flex items-center justify-between gap-2" data-testid={`content-${id}`}>
            <span className="flex items-center gap-1.5 text-cream-100">
              <span className="inline-block h-2.5 w-2.5 rounded-full border border-white/30" style={{ background: ing?.color ?? '#999' }} />
              {ing?.name ?? id}
            </span>
            <span className="whitespace-nowrap font-mono text-[11px] text-brass-300">{ing ? formatAmount(ing, amount) : amount}</span>
          </li>
        )
      })}
      {vessel.muddled && <li className="text-cream-200/70">Muddled</li>}
      {vessel.stirred && <li className="text-cream-200/70">Stirred in the glass</li>}
      {vessel.spilledMl > 0 && <li className="text-red-300">Overflowed by about {Math.round(vessel.spilledMl)} ml</li>}
    </ul>
  )
}
