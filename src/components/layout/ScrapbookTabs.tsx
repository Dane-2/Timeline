import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const icon = (d: ReactNode) => (
  <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" {...stroke}>
    {d}
  </svg>
)

export const tabs = [
  { to: '/home', label: 'Home', color: 'bg-petal', icon: icon(<path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1Z" />) },
  { to: '/timeline', label: 'Timeline', color: 'bg-lilac', icon: icon(<><path d="M12 3v18" /><circle cx="12" cy="7" r="2" /><circle cx="12" cy="17" r="2" /><path d="M14 7h5M5 17h5" /></>) },
  { to: '/letters', label: 'Letters', color: 'bg-butter', icon: icon(<><rect x="3.5" y="6" width="17" height="12" rx="1.5" /><path d="m4 7 8 6 8-6" /></>) },
  { to: '/notes', label: 'Notes', color: 'bg-blush', icon: icon(<><path d="M5 4h14v11l-5 5H5Z" /><path d="M14 20v-5h5" /></>) },
  { to: '/photos', label: 'Photos', color: 'bg-sky', icon: icon(<><rect x="4" y="3.5" width="16" height="17" rx="1" /><rect x="6.5" y="6" width="11" height="9" /></>) },
  { to: '/favorites', label: 'Faves', color: 'bg-sage', icon: icon(<path d="m12 4 2.4 5 5.4.6-4 3.8 1.1 5.4L12 16.1l-4.9 2.7 1.1-5.4-4-3.8 5.4-.6Z" />) },
  // Looks like any other bookmark. It isn't.
  { to: '/beach', label: 'Beach', color: 'bg-peach', icon: icon(<><circle cx="12" cy="10" r="4" /><path d="M3 17c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 20.5c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" /></>) },
  { to: '/seal', label: 'SEAL', color: 'bg-khaki', icon: icon(<><path d="M12 3v18M7 6v4c0 2 2 3 5 3s5-1 5-3V6M12 3l-1.5 2.5h3ZM7 6l-1.5 2h3M17 6l-1.5 2h3" /><path d="M6 17c1.5 2.5 3.5 4 6 4s4.5-1.5 6-4" /></>) },
  { to: '/rave', label: 'Rave', color: 'bg-kraft', icon: icon(<><path d="M12 2.5v3" /><circle cx="12" cy="12.5" r="6.5" /><path d="M5.5 12.5h13M12 6v13M7.5 8.5c3 1.5 6 1.5 9 0M7.5 16.5c3-1.5 6-1.5 9 0" /></>) },
] as const

/** Paper bookmark tabs. Bottom bar on phones, top strip on larger screens. */
export function ScrapbookTabs() {
  return (
    <nav
      aria-label="Sections"
      className="bg-cream/90 fixed inset-x-0 bottom-0 z-40 border-t border-black/5 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:static md:border-none md:bg-transparent md:pb-0 md:backdrop-blur-none"
    >
      <ul
        className="mx-auto flex max-w-5xl snap-x items-end gap-1 overflow-x-auto px-2 pt-1.5 [scrollbar-width:none] md:flex-wrap md:gap-2 md:overflow-visible md:px-6 md:pt-6 [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,#000_88%,transparent)] md:[mask-image:none]"
      >
        {tabs.map((t, i) => (
          <li key={t.to} className="min-w-[3.9rem] flex-1 snap-start md:min-w-0 md:flex-none">
            <NavLink
              to={t.to}
              className={({ isActive }) =>
                `${t.color} text-ink flex flex-col items-center gap-0.5 rounded-t-lg px-1 pt-2 pb-1.5 text-[0.68rem] font-semibold transition-transform duration-200 md:flex-row md:gap-2 md:px-4 md:pb-2 md:text-sm ${
                  isActive ? 'shadow-paper -translate-y-1' : 'opacity-80 hover:-translate-y-0.5 hover:opacity-100'
                }`
              }
              style={{ rotate: `${(i % 2 ? 1 : -1) * 0.8}deg` }}
            >
              {t.icon}
              <span>{t.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
