import {
  dayLength,
  isPolarDay,
  isPolarNight,
  solarDeclination,
  solarNoonAltitude,
  sunriseTime,
  sunsetTime,
  subsolarPoint,
} from '../../lib/geography'
import type { GeographicPoint } from '../../lib/geography'

export type PolarState = 'none' | 'polar-day' | 'polar-night'

export interface DayNightModel {
  date: Date
  latitudeDegrees: number
  declinationDegrees: number
  solarNoonAltitudeDegrees: number
  subsolarPoint: GeographicPoint
  daylightHours: number
  nightHours: number
  sunriseSolarHours: number | null
  sunsetSolarHours: number | null
  polarState: PolarState
}

export function calculateDayNightModel(
  date: Date,
  latitudeDegrees: number,
): DayNightModel {
  const declinationDegrees = solarDeclination(date)
  const daylightHours = dayLength(latitudeDegrees, declinationDegrees)
  const polarDay = isPolarDay(latitudeDegrees, declinationDegrees)
  const polarNight = isPolarNight(latitudeDegrees, declinationDegrees)

  return {
    date,
    latitudeDegrees,
    declinationDegrees,
    solarNoonAltitudeDegrees: solarNoonAltitude(latitudeDegrees, declinationDegrees),
    subsolarPoint: subsolarPoint(date),
    daylightHours,
    nightHours: 24 - daylightHours,
    sunriseSolarHours: sunriseTime(latitudeDegrees, declinationDegrees),
    sunsetSolarHours: sunsetTime(latitudeDegrees, declinationDegrees),
    polarState: polarDay ? 'polar-day' : polarNight ? 'polar-night' : 'none',
  }
}
