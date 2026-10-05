import { calculateSeasonalEvents } from './earthOrbit'

export const ANNUAL_ORBIT_DURATIONS = [30, 60, 120] as const
export type AnnualOrbitDuration = typeof ANNUAL_ORBIT_DURATIONS[number]
export const DEFAULT_ANNUAL_ORBIT_DURATION: AnnualOrbitDuration = 60
const DAY_MS = 86_400_000

export function getAnnualTimeline(year: number) {
  if (!Number.isInteger(year) || year < 100 || year > 9998) throw new RangeError('year must be between 100 and 9998')
  const startTimeMs = Date.UTC(year, 0, 1)
  const nextYearTimeMs = Date.UTC(year + 1, 0, 1)
  const durationMs = nextYearTimeMs - startTimeMs
  const progressPercent = (timeMs: number) => (timeMs - startTimeMs) / durationMs * 100
  return {
    year, startTimeMs, endTimeMs: nextYearTimeMs - 1, durationMs,
    daysInYear: durationMs / DAY_MS,
    months: Array.from({ length: 12 }, (_, month) => ({ month: month + 1, timeMs: Date.UTC(year, month, 1), progressPercent: progressPercent(Date.UTC(year, month, 1)) })),
    events: calculateSeasonalEvents(year).map(event => ({ ...event, progressPercent: progressPercent(event.timeMs) })),
  }
}

export function assertAnnualOrbitDuration(value: number): asserts value is AnnualOrbitDuration {
  if (!ANNUAL_ORBIT_DURATIONS.some(duration => duration === value)) throw new RangeError('annual duration must be 30, 60 or 120 seconds')
}

/** 固定年份内均匀推进日期；轨道位置仍由原来的开普勒模型计算。 */
export function advanceAnnualTimeline(timeMs: number, elapsedRealMs: number, durationSeconds: AnnualOrbitDuration, year: number, stopAtTimeMs: number | null = null) {
  assertAnnualOrbitDuration(durationSeconds)
  if (!Number.isFinite(timeMs) || !Number.isFinite(elapsedRealMs) || elapsedRealMs < 0) throw new RangeError('invalid annual playback time')
  const start = Date.UTC(year, 0, 1)
  const nextYear = Date.UTC(year + 1, 0, 1)
  if (stopAtTimeMs !== null && (!Number.isFinite(stopAtTimeMs) || stopAtTimeMs < timeMs || stopAtTimeMs >= nextYear)) throw new RangeError('invalid annual stop time')
  const limit = stopAtTimeMs ?? nextYear - 1
  const nextTimeMs = Math.min(limit, timeMs + elapsedRealMs * (nextYear - start) / (durationSeconds * 1000))
  return { timeMs: nextTimeMs, shouldPause: nextTimeMs >= limit }
}

export function getNextAnnualStop(timeMs: number): number | null {
  const timeline = getAnnualTimeline(new Date(timeMs).getUTCFullYear())
  return timeline.events.find(event => event.timeMs > timeMs + 1)?.timeMs ?? null
}

export function stepAnnualDay(timeMs: number, direction: -1 | 1): number {
  const year = new Date(timeMs).getUTCFullYear()
  const start = Date.UTC(year, 0, 1)
  const end = Date.UTC(year + 1, 0, 1) - 1
  return Math.max(start, Math.min(end, timeMs + direction * DAY_MS))
}
