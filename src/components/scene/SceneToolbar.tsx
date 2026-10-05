import { useState } from 'react'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import type { CameraViewPreset } from '../../types/lab'
import { TeachingLayersPanel } from '../controls/TeachingLayersPanel'
import { getLabModuleRuntimeConfig } from '../../config/labModuleRegistry'

const CAMERA_PRESETS: Array<{ id: CameraViewPreset; label: string; title: string }> = [
  { id: 'default', label: '自由', title: '恢复自由观察视角' },
  { id: 'north-pole', label: '北极', title: '切换到北极上空视角' },
  { id: 'south-pole', label: '南极', title: '切换到南极上空视角' },
  { id: 'equator', label: '赤道', title: '切换到赤道侧视角' },
]

export function SceneToolbar() {
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const moduleConfig = getLabModuleRuntimeConfig(activeModuleId)
  const cameraViewPreset = useEarthLabStore((state) => state.cameraViewPreset)
  const requestCameraView = useEarthLabStore((state) => state.requestCameraView)
  const isPlaying = useEarthLabStore((state) => state.isPlaying)
  const toggleDayNightAlternation = useEarthLabStore(
    (state) => state.toggleDayNightAlternation,
  )
  const isOrbitMode = moduleConfig.scene === 'orbit'
  const isDayNightMode = moduleConfig.scene === 'day-night'
  const [layersPanelOpen, setLayersPanelOpen] = useState(false)

  return (
    <>
      <div className="scene-toolbar" aria-label="三维地球视图控制">
        <button
          type="button"
          data-active={layersPanelOpen}
          aria-expanded={layersPanelOpen}
          onClick={() => setLayersPanelOpen((open) => !open)}
          title="打开或关闭教学辅助图层控制"
        >
          教学图层
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
        {isDayNightMode ? (
          <>
            <span className="toolbar-divider" aria-hidden="true" />
            <button
              type="button"
              data-active={cameraViewPreset === 'terminator'}
              onClick={() => requestCameraView('terminator')}
              title="从垂直太阳光的方向近距离观察晨线与昏线"
            >
              晨昏线视角
            </button>
            <button
              type="button"
              data-active={cameraViewPreset === 'sun-side'}
              onClick={() => requestCameraView('sun-side')}
              title="固定为垂直于太阳—地球方向的教学侧视图"
            >
              侧视平行光
            </button>
            <button
              type="button"
              data-active={isPlaying && cameraViewPreset === 'sun-side'}
              onClick={toggleDayNightAlternation}
              title="保持太阳、光线和相机固定，按当前所选倍率播放地球自转"
            >
              {isPlaying ? '暂停昼夜交替' : '播放昼夜交替'}
            </button>
          </>
        ) : null}
      </div>
      <TeachingLayersPanel open={layersPanelOpen} />
    </>
  )
}
