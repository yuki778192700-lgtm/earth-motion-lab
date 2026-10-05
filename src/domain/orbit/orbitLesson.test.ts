import { afterEach, describe, expect, it } from 'vitest'
import { assertOrbitLessonStep, createOrbitLesson } from './orbitLesson'
import { calculateSeasonalEvents } from './earthOrbit'
import { calculateHemisphereSeasons } from '../solar/hemisphereSeasons'
import { useEarthLabStore } from '../../store/useEarthLabStore'

function enterLesson() {
  const store = useEarthLabStore.getState()
  store.resetSimulation()
  store.setLearningMode('explore')
  store.setActiveModule('revolution')
  return store
}

afterEach(() => {
  useEarthLabStore.getState().resetSimulation()
  useEarthLabStore.getState().setLearningMode('explore')
  useEarthLabStore.getState().setActiveModule('rotation')
})

describe('全年公转分段讲解', () => {
  it.each([2024, 2026])('%s年讲解复用精确节气时刻，保持顺序', year => {
    const lesson = createOrbitLesson(year)
    expect(lesson.map(step => step.title)).toEqual(['春分', '夏至', '秋分', '冬至'])
    expect(lesson.map(step => step.timeMs)).toEqual(calculateSeasonalEvents(year).map(event => event.timeMs))
    expect(lesson.map(step => step.index)).toEqual([0, 1, 2, 3])
    for (let i = 1; i < 4; i++) expect(lesson[i]!.timeMs).toBeGreaterThan(lesson[i - 1]!.timeMs)
  })

  it.each([-1, 4, 1.5, NaN, Infinity])('拒绝非法步骤%s且不修改时间', step => {
    enterLesson()
    const before = useEarthLabStore.getState().simulationTimeMs
    expect(() => assertOrbitLessonStep(step)).toThrow(RangeError)
    expect(() => useEarthLabStore.getState().selectOrbitLessonStep(step)).toThrow(RangeError)
    expect(useEarthLabStore.getState().simulationTimeMs).toBe(before)
  })

  it('四个按钮定位对应节气，北南纬30度昼长与直射纬度一致', () => {
    const store = enterLesson()
    const steps = createOrbitLesson(2026)
    for (const step of steps) {
      store.selectOrbitLessonStep(step.index)
      const state = useEarthLabStore.getState()
      expect(state.simulationTimeMs).toBe(step.timeMs)
      expect(state.isAnnualOrbitPlaying).toBe(false)
      const comparison = calculateHemisphereSeasons(state.simulationTimeMs, 30)
      expect(comparison.north.dayHours + comparison.south.dayHours).toBeCloseTo(24, 10)
      if (step.index === 1) {
        expect(comparison.declinationDegrees).toBeGreaterThan(23)
        expect(comparison.north.dayHours).toBeGreaterThan(comparison.south.dayHours)
      } else if (step.index === 3) {
        expect(comparison.declinationDegrees).toBeLessThan(-23)
        expect(comparison.north.dayHours).toBeLessThan(comparison.south.dayHours)
      } else {
        expect(comparison.north.dayHours).toBeCloseTo(12, 2)
      }
    }
  })

  it('从春分开始逐段播放，大步推进也精确停在下一节气，冬至不再前进', () => {
    const store = enterLesson()
    const steps = createOrbitLesson(2026)
    store.toggleOrbitLessonPlayback()
    expect(useEarthLabStore.getState().simulationTimeMs).toBe(steps[0]!.timeMs)
    for (let target = 1; target <= 3; target++) {
      if (target > 1) store.toggleOrbitLessonPlayback()
      expect(useEarthLabStore.getState().orbitLessonTargetStepIndex).toBe(target)
      store.advanceAnnualOrbitTime(60000)
      const state = useEarthLabStore.getState()
      expect(state.simulationTimeMs).toBe(steps[target]!.timeMs)
      expect(state.orbitLessonStepIndex).toBe(target)
      expect(state.orbitLessonTargetStepIndex).toBeNull()
      expect(state.annualOrbitStopTimeMs).toBeNull()
      expect(state.isAnnualOrbitPlaying).toBe(false)
    }
    store.toggleOrbitLessonPlayback()
    expect(useEarthLabStore.getState().isAnnualOrbitPlaying).toBe(false)
    expect(useEarthLabStore.getState().simulationTimeMs).toBe(steps[3]!.timeMs)
  })

  it.each([30, 60, 120] as const)('%s秒设置保留，暂停静止并从同一目标继续，不改变自转倍率', duration => {
    const store = enterLesson()
    store.setSpeed(2000)
    store.setAnnualOrbitDuration(duration)
    store.toggleOrbitLessonPlayback()
    store.advanceAnnualOrbitTime(100)
    const pausedTime = useEarthLabStore.getState().simulationTimeMs
    store.toggleOrbitLessonPlayback()
    store.advanceAnnualOrbitTime(10000)
    expect(useEarthLabStore.getState().simulationTimeMs).toBe(pausedTime)
    expect(useEarthLabStore.getState().orbitLessonTargetStepIndex).toBe(1)
    store.setAnnualOrbitStopAtNextEvent(false)
    expect(useEarthLabStore.getState().annualOrbitStopTimeMs).toBe(createOrbitLesson(2026)[1]!.timeMs)
    store.toggleOrbitLessonPlayback()
    store.advanceAnnualOrbitTime(120000)
    expect(useEarthLabStore.getState().simulationTimeMs).toBe(createOrbitLesson(2026)[1]!.timeMs)
    expect(useEarthLabStore.getState().speed).toBe(2000)
    expect(useEarthLabStore.getState().annualOrbitDurationSeconds).toBe(duration)
  })

  it('手动调整时间或切换模块/教学模式时退出分段状态', () => {
    const actions = [
      () => useEarthLabStore.getState().seekAnnualOrbitTime(Date.UTC(2026, 6, 1)),
      () => useEarthLabStore.getState().stepAnnualOrbitDay(1),
      () => useEarthLabStore.getState().setSimulationTime(Date.UTC(2026, 0, 1)),
      () => useEarthLabStore.getState().setActiveModule('rotation'),
      () => useEarthLabStore.getState().setLearningMode('teach'),
      () => useEarthLabStore.getState().resetSimulation(),
    ]
    for (const action of actions) {
      const store = enterLesson()
      store.toggleOrbitLessonPlayback()
      action()
      const state = useEarthLabStore.getState()
      expect(state.orbitLessonStepIndex).toBeNull()
      expect(state.orbitLessonTargetStepIndex).toBeNull()
      expect(state.isAnnualOrbitPlaying).toBe(false)
      expect(state.annualOrbitStopTimeMs).toBeNull()
    }
  })

  it('选择上一步或重置取消当前播放目标，正常全年播放退出分段模式', () => {
    const store = enterLesson()
    store.selectOrbitLessonStep(1)
    store.toggleOrbitLessonPlayback()
    store.selectOrbitLessonStep(0)
    expect(useEarthLabStore.getState().isAnnualOrbitPlaying).toBe(false)
    expect(useEarthLabStore.getState().orbitLessonTargetStepIndex).toBeNull()
    store.toggleAnnualOrbitPlaying()
    expect(useEarthLabStore.getState().orbitLessonStepIndex).toBeNull()
    expect(useEarthLabStore.getState().orbitLessonTargetStepIndex).toBeNull()
    expect(useEarthLabStore.getState().isAnnualOrbitPlaying).toBe(true)
  })

  it('非公转自由探索场景不会启动分段时钟', () => {
    const store = enterLesson()
    store.setActiveModule('rotation')
    store.selectOrbitLessonStep(0)
    store.toggleOrbitLessonPlayback()
    expect(useEarthLabStore.getState().orbitLessonStepIndex).toBeNull()
    expect(useEarthLabStore.getState().isAnnualOrbitPlaying).toBe(false)
  })
})
