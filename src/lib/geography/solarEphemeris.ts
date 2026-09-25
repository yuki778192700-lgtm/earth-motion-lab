import {
  assertValidDate,
  degreesToRadians,
  normalizeDegrees360,
  radiansToDegrees,
} from './angle'

const DAY_MILLISECONDS = 86_400_000
const JULIAN_DAY_UNIX_EPOCH = 2_440_587.5
const JULIAN_DAY_J2000 = 2_451_545
const DAYS_PER_JULIAN_CENTURY = 36_525

export interface SolarEphemeris {
  julianDay: number
  julianCenturies: number
  eccentricity: number
  geometricMeanLongitudeDegrees: number
  meanAnomalyDegrees: number
  equationOfCenterDegrees: number
  trueAnomalyDegrees: number
  geometricLongitudeDegrees: number
  apparentLongitudeDegrees: number
  correctedObliquityDegrees: number
  declinationDegrees: number
  equationOfTimeMinutes: number
  distanceAu: number
}

export function dateToJulianDay(date: Date): number {
  assertValidDate(date)
  return date.getTime() / DAY_MILLISECONDS + JULIAN_DAY_UNIX_EPOCH
}

/** NOAA/Meeus 低阶太阳视位置模型；所有公开角度字段单位均为度。 */
export function calculateSolarEphemeris(date: Date): SolarEphemeris {
  const julianDay = dateToJulianDay(date)
  const julianCenturies = (julianDay - JULIAN_DAY_J2000) / DAYS_PER_JULIAN_CENTURY
  const t = julianCenturies
  const geometricMeanLongitudeDegrees = normalizeDegrees360(
    280.46646 + t * (36_000.76983 + t * 0.0003032),
  )
  const meanAnomalyDegrees = normalizeDegrees360(
    357.52911 + t * (35_999.05029 - 0.0001537 * t),
  )
  const eccentricity = 0.016708634 - t * (0.000042037 + 0.0000001267 * t)
  const meanAnomalyRadians = degreesToRadians(meanAnomalyDegrees)
  const equationOfCenterDegrees =
    Math.sin(meanAnomalyRadians) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * meanAnomalyRadians) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * meanAnomalyRadians) * 0.000289
  const trueAnomalyDegrees = meanAnomalyDegrees + equationOfCenterDegrees
  const geometricLongitudeDegrees = normalizeDegrees360(
    geometricMeanLongitudeDegrees + equationOfCenterDegrees,
  )
  const omegaDegrees = 125.04 - 1934.136 * t
  const apparentLongitudeDegrees = normalizeDegrees360(
    geometricLongitudeDegrees -
      0.00569 -
      0.00478 * Math.sin(degreesToRadians(omegaDegrees)),
  )
  const meanObliquityDegrees =
    23 +
    (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60
  const correctedObliquityDegrees =
    meanObliquityDegrees + 0.00256 * Math.cos(degreesToRadians(omegaDegrees))
  const correctedObliquityRadians = degreesToRadians(correctedObliquityDegrees)
  const apparentLongitudeRadians = degreesToRadians(apparentLongitudeDegrees)
  const declinationDegrees = radiansToDegrees(
    Math.asin(
      Math.sin(correctedObliquityRadians) * Math.sin(apparentLongitudeRadians),
    ),
  )
  const y = Math.tan(correctedObliquityRadians / 2) ** 2
  const geometricMeanLongitudeRadians = degreesToRadians(geometricMeanLongitudeDegrees)
  const equationOfTimeRadians =
    y * Math.sin(2 * geometricMeanLongitudeRadians) -
    2 * eccentricity * Math.sin(meanAnomalyRadians) +
    4 * eccentricity * y * Math.sin(meanAnomalyRadians) * Math.cos(2 * geometricMeanLongitudeRadians) -
    0.5 * y * y * Math.sin(4 * geometricMeanLongitudeRadians) -
    1.25 * eccentricity * eccentricity * Math.sin(2 * meanAnomalyRadians)
  const equationOfTimeMinutes = 4 * radiansToDegrees(equationOfTimeRadians)
  const trueAnomalyRadians = degreesToRadians(trueAnomalyDegrees)
  const distanceAu =
    (1.000001018 * (1 - eccentricity * eccentricity)) /
    (1 + eccentricity * Math.cos(trueAnomalyRadians))

  return {
    julianDay,
    julianCenturies,
    eccentricity,
    geometricMeanLongitudeDegrees,
    meanAnomalyDegrees,
    equationOfCenterDegrees,
    trueAnomalyDegrees,
    geometricLongitudeDegrees,
    apparentLongitudeDegrees,
    correctedObliquityDegrees,
    declinationDegrees,
    equationOfTimeMinutes,
    distanceAu,
  }
}
