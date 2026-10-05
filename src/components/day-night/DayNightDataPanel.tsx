import { useMemo } from 'react'
import { calculateDayNightModel } from '../../domain/dayNight/dayNightModel'
import {
  calculateObserverLightingState,
  type ObserverLightingState,
} from '../../domain/dayNight/solarReferenceFrame'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { MetricCard } from '../panels/MetricCard'
import { GuidedExplanation } from './GuidedExplanation'

function formatLatitude(latitudeDegrees: number): string {
  if (latitudeDegrees === 0) return '0°'
  return `${Math.abs(latitudeDegrees)}°${latitudeDegrees > 0 ? 'N' : 'S'}`
}

function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  const wholeHours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${wholeHours}时${String(minutes).padStart(2, '0')}分`
}

function formatSolarTime(hours: number | null, emptyLabel: string): string {
  if (hours === null) return emptyLabel
  const totalMinutes = Math.round(hours * 60)
  const normalizedMinutes = ((totalMinutes % 1_440) + 1_440) % 1_440
  const hour = Math.floor(normalizedMinutes / 60)
  const minute = normalizedMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const OBSERVER_STATE_LABELS: Record<ObserverLightingState, string> = {
  day: '白昼',
  night: '黑夜',
  sunrise: '日出附近（动画提示）',
  sunset: '日落附近（动画提示）',
  horizon: '地平线边界',
}

export function DayNightDataPanel() {
  const simulationTimeMs = useEarthLabStore((state) => state.simulationTimeMs)
  const latitudeDegrees = useEarthLabStore((state) => state.observerLatitudeDegrees)
  const longitudeDegrees = useEarthLabStore((state) => state.observerLongitudeDegrees)
  const showObserverMarker = useEarthLabStore((state) => state.showDayNightObserverMarker)
  const setLatitude = useEarthLabStore((state) => state.setObserverLatitude)
  const toggleObserverMarker = useEarthLabStore(
    (state) => state.toggleDayNightObserverMarker,
  )
  const isGuidedMode = useEarthLabStore((state) => state.isDayNightGuidedMode)
  const step = useEarthLabStore((state) => state.dayNightStep)
  const model = useMemo(
    () => calculateDayNightModel(new Date(simulationTimeMs), latitudeDegrees),
    [latitudeDegrees, simulationTimeMs],
  )
  const showMetrics = !isGuidedMode || step >= 6
  const polarLabel =
    model.polarState === 'polar-day'
      ? '极昼'
      : model.polarState === 'polar-night'
        ? '极夜'
        : '正常昼夜交替'
  const observerLightingState = useMemo(
    () =>
      calculateObserverLightingState(
        new Date(simulationTimeMs),
        latitudeDegrees,
        longitudeDegrees,
      ),
    [latitudeDegrees, longitudeDegrees, simulationTimeMs],
  )

  return (
    <>
      <GuidedExplanation />

      <section className="data-section day-night-latitude" aria-labelledby="day-night-latitude-heading">
        <div className="rotation-heading-row">
          <h2 id="day-night-latitude-heading">选择纬度</h2>
          <output htmlFor="day-night-latitude-selector">{formatLatitude(latitudeDegrees)}</output>
        </div>
        <input
          id="day-night-latitude-selector"
          className="latitude-range"
          type="range"
          min="-90"
          max="90"
          step="1"
          value={latitudeDegrees}
          onChange={(event) => setLatitude(Number(event.target.value))}
          aria-label="选择昼夜实验纬度"
        />
        <div className="latitude-scale" aria-hidden="true">
          <span>90°S</span><span>0°</span><span>90°N</span>
        </div>
        <div className="day-night-status" data-state={model.polarState}>
          <span>当前状态</span>
          <strong>{polarLabel}</strong>
        </div>
        <div className="observer-marker-control">
          <span>
            观察点 {formatLatitude(latitudeDegrees)}，{longitudeDegrees}°E
          </span>
          <strong data-state={observerLightingState}>
            {OBSERVER_STATE_LABELS[observerLightingState]}
          </strong>
          <button
            type="button"
            aria-pressed={showObserverMarker}
            onClick={toggleObserverMarker}
          >
            {showObserverMarker ? '隐藏 Marker' : '显示 Marker'}
          </button>
        </div>
      </section>

      <section className="data-section day-night-metrics" aria-labelledby="day-night-metrics-heading">
        <h2 id="day-night-metrics-heading">昼夜长短</h2>
        {showMetrics ? (
          <div className="metric-grid metric-grid-two">
            <MetricCard label="昼长" value={formatDuration(model.daylightHours)} accent="orange" />
            <MetricCard label="夜长" value={formatDuration(model.nightHours)} />
            <MetricCard
              label="日出（地方太阳时）"
              value={formatSolarTime(model.sunriseSolarHours, '无日出')}
              accent="cyan"
            />
            <MetricCard
              label="日落（地方太阳时）"
              value={formatSolarTime(model.sunsetSolarHours, '无日落')}
            />
          </div>
        ) : (
          <p className="metrics-locked">完成至 Step 6 后显示计算结果。</p>
        )}
      </section>
    </>
  )
}
