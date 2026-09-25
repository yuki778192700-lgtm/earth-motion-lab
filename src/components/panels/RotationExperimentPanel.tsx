import { useMemo } from 'react'
import { calculateEarthRotationMetrics } from '../../domain/rotation/earthRotation'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { MetricCard } from './MetricCard'

const wholeNumberFormatter = new Intl.NumberFormat('zh-CN', {
  maximumFractionDigits: 0,
})

const decimalFormatter = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function formatLatitude(latitudeDegrees: number): string {
  if (latitudeDegrees === 0) return '0°（赤道）'
  return `${Math.abs(latitudeDegrees)}°${latitudeDegrees > 0 ? 'N' : 'S'}`
}

export function RotationExperimentPanel() {
  const observerLatitudeDegrees = useEarthLabStore(
    (state) => state.observerLatitudeDegrees,
  )
  const setObserverLatitude = useEarthLabStore((state) => state.setObserverLatitude)
  const metrics = useMemo(
    () => calculateEarthRotationMetrics(observerLatitudeDegrees),
    [observerLatitudeDegrees],
  )

  return (
    <section className="data-section rotation-experiment" aria-labelledby="rotation-data-heading">
      <div className="rotation-heading-row">
        <h2 id="rotation-data-heading">自转实验 · 选择纬度</h2>
        <output htmlFor="latitude-selector">{formatLatitude(observerLatitudeDegrees)}</output>
      </div>

      <input
        id="latitude-selector"
        className="latitude-range"
        type="range"
        min="-90"
        max="90"
        step="1"
        value={observerLatitudeDegrees}
        aria-label="选择计算纬度"
        onChange={(event) => setObserverLatitude(Number(event.target.value))}
      />
      <div className="latitude-scale" aria-hidden="true">
        <span>90°S</span>
        <span>赤道</span>
        <span>90°N</span>
      </div>

      <div className="metric-grid rotation-metric-grid">
        <MetricCard
          label="纬线半径"
          value={wholeNumberFormatter.format(metrics.parallelRadiusKm)}
          unit="km"
          accent="cyan"
        />
        <MetricCard
          label="自转角速度"
          value={metrics.angularVelocityDegreesPerHour.toFixed(0)}
          unit="°/h"
          note="各纬度相同 · 7.2722×10⁻⁵ rad/s"
        />
        <MetricCard
          label="自转线速度"
          value={decimalFormatter.format(metrics.linearVelocityKmPerHour)}
          unit="km/h"
          accent="orange"
        />
      </div>
      <p className="rotation-formula">rφ = R cosφ　·　vφ = ωrφ</p>
    </section>
  )
}
