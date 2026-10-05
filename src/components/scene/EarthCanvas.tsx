import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import { EarthScene } from './EarthScene'
import { SceneToolbar } from './SceneToolbar'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { ScenePerformanceProbe } from './ScenePerformanceProbe'
import { getLabModuleRuntimeConfig } from '../../config/labModuleRegistry'
import { SceneLegend } from './SceneLegend'

export function EarthCanvas() {
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const sceneKind = getLabModuleRuntimeConfig(activeModuleId).scene
  const isOrbitMode = sceneKind === 'orbit'
  const isDayNightMode = sceneKind === 'day-night'
  const educationOverlayMessage = useEarthLabStore((state) => state.educationOverlayMessage)

  return (
    <div className="canvas-shell">
      <Canvas
        camera={{ position: [4.2, 2.65, 5.25], fov: 36, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.04
        }}
      >
        <color attach="background" args={['#030914']} />
        <EarthScene />
        {import.meta.env.DEV ? <ScenePerformanceProbe /> : null}
      </Canvas>

      <div className="canvas-overlay canvas-overlay-top">
        <span className="eyebrow">三维观察</span>
        <strong>
          {isOrbitMode
            ? '拖动旋转 · 地轴保持空间平行 · 黄赤交角 23°26′ · 日地非等比例'
            : isDayNightMode
              ? '固定世界太阳方向 · 地球自西向东旋转 · 晨线青色 · 昏线橙色'
            : '拖动旋转 · 滚轮缩放 · 地轴倾角 23°26′ · 日地非等比例'}
        </strong>
      </div>

      <SceneToolbar />

      {educationOverlayMessage ? (
        <div className="education-scene-message">{educationOverlayMessage}</div>
      ) : null}

      <SceneLegend />
    </div>
  )
}
