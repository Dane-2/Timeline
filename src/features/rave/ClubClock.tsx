import { useEffect, useState } from 'react'

const fmt = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

/** Her local time, glowing like the clock over a club bar. */
export function ClubClock() {
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = window.setInterval(() => setTime(fmt()), 15_000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <p className="font-mono text-xs tracking-[0.3em] text-white/60 uppercase">
      local time <span className="neon-cyan ml-1 text-base tracking-[0.15em]">{time}</span>
    </p>
  )
}
