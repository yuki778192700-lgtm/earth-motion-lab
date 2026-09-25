import { Html, Line } from '@react-three/drei'
import { useMemo } from 'react'
import { Vector3 } from 'three'
import { EARTH_AXIAL_TILT_RADIANS } from '../../lib/earthCoordinates'

const GUIDE_HEIGHT = 1.72
const ARC_RADIUS = 1.25

export function ObliquityIndicator() {
  const { arc, labelPosition } = useMemo(() => {
    const points = Array.from({ length: 33 }, (_, index) => {
      const angle = Math.PI / 2 - (EARTH_AXIAL_TILT_RADIANS * index) / 32
      return new Vector3(Math.cos(angle) * ARC_RADIUS, Math.sin(angle) * ARC_RADIUS, 0)
    })
    const labelAngle = Math.PI / 2 - EARTH_AXIAL_TILT_RADIANS / 2

    return {
      arc: points,
      labelPosition: new Vector3(
        Math.cos(labelAngle) * (ARC_RADIUS + 0.3),
        Math.sin(labelAngle) * (ARC_RADIUS + 0.3),
        0,
      ),
    }
  }, [])

  return (
    <group renderOrder={8}>
      <Line
        points={[new Vector3(0, -GUIDE_HEIGHT, 0), new Vector3(0, GUIDE_HEIGHT, 0)]}
        color="#fbbf24"
        transparent
        opacity={0.72}
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.07}
      />
      <Line points={arc} color="#fbbf24" lineWidth={2} />
      <Html position={labelPosition} center distanceFactor={10}>
        <span className="obliquity-label">23°26′</span>
      </Html>
    </group>
  )
}
