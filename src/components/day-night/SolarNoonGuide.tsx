import { Html, Line } from '@react-three/drei'
import { useMemo } from 'react'
import { Vector3 } from 'three'
import { EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'

interface SolarNoonGuideProps {
  latitudeDegrees: number
  longitudeDegrees: number
  sunDirection: Vector3
  altitudeDegrees: number
}

function createAltitudeArc(origin: Vector3, normal: Vector3, sunDirection: Vector3): Vector3[] {
  const tangent = sunDirection
    .clone()
    .addScaledVector(normal, -sunDirection.dot(normal))

  if (tangent.lengthSq() < 1e-8) {
    tangent.set(1, 0, 0).addScaledVector(normal, -normal.x)
  }
  tangent.normalize()

  const altitudeRadians = Math.asin(
    Math.max(-1, Math.min(1, sunDirection.dot(normal))),
  )
  const segments = 32
  const radius = 0.38

  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = (altitudeRadians * index) / segments
    return origin
      .clone()
      .add(tangent.clone().multiplyScalar(Math.cos(angle) * radius))
      .add(normal.clone().multiplyScalar(Math.sin(angle) * radius))
  })
}

export function SolarNoonGuide({
  latitudeDegrees,
  longitudeDegrees,
  sunDirection,
  altitudeDegrees,
}: SolarNoonGuideProps) {
  const geometry = useMemo(() => {
    const observer = latitudeLongitudeToVector3(
      latitudeDegrees,
      longitudeDegrees,
      EARTH_RADIUS * 1.025,
    )
    const normal = observer.clone().normalize()
    const towardSun = sunDirection.clone().normalize()
    const arc = createAltitudeArc(observer, normal, towardSun)

    return {
      observer,
      normalEnd: observer.clone().add(normal.multiplyScalar(0.78)),
      sunlightEnd: observer.clone().add(towardSun.multiplyScalar(0.78)),
      arc,
      labelPosition: arc[Math.floor(arc.length / 2)] ?? observer,
    }
  }, [latitudeDegrees, longitudeDegrees, sunDirection])

  return (
    <group renderOrder={11}>
      <Line points={[geometry.observer, geometry.normalEnd]} color="#67e8f9" lineWidth={2} />
      <Line points={[geometry.observer, geometry.sunlightEnd]} color="#facc15" lineWidth={2.4} />
      <Line points={geometry.arc} color="#fb923c" lineWidth={3} />
      <Html position={geometry.labelPosition} center distanceFactor={5.2}>
        <span className="solar-altitude-label">正午太阳高度 {altitudeDegrees.toFixed(1)}°</span>
      </Html>
    </group>
  )
}
