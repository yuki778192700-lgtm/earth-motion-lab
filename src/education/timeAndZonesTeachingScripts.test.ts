import { afterEach, describe, expect, it, vi } from 'vitest'
import { TIME_AND_ZONES_TEACHING_SCRIPTS } from './timeAndZonesTeachingScripts'
import { getTeachingObservations } from './teachingObservations'
import { useEarthLabStore } from '../store/useEarthLabStore'
import * as storeModule from '../store/useEarthLabStore'
import { calculateDateLineCrossing, classifyThermalZone, compareLocalMeanTimes, compareMeanAndFixedTime } from '../lib/geography'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { TeacherPanel } from '../components/education/TeacherPanel'
import { EducationControls } from '../components/education/EducationControls'

afterEach(() => useEarthLabStore.setState(useEarthLabStore.getInitialState(), true))
// Zustand的SSR默认读取内部初始快照。仅在本次静态渲染中替换
// 组件所用selector的输入，保留真实store API；随后立即还原。
function renderCurrentStep(component: typeof TeacherPanel | typeof EducationControls) {
  const realStore = useEarthLabStore
  const current = realStore.getState()
  const selectCurrent = Object.assign(
    (selector: (state: typeof current) => unknown) => selector(current),
    realStore,
  ) as typeof realStore
  const serverSnapshot = vi.spyOn(storeModule, 'useEarthLabStore').mockImplementation(selectCurrent)
  try {
    return renderToStaticMarkup(createElement(component))
  } finally {
    serverSnapshot.mockRestore()
  }
}
const snapshot = () => {
  const s = useEarthLabStore.getState()
  return { moduleId: s.activeModuleId, time: s.simulationTimeMs, latitude: s.observerLatitudeDegrees, a: s.localTimeLongitudeA, b: s.localTimeLongitudeB, offsetA: s.localTimeOffsetA, offsetB: s.localTimeOffsetB, direction: s.dateLineDirection, progress: s.dateLineProgress, layers: s.teachingLayers }
}

describe('新增教师演示快照与控制', () => {
  for (const script of TIME_AND_ZONES_TEACHING_SCRIPTS) {
    it(`${script.title}：面板显示主题、实时数据和现有五种控制`, () => {
      const store = useEarthLabStore.getState()
      store.setLearningMode('teach')
      store.selectTeacherTopic(script.id)
      const initialState = useEarthLabStore.getInitialState()
      const panel = renderCurrentStep(TeacherPanel)
      expect(panel).toContain(script.title)
      expect(panel).toContain(script.steps[0]!.title)
      expect(panel).toContain('教师演示实时观测数据')
      const controls = renderCurrentStep(EducationControls)
      for (const label of ['上一步', '下一步', '播放', '重置']) expect(controls).toContain(label)
      store.toggleTeacherPlaying()
      expect(renderCurrentStep(EducationControls)).toContain('暂停')
      expect(useEarthLabStore.getInitialState()).toBe(initialState)
    })
    it(`${script.title}：前进、后退、重置和末步停止可确定性还原`, () => {
      const store = useEarthLabStore.getState()
      store.setLearningMode('teach')
      store.setSpeed(3000)
      store.selectTeacherTopic(script.id)
      const initial = snapshot()
      const firstObservations = getTeachingObservations(script.id, useEarthLabStore.getState())
      expect(firstObservations.length).toBeGreaterThan(0)
      store.toggleTeacherPlaying()
      expect(useEarthLabStore.getState().isTeacherPlaying).toBe(true)
      store.toggleTeacherPlaying()
      expect(useEarthLabStore.getState().isTeacherPlaying).toBe(false)
      expect(snapshot()).toEqual(initial)
      store.nextTeacherStep()
      const second = snapshot()
      store.previousTeacherStep()
      expect(snapshot()).toEqual(initial)
      store.nextTeacherStep()
      expect(snapshot()).toEqual(second)
      store.resetTeacherDemo()
      expect(snapshot()).toEqual(initial)
      store.previousTeacherStep()
      expect(useEarthLabStore.getState().teacherStepIndex).toBe(0)
      store.toggleTeacherPlaying()
      for (let i = 1; i < script.steps.length; i++) store.nextTeacherStep()
      const end = snapshot()
      expect(useEarthLabStore.getState().isTeacherPlaying).toBe(false)
      store.nextTeacherStep()
      expect(snapshot()).toEqual(end)
      expect(useEarthLabStore.getState().speed).toBe(3000)
      expect(useEarthLabStore.getState().isPlaying).toBe(false)
      expect(useEarthLabStore.getState().isAnnualOrbitPlaying).toBe(false)
    })
  }
  it('五带覆盖南北两半球与四条教材分界', () => {
    const store = useEarthLabStore.getState()
    store.selectTeacherTopic('climate-zones')
    const names: string[] = []
    for (let i = 0; i < 9; i++) {
      names.push(classifyThermalZone(useEarthLabStore.getState().observerLatitudeDegrees).name)
      store.nextTeacherStep()
    }
    expect(names).toEqual(['热带', '北回归线（两带分界）', '北温带', '北极圈（两带分界）', '北寒带', '南寒带', '南极圈（两带分界）', '南温带', '南回归线（两带分界）'])
  })
  it('地方时经度符号及小时差与引擎一致', () => {
    const store = useEarthLabStore.getState()
    store.selectTeacherTopic('local-time')
    for (const minutes of [60, -60, 780, 0]) {
      const s = useEarthLabStore.getState()
      expect(compareLocalMeanTimes(s.localTimeLongitudeA, s.localTimeLongitudeB, new Date(s.simulationTimeMs)).timeDifferenceMinutes).toBe(minutes)
      expect(getTeachingObservations('local-time', s).find(row => row.label === '地方时B−A')?.value).toBe(`${minutes} 分钟`)
      store.nextTeacherStep()
    }
  })
  it('区时改变偏移不改变经线，跨日结果与UTC一致', () => {
    const store = useEarthLabStore.getState()
    store.selectTeacherTopic('fixed-offset-time')
    const first = snapshot()
    store.nextTeacherStep()
    expect(snapshot().a).toBe(first.a)
    expect(snapshot().b).toBe(first.b)
    store.nextTeacherStep()
    const s = useEarthLabStore.getState()
    const utc = new Date(s.simulationTimeMs)
    const a = compareMeanAndFixedTime(s.localTimeLongitudeA, s.localTimeOffsetA, utc)
    const b = compareMeanAndFixedTime(s.localTimeLongitudeB, s.localTimeOffsetB, utc)
    expect(new Date(a.fixedClock.calendarTimeMs).toISOString()).toBe('2026-03-21T04:00:00.000Z')
    expect(new Date(b.fixedClock.calendarTimeMs).toISOString()).toBe('2026-03-20T15:00:00.000Z')
  })
  it('跨线UTC固定，东减西加，界线上按目标侧处理', () => {
    const store = useEarthLabStore.getState()
    store.selectTeacherTopic('date-line')
    const time = useEarthLabStore.getState().simulationTimeMs
    for (const [direction, progress] of [['east', 0], ['east', 1], ['west', 0], ['west', 1], ['west', 0.5]] as const) {
      const s = useEarthLabStore.getState()
      expect(s.simulationTimeMs).toBe(time)
      expect(s.dateLineDirection).toBe(direction)
      expect(s.dateLineProgress).toBe(progress)
      const result = calculateDateLineCrossing(direction, progress, new Date(time))
      expect(result.current.calendarTimeMs - result.before.calendarTimeMs).toBe(progress < 0.5 ? 0 : (direction === 'east' ? -86400000 : 86400000))
      expect(getTeachingObservations('date-line', s)).toHaveLength(4)
      store.nextTeacherStep()
    }
  })
  it('场景动作复用输入边界验证，非法参数不写入状态', () => {
    const store = useEarthLabStore.getState()
    const before = snapshot()
    expect(() => store.applySceneAction({ localTimeLongitudeA: 181 })).toThrow()
    expect(() => store.applySceneAction({ localTimeOffsetB: 841 })).toThrow()
    expect(() => store.applySceneAction({ dateLineProgress: -0.1 })).toThrow()
    expect(snapshot()).toEqual(before)
  })
})
