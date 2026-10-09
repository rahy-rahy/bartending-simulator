import type { Ingredient, IngredientCategory } from './types'

export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  vodka: 'Vodka',
  gin: 'Gin',
  rum: 'Rum',
  tequila: 'Tequila',
  whiskey: 'Whiskey',
  brandy: 'Brandy & Others',
  liqueurs: 'Liqueurs',
  'vermouth-bitters': 'Vermouth & Bitters',
  'wine-sparkling': 'Wine & Sparkling',
  juices: 'Juices',
  sodas: 'Soft Drinks & Sodas',
  syrups: 'Syrups',
  dairy: 'Cream, Eggs & Coffee',
  pantry: 'Pantry & Produce',
}

export const CATEGORY_ORDER: IngredientCategory[] = [
  'vodka',
  'gin',
  'rum',
  'tequila',
  'whiskey',
  'brandy',
  'liqueurs',
  'vermouth-bitters',
  'wine-sparkling',
  'juices',
  'sodas',
  'syrups',
  'dairy',
  'pantry',
]

type Partial_ = Omit<Ingredient, 'unit' | 'opacity' | 'bottle'> & {
  unit?: Ingredient['unit']
  opacity?: number
  bottle?: Partial<Ingredient['bottle']>
}

const SHAPE_BY_CATEGORY: Record<IngredientCategory, Ingredient['bottle']['shape']> = {
  vodka: 'tall',
  gin: 'tall',
  rum: 'round',
  tequila: 'round',
  whiskey: 'square',
  brandy: 'round',
  liqueurs: 'flask',
  'vermouth-bitters': 'round',
  'wine-sparkling': 'wine',
  juices: 'carton',
  sodas: 'soda',
  syrups: 'jar',
  dairy: 'cup',
  pantry: 'bowl',
}

function ing(i: Partial_): Ingredient {
  return {
    unit: 'ml',
    opacity: 0.85,
    ...i,
    bottle: {
      shape: SHAPE_BY_CATEGORY[i.category],
      labelColor: '#f1e4c3',
      textColor: '#2a1a0c',
      capColor: '#2a2a2a',
      glass: 'clear',
      ...(i.bottle ?? {}),
    },
  }
}

const CLEAR = '#e9f2f6'

export const INGREDIENTS: Ingredient[] = [
  // ---------------------------------------------------------------- VODKA
  ing({ id: 'vodka', name: 'Vodka', label: 'VODKA', category: 'vodka', color: CLEAR, opacity: 0.14, abv: 40, bottle: { labelColor: '#dfe7ee', capColor: '#9aa5ad' }, description: 'Clean, neutral grain vodka. The workhorse of the mixed-drink world.' }),
  ing({ id: 'wheat-vodka', name: 'Premium Wheat Vodka', label: 'WHEAT VODKA', category: 'vodka', color: CLEAR, opacity: 0.14, abv: 40, equivalentTo: 'vodka', bottle: { labelColor: '#1b2b44', textColor: '#f3f3f3', capColor: '#c9c9c9', glass: 'frosted' }, description: 'Soft, slightly sweet wheat vodka. Interchangeable with any vodka in recipes.' }),
  ing({ id: 'potato-vodka', name: 'Potato Vodka', label: 'POTATO VODKA', category: 'vodka', color: CLEAR, opacity: 0.14, abv: 40, equivalentTo: 'vodka', bottle: { labelColor: '#8e2b2b', textColor: '#fff2e0', capColor: '#d4a84b' }, description: 'Creamy, full-bodied vodka. Interchangeable with any vodka in recipes.' }),
  ing({ id: 'citron-vodka', name: 'Citron Vodka', label: 'CITRON', category: 'vodka', color: '#f3f6dc', opacity: 0.2, abv: 40, bottle: { labelColor: '#f5e76b', capColor: '#d9c12b' }, description: 'Lemon-flavoured vodka used in the Cosmopolitan and Lemon Drop.' }),
  ing({ id: 'vanilla-vodka', name: 'Vanilla Vodka', label: 'VANILLA', category: 'vodka', color: '#f3eedd', opacity: 0.2, abv: 37.5, bottle: { labelColor: '#f1dfbf', capColor: '#6b4b2a' }, description: 'Vanilla-infused vodka, the base of the Pornstar Martini.' }),

  // ---------------------------------------------------------------- GIN
  ing({ id: 'gin', name: 'London Dry Gin', label: 'LONDON DRY', category: 'gin', color: CLEAR, opacity: 0.14, abv: 43, bottle: { labelColor: '#eef0e6', capColor: '#2b4a2f', glass: 'green' }, description: 'Juniper-forward London Dry. The default gin for every classic.' }),
  ing({ id: 'plymouth-gin', name: 'Plymouth Gin', label: 'PLYMOUTH', category: 'gin', color: CLEAR, opacity: 0.14, abv: 41.2, equivalentTo: 'gin', bottle: { labelColor: '#1d3a5a', textColor: '#f6f6f6', capColor: '#b9b9b9' }, description: 'Softer, earthier gin. Interchangeable with London Dry in recipes.' }),
  ing({ id: 'navy-gin', name: 'Navy Strength Gin', label: 'NAVY STR.', category: 'gin', color: CLEAR, opacity: 0.14, abv: 57, equivalentTo: 'gin', bottle: { labelColor: '#28303a', textColor: '#f2e6c8', capColor: '#c9a24b', glass: 'blue' }, description: 'Overproof gin with extra bite. Counts as gin in recipes.' }),
  ing({ id: 'old-tom-gin', name: 'Old Tom Gin', label: 'OLD TOM', category: 'gin', color: '#f2f1e2', opacity: 0.18, abv: 40, bottle: { labelColor: '#d9c59a', capColor: '#3b2a1a' }, description: 'Slightly sweetened, old-style gin for the Martinez, Casino and Tuxedo.' }),
  ing({ id: 'sloe-gin', name: 'Sloe Gin', label: 'SLOE GIN', category: 'gin', color: '#a3243b', opacity: 0.85, abv: 26, bottle: { labelColor: '#5a1020', textColor: '#f6e2e2', capColor: '#2a2a2a' }, description: 'Ruby-red sloe berry liqueur made on a gin base.' }),

  // ---------------------------------------------------------------- RUM
  ing({ id: 'white-rum', name: 'White Rum', label: 'WHITE RUM', category: 'rum', color: '#f1f4ef', opacity: 0.15, abv: 40, bottle: { labelColor: '#f5f5f5', capColor: '#7a1f1f' }, description: 'Light, dry Cuban-style rum for Daiquiris and Mojitos.' }),
  ing({ id: 'gold-rum', name: 'Gold Rum', label: 'GOLD RUM', category: 'rum', color: '#d9a04a', opacity: 0.75, abv: 40, bottle: { labelColor: '#c9962e', capColor: '#4a2a12' }, description: 'Lightly aged amber rum with vanilla and caramel notes.' }),
  ing({ id: 'dark-rum', name: 'Dark Rum', label: 'DARK RUM', category: 'rum', color: '#5a2d0c', opacity: 0.92, abv: 40, bottle: { labelColor: '#2d1508', textColor: '#f4e5c9', capColor: '#d4a84b', glass: 'brown' }, description: 'Rich, molasses-heavy aged rum for Dark ’n’ Stormy and tiki drinks.' }),
  ing({ id: 'spiced-rum', name: 'Spiced Rum', label: 'SPICED RUM', category: 'rum', color: '#8b4513', opacity: 0.88, abv: 35, bottle: { labelColor: '#6b2f12', textColor: '#f8e4c0', capColor: '#2a2a2a', glass: 'brown' }, description: 'Gold rum infused with vanilla, cinnamon and clove.' }),
  ing({ id: 'overproof-rum', name: 'Overproof Rum (151)', label: '151 PROOF', category: 'rum', color: '#c99a4a', opacity: 0.7, abv: 75.5, bottle: { labelColor: '#f2d35a', capColor: '#111', glass: 'brown' }, description: 'Fiery high-proof rum used in small doses in the Zombie.' }),
  ing({ id: 'coconut-rum', name: 'Coconut Rum', label: 'COCONUT RUM', category: 'rum', color: '#f5f5ef', opacity: 0.2, abv: 21, bottle: { labelColor: '#ffffff', capColor: '#3a8f5a', glass: 'frosted' }, description: 'Sweet coconut-flavoured rum liqueur for beach drinks.' }),
  ing({ id: 'cachaca', name: 'Cachaça', label: 'CACHAÇA', category: 'rum', color: '#f0f4ea', opacity: 0.16, abv: 40, bottle: { labelColor: '#2e8b57', textColor: '#f5f5f5', capColor: '#f2c14e' }, description: 'Brazilian sugar-cane spirit, grassy and funky. Essential for the Caipirinha.' }),

  // ---------------------------------------------------------------- TEQUILA
  ing({ id: 'tequila', name: 'Blanco Tequila', label: 'BLANCO', category: 'tequila', color: '#f2f4ea', opacity: 0.15, abv: 40, bottle: { labelColor: '#f5f1e6', capColor: '#1f6f8b' }, description: 'Unaged 100% agave tequila. Bright, peppery and the default for Margaritas.' }),
  ing({ id: 'reposado-tequila', name: 'Reposado Tequila', label: 'REPOSADO', category: 'tequila', color: '#e9c57a', opacity: 0.55, abv: 40, bottle: { labelColor: '#c98a2e', capColor: '#2a2a2a' }, description: 'Tequila rested in oak for a few months. Softer with light vanilla.' }),
  ing({ id: 'anejo-tequila', name: 'Añejo Tequila', label: 'AÑEJO', category: 'tequila', color: '#c9913a', opacity: 0.7, abv: 40, equivalentTo: 'reposado-tequila', bottle: { labelColor: '#3b2210', textColor: '#f5dfae', capColor: '#d4a84b' }, description: 'Aged tequila, rich and oaky. Counts as reposado in recipes.' }),
  ing({ id: 'mezcal', name: 'Mezcal', label: 'MEZCAL', category: 'tequila', color: '#f0f2e8', opacity: 0.16, abv: 45, bottle: { labelColor: '#1e1e1e', textColor: '#f2e6c8', capColor: '#8b1a1a', glass: 'black' }, description: 'Smoky agave spirit. Swap it for tequila in a Margarita for a mezcal version.' }),

  // ---------------------------------------------------------------- WHISKEY
  ing({ id: 'bourbon', name: 'Bourbon', label: 'BOURBON', category: 'whiskey', color: '#b5651d', opacity: 0.85, abv: 45, bottle: { labelColor: '#f3e6c6', capColor: '#8b1a1a' }, description: 'Sweet corn-based American whiskey. Old Fashioneds and Whiskey Sours start here.' }),
  ing({ id: 'rye', name: 'Rye Whiskey', label: 'RYE', category: 'whiskey', color: '#c0722a', opacity: 0.85, abv: 45, bottle: { labelColor: '#2a2a2a', textColor: '#f2d7a0', capColor: '#d4a84b' }, description: 'Spicy, dry American whiskey. The classic Manhattan and Sazerac base.' }),
  ing({ id: 'tennessee-whiskey', name: 'Tennessee Whiskey', label: 'TENNESSEE', category: 'whiskey', color: '#b5651d', opacity: 0.85, abv: 40, bottle: { labelColor: '#111', textColor: '#f5f5f5', capColor: '#111' }, description: 'Charcoal-mellowed whiskey. Jack and Coke, Lynchburg Lemonade.' }),
  ing({ id: 'scotch', name: 'Blended Scotch', label: 'SCOTCH', category: 'whiskey', color: '#d59b3a', opacity: 0.8, abv: 40, bottle: { labelColor: '#c8a24b', capColor: '#2a2a2a' }, description: 'Smooth blended Scotch whisky for the Rob Roy, Rusty Nail and Penicillin.' }),
  ing({ id: 'islay-scotch', name: 'Islay Single Malt', label: 'ISLAY MALT', category: 'whiskey', color: '#c8933a', opacity: 0.8, abv: 46, bottle: { labelColor: '#1f3b2f', textColor: '#f0e6c8', capColor: '#b9b9b9', glass: 'green' }, description: 'Peaty, smoky single malt. Floated on top of a Penicillin.' }),
  ing({ id: 'irish-whiskey', name: 'Irish Whiskey', label: 'IRISH', category: 'whiskey', color: '#d4a24c', opacity: 0.8, abv: 40, bottle: { labelColor: '#1d6b3a', textColor: '#f5f5f5', capColor: '#d4a84b', glass: 'green' }, description: 'Triple-distilled, light and smooth. Irish Coffee and the Tipperary.' }),
  ing({ id: 'canadian-whisky', name: 'Canadian Whisky', label: 'CANADIAN', category: 'whiskey', color: '#d19a4a', opacity: 0.8, abv: 40, bottle: { labelColor: '#6b1a7a', textColor: '#f5f5f5', capColor: '#d4a84b' }, description: 'Light blended whisky for the Washington Apple and the Seven & Seven.' }),
  ing({ id: 'japanese-whisky', name: 'Japanese Whisky', label: 'JAPANESE', category: 'whiskey', color: '#d6a65a', opacity: 0.8, abv: 43, equivalentTo: 'scotch', bottle: { labelColor: '#f7f3ea', capColor: '#2a2a2a' }, description: 'Elegant, balanced whisky perfect for a Highball. Counts as Scotch in recipes.' }),

  // ---------------------------------------------------------------- BRANDY & OTHERS
  ing({ id: 'cognac', name: 'Cognac VSOP', label: 'COGNAC', category: 'brandy', color: '#a85a1a', opacity: 0.88, abv: 40, bottle: { labelColor: '#f0dcae', capColor: '#2a2a2a' }, description: 'Grape brandy from Cognac. Sidecar, Brandy Alexander and the Sazerac.' }),
  ing({ id: 'brandy', name: 'Brandy', label: 'BRANDY', category: 'brandy', color: '#b3661f', opacity: 0.88, abv: 38, equivalentTo: 'cognac', bottle: { labelColor: '#8b2a1a', textColor: '#f8e4c0', capColor: '#d4a84b' }, description: 'Everyday grape brandy. Counts as Cognac in recipes.' }),
  ing({ id: 'apple-brandy', name: 'Apple Brandy (Calvados)', label: 'CALVADOS', category: 'brandy', color: '#c99a4a', opacity: 0.7, abv: 40, bottle: { labelColor: '#c7d9a8', capColor: '#4a2a12' }, description: 'Apple brandy from Normandy. Angel Face, Jack Rose and Corpse Reviver No.1.' }),
  ing({ id: 'pisco', name: 'Pisco', label: 'PISCO', category: 'brandy', color: '#f3f4ea', opacity: 0.16, abv: 42, bottle: { labelColor: '#ffffff', capColor: '#b11a1a' }, description: 'Unaged grape brandy from Peru and Chile. Pisco Sour.' }),
  ing({ id: 'absinthe', name: 'Absinthe', label: 'ABSINTHE', category: 'brandy', color: '#9ccf5a', opacity: 0.7, abv: 68, unit: 'dash', bottle: { shape: 'dasher', labelColor: '#1f3a1f', textColor: '#cfe8a0', capColor: '#111', glass: 'green' }, description: 'Anise and wormwood spirit. Used in dashes and rinses.' }),

  // ---------------------------------------------------------------- LIQUEURS
  ing({ id: 'triple-sec', name: 'Triple Sec', label: 'TRIPLE SEC', category: 'liqueurs', color: '#f4f2e6', opacity: 0.22, abv: 40, bottle: { labelColor: '#f7f3e4', capColor: '#d9842b' }, description: 'Dry orange liqueur. Margarita, Cosmopolitan, Sidecar, White Lady.' }),
  ing({ id: 'cointreau', name: 'Cointreau', label: 'COINTREAU', category: 'liqueurs', color: '#f4f2e6', opacity: 0.22, abv: 40, equivalentTo: 'triple-sec', bottle: { labelColor: '#f0e7cf', capColor: '#d9842b', glass: 'frosted' }, description: 'Premium French orange liqueur. Counts as triple sec in recipes.' }),
  ing({ id: 'grand-marnier', name: 'Grand Marnier', label: 'GRAND MARNIER', category: 'liqueurs', color: '#c7731c', opacity: 0.85, abv: 40, bottle: { labelColor: '#8b1a1a', textColor: '#f8e4c0', capColor: '#d4a84b' }, description: 'Cognac-based orange liqueur. B-52 and the Cadillac Margarita.' }),
  ing({ id: 'orange-curacao', name: 'Orange Curaçao', label: 'CURAÇAO', category: 'liqueurs', color: '#e38a1d', opacity: 0.8, abv: 30, bottle: { labelColor: '#f2a63a', capColor: '#2a2a2a' }, description: 'Orange liqueur with a deeper, candied flavour. Mai Tai and El Presidente.' }),
  ing({ id: 'blue-curacao', name: 'Blue Curaçao', label: 'BLUE CURAÇAO', category: 'liqueurs', color: '#1e6fd9', opacity: 0.9, abv: 25, bottle: { labelColor: '#1e6fd9', textColor: '#ffffff', capColor: '#111', glass: 'blue' }, description: 'Same orange liqueur, dyed electric blue. Blue Lagoon and Blue Hawaiian.' }),
  ing({ id: 'maraschino', name: 'Maraschino Liqueur', label: 'MARASCHINO', category: 'liqueurs', color: '#f2f3ec', opacity: 0.22, abv: 32, bottle: { labelColor: '#f6f0dc', capColor: '#8b1a1a', glass: 'frosted' }, description: 'Clear, funky cherry liqueur. Aviation, Last Word, Hemingway Daiquiri.' }),
  ing({ id: 'creme-de-violette', name: 'Crème de Violette', label: 'VIOLETTE', category: 'liqueurs', color: '#8a5fcf', opacity: 0.8, abv: 20, bottle: { labelColor: '#6b3fb5', textColor: '#f5f0ff', capColor: '#2a2a2a' }, description: 'Floral violet liqueur that gives the Aviation its sky-blue tint.' }),
  ing({ id: 'green-chartreuse', name: 'Green Chartreuse', label: 'CHARTREUSE', category: 'liqueurs', color: '#8db83a', opacity: 0.85, abv: 55, bottle: { labelColor: '#3a7a2a', textColor: '#f5f5d5', capColor: '#d4a84b', glass: 'green' }, description: 'Herbal liqueur made by monks with 130 botanicals. Last Word, Bijou.' }),
  ing({ id: 'yellow-chartreuse', name: 'Yellow Chartreuse', label: 'Y. CHARTREUSE', category: 'liqueurs', color: '#e6c642', opacity: 0.85, abv: 40, bottle: { labelColor: '#e6c642', capColor: '#2a2a2a' }, description: 'Sweeter, honeyed sibling of Green Chartreuse. Naked and Famous, Alaska.' }),
  ing({ id: 'benedictine', name: 'Bénédictine', label: 'BÉNÉDICTINE', category: 'liqueurs', color: '#c9a23a', opacity: 0.85, abv: 40, bottle: { labelColor: '#3b2a1a', textColor: '#f5dfae', capColor: '#8b1a1a' }, description: 'Honeyed herbal liqueur. Singapore Sling, Vieux Carré, B&B.' }),
  ing({ id: 'drambuie', name: 'Drambuie', label: 'DRAMBUIE', category: 'liqueurs', color: '#d6a52c', opacity: 0.85, abv: 40, bottle: { labelColor: '#8b1a1a', textColor: '#f5dfae', capColor: '#d4a84b' }, description: 'Scotch whisky liqueur with heather honey and herbs. The Rusty Nail.' }),
  ing({ id: 'amaretto', name: 'Amaretto', label: 'AMARETTO', category: 'liqueurs', color: '#a3581a', opacity: 0.88, abv: 28, bottle: { labelColor: '#2a1a0c', textColor: '#f3d9a8', capColor: '#d4a84b', glass: 'brown' }, description: 'Sweet almond liqueur. Amaretto Sour, Godfather, French Connection.' }),
  ing({ id: 'coffee-liqueur', name: 'Coffee Liqueur', label: 'COFFEE LIQ.', category: 'liqueurs', color: '#2b1608', opacity: 0.95, abv: 20, bottle: { labelColor: '#d9b06a', capColor: '#8b1a1a', glass: 'brown' }, description: 'Dark, sweet coffee liqueur. Espresso Martini, Black and White Russian.' }),
  ing({ id: 'irish-cream', name: 'Irish Cream', label: 'IRISH CREAM', category: 'liqueurs', color: '#d8c3a0', opacity: 0.97, abv: 17, bottle: { labelColor: '#f5ecd8', capColor: '#2a2a2a', glass: 'brown' }, description: 'Whiskey and cream liqueur. B-52, Mudslide, Baby Guinness.' }),
  ing({ id: 'creme-de-cacao-white', name: 'White Crème de Cacao', label: 'WHITE CACAO', category: 'liqueurs', color: '#f3f1ea', opacity: 0.25, abv: 24, bottle: { labelColor: '#f7f3ea', capColor: '#5a3a1a' }, description: 'Clear chocolate liqueur. Grasshopper and the 20th Century.' }),
  ing({ id: 'creme-de-cacao-dark', name: 'Dark Crème de Cacao', label: 'DARK CACAO', category: 'liqueurs', color: '#4a2a10', opacity: 0.92, abv: 24, bottle: { labelColor: '#3b1f0c', textColor: '#f3d9a8', capColor: '#d4a84b', glass: 'brown' }, description: 'Brown chocolate liqueur. Brandy Alexander.' }),
  ing({ id: 'creme-de-menthe-green', name: 'Green Crème de Menthe', label: 'GREEN MENTHE', category: 'liqueurs', color: '#2fa84f', opacity: 0.88, abv: 24, bottle: { labelColor: '#2fa84f', textColor: '#ffffff', capColor: '#111', glass: 'green' }, description: 'Bright green mint liqueur. The Grasshopper.' }),
  ing({ id: 'creme-de-menthe-white', name: 'White Crème de Menthe', label: 'WHITE MENTHE', category: 'liqueurs', color: '#f1f6f3', opacity: 0.25, abv: 24, bottle: { labelColor: '#eaf6ef', capColor: '#2fa84f' }, description: 'Clear mint liqueur. The Stinger.' }),
  ing({ id: 'creme-de-cassis', name: 'Crème de Cassis', label: 'CASSIS', category: 'liqueurs', color: '#5b1133', opacity: 0.95, abv: 20, bottle: { labelColor: '#3a0a20', textColor: '#f5d9e5', capColor: '#2a2a2a' }, description: 'Blackcurrant liqueur. Kir, Kir Royal, El Diablo.' }),
  ing({ id: 'creme-de-mure', name: 'Crème de Mûre', label: 'MÛRE', category: 'liqueurs', color: '#3f1a4a', opacity: 0.95, abv: 20, bottle: { labelColor: '#4a1a5a', textColor: '#f5e5ff', capColor: '#2a2a2a' }, description: 'Blackberry liqueur drizzled over a Bramble.' }),
  ing({ id: 'raspberry-liqueur', name: 'Raspberry Liqueur', label: 'RASPBERRY', category: 'liqueurs', color: '#6b1a3a', opacity: 0.92, abv: 16.5, bottle: { labelColor: '#8b1a3a', textColor: '#ffe6ee', capColor: '#d4a84b', glass: 'brown' }, description: 'Chambord-style black raspberry liqueur. French Martini.' }),
  ing({ id: 'peach-schnapps', name: 'Peach Schnapps', label: 'PEACH', category: 'liqueurs', color: '#f7c97a', opacity: 0.45, abv: 20, bottle: { labelColor: '#f8b26b', capColor: '#2a2a2a' }, description: 'Sweet peach liqueur. Sex on the Beach, Fuzzy Navel, Woo Woo.' }),
  ing({ id: 'apricot-brandy', name: 'Apricot Brandy', label: 'APRICOT', category: 'liqueurs', color: '#e39a3c', opacity: 0.8, abv: 24, bottle: { labelColor: '#f2b35a', capColor: '#4a2a12' }, description: 'Apricot liqueur. Angel Face and Paradise.' }),
  ing({ id: 'cherry-liqueur', name: 'Cherry Liqueur (Heering)', label: 'CHERRY', category: 'liqueurs', color: '#8a1a2e', opacity: 0.92, abv: 24, bottle: { labelColor: '#5a0a1a', textColor: '#ffe0e6', capColor: '#111', glass: 'brown' }, description: 'Danish cherry liqueur. Singapore Sling, Blood and Sand.' }),
  ing({ id: 'galliano', name: 'Galliano', label: 'GALLIANO', category: 'liqueurs', color: '#f2d03b', opacity: 0.85, abv: 42.3, bottle: { shape: 'tall', labelColor: '#f2d03b', capColor: '#2a2a2a' }, description: 'Vanilla-anise Italian liqueur. Harvey Wallbanger, Golden Dream, Yellow Bird.' }),
  ing({ id: 'elderflower-liqueur', name: 'Elderflower Liqueur', label: 'ELDERFLOWER', category: 'liqueurs', color: '#f3f0d8', opacity: 0.3, abv: 20, bottle: { labelColor: '#f6f2e0', capColor: '#b9b9b9', glass: 'frosted' }, description: 'St-Germain-style floral liqueur. Hugo, Elderflower Collins.' }),
  ing({ id: 'midori', name: 'Melon Liqueur (Midori)', label: 'MELON', category: 'liqueurs', color: '#5fd35f', opacity: 0.85, abv: 20, bottle: { labelColor: '#3cb043', textColor: '#ffffff', capColor: '#111', glass: 'green' }, description: 'Neon green melon liqueur. Midori Sour, Japanese Slipper.' }),
  ing({ id: 'sour-apple-schnapps', name: 'Sour Apple Schnapps', label: 'SOUR APPLE', category: 'liqueurs', color: '#9ad43a', opacity: 0.8, abv: 15, bottle: { labelColor: '#9ad43a', capColor: '#2a2a2a' }, description: 'Tart green-apple liqueur. Appletini and Washington Apple.' }),
  ing({ id: 'sambuca', name: 'Sambuca', label: 'SAMBUCA', category: 'liqueurs', color: '#f2f3ee', opacity: 0.25, abv: 38, bottle: { labelColor: '#111', textColor: '#f5f5f5', capColor: '#111' }, description: 'Italian anise liqueur. Served with three coffee beans or layered in a Slippery Nipple.' }),
  ing({ id: 'jagermeister', name: 'Jägermeister', label: 'JÄGER', category: 'liqueurs', color: '#2d1a0e', opacity: 0.95, abv: 35, bottle: { labelColor: '#1f4a2a', textColor: '#f5dfae', capColor: '#2a2a2a', glass: 'green' }, description: 'German herbal digestif. The Jägerbomb.' }),
  ing({ id: 'banana-liqueur', name: 'Banana Liqueur', label: 'BANANA', category: 'liqueurs', color: '#f3d66b', opacity: 0.8, abv: 25, bottle: { labelColor: '#f3d66b', capColor: '#2a2a2a' }, description: 'Sweet banana liqueur. Rum Runner and the Banana Daiquiri.' }),
  ing({ id: 'passion-fruit-liqueur', name: 'Passion Fruit Liqueur', label: 'PASSION', category: 'liqueurs', color: '#e8543a', opacity: 0.85, abv: 17, bottle: { labelColor: '#111', textColor: '#f4b1a0', capColor: '#111', glass: 'black' }, description: 'Passoã-style passion fruit liqueur. Pornstar Martini.' }),
  ing({ id: 'falernum', name: 'Falernum', label: 'FALERNUM', category: 'liqueurs', color: '#efe3b5', opacity: 0.5, abv: 11, bottle: { labelColor: '#f5e6b8', capColor: '#4a2a12' }, description: 'Caribbean lime, ginger, almond and clove liqueur. Zombie, Corn ’n’ Oil.' }),
  ing({ id: 'limoncello', name: 'Limoncello', label: 'LIMONCELLO', category: 'liqueurs', color: '#f2e35a', opacity: 0.85, abv: 28, bottle: { labelColor: '#f8ea6a', capColor: '#2a2a2a' }, description: 'Italian lemon liqueur. Limoncello Spritz and the Limoncello Collins.' }),

  // ---------------------------------------------------------------- VERMOUTH, APERITIFS & BITTERS
  ing({ id: 'sweet-vermouth', name: 'Sweet Vermouth', label: 'SWEET VERM.', category: 'vermouth-bitters', color: '#8a2a2a', opacity: 0.85, abv: 16, bottle: { shape: 'wine', labelColor: '#7a1a1a', textColor: '#f8e4c0', capColor: '#d4a84b', glass: 'brown' }, description: 'Red Italian vermouth. Manhattan, Negroni, Americano.' }),
  ing({ id: 'dry-vermouth', name: 'Dry Vermouth', label: 'DRY VERM.', category: 'vermouth-bitters', color: '#f1efd6', opacity: 0.35, abv: 18, bottle: { shape: 'wine', labelColor: '#f5f1e0', capColor: '#2a2a2a', glass: 'green' }, description: 'Pale French vermouth. The Dry Martini and Gibson.' }),
  ing({ id: 'lillet-blanc', name: 'Lillet Blanc', label: 'LILLET', category: 'vermouth-bitters', color: '#f3e9b8', opacity: 0.45, abv: 17, bottle: { shape: 'wine', labelColor: '#f5e8c0', capColor: '#2a2a2a' }, description: 'French aromatised wine with orange notes. Vesper, Corpse Reviver No.2.' }),
  ing({ id: 'campari', name: 'Campari', label: 'CAMPARI', category: 'vermouth-bitters', color: '#e0182d', opacity: 0.9, abv: 25, bottle: { shape: 'round', labelColor: '#e0182d', textColor: '#ffffff', capColor: '#111' }, description: 'Bitter red Italian aperitivo. Negroni, Americano, Boulevardier, Jungle Bird.' }),
  ing({ id: 'aperol', name: 'Aperol', label: 'APEROL', category: 'vermouth-bitters', color: '#f26722', opacity: 0.9, abv: 11, bottle: { shape: 'round', labelColor: '#f26722', textColor: '#ffffff', capColor: '#111' }, description: 'Light, orange-flavoured bitter aperitivo. The Spritz and Paper Plane.' }),
  ing({ id: 'fernet', name: 'Fernet-Branca', label: 'FERNET', category: 'vermouth-bitters', color: '#3b2a16', opacity: 0.95, abv: 39, bottle: { shape: 'round', labelColor: '#1a1a1a', textColor: '#f5dfae', capColor: '#2a2a2a', glass: 'brown' }, description: 'Intensely bitter Italian amaro. Hanky Panky, Fernandito, Toronto.' }),
  ing({ id: 'amaro-nonino', name: 'Amaro Nonino', label: 'AMARO', category: 'vermouth-bitters', color: '#a8651e', opacity: 0.88, abv: 35, bottle: { shape: 'round', labelColor: '#f3e6c6', capColor: '#2a2a2a' }, description: 'Gentle orange-and-caramel amaro. The Paper Plane.' }),
  ing({ id: 'angostura', name: 'Angostura Bitters', label: 'ANGOSTURA', category: 'vermouth-bitters', color: '#5a1a0a', opacity: 0.9, abv: 44.7, unit: 'dash', bottle: { shape: 'dasher', labelColor: '#f5f1e0', capColor: '#f2d03b', glass: 'brown' }, description: 'The essential aromatic bitters. Old Fashioned, Manhattan, Champagne Cocktail.' }),
  ing({ id: 'peychauds', name: 'Peychaud’s Bitters', label: 'PEYCHAUD’S', category: 'vermouth-bitters', color: '#c41e3a', opacity: 0.9, abv: 35, unit: 'dash', bottle: { shape: 'dasher', labelColor: '#f5f1e0', textColor: '#c41e3a', capColor: '#2a2a2a' }, description: 'Bright red anise-forward bitters from New Orleans. The Sazerac.' }),
  ing({ id: 'orange-bitters', name: 'Orange Bitters', label: 'ORANGE BIT.', category: 'vermouth-bitters', color: '#d27a1a', opacity: 0.85, abv: 28, unit: 'dash', bottle: { shape: 'dasher', labelColor: '#f2a63a', capColor: '#2a2a2a' }, description: 'Orange-peel bitters. Martinez, Casino, Tuxedo.' }),

  // ---------------------------------------------------------------- WINE & SPARKLING
  ing({ id: 'prosecco', name: 'Prosecco', label: 'PROSECCO', category: 'wine-sparkling', color: '#f3e7a8', opacity: 0.4, abv: 11, bottle: { labelColor: '#f5f1e0', capColor: '#c9a24b', glass: 'green' }, description: 'Italian sparkling wine. Spritz, Bellini, Hugo.' }),
  ing({ id: 'champagne', name: 'Champagne', label: 'CHAMPAGNE', category: 'wine-sparkling', color: '#f2e3a0', opacity: 0.45, abv: 12, bottle: { labelColor: '#f2d35a', capColor: '#d4a84b', glass: 'green' }, description: 'Dry French sparkling wine. French 75, Mimosa, Kir Royal.' }),
  ing({ id: 'white-wine', name: 'Dry White Wine', label: 'WHITE WINE', category: 'wine-sparkling', color: '#f1e9b0', opacity: 0.4, abv: 12, bottle: { labelColor: '#eef3e2', capColor: '#2a2a2a', glass: 'green' }, description: 'Crisp dry white wine for the Kir.' }),
  ing({ id: 'red-wine', name: 'Red Wine', label: 'RED WINE', category: 'wine-sparkling', color: '#6b0f23', opacity: 0.92, abv: 13, bottle: { labelColor: '#f5f1e0', capColor: '#2a2a2a', glass: 'green' }, description: 'Dry red wine floated on a New York Sour.' }),
  ing({ id: 'port', name: 'Ruby Port', label: 'PORT', category: 'wine-sparkling', color: '#5e0f2a', opacity: 0.95, abv: 20, bottle: { labelColor: '#2a0a14', textColor: '#f8e4c0', capColor: '#d4a84b', glass: 'black' }, description: 'Sweet fortified wine from Portugal. The Porto Flip.' }),

  // ---------------------------------------------------------------- JUICES & PURÉES
  ing({ id: 'lime-juice', name: 'Fresh Lime Juice', label: 'LIME JUICE', category: 'juices', color: '#d7e8a0', opacity: 0.7, bottle: { labelColor: '#9ccc3a', capColor: '#4a7a1a' }, description: 'Freshly squeezed lime juice. The sour in most shaken drinks.' }),
  ing({ id: 'lemon-juice', name: 'Fresh Lemon Juice', label: 'LEMON JUICE', category: 'juices', color: '#f4ef9a', opacity: 0.65, bottle: { labelColor: '#f5e34a', capColor: '#c9a21a' }, description: 'Freshly squeezed lemon juice for sours, fizzes and collinses.' }),
  ing({ id: 'orange-juice', name: 'Orange Juice', label: 'ORANGE JUICE', category: 'juices', color: '#f5a623', opacity: 0.95, bottle: { labelColor: '#f7a21a', capColor: '#e07b00' }, description: 'Fresh orange juice. Screwdriver, Mimosa, Tequila Sunrise.' }),
  ing({ id: 'grapefruit-juice', name: 'Grapefruit Juice', label: 'GRAPEFRUIT', category: 'juices', color: '#f6c0a0', opacity: 0.85, bottle: { labelColor: '#f5a08a', capColor: '#d9533a' }, description: 'Pink grapefruit juice. Paloma, Greyhound, Hemingway Special.' }),
  ing({ id: 'pineapple-juice', name: 'Pineapple Juice', label: 'PINEAPPLE', category: 'juices', color: '#f2d85a', opacity: 0.9, bottle: { labelColor: '#f5d35a', capColor: '#2e8b57' }, description: 'Sweet pineapple juice. Piña Colada, Singapore Sling, Jungle Bird.' }),
  ing({ id: 'cranberry-juice', name: 'Cranberry Juice', label: 'CRANBERRY', category: 'juices', color: '#b3123a', opacity: 0.9, bottle: { labelColor: '#b3123a', textColor: '#ffffff', capColor: '#5a0a1a' }, description: 'Tart cranberry juice. Cosmopolitan, Sea Breeze, Cape Codder.' }),
  ing({ id: 'tomato-juice', name: 'Tomato Juice', label: 'TOMATO', category: 'juices', color: '#c62a1f', opacity: 0.98, bottle: { labelColor: '#d9342a', textColor: '#ffffff', capColor: '#2e8b57' }, description: 'Thick tomato juice for the Bloody Mary and Red Snapper.' }),
  ing({ id: 'apple-juice', name: 'Apple Juice', label: 'APPLE JUICE', category: 'juices', color: '#e8c46a', opacity: 0.7, bottle: { labelColor: '#c7d9a8', capColor: '#8b1a1a' }, description: 'Cloudy apple juice.' }),
  ing({ id: 'peach-puree', name: 'Peach Purée', label: 'PEACH PURÉE', category: 'juices', color: '#f6b26b', opacity: 0.95, bottle: { shape: 'jar', labelColor: '#f8c48a', capColor: '#d9842b' }, description: 'White peach purée for the Bellini.' }),
  ing({ id: 'passion-fruit-puree', name: 'Passion Fruit Purée', label: 'PASSION PURÉE', category: 'juices', color: '#f2a21f', opacity: 0.95, bottle: { shape: 'jar', labelColor: '#f7b53a', capColor: '#6b2a7a' }, description: 'Tangy passion fruit pulp. Pornstar Martini and Hurricane.' }),
  ing({ id: 'strawberry-puree', name: 'Strawberry Purée', label: 'STRAWBERRY', category: 'juices', color: '#e63950', opacity: 0.95, bottle: { shape: 'jar', labelColor: '#e63950', textColor: '#ffffff', capColor: '#2e8b57' }, description: 'Fresh strawberry purée for frozen Daiquiris and Margaritas.' }),

  // ---------------------------------------------------------------- SOFT DRINKS & SODAS
  ing({ id: 'soda-water', name: 'Soda Water', label: 'SODA WATER', category: 'sodas', color: '#eef6fb', opacity: 0.1, bottle: { labelColor: '#dfeaf2', capColor: '#1e6fd9' }, description: 'Plain carbonated water. Tops up fizzes, collinses and the Mojito.' }),
  ing({ id: 'tonic-water', name: 'Tonic Water', label: 'TONIC', category: 'sodas', color: '#eef6f0', opacity: 0.12, bottle: { labelColor: '#f5f1e0', capColor: '#c9a24b' }, description: 'Bitter quinine soda. The Gin & Tonic.' }),
  ing({ id: 'cola', name: 'Cola', label: 'COLA', category: 'sodas', color: '#3a1d10', opacity: 0.92, bottle: { labelColor: '#c8102e', textColor: '#ffffff', capColor: '#c8102e', glass: 'brown' }, description: 'Classic cola. Rum & Coke, Cuba Libre, Jack & Coke, Long Island.' }),
  ing({ id: 'lemon-lime-soda', name: 'Lemon-Lime Soda (7Up)', label: '7UP', category: 'sodas', color: '#f4fbe8', opacity: 0.12, bottle: { labelColor: '#2e8b57', textColor: '#ffffff', capColor: '#2e8b57', glass: 'green' }, description: 'Clear lemon-lime soda. Vodka 7Up, Seven & Seven, Lynchburg Lemonade.' }),
  ing({ id: 'ginger-ale', name: 'Ginger Ale', label: 'GINGER ALE', category: 'sodas', color: '#f0d9a0', opacity: 0.4, bottle: { labelColor: '#2e8b57', textColor: '#f5f5f5', capColor: '#c9a24b' }, description: 'Mild sweet ginger soda. Whiskey Ginger, Horse’s Neck.' }),
  ing({ id: 'ginger-beer', name: 'Ginger Beer', label: 'GINGER BEER', category: 'sodas', color: '#e8cf8a', opacity: 0.6, bottle: { labelColor: '#3b2a1a', textColor: '#f5dfae', capColor: '#d4a84b', glass: 'brown' }, description: 'Spicy, cloudy ginger beer. Moscow Mule, Dark ’n’ Stormy.' }),
  ing({ id: 'grapefruit-soda', name: 'Grapefruit Soda', label: 'GRAPEFRUIT SODA', category: 'sodas', color: '#fbe3d0', opacity: 0.4, bottle: { labelColor: '#f5a08a', capColor: '#d9533a' }, description: 'Sparkling grapefruit soda for the Paloma.' }),
  ing({ id: 'lemonade', name: 'Lemonade', label: 'LEMONADE', category: 'sodas', color: '#f7f3c0', opacity: 0.4, bottle: { labelColor: '#f5e34a', capColor: '#c9a21a' }, description: 'Sweet still lemonade. Blue Lagoon.' }),
  ing({ id: 'energy-drink', name: 'Energy Drink', label: 'ENERGY', category: 'sodas', color: '#e6d36b', opacity: 0.5, bottle: { shape: 'can', labelColor: '#1e3a8a', textColor: '#f5f5f5', capColor: '#b9b9b9' }, description: 'Caffeinated energy drink. Vodka Red Bull, Jägerbomb.' }),

  ing({ id: 'water', name: 'Still Water', label: 'WATER', category: 'sodas', color: '#f2f6f8', opacity: 0.08, bottle: { labelColor: '#dfeaf2', capColor: '#1e6fd9' }, description: 'Plain still water. A dash dissolves the sugar in an Old Fashioned.' }),

  // ---------------------------------------------------------------- SYRUPS
  ing({ id: 'simple-syrup', name: 'Simple Syrup', label: 'SIMPLE SYRUP', category: 'syrups', color: '#eff6ff', opacity: 0.25, bottle: { labelColor: '#f5f1e0', capColor: '#2a2a2a' }, description: '1:1 sugar and water. Sweetens almost every sour.' }),
  ing({ id: 'grenadine', name: 'Grenadine', label: 'GRENADINE', category: 'syrups', color: '#c8102e', opacity: 0.95, bottle: { labelColor: '#c8102e', textColor: '#ffffff', capColor: '#2a2a2a' }, description: 'Pomegranate syrup. Tequila Sunrise, Shirley Temple, Jack Rose.' }),
  ing({ id: 'orgeat', name: 'Orgeat', label: 'ORGEAT', category: 'syrups', color: '#efe5d0', opacity: 0.75, bottle: { labelColor: '#f3e6c6', capColor: '#4a2a12' }, description: 'Almond syrup with orange-flower water. Mai Tai, Trinidad Sour.' }),
  ing({ id: 'honey-syrup', name: 'Honey Syrup', label: 'HONEY', category: 'syrups', color: '#e1a92a', opacity: 0.8, bottle: { labelColor: '#f2c14e', capColor: '#4a2a12' }, description: 'Honey thinned with water. Bee’s Knees, Gold Rush, Hot Toddy.' }),
  ing({ id: 'agave-syrup', name: 'Agave Syrup', label: 'AGAVE', category: 'syrups', color: '#e2b44a', opacity: 0.7, bottle: { labelColor: '#c7d9a8', capColor: '#1f6f8b' }, description: 'Agave nectar. Tommy’s Margarita, Oaxaca Old Fashioned.' }),
  ing({ id: 'raspberry-syrup', name: 'Raspberry Syrup', label: 'RASPBERRY SYR.', category: 'syrups', color: '#c21f4a', opacity: 0.9, bottle: { labelColor: '#e0557a', textColor: '#ffffff', capColor: '#2a2a2a' }, description: 'Fresh raspberry syrup. The Clover Club.' }),
  ing({ id: 'passion-fruit-syrup', name: 'Passion Fruit Syrup', label: 'PASSION SYR.', category: 'syrups', color: '#f0a328', opacity: 0.85, bottle: { labelColor: '#f7b53a', capColor: '#6b2a7a' }, description: 'Tropical passion fruit syrup. The Hurricane.' }),
  ing({ id: 'vanilla-syrup', name: 'Vanilla Syrup', label: 'VANILLA SYR.', category: 'syrups', color: '#efe0b8', opacity: 0.6, bottle: { labelColor: '#f5ecd8', capColor: '#6b4b2a' }, description: 'Vanilla bean syrup. Pornstar Martini.' }),
  ing({ id: 'cinnamon-syrup', name: 'Cinnamon Syrup', label: 'CINNAMON SYR.', category: 'syrups', color: '#b86a2a', opacity: 0.8, bottle: { labelColor: '#c98a4a', capColor: '#4a2a12' }, description: 'Spiced cinnamon syrup used in the Zombie.' }),
  ing({ id: 'honey-ginger-syrup', name: 'Honey-Ginger Syrup', label: 'HONEY GINGER', category: 'syrups', color: '#dba63a', opacity: 0.8, bottle: { labelColor: '#f2c14e', capColor: '#8b1a1a' }, description: 'Honey syrup infused with fresh ginger. The Penicillin.' }),

  // ---------------------------------------------------------------- CREAM, EGGS & COFFEE
  ing({ id: 'cream', name: 'Heavy Cream', label: 'CREAM', category: 'dairy', color: '#fbf6ea', opacity: 0.98, bottle: { labelColor: '#fbf6ea', capColor: '#1e6fd9' }, description: 'Rich double cream. Brandy Alexander, White Russian, Grasshopper.' }),
  ing({ id: 'milk', name: 'Milk', label: 'MILK', category: 'dairy', color: '#fcfcf7', opacity: 0.98, bottle: { shape: 'carton', labelColor: '#ffffff', capColor: '#1e6fd9' }, description: 'Whole milk.' }),
  ing({ id: 'coconut-cream', name: 'Coconut Cream', label: 'COCONUT CREAM', category: 'dairy', color: '#f8f4ea', opacity: 0.98, bottle: { shape: 'can', labelColor: '#f5f5f5', textColor: '#2e8b57', capColor: '#b9b9b9' }, description: 'Sweetened cream of coconut. Piña Colada, Painkiller.' }),
  ing({ id: 'egg-white', name: 'Egg White', label: 'EGG WHITE', category: 'dairy', color: '#f4f1e4', opacity: 0.5, bottle: { labelColor: '#f7f3ea', capColor: '#b9b9b9' }, description: 'Fresh egg white (30 ml ≈ one egg). Gives sours a silky foam.' }),
  ing({ id: 'egg-yolk', name: 'Egg Yolk', label: 'EGG YOLK', category: 'dairy', color: '#f6c12b', opacity: 0.95, bottle: { labelColor: '#f8d35a', capColor: '#b9b9b9' }, description: 'Fresh egg yolk (15 ml ≈ one yolk). The Porto Flip.' }),
  ing({ id: 'espresso', name: 'Espresso', label: 'ESPRESSO', category: 'dairy', color: '#2a1409', opacity: 0.97, bottle: { labelColor: '#3b1f0c', textColor: '#f3d9a8', capColor: '#2a2a2a' }, description: 'Freshly pulled espresso (30 ml = one shot). Espresso Martini.' }),
  ing({ id: 'hot-coffee', name: 'Hot Coffee', label: 'HOT COFFEE', category: 'dairy', color: '#3a1f10', opacity: 0.97, bottle: { labelColor: '#5a2d0c', textColor: '#f3d9a8', capColor: '#2a2a2a' }, description: 'Hot filter coffee for the Irish Coffee.' }),
  ing({ id: 'hot-water', name: 'Hot Water', label: 'HOT WATER', category: 'dairy', color: '#f2f6f8', opacity: 0.1, bottle: { labelColor: '#dfeaf2', capColor: '#b9b9b9' }, description: 'Just-boiled water for the Hot Toddy.' }),

  // ---------------------------------------------------------------- PANTRY & PRODUCE
  ing({ id: 'sugar-cube', name: 'Sugar Cube', label: 'SUGAR CUBES', category: 'pantry', color: '#ffffff', opacity: 0.9, unit: 'piece', pieceName: ['cube', 'cubes'], bottle: { labelColor: '#ffffff', capColor: '#b9b9b9' }, description: 'White sugar cubes. Old Fashioned, Sazerac, Champagne Cocktail.' }),
  ing({ id: 'sugar', name: 'White Sugar', label: 'SUGAR', category: 'pantry', color: '#ffffff', opacity: 0.9, unit: 'tsp', bottle: { shape: 'jar', labelColor: '#ffffff', capColor: '#b9b9b9' }, description: 'Granulated sugar by the teaspoon. Caipirinha, Mojito, Mint Julep.' }),
  ing({ id: 'brown-sugar', name: 'Brown Sugar', label: 'BROWN SUGAR', category: 'pantry', color: '#b87333', opacity: 0.9, unit: 'tsp', bottle: { shape: 'jar', labelColor: '#c98a4a', capColor: '#4a2a12' }, description: 'Demerara sugar by the teaspoon. Irish Coffee.' }),
  ing({ id: 'mint-leaves', name: 'Mint Leaves', label: 'MINT', category: 'pantry', color: '#2e8b57', opacity: 0.9, unit: 'piece', pieceName: ['leaf', 'leaves'], bottle: { labelColor: '#2e8b57', textColor: '#ffffff', capColor: '#2e8b57' }, description: 'Fresh mint leaves for muddling. Mojito, Mint Julep, Southside.' }),
  ing({ id: 'lime-wedges', name: 'Lime Wedges', label: 'LIME WEDGES', category: 'pantry', color: '#9ccc3a', opacity: 0.9, unit: 'piece', pieceName: ['wedge', 'wedges'], bottle: { labelColor: '#9ccc3a', capColor: '#4a7a1a' }, description: 'Lime cut into wedges for muddling. Caipirinha.' }),
  ing({ id: 'lemon-wedges', name: 'Lemon Wedges', label: 'LEMON WEDGES', category: 'pantry', color: '#f5e34a', opacity: 0.9, unit: 'piece', pieceName: ['wedge', 'wedges'], bottle: { labelColor: '#f5e34a', capColor: '#c9a21a' }, description: 'Lemon wedges for muddling. Whiskey Smash.' }),
  ing({ id: 'strawberries', name: 'Fresh Strawberries', label: 'STRAWBERRIES', category: 'pantry', color: '#e63950', opacity: 0.9, unit: 'piece', pieceName: ['strawberry', 'strawberries'], bottle: { labelColor: '#e63950', textColor: '#ffffff', capColor: '#2e8b57' }, description: 'Fresh strawberries, halved, for muddling or blending.' }),
  ing({ id: 'cucumber-slices', name: 'Cucumber Slices', label: 'CUCUMBER', category: 'pantry', color: '#b5d99c', opacity: 0.9, unit: 'piece', pieceName: ['slice', 'slices'], bottle: { labelColor: '#b5d99c', capColor: '#2e8b57' }, description: 'Cucumber slices for muddling. Eastside, Cucumber Collins.' }),
  ing({ id: 'olive-brine', name: 'Olive Brine', label: 'OLIVE BRINE', category: 'pantry', color: '#c9c6a2', opacity: 0.5, bottle: { shape: 'jar', labelColor: '#8a8a4a', textColor: '#ffffff', capColor: '#2a2a2a' }, description: 'Brine from the olive jar. The Dirty Martini.' }),
  ing({ id: 'worcestershire', name: 'Worcestershire Sauce', label: 'WORCESTER', category: 'pantry', color: '#3b2412', opacity: 0.95, unit: 'dash', bottle: { shape: 'dasher', labelColor: '#f3d9a8', capColor: '#2a2a2a', glass: 'brown' }, description: 'Savoury fermented sauce. Bloody Mary.' }),
  ing({ id: 'hot-sauce', name: 'Hot Sauce', label: 'HOT SAUCE', category: 'pantry', color: '#c8220f', opacity: 0.95, unit: 'dash', bottle: { shape: 'dasher', labelColor: '#c8220f', textColor: '#ffffff', capColor: '#2e8b57' }, description: 'Tabasco-style hot sauce. Bloody Mary.' }),
  ing({ id: 'celery-salt', name: 'Celery Salt', label: 'CELERY SALT', category: 'pantry', color: '#e8e6d8', opacity: 0.9, unit: 'dash', bottle: { shape: 'jar', labelColor: '#c7d9a8', capColor: '#2e8b57' }, description: 'Salt blended with celery seed. Bloody Mary.' }),
  ing({ id: 'black-pepper', name: 'Black Pepper', label: 'PEPPER', category: 'pantry', color: '#3a3a3a', opacity: 0.9, unit: 'dash', bottle: { shape: 'jar', labelColor: '#2a2a2a', textColor: '#f5f5f5', capColor: '#b9b9b9' }, description: 'Freshly ground black pepper. Bloody Mary.' }),
  ing({ id: 'orange-flower-water', name: 'Orange Flower Water', label: 'ORANGE FLOWER', category: 'pantry', color: '#f7f3e6', opacity: 0.3, unit: 'dash', bottle: { shape: 'dasher', labelColor: '#f8d9a0', capColor: '#d9842b' }, description: 'Fragrant orange-blossom water. A few dashes in the Ramos Gin Fizz.' }),
]

export const INGREDIENT_MAP: Record<string, Ingredient> = Object.fromEntries(
  INGREDIENTS.map((i) => [i.id, i]),
)

export function getIngredient(id: string): Ingredient {
  const i = INGREDIENT_MAP[id]
  if (!i) throw new Error(`Unknown ingredient: ${id}`)
  return i
}

/** Canonical id used for scoring: a second vodka brand resolves to 'vodka'. */
export function canonicalId(id: string): string {
  return INGREDIENT_MAP[id]?.equivalentTo ?? id
}

export function ingredientsByCategory(category: IngredientCategory): Ingredient[] {
  return INGREDIENTS.filter((i) => i.category === category)
}

/** Approximate millilitres for a non-ml unit, used for fill levels and oz display. */
export const UNIT_ML: Record<Ingredient['unit'], number> = {
  ml: 1,
  dash: 1,
  tsp: 5,
  piece: 0,
}
