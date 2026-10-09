import type { RecipeImage } from './types'
import images from './recipeImages.json'

export const RECIPE_IMAGES = images as Record<string, RecipeImage>

export function recipeImageSrc(id: string): string | undefined {
  return RECIPE_IMAGES[id]?.src
}
