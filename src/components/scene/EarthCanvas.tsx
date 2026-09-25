import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import { EarthScene } from './EarthScene'
import { SceneToolbar } from './SceneToolbar'
import { useEarthLabStore } from '../../store/useEarthLabStore'

export function EarthCanvas() {
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const isOrbitMode = activeModuleId === 'revolution'
  const isDayNightMode = activeModuleId === 'day-night' || activeModuleId === 'terminator'
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
        <fog attach="fog" args={isOrbitMode ? ['#030914', 18, 38] : ['#030914', 8, 16]} />
        <EarthScene />
      </Canvas>

      <div className="canvas-overlay canvas-overlay-top">
        <span className="eyebrow">三维观察</span>
        <strong>
          {isOrbitMode
            ? '拖动旋转 · 地轴保持空间平行 · 黄赤交角 23°26′ · 日地非等比例'
            : isDayNightMode
              ? '拖动旋转 · 日期与晨昏线同步 · 晨线青色 · 昏线橙色'
            : '拖动旋转 · 滚轮缩放 · 地轴倾角 23°26′ · 日地非等比例'}
        </strong>
      </div>

      <SceneToolbar />

      {educationOverlayMessage ? (
        <div className="education-scene-message">{educationOverlayMessage}</div>
      ) : null}

      <div className="canvas-overlay canvas-overlay-bottom reference-legend">
        {isOrbitMode ? (
          <>
            <span><i className="legend-line orbit" />公转轨道</span>
            <span><i className="legend-line ecliptic" />黄道面</span>
            <span><i className="legend-line equator" />赤道面</span>
            <span><i className="legend-line axis" />地轴</span>
            <span><i className="legend-line sunlight" />平行太阳光</span>
          </>
        ) : isDayNightMode ? (
          <>
            <span><i className="legend-line day-arc" />昼弧</span>
            <span><i className="legend-line night-arc" />夜弧</span>
            <span><i className="legend-line dawn-line" />晨线</span>
            <span><i className="legend-line dusk-line" />昏线</span>
            <span><i className="legend-line sunlight" />平行太阳光</span>
          </>
        ) : (
          <>
            <span><i className="legend-line axis" />地轴</span>
            <span><i className="legend-line equator" />赤道</span>
            <span><i className="legend-line tropic" />南北回归线 23°26′</span>
            <span><i className="legend-line polar" />南北极圈 66°34′</span>
            <span><i className="legend-line selected-latitude" />所选纬线</span>
            <span><i className="legend-line sunlight" />平行太阳光</span>
          </>
        )}
      </div>
    </div>
  )
}
