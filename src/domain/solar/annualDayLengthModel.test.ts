import { describe, expect, it } from 'vitest'
import { createAnnualDayLengthModel } from './annualDayLengthModel'
import { createAnnualSubsolarModel } from './annualSubsolarModel'
import { dayLength } from '../../lib/geography'
import { getLabModuleRuntimeConfig } from '../../config/labModuleRegistry'

describe('极区全年昼长曲线', () => {
  const annual = createAnnualSubsolarModel(2026)
  it.each([0, 30, -30, 66 + 34 / 60, -(66 + 34 / 60), 70, -70, 90, -90])('纬度%s全部采样复用地理引擎', latitude => {
    const model = createAnnualDayLengthModel(2026, latitude, annual)
    model.samples.forEach((sample, index) => expect(sample.dayHours).toBe(dayLength(latitude, annual.samples[index]!.declinationDegrees)))
    expect(model.samples.every(sample => sample.dayHours >= 0 && sample.dayHours <= 24)).toBe(true)
    expect(model.samples[0]!.timeMs).toBe(Date.UTC(2026, 0, 1))
    expect(model.samples.at(-1)!.timeMs).toBe(Date.UTC(2027, 0, 1) - 1)
  })
  it('至日北极24/0，南极反转；70度也有全年平台', () => {
    for (const latitude of [70, 90]) {
      const north = createAnnualDayLengthModel(2026, latitude, annual)
      const south = createAnnualDayLengthModel(2026, -latitude, annual)
      expect(north.events[1]!.dayHours).toBe(24)
      expect(north.events[3]!.dayHours).toBe(0)
      expect(south.events[1]!.dayHours).toBe(0)
      expect(south.events[3]!.dayHours).toBe(24)
    }
  })
  it('赤道始终12小时，镜像纬度昼长和24小时', () => {
    expect(createAnnualDayLengthModel(2026, 0, annual).samples.every(sample => sample.dayHours === 12)).toBe(true)
    const north = createAnnualDayLengthModel(2026, 70, annual)
    const south = createAnnualDayLengthModel(2026, -70, annual)
    north.samples.forEach((sample, index) => expect(sample.dayHours + south.samples[index]!.dayHours).toBeCloseTo(24, 10))
  })
  it('闰年、输入校验和模块路由', () => {
    expect(createAnnualDayLengthModel(2024, 90).samples).toHaveLength(371)
    for (const value of [NaN, 91, -91]) expect(() => createAnnualDayLengthModel(2026, value, annual)).toThrow()
    expect(() => createAnnualDayLengthModel(2025, 30, annual)).toThrow()
    expect(getLabModuleRuntimeConfig('polar-day-night').scene).toBe('day-night')
    expect(getLabModuleRuntimeConfig('polar-day-night').panel).toBe('polar-annual')
    expect(getLabModuleRuntimeConfig('day-night').panel).toBe('day-night')
  })
})
