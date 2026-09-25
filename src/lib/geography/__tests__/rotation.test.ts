import { describe, expect, it } from 'vitest'
import { latitudeRotationSpeed } from '../rotation'

describe('latitudeRotationSpeed', () => {
  it('赤道自转线速度约为 1667.9 km/h', () => {
    expect(latitudeRotationSpeed(0)).toBeCloseTo(1667.93, 2)
  })

  it('60° 纬线速度为赤道的一半', () => {
    expect(latitudeRotationSpeed(60)).toBeCloseTo(latitudeRotationSpeed(0) / 2, 8)
  })

  it('南北同纬度线速度相同', () => {
    expect(latitudeRotationSpeed(30)).toBeCloseTo(latitudeRotationSpeed(-30), 10)
    expect(latitudeRotationSpeed(66.5)).toBeCloseTo(latitudeRotationSpeed(-66.5), 10)
  })

  it('南北极点线速度均为 0', () => {
    expect(latitudeRotationSpeed(90)).toBe(0)
    expect(latitudeRotationSpeed(-90)).toBe(0)
  })

  it('拒绝越界纬度和非有限值', () => {
    expect(() => latitudeRotationSpeed(90.001)).toThrow(RangeError)
    expect(() => latitudeRotationSpeed(-91)).toThrow(RangeError)
    expect(() => latitudeRotationSpeed(Number.NaN)).toThrow(TypeError)
  })
})
