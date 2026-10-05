import { MathUtils, Quaternion, Vector3 } from 'three'
import { EARTH_AXIAL_TILT_RADIANS, EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'
import { isPolarDay, isPolarNight, subsolarPoint } from '../../lib/geography'
import { calculateSolarEphemeris } from '../../lib/geography/solarEphemeris'
import {
  calculateLightPropagationDirection,
  createSunDirectionVector,
  getFixedSunPosition,
  getSunlightPropagationDirection,
} from '../solar/solarDirection'

export { SUN_DIRECTION, getSunlightPropagationDirection } from '../solar/solarDirection'

const X_AXIS = new Vector3(1, 0, 0)
const Y_AXIS = new Vector3(0, 1, 0)

/** 晨昏线实验中地球球心的固定世界坐标。 */
export const DAY_NIGHT_EARTH_CENTER: Readonly<Vector3> = Object.freeze(
  new Vector3(1.15, 0, 0),
)

export const OBSERVER_MARKER_DEFAULT_LONGITUDE_DEGREES = 120

export type ObserverLightingState = 'day' | 'night' | 'sunrise' | 'sunset' | 'horizon'

export interface DayNightEarthPose {
  /** 地轴和黄道坐标系在太阳锁定世界坐标中的姿态。 */
  orientationQuaternion: Quaternion
  /** 地表绕地轴自西向东的旋转角，单位：弧度。 */
  surfaceRotationRadians: number
  /** 当前地轴北向在世界坐标中的单位向量。 */
  northAxisWorld: Vector3
  /** 太阳视黄经，单位：度。 */
  solarLongitudeDegrees: number
  /** 黄赤交角，单位：度。 */
  obliquityDegrees: number
}

export interface WorldTerminatorGeometry {
  dawn: Vector3[]
  dusk: Vector3[]
}

export interface ParallelSunRaySegment {
  start: Vector3
  end: Vector3
  arrowPosition: Vector3
}

function earthCenterVector(): Vector3 {
  return new Vector3(
    DAY_NIGHT_EARTH_CENTER.x,
    DAY_NIGHT_EARTH_CENTER.y,
    DAY_NIGHT_EARTH_CENTER.z,
  )
}

function longitudeRadiansFromVector(vector: Vector3): number {
  return Math.atan2(-vector.z, vector.x)
}

function normalizeRadians(radians: number): number {
  return ((radians + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI
}

/**
 * 计算太阳锁定观察系中的地球姿态。
 *
 * 世界中的太阳始终位于 -X。地轴仍保持与黄道法线 23°26′ 的真实夹角；
 * 随日期改变的是日地轨道参考方向，而不是太阳光方向。
 */
export function calculateDayNightEarthPose(date: Date): DayNightEarthPose {
  const ephemeris = calculateSolarEphemeris(date)
  const solarLongitudeRadians = MathUtils.degToRad(ephemeris.apparentLongitudeDegrees)
  const obliquityRadians = MathUtils.degToRad(ephemeris.correctedObliquityDegrees)

  // 先倾斜地轴，再绕黄道北极旋转参考系，使日地连线固定到世界 -X。
  const obliquity = new Quaternion().setFromAxisAngle(X_AXIS, -obliquityRadians)
  const sunLockedOrbitFrame = new Quaternion().setFromAxisAngle(
    Y_AXIS,
    Math.PI - solarLongitudeRadians,
  )
  const orientationQuaternion = sunLockedOrbitFrame.multiply(obliquity)

  const directPoint = subsolarPoint(date)
  const sunInUnspunEarthLocal = createSunDirectionVector().applyQuaternion(
    orientationQuaternion.clone().invert(),
  )
  const sunLocalLongitudeRadians = longitudeRadiansFromVector(sunInUnspunEarthLocal)
  const surfaceRotationRadians = normalizeRadians(
    sunLocalLongitudeRadians - MathUtils.degToRad(directPoint.longitudeDegrees),
  )
  const northAxisWorld = Y_AXIS.clone().applyQuaternion(orientationQuaternion).normalize()

  return {
    orientationQuaternion,
    surfaceRotationRadians,
    northAxisWorld,
    solarLongitudeDegrees: ephemeris.apparentLongitudeDegrees,
    obliquityDegrees: ephemeris.correctedObliquityDegrees,
  }
}

export function geographicNormalToDayNightWorld(
  date: Date,
  latitudeDegrees: number,
  longitudeDegrees: number,
): Vector3 {
  const pose = calculateDayNightEarthPose(date)
  return latitudeLongitudeToVector3(latitudeDegrees, longitudeDegrees, 1)
    .applyAxisAngle(Y_AXIS, pose.surfaceRotationRadians)
    .applyQuaternion(pose.orientationQuaternion)
    .normalize()
}

export function geographicPointToDayNightWorld(
  date: Date,
  latitudeDegrees: number,
  longitudeDegrees: number,
  radius = EARTH_RADIUS,
): Vector3 {
  return geographicNormalToDayNightWorld(date, latitudeDegrees, longitudeDegrees)
    .multiplyScalar(radius)
    .add(earthCenterVector())
}

/** 正值为昼半球，负值为夜半球，零值位于晨昏圈。 */
export function calculateWorldIllumination(
  date: Date,
  latitudeDegrees: number,
  longitudeDegrees: number,
): number {
  return geographicNormalToDayNightWorld(date, latitudeDegrees, longitudeDegrees).dot(
    createSunDirectionVector(),
  )
}

/**
 * 世界坐标表面法向随地球自西向东旋转时，受光量的一阶变化趋势。
 * 正值表示正在进入昼半球（晨线），负值表示正在进入夜半球（昏线）。
 */
export function calculateWorldIlluminationTrend(
  date: Date,
  worldSurfaceNormal: Vector3,
): number {
  const pose = calculateDayNightEarthPose(date)
  return pose.northAxisWorld
    .clone()
    .cross(worldSurfaceNormal.clone().normalize())
    .dot(createSunDirectionVector())
}

/**
 * 观察点状态完全由世界坐标光照计算。
 * 临界带约对应太阳中心距几何地平线 ±2°，用于让高速课堂动画可读。
 */
export function calculateObserverLightingState(
  date: Date,
  latitudeDegrees: number,
  longitudeDegrees: number,
  transitionDotThreshold = Math.sin(MathUtils.degToRad(2)),
): ObserverLightingState {
  const illumination = calculateWorldIllumination(date, latitudeDegrees, longitudeDegrees)
  const declination = subsolarPoint(date).latitudeDegrees
  // 极昼/极夜（包括相切边界）没有日常升落，不能用±2°动画提示带误标。
  // 极点的季节升落也不等同于每日自转导致的日出日落。
  if (Math.abs(latitudeDegrees) === 90 || isPolarDay(latitudeDegrees, declination) || isPolarNight(latitudeDegrees, declination)) {
    return illumination > 1e-12 ? 'day' : illumination < -1e-12 ? 'night' : 'horizon'
  }

  if (illumination > transitionDotThreshold) return 'day'
  if (illumination < -transitionDotThreshold) return 'night'

  const oneMinuteLater = new Date(date.getTime() + 60_000)
  const futureIllumination = calculateWorldIllumination(
    oneMinuteLater,
    latitudeDegrees,
    longitudeDegrees,
  )
  return futureIllumination >= illumination ? 'sunrise' : 'sunset'
}

/**
 * 由 n·SUN_DIRECTION=0 直接建立世界坐标晨昏圈，并按光照变化率分为晨线和昏线。
 */
export function calculateWorldTerminatorGeometry(
  date: Date,
  radius = EARTH_RADIUS * 1.018,
  segmentsPerHalf = 128,
): WorldTerminatorGeometry {
  const pose = calculateDayNightEarthPose(date)
  const sunDirection = createSunDirectionVector()
  const projectedNorth = pose.northAxisWorld
    .clone()
    .addScaledVector(sunDirection, -pose.northAxisWorld.dot(sunDirection))
    .normalize()
  const positiveRotationSide = sunDirection.clone().cross(projectedNorth).normalize()
  const center = earthCenterVector()

  const createHalf = (startRadians: number) =>
    Array.from({ length: segmentsPerHalf + 1 }, (_, index) => {
      const angle = startRadians + (Math.PI * index) / segmentsPerHalf
      return projectedNorth
        .clone()
        .multiplyScalar(Math.cos(angle))
        .addScaledVector(positiveRotationSide, Math.sin(angle))
        .multiplyScalar(radius)
        .add(center)
    })

  const firstHalf = createHalf(0)
  const secondHalf = createHalf(Math.PI)
  const firstMidpointNormal = firstHalf[Math.floor(firstHalf.length / 2)]!
    .clone()
    .sub(center)
    .normalize()
  const firstHalfIsDawn = pose.northAxisWorld
    .clone()
    .cross(firstMidpointNormal)
    .dot(sunDirection) > 0

  return firstHalfIsDawn
    ? { dawn: firstHalf, dusk: secondHalf }
    : { dawn: secondHalf, dusk: firstHalf }
}

/** 固定、等间距、等长度的太阳平行光视觉辅助线。 */
export function createParallelSunRaySegments(
  verticalOffsets: readonly number[] = [-1.9, -1.425, -0.95, -0.475, 0, 0.475, 0.95, 1.425, 1.9],
): ParallelSunRaySegment[] {
  const directionToSun = createSunDirectionVector()
  const propagation = getSunlightPropagationDirection()
  const center = earthCenterVector()
  const startDistance = 6.45
  const rayLength = 4.82

  return verticalOffsets.map((verticalOffset, index) => {
    const start = center
      .clone()
      .addScaledVector(directionToSun, startDistance)
      .addScaledVector(Y_AXIS, verticalOffset)
    const end = start.clone().addScaledVector(propagation, rayLength)
    const arrowPosition = start.clone().lerp(end, index % 2 === 0 ? 0.58 : 0.72)
    return { start, end, arrowPosition }
  })
}

/** 用于测试与调试：真实平行光 position → target 的传播方向。 */
export function calculateDirectionalLightPropagationDirection(): Vector3 {
  const center = earthCenterVector()
  const position = getFixedSunPosition(center, 8)
  return calculateLightPropagationDirection(position, center)
}

/** 教材标称黄赤交角，便于科学一致性测试。 */
export const TEXTBOOK_OBLIQUITY_RADIANS = EARTH_AXIAL_TILT_RADIANS
