import { assertFiniteNumber, assertValidDate } from './angle'
import { calculateLocalMeanClock } from './localTimeExperiment'

const DAY_MS = 86_400_000
/** Teaching choices, not a catalogue of real legal time zones. Unit: minutes. */
export const FIXED_UTC_OFFSET_OPTIONS = Object.freeze(Array.from({ length: 105 }, (_, index) => -720 + index * 15))

export function assertFixedUtcOffset(offsetMinutes: number): void {
  assertFiniteNumber(offsetMinutes, 'offsetMinutes')
  if (!Number.isInteger(offsetMinutes) || offsetMinutes < -720 || offsetMinutes > 840) {
    throw new RangeError('offsetMinutes must be an integer between -720 and 840')
  }
}

export function formatUtcOffset(offsetMinutes: number): string {
  assertFixedUtcOffset(offsetMinutes)
  const absolute = Math.abs(offsetMinutes)
  return `UTC${offsetMinutes < 0 ? '−' : '+'}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`
}

/** Calendar fields carried in UTC; this does NOT change the underlying instant. */
export function calculateFixedOffsetClock(offsetMinutes: number, utcDate: Date) {
  assertFixedUtcOffset(offsetMinutes)
  assertValidDate(utcDate)
  const calendarTimeMs = utcDate.getTime() + offsetMinutes * 60_000
  return {
    calendarTimeMs,
    dayOffset: Math.floor(calendarTimeMs / DAY_MS) - Math.floor(utcDate.getTime() / DAY_MS),
  }
}

export function compareMeanAndFixedTime(longitudeDegrees: number, offsetMinutes: number, utcDate: Date) {
  const meanClock = calculateLocalMeanClock(longitudeDegrees, utcDate)
  const fixedClock = calculateFixedOffsetClock(offsetMinutes, utcDate)
  return {
    meanClock,
    fixedClock,
    fixedMinusMeanMinutes: Math.round((offsetMinutes - longitudeDegrees * 4) * 1_000_000) / 1_000_000,
  }
}
