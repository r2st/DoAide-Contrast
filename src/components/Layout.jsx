import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

const nav = [
  { to: '/', label: 'Contrast', icon: '◑' },
  { to: '/palette', label: 'Palette', icon: '◈' },
  { to: '/blindness', label: 'Color Blindness', icon: '◉' },
  { to: '/font-size', label: 'Font Size', icon: 'Aa' },
  { to: '/checklist', label: 'Checklist', icon: '☑' },
  { to: '/screenshot', label: 'Screenshot', icon: '⊞' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-bold text-lg">
                <span className="text-gold-400">DoAide</span>
                <span className="text-gray-900"> Contrast</span>
              </span>
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>

            <nav className="hidden lg:flex items-center gap-1">
              {nav.map(n => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === n.to
                      ? 'bg-gold-50 text-gold-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1.5">{n.icon}</span>
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {menuOpen && (
          <nav className="lg:hidden border-t border-gray-100 px-4 py-2 bg-white">
            {nav.map(n => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  location.pathname === n.to
                    ? 'bg-gold-50 text-gold-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{n.icon}</span>
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-5 h-5 rounded bg-gold-400 flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">C</span>
              </div>
              <span>DoAide Contrast — Free accessibility tools</span>
            </div>
            <div className="text-sm text-gray-400">
              No login required · No data collected · 100% client-side
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
