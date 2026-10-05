import { useEffect } from 'react'
import { startSimulationClock } from '../domain/simulation/clock'
import { useEarthLabStore } from '../store/useEarthLabStore'

export function useSimulationClock(): void {
  useEffect(() => startSimulationClock(useEarthLabStore.getState), [])
}
