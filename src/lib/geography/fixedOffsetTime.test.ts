import { describe, expect, it } from 'vitest'
import { calculateFixedOffsetClock, compareMeanAndFixedTime, FIXED_UTC_OFFSET_OPTIONS, formatUtcOffset } from './fixedOffsetTime'

describe('固定UTC偏移区时', () => {
  it.each([
    [0, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 0],
    [-720, '2026-01-01T00:00:00.000Z', '2025-12-31T12:00:00.000Z', -1],
    [840, '2026-12-31T12:00:00.000Z', '2027-01-01T02:00:00.000Z', 1],
    [330, '2024-02-28T23:00:00.000Z', '2024-02-29T04:30:00.000Z', 1],
    [345, '2024-02-29T23:00:00.000Z', '2024-03-01T04:45:00.000Z', 1],
    [-210, '2026-03-01T02:00:00.000Z', '2026-02-28T22:30:00.000Z', -1],
    [480, '2026-01-01T15:59:59.123Z', '2026-01-01T23:59:59.123Z', 0],
    [480, '2026-01-01T16:00:00.000Z', '2026-01-02T00:00:00.000Z', 1],
  ])('偏移%s分钟支持跨日和日历边界', (offset, utc, expected, dayOffset) => {
    const date = new Date(utc)
    const result = calculateFixedOffsetClock(offset, date)
    expect(new Date(result.calendarTimeMs).toISOString()).toBe(expected)
    expect(result.dayOffset).toBe(dayOffset)
    expect(date.toISOString()).toBe(utc)
  })
  it('同区时不同地方时；北京与120E示例相差14分24秒', () => {
    const date = new Date('2026-06-21T04:00:00Z')
    const beijing = compareMeanAndFixedTime(116.4, 480, date)
    const standard = compareMeanAndFixedTime(120, 480, date)
    expect(beijing.fixedClock).toEqual(standard.fixedClock)
    expect(beijing.fixedMinusMeanMinutes).toBe(14.4)
    expect(standard.fixedMinusMeanMinutes).toBe(0)
    expect(standard.meanClock.calendarTimeMs - beijing.meanClock.calendarTimeMs).toBeCloseTo(864_000)
  })
  it('同一地点切换区时不改变地方时和实际UTC时刻', () => {
    const date = new Date('2026-06-21T04:00:00Z')
    expect(compareMeanAndFixedTime(-75, -300, date).meanClock).toEqual(compareMeanAndFixedTime(-75, 345, date).meanClock)
  })
  it('±180经线的地方时日期约定不影响同一固定区时', () => {
    const date = new Date('2026-01-01T00:00:00Z')
    expect(compareMeanAndFixedTime(-180, 0, date).fixedClock).toEqual(compareMeanAndFixedTime(180, 0, date).fixedClock)
  })
  it('支持负纪元日期，午夜日偏移正确', () => {
    expect(calculateFixedOffsetClock(-60, new Date('1969-12-31T00:30:00Z')).dayOffset).toBe(-1)
  })
  it('选择范围、间隔和格式明确', () => {
    expect(FIXED_UTC_OFFSET_OPTIONS).toHaveLength(105)
    expect(FIXED_UTC_OFFSET_OPTIONS[0]).toBe(-720)
    expect(FIXED_UTC_OFFSET_OPTIONS.at(-1)).toBe(840)
    expect(formatUtcOffset(345)).toBe('UTC+05:45')
    expect(formatUtcOffset(-210)).toBe('UTC−03:30')
    expect(formatUtcOffset(0)).toBe('UTC+00:00')
  })
  it.each([-721, 841, 0.5, NaN, Infinity])('拒绝无效偏移%s', offset => {
    expect(() => calculateFixedOffsetClock(offset, new Date())).toThrow()
  })
  it('拒绝无效日期与经度', () => {
    expect(() => calculateFixedOffsetClock(0, new Date(NaN))).toThrow()
    expect(() => compareMeanAndFixedTime(181, 0, new Date())).toThrow()
  })
})
