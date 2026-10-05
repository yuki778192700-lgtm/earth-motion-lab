import { afterEach, expect, it } from 'vitest'
import { useEarthLabStore } from './useEarthLabStore'

afterEach(() => useEarthLabStore.getState().resetSimulation())

it('两地偏移独立，切换不改变UTC，重置恢复默认', () => {
  const state = useEarthLabStore.getState()
  const time = state.simulationTimeMs
  state.setLocalTimeOffset('A', 345)
  state.setLocalTimeOffset('B', -210)
  expect(useEarthLabStore.getState().localTimeOffsetA).toBe(345)
  expect(useEarthLabStore.getState().localTimeOffsetB).toBe(-210)
  expect(useEarthLabStore.getState().simulationTimeMs).toBe(time)
  state.resetSimulation()
  expect(useEarthLabStore.getState().localTimeOffsetA).toBe(0)
  expect(useEarthLabStore.getState().localTimeOffsetB).toBe(480)
})

it('无效偏移不写入状态', () => {
  expect(() => useEarthLabStore.getState().setLocalTimeOffset('A', 841)).toThrow()
  expect(useEarthLabStore.getState().localTimeOffsetA).toBe(0)
})
