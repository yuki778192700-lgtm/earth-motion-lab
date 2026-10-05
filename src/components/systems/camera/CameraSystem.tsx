import { OrbitControls } from '@react-three/drei'
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react'
import { useEarthLabStore } from '../../../store/useEarthLabStore'
import type { CameraViewPreset } from '../../../types/lab'
import { CameraController } from '../../scene/CameraController'
import { SideViewOrthographicCamera } from '../../scene/SideViewOrthographicCamera'
import { getLabModuleRuntimeConfig } from '../../../config/labModuleRegistry'

/** 相机与观察控制统一入口。OrbitControls 只改变相机。 */
export function CameraSystem() {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const moduleConfig = getLabModuleRuntimeConfig(activeModuleId)
  const cameraViewPreset = useEarthLabStore((state) => state.cameraViewPreset)
  const isDayNightMode = moduleConfig.scene === 'day-night'
  const wantsFixedSideView = isDayNightMode && cameraViewPreset === 'sun-side'
  const [orthographicSideViewReady, setOrthographicSideViewReady] = useState(false)
  const isFixedSideView = wantsFixedSideView && orthographicSideViewReady

  useEffect(() => {
    if (!wantsFixedSideView) setOrthographicSideViewReady(false)
  }, [wantsFixedSideView])

  const handleTransitionComplete = useCallback(
    (completedPreset: CameraViewPreset) => {
      setOrthographicSideViewReady(
        isDayNightMode && completedPreset === 'sun-side',
      )
    },
    [isDayNightMode],
  )

  return (
    <group name="CameraSystem">
      {isFixedSideView ? <SideViewOrthographicCamera /> : null}
      <CameraController
        controlsRef={controlsRef}
        onTransitionComplete={handleTransitionComplete}
      />
      <OrbitControls
        ref={controlsRef}
        enabled={!wantsFixedSideView}
        enableDamping
        dampingFactor={0.065}
        enablePan={false}
        rotateSpeed={0.62}
        zoomSpeed={0.75}
        minDistance={3.35}
        maxDistance={30}
        makeDefault
      />
    </group>
  )
}
