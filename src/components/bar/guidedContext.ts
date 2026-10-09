import { createContext, useContext } from 'react'
import type { StepTarget } from '../../lib/guided'

export const GuidedTargetContext = createContext<StepTarget | null>(null)

/** True when the given element is what the current guided step is asking for. */
export function useIsTarget(match: Partial<StepTarget> & { kind: StepTarget['kind']; id?: string }): boolean {
  const target = useContext(GuidedTargetContext)
  if (!target || target.kind !== match.kind) return false
  if (match.id !== undefined && target.id !== match.id) return false
  if ('vessel' in match && match.vessel !== undefined && 'vessel' in target && target.vessel !== match.vessel) return false
  return true
}

export function useGuidedTarget(): StepTarget | null {
  return useContext(GuidedTargetContext)
}
