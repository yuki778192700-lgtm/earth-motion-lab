import { describe, expect, it } from 'vitest'
import { calculateLocalMeanClock, compareLocalMeanTimes } from './localTimeExperiment'

describe('地方平均太阳时双地点实验', () => {
  const noon = new Date('2026-06-21T12:00:00Z')
  it('本初子午线与UTC一致，东经120°领先8小时，西经75°落后5小时', () => {
    expect(calculateLocalMeanClock(0, noon).calendarTimeMs).toBe(noon.getTime())
    expect(calculateLocalMeanClock(120, noon).decimalHours).toBe(20)
    expect(calculateLocalMeanClock(-75, noon).decimalHours).toBe(7)
    expect(compareLocalMeanTimes(0, 120, noon).timeDifferenceMinutes).toBe(480)
    expect(compareLocalMeanTimes(0, -75, noon).timeDifferenceMinutes).toBe(-300)
  })
  it('东经跨午夜进入下一天，西经跨午夜进入前一天（含跨年、闰日）', () => {
    expect(new Date(calculateLocalMeanClock(120, new Date('2026-12-31T20:00:00Z')).calendarTimeMs).toISOString()).toBe('2027-01-01T04:00:00.000Z')
    expect(new Date(calculateLocalMeanClock(-75, new Date('2024-03-01T02:00:00Z')).calendarTimeMs).toISOString()).toBe('2024-02-29T21:00:00.000Z')
  })
  it('±180°同经线同钟点、日期相差一天', () => {
    const result = compareLocalMeanTimes(-180, 180, noon)
    expect(result.a.decimalHours).toBe(result.b.decimalHours)
    expect(result.b.calendarTimeMs - result.a.calendarTimeMs).toBe(86_400_000)
    expect(result.timeDifferenceMinutes).toBe(1440)
    expect(result.sameMeridianDifferentDateConvention).toBe(true)
  })
  it('跨±180°附近不把日历时间差折返为最短经度差', () => {
    expect(compareLocalMeanTimes(-179, 179, noon).timeDifferenceMinutes).toBe(1432)
    expect(compareLocalMeanTimes(179, -179, noon).timeDifferenceMinutes).toBe(-1432)
  })
  it('同经度相同地方时，15°差一小时，0.25°差一分钟', () => {
    expect(compareLocalMeanTimes(30, 30, noon).timeDifferenceMinutes).toBe(0)
    expect(compareLocalMeanTimes(30, 45, noon).timeDifferenceMinutes).toBe(60)
    expect(compareLocalMeanTimes(0, 0.25, noon).timeDifferenceMinutes).toBe(1)
  })
  it('保留UTC的秒和毫秒', () => {
    const date = new Date('2026-06-21T01:02:03.456Z')
    expect(calculateLocalMeanClock(0, date).calendarTimeMs).toBeCloseTo(date.getTime(), 0)
  })
  it.each([NaN, Infinity, -181, 181])('拒绝无效经度 %s', longitude => {
    expect(() => calculateLocalMeanClock(longitude, noon)).toThrow()
  })
  it('拒绝无效日期', () => {
    expect(() => compareLocalMeanTimes(0, 120, new Date(NaN))).toThrow()
  })
})
