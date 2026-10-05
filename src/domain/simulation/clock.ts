import { calculateSimulationAdvance, type SimulationSpeed } from './playback'

interface ClockState {
  activeModuleId?: string
  learningMode?: string
  isAnnualOrbitPlaying?: boolean
  advanceAnnualOrbitTime?: (elapsedRealMs: number) => void
  speed: SimulationSpeed
  isPlaying: boolean
  advanceSimulationTime: (elapsedSimulationMs: number) => void
}

/** Model time does not depend on WebGL rendering or requestAnimationFrame. */
export function startSimulationClock(readState: () => ClockState): () => void {
  let previousTime = performance.now()
  const timer = setInterval(() => {
    const now = performance.now()
    // Preserve the existing cap: background throttling must not cause a large jump.
    const elapsed = Math.max(0, Math.min(now - previousTime, 100))
    previousTime = now
    const state = readState()
    if (state.activeModuleId === 'revolution' && state.learningMode === 'explore' && state.isAnnualOrbitPlaying) {
      state.advanceAnnualOrbitTime?.(elapsed)
      return
    }
    const advance = calculateSimulationAdvance(elapsed, state.speed, state.isPlaying)
    if (advance > 0) state.advanceSimulationTime(advance)
  }, 1_000 / 30)
  return () => clearInterval(timer)
}
