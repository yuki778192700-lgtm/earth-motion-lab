import { solarDeclination } from './solar'

const DAY_MS = 86_400_000

/** Daily UTC samples plus the last instant of the year. Angles: degrees, north positive. */
export function createAnnualDeclinationSeries(year: number) {
  if (!Number.isInteger(year) || year < 100 || year > 9998) throw new RangeError('year must be an integer between 100 and 9998')
  const startTimeMs = Date.UTC(year, 0, 1)
  const endTimeMs = Date.UTC(year + 1, 0, 1) - 1
  const daysInYear = Math.round((endTimeMs + 1 - startTimeMs) / DAY_MS)
  const samples = Array.from({ length: daysInYear + 1 }, (_, index) => {
    const timeMs = index === daysInYear ? endTimeMs : startTimeMs + index * DAY_MS
    return { timeMs, declinationDegrees: solarDeclination(new Date(timeMs)) }
  })
  return { year, startTimeMs, endTimeMs, daysInYear, samples }
}
