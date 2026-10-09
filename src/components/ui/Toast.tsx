import { AnimatePresence, motion } from 'framer-motion'
import { useBarStore } from '../../store/barStore'

export function Toast() {
  const toast = useBarStore((s) => s.toast)
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            data-testid="toast"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`rounded-lg border px-4 py-2 text-sm shadow-xl ${
              toast.tone === 'warn' ? 'border-amber-400/60 bg-amber-900/95 text-amber-50' : toast.tone === 'success' ? 'border-emerald-400/60 bg-emerald-900/95 text-emerald-50' : 'border-brass-500/60 bg-wood-800/95 text-cream-100'
            }`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
