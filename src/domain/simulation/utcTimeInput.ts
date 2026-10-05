/** Strict UTC clock input; preserve the current UTC calendar date. */
export function applyUtcClock(timeMs: number, clock: string): number | null {
  if (!Number.isFinite(timeMs) || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(clock)) return null
  const [hours = 0, minutes = 0, seconds = 0] = clock.split(':').map(Number)
  const date = new Date(timeMs)
  date.setUTCHours(hours, minutes, seconds, 0)
  return Number.isFinite(date.getTime()) ? date.getTime() : null
}
