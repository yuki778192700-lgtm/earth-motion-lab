import { afterEach, expect, it } from 'vitest'
import { useEarthLabStore } from './useEarthLabStore'

afterEach(() => useEarthLabStore.getState().resetSimulation())
it('移动和切换跨线方向不修改UTC、自转速度或地方时偏移', () => {
  const before = useEarthLabStore.getState()
  before.setDateLineProgress(1)
  before.setDateLineDirection('west')
  const after = useEarthLabStore.getState()
  expect(after.dateLineProgress).toBe(0)
  expect(after.dateLineDirection).toBe('west')
  expect(after.simulationTimeMs).toBe(before.simulationTimeMs)
  expect(after.speed).toBe(before.speed)
  expect(after.localTimeOffsetA).toBe(before.localTimeOffsetA)
  before.resetSimulation()
  expect(useEarthLabStore.getState().dateLineDirection).toBe('east')
})
it('无效进度不写入全局状态', () => {
  expect(() => useEarthLabStore.getState().setDateLineProgress(2)).toThrow()
  expect(useEarthLabStore.getState().dateLineProgress).toBe(0)
})
