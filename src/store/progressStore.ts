import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Difficulty } from '../data/types'
import { RECIPES } from '../data/recipes'
import { MASTER_SCORE, PASS_SCORE } from '../lib/scoring'

export interface RecipeProgress {
  attempts: number
  best: number
  lastScore: number
  lastAt: number
  mastered: boolean
}

export interface HistoryEntry {
  recipeId: string
  score: number
  at: number
  mode: 'guided' | 'challenge'
}

export interface ProgressState {
  recipes: Record<string, RecipeProgress>
  streak: number
  bestStreak: number
  challenges: number
  passed: number
  history: HistoryEntry[]
  recordResult: (recipeId: string, score: number, mode: 'guided' | 'challenge') => void
  reset: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      recipes: {},
      streak: 0,
      bestStreak: 0,
      challenges: 0,
      passed: 0,
      history: [],
      recordResult: (recipeId, score, mode) =>
        set((s) => {
          const prev = s.recipes[recipeId]
          const best = Math.max(prev?.best ?? 0, score)
          const entry: RecipeProgress = {
            attempts: (prev?.attempts ?? 0) + 1,
            best,
            lastScore: score,
            lastAt: Date.now(),
            mastered: best >= MASTER_SCORE,
          }
          const isChallenge = mode === 'challenge'
          const streak = isChallenge ? (score >= PASS_SCORE ? s.streak + 1 : 0) : s.streak
          return {
            recipes: { ...s.recipes, [recipeId]: entry },
            streak,
            bestStreak: Math.max(s.bestStreak, streak),
            challenges: s.challenges + (isChallenge ? 1 : 0),
            passed: s.passed + (isChallenge && score >= PASS_SCORE ? 1 : 0),
            history: [{ recipeId, score, at: Date.now(), mode }, ...s.history].slice(0, 60),
          }
        }),
      reset: () => set({ recipes: {}, streak: 0, bestStreak: 0, challenges: 0, passed: 0, history: [] }),
    }),
    { name: 'bartending-simulator-progress' },
  ),
)

export function masteredByDifficulty(recipes: Record<string, RecipeProgress>): Record<Difficulty, { mastered: number; attempted: number; total: number }> {
  const out: Record<Difficulty, { mastered: number; attempted: number; total: number }> = {
    easy: { mastered: 0, attempted: 0, total: 0 },
    medium: { mastered: 0, attempted: 0, total: 0 },
    hard: { mastered: 0, attempted: 0, total: 0 },
  }
  for (const r of RECIPES) {
    out[r.difficulty].total++
    const p = recipes[r.id]
    if (p) {
      out[r.difficulty].attempted++
      if (p.mastered) out[r.difficulty].mastered++
    }
  }
  return out
}

/** Pick a random recipe for a challenge, preferring ones not yet mastered. */
export function pickChallenge(difficulty: Difficulty | 'any', recipes: Record<string, RecipeProgress>, exclude?: string): string {
  const pool = RECIPES.filter((r) => (difficulty === 'any' || r.difficulty === difficulty) && r.id !== exclude)
  const fresh = pool.filter((r) => !recipes[r.id]?.mastered)
  const list = fresh.length ? fresh : pool
  return list[Math.floor(Math.random() * list.length)].id
}
