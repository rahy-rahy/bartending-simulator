import { create } from 'zustand'
import type { Difficulty, GarnishId, GlassType, IceType, IngredientCategory, Recipe, RimType } from '../data/types'
import { INGREDIENT_MAP } from '../data/ingredients'
import { GLASS_MAP } from '../data/glasses'
import { RECIPE_MAP, RECIPES } from '../data/recipes'
import { addContent, advancePour, fillJigger, overflowMl, totalMl, type ContentEntry } from '../lib/pouring'
import { identifyDrink, scoreDrink, type ScoreResult, type ServedDrink } from '../lib/scoring'
import type { BarSnapshot, GlassSnapshot, VesselSnapshot } from '../lib/guided'

export type VesselKind = 'glass' | 'shaker' | 'mixing' | 'blender'
export type PourTarget = VesselKind | 'jigger'
export type DropTarget = PourTarget | 'bin' | 'lime-dish' | 'salt-dish' | 'sugar-dish' | 'counter'

export interface Vessel {
  contents: ContentEntry[]
  /** Entries below this index are blended together visually. */
  mixedUpTo: number
  /** All pours made into this vessel during the current build (kept after straining). */
  history: ContentEntry[]
  ice: IceType
  muddled: boolean
  shaken: boolean
  stirred: boolean
  blended: boolean
  /** The vessel held ice when it was shaken / stirred. */
  chilledWithIce: boolean
  /** Contents were transferred out; the next pour starts a fresh build. */
  emptied: boolean
  spilledMl: number
}

export interface GlassVessel extends Vessel {
  type: GlassType
  rimWet: boolean
  rim: RimType
  garnishes: GarnishId[]
  layerMode: boolean
  receivedFrom: VesselKind[]
}

export type HeldItem =
  | { kind: 'bottle'; id: string }
  | { kind: 'ice'; id: Exclude<IceType, 'none'> }
  | { kind: 'garnish'; id: GarnishId }
  | { kind: 'tool'; id: 'muddler' | 'spoon' | 'strainer' }
  | { kind: 'glass' }
  | { kind: 'rack-glass'; id: GlassType }
  | { kind: 'jigger' }

export interface PourState {
  ingredientId: string
  target: PourTarget
  elapsedMs: number
  /** Amount poured in this hold, in the ingredient's unit. */
  amount: number
}

export type AnimationKind =
  | 'shake'
  | 'stir'
  | 'strain'
  | 'blend'
  | 'pour-out'
  | 'dump'
  | 'rim-wet'
  | 'rim-dip'
  | 'muddle'
  | 'ice'
  | 'garnish'
  | 'jigger-pour'
  | 'stir-glass'

export interface Animation {
  kind: AnimationKind
  vessel?: VesselKind
  id: number
}

export type BarMode =
  | { kind: 'free' }
  | { kind: 'guided'; recipeId: string }
  | { kind: 'challenge'; recipeId: string; difficulty: Difficulty | 'any' }

export interface ServeOutcome {
  drink: ServedDrink
  recipe: Recipe | null
  result: ScoreResult | null
}

export interface Toast {
  id: number
  text: string
  tone: 'info' | 'warn' | 'success'
}

export const ANIMATION_MS: Record<AnimationKind, number> = {
  shake: 1500,
  stir: 1600,
  strain: 1300,
  blend: 1600,
  'pour-out': 1100,
  dump: 900,
  'rim-wet': 900,
  'rim-dip': 900,
  muddle: 1000,
  ice: 600,
  garnish: 500,
  'jigger-pour': 700,
  'stir-glass': 1000,
}

export const JIGGER_SIZES = [15, 22.5, 30, 45, 60]
export const SHAKER_CAPACITY = 500
export const MIXING_CAPACITY = 500
export const BLENDER_CAPACITY = 800

function emptyVessel(): Vessel {
  return {
    contents: [],
    mixedUpTo: 0,
    history: [],
    ice: 'none',
    muddled: false,
    shaken: false,
    stirred: false,
    blended: false,
    chilledWithIce: false,
    emptied: false,
    spilledMl: 0,
  }
}

function newGlass(type: GlassType): GlassVessel {
  return { ...emptyVessel(), type, rimWet: false, rim: 'none', garnishes: [], layerMode: false, receivedFrom: [] }
}

export function vesselCapacity(state: Pick<BarState, 'glass'>, kind: PourTarget, jiggerSize = 30): number {
  switch (kind) {
    case 'glass':
      return state.glass ? GLASS_MAP[state.glass.type].capacityMl : 0
    case 'shaker':
      return SHAKER_CAPACITY
    case 'mixing':
      return MIXING_CAPACITY
    case 'blender':
      return BLENDER_CAPACITY
    case 'jigger':
      return jiggerSize
  }
}

export function vesselMl(v: Vessel | null): number {
  if (!v) return 0
  return totalMl(v.contents, (id) => INGREDIENT_MAP[id]?.unit ?? 'ml')
}

/** Reset a vessel that was already strained out before a new build begins in it. */
function freshIfEmptied(v: Vessel): Vessel {
  return v.emptied ? emptyVessel() : v
}

let nextId = 1

export interface BarState {
  mode: BarMode
  glass: GlassVessel | null
  shaker: Vessel
  mixing: Vessel
  blender: Vessel
  jigger: { sizeMl: number; contents: ContentEntry[] }
  shelfCategory: IngredientCategory | 'garnishes'
  held: HeldItem | null
  hover: DropTarget | null
  pour: PourState | null
  animation: Animation | null
  toast: Toast | null
  served: ServeOutcome | null
  /** Incremented every time the bar is reset so views can re-mount. */
  session: number

  setMode: (mode: BarMode) => void
  resetBar: () => void
  setShelfCategory: (c: IngredientCategory | 'garnishes') => void
  setHeld: (item: HeldItem | null) => void
  setHover: (t: DropTarget | null) => void
  showToast: (text: string, tone?: Toast['tone']) => void
  clearToast: () => void

  pickGlass: (type: GlassType) => void
  dumpGlass: () => void
  dumpVessel: (kind: VesselKind) => void

  startPour: (ingredientId: string, target: PourTarget) => void
  tickPour: (dtMs: number) => void
  stopPour: () => void
  addPieces: (ingredientId: string, target: PourTarget, count: number) => void

  addIce: (target: VesselKind, type: Exclude<IceType, 'none'>) => void
  muddle: (target: VesselKind) => void
  shake: () => void
  stir: () => void
  blend: () => void
  strain: (from: 'shaker' | 'mixing') => void
  pourOut: () => void
  stirInGlass: () => void
  toggleLayerMode: () => void
  wetRim: () => void
  dipRim: (type: Exclude<RimType, 'none'>) => void
  addGarnish: (id: GarnishId) => void

  setJiggerSize: (ml: number) => void
  pourJiggerInto: (target: VesselKind) => void
  emptyJigger: () => void

  serve: () => ServeOutcome | null
  dismissServe: () => void
}

function runAnimation(
  set: (fn: (s: BarState) => Partial<BarState>) => void,
  get: () => BarState,
  kind: AnimationKind,
  vessel: VesselKind | undefined,
  then: (s: BarState) => Partial<BarState>,
): boolean {
  if (get().animation) return false
  const id = nextId++
  set(() => ({ animation: { kind, vessel, id } }))
  setTimeout(() => {
    set((s) => ({ ...then(s), animation: s.animation?.id === id ? null : s.animation }))
  }, ANIMATION_MS[kind])
  return true
}

export const useBarStore = create<BarState>((set, get) => ({
  mode: { kind: 'free' },
  glass: null,
  shaker: emptyVessel(),
  mixing: emptyVessel(),
  blender: emptyVessel(),
  jigger: { sizeMl: 30, contents: [] },
  shelfCategory: 'vodka',
  held: null,
  hover: null,
  pour: null,
  animation: null,
  toast: null,
  served: null,
  session: 0,

  setMode: (mode) => set({ mode }),

  resetBar: () =>
    set((s) => ({
      glass: null,
      shaker: emptyVessel(),
      mixing: emptyVessel(),
      blender: emptyVessel(),
      jigger: { sizeMl: s.jigger.sizeMl, contents: [] },
      held: null,
      hover: null,
      pour: null,
      animation: null,
      served: null,
      session: s.session + 1,
    })),

  setShelfCategory: (shelfCategory) => set({ shelfCategory }),
  setHeld: (held) => set({ held }),
  setHover: (hover) => set({ hover }),

  showToast: (text, tone = 'info') => {
    const id = nextId++
    set({ toast: { id, text, tone } })
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null })
    }, 2600)
  },
  clearToast: () => set({ toast: null }),

  pickGlass: (type) => {
    const s = get()
    if (s.animation) return
    if (s.glass && (s.glass.contents.length || s.glass.garnishes.length || s.glass.rim !== 'none')) {
      s.showToast('There is already a drink on the counter. Dump it in the bin first.', 'warn')
      return
    }
    set({ glass: newGlass(type) })
  },

  dumpGlass: () => {
    const s = get()
    if (!s.glass) return
    runAnimation(set, get, 'dump', 'glass', () => ({ glass: null }))
  },

  dumpVessel: (kind) => {
    if (kind === 'glass') {
      get().dumpGlass()
      return
    }
    runAnimation(set, get, 'dump', kind, () => ({ [kind]: emptyVessel() }) as Partial<BarState>)
  },

  startPour: (ingredientId, target) => {
    const s = get()
    if (s.animation) return
    if (target === 'glass' && !s.glass) return
    const ing = INGREDIENT_MAP[ingredientId]
    if (!ing) return
    if (s.pour && s.pour.ingredientId === ingredientId && s.pour.target === target) return
    set({ pour: { ingredientId, target, elapsedMs: 0, amount: 0 } })
  },

  tickPour: (dtMs) => {
    const s = get()
    const pour = s.pour
    if (!pour) return
    const ing = INGREDIENT_MAP[pour.ingredientId]
    if (!ing) return
    const unit = ing.unit === 'piece' ? 'dash' : ing.unit
    const { amount, elapsedMs } = advancePour(unit, pour.elapsedMs, dtMs)
    if (amount <= 0) {
      set({ pour: { ...pour, elapsedMs } })
      return
    }
    if (pour.target === 'jigger') {
      const ml = amount * (ing.unit === 'ml' ? 1 : ing.unit === 'tsp' ? 5 : 1)
      const current = totalMl(s.jigger.contents, (id) => INGREDIENT_MAP[id]?.unit ?? 'ml')
      const { ml: newTotal, overflowMl: spill } = fillJigger(current, ml, s.jigger.sizeMl)
      const added = newTotal - current
      const contents = added > 0 ? addContent(s.jigger.contents, pour.ingredientId, added) : s.jigger.contents
      if (spill > 0 && !s.toast) s.showToast('The jigger is full — it is spilling over.', 'warn')
      set({ jigger: { ...s.jigger, contents }, pour: { ...pour, elapsedMs, amount: pour.amount + added } })
      return
    }
    const key = pour.target
    const vessel = key === 'glass' ? s.glass : freshIfEmptied(s[key])
    if (!vessel) return
    const contents = addContent(vessel.contents, pour.ingredientId, amount)
    const history = addContent(vessel.history, pour.ingredientId, amount)
    const cap = vesselCapacity(s, key)
    const spilled = overflowMl(totalMl(contents, (id) => INGREDIENT_MAP[id]?.unit ?? 'ml'), cap, vessel.ice)
    if (spilled > vessel.spilledMl + 5 && vessel.spilledMl === 0) s.showToast('Overflowing! The glass is spilling onto the counter.', 'warn')
    const updated = { ...vessel, contents, history, spilledMl: spilled, emptied: false }
    set({ [key]: updated, pour: { ...pour, elapsedMs, amount: pour.amount + amount } } as Partial<BarState>)
  },

  stopPour: () => {
    const s = get()
    const pour = s.pour
    if (!pour) return
    const ing = INGREDIENT_MAP[pour.ingredientId]
    // A quick drop of a solid ingredient still adds one piece.
    if (ing && ing.unit === 'piece' && pour.amount === 0 && pour.target !== 'jigger') {
      s.addPieces(pour.ingredientId, pour.target, 1)
    }
    set({ pour: null })
  },

  addPieces: (ingredientId, target, count) => {
    const s = get()
    if (target === 'jigger') return
    const vessel = target === 'glass' ? s.glass : freshIfEmptied(s[target])
    if (!vessel) return
    const contents = addContent(vessel.contents, ingredientId, count)
    const history = addContent(vessel.history, ingredientId, count)
    set({ [target]: { ...vessel, contents, history, emptied: false } } as Partial<BarState>)
  },

  addIce: (target, type) => {
    const s = get()
    const vessel = target === 'glass' ? s.glass : freshIfEmptied(s[target])
    if (!vessel) {
      s.showToast('Put a glass on the counter first.', 'warn')
      return
    }
    runAnimation(set, get, 'ice', target, (st) => {
      const v = target === 'glass' ? st.glass : st[target]
      if (!v) return {}
      return { [target]: { ...v, ice: type, emptied: false } } as Partial<BarState>
    })
  },

  muddle: (target) => {
    const s = get()
    const vessel = target === 'glass' ? s.glass : s[target]
    if (!vessel || vessel.contents.length === 0) {
      s.showToast('Nothing to muddle yet.', 'warn')
      return
    }
    runAnimation(set, get, 'muddle', target, (st) => {
      const v = target === 'glass' ? st.glass : st[target]
      if (!v) return {}
      return { [target]: { ...v, muddled: true, mixedUpTo: v.contents.length } } as Partial<BarState>
    })
  },

  shake: () => {
    const s = get()
    if (s.shaker.contents.length === 0) {
      s.showToast('The shaker is empty.', 'warn')
      return
    }
    runAnimation(set, get, 'shake', 'shaker', (st) => ({
      shaker: { ...st.shaker, shaken: true, chilledWithIce: st.shaker.ice !== 'none', mixedUpTo: st.shaker.contents.length },
    }))
  },

  stir: () => {
    const s = get()
    if (s.mixing.contents.length === 0) {
      s.showToast('The mixing glass is empty.', 'warn')
      return
    }
    runAnimation(set, get, 'stir', 'mixing', (st) => ({
      mixing: { ...st.mixing, stirred: true, chilledWithIce: st.mixing.ice !== 'none', mixedUpTo: st.mixing.contents.length },
    }))
  },

  blend: () => {
    const s = get()
    if (s.blender.contents.length === 0) {
      s.showToast('The blender is empty.', 'warn')
      return
    }
    runAnimation(set, get, 'blend', 'blender', (st) => ({
      blender: { ...st.blender, blended: true, chilledWithIce: st.blender.ice !== 'none', mixedUpTo: st.blender.contents.length },
    }))
  },

  strain: (from) => {
    const s = get()
    const source = s[from]
    if (!s.glass) {
      s.showToast('Put a glass on the counter to strain into.', 'warn')
      return
    }
    if (source.contents.length === 0) {
      s.showToast(`${from === 'shaker' ? 'The shaker' : 'The mixing glass'} is empty.`, 'warn')
      return
    }
    runAnimation(set, get, 'strain', from, (st) => {
      const g = st.glass
      const src = st[from]
      if (!g) return {}
      let contents = g.contents
      for (const c of src.contents) contents = addContent(contents, c.id, c.amount)
      const cap = GLASS_MAP[g.type].capacityMl
      const spilled = overflowMl(totalMl(contents, (id) => INGREDIENT_MAP[id]?.unit ?? 'ml'), cap, g.ice)
      return {
        glass: {
          ...g,
          contents,
          mixedUpTo: contents.length,
          receivedFrom: [...g.receivedFrom, from],
          spilledMl: spilled,
        },
        [from]: { ...src, contents: [], ice: src.ice, emptied: true },
      } as Partial<BarState>
    })
  },

  pourOut: () => {
    const s = get()
    if (!s.glass) {
      s.showToast('Put a glass on the counter to pour into.', 'warn')
      return
    }
    if (s.blender.contents.length === 0) {
      s.showToast('The blender is empty.', 'warn')
      return
    }
    runAnimation(set, get, 'pour-out', 'blender', (st) => {
      const g = st.glass
      const src = st.blender
      if (!g) return {}
      let contents = g.contents
      for (const c of src.contents) contents = addContent(contents, c.id, c.amount)
      const cap = GLASS_MAP[g.type].capacityMl
      const ice: IceType = src.ice !== 'none' ? 'crushed' : g.ice
      const spilled = overflowMl(totalMl(contents, (id) => INGREDIENT_MAP[id]?.unit ?? 'ml'), cap, ice)
      return {
        glass: { ...g, contents, mixedUpTo: contents.length, ice, receivedFrom: [...g.receivedFrom, 'blender'], spilledMl: spilled },
        blender: { ...src, contents: [], ice: 'none', emptied: true },
      }
    })
  },

  stirInGlass: () => {
    const s = get()
    if (!s.glass || s.glass.contents.length === 0) {
      s.showToast('Nothing in the glass to stir.', 'warn')
      return
    }
    runAnimation(set, get, 'stir-glass', 'glass', (st) =>
      st.glass ? { glass: { ...st.glass, stirred: true, mixedUpTo: st.glass.contents.length } } : {},
    )
  },

  toggleLayerMode: () => {
    const s = get()
    if (!s.glass) {
      s.showToast('Put a glass on the counter first.', 'warn')
      return
    }
    set({ glass: { ...s.glass, layerMode: !s.glass.layerMode } })
  },

  wetRim: () => {
    const s = get()
    if (!s.glass) return
    if (s.glass.contents.length) {
      s.showToast('Rim the glass before you build the drink.', 'warn')
      return
    }
    runAnimation(set, get, 'rim-wet', 'glass', (st) => (st.glass ? { glass: { ...st.glass, rimWet: true } } : {}))
  },

  dipRim: (type) => {
    const s = get()
    if (!s.glass) return
    if (s.glass.contents.length) {
      s.showToast('Rim the glass before you build the drink.', 'warn')
      return
    }
    const wet = s.glass.rimWet
    runAnimation(set, get, 'rim-dip', 'glass', (st) => {
      if (!st.glass) return {}
      if (!wet) {
        st.showToast(`The ${type} does not stick — wet the rim on the lime first.`, 'warn')
        return {}
      }
      return { glass: { ...st.glass, rim: type } }
    })
  },

  addGarnish: (id) => {
    const s = get()
    if (!s.glass) {
      s.showToast('Put a glass on the counter first.', 'warn')
      return
    }
    if (s.glass.garnishes.includes(id)) return
    runAnimation(set, get, 'garnish', 'glass', (st) =>
      st.glass ? { glass: { ...st.glass, garnishes: [...st.glass.garnishes, id] } } : {},
    )
  },

  setJiggerSize: (ml) => set((s) => ({ jigger: { ...s.jigger, sizeMl: ml } })),

  pourJiggerInto: (target) => {
    const s = get()
    if (s.jigger.contents.length === 0) return
    const vessel = target === 'glass' ? s.glass : freshIfEmptied(s[target])
    if (!vessel) {
      s.showToast('Put a glass on the counter first.', 'warn')
      return
    }
    runAnimation(set, get, 'jigger-pour', target, (st) => {
      const v = target === 'glass' ? st.glass : freshIfEmptied(st[target])
      if (!v) return {}
      let contents = v.contents
      let history = v.history
      for (const c of st.jigger.contents) {
        contents = addContent(contents, c.id, c.amount)
        history = addContent(history, c.id, c.amount)
      }
      const cap = vesselCapacity(st, target)
      const spilled = overflowMl(totalMl(contents, (id) => INGREDIENT_MAP[id]?.unit ?? 'ml'), cap, v.ice)
      return {
        [target]: { ...v, contents, history, spilledMl: spilled, emptied: false },
        jigger: { ...st.jigger, contents: [] },
      } as Partial<BarState>
    })
  },

  emptyJigger: () => set((s) => ({ jigger: { ...s.jigger, contents: [] } })),

  serve: () => {
    const s = get()
    if (!s.glass) {
      s.showToast('There is no drink to serve.', 'warn')
      return null
    }
    const drink = deriveServedDrink(s)
    let recipe: Recipe | null = null
    let result: ScoreResult | null = null
    if (s.mode.kind === 'free') {
      const best = identifyDrink(RECIPES, drink)
      if (best && best.result.total >= 60) {
        recipe = best.recipe
        result = best.result
      }
    } else {
      recipe = RECIPE_MAP[s.mode.recipeId] ?? null
      if (recipe) result = scoreDrink(recipe, drink)
    }
    const outcome: ServeOutcome = { drink, recipe, result }
    set({ served: outcome, pour: null, held: null, hover: null })
    return outcome
  },

  dismissServe: () => set({ served: null }),
}))

export function deriveMethod(glass: GlassVessel): ServedDrink['method'] {
  if (glass.receivedFrom.includes('shaker')) return 'shake'
  if (glass.receivedFrom.includes('mixing')) return 'stir'
  if (glass.receivedFrom.includes('blender')) return 'blend'
  if (glass.layerMode && glass.contents.length >= 2) return 'layer'
  return 'build'
}

export function deriveServedDrink(s: Pick<BarState, 'glass' | 'shaker' | 'mixing' | 'blender'>): ServedDrink {
  const g = s.glass
  if (!g) {
    return { glass: null, contents: [], ice: 'none', method: 'build', chilledWithIce: false, rim: 'none', garnishes: [], muddled: false }
  }
  const method = deriveMethod(g)
  const chilledWithIce =
    method === 'shake' ? s.shaker.chilledWithIce : method === 'stir' ? s.mixing.chilledWithIce : method === 'blend' ? s.blender.chilledWithIce : false
  return {
    glass: g.type,
    contents: g.contents,
    ice: g.ice,
    method,
    chilledWithIce,
    rim: g.rim,
    garnishes: g.garnishes,
    muddled: g.muddled || s.shaker.muddled || s.mixing.muddled,
  }
}

function vesselSnapshot(v: Vessel): VesselSnapshot {
  return { ice: v.ice, history: v.history, muddled: v.muddled, shaken: v.shaken, stirred: v.stirred, blended: v.blended }
}

export function snapshotForGuided(s: Pick<BarState, 'glass' | 'shaker' | 'mixing' | 'blender' | 'served'>): BarSnapshot {
  const glass: GlassSnapshot | null = s.glass
    ? {
        ...vesselSnapshot(s.glass),
        type: s.glass.type,
        rimWet: s.glass.rimWet,
        rim: s.glass.rim,
        garnishes: s.glass.garnishes,
        layerMode: s.glass.layerMode,
        receivedFrom: s.glass.receivedFrom,
      }
    : null
  return {
    glass,
    shaker: vesselSnapshot(s.shaker),
    mixing: vesselSnapshot(s.mixing),
    blender: vesselSnapshot(s.blender),
    served: !!s.served,
  }
}
