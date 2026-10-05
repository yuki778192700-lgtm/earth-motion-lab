import { TEACHING_LAYER_OPTIONS } from '../../config/teachingLayers'
import { useEarthLabStore } from '../../store/useEarthLabStore'

interface TeachingLayersPanelProps {
  open: boolean
}

export function TeachingLayersPanel({ open }: TeachingLayersPanelProps) {
  const teachingLayers = useEarthLabStore((state) => state.teachingLayers)
  const toggleTeachingLayer = useEarthLabStore((state) => state.toggleTeachingLayer)

  if (!open) return null

  return (
    <section className="teaching-layers-panel" aria-label="教学图层控制">
      <div className="teaching-layers-heading">
        <strong>Teaching Layers</strong>
        <span>教学辅助几何</span>
      </div>
      <div className="teaching-layers-grid">
        {TEACHING_LAYER_OPTIONS.map((option) => (
          <label key={option.id}>
            <input
              type="checkbox"
              checked={teachingLayers[option.id]}
              onChange={() => toggleTeachingLayer(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </section>
  )
}
