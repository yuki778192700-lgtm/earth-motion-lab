import { assertFiniteNumber, assertValidDate } from './angle'
import { localSolarTime } from './solarTime'

const DAY_MS = 86_400_000

export function assertTeachingLongitude(longitudeDegrees: number): void {
  assertFiniteNumber(longitudeDegrees, 'longitudeDegrees')
  if (Math.abs(longitudeDegrees) > 180) throw new RangeError('longitudeDegrees must be between -180 and 180')
}

/** 地方平均太阳时的日期以 UTC 日历字段承载，并非另一个物理时刻。 */
export function calculateLocalMeanClock(longitudeDegrees: number, utcDate: Date) {
  assertTeachingLongitude(longitudeDegrees)
  assertValidDate(utcDate)
  const time = localSolarTime(longitudeDegrees, utcDate)
  const utcMidnight = new Date(utcDate)
  utcMidnight.setUTCHours(0, 0, 0, 0)
  return {
    ...time,
    calendarTimeMs: utcMidnight.getTime() + time.dayOffset * DAY_MS + time.decimalHours * 3_600_000,
  }
}

/** B−A：正值表示 B 的地方平均太阳时更早到达同一钟点，即读数领先。 */
export function compareLocalMeanTimes(longitudeA: number, longitudeB: number, utcDate: Date) {
  assertTeachingLongitude(longitudeA)
  assertTeachingLongitude(longitudeB)
  return {
    a: calculateLocalMeanClock(longitudeA, utcDate),
    b: calculateLocalMeanClock(longitudeB, utcDate),
    longitudeDifferenceDegrees: longitudeB - longitudeA,
    timeDifferenceMinutes: (longitudeB - longitudeA) * 4,
    sameMeridianDifferentDateConvention: Math.abs(longitudeA - longitudeB) === 360,
  }
}
