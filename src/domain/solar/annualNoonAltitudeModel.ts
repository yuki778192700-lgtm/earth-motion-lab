import { assertLatitudeDegrees } from '../../lib/geography/angle'
import { solarNoonAltitude } from '../../lib/geography'
import { createAnnualSubsolarModel, type AnnualSubsolarModel } from './annualSubsolarModel'

/** All altitudes are signed degrees above the local horizon, not zenith angles. */
export function createAnnualNoonAltitudeModel(year: number, latitudeDegrees: number, annual: AnnualSubsolarModel = createAnnualSubsolarModel(year)) {
  assertLatitudeDegrees(latitudeDegrees)
  if (annual.year !== year) throw new RangeError('annual model year mismatch')
  return {
    year,
    latitudeDegrees,
    startTimeMs: annual.startTimeMs,
    endTimeMs: annual.endTimeMs,
    samples: annual.samples.map(sample => ({ timeMs: sample.timeMs, altitudeDegrees: solarNoonAltitude(latitudeDegrees, sample.declinationDegrees) })),
    events: annual.events.map(event => ({ ...event, altitudeDegrees: solarNoonAltitude(latitudeDegrees, event.declinationDegrees) })),
  }
}

export type AnnualNoonAltitudeModel = ReturnType<typeof createAnnualNoonAltitudeModel>
