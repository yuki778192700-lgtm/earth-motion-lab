import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'

const AXIS_RADIUS = EARTH_RADIUS * 1.48

export function EarthAxis() {
  const { north, south } = useMemo(
    () => ({
      north: latitudeLongitudeToVector3(90, 0, AXIS_RADIUS),
      south: latitudeLongitudeToVector3(-90, 0, AXIS_RADIUS),
    }),
    [],
  )

  return (
    <group renderOrder={5}>
      <Line points={[south, north]} color="#f8fafc" lineWidth={1.8} />
      <mesh position={north}>
        <coneGeometry args={[0.05, 0.18, 18]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <mesh position={south} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.05, 0.18, 18]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
    </group>
  )
}
