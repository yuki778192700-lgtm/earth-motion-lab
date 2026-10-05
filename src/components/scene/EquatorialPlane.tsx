import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { DoubleSide, Vector3 } from 'three'
import { EARTH_RADIUS } from '../../lib/earthCoordinates'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'

const PLANE_RADIUS = EARTH_RADIUS * 1.38

export function EquatorialPlane() {
  const outlineStyle = teachingOverlayStyle.lines.equatorialPlaneOutline
  const outline = useMemo(
    () =>
      Array.from({ length: 129 }, (_, index) => {
        const angle = (index / 128) * Math.PI * 2
        return new Vector3(
          Math.cos(angle) * PLANE_RADIUS,
          0,
          Math.sin(angle) * PLANE_RADIUS,
        )
      }),
    [],
  )

  return (
    <group renderOrder={teachingOverlayStyle.renderOrder.plane}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[PLANE_RADIUS, 96]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={teachingOverlayStyle.surface.planeOpacity}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <Line points={outline} {...outlineStyle} />
    </group>
  )
}
