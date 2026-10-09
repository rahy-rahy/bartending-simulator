import { useEffect } from 'react'
import { useBarStore } from '../../store/barStore'

/** Drives continuous pouring with requestAnimationFrame while a bottle is held over a vessel. */
export function PourEngine() {
  const active = useBarStore((s) => !!s.pour)
  useEffect(() => {
    if (!active) return
    let last = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const dt = Math.min(100, now - last)
      last = now
      useBarStore.getState().tickPour(dt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active])
  return null
}
