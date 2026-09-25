import { useMemo } from 'react'
import { calculateEarthOrbitState } from '../../domain/orbit/earthOrbit'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { MetricCard } from './MetricCard'

export function OrbitExperimentPanel() {
  const simulationTimeMs = useEarthLabStore((state) => state.simulationTimeMs)
  const orbit = useMemo(
    () => calculateEarthOrbitState(simulationTimeMs),
    [simulationTimeMs],
  )

  return (
    <section className="data-section orbit-experiment" aria-labelledby="orbit-data-heading">
      <h2 id="orbit-data-heading">公转实时数据</h2>
      <div className="metric-grid metric-grid-two">
        <MetricCard
          label="日地距离"
          value={orbit.distanceAu.toFixed(4)}
          unit="AU"
          accent="cyan"
        />
        <MetricCard
          label="公转速度"
          value={orbit.orbitalSpeedKmPerSecond.toFixed(2)}
          unit="km/s"
        />
        <MetricCard
          label="太阳视黄经"
          value={orbit.sunApparentLongitudeDegrees.toFixed(2)}
          unit="°"
          accent="orange"
        />
        <MetricCard
          label="轨道离心率"
          value={orbit.eccentricity.toFixed(6)}
        />
      </div>
    </section>
  )
}
