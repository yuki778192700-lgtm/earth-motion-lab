import { describe, expect, it, afterEach } from 'vitest'
import { calculateHemisphereSeasons } from './hemisphereSeasons'
import { calculateSeasonalEvents } from '../orbit/earthOrbit'
import { dayLength, solarDeclination, solarNoonAltitude } from '../../lib/geography'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { getLabModuleRuntimeConfig } from '../../config/labModuleRegistry'

describe('南北半球四季对照', () => {
  const events = calculateSeasonalEvents(2026)
  it.each(events.map((event, index) => ({ ...event, index })))('$label在节气瞬间切换，南北相反', event => {
    const north = ['春季', '夏季', '秋季', '冬季']
    const south = ['秋季', '冬季', '春季', '夏季']
    expect(calculateHemisphereSeasons(event.timeMs - 1, 30).north.season).toBe(north[(event.index + 3) % 4])
    for (const offset of [0, 1]) {
      const model = calculateHemisphereSeasons(event.timeMs + offset, 30)
      expect(model.north.season).toBe(north[event.index])
      expect(model.south.season).toBe(south[event.index])
    }
  })
  it.each([0, 23 + 26 / 60, 30, 66 + 34 / 60, 90])('纬度%s的全部数据来自地理引擎', latitude => {
    for (const event of events) {
      const model = calculateHemisphereSeasons(event.timeMs, latitude)
      const delta = solarDeclination(new Date(event.timeMs))
      for (const point of [model.north, model.south]) {
        expect(point.dayHours).toBe(dayLength(point.latitudeDegrees, delta))
        expect(point.noonAltitudeDegrees).toBe(solarNoonAltitude(point.latitudeDegrees, delta))
      }
      expect(model.north.dayHours + model.south.dayHours).toBeCloseTo(24, 10)
    }
  })
  it('两极六月极昼极夜相反，十二月反转；负高度不裁剪', () => {
    const june = calculateHemisphereSeasons(events[1]!.timeMs, 90)
    const december = calculateHemisphereSeasons(events[3]!.timeMs, 90)
    expect(june.north.lightState).toBe('极昼')
    expect(june.south.lightState).toBe('极夜')
    expect(june.south.noonAltitudeDegrees).toBeLessThan(0)
    expect(december.north.lightState).toBe('极夜')
    expect(december.south.lightState).toBe('极昼')
  })
  it('赤道昼长相同；北纬30度夏至太阳高度及昼长大于冬至', () => {
    expect(calculateHemisphereSeasons(events[1]!.timeMs, 0).north.dayHours).toBe(12)
    const june = calculateHemisphereSeasons(events[1]!.timeMs, 30)
    const december = calculateHemisphereSeasons(events[3]!.timeMs, 30)
    expect(june.north.noonAltitudeDegrees).toBeCloseTo(83.44, 1)
    expect(june.north.dayHours).toBeGreaterThan(december.north.dayHours)
    expect(june.distanceAu).toBeGreaterThan(december.distanceAu)
  })
  it.each(['2024-01-01T00:00:00Z', '2024-12-31T23:59:59Z', '2026-01-01T00:00:00Z'])('跨年%s北冬南夏', date => {
    const model = calculateHemisphereSeasons(Date.parse(date), 30)
    expect(model.north.season).toBe('冬季')
    expect(model.south.season).toBe('夏季')
  })
  it('拒绝非法输入，不混入负纬度或无效时间', () => {
    for (const latitude of [-1, 91, NaN, Infinity]) expect(() => calculateHemisphereSeasons(events[0]!.timeMs, latitude)).toThrow()
    expect(() => calculateHemisphereSeasons(NaN, 30)).toThrow()
  })
})

describe('四季对照状态与路由', () => {
  afterEach(() => useEarthLabStore.getState().resetSimulation())
  it('对比纬度独立，不改模拟时间、观察点或速度；重置恢复30度', () => {
    const before = useEarthLabStore.getState()
    before.setSeasonsComparisonLatitude(90)
    const after = useEarthLabStore.getState()
    expect(after.seasonsComparisonLatitudeDegrees).toBe(90)
    expect(after.simulationTimeMs).toBe(before.simulationTimeMs)
    expect(after.observerLatitudeDegrees).toBe(before.observerLatitudeDegrees)
    expect(after.speed).toBe(before.speed)
    expect(() => after.setSeasonsComparisonLatitude(-30)).toThrow()
    after.resetSimulation()
    expect(useEarthLabStore.getState().seasonsComparisonLatitudeDegrees).toBe(30)
  })
  it('只更换四季数据面板，仍复用公转场景', () => {
    expect(getLabModuleRuntimeConfig('seasons').scene).toBe('orbit')
    expect(getLabModuleRuntimeConfig('seasons').panel).toBe('seasons')
    expect(getLabModuleRuntimeConfig('revolution').panel).toBe('orbit')
  })
})
