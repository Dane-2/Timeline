import { Suspense } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'

const nav = [
  { to: '/admin', label: 'Content', end: true },
  { to: '/admin/media', label: 'Media' },
  { to: '/admin/collections', label: 'Collections' },
  { to: '/admin/settings', label: 'Settings' },
]

/** The admin shell. Loaded only for admins (separate bundle from her site). */
export default function AdminLayout() {
  return (
    <div className="min-h-dvh bg-[#fbf8f9]">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link to="/admin" className="font-display shrink-0 text-lg font-semibold">
            Little Piece <span className="text-mauve">· admin</span>
          </Link>
          <nav className="-mx-1 flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none]">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${isActive ? 'bg-petal text-ink' : 'text-ink-soft hover:bg-black/5'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/home" className="text-mauve shrink-0 text-sm font-medium hover:underline">
            View site →
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 md:py-8">
        <Suspense fallback={<p className="text-ink-soft text-sm">Loading…</p>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
