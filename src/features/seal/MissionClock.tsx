import { useServerNow } from '../../hooks/useServerNow'

const DAY = 86_400_000

/** T-minus to ship day, then "DAY 017" once you're in. Display only. */
export function MissionClock({ departureDate }: { departureDate: string | null }) {
  const now = useServerNow(60_000)
  if (!departureDate) return null
  const ship = new Date(`${departureDate}T00:00:00`).getTime()
  const before = now < ship
  const days = before ? Math.ceil((ship - now) / DAY) : Math.floor((now - ship) / DAY) + 1

  return (
    <div className="ops-panel brackets mx-auto grid max-w-md grid-cols-3 divide-x divide-[#5b6b3a]/50 text-center">
      <Cell label="Status" value={before ? 'STANDBY' : 'ACTIVE'} />
      <Cell label={before ? 'T-minus' : 'Day'} value={String(days).padStart(3, '0')} big />
      <Cell label="Grid" value="32°40′N 117°10′W" small />
    </div>
  )
}

function Cell({ label, value, big, small }: { label: string; value: string; big?: boolean; small?: boolean }) {
  return (
    <div className="px-2 py-3">
      <p className="text-[0.55rem] tracking-[0.3em] text-[#c2a878]/80 uppercase">{label}</p>
      <p className={`nvg-text mt-1 ${big ? 'stencil text-3xl' : small ? 'text-[0.62rem] leading-tight' : 'text-sm font-bold tracking-widest'}`}>{value}</p>
    </div>
  )
}
