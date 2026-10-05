import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import { createAnnualNoonAltitudeModel } from './annualNoonAltitudeModel'
import { createAnnualSubsolarModel } from './annualSubsolarModel'
import { solarNoonAltitude, subsolarPoint } from '../../lib/geography'
import { latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'
import { calculateDayNightEarthPose, SUN_DIRECTION } from '../dayNight/solarReferenceFrame'

describe('正午太阳高度全年模型', () => {
  const annual = createAnnualSubsolarModel(2026)
  it.each([0, 30, -30, 23 + 26 / 60, 66 + 34 / 60, 90, -90])('纬度%s始终调用统一引擎', latitude => {
    const model = createAnnualNoonAltitudeModel(2026, latitude, annual)
    expect(model.samples).toHaveLength(annual.samples.length)
    model.samples.forEach((sample, index) => {
      expect(sample.altitudeDegrees).toBe(solarNoonAltitude(latitude, annual.samples[index]!.declinationDegrees))
      expect(sample.altitudeDegrees).toBeGreaterThanOrEqual(-90)
      expect(sample.altitudeDegrees).toBeLessThanOrEqual(90)
    })
  })
  it('南北半球至日高低相反，北纬30度夏至约83.44冬至约36.56', () => {
    const north = createAnnualNoonAltitudeModel(2026, 30, annual)
    const south = createAnnualNoonAltitudeModel(2026, -30, annual)
    expect(north.events[1]!.altitudeDegrees).toBeCloseTo(83.44, 1)
    expect(north.events[3]!.altitudeDegrees).toBeCloseTo(36.56, 1)
    expect(south.events[1]!.altitudeDegrees).toBeCloseTo(36.56, 1)
    expect(south.events[3]!.altitudeDegrees).toBeCloseTo(83.44, 1)
  })
  it('赤道分点接近90度；选中直射纬度时严格90度', () => {
    const equator = createAnnualNoonAltitudeModel(2026, 0, annual)
    expect(equator.events[0]!.altitudeDegrees).toBeGreaterThan(89.97)
    expect(equator.events[2]!.altitudeDegrees).toBeGreaterThan(89.97)
    const direct = createAnnualNoonAltitudeModel(2026, annual.events[1]!.declinationDegrees, annual)
    expect(direct.events[1]!.altitudeDegrees).toBe(90)
  })
  it('北极冬至保留负高度，南极相反，不裁剪到0度', () => {
    const north = createAnnualNoonAltitudeModel(2026, 90, annual)
    const south = createAnnualNoonAltitudeModel(2026, -90, annual)
    expect(north.events[3]!.altitudeDegrees).toBeCloseTo(-23.44, 1)
    expect(south.events[1]!.altitudeDegrees).toBeCloseTo(-23.44, 1)
    expect(north.samples.some(sample => sample.altitudeDegrees < 0)).toBe(true)
  })
  it('3D量角点世界法向与太阳点积的几何高度等于公式结果', () => {
    for (const latitude of [0, 30, -30, 90, -90]) for (const event of annual.events) {
      const date = new Date(event.timeMs)
      const direct = subsolarPoint(date)
      const pose = calculateDayNightEarthPose(date)
      const normal = latitudeLongitudeToVector3(latitude, direct.longitudeDegrees, 1)
        .applyAxisAngle(new Vector3(0, 1, 0), pose.surfaceRotationRadians)
        .applyQuaternion(pose.orientationQuaternion)
      const geometricHeight = Math.asin(Math.max(-1, Math.min(1, normal.dot(SUN_DIRECTION)))) * 180 / Math.PI
      expect(geometricHeight).toBeCloseTo(solarNoonAltitude(latitude, direct.latitudeDegrees), 7)
    }
  })
  it('闰年采样以及输入校验', () => {
    expect(createAnnualNoonAltitudeModel(2024, 30).samples.length).toBe(371)
    expect(() => createAnnualNoonAltitudeModel(2026, 91, annual)).toThrow()
    expect(() => createAnnualNoonAltitudeModel(2026, NaN, annual)).toThrow()
    expect(() => createAnnualNoonAltitudeModel(2025, 30, annual)).toThrow()
  })
})
