import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { Vector3 } from 'three'
import { EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'
import { TeachingLabel } from '../scene/TeachingLabel'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'

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
      horizonEnd: arc[0]!,
      labelPosition: arc[Math.floor(arc.length / 2)] ?? observer,
    }
  }, [latitudeDegrees, longitudeDegrees, sunDirection])

  return (
    <group renderOrder={teachingOverlayStyle.renderOrder.angle}>
      <Line points={[geometry.observer, geometry.normalEnd]} {...teachingOverlayStyle.lines.solarNoonNormal} />
      <Line points={[geometry.observer, geometry.sunlightEnd]} {...teachingOverlayStyle.lines.solarNoonRay} />
      <Line points={[geometry.observer, geometry.horizonEnd]} {...teachingOverlayStyle.lines.equatorialPlaneOutline} />
      <Line points={geometry.arc} {...teachingOverlayStyle.lines.solarNoonAngle} />
      <TeachingLabel position={geometry.labelPosition} role="altitude">
        <span className="solar-altitude-label">正午太阳高度 {altitudeDegrees.toFixed(1)}°</span>
      </TeachingLabel>
    </group>
  )
}
