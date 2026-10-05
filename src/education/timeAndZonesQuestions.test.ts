import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateQuestion } from './questionEngine'
import { useEarthLabStore } from '../store/useEarthLabStore'
import * as storeModule from '../store/useEarthLabStore'
import { compareMeanAndFixedTime } from '../lib/geography'
import { POLAR_CIRCLE_LATITUDE_DEGREES, TROPIC_LATITUDE_DEGREES } from '../lib/earthCoordinates'
import type { PracticeSnapshot } from '../types/education'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PracticePanel } from '../components/education/PracticePanel'

const base: PracticeSnapshot = {
  simulationTimeMs: Date.parse('2026-03-20T20:00:00Z'), latitudeDegrees: 45,
  activeModuleId: 'local-time', localTimeLongitudeA: 0, localTimeLongitudeB: 120,
  localTimeOffsetA: 0, localTimeOffsetB: 480, dateLineDirection: 'east', dateLineProgress: 0,
}
const answer = (snapshot: PracticeSnapshot, sequence = 0) => {
  const q = generateQuestion(snapshot, sequence)
  expect(q.options).toHaveLength(4)
  expect(new Set(q.options.map(o => o.label)).size).toBe(4)
  return q.options.find(o => o.id === q.correctAnswerId)!.label
}
afterEach(() => useEarthLabStore.setState(useEarthLabStore.getInitialState(), true))

describe('场景练习题科学边界', () => {
  it.each([
    [0, '热带'], [45, '北温带'], [-45, '南温带'], [90, '北寒带'], [-90, '南寒带'],
    [TROPIC_LATITUDE_DEGREES, '北回归线（两带分界）'],
    [-TROPIC_LATITUDE_DEGREES, '南回归线（两带分界）'],
    [POLAR_CIRCLE_LATITUDE_DEGREES, '北极圈（两带分界）'],
    [-POLAR_CIRCLE_LATITUDE_DEGREES, '南极圈（两带分界）'],
  ])('五带纬度%s：%s', (latitudeDegrees, expected) => {
    expect(answer({ ...base, activeModuleId: 'climate-zones', latitudeDegrees })).toBe(expected)
  })
  it.each([[0, 15, '60分钟'], [0, -15, '-60分钟'], [-75, 120, '780分钟'], [120, 120, '0分钟'], [-180, 180, '1440分钟'], [180, -180, '-1440分钟']])('经度A=%s B=%s，时差为%s', (a, b, expected) => {
    expect(answer({ ...base, localTimeLongitudeA: a, localTimeLongitudeB: b })).toBe(expected)
  })
  it('地方时跨午夜解析保留日期，不只比较钟点', () => {
    const q = generateQuestion(base, 0)
    expect(q.explanation).toContain('2026/03/21 04:00')
    expect(q.prompt).toContain('地方平均太阳时')
    expect(q.explanation).toContain('不含时间方程')
  })
  it.each([480, -300, 0, 345, -720, 840])('固定偏移%s分钟，答案取引擎日历且四选项不重复', offset => {
    const snapshot = { ...base, localTimeOffsetA: offset, localTimeOffsetB: offset, localTimeLongitudeA: 0, localTimeLongitudeB: 0 }
    const label = answer(snapshot, 1)
    const clock = compareMeanAndFixedTime(0, offset, new Date(base.simulationTimeMs)).fixedClock
    const format = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    expect(label).toBe(format.format(new Date(clock.calendarTimeMs)))
    expect(generateQuestion(snapshot, 1).explanation).toContain('不包含国家边界')
  })
  it.each(['east', 'west'] as const)('跨线%s：方向和日期演示不改变UTC', direction => {
    const snapshot = { ...base, activeModuleId: 'date-line' as const, dateLineDirection: direction, dateLineProgress: 0.5 }
    const q = generateQuestion(snapshot, 0)
    expect(answer(snapshot)).toBe(direction === 'east' ? '日历减一天' : '日历加一天')
    expect(q.explanationSteps.map(s => s.action.dateLineProgress)).toEqual([0, 0.5, 1])
    for (const step of q.explanationSteps) {
      expect(step.action.simulationTimeMs).toBe(base.simulationTimeMs)
      expect(step.action.dateLineDirection).toBe(direction)
    }
    expect(q.explanation).toContain('不表示现实曲折日期线')
  })
  it('输入相同可重复生成，未指定新模块时保留原九题轮换', () => {
    expect(generateQuestion(base, 1)).toEqual(generateQuestion(base, 1))
    const snapshot = { simulationTimeMs: base.simulationTimeMs, latitudeDegrees: 45 }
    expect(new Set(Array.from({ length: 9 }, (_, i) => generateQuestion(snapshot, i).type)).size).toBe(9)
  })
})

function renderPractice() {
  const realStore = useEarthLabStore
  const currentState = realStore.getState()
  const hook = Object.assign((selector: (state: typeof currentState) => unknown) => selector(currentState), realStore) as typeof realStore
  const mock = vi.spyOn(storeModule, 'useEarthLabStore').mockImplementation(hook)
  try { return renderToStaticMarkup(createElement(PracticePanel)) } finally { mock.mockRestore() }
}

describe('答题到模型解析闭环', () => {
  for (const [moduleId, sequence, expectedType] of [
    ['climate-zones', 0, 'thermal-zone'], ['local-time', 0, 'local-time'],
    ['local-time', 1, 'fixed-offset-time'], ['date-line', 0, 'date-line'],
  ] as const) {
    it(`${expectedType}：题设、提交、可逆模型演示及下一题`, () => {
      const store = useEarthLabStore.getState()
      useEarthLabStore.setState({ activeModuleId: moduleId, simulationTimeMs: base.simulationTimeMs, observerLatitudeDegrees: 45, localTimeLongitudeA: -75, localTimeLongitudeB: 120, localTimeOffsetA: -300, localTimeOffsetB: 480, dateLineDirection: 'west', dateLineProgress: 0.3, practiceSequence: sequence, isPlaying: true, speed: 3000 })
      store.setLearningMode('practice')
      const q = useEarthLabStore.getState().practiceQuestion!
      expect(q.type).toBe(expectedType)
      expect(useEarthLabStore.getState().isPlaying).toBe(false)
      const before = renderPractice()
      expect(before).not.toContain('正确答案：')
      expect(before).not.toContain('答案演示实时观测数据')
      expect(before).toContain(q.typeLabel)
      store.selectPracticeAnswer(q.options.find(o => o.id !== q.correctAnswerId)!.id)
      store.submitPracticeAnswer()
      const submitted = renderPractice()
      expect(submitted).toContain('回答错误')
      expect(submitted).toContain('正确答案：')
      expect(submitted).toContain('答案演示实时观测数据')
      const states = q.explanationSteps.map((step, index) => {
        if (index > 0) store.nextPracticeExplanationStep()
        const state = useEarthLabStore.getState()
        expect(state.activeModuleId).toBe(moduleId)
        expect(state.simulationTimeMs).toBe(base.simulationTimeMs)
        expect(state.isPlaying).toBe(false)
        expect(state.speed).toBe(3000)
        expect(state.observerLatitudeDegrees).toBe(step.action.latitudeDegrees)
        expect(state.localTimeLongitudeB).toBe(step.action.localTimeLongitudeB)
        expect(state.localTimeOffsetB).toBe(step.action.localTimeOffsetB)
        expect(state.dateLineProgress).toBe(step.action.dateLineProgress)
        return state
      })
      store.nextPracticeExplanationStep()
      expect(useEarthLabStore.getState().practiceExplanationIndex).toBe(q.explanationSteps.length - 1)
      for (let i = states.length - 2; i >= 0; i--) {
        store.previousPracticeExplanationStep()
        const state = useEarthLabStore.getState()
        expect(state.observerLatitudeDegrees).toBe(states[i]!.observerLatitudeDegrees)
        expect(state.localTimeLongitudeB).toBe(states[i]!.localTimeLongitudeB)
        expect(state.localTimeOffsetB).toBe(states[i]!.localTimeOffsetB)
        expect(state.dateLineProgress).toBe(states[i]!.dateLineProgress)
      }
      store.generateNextQuestion()
      expect(useEarthLabStore.getState().practiceSubmitted).toBe(false)
      expect(useEarthLabStore.getState().practiceSelectedAnswerId).toBeNull()
      expect(useEarthLabStore.getState().activeModuleId).toBe(moduleId)
    })
  }
})
