import { describe, expect, it } from 'vitest'
import { getSceneLegend } from './sceneLegend'
import { getLabModuleRuntimeConfig } from './labModuleRegistry'
import { createDefaultTeachingLayers } from './teachingLayers'
import type { LabModuleId } from '../types/lab'
import { calculateLatitudeArcGeometry } from '../domain/dayNight/dayNightGeometry'

const defaults = { activeModuleId: 'day-length' as LabModuleId, teachingLayers: createDefaultTeachingLayers(), isDayNightGuidedMode: false, dayNightStep: 1, simulationTimeMs: Date.parse('2026-06-21T12:00:00Z'), observerLatitudeDegrees: 30 }
const ids = (state: typeof defaults) => getSceneLegend(state).map(entry => entry.id)

describe('图例与现有可见对象一致', () => {
  it('昼弧夜弧、晨昏线、太阳光独立开关', () => {
    for (const [layer, removed] of [['dayArc', ['day-arc']], ['nightArc', ['night-arc']], ['terminator', ['dawn', 'dusk']], ['parallelSunRays', ['rays']]] as const) {
      const state = { ...defaults, teachingLayers: { ...defaults.teachingLayers, [layer]: false } }
      for (const id of removed) expect(ids(state)).not.toContain(id)
    }
    expect(ids(defaults)).toEqual(['day-arc', 'night-arc', 'dawn', 'dusk', 'rays'])
  })
  it.each([1, 2, 3, 4, 5, 6])('逐步讲解第%s步仅标注已显示对象', step => {
    const entries = ids({ ...defaults, isDayNightGuidedMode: true, dayNightStep: step })
    expect(entries.includes('dawn')).toBe(step >= 3)
    expect(entries.includes('day-arc')).toBe(step >= 5)
    expect(entries.includes('rays')).toBe(true)
  })
  it.each([0, 30, 70, -70, 90, -90])('纬度%s图例与真实弧线生成条件一致', latitude => {
    for (const date of ['2026-06-21T12:00:00Z', '2026-12-21T12:00:00Z', '2026-03-20T12:00:00Z']) {
      const state = { ...defaults, observerLatitudeDegrees: latitude, simulationTimeMs: Date.parse(date) }
      const geometry = calculateLatitudeArcGeometry(new Date(state.simulationTimeMs), latitude)
      expect(ids(state).includes('day-arc')).toBe(geometry.dayArc.length > 1)
      expect(ids(state).includes('night-arc')).toBe(geometry.nightArc.length > 1)
    }
  })
  it.each(['subsolar-point', 'solar-altitude'] as const)('%s默认隐藏的弧线不进图例', module => {
    expect(ids({ ...defaults, activeModuleId: module, teachingLayers: { ...getLabModuleRuntimeConfig(module).defaultLayers } })).toEqual(['dawn', 'dusk', 'rays'])
  })
  it('公转常驻平面保留，地轴与辅助光线随开关隐藏', () => {
    expect(ids({ ...defaults, activeModuleId: 'revolution', teachingLayers: { ...defaults.teachingLayers, earthAxis: false, parallelSunRays: false } })).toEqual(['orbit', 'ecliptic', 'equatorial-plane'])
  })
  it('地方时场景没有所选纬线；旋转和五带的常驻纬线保留', () => {
    expect(ids({ ...defaults, activeModuleId: 'local-time' })).not.toContain('latitude')
    for (const module of ['rotation', 'climate-zones'] as const) expect(ids({ ...defaults, activeModuleId: module })).toContain('latitude')
  })
  it('所有原有图例对象隐藏时返回空，不保留空框；输入不被修改', () => {
    const state = { ...defaults, teachingLayers: { ...defaults.teachingLayers, dayArc: false, nightArc: false, terminator: false, parallelSunRays: false } }
    const before = JSON.stringify(state)
    expect(getSceneLegend(state)).toEqual([])
    expect(JSON.stringify(state)).toBe(before)
  })
})
