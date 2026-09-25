import { dateToJulianDay, calculateSolarEphemeris } from '../../lib/geography/solarEphemeris'
import { degreesToRadians } from '../../lib/geography/angle'
import { subsolarPoint } from '../../lib/geography/solar'
import { EARTH_AXIAL_TILT_RADIANS } from '../../lib/earthCoordinates'

export const ASTRONOMICAL_UNIT_KM = 149_597_870.7
export const ORBIT_SCENE_SCALE = 5.9
export const ORBIT_ECCENTRICITY_REFERENCE = 0.0167

export type SeasonalEventId = 'march-equinox' | 'june-solstice' | 'september-equinox' | 'december-solstice'

export interface EarthOrbitState {
  julianDay: number
  julianCenturies: number
  eccentricity: number
  sunGeometricLongitudeDegrees: number
  sunApparentLongitudeDegrees: number
  earthHeliocentricLongitudeDegrees: number
  distanceAu: number
  orbitalSpeedKmPerSecond: number
  scenePosition: readonly [number, number, number]
}

export interface SeasonalEvent {
  id: SeasonalEventId
  label: string
  targetSolarLongitudeDegrees: 0 | 90 | 180 | 270
  timeMs: number
}

const SEASON_DEFINITIONS: ReadonlyArray<
  Omit<SeasonalEvent, 'timeMs'> & { monthIndex: number; approximateDay: number }
> = [
  {
    id: 'march-equinox',
    label: '春分',
    targetSolarLongitudeDegrees: 0,
    monthIndex: 2,
    approximateDay: 20,
  },
  {
    id: 'june-solstice',
    label: '夏至',
    targetSolarLongitudeDegrees: 90,
    monthIndex: 5,
    approximateDay: 21,
  },
  {
    id: 'september-equinox',
    label: '秋分',
    targetSolarLongitudeDegrees: 180,
    monthIndex: 8,
    approximateDay: 22,
  },
  {
    id: 'december-solstice',
    label: '冬至',
    targetSolarLongitudeDegrees: 270,
    monthIndex: 11,
    approximateDay: 21,
  },
]

// Meeus《Astronomical Algorithms》Chapter 27，适用于公元 1000—3000 年。
// 每行依次对应 3 月分点、6 月至点、9 月分点、12 月至点的 JDE0 多项式。
const SEASON_JDE0_COEFFICIENTS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [2_451_623.80984, 365_242.37404, 0.05169, -0.00411, -0.00057],
  [2_451_716.56767, 365_241.62603, 0.00325, 0.00888, -0.00030],
  [2_451_810.21715, 365_242.01767, -0.11575, 0.00337, 0.00078],
  [2_451_900.05952, 365_242.74049, -0.06223, -0.00823, 0.00032],
]

const SEASON_PERIODIC_TERMS: ReadonlyArray<readonly [number, number, number]> = [
  [485, 324.96, 1934.136], [203, 337.23, 32964.467],
  [199, 342.08, 20.186], [182, 27.85, 445267.112],
  [156, 73.14, 45036.886], [136, 171.52, 22518.443],
  [77, 222.54, 65928.934], [74, 296.72, 3034.906],
  [70, 243.58, 9037.513], [58, 119.81, 33718.147],
  [52, 297.17, 150.678], [50, 21.02, 2281.226],
  [45, 247.54, 29929.562], [44, 325.15, 31555.956],
  [29, 60.93, 4443.417], [18, 155.12, 67555.328],
  [17, 288.79, 4562.452], [16, 198.04, 62894.029],
  [14, 199.76, 31436.921], [12, 95.39, 14577.848],
  [12, 287.11, 31931.756], [12, 320.81, 34777.259],
  [9, 227.73, 1222.114], [8, 15.45, 16859.074],
]

export function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

function signedAngularDifferenceDegrees(angle: number, target: number): number {
  return ((angle - target + 540) % 360) - 180
}

export function unixTimeToJulianDay(timeMs: number): number {
  if (!Number.isFinite(timeMs)) {
    throw new TypeError('timeMs must be a finite number')
  }

  return dateToJulianDay(new Date(timeMs))
}

/**
 * NOAA/Meeus 低阶太阳视位置模型。
 * 轨道位置使用几何真黄经，节气判定使用包含章动与光行差修正的太阳视黄经。
 */
export function calculateEarthOrbitState(timeMs: number): EarthOrbitState {
  const ephemeris = calculateSolarEphemeris(new Date(timeMs))
  const {
    julianDay,
    julianCenturies,
    eccentricity,
    geometricLongitudeDegrees: sunGeometricLongitudeDegrees,
    apparentLongitudeDegrees: sunApparentLongitudeDegrees,
    distanceAu,
  } = ephemeris
  const earthHeliocentricLongitudeDegrees = normalizeDegrees(
    sunGeometricLongitudeDegrees + 180,
  )
  const solarLongitudeRadians = degreesToRadians(sunGeometricLongitudeDegrees)
  const scaledDistance = distanceAu * ORBIT_SCENE_SCALE

  // +Y 为北黄极。春分时地球约位于 -Z，夏至约位于 -X；从 +Y 俯视为逆时针。
  const scenePosition: readonly [number, number, number] = [
    -Math.sin(solarLongitudeRadians) * scaledDistance,
    0,
    -Math.cos(solarLongitudeRadians) * scaledDistance,
  ]
  const orbitalSpeedKmPerSecond = 29.7847 * Math.sqrt(2 / distanceAu - 1)

  return {
    julianDay,
    julianCenturies,
    eccentricity,
    sunGeometricLongitudeDegrees,
    sunApparentLongitudeDegrees,
    earthHeliocentricLongitudeDegrees,
    distanceAu,
    orbitalSpeedKmPerSecond,
    scenePosition,
  }
}

/**
 * 公转场景中地球表面绕地轴的绝对相位，单位：弧度。
 *
 * 该相位同时约束两件事：
 * 1. 公转场景的太阳方向来自日心轨道位置；
 * 2. 纹理上位于太阳直射经度的点必须朝向太阳。
 *
 * 仅按恒星日累计角度只能保证转速，不能保证 UTC 时刻对应的经线朝向。
 */
export function calculateOrbitAlignedEarthRotationRadians(timeMs: number): number {
  const orbit = calculateEarthOrbitState(timeMs)
  const [earthX, , earthZ] = orbit.scenePosition
  const distance = Math.hypot(earthX, earthZ)
  const earthToSunWorldX = -earthX / distance
  const earthToSunWorldZ = -earthZ / distance

  // 撤销场景对地球施加的固定地轴倾角，得到太阳在地球局部坐标中的经度。
  const localSunX = Math.cos(EARTH_AXIAL_TILT_RADIANS) * earthToSunWorldX
  const localSunLongitudeRadians = Math.atan2(-earthToSunWorldZ, localSunX)
  const directLongitudeRadians = degreesToRadians(
    subsolarPoint(new Date(timeMs)).longitudeDegrees,
  )
  const rotation = localSunLongitudeRadians - directLongitudeRadians

  return ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
}

function solveSeasonalEventTime(
  year: number,
  monthIndex: number,
  approximateDay: number,
  targetLongitudeDegrees: number,
): number {
  let lower = Date.UTC(year, monthIndex, approximateDay - 4, 0, 0, 0)
  let upper = Date.UTC(year, monthIndex, approximateDay + 4, 0, 0, 0)

  for (let iteration = 0; iteration < 48; iteration += 1) {
    const middle = (lower + upper) / 2
    const difference = signedAngularDifferenceDegrees(
      calculateEarthOrbitState(middle).sunApparentLongitudeDegrees,
      targetLongitudeDegrees,
    )

    if (difference < 0) {
      lower = middle
    } else {
      upper = middle
    }
  }

  return Math.round((lower + upper) / 2)
}

function estimateDeltaTSeconds(year: number): number {
  // Espenak/Meeus 对 2005—2050 年的 ΔT 近似；分钟级节气展示足够。
  const t = year - 2000
  return 62.92 + 0.32217 * t + 0.005589 * t * t
}

function calculateMeeusSeasonalEventTime(year: number, seasonIndex: number): number {
  const coefficients = SEASON_JDE0_COEFFICIENTS[seasonIndex]!
  const y = (year - 2000) / 1000
  const jde0 =
    coefficients[0] +
    coefficients[1] * y +
    coefficients[2] * y ** 2 +
    coefficients[3] * y ** 3 +
    coefficients[4] * y ** 4
  const t = (jde0 - 2_451_545) / 36_525
  const wRadians = degreesToRadians(35_999.373 * t - 2.47)
  const deltaLambda = 1 + 0.0334 * Math.cos(wRadians) + 0.0007 * Math.cos(2 * wRadians)
  const periodicSum = SEASON_PERIODIC_TERMS.reduce(
    (sum, [amplitude, phaseDegrees, rateDegrees]) =>
      sum + amplitude * Math.cos(degreesToRadians(phaseDegrees + rateDegrees * t)),
    0,
  )
  const jdeTerrestrialTime = jde0 + (0.00001 * periodicSum) / deltaLambda
  const jdeUniversalTime = jdeTerrestrialTime - estimateDeltaTSeconds(year) / 86_400

  return Math.round((jdeUniversalTime - 2_440_587.5) * 86_400_000)
}

export function calculateSeasonalEvents(year: number): SeasonalEvent[] {
  if (!Number.isInteger(year) || year < 1 || year > 9999) {
    throw new RangeError('year must be an integer between 1 and 9999')
  }

  return SEASON_DEFINITIONS.map((definition, seasonIndex) => ({
    id: definition.id,
    label: definition.label,
    targetSolarLongitudeDegrees: definition.targetSolarLongitudeDegrees,
    timeMs: year >= 1000 && year <= 3000
      ? calculateMeeusSeasonalEventTime(year, seasonIndex)
      : solveSeasonalEventTime(
          year,
          definition.monthIndex,
          definition.approximateDay,
          definition.targetSolarLongitudeDegrees,
        ),
  }))
}

export function createOrbitPathForYear(year: number, samples = 360): EarthOrbitState[] {
  if (samples < 32) {
    throw new RangeError('samples must be at least 32')
  }

  const start = Date.UTC(year, 0, 1, 0, 0, 0)
  const end = Date.UTC(year + 1, 0, 1, 0, 0, 0)

  return Array.from({ length: samples + 1 }, (_, index) =>
    calculateEarthOrbitState(start + ((end - start) * index) / samples),
  )
}
