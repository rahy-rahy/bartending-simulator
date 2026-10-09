/** Shared domain types for the bar, the recipe library and the scoring engine. */

export type Unit = 'ml' | 'dash' | 'tsp' | 'piece'

export type IngredientCategory =
  | 'vodka'
  | 'gin'
  | 'rum'
  | 'tequila'
  | 'whiskey'
  | 'brandy'
  | 'liqueurs'
  | 'vermouth-bitters'
  | 'wine-sparkling'
  | 'juices'
  | 'sodas'
  | 'syrups'
  | 'dairy'
  | 'pantry'

export type BottleShape =
  | 'tall' // vodka / gin style
  | 'round' // shouldered spirit bottle
  | 'square' // whiskey style
  | 'flask' // liqueur style
  | 'dasher' // small bitters bottle
  | 'carton' // juice carton
  | 'soda' // soda bottle
  | 'jar' // syrup / pantry jar
  | 'can' // energy drink can
  | 'wine' // wine / sparkling
  | 'cup' // cream jug / coffee cup / egg bowl
  | 'bowl' // produce bowl

export interface Ingredient {
  id: string
  name: string
  /** Short text printed on the bottle label (<= 14 chars). */
  label: string
  category: IngredientCategory
  /** Liquid colour (hex). */
  color: string
  /** 0..1 how opaque the liquid looks. Clear spirits are ~0.15. */
  opacity: number
  /** Native unit used by recipes for this ingredient. */
  unit: Unit
  /** For `piece` ingredients: singular/plural names, e.g. ["wedge", "wedges"]. */
  pieceName?: [string, string]
  /** If set, this bottle counts as this canonical ingredient when scoring (e.g. a second vodka brand). */
  equivalentTo?: string
  abv?: number
  bottle: {
    shape: BottleShape
    /** Label background colour. */
    labelColor: string
    /** Text colour on the label. */
    textColor: string
    capColor: string
    /** Glass tint of the bottle: clear, green, brown, frosted or black. */
    glass: 'clear' | 'green' | 'brown' | 'frosted' | 'black' | 'blue'
  }
  description: string
}

export type GlassType =
  | 'highball'
  | 'rocks'
  | 'coupe'
  | 'martini'
  | 'margarita'
  | 'shot'
  | 'collins'
  | 'hurricane'
  | 'flute'
  | 'wine'
  | 'mug'
  | 'irish'

export interface GlassSpec {
  id: GlassType
  name: string
  capacityMl: number
  description: string
}

export type GarnishId =
  | 'lime-wedge'
  | 'lime-wheel'
  | 'lemon-twist'
  | 'lemon-wheel'
  | 'lemon-wedge'
  | 'orange-slice'
  | 'orange-twist'
  | 'mint-sprig'
  | 'cherry'
  | 'olive'
  | 'cucumber'
  | 'umbrella'
  | 'straw'
  | 'nutmeg'
  | 'pineapple-wedge'
  | 'celery'
  | 'berries'
  | 'coffee-beans'
  | 'cocktail-onion'
  | 'candied-ginger'
  | 'apple-slice'
  | 'cinnamon-stick'

export interface GarnishSpec {
  id: GarnishId
  name: string
  color: string
  description: string
}

export type Method = 'build' | 'shake' | 'stir' | 'blend' | 'layer'
export type IceType = 'cubes' | 'crushed' | 'none'
export type RimType = 'none' | 'salt' | 'sugar'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type BaseSpirit =
  | 'vodka'
  | 'gin'
  | 'rum'
  | 'tequila'
  | 'whiskey'
  | 'brandy'
  | 'liqueur'
  | 'wine'
  | 'other'

export interface RecipeIngredient {
  /** Canonical ingredient id (must exist in the bar). */
  id: string
  /** Amount in the ingredient's native unit (ml, dash, tsp or piece). */
  amount: number
  /** Added to the glass after shaking/stirring/straining (top-ups and floats). */
  top?: boolean
  /** Free text shown next to the amount, e.g. "float" or "rinse". */
  note?: string
}

export interface Recipe {
  id: string
  name: string
  glass: GlassType
  method: Method
  ice: IceType
  rim: RimType
  garnish: GarnishId[]
  ingredients: RecipeIngredient[]
  /** Solid ingredients are muddled in the vessel before building. */
  muddle?: boolean
  difficulty: Difficulty
  base: BaseSpirit
  description: string
  tags: string[]
  /** Overrides the name used when looking the drink up on TheCocktailDB during development. */
  imageQuery?: string
  iba?: boolean
}

export interface RecipeImage {
  src: string
  source: 'cocktaildb' | 'svg'
  bytes: number
}
