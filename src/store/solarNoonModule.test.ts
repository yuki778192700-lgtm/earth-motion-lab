import { afterEach, expect, it } from 'vitest'
import { useEarthLabStore } from './useEarthLabStore'

afterEach(() => { useEarthLabStore.getState().setActiveModule('rotation'); useEarthLabStore.getState().resetSimulation() })
it('正午太阳高度模块自动启用量角，离开不污染其他模块', () => {
  const state = useEarthLabStore.getState()
  const timeMs = state.simulationTimeMs
  state.setActiveModule('solar-altitude')
  expect(useEarthLabStore.getState().showSolarNoonGuide).toBe(true)
  expect(useEarthLabStore.getState().teachingLayers.angleIndicators).toBe(true)
  expect(useEarthLabStore.getState().simulationTimeMs).toBe(timeMs)
  state.resetSimulation()
  expect(useEarthLabStore.getState().showSolarNoonGuide).toBe(true)
  state.setActiveModule('day-night')
  expect(useEarthLabStore.getState().showSolarNoonGuide).toBe(false)
})
