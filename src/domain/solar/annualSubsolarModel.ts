import { createAnnualDeclinationSeries } from '../../lib/geography/annualDeclination'
import { solarDeclination } from '../../lib/geography/solar'
import { calculateSeasonalEvents } from '../orbit/earthOrbit'

/** Bind existing astronomical event dates to the SAME declination engine as the 3D scene. */
export function createAnnualSubsolarModel(year: number) {
  const series = createAnnualDeclinationSeries(year)
  const events = calculateSeasonalEvents(year).map(event => ({ ...event, declinationDegrees: solarDeclination(new Date(event.timeMs)) }))
  const samples = [...series.samples, ...events.map(event => ({ timeMs: event.timeMs, declinationDegrees: event.declinationDegrees }))].sort((a, b) => a.timeMs - b.timeMs)
  return {
    ...series,
    samples,
    events,
    northLimitDegrees: Math.max(...samples.map(sample => sample.declinationDegrees)),
    southLimitDegrees: Math.min(...samples.map(sample => sample.declinationDegrees)),
  }
}

export type AnnualSubsolarModel = ReturnType<typeof createAnnualSubsolarModel>
