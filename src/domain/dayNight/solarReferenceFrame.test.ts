import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { subsolarPoint } from '../../lib/geography'
import {
  calculateDayNightEarthPose,
  calculateDirectionalLightPropagationDirection,
  calculateObserverLightingState,
  calculateWorldIllumination,
  calculateWorldIlluminationTrend,
  calculateWorldTerminatorGeometry,
  createParallelSunRaySegments,
  DAY_NIGHT_EARTH_CENTER,
  geographicNormalToDayNightWorld,
  getSunlightPropagationDirection,
  SUN_DIRECTION,
  TEXTBOOK_OBLIQUITY_RADIANS,
} from './solarReferenceFrame'

function fixedSunDirection(): Vector3 {
  return new Vector3(SUN_DIRECTION.x, SUN_DIRECTION.y, SUN_DIRECTION.z)
}

function earthCenter(): Vector3 {
  return new Vector3(
    DAY_NIGHT_EARTH_CENTER.x,
    DAY_NIGHT_EARTH_CENTER.y,
    DAY_NIGHT_EARTH_CENTER.z,
  )
}

describe('固定世界太阳参考系', () => {
  it('SUN_DIRECTION 固定指向画面左侧，光传播方向固定向右', () => {
    expect(fixedSunDirection().toArray()).toEqual([-1, 0, 0])
    expect(getSunlightPropagationDirection().toArray()).toEqual([1, -0, -0])
  })

  it('DirectionalLight 与辅助光线使用完全相同的传播方向', () => {
    expect(
      calculateDirectionalLightPropagationDirection().dot(
        getSunlightPropagationDirection(),
      ),
    ).toBeCloseTo(1, 12)
  })

  it('辅助光线等间距、等长度且完全平行', () => {
    const rays = createParallelSunRaySegments()
    const propagation = getSunlightPropagationDirection()
    const lengths = rays.map((ray) => ray.start.distanceTo(ray.end))
    const verticalIntervals = rays.slice(1).map(
      (ray, index) => ray.start.y - rays[index]!.start.y,
    )

    for (const ray of rays) {
      expect(ray.end.clone().sub(ray.start).normalize().dot(propagation)).toBeCloseTo(1, 12)
      expect(ray.end.x).toBeLessThan(DAY_NIGHT_EARTH_CENTER.x - 1.45)
    }
    for (const length of lengths) expect(length).toBeCloseTo(lengths[0]!, 12)
    for (const interval of verticalIntervals) {
      expect(interval).toBeCloseTo(verticalIntervals[0]!, 12)
    }
  })
})

describe('固定光场中的地球姿态', () => {
  const dates = [
    new Date('2026-03-20T14:46:00.000Z'),
    new Date('2026-06-21T08:24:00.000Z'),
    new Date('2026-09-23T00:05:00.000Z'),
    new Date('2026-12-21T20:50:00.000Z'),
    new Date('2026-02-08T03:17:00.000Z'),
  ]

  it('任意日期时，纹理上的太阳直射点都朝向固定 SUN_DIRECTION', () => {
    for (const date of dates) {
      const directPoint = subsolarPoint(date)
      const normal = geographicNormalToDayNightWorld(
        date,
        directPoint.latitudeDegrees,
        directPoint.longitudeDegrees,
      )
      expect(normal.dot(fixedSunDirection())).toBeGreaterThan(0.999999)
    }
  })

  it('地轴始终保持真实黄赤交角，不把太阳赤纬误当作地轴倾角', () => {
    const eclipticNorth = new Vector3(0, 1, 0)
    for (const date of dates) {
      const pose = calculateDayNightEarthPose(date)
      expect(pose.northAxisWorld.angleTo(eclipticNorth)).toBeCloseTo(
        TEXTBOOK_OBLIQUITY_RADIANS,
        3,
      )
    }
  })

  it('六小时后地表绕北极方向自西向东转过约四分之一圈', () => {
    const start = new Date('2026-03-20T00:00:00.000Z')
    const end = new Date('2026-03-20T06:00:00.000Z')
    const primeAtStart = geographicNormalToDayNightWorld(start, 0, 0)
    const primeAtEnd = geographicNormalToDayNightWorld(end, 0, 0)
    const angle = primeAtStart.angleTo(primeAtEnd)
    expect(angle).toBeGreaterThan(Math.PI * 0.49)
    expect(angle).toBeLessThan(Math.PI * 0.51)
  })

  it('从北极上空观察，地表自转为逆时针', () => {
    const start = new Date('2026-06-21T04:00:00.000Z')
    const end = new Date(start.getTime() + 10 * 60_000)
    const startNormal = geographicNormalToDayNightWorld(start, 0, 0)
    const endNormal = geographicNormalToDayNightWorld(end, 0, 0)
    const northAxis = calculateDayNightEarthPose(start).northAxisWorld

    expect(startNormal.clone().cross(endNormal).dot(northAxis)).toBeGreaterThan(0)
  })
})

describe('晨昏线与昼夜判断', () => {
  const date = new Date('2026-06-21T08:24:00.000Z')

  it('晨线和昏线上的每个点都满足 dot(surfaceNormal, SUN_DIRECTION)=0', () => {
    const terminator = calculateWorldTerminatorGeometry(date)
    const center = earthCenter()

    for (const point of [...terminator.dawn, ...terminator.dusk]) {
      const normal = point.clone().sub(center).normalize()
      expect(Math.abs(normal.dot(fixedSunDirection()))).toBeLessThan(1e-12)
    }
  })

  it('晨线光照增加，昏线光照减少', () => {
    const terminator = calculateWorldTerminatorGeometry(date)
    const center = earthCenter()
    const dawnNormal = terminator.dawn[Math.floor(terminator.dawn.length / 2)]!
      .clone()
      .sub(center)
      .normalize()
    const duskNormal = terminator.dusk[Math.floor(terminator.dusk.length / 2)]!
      .clone()
      .sub(center)
      .normalize()
    const dawnRate = calculateWorldIlluminationTrend(date, dawnNormal)
    const duskRate = calculateWorldIlluminationTrend(date, duskNormal)

    expect(dawnRate).toBeGreaterThan(0)
    expect(duskRate).toBeLessThan(0)
  })

  it('晨线与昏线两个半圆上的光照变化方向保持一致', () => {
    const terminator = calculateWorldTerminatorGeometry(date)
    const center = earthCenter()

    for (const point of terminator.dawn.slice(1, -1)) {
      const normal = point.clone().sub(center).normalize()
      expect(calculateWorldIlluminationTrend(date, normal)).toBeGreaterThan(0)
    }
    for (const point of terminator.dusk.slice(1, -1)) {
      const normal = point.clone().sub(center).normalize()
      expect(calculateWorldIlluminationTrend(date, normal)).toBeLessThan(0)
    }
  })

  it('日期变化时晨昏大圆仍固定在垂直太阳方向的世界平面', () => {
    const dates = [
      new Date('2026-03-20T14:46:00.000Z'),
      new Date('2026-06-21T08:24:00.000Z'),
      new Date('2026-09-23T00:05:00.000Z'),
      new Date('2026-12-21T20:50:00.000Z'),
    ]
    const center = earthCenter()

    for (const sampleDate of dates) {
      const terminator = calculateWorldTerminatorGeometry(sampleDate)
      for (const point of [...terminator.dawn, ...terminator.dusk]) {
        const normal = point.clone().sub(center).normalize()
        expect(normal.dot(fixedSunDirection())).toBeCloseTo(0, 12)
      }
    }
  })

  it('朝向太阳为昼半球，背向太阳为夜半球', () => {
    const directPoint = subsolarPoint(date)
    expect(
      calculateWorldIllumination(
        date,
        directPoint.latitudeDegrees,
        directPoint.longitudeDegrees,
      ),
    ).toBeGreaterThan(0.999999)
    expect(
      calculateWorldIllumination(
        date,
        -directPoint.latitudeDegrees,
        directPoint.longitudeDegrees + 180,
      ),
    ).toBeLessThan(-0.999999)
  })

  it('30°N，120°E 在一次自转中依次经历黑夜、日出、白昼、日落、黑夜', () => {
    const states: string[] = []
    const startMs = Date.parse('2026-03-20T12:00:00.000Z')

    for (let minutes = 0; minutes <= 24 * 60; minutes += 2) {
      const state = calculateObserverLightingState(
        new Date(startMs + minutes * 60_000),
        30,
        120,
      )
      if (states.at(-1) !== state) states.push(state)
    }

    expect(states).toEqual(['night', 'sunrise', 'day', 'sunset', 'night'])
  })
})
