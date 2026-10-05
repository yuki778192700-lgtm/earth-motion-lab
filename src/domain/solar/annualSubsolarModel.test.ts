import { describe, expect, it } from 'vitest'
import { createAnnualSubsolarModel } from './annualSubsolarModel'
import { solarDeclination, subsolarPoint } from '../../lib/geography'
import { createAnnualDeclinationSeries } from '../../lib/geography/annualDeclination'
import { calculateDayNightModel } from '../dayNight/dayNightModel'
import { calculateDayNightEarthPose, SUN_DIRECTION } from '../dayNight/solarReferenceFrame'
import { latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'
import { Vector3 } from 'three'

describe('全年直射纬度模型', () => {
  it.each([[2024, 366], [2026, 365]])('年%s日历采样无遗漏，含年末时刻', (year, days) => {
    const series = createAnnualDeclinationSeries(year)
    expect(series.daysInYear).toBe(days)
    expect(series.samples).toHaveLength(days + 1)
    expect(series.samples[0]!.timeMs).toBe(Date.UTC(year, 0, 1))
    expect(series.samples.at(-1)!.timeMs).toBe(Date.UTC(year + 1, 0, 1) - 1)
    for (const sample of series.samples) expect(sample.declinationDegrees).toBe(solarDeclination(new Date(sample.timeMs)))
  })
  it('二分二至同模型；夏至北偏冬至南偏，不强制圆整截断', () => {
    const model = createAnnualSubsolarModel(2026)
    expect(model.events).toHaveLength(4)
    expect(Math.abs(model.events[0]!.declinationDegrees)).toBeLessThan(0.03)
    expect(model.events[1]!.declinationDegrees).toBeCloseTo(23.44, 1)
    expect(Math.abs(model.events[2]!.declinationDegrees)).toBeLessThan(0.03)
    expect(model.events[3]!.declinationDegrees).toBeCloseTo(-23.44, 1)
    expect(model.northLimitDegrees).toBeGreaterThan(23.4)
    expect(model.southLimitDegrees).toBeLessThan(-23.4)
    for (const event of model.events) {
      expect(model.samples.some(sample => sample.timeMs === event.timeMs)).toBe(true)
      const date = new Date(event.timeMs)
      expect(event.declinationDegrees).toBe(subsolarPoint(date).latitudeDegrees)
      expect(event.declinationDegrees).toBe(calculateDayNightModel(date, 30).declinationDegrees)
    }
  })
  it('春分前后北移，秋分前后南移，纬度与经度不是同一轨迹', () => {
    const model = createAnnualSubsolarModel(2026)
    for (const index of [0, 2]) {
      const time = model.events[index]!.timeMs
      const before = solarDeclination(new Date(time - 86400000))
      const after = solarDeclination(new Date(time + 86400000))
      expect(after > before).toBe(index === 0)
    }
    const morning = subsolarPoint(new Date('2026-06-21T00:00:00Z'))
    const evening = subsolarPoint(new Date('2026-06-21T06:00:00Z'))
    expect(Math.abs(morning.longitudeDegrees - evening.longitudeDegrees)).toBeGreaterThan(80)
    expect(Math.abs(morning.latitudeDegrees - evening.latitudeDegrees)).toBeLessThan(0.02)
  })
  it('全年关键时刻3D直射点法向与唯一太阳方向一致', () => {
    for (const event of createAnnualSubsolarModel(2026).events) {
      const date = new Date(event.timeMs)
      const point = subsolarPoint(date)
      const pose = calculateDayNightEarthPose(date)
      const normal = latitudeLongitudeToVector3(point.latitudeDegrees, point.longitudeDegrees, 1)
      normal.applyAxisAngle(new Vector3(0, 1, 0), pose.surfaceRotationRadians).applyQuaternion(pose.orientationQuaternion)
      expect(normal.dot(SUN_DIRECTION)).toBeCloseTo(1, 8)
    }
  })
  it.each([99, 9999, NaN, 2026.5])('拒绝无效采样年份%s', year => expect(() => createAnnualDeclinationSeries(year)).toThrow())
})
