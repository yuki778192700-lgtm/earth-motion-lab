import { describe, expect, it } from 'vitest'
import { calculateDateLineCrossing } from './dateLine'
import { latitudeLongitudeToVector3 } from '../earthCoordinates'

describe('180°理论日期界线', () => {
  it.each(['east', 'west'] as const)('方向%s的跨线日期符号、钟点和UTC不变', direction => {
    const date = new Date('2026-06-21T04:00:00Z')
    const result = calculateDateLineCrossing(direction, 1, date)
    expect(result.after.calendarTimeMs - result.before.calendarTimeMs).toBe(result.dateAdjustmentDays * 86_400_000)
    expect(result.dateAdjustmentDays).toBe(direction === 'east' ? -1 : 1)
    expect(new Date(result.before.calendarTimeMs).getUTCHours()).toBe(new Date(result.after.calendarTimeMs).getUTCHours())
    expect(date.toISOString()).toBe('2026-06-21T04:00:00.000Z')
  })
  it.each([
    ['2026-01-01T00:00:00Z', '2025-12-31T12:00:00.000Z', '2026-01-01T12:00:00.000Z'],
    ['2026-12-31T12:00:00Z', '2026-12-31T00:00:00.000Z', '2027-01-01T00:00:00.000Z'],
    ['2024-02-29T12:00:00Z', '2024-02-29T00:00:00.000Z', '2024-03-01T00:00:00.000Z'],
    ['2026-03-01T00:00:00Z', '2026-02-28T12:00:00.000Z', '2026-03-01T12:00:00.000Z'],
  ])('跨年跨月闰日：%s', (utc, eastern, western) => {
    const result = calculateDateLineCrossing('east', 1, new Date(utc))
    expect(new Date(result.easternSide.calendarTimeMs).toISOString()).toBe(eastern)
    expect(new Date(result.westernSide.calendarTimeMs).toISOString()).toBe(western)
  })
  it.each(['east', 'west'] as const)('边界归属确定且不重复累加：%s', direction => {
    const date = new Date('2026-06-21T04:00:00Z')
    expect(calculateDateLineCrossing(direction, 0.499999, date).crossed).toBe(false)
    const boundary = calculateDateLineCrossing(direction, 0.5, date)
    expect(boundary.crossed).toBe(true)
    expect(boundary.longitudeDegrees).toBe(direction === 'east' ? -180 : 180)
    expect(boundary.current).toEqual(boundary.after)
    expect(calculateDateLineCrossing(direction, 1, date).current).toEqual(boundary.current)
    expect(calculateDateLineCrossing(direction, 0, date).current).toEqual(boundary.before)
  })
  it('经度与三维坐标：向东179E到179W，向西相反，跨线位置连续', () => {
    const date = new Date()
    expect(calculateDateLineCrossing('east', 0, date).longitudeDegrees).toBe(179)
    expect(calculateDateLineCrossing('east', 1, date).longitudeDegrees).toBe(-179)
    expect(calculateDateLineCrossing('west', 0, date).longitudeDegrees).toBe(-179)
    expect(calculateDateLineCrossing('west', 1, date).longitudeDegrees).toBe(179)
    const before = calculateDateLineCrossing('east', 0.4999, date)
    const after = calculateDateLineCrossing('east', 0.5001, date)
    expect(latitudeLongitudeToVector3(30, before.longitudeDegrees).distanceTo(latitudeLongitudeToVector3(30, after.longitudeDegrees))).toBeLessThan(0.0001)
    expect(latitudeLongitudeToVector3(30, 180).distanceTo(latitudeLongitudeToVector3(30, -180))).toBeLessThan(1e-10)
  })
  it('午夜是时间推进换日，跨线是固定时刻的日期约定切换', () => {
    const a = calculateDateLineCrossing('east', 0, new Date('2026-06-21T11:59:59Z'))
    const b = calculateDateLineCrossing('east', 0, new Date('2026-06-21T12:00:00Z'))
    expect(a.crossed).toBe(false)
    expect(b.crossed).toBe(false)
    expect(new Date(a.current.calendarTimeMs).getUTCDate()).toBe(21)
    expect(new Date(b.current.calendarTimeMs).getUTCDate()).toBe(22)
    expect(b.current.calendarTimeMs - a.current.calendarTimeMs).toBe(1000)
  })
  it.each([-0.01, 1.01, NaN, Infinity])('拒绝无效进度%s', progress => {
    expect(() => calculateDateLineCrossing('east', progress, new Date())).toThrow()
  })
  it('拒绝无效日期', () => expect(() => calculateDateLineCrossing('east', 0, new Date(NaN))).toThrow())
})
