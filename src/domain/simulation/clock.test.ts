import { afterEach, describe, expect, it, vi } from 'vitest'
import { startSimulationClock } from './clock'
import { SIMULATION_SPEED_OPTIONS } from './playback'

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

function setup() {
  vi.useFakeTimers()
  vi.spyOn(performance, 'now').mockImplementation(() => Date.now())
  let time = 0
  const state = { speed: 1_000 as (typeof SIMULATION_SPEED_OPTIONS)[number], isPlaying: true,
    advanceSimulationTime: (delta: number) => { time += delta } }
  return { state, readTime: () => time }
}

describe('独立模拟时钟', () => {
  it('不依赖动画帧推进，三个倍率严格为1:2:3', () => {
    const { state, readTime } = setup()
    const advances: number[] = []
    for (const speed of SIMULATION_SPEED_OPTIONS) {
      state.speed = speed
      const before = readTime()
      const stop = startSimulationClock(() => state)
      vi.advanceTimersByTime(990)
      stop()
      advances.push(readTime() - before)
    }
    expect(advances[0]).toBeGreaterThan(0)
    expect(advances[1]).toBe(advances[0]! * 2)
    expect(advances[2]).toBe(advances[0]! * 3)
  })

  it('暂停完全停止，恢复不补算暂停时段，清理后不再推进', () => {
    const { state, readTime } = setup()
    const stop = startSimulationClock(() => state)
    vi.advanceTimersByTime(99)
    const before = readTime()
    state.isPlaying = false
    vi.advanceTimersByTime(990)
    expect(readTime()).toBe(before)
    state.isPlaying = true
    vi.advanceTimersByTime(33)
    expect(readTime() - before).toBeLessThanOrEqual(34_000)
    stop()
    const stopped = readTime()
    vi.advanceTimersByTime(990)
    expect(readTime()).toBe(stopped)
  })

  it('清理再启动不会产生重复计时器', () => {
    const { state } = setup()
    startSimulationClock(() => state)()
    const stop = startSimulationClock(() => state)
    expect(vi.getTimerCount()).toBe(1)
    stop()
    expect(vi.getTimerCount()).toBe(0)
  })
})
