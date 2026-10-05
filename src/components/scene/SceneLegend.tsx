import { useMemo } from 'react'
import { getSceneLegend } from '../../config/sceneLegend'
import { useEarthLabStore } from '../../store/useEarthLabStore'

export function SceneLegend() {
  const activeModuleId = useEarthLabStore(state => state.activeModuleId)
  const teachingLayers = useEarthLabStore(state => state.teachingLayers)
  const isDayNightGuidedMode = useEarthLabStore(state => state.isDayNightGuidedMode)
  const dayNightStep = useEarthLabStore(state => state.dayNightStep)
  const simulationTimeMs = useEarthLabStore(state => state.simulationTimeMs)
  const observerLatitudeDegrees = useEarthLabStore(state => state.observerLatitudeDegrees)
  const entries = useMemo(() => getSceneLegend({ activeModuleId, teachingLayers, isDayNightGuidedMode, dayNightStep, simulationTimeMs, observerLatitudeDegrees }), [activeModuleId, teachingLayers, isDayNightGuidedMode, dayNightStep, simulationTimeMs, observerLatitudeDegrees])
  if (entries.length === 0) return null
  return <div className="canvas-overlay canvas-overlay-bottom reference-legend" aria-label="当前可见教学对象图例">{entries.map(entry => <span key={entry.id}><i className={`legend-line ${entry.className}`} aria-hidden="true" />{entry.label}</span>)}</div>
}
