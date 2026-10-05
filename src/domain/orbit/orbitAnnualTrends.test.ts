import { describe, expect, it } from 'vitest'
import { createOrbitAnnualTrends } from './orbitAnnualTrends'
import { getAnnualTimeline } from './annualTimeline'
import { solarDeclination, dayLength } from '../../lib/geography'
import { calculateHemisphereSeasons } from '../solar/hemisphereSeasons'

describe('公转全年变化曲线共用模型', () => {
  it.each([2024, 2026])('%s年两条昼长曲线与直射纬度共用日期、闰日及节气采样', year => {
    const { declination, north, south } = createOrbitAnnualTrends(year)
    const timeline = getAnnualTimeline(year)
    expect(declination.daysInYear).toBe(year === 2024 ? 366 : 365)
    expect(declination.startTimeMs).toBe(timeline.startTimeMs)
    expect(declination.endTimeMs).toBe(timeline.endTimeMs)
    expect(north.samples.map(sample => sample.timeMs)).toEqual(declination.samples.map(sample => sample.timeMs))
    expect(south.samples.map(sample => sample.timeMs)).toEqual(north.samples.map(sample => sample.timeMs))
    expect(declination.events.map(event => event.timeMs)).toEqual(timeline.events.map(event => event.timeMs))
    for (const [index, sample] of declination.samples.entries()) {
      expect(north.samples[index]!.dayHours).toBe(dayLength(30, sample.declinationDegrees))
      expect(south.samples[index]!.dayHours).toBe(dayLength(-30, sample.declinationDegrees))
      expect(north.samples[index]!.dayHours + south.samples[index]!.dayHours).toBeCloseTo(24, 10)
    }
    if (year === 2024) expect(declination.samples.some(sample => sample.timeMs === Date.UTC(2024, 1, 29))).toBe(true)
  })

  it('二分二至对比方向正确，实时读数与全年样本使用同一引擎', () => {
    const { declination, north, south } = createOrbitAnnualTrends(2026)
    for (const [index, event] of declination.events.entries()) {
      const current = calculateHemisphereSeasons(event.timeMs, 30)
      expect(current.declinationDegrees).toBe(event.declinationDegrees)
      expect(current.north.dayHours).toBe(north.events[index]!.dayHours)
      expect(current.south.dayHours).toBe(south.events[index]!.dayHours)
      if (index === 0 || index === 2) expect(current.north.dayHours).toBeCloseTo(12, 2)
      if (index === 1) expect(current.north.dayHours).toBeGreaterThan(current.south.dayHours)
      if (index === 3) expect(current.north.dayHours).toBeLessThan(current.south.dayHours)
    }
  })

  it('年初年末和非采样时刻直接计算读数，不从曲线插值', () => {
    const model = createOrbitAnnualTrends(2026)
    for (const timeMs of [model.declination.startTimeMs, Date.UTC(2026, 4, 8, 12, 34, 56), model.declination.endTimeMs]) {
      const current = calculateHemisphereSeasons(timeMs, 30)
      const degrees = solarDeclination(new Date(timeMs))
      expect(current.declinationDegrees).toBe(degrees)
      expect(current.north.dayHours).toBe(dayLength(30, degrees))
      expect(current.south.dayHours).toBe(dayLength(-30, degrees))
    }
  })

  it.each([NaN, 99, 9999, 2026.5])('沿用现有年度输入校验：%s', year => {
    expect(() => createOrbitAnnualTrends(year)).toThrow(RangeError)
  })
})
