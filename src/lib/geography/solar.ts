import { assertValidDate, normalizeLongitudeDegrees } from './angle'
import { calculateSolarEphemeris } from './solarEphemeris'
import type { GeographicPoint } from './types'

/** 返回太阳赤纬，北偏为正，单位：度。 */
export function solarDeclination(date: Date): number {
  return calculateSolarEphemeris(date).declinationDegrees
}

/**
 * 返回太阳直射点。纬度、经度单位均为度；经度东正西负。
 * 经度包含时间方程修正，表示太阳视位置对应的直射经线。
 */
export function subsolarPoint(date: Date): GeographicPoint {
  assertValidDate(date)
  const ephemeris = calculateSolarEphemeris(date)
  const utcMinutes =
    date.getUTCHours() * 60 +
    date.getUTCMinutes() +
    date.getUTCSeconds() / 60 +
    date.getUTCMilliseconds() / 60_000
  const longitudeDegrees = normalizeLongitudeDegrees(
    (720 - utcMinutes - ephemeris.equationOfTimeMinutes) / 4,
  )

  return {
    latitudeDegrees: ephemeris.declinationDegrees,
    longitudeDegrees,
  }
}
