import { useMemo, useState } from 'react'
import type { Recipe } from '../../data/types'
import { recipeImageSrc } from '../../data/recipeImages'
import { recipeSvg } from '../../lib/drinkSvg'

interface Props {
  recipe: Recipe
  className?: string
  sizes?: string
  eager?: boolean
}

/**
 * Bundled photo of the finished drink. If the file somehow fails to load,
 * an SVG preview of the drink is generated on the fly so nothing is ever broken.
 */
export function RecipeImage({ recipe, className, eager }: Props) {
  const [failed, setFailed] = useState(false)
  const src = recipeImageSrc(recipe.id)
  const fallback = useMemo(() => (failed || !src ? `data:image/svg+xml;utf8,${encodeURIComponent(recipeSvg(recipe, 500))}` : null), [failed, src, recipe])
  return (
    <img
      src={fallback ?? src}
      alt={`${recipe.name} in a ${recipe.glass} glass`}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      width={500}
      height={500}
      draggable={false}
      onError={() => setFailed(true)}
      data-testid={`recipe-image-${recipe.id}`}
    />
  )
}
