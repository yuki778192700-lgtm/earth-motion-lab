import { useMemo } from 'react'
import { calculateEarthOrbitState } from '../../domain/orbit/earthOrbit'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { MetricCard } from './MetricCard'
import { calculateHemisphereSeasons } from '../../domain/solar/hemisphereSeasons'

export function OrbitExperimentPanel() {
  const simulationTimeMs = useEarthLabStore((state) => state.simulationTimeMs)
  const activeModuleId = useEarthLabStore(state => state.activeModuleId)
  const seasons = useMemo(() => activeModuleId === 'revolution' ? calculateHemisphereSeasons(simulationTimeMs, 0) : null, [activeModuleId, simulationTimeMs])
  const orbit = useMemo(
    () => calculateEarthOrbitState(simulationTimeMs),
    [simulationTimeMs],
  )

  return (
    <section className="data-section orbit-experiment" aria-labelledby="orbit-data-heading">
      <h2 id="orbit-data-heading">公转实时数据</h2>
      <p>为观察公转，地表自转已暂停。这是教学简化：真实地球在公转的同时也在自转。</p>
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
      {seasons ? <div className="orbit-annual-season-data" aria-label="当前日期周年变化">
        <p>太阳直射纬度：{Math.abs(seasons.declinationDegrees).toFixed(3)}°{seasons.declinationDegrees >= 0 ? 'N' : 'S'}</p>
        <p>北半球：{seasons.north.season} · 南半球：{seasons.south.season}（天文季节）</p>
        <p>季节按二分二至时刻划分，不代表各地气候季节。地轴空间方向不随公转改变。</p>
      </div> : null}
    </section>
  )
}
