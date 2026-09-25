import {
  assertDeclinationDegrees,
  assertLatitudeDegrees,
  degreesToRadians,
} from './angle'

const NUMERIC_TOLERANCE = 1e-12

function polarProduct(latitudeDegrees: number, declinationDegrees: number): number {
  return (
    Math.tan(degreesToRadians(latitudeDegrees)) *
    Math.tan(degreesToRadians(declinationDegrees))
  )
}

function validateInputs(latitudeDegrees: number, declinationDegrees: number): void {
  assertLatitudeDegrees(latitudeDegrees)
  assertDeclinationDegrees(declinationDegrees)
}

/** 正午太阳高度角，单位：度；负值表示太阳位于地平线以下。 */
export function solarNoonAltitude(
  latitudeDegrees: number,
  declinationDegrees: number,
): number {
  validateInputs(latitudeDegrees, declinationDegrees)
  return 90 - Math.abs(latitudeDegrees - declinationDegrees)
}

/** 是否为极昼。极圈在至日的相切边界计入极昼。 */
export function isPolarDay(
  latitudeDegrees: number,
  declinationDegrees: number,
): boolean {
  validateInputs(latitudeDegrees, declinationDegrees)

  if (declinationDegrees === 0) return false
  if (Math.abs(latitudeDegrees) === 90) {
    return latitudeDegrees * declinationDegrees > 0
  }

  return polarProduct(latitudeDegrees, declinationDegrees) >= 1 - NUMERIC_TOLERANCE
}

/** 是否为极夜。极圈在至日的相切边界计入极夜。 */
export function isPolarNight(
  latitudeDegrees: number,
  declinationDegrees: number,
): boolean {
  validateInputs(latitudeDegrees, declinationDegrees)

  if (declinationDegrees === 0) return false
  if (Math.abs(latitudeDegrees) === 90) {
    return latitudeDegrees * declinationDegrees < 0
  }

  return polarProduct(latitudeDegrees, declinationDegrees) <= -1 + NUMERIC_TOLERANCE
}

/**
 * 几何昼长，单位：小时，范围 [0, 24]。
 * 不含大气折射、太阳视半径及地形修正。
 */
export function dayLength(
  latitudeDegrees: number,
  declinationDegrees: number,
): number {
  validateInputs(latitudeDegrees, declinationDegrees)

  if (isPolarDay(latitudeDegrees, declinationDegrees)) return 24
  if (isPolarNight(latitudeDegrees, declinationDegrees)) return 0
  if (Math.abs(latitudeDegrees) === 90) return 12

  const cosineHourAngle = -polarProduct(latitudeDegrees, declinationDegrees)
  const boundedCosine = Math.max(-1, Math.min(1, cosineHourAngle))
  const sunsetHourAngleRadians = Math.acos(boundedCosine)
  return (24 * sunsetHourAngleRadians) / Math.PI
}

/** 日出地方太阳时，单位：小数小时；无每日升起事件时返回 null。 */
export function sunriseTime(
  latitudeDegrees: number,
  declinationDegrees: number,
): number | null {
  validateInputs(latitudeDegrees, declinationDegrees)
  if (
    Math.abs(latitudeDegrees) === 90 ||
    isPolarDay(latitudeDegrees, declinationDegrees) ||
    isPolarNight(latitudeDegrees, declinationDegrees)
  ) {
    return null
  }

  return 12 - dayLength(latitudeDegrees, declinationDegrees) / 2
}

/** 日落地方太阳时，单位：小数小时；无每日落下事件时返回 null。 */
export function sunsetTime(
  latitudeDegrees: number,
  declinationDegrees: number,
): number | null {
  validateInputs(latitudeDegrees, declinationDegrees)
  if (
    Math.abs(latitudeDegrees) === 90 ||
    isPolarDay(latitudeDegrees, declinationDegrees) ||
    isPolarNight(latitudeDegrees, declinationDegrees)
  ) {
    return null
  }

  return 12 + dayLength(latitudeDegrees, declinationDegrees) / 2
}
