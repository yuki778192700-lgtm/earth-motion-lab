import { assertLatitudeDegrees, degreesToRadians } from './angle'

export const MEAN_EARTH_RADIUS_KM = 6_371.0088
export const MEAN_SOLAR_DAY_HOURS = 24

/**
 * 指定纬度的地球自转线速度，单位：km/h。
 * 采用平均地球半径和 24 小时平均太阳日的高中地理教学约定。
 */
export function latitudeRotationSpeed(latitudeDegrees: number): number {
  assertLatitudeDegrees(latitudeDegrees)
  const parallelRadiusKm =
    MEAN_EARTH_RADIUS_KM * Math.cos(degreesToRadians(latitudeDegrees))
  const speedKmPerHour =
    (2 * Math.PI * parallelRadiusKm) / MEAN_SOLAR_DAY_HOURS

  return Math.abs(speedKmPerHour) < 1e-9 ? 0 : speedKmPerHour
}
