import { afterEach, describe, expect, it, vi } from 'vitest'
import { advanceAnnualTimeline, ANNUAL_ORBIT_DURATIONS, getAnnualTimeline, getNextAnnualStop, stepAnnualDay } from './annualTimeline'
import { calculateEarthOrbitState } from './earthOrbit'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { startSimulationClock } from '../simulation/clock'

afterEach(() => { useEarthLabStore.getState().resetSimulation(); useEarthLabStore.getState().setActiveModule('rotation'); vi.useRealTimers(); vi.restoreAllMocks() })

describe('公转全年时间轴', () => {
  it.each([2024, 2026])('%s年有真实365/366天，月份及节气按日期定位', year => {
    const timeline = getAnnualTimeline(year)
    expect(timeline.daysInYear).toBe(year === 2024 ? 366 : 365)
    expect(timeline.months).toHaveLength(12)
    expect(timeline.months[0]!.progressPercent).toBe(0)
    expect(timeline.months[2]!.timeMs).toBe(Date.UTC(year, 2, 1))
    expect(timeline.events).toHaveLength(4)
    for (const event of timeline.events) expect(event.progressPercent).toBeCloseTo((event.timeMs - timeline.startTimeMs) / timeline.durationMs * 100, 12)
  })
  it.each(ANNUAL_ORBIT_DURATIONS)('%s秒推进一整年并停在年末，半程均匀推进日期', duration => {
    for (const year of [2024, 2026]) {
      const timeline = getAnnualTimeline(year)
      const halfway = advanceAnnualTimeline(timeline.startTimeMs, duration * 500, duration, year)
      expect(halfway.timeMs).toBe(timeline.startTimeMs + timeline.durationMs / 2)
      expect(halfway.shouldPause).toBe(false)
      const end = advanceAnnualTimeline(timeline.startTimeMs, duration * 1000, duration, year)
      expect(end.timeMs).toBe(timeline.endTimeMs)
      expect(end.shouldPause).toBe(true)
    }
  })
  it('30/60/120秒推进比例4:2:1，不均匀转动轨道角度', () => {
    const start = Date.UTC(2026, 0, 1)
    const advances = ANNUAL_ORBIT_DURATIONS.map(duration => advanceAnnualTimeline(start, 100, duration, 2026).timeMs - start)
    expect(advances[0]).toBeCloseTo(advances[1]! * 2, 2)
    expect(advances[1]).toBeCloseTo(advances[2]! * 2, 2)
    const january = calculateEarthOrbitState(start)
    const july = calculateEarthOrbitState(Date.UTC(2026, 6, 1))
    expect(january.orbitalSpeedKmPerSecond).toBeGreaterThan(july.orbitalSpeedKmPerSecond)
  })
  it('节气暂停截断大步推进，恢复后选择下一个节气；冬至以后停年末', () => {
    const timeline = getAnnualTimeline(2026)
    const first = getNextAnnualStop(timeline.startTimeMs)!
    const next = advanceAnnualTimeline(timeline.startTimeMs, 60000, 60, 2026, first)
    expect(next).toEqual({ timeMs: first, shouldPause: true })
    expect(getNextAnnualStop(first)).toBe(timeline.events[1]!.timeMs)
    expect(getNextAnnualStop(timeline.events[3]!.timeMs)).toBeNull()
  })
  it('逐日跨闰日并保留UTC时刻，年初年末不越界', () => {
    expect(stepAnnualDay(Date.parse('2024-02-28T04:15:00Z'), 1)).toBe(Date.parse('2024-02-29T04:15:00Z'))
    expect(stepAnnualDay(Date.parse('2024-02-29T04:15:00Z'), 1)).toBe(Date.parse('2024-03-01T04:15:00Z'))
    expect(stepAnnualDay(Date.UTC(2026, 0, 1), -1)).toBe(Date.UTC(2026, 0, 1))
    expect(stepAnnualDay(Date.UTC(2027, 0, 1) - 1, 1)).toBe(Date.UTC(2027, 0, 1) - 1)
  })
  it('拒绝非法演示时长、负时间和越界节气停止点', () => {
    expect(() => advanceAnnualTimeline(Date.UTC(2026, 0, 1), -1, 60, 2026)).toThrow()
    expect(() => advanceAnnualTimeline(Date.UTC(2026, 0, 1), 100, 60, 2026, NaN)).toThrow()
    expect(() => getAnnualTimeline(NaN)).toThrow()
    expect(() => useEarthLabStore.getState().setAnnualOrbitDuration(45 as 60)).toThrow()
  })
})

describe('全年播放与原自转时钟隔离', () => {
  it('进入公转暂停原倍率播放；全年推进只走一个时钟，暂停完全停止', () => {
    vi.useFakeTimers()
    vi.spyOn(performance, 'now').mockImplementation(() => Date.now())
    const store = useEarthLabStore.getState()
    store.setSpeed(2000)
    store.togglePlaying()
    store.setActiveModule('revolution')
    expect(useEarthLabStore.getState().isPlaying).toBe(false)
    store.seekAnnualOrbitTime(Date.UTC(2026, 0, 1))
    store.toggleAnnualOrbitPlaying()
    const stop = startSimulationClock(useEarthLabStore.getState)
    vi.advanceTimersByTime(990)
    const advanced = useEarthLabStore.getState().simulationTimeMs
    expect(advanced - Date.UTC(2026, 0, 1)).toBeCloseTo(990 * 365 * 86400000 / 60000, 1)
    expect(useEarthLabStore.getState().speed).toBe(2000)
    useEarthLabStore.getState().toggleAnnualOrbitPlaying()
    vi.advanceTimersByTime(990)
    expect(useEarthLabStore.getState().simulationTimeMs).toBe(advanced)
    stop()
  })
  it('拖动、逐日、模块/教学模式切换和重置都结束全年播放', () => {
    const actions = [() => useEarthLabStore.getState().seekAnnualOrbitTime(Date.UTC(2026, 5, 1)), () => useEarthLabStore.getState().stepAnnualOrbitDay(1), () => useEarthLabStore.getState().setActiveModule('rotation'), () => useEarthLabStore.getState().setLearningMode('teach'), () => useEarthLabStore.getState().setLearningMode('practice'), () => useEarthLabStore.getState().resetSimulation()]
    for (const action of actions) {
      const store = useEarthLabStore.getState()
      store.setLearningMode('explore')
      store.setActiveModule('revolution')
      store.toggleAnnualOrbitPlaying()
      expect(useEarthLabStore.getState().isAnnualOrbitPlaying).toBe(true)
      action()
      expect(useEarthLabStore.getState().isAnnualOrbitPlaying).toBe(false)
    }
    expect(useEarthLabStore.getState().annualOrbitDurationSeconds).toBe(60)
  })
  it('节气暂停精确落点；连续播放年末暂停，再启动从年初播放', () => {
    const store = useEarthLabStore.getState()
    store.setLearningMode('explore')
    store.setActiveModule('revolution')
    store.seekAnnualOrbitTime(Date.UTC(2026, 0, 1))
    store.setAnnualOrbitStopAtNextEvent(true)
    store.toggleAnnualOrbitPlaying()
    store.advanceAnnualOrbitTime(60000)
    expect(useEarthLabStore.getState().simulationTimeMs).toBe(getAnnualTimeline(2026).events[0]!.timeMs)
    expect(useEarthLabStore.getState().isAnnualOrbitPlaying).toBe(false)
    store.setAnnualOrbitStopAtNextEvent(false)
    store.toggleAnnualOrbitPlaying()
    store.advanceAnnualOrbitTime(60000)
    expect(useEarthLabStore.getState().simulationTimeMs).toBe(getAnnualTimeline(2026).endTimeMs)
    expect(useEarthLabStore.getState().isAnnualOrbitPlaying).toBe(false)
    store.toggleAnnualOrbitPlaying()
    expect(useEarthLabStore.getState().simulationTimeMs).toBe(Date.UTC(2026, 0, 1))
  })
})
