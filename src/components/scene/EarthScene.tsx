import { OrbitControls, Stars } from '@react-three/drei'
import { Suspense, useRef, type ComponentRef } from 'react'
import { CameraController } from './CameraController'
import { EarthModel } from './EarthModel'
import { SunSystem } from './SunSystem'
import { OrbitSystem } from './OrbitSystem'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { DayNightScene } from '../day-night/DayNightScene'

function EarthLoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1.45, 48, 32]} />
      <meshStandardMaterial color="#0b5870" roughness={0.9} wireframe />
    </mesh>
  )
}

export function EarthScene() {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const isOrbitMode = activeModuleId === 'revolution'
  const isDayNightMode = activeModuleId === 'day-night' || activeModuleId === 'terminator'

  return (
    <>
      <ambientLight intensity={0.035} />
      {!isOrbitMode && !isDayNightMode ? <SunSystem /> : null}
      <Stars radius={55} depth={30} count={1900} factor={2.2} saturation={0.1} fade speed={0.12} />

      <Suspense fallback={<EarthLoadingFallback />}>
        {isOrbitMode ? (
          <OrbitSystem />
        ) : isDayNightMode ? (
          <DayNightScene />
        ) : (
          <EarthModel />
        )}
      </Suspense>

      <CameraController controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.065}
        enablePan={false}
        rotateSpeed={0.62}
        zoomSpeed={0.75}
        minDistance={3.35}
        maxDistance={30}
        makeDefault
      />
    </>
  )
}
