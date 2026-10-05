import { describe, expect, it } from 'vitest'
import { polarLatitudeRanges } from './polarRange'
import { isPolarDay, isPolarNight } from './daylight'

describe('几何极昼极夜范围', () => {
  it.each([23 + 26 / 60, -(23 + 26 / 60), 10, -10, 0.000001, -0.000001])('赤纬%s范围与引擎判断一致', declination => {
    const ranges = polarLatitudeRanges(declination)!
    expect(ranges.boundaryAbsoluteDegrees).toBe(90 - Math.abs(declination))
    for (const latitude of [ranges.polarDay.minimumDegrees, ranges.polarDay.maximumDegrees]) expect(isPolarDay(latitude, declination)).toBe(true)
    for (const latitude of [ranges.polarNight.minimumDegrees, ranges.polarNight.maximumDegrees]) expect(isPolarNight(latitude, declination)).toBe(true)
    const sign = declination > 0 ? 1 : -1
    expect(isPolarDay(sign * (ranges.boundaryAbsoluteDegrees - 0.001), declination)).toBe(false)
    expect(isPolarNight(-sign * (ranges.boundaryAbsoluteDegrees - 0.001), declination)).toBe(false)
  })
  it('赤纬恰为零不虚构极昼极夜范围', () => {
    expect(polarLatitudeRanges(0)).toBeNull()
    expect(polarLatitudeRanges(-0)).toBeNull()
  })
  it('教材至日边界66度34分，南北按符号反转', () => {
    expect(polarLatitudeRanges(23 + 26 / 60)!.polarDay.minimumDegrees).toBeCloseTo(66 + 34 / 60, 12)
    expect(polarLatitudeRanges(-23.44)!.polarDay.maximumDegrees).toBeCloseTo(-66.56, 10)
  })
  it('非法赤纬拒绝而非静默修正', () => {
    for (const value of [NaN, Infinity, 91, -91]) expect(() => polarLatitudeRanges(value)).toThrow()
  })
})
