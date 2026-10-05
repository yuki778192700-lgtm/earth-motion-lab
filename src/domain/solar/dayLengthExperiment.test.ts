import { describe, expect, it } from 'vitest'
import { createDayLengthExperiment, formatApparentSolarTime } from './dayLengthExperiment'
import { sunriseTime, sunsetTime } from '../../lib/geography'
import { getLabModuleRuntimeConfig } from '../../config/labModuleRegistry'

describe('全年昼长与地方真太阳升落时刻', () => {
  it.each([0, 30, -30, 66 + 34 / 60, 70, -70, 90, -90])('纬度%s节气读数全部复用引擎', latitude => {
    const model = createDayLengthExperiment(2026, latitude)
    for (const event of model.events) {
      expect(event.sunriseSolarHours).toBe(sunriseTime(latitude, event.declinationDegrees))
      expect(event.sunsetSolarHours).toBe(sunsetTime(latitude, event.declinationDegrees))
      if (event.sunriseSolarHours !== null && event.sunsetSolarHours !== null) {
        expect(event.sunriseSolarHours + event.sunsetSolarHours).toBeCloseTo(24, 10)
        expect(event.sunsetSolarHours - event.sunriseSolarHours).toBeCloseTo(event.dayHours, 10)
      }
    }
  })
  it('赤道06/18；普通北纬30度夏至早出晚落，冬至相反', () => {
    expect(createDayLengthExperiment(2026, 0).events.every(event => event.sunriseSolarHours === 6 && event.sunsetSolarHours === 18)).toBe(true)
    const model = createDayLengthExperiment(2026, 30)
    expect(model.events[1]!.sunriseSolarHours!).toBeLessThan(6)
    expect(model.events[3]!.sunriseSolarHours!).toBeGreaterThan(6)
  })
  it('极昼极夜与极点均不伪造每日日出日落', () => {
    for (const latitude of [70, -70, 90, -90]) {
      const model = createDayLengthExperiment(2026, latitude)
      for (const event of [model.events[1]!, model.events[3]!]) {
        expect(event.sunriseSolarHours).toBeNull()
        expect(event.sunsetSolarHours).toBeNull()
      }
    }
  })
  it('显示格式保留边界、进位和null，不把24点错标0点', () => {
    expect(formatApparentSolarTime(6)).toBe('06:00:00')
    expect(formatApparentSolarTime(0)).toBe('00:00:00')
    expect(formatApparentSolarTime(24)).toBe('24:00:00')
    expect(formatApparentSolarTime(5 + 3599.8 / 3600)).toBe('06:00:00')
    expect(formatApparentSolarTime(null)).toContain('无每日升落')
    for (const value of [NaN, -1, 25, Infinity]) expect(() => formatApparentSolarTime(value)).toThrow()
  })
  it('仅昼长入口换独立面板，其余昼夜路由保留', () => {
    expect(getLabModuleRuntimeConfig('day-length').panel).toBe('day-length-annual')
    expect(getLabModuleRuntimeConfig('day-length').scene).toBe('day-night')
    expect(getLabModuleRuntimeConfig('day-night').panel).toBe('day-night')
    expect(getLabModuleRuntimeConfig('terminator').panel).toBe('day-night')
  })
})
