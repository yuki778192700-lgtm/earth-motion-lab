import { describe, expect, it } from 'vitest'
import { applyUtcClock } from './utcTimeInput'
import { compareLocalMeanTimes } from '../../lib/geography'

describe('UTC时刻编辑', () => {
  const initial = Date.parse('2026-12-31T12:00:00Z')
  it.each(['00:00:00', '23:59:59', '12:34:56', '23:00'])('保留日期并应用%s', clock => {
    const result = applyUtcClock(initial, clock)
    expect(result).not.toBeNull()
    expect(new Date(result!).toISOString()).toBe(`2026-12-31T${clock.length === 5 ? clock + ':00' : clock}.000Z`)
  })
  it.each(['24:00:00', '23:60:00', '12:00:60', '', '9:00', 'abc', '12:00:00x'])('拒绝无效输入%s', clock => {
    expect(applyUtcClock(initial, clock)).toBeNull()
  })
  it('UTC修改同步两地读数，正确跨年', () => {
    const result = applyUtcClock(initial, '23:00:00')!
    const comparison = compareLocalMeanTimes(0, 120, new Date(result))
    expect(comparison.a.calendarTimeMs).toBe(result)
    expect(new Date(comparison.b.calendarTimeMs).toISOString()).toBe('2027-01-01T07:00:00.000Z')
    expect(comparison.b.dayOffset).toBe(1)
  })
})
