import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { HomePage } from './pages/HomePage'
import { BarPage } from './pages/BarPage'
import { RecipesPage } from './pages/RecipesPage'
import { RecipeDetailPage } from './pages/RecipeDetailPage'
import { ChallengePage } from './pages/ChallengePage'
import { ProgressPage } from './pages/ProgressPage'

const NAV = [
  { to: '/bar', label: 'Free Bar', testId: 'nav-bar' },
  { to: '/recipes', label: 'Recipes', testId: 'nav-recipes' },
  { to: '/challenge', label: 'Challenge', testId: 'nav-challenge' },
  { to: '/progress', label: 'Progress', testId: 'nav-progress' },
]

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-brass-600/40 bg-wood-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-2 px-3 py-2">
        <Link to="/" className="flex items-center gap-2" data-testid="nav-home">
          <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden>
            <path d="M4 4 H28 L16 18 Z" fill="#d9b25a" />
            <path d="M16 18 V28 M9 28 H23" stroke="#d9b25a" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="22" cy="8" r="2.5" fill="#8b1a2e" />
          </svg>
          <span className="font-display text-sm font-bold tracking-wide text-brass-300 sm:text-lg"><span className="hidden sm:inline">Bartending Simulator</span><span className="sm:hidden">Bar Sim</span></span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} data-testid={n.testId} className={({ isActive }) => `whitespace-nowrap rounded-md px-1.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition sm:px-3 sm:text-sm ${isActive ? 'bg-brass-500 text-wood-900' : 'text-cream-200/80 hover:bg-wood-700 hover:text-brass-300'}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bar" element={<BarPage kind="free" />} />
          <Route path="/bar/guided/:id" element={<BarPage kind="guided" />} />
          <Route path="/bar/challenge/:id" element={<BarPage kind="challenge" />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/challenge" element={<ChallengePage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
