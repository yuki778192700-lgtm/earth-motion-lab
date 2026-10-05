import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'
import type { ObserverLightingState } from '../../domain/dayNight/solarReferenceFrame'
import { EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'
import { TeachingLabel } from '../scene/TeachingLabel'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'
import { useSolarSideTeachingView } from '../../hooks/useSolarSideTeachingView'

const Z_AXIS = new Vector3(0, 0, 1)

const STATE_LABELS: Record<ObserverLightingState, string> = {
  day: '白昼',
  night: '黑夜',
  sunrise: '日出附近',
  sunset: '日落附近',
  horizon: '地平线边界',
}

interface ObserverMarkerProps {
  latitudeDegrees: number
  longitudeDegrees: number
  lightingState: ObserverLightingState
}

export function ObserverMarker({
  latitudeDegrees,
  longitudeDegrees,
  lightingState,
}: ObserverMarkerProps) {
  const isSideView = useSolarSideTeachingView()
  const position = useMemo(
    () =>
      latitudeLongitudeToVector3(
        latitudeDegrees,
        longitudeDegrees,
        EARTH_RADIUS * 1.035,
      ),
    [latitudeDegrees, longitudeDegrees],
  )
  const orientation = useMemo(
    () => new Quaternion().setFromUnitVectors(Z_AXIS, position.clone().normalize()),
    [position],
  )

  return (
    <group
      name="EarthBoundObserverMarker"
      position={position}
      quaternion={orientation}
      renderOrder={teachingOverlayStyle.renderOrder.observer}
    >
      <mesh>
        <sphereGeometry args={[0.052, 24, 16]} />
        <meshBasicMaterial color="#f8fafc" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.004]}>
        <ringGeometry args={[0.082, 0.108, 48]} />
        <meshBasicMaterial
          color={lightingState === 'night' ? '#a78bfa' : '#facc15'}
          transparent
          opacity={teachingOverlayStyle.marker.opacity}
          depthTest={teachingOverlayStyle.marker.depthTest}
          depthWrite={false}
        />
      </mesh>
      <TeachingLabel position={[0, 0, 0.04]} role="observer" hidden={isSideView}>
        <span
          className="observer-marker-label"
          data-state={lightingState}
        >
          观察点 · {STATE_LABELS[lightingState]}
        </span>
      </TeachingLabel>
    </group>
  )
}
