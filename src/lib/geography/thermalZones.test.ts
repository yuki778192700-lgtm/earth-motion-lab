import { describe, expect, it } from 'vitest'
import { classifyThermalZone } from './thermalZones'
import { TROPIC_LATITUDE_DEGREES as T, POLAR_CIRCLE_LATITUDE_DEGREES as P } from '../earthCoordinates'

describe('天文五带', () => {
  it.each([[0, '热带'], [30, '北温带'], [-30, '南温带'], [90, '北寒带'], [-90, '南寒带']] as const)('纬度 %s 属于 %s', (latitude, name) => {
    expect(classifyThermalZone(latitude).name).toBe(name)
  })
  it.each([1, -1])('南北半球边界及两侧正确：%s', sign => {
    expect(classifyThermalZone(sign * T).name).toContain('回归线（两带分界）')
    expect(classifyThermalZone(sign * P).name).toContain('极圈（两带分界）')
    expect(classifyThermalZone(sign * (T - 0.000001)).name).toBe('热带')
    expect(classifyThermalZone(sign * (T + 0.000001)).name).toContain('温带')
    expect(classifyThermalZone(sign * (P - 0.000001)).name).toContain('温带')
    expect(classifyThermalZone(sign * (P + 0.000001)).name).toContain('寒带')
    expect(classifyThermalZone(sign * T).directSun).toBe(true)
    expect(classifyThermalZone(sign * P).polarEvents).toBe(true)
  })
  it.each([NaN, Infinity, -91, 91])('拒绝无效纬度 %s', latitude => {
    expect(() => classifyThermalZone(latitude)).toThrow()
  })
})
