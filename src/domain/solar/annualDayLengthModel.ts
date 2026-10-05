import { assertLatitudeDegrees } from '../../lib/geography/angle'
import { dayLength } from '../../lib/geography'
import { createAnnualSubsolarModel, type AnnualSubsolarModel } from './annualSubsolarModel'

export function createAnnualDayLengthModel(year: number, latitudeDegrees: number, annual: AnnualSubsolarModel = createAnnualSubsolarModel(year)) {
  assertLatitudeDegrees(latitudeDegrees)
  if (annual.year !== year) throw new RangeError('annual model year mismatch')
  return {
    year, latitudeDegrees, startTimeMs: annual.startTimeMs, endTimeMs: annual.endTimeMs,
    samples: annual.samples.map(sample => ({ timeMs: sample.timeMs, dayHours: dayLength(latitudeDegrees, sample.declinationDegrees) })),
    events: annual.events.map(event => ({ ...event, dayHours: dayLength(latitudeDegrees, event.declinationDegrees) })),
  }
}

export type AnnualDayLengthModel = ReturnType<typeof createAnnualDayLengthModel>
