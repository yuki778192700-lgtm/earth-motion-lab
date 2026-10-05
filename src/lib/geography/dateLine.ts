import { assertFiniteNumber, normalizeLongitudeDegrees } from './angle'
import { calculateFixedOffsetClock } from './fixedOffsetTime'

export type DateLineDirection = 'east' | 'west'

export function assertDateLineDirection(direction: DateLineDirection): void {
  if (direction !== 'east' && direction !== 'west') throw new RangeError('direction must be east or west')
}

export function assertDateLineProgress(progress: number): void {
  assertFiniteNumber(progress, 'progress')
  if (progress < 0 || progress > 1) throw new RangeError('progress must be between 0 and 1')
}

/**
 * Ideal 180° date boundary, same UTC instant throughout the crossing.
 * Eastbound: 179E -> 180 -> 179W; westbound is the reverse.
 * At progress=0.5 the observer is assigned to the destination side by convention.
 * UTC±12 are illustrative clocks, not a legal zone lookup by longitude.
 */
export function calculateDateLineCrossing(direction: DateLineDirection, progress: number, utcDate: Date) {
  assertDateLineDirection(direction)
  assertDateLineProgress(progress)
  const eastbound = direction === 'east'
  const crossed = progress >= 0.5
  const beforeOffsetMinutes = eastbound ? 720 : -720
  const afterOffsetMinutes = -beforeOffsetMinutes
  const before = calculateFixedOffsetClock(beforeOffsetMinutes, utcDate)
  const after = calculateFixedOffsetClock(afterOffsetMinutes, utcDate)
  const rawLongitude = eastbound ? 179 + progress * 2 : -179 - progress * 2
  // Preserve destination-side ±180 notation at the boundary.
  const longitudeDegrees = progress === 0.5 ? (eastbound ? -180 : 180) : normalizeLongitudeDegrees(rawLongitude)
  return {
    longitudeDegrees,
    latitudeDegrees: 30,
    crossed,
    dateAdjustmentDays: eastbound ? -1 : 1,
    beforeOffsetMinutes,
    afterOffsetMinutes,
    before,
    after,
    current: crossed ? after : before,
    westernSide: eastbound ? before : after,
    easternSide: eastbound ? after : before,
  }
}
