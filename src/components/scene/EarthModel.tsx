import { Atmosphere } from './Atmosphere'
import { CoordinateGrid } from './CoordinateGrid'
import { EarthAxis } from './EarthAxis'
import { EarthGlobe } from './EarthGlobe'
import { GeographicReferenceLines } from './GeographicReferenceLines'
import { EARTH_ORIENTATION_Z_RADIANS } from '../../lib/earthCoordinates'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import {
  getEarthRotationAngleRadians,
} from '../../domain/rotation/earthRotation'
import { calculateOrbitAlignedEarthRotationRadians } from '../../domain/orbit/earthOrbit'
import { RotationDirectionArrow } from './RotationDirectionArrow'
import { SelectedLatitudeRing } from './SelectedLatitudeRing'
import { EquatorialPlane } from './EquatorialPlane'

interface EarthModelProps {
  showEquatorialPlane?: boolean
  rotationModel?: 'solar' | 'orbit-aligned'
}

export function EarthModel({
  showEquatorialPlane = false,
  rotationModel = 'solar',
}: EarthModelProps) {
  const showCoordinateGrid = useEarthLabStore((state) => state.showCoordinateGrid)
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const rotatingEarthRef = useRef<Group>(null)

  useFrame(() => {
    if (!rotatingEarthRef.current) return
    const simulationTimeMs = useEarthLabStore.getState().simulationTimeMs
    rotatingEarthRef.current.rotation.y = rotationModel === 'orbit-aligned'
      ? calculateOrbitAlignedEarthRotationRadians(simulationTimeMs)
      : getEarthRotationAngleRadians(simulationTimeMs)
  })

  return (
    <group rotation={[0, 0, EARTH_ORIENTATION_Z_RADIANS]}>
      <Atmosphere />
      <EarthAxis />
      {showEquatorialPlane ? <EquatorialPlane /> : null}
      {activeModuleId === 'rotation' ? <RotationDirectionArrow /> : null}
      <group ref={rotatingEarthRef}>
        <EarthGlobe />
        {showCoordinateGrid ? <CoordinateGrid /> : null}
        <GeographicReferenceLines />
        {activeModuleId === 'rotation' ? <SelectedLatitudeRing /> : null}
      </group>
    </group>
  )
}
