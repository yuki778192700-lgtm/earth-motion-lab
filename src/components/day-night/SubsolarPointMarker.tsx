import { useMemo } from 'react'
import { Quaternion, Vector3 } from 'three'
import { EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'
import { TeachingLabel } from '../scene/TeachingLabel'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'

interface SubsolarPointMarkerProps {
  latitudeDegrees: number
  longitudeDegrees: number
}

const Z_AXIS = new Vector3(0, 0, 1)

export function SubsolarPointMarker({
  latitudeDegrees,
  longitudeDegrees,
}: SubsolarPointMarkerProps) {
  const position = useMemo(
    () =>
      latitudeLongitudeToVector3(
        latitudeDegrees,
        longitudeDegrees,
        EARTH_RADIUS * 1.025,
      ),
    [latitudeDegrees, longitudeDegrees],
  )
  const orientation = useMemo(
    () => new Quaternion().setFromUnitVectors(Z_AXIS, position.clone().normalize()),
    [position],
  )

  return (
    <group position={position} quaternion={orientation} renderOrder={teachingOverlayStyle.renderOrder.marker}>
      <mesh>
        <sphereGeometry args={[0.047, 24, 16]} />
        <meshBasicMaterial color="#facc15" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -0.004]}>
        <ringGeometry args={[0.075, 0.094, 48]} />
        <meshBasicMaterial
          color="#fde047"
          transparent
          opacity={teachingOverlayStyle.marker.opacity}
          depthTest={teachingOverlayStyle.marker.depthTest}
          depthWrite={false}
        />
      </mesh>
      <TeachingLabel position={[0, 0, 0.04]} role="subsolar">
        <span className="subsolar-label">太阳直射点</span>
      </TeachingLabel>
    </group>
  )
}
