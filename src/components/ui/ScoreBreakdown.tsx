import { motion } from 'framer-motion'
import type { ScoreResult } from '../../lib/scoring'

export function ScoreRing({ total, size = 120 }: { total: number; size?: number }) {
  const r = 46
  const c = 2 * Math.PI * r
  const color = total >= 90 ? '#7dd68a' : total >= 70 ? '#d9b25a' : total >= 50 ? '#f29b4b' : '#e0557a'
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`Score ${total} out of 100`}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="#3d2616" strokeWidth="10" />
      <motion.circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - total / 100) }}
        transition={{ duration: 1, ease: 'easeOut' }}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="66" textAnchor="middle" fontSize="30" fontWeight="700" fill="#f7efe0" fontFamily="Georgia, serif">
        {total}
      </text>
      <text x="60" y="84" textAnchor="middle" fontSize="11" fill="#d9b25a">
        / 100
      </text>
    </svg>
  )
}

export function ScoreBreakdown({ result }: { result: ScoreResult }) {
  return (
    <ul className="space-y-1.5" data-testid="score-breakdown">
      {result.categories.map((c) => (
        <li key={c.key} className="rounded-md border border-brass-600/30 bg-wood-900/60 p-2" data-testid={`score-${c.key}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm text-cream-100">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${c.status === 'ok' ? 'bg-emerald-400' : c.status === 'partial' ? 'bg-amber-400' : 'bg-rose-400'}`} />
              {c.label}
            </span>
            <span className="font-mono text-sm text-brass-300">
              {c.points} / {c.max}
            </span>
          </div>
          <ul className="mt-1 space-y-0.5 pl-4 text-xs text-cream-200/85">
            {c.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
