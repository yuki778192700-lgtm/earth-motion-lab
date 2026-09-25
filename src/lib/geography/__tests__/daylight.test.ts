import { describe, expect, it } from 'vitest'
import {
  dayLength,
  isPolarDay,
  isPolarNight,
  solarNoonAltitude,
  sunriseTime,
  sunsetTime,
} from '../daylight'

const TROPIC_DEGREES = 23 + 26 / 60
const POLAR_CIRCLE_DEGREES = 90 - TROPIC_DEGREES

describe('solarNoonAltitude', () => {
  it('赤道春秋分正午太阳高度为 90°', () => {
    expect(solarNoonAltitude(0, 0)).toBe(90)
  })

  it('北回归线夏至与南回归线冬至太阳直射', () => {
    expect(solarNoonAltitude(TROPIC_DEGREES, TROPIC_DEGREES)).toBe(90)
    expect(solarNoonAltitude(-TROPIC_DEGREES, -TROPIC_DEGREES)).toBe(90)
  })

  it('北极冬至正午太阳位于地平线以下 23°26′', () => {
    expect(solarNoonAltitude(90, -TROPIC_DEGREES)).toBeCloseTo(-TROPIC_DEGREES, 10)
  })

  it('南北半球计算保持符号正确', () => {
    expect(solarNoonAltitude(40, 20)).toBe(70)
    expect(solarNoonAltitude(-40, -20)).toBe(70)
    expect(solarNoonAltitude(-40, 20)).toBe(30)
  })

  it('拒绝越界纬度和赤纬', () => {
    expect(() => solarNoonAltitude(90.01, 0)).toThrow(RangeError)
    expect(() => solarNoonAltitude(0, -90.01)).toThrow(RangeError)
    expect(() => solarNoonAltitude(Number.NaN, 0)).toThrow(TypeError)
  })
})

describe('dayLength', () => {
  it('赤道全年几何昼长均为 12 小时', () => {
    expect(dayLength(0, 0)).toBeCloseTo(12, 10)
    expect(dayLength(0, TROPIC_DEGREES)).toBeCloseTo(12, 10)
    expect(dayLength(0, -TROPIC_DEGREES)).toBeCloseTo(12, 10)
  })

  it('春秋分除极点约定外各纬度昼长为 12 小时', () => {
    for (const latitude of [-89.999, -66.5, -30, 30, 66.5, 89.999]) {
      expect(dayLength(latitude, 0)).toBeCloseTo(12, 8)
    }
  })

  it('北极圈夏至为 24 小时、冬至为 0 小时', () => {
    expect(dayLength(POLAR_CIRCLE_DEGREES, TROPIC_DEGREES)).toBe(24)
    expect(dayLength(POLAR_CIRCLE_DEGREES, -TROPIC_DEGREES)).toBe(0)
  })

  it('南极圈季节与北极圈相反', () => {
    expect(dayLength(-POLAR_CIRCLE_DEGREES, TROPIC_DEGREES)).toBe(0)
    expect(dayLength(-POLAR_CIRCLE_DEGREES, -TROPIC_DEGREES)).toBe(24)
  })

  it('南北极点正确处理极昼、极夜和春秋分边界', () => {
    expect(dayLength(90, TROPIC_DEGREES)).toBe(24)
    expect(dayLength(90, -TROPIC_DEGREES)).toBe(0)
    expect(dayLength(-90, TROPIC_DEGREES)).toBe(0)
    expect(dayLength(-90, -TROPIC_DEGREES)).toBe(24)
    expect(dayLength(90, 0)).toBe(12)
    expect(dayLength(-90, 0)).toBe(12)
  })

  it('同纬度夏半年昼长大于冬半年', () => {
    expect(dayLength(40, TROPIC_DEGREES)).toBeGreaterThan(12)
    expect(dayLength(40, -TROPIC_DEGREES)).toBeLessThan(12)
  })

  it('拒绝非有限值和越界值', () => {
    expect(() => dayLength(Number.POSITIVE_INFINITY, 0)).toThrow(TypeError)
    expect(() => dayLength(-91, 0)).toThrow(RangeError)
    expect(() => dayLength(0, 91)).toThrow(RangeError)
  })
})

describe('sunriseTime and sunsetTime', () => {
  it('赤道日出 06:00、日落 18:00', () => {
    expect(sunriseTime(0, 0)).toBeCloseTo(6, 10)
    expect(sunsetTime(0, 0)).toBeCloseTo(18, 10)
    expect(sunriseTime(0, TROPIC_DEGREES)).toBeCloseTo(6, 10)
    expect(sunsetTime(0, TROPIC_DEGREES)).toBeCloseTo(18, 10)
  })

  it('普通纬度日出和日落关于 12:00 对称', () => {
    const sunrise = sunriseTime(45, TROPIC_DEGREES)
    const sunset = sunsetTime(45, TROPIC_DEGREES)
    expect(sunrise).not.toBeNull()
    expect(sunset).not.toBeNull()
    expect((sunrise ?? 0) + (sunset ?? 0)).toBeCloseTo(24, 10)
  })

  it('极昼、极夜和极点没有每日升落事件', () => {
    expect(sunriseTime(POLAR_CIRCLE_DEGREES, TROPIC_DEGREES)).toBeNull()
    expect(sunsetTime(POLAR_CIRCLE_DEGREES, TROPIC_DEGREES)).toBeNull()
    expect(sunriseTime(POLAR_CIRCLE_DEGREES, -TROPIC_DEGREES)).toBeNull()
    expect(sunsetTime(POLAR_CIRCLE_DEGREES, -TROPIC_DEGREES)).toBeNull()
    expect(sunriseTime(90, 0)).toBeNull()
    expect(sunsetTime(-90, 0)).toBeNull()
  })
})

describe('isPolarDay and isPolarNight', () => {
  it('北极圈夏至极昼、冬至极夜', () => {
    expect(isPolarDay(POLAR_CIRCLE_DEGREES, TROPIC_DEGREES)).toBe(true)
    expect(isPolarNight(POLAR_CIRCLE_DEGREES, TROPIC_DEGREES)).toBe(false)
    expect(isPolarDay(POLAR_CIRCLE_DEGREES, -TROPIC_DEGREES)).toBe(false)
    expect(isPolarNight(POLAR_CIRCLE_DEGREES, -TROPIC_DEGREES)).toBe(true)
  })

  it('南极圈判断与北极圈相反', () => {
    expect(isPolarDay(-POLAR_CIRCLE_DEGREES, -TROPIC_DEGREES)).toBe(true)
    expect(isPolarNight(-POLAR_CIRCLE_DEGREES, TROPIC_DEGREES)).toBe(true)
  })

  it('赤道和春秋分不判为极昼或极夜', () => {
    expect(isPolarDay(0, TROPIC_DEGREES)).toBe(false)
    expect(isPolarNight(0, -TROPIC_DEGREES)).toBe(false)
    expect(isPolarDay(90, 0)).toBe(false)
    expect(isPolarNight(-90, 0)).toBe(false)
  })
})
