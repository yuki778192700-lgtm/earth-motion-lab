import { MathUtils, Vector3 } from 'three'

export const EARTH_RADIUS = 1.45

// 高中地理教材采用 23°26′；对应南北回归线，余角 66°34′ 对应南北极圈。
export const EARTH_AXIAL_TILT_DEGREES = 23 + 26 / 60
export const EARTH_AXIAL_TILT_RADIANS = MathUtils.degToRad(EARTH_AXIAL_TILT_DEGREES)
export const EARTH_ORIENTATION_Z_RADIANS = -EARTH_AXIAL_TILT_RADIANS
export const TROPIC_LATITUDE_DEGREES = EARTH_AXIAL_TILT_DEGREES
export const POLAR_CIRCLE_LATITUDE_DEGREES = 90 - EARTH_AXIAL_TILT_DEGREES

const WORLD_Z_AXIS = new Vector3(0, 0, 1)

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number`)
  }
}

export function normalizeLongitude(longitudeDegrees: number): number {
  assertFinite(longitudeDegrees, 'longitudeDegrees')
  return ((longitudeDegrees + 180) % 360 + 360) % 360 - 180
}

/**
 * 将地理坐标转换为地球局部坐标。
 *
 * 坐标约定：
 * +Y = 北极；+X = (0°, 0°)；-Z = (0°, 90°E)。
 * 东经为正、西经为负。返回值尚未施加地轴倾角。
 */
export function latitudeLongitudeToVector3(
  latitudeDegrees: number,
  longitudeDegrees: number,
  radius = EARTH_RADIUS,
  target = new Vector3(),
): Vector3 {
  assertFinite(latitudeDegrees, 'latitudeDegrees')
  assertFinite(radius, 'radius')

  if (latitudeDegrees < -90 || latitudeDegrees > 90) {
    throw new RangeError('latitudeDegrees must be between -90 and 90')
  }

  if (radius <= 0) {
    throw new RangeError('radius must be greater than zero')
  }

  const latitude = MathUtils.degToRad(latitudeDegrees)
  const longitude = MathUtils.degToRad(normalizeLongitude(longitudeDegrees))
  const projectedRadius = radius * Math.cos(latitude)

  return target.set(
    projectedRadius * Math.cos(longitude),
    radius * Math.sin(latitude),
    -projectedRadius * Math.sin(longitude),
  )
}

export function earthLocalToWorld(localPosition: Vector3, target = new Vector3()): Vector3 {
  return target.copy(localPosition).applyAxisAngle(WORLD_Z_AXIS, EARTH_ORIENTATION_Z_RADIANS)
}

export function createLatitudePath(
  latitudeDegrees: number,
  radius = EARTH_RADIUS,
  segments = 192,
): Vector3[] {
  return Array.from({ length: segments + 1 }, (_, index) =>
    latitudeLongitudeToVector3(latitudeDegrees, (index / segments) * 360 - 180, radius),
  )
}

export function createLongitudePath(
  longitudeDegrees: number,
  radius = EARTH_RADIUS,
  segments = 128,
): Vector3[] {
  return Array.from({ length: segments + 1 }, (_, index) =>
    latitudeLongitudeToVector3(-90 + (index / segments) * 180, longitudeDegrees, radius),
  )
}
