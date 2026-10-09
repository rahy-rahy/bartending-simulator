import type { PointerEvent as ReactPointerEvent } from 'react'
import { useBarStore, type DropTarget, type HeldItem } from '../../store/barStore'

export interface Point {
  x: number
  y: number
}

/** Shared pointer position for the drag ghost (updated by DragLayer). */
export const pointer: Point = { x: 0, y: 0 }

const DROP_TARGETS = new Set<DropTarget>(['glass', 'shaker', 'mixing', 'blender', 'jigger', 'bin', 'lime-dish', 'salt-dish', 'sugar-dish', 'counter'])

export function hitTest(x: number, y: number): DropTarget | null {
  const el = document.elementFromPoint(x, y)
  const target = el?.closest<HTMLElement>('[data-drop]')?.dataset.drop as DropTarget | undefined
  return target && DROP_TARGETS.has(target) ? target : null
}

/** Start dragging an item from a pointerdown event. */
export function beginDrag(item: HeldItem, e: ReactPointerEvent) {
  if (e.button !== undefined && e.button !== 0) return
  const s = useBarStore.getState()
  if (s.animation || s.served) return
  e.preventDefault()
  pointer.x = e.clientX
  pointer.y = e.clientY
  s.setHeld(item)
}

export const POUR_TARGETS = new Set<DropTarget>(['glass', 'shaker', 'mixing', 'blender', 'jigger'])
export const VESSEL_TARGETS = new Set<DropTarget>(['glass', 'shaker', 'mixing', 'blender'])
