import { Stars } from '@react-three/drei'
import { Suspense } from 'react'
import { SunSystem } from './SunSystem'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { CameraSystem } from '../systems/camera/CameraSystem'
import { getLabModuleRuntimeConfig } from '../../config/labModuleRegistry'
import { ModuleSceneRouter } from './ModuleSceneRouter'
import { getDayNightVisualStyle } from '../../config/dayNightVisualStyle'
import { useSolarSideTeachingView } from '../../hooks/useSolarSideTeachingView'

function EarthLoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1.45, 48, 32]} />
      <meshStandardMaterial color="#0b5870" roughness={0.9} wireframe />
    </mesh>
  )
}

export function EarthScene() {
  const visualStyle = getDayNightVisualStyle(useSolarSideTeachingView())
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const moduleConfig = getLabModuleRuntimeConfig(activeModuleId)
  const usesStandaloneSun = moduleConfig.scene === 'earth' || moduleConfig.scene === 'planned'

  return (
    <>
      <ambientLight intensity={moduleConfig.scene === 'day-night' ? visualStyle.ambientIntensity : 0.035} />
      {usesStandaloneSun ? <SunSystem /> : null}
      <Stars radius={55} depth={30} count={1900} factor={2.2} saturation={0.1} fade speed={0.12} />

      <Suspense fallback={<EarthLoadingFallback />}>
        <ModuleSceneRouter config={moduleConfig} />
      </Suspense>

      <CameraSystem />
    </>
  )
}
