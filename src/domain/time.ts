export function elapsedSeconds(startedAt: string, endedAt?: string, now = Date.now()): number {
  const start = Date.parse(startedAt)
  const end = endedAt ? Date.parse(endedAt) : now
  if (Number.isNaN(start) || Number.isNaN(end)) return 0
  return Math.max(0, Math.floor((end - start) / 1000))
}

export function formatElapsed(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
