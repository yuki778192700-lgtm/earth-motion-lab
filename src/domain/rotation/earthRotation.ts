import {
  latitudeRotationSpeed,
  MEAN_EARTH_RADIUS_KM,
} from '../../lib/geography/rotation'

export { MEAN_EARTH_RADIUS_KM }
export const MEAN_SOLAR_DAY_SECONDS = 86_400
export const MEAN_SIDEREAL_DAY_SECONDS = 86_164.0905
export const EARTH_ANGULAR_VELOCITY_RADIANS_PER_SECOND =
  (Math.PI * 2) / MEAN_SOLAR_DAY_SECONDS
export const EARTH_ANGULAR_VELOCITY_DEGREES_PER_HOUR = 15

const SOLAR_DAY_MILLISECONDS = MEAN_SOLAR_DAY_SECONDS * 1_000
const SIDEREAL_DAY_MILLISECONDS = MEAN_SIDEREAL_DAY_SECONDS * 1_000
const REFERENCE_PRIME_MERIDIAN_NOON_UTC = Date.UTC(1970, 0, 1, 12, 0, 0)

export interface EarthRotationMetrics {
  latitudeDegrees: number
  parallelRadiusKm: number
  angularVelocityDegreesPerHour: number
  angularVelocityRadiansPerSecond: number
  linearVelocityKmPerHour: number
}

function assertLatitude(latitudeDegrees: number): void {
  if (!Number.isFinite(latitudeDegrees)) {
    throw new TypeError('latitudeDegrees must be a finite number')
  }

  if (latitudeDegrees < -90 || latitudeDegrees > 90) {
    throw new RangeError('latitudeDegrees must be between -90 and 90')
  }
}

function positiveModulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus
}

export function calculateEarthRotationMetrics(
  latitudeDegrees: number,
): EarthRotationMetrics {
  assertLatitude(latitudeDegrees)

  const latitudeRadians = (latitudeDegrees * Math.PI) / 180
  const rawParallelRadius = MEAN_EARTH_RADIUS_KM * Math.cos(latitudeRadians)
  const parallelRadiusKm = Math.abs(rawParallelRadius) < 1e-9 ? 0 : rawParallelRadius
  const linearVelocityKmPerHour = latitudeRotationSpeed(latitudeDegrees)

  return {
    latitudeDegrees,
    parallelRadiusKm,
    angularVelocityDegreesPerHour: EARTH_ANGULAR_VELOCITY_DEGREES_PER_HOUR,
    angularVelocityRadiansPerSecond: EARTH_ANGULAR_VELOCITY_RADIANS_PER_SECOND,
    linearVelocityKmPerHour,
  }
}

/**
 * 固定太阳位于世界坐标 +X 时，计算地球绕局部 +Y 轴的自转角。
 * 12:00 UTC 时本初子午线朝向太阳；角度随时间正向增加，即自西向东。
 */
export function getEarthRotationAngleRadians(simulationTimeMs: number): number {
  if (!Number.isFinite(simulationTimeMs)) {
    throw new TypeError('simulationTimeMs must be a finite number')
  }

  const elapsed = simulationTimeMs - REFERENCE_PRIME_MERIDIAN_NOON_UTC
  const dayFraction = positiveModulo(elapsed, SOLAR_DAY_MILLISECONDS) / SOLAR_DAY_MILLISECONDS
  return dayFraction * Math.PI * 2
}

/**
 * 公转场景中的地球表面相对惯性空间按恒星日自转。
 * 因此每经过一个平均太阳日，表面会比 360° 多转约 0.986°。
 */
export function getEarthSiderealRotationAngleRadians(simulationTimeMs: number): number {
  if (!Number.isFinite(simulationTimeMs)) {
    throw new TypeError('simulationTimeMs must be a finite number')
  }

  const elapsed = simulationTimeMs - REFERENCE_PRIME_MERIDIAN_NOON_UTC
  const dayFraction = positiveModulo(elapsed, SIDEREAL_DAY_MILLISECONDS) / SIDEREAL_DAY_MILLISECONDS
  return dayFraction * Math.PI * 2
}
