import { describe, expect, it } from 'vitest'
import { MathUtils, SphereGeometry, Vector3 } from 'three'
import {
  EARTH_AXIAL_TILT_DEGREES,
  EARTH_ORIENTATION_Z_RADIANS,
  latitudeLongitudeToVector3,
} from '../lib/earthCoordinates'
import {
  calculateEarthOrbitState,
  calculateOrbitAlignedEarthRotationRadians,
  calculateSeasonalEvents,
} from './orbit/earthOrbit'
import { getEarthRotationAngleRadians } from './rotation/earthRotation'
import { calculateLatitudeArcGeometry, calculateTerminatorGeometry } from './dayNight/dayNightGeometry'
import { dayLength, solarDeclination, subsolarPoint } from '../lib/geography'

function normalizeLongitude(longitudeDegrees: number): number {
  return ((longitudeDegrees + 180) % 360 + 360) % 360 - 180
}

function illuminationAt(
  latitudeDegrees: number,
  longitudeDegrees: number,
  sunDirection: Vector3,
): number {
  return latitudeLongitudeToVector3(latitudeDegrees, longitudeDegrees, 1)
    .normalize()
    .dot(sunDirection)
}

describe('Three.js 经纬度与纹理坐标一致性', () => {
  it('北纬为 +Y，东经 90° 为 -Z，西经 90° 为 +Z', () => {
    expect(latitudeLongitudeToVector3(90, 0, 1).y).toBeCloseTo(1, 12)
    expect(latitudeLongitudeToVector3(-90, 0, 1).y).toBeCloseTo(-1, 12)
    expect(latitudeLongitudeToVector3(0, 90, 1).z).toBeCloseTo(-1, 12)
    expect(latitudeLongitudeToVector3(0, -90, 1).z).toBeCloseTo(1, 12)
  })

  it('Three.js 默认球体 UV 与等距圆柱纹理经度约定一致', () => {
    const geometry = new SphereGeometry(1, 4, 2)
    const positions = geometry.getAttribute('position')
    const uvs = geometry.getAttribute('uv')
    const equatorPrimeIndex = 1 * 5 + 2
    const equatorEast90Index = 1 * 5 + 3

    expect(uvs.getX(equatorPrimeIndex)).toBeCloseTo(0.5, 12)
    expect(positions.getX(equatorPrimeIndex)).toBeCloseTo(1, 12)
    expect(positions.getZ(equatorPrimeIndex)).toBeCloseTo(0, 12)
    expect(uvs.getX(equatorEast90Index)).toBeCloseTo(0.75, 12)
    expect(positions.getZ(equatorEast90Index)).toBeCloseTo(-1, 12)
    geometry.dispose()
  })

  it('地轴倾角使用教材值 23°26′，且度转弧度只发生一次', () => {
    expect(EARTH_AXIAL_TILT_DEGREES).toBeCloseTo(23 + 26 / 60, 12)
    expect(EARTH_ORIENTATION_Z_RADIANS).toBeCloseTo(
      -MathUtils.degToRad(23 + 26 / 60),
      12,
    )
  })
})

describe('自转与公转方向一致性', () => {
  it('地球自转使本初子午线向东经方向移动', () => {
    const noon = Date.parse('1970-01-01T12:00:00.000Z')
    const sixHoursLater = noon + 6 * 3_600_000
    const angle = getEarthRotationAngleRadians(sixHoursLater)
    const rotatedPrimeMeridian = latitudeLongitudeToVector3(0, 0, 1)
      .applyAxisAngle(new Vector3(0, 1, 0), angle)
    const east90 = latitudeLongitudeToVector3(0, 90, 1)
    expect(rotatedPrimeMeridian.distanceTo(east90)).toBeLessThan(1e-10)
  })

  it('从北黄极观察，春分到夏至的公转角动量指向 +Y', () => {
    const events = calculateSeasonalEvents(2026)
    const march = calculateEarthOrbitState(events[0]!.timeMs)
    const june = calculateEarthOrbitState(events[1]!.timeMs)
    const angularMomentumDirection = new Vector3(...march.scenePosition)
      .cross(new Vector3(...june.scenePosition))
    expect(angularMomentumDirection.y).toBeGreaterThan(0)
  })

  it('夏至北半球倾向太阳，冬至背向太阳', () => {
    const events = calculateSeasonalEvents(2026)
    const northAxis = new Vector3(0, 1, 0)
      .applyAxisAngle(new Vector3(0, 0, 1), EARTH_ORIENTATION_Z_RADIANS)
    const junePosition = new Vector3(...calculateEarthOrbitState(events[1]!.timeMs).scenePosition)
    const decemberPosition = new Vector3(...calculateEarthOrbitState(events[3]!.timeMs).scenePosition)
    expect(northAxis.dot(junePosition.clone().negate().normalize())).toBeGreaterThan(0)
    expect(northAxis.dot(decemberPosition.clone().negate().normalize())).toBeLessThan(0)
  })

  it('公转场景纹理上的太阳直射点始终朝向场景太阳', () => {
    const dates = [
      '2026-03-20T14:46:00.000Z',
      '2026-06-21T08:24:00.000Z',
      '2026-09-23T00:05:00.000Z',
      '2026-12-21T20:50:00.000Z',
      '2026-02-08T03:17:00.000Z',
    ]

    for (const isoDate of dates) {
      const timeMs = Date.parse(isoDate)
      const orbit = calculateEarthOrbitState(timeMs)
      const directPoint = subsolarPoint(new Date(timeMs))
      const renderedDirectPoint = latitudeLongitudeToVector3(
        directPoint.latitudeDegrees,
        directPoint.longitudeDegrees,
        1,
      )
        .applyAxisAngle(
          new Vector3(0, 1, 0),
          calculateOrbitAlignedEarthRotationRadians(timeMs),
        )
        .applyAxisAngle(new Vector3(0, 0, 1), EARTH_ORIENTATION_Z_RADIANS)
        .normalize()
      const towardSun = new Vector3(...orbit.scenePosition).negate().normalize()
      expect(renderedDirectPoint.dot(towardSun)).toBeGreaterThan(0.999999)
    }
  })

  it('二分二至太阳视黄经分别为 0°、90°、180°、270°', () => {
    const events = calculateSeasonalEvents(2026)
    for (const event of events) {
      const longitude = calculateEarthOrbitState(event.timeMs).sunApparentLongitudeDegrees
      const error = Math.abs(normalizeLongitude(longitude - event.targetSolarLongitudeDegrees))
      expect(error).toBeLessThan(0.01)
    }
  })

  it('2026 年二分二至时刻与 USNO 公布值保持在两分钟内', () => {
    const expectedUtcTimes = [
      Date.parse('2026-03-20T14:46:00.000Z'),
      Date.parse('2026-06-21T08:24:00.000Z'),
      Date.parse('2026-09-23T00:05:00.000Z'),
      Date.parse('2026-12-21T20:50:00.000Z'),
    ]
    const events = calculateSeasonalEvents(2026)
    events.forEach((event, index) => {
      expect(Math.abs(event.timeMs - expectedUtcTimes[index]!)).toBeLessThan(120_000)
    })
  })
})

describe('晨昏线、昼夜弧与南北半球边界', () => {
  const date = new Date('2026-06-21T08:24:00.000Z')
  const directPoint = subsolarPoint(date)
  const sunDirection = latitudeLongitudeToVector3(
    directPoint.latitudeDegrees,
    directPoint.longitudeDegrees,
    1,
  ).normalize()

  it('昼弧中点位于昼半球，夜弧中点位于夜半球', () => {
    const geometry = calculateLatitudeArcGeometry(date, 40)
    const dayMiddle = geometry.dayArc[Math.floor(geometry.dayArc.length / 2)]!
    const nightMiddle = geometry.nightArc[Math.floor(geometry.nightArc.length / 2)]!
    expect(illuminationAt(dayMiddle.latitudeDegrees, dayMiddle.longitudeDegrees, sunDirection)).toBeGreaterThan(0)
    expect(illuminationAt(nightMiddle.latitudeDegrees, nightMiddle.longitudeDegrees, sunDirection)).toBeLessThan(0)
  })

  it('晨线东侧进入昼半球，昏线东侧进入夜半球', () => {
    const geometry = calculateTerminatorGeometry(date, 1)
    const dawn = geometry.dawn.find((point) => point.latitudeDegrees === 0)!
    const dusk = geometry.dusk.find((point) => point.latitudeDegrees === 0)!
    expect(illuminationAt(0, dawn.longitudeDegrees - 0.1, sunDirection)).toBeLessThan(0)
    expect(illuminationAt(0, dawn.longitudeDegrees + 0.1, sunDirection)).toBeGreaterThan(0)
    expect(illuminationAt(0, dusk.longitudeDegrees - 0.1, sunDirection)).toBeGreaterThan(0)
    expect(illuminationAt(0, dusk.longitudeDegrees + 0.1, sunDirection)).toBeLessThan(0)
  })

  it('南北半球交换纬度和赤纬后昼长保持对称', () => {
    for (const latitude of [0, 23 + 26 / 60, 40, 66]) {
      const declination = solarDeclination(date)
      expect(dayLength(latitude, declination)).toBeCloseTo(
        dayLength(-latitude, -declination),
        10,
      )
    }
  })
})
