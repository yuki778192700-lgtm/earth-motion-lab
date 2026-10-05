import { CoordinateGrid } from './CoordinateGrid'
import { EarthAxis } from './EarthAxis'
import { GeographicReferenceLines } from './GeographicReferenceLines'
import { EARTH_ORIENTATION_Z_RADIANS } from '../../lib/earthCoordinates'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { getEarthSurfaceRotationRadians, type EarthSurfaceRotationModel } from '../../domain/rotation/earthSurfacePose'
import { RotationDirectionArrow } from './RotationDirectionArrow'
import { SelectedLatitudeRing } from './SelectedLatitudeRing'
import { EquatorialPlane } from './EquatorialPlane'
import { EarthSystem } from '../systems/earth/EarthSystem'
import { TeachingOverlaySystem } from '../systems/teaching/TeachingOverlaySystem'
import { ThermalZoneOverlay } from './ThermalZoneOverlay'
import { LocalTimeOverlay } from './LocalTimeOverlay'
import { DateLineOverlay } from './DateLineOverlay'

interface EarthModelProps {
  showEquatorialPlane?: boolean
  rotationModel?: EarthSurfaceRotationModel
}

export function EarthModel({
  showEquatorialPlane = false,
  rotationModel = 'solar',
}: EarthModelProps) {
  const teachingLayers = useEarthLabStore((state) => state.teachingLayers)
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const rotatingEarthRef = useRef<Group>(null)
  const rotatingOverlayRef = useRef<Group>(null)
  const lastRotationTimeMs = useRef<number | null>(null)
  const lastRotationModel = useRef(rotationModel)

  useFrame(() => {
    if (!rotatingEarthRef.current) return
    const simulationTimeMs = useEarthLabStore.getState().simulationTimeMs
    if (lastRotationTimeMs.current === simulationTimeMs && lastRotationModel.current === rotationModel) return
    const rotationRadians = getEarthSurfaceRotationRadians(simulationTimeMs, rotationModel)
    rotatingEarthRef.current.rotation.y = rotationRadians
    if (rotatingOverlayRef.current) rotatingOverlayRef.current.rotation.y = rotationRadians
    lastRotationTimeMs.current = simulationTimeMs
    lastRotationModel.current = rotationModel
  })

  return (
    <group rotation={[0, 0, EARTH_ORIENTATION_Z_RADIANS]}>
      <EarthSystem surfaceRef={rotatingEarthRef} />
      <TeachingOverlaySystem
        surfaceRef={rotatingOverlayRef}
        earthFixed={
          <>
            {activeModuleId === 'climate-zones' ? <ThermalZoneOverlay /> : null}
            {teachingLayers.earthAxis ? <EarthAxis /> : null}
            {showEquatorialPlane ? <EquatorialPlane /> : null}
            {activeModuleId === 'rotation' ? <RotationDirectionArrow /> : null}
          </>
        }
        surfaceBound={
          <>
            {activeModuleId === 'local-time' ? <LocalTimeOverlay /> : null}
            {activeModuleId === 'date-line' ? <DateLineOverlay /> : null}
            {teachingLayers.coordinateGrid ? <CoordinateGrid /> : null}
            <GeographicReferenceLines
              showEquator={teachingLayers.equator}
              showTropics={teachingLayers.tropics}
              showPolarCircles={teachingLayers.polarCircles}
            />
            {activeModuleId === 'rotation' || activeModuleId === 'climate-zones' ? <SelectedLatitudeRing /> : null}
          </>
        }
      />
    </group>
  )
}
