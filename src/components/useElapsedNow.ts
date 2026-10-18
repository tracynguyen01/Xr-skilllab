import { useEffect, useState } from 'react'

/** Ticks once a second while an attempt is open. The value is display-only. */
export function useElapsedNow(running: boolean): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [running])

  return now
}
