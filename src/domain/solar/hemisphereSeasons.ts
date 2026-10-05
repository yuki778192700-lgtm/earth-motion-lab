import { calculateEarthOrbitState, calculateSeasonalEvents } from '../orbit/earthOrbit'
import { dayLength, isPolarDay, isPolarNight, solarDeclination, solarNoonAltitude } from '../../lib/geography'

export function assertComparisonLatitude(latitudeDegrees: number): void {
  if (!Number.isFinite(latitudeDegrees) || latitudeDegrees < 0 || latitudeDegrees > 90) {
    throw new RangeError('comparison latitude must be between 0 and 90 degrees')
  }
}

/** 天文季节以现有节气模型的精确时刻为界，非气象季节或气候分区。 */
export function calculateHemisphereSeasons(timeMs: number, absoluteLatitudeDegrees: number) {
  assertComparisonLatitude(absoluteLatitudeDegrees)
  const date = new Date(timeMs)
  if (!Number.isFinite(date.getTime())) throw new RangeError('invalid date')
  const events = calculateSeasonalEvents(date.getUTCFullYear())
  const phase = events.reduce((index, event, eventIndex) => timeMs >= event.timeMs ? eventIndex : index, 3)
  const northSeason = (['春季', '夏季', '秋季', '冬季'] as const)[phase]!
  const southSeason = (['秋季', '冬季', '春季', '夏季'] as const)[phase]!
  const declinationDegrees = solarDeclination(date)
  const location = (latitudeDegrees: number, season: string) => ({
    latitudeDegrees, season,
    dayHours: dayLength(latitudeDegrees, declinationDegrees),
    noonAltitudeDegrees: solarNoonAltitude(latitudeDegrees, declinationDegrees),
    lightState: isPolarDay(latitudeDegrees, declinationDegrees) ? '极昼' : isPolarNight(latitudeDegrees, declinationDegrees) ? '极夜' : '昼夜交替',
  })
  return {
    events, declinationDegrees,
    distanceAu: calculateEarthOrbitState(timeMs).distanceAu,
    north: location(absoluteLatitudeDegrees, northSeason),
    south: location(-absoluteLatitudeDegrees, southSeason),
  }
}
