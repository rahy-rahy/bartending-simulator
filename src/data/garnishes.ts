import type { GarnishId, GarnishSpec } from './types'

export const GARNISHES: GarnishSpec[] = [
  { id: 'lime-wedge', name: 'Lime Wedge', color: '#8fc93a', description: 'A fresh lime wedge on the rim.' },
  { id: 'lime-wheel', name: 'Lime Wheel', color: '#9ccc3a', description: 'A thin lime wheel.' },
  { id: 'lemon-twist', name: 'Lemon Twist', color: '#f5e34a', description: 'A twist of lemon peel, oils expressed over the drink.' },
  { id: 'lemon-wheel', name: 'Lemon Wheel', color: '#f5e34a', description: 'A thin lemon wheel.' },
  { id: 'lemon-wedge', name: 'Lemon Wedge', color: '#f0d93a', description: 'A fresh lemon wedge.' },
  { id: 'orange-slice', name: 'Orange Slice', color: '#f7941d', description: 'A half-wheel of orange.' },
  { id: 'orange-twist', name: 'Orange Twist', color: '#f7941d', description: 'A twist of orange peel.' },
  { id: 'mint-sprig', name: 'Mint Sprig', color: '#2e8b57', description: 'A bushy sprig of fresh mint, slapped to release its aroma.' },
  { id: 'cherry', name: 'Cocktail Cherry', color: '#8b1a2e', description: 'A brandied or maraschino cherry.' },
  { id: 'olive', name: 'Olive', color: '#6b7a2a', description: 'A green olive on a pick.' },
  { id: 'cucumber', name: 'Cucumber Ribbon', color: '#b5d99c', description: 'A long ribbon of cucumber.' },
  { id: 'umbrella', name: 'Paper Umbrella', color: '#e0557a', description: 'A tiny paper umbrella. Pure tiki.' },
  { id: 'straw', name: 'Straw', color: '#f2f2f2', description: 'A drinking straw.' },
  { id: 'nutmeg', name: 'Grated Nutmeg', color: '#8b5a2b', description: 'Nutmeg freshly grated over the surface.' },
  { id: 'pineapple-wedge', name: 'Pineapple Wedge', color: '#f5d35a', description: 'A wedge of pineapple with its leaf.' },
  { id: 'celery', name: 'Celery Stalk', color: '#9fcf6a', description: 'A leafy celery stalk.' },
  { id: 'berries', name: 'Fresh Berries', color: '#5b1133', description: 'A few blackberries or raspberries.' },
  { id: 'coffee-beans', name: 'Three Coffee Beans', color: '#3b2412', description: 'Three coffee beans floated on the foam.' },
  { id: 'cocktail-onion', name: 'Cocktail Onion', color: '#f3ead8', description: 'A pickled pearl onion.' },
  { id: 'candied-ginger', name: 'Candied Ginger', color: '#e9b65a', description: 'A piece of crystallised ginger.' },
  { id: 'apple-slice', name: 'Apple Slice', color: '#9ad43a', description: 'A thin slice of green apple.' },
  { id: 'cinnamon-stick', name: 'Cinnamon Stick', color: '#a0522d', description: 'A cinnamon quill.' },
]

export const GARNISH_MAP: Record<GarnishId, GarnishSpec> = Object.fromEntries(
  GARNISHES.map((g) => [g.id, g]),
) as Record<GarnishId, GarnishSpec>
