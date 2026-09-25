import { describe, expect, it } from 'vitest'
import { localSolarTime } from '../solarTime'

describe('localSolarTime', () => {
  it('本初子午线地方时等于 UTC', () => {
    const result = localSolarTime(0, new Date('2026-01-01T12:34:56.000Z'))
    expect(result.decimalHours).toBeCloseTo(12 + 34 / 60 + 56 / 3600, 10)
    expect(result.dayOffset).toBe(0)
  })

  it('东经 120° 比 UTC 早 8 小时', () => {
    const result = localSolarTime(120, new Date('2026-01-01T04:00:00.000Z'))
    expect(result.decimalHours).toBe(12)
    expect(result.dayOffset).toBe(0)
  })

  it('西经 75° 比 UTC 晚 5 小时并正确跨到前一日', () => {
    const result = localSolarTime(-75, new Date('2026-01-01T04:00:00.000Z'))
    expect(result.decimalHours).toBe(23)
    expect(result.dayOffset).toBe(-1)
  })

  it('东经地区正确跨到后一日', () => {
    const result = localSolarTime(30, new Date('2026-01-01T23:00:00.000Z'))
    expect(result.decimalHours).toBe(1)
    expect(result.dayOffset).toBe(1)
  })

  it('普通越界经度按等价经度规范化', () => {
    expect(localSolarTime(190, new Date('2026-01-01T12:00:00.000Z')))
      .toEqual(localSolarTime(-170, new Date('2026-01-01T12:00:00.000Z')))
  })

  it('日期变更线的 ±180° 表示地方时相同但日期偏移相差一天', () => {
    const eastSide = localSolarTime(180, new Date('2026-01-01T12:00:00.000Z'))
    const westSide = localSolarTime(-180, new Date('2026-01-01T12:00:00.000Z'))
    expect(eastSide.decimalHours).toBe(0)
    expect(westSide.decimalHours).toBe(0)
    expect(eastSide.dayOffset).toBe(1)
    expect(westSide.dayOffset).toBe(0)
  })

  it('拒绝非有限经度和无效 UTC 日期', () => {
    expect(() => localSolarTime(Number.POSITIVE_INFINITY, new Date())).toThrow(TypeError)
    expect(() => localSolarTime(0, new Date(Number.NaN))).toThrow(TypeError)
  })
})
