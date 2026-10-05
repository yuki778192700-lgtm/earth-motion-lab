import { describe, expect, it } from 'vitest'
import { generateQuestion } from './questionEngine'
import { calculateLatitudeArcGeometry } from '../domain/dayNight/dayNightGeometry'
import { calculateObserverLightingState } from '../domain/dayNight/solarReferenceFrame'
import { isPolarDay, isPolarNight, subsolarPoint, sunriseTime, sunsetTime } from '../lib/geography'
import { DAY_NIGHT_VISUAL_STYLE } from '../config/dayNightVisualStyle'

const summer = Date.parse('2026-06-21T08:24:00Z')
const winter = Date.parse('2026-12-21T20:50:00Z')
const snapshot = { simulationTimeMs: summer, latitudeDegrees: 40 }
const correctLabel = (q: ReturnType<typeof generateQuestion>) => q.options.find(o => o.id === q.correctAnswerId)!.label

describe('验收问题回归', () => {
  it.each(['climate-zones', 'local-time', 'date-line'] as const)('%s正确答案轮换四个位置，ID与可复现性不变', activeModuleId => {
    const positions = Array.from({ length: 4 }, (_, sequence) => {
      const input = { ...snapshot, activeModuleId }
      const q = generateQuestion(input, sequence)
      expect(generateQuestion(input, sequence)).toEqual(q)
      expect(new Set(q.options.map(o => o.id)).size).toBe(4)
      return q.options.findIndex(o => o.id === q.correctAnswerId)
    })
    expect(new Set(positions).size).toBe(4)
  })
  it.each([[75, winter, '没有昼弧'], [75, summer, '没有夜弧'], [-75, summer, '没有昼弧'], [-75, winter, '没有夜弧']])('极区纬度%s的读图题与真实弧段一致', (latitudeDegrees, simulationTimeMs, expected) => {
    const q = generateQuestion({ latitudeDegrees, simulationTimeMs }, 2)
    expect(q.prompt).not.toContain('黄色高亮弧段')
    expect(correctLabel(q)).toContain(expected)
    const arcs = calculateLatitudeArcGeometry(new Date(simulationTimeMs), latitudeDegrees)
    expect(expected === '没有昼弧' ? arcs.dayArc : arcs.nightArc).toHaveLength(0)
    expect(q.initialSceneAction?.dayNightStep).toBe(6)
    expect(q.initialSceneAction?.teachingLayers?.dayArc).toBe(true)
    expect(q.initialSceneAction?.teachingLayers?.nightArc).toBe(true)
  })
  it.each([[90, summer, '昼半球'], [90, winter, '夜半球'], [-90, summer, '夜半球'], [-90, winter, '昼半球']])('极点%s题目不要求读取非零纬线圈', (latitudeDegrees, simulationTimeMs, expected) => {
    const q = generateQuestion({ latitudeDegrees, simulationTimeMs }, 2)
    expect(q.prompt).toContain('纬线退化为点')
    expect(correctLabel(q)).toBe(expected)
    expect(q.explanation).toContain('纬线半径为零')
  })
  it('普通昼夜交替纬线仍生成昼弧读图题', () => {
    const q = generateQuestion(snapshot, 2)
    expect(q.prompt).toContain('黄色高亮弧段')
    expect(q.correctAnswerId).toBe('day-arc')
  })
  it.each([[66 + 34 / 60, summer], [-66 - 34 / 60, winter]])('极昼纬度%s午夜附近不误标日出', (latitude, timeMs) => {
    const date = new Date(timeMs)
    const point = subsolarPoint(date)
    expect(isPolarDay(latitude, point.latitudeDegrees)).toBe(true)
    expect(sunriseTime(latitude, point.latitudeDegrees)).toBeNull()
    expect(calculateObserverLightingState(date, latitude, point.longitudeDegrees + 180)).toBe('day')
  })
  it.each([[66 + 34 / 60, winter], [-66 - 34 / 60, summer]])('极夜纬度%s正午附近不误标日落', (latitude, timeMs) => {
    const date = new Date(timeMs)
    const point = subsolarPoint(date)
    expect(isPolarNight(latitude, point.latitudeDegrees)).toBe(true)
    expect(sunsetTime(latitude, point.latitudeDegrees)).toBeNull()
    expect(calculateObserverLightingState(date, latitude, point.longitudeDegrees)).toBe('night')
  })
  it('两极在分日前后不应用每日升落动画提示带', () => {
    for (const iso of ['2026-03-19T12:00:00Z', '2026-03-21T12:00:00Z', '2026-09-22T12:00:00Z', '2026-09-24T12:00:00Z']) {
      for (const latitude of [90, -90]) {
        const state = calculateObserverLightingState(new Date(iso), latitude, 120)
        expect(['day', 'night', 'horizon']).toContain(state)
      }
    }
  })
  it('夜侧透明遮罩保留地表，过渡对称且位于云层外、教学线内', () => {
    const style = DAY_NIGHT_VISUAL_STYLE
    expect(style.nightOverlayOpacity).toBeGreaterThan(0.34)
    expect(style.nightOverlayOpacity).toBeLessThan(1)
    expect(style.dayOverlayOpacity).toBeLessThan(style.nightOverlayOpacity)
    expect(style.surfaceEmissiveIntensity).toBeGreaterThan(0)
    expect(style.boundaryDotHalfWidth).toBeGreaterThan(0)
    expect(style.boundaryDotHalfWidth).toBeLessThan(0.012)
    expect(style.overlayRadiusFactor).toBeGreaterThan(1.014)
    expect(style.overlayRadiusFactor).toBeLessThan(1.018)
  })
})
