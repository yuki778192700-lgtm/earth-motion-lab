import { useEarthLabStore } from '../../store/useEarthLabStore'
import type { CameraViewPreset } from '../../types/lab'

const CAMERA_PRESETS: Array<{ id: CameraViewPreset; label: string; title: string }> = [
  { id: 'default', label: '重置', title: '恢复默认观察视角' },
  { id: 'north-pole', label: '北极', title: '切换到北极上空视角' },
  { id: 'south-pole', label: '南极', title: '切换到南极上空视角' },
  { id: 'equator', label: '赤道', title: '切换到赤道侧视角' },
]

export function SceneToolbar() {
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const showCoordinateGrid = useEarthLabStore((state) => state.showCoordinateGrid)
  const cameraViewPreset = useEarthLabStore((state) => state.cameraViewPreset)
  const toggleCoordinateGrid = useEarthLabStore((state) => state.toggleCoordinateGrid)
  const requestCameraView = useEarthLabStore((state) => state.requestCameraView)
  const isOrbitMode = activeModuleId === 'revolution'

  return (
    <div className="scene-toolbar" aria-label="三维地球视图控制">
      <button
        type="button"
        className="grid-toggle"
        aria-pressed={showCoordinateGrid}
        onClick={toggleCoordinateGrid}
        title="显示或隐藏经纬网"
      >
        <span className="grid-icon" aria-hidden="true">⊕</span>
        经纬网
      </button>
      <span className="toolbar-divider" aria-hidden="true" />
      {CAMERA_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          data-active={cameraViewPreset === preset.id}
          onClick={() => requestCameraView(preset.id)}
          title={isOrbitMode && preset.id === 'north-pole' ? '从北黄极上空观察公转方向' : preset.title}
        >
          {isOrbitMode && preset.id === 'north-pole'
            ? '北黄极'
            : isOrbitMode && preset.id === 'south-pole'
              ? '南黄极'
              : preset.label}
        </button>
      ))}
    </div>
  )
}
