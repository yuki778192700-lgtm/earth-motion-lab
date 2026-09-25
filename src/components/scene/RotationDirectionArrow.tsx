import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { MathUtils, Quaternion, Vector3 } from 'three'
import { EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'

const ARROW_RADIUS = EARTH_RADIUS * 1.22
const START_LONGITUDE = -55
const END_LONGITUDE = 225

export function RotationDirectionArrow() {
  const { points, arrowPosition, arrowQuaternion } = useMemo(() => {
    const arcPoints = Array.from({ length: 121 }, (_, index) => {
      const longitude =
        START_LONGITUDE + (index / 120) * (END_LONGITUDE - START_LONGITUDE)
      return latitudeLongitudeToVector3(0, longitude, ARROW_RADIUS)
    })
    const longitudeRadians = MathUtils.degToRad(END_LONGITUDE)
    const tangent = new Vector3(
      -Math.sin(longitudeRadians),
      0,
      -Math.cos(longitudeRadians),
    ).normalize()
    const quaternion = new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      tangent,
    )

    return {
      points: arcPoints,
      arrowPosition: arcPoints[arcPoints.length - 1]!,
      arrowQuaternion: quaternion,
    }
  }, [])

  return (
    <group renderOrder={7}>
      <Line
        points={points}
        color="#fbbf24"
        transparent
        opacity={0.9}
        lineWidth={2.4}
      />
      <mesh position={arrowPosition} quaternion={arrowQuaternion}>
        <coneGeometry args={[0.075, 0.24, 20]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
    </group>
  )
}
