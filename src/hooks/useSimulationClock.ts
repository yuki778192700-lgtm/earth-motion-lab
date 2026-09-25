import { useEffect } from 'react'
import { useEarthLabStore } from '../store/useEarthLabStore'

const MINIMUM_FRAME_INTERVAL_MS = 1_000 / 30
const MAXIMUM_FRAME_INTERVAL_MS = 100

export function useSimulationClock(): void {
  useEffect(() => {
    let animationFrameId = 0
    let previousCommitTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - previousCommitTime

      if (elapsed >= MINIMUM_FRAME_INTERVAL_MS) {
        const state = useEarthLabStore.getState()
        const boundedElapsed = Math.min(elapsed, MAXIMUM_FRAME_INTERVAL_MS)

        if (state.isPlaying) {
          state.advanceSimulationTime(boundedElapsed * state.speed)
        }

        previousCommitTime = now
      }

      animationFrameId = requestAnimationFrame(tick)
    }

    animationFrameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])
}
