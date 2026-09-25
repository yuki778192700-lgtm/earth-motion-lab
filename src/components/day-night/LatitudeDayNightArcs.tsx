import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { calculateLatitudeArcGeometry } from '../../domain/dayNight/dayNightGeometry'
import { EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'

interface LatitudeDayNightArcsProps {
  date: Date
  latitudeDegrees: number
  showArcs: boolean
}

export function LatitudeDayNightArcs({
  date,
  latitudeDegrees,
  showArcs,
}: LatitudeDayNightArcsProps) {
  const geometry = useMemo(
    () => calculateLatitudeArcGeometry(date, latitudeDegrees),
    [date, latitudeDegrees],
  )
  const mapCoordinates = (coordinates: typeof geometry.fullLatitude, radius: number) =>
    coordinates.map((coordinate) =>
      latitudeLongitudeToVector3(
        coordinate.latitudeDegrees,
        coordinate.longitudeDegrees,
        radius,
      ),
    )
  const fullLatitude = useMemo(
    () => mapCoordinates(geometry.fullLatitude, EARTH_RADIUS * 1.022),
    [geometry.fullLatitude],
  )
  const dayArc = useMemo(
    () => mapCoordinates(geometry.dayArc, EARTH_RADIUS * 1.032),
    [geometry.dayArc],
  )
  const nightArc = useMemo(
    () => mapCoordinates(geometry.nightArc, EARTH_RADIUS * 1.032),
    [geometry.nightArc],
  )

  return (
    <group renderOrder={8}>
      <Line points={fullLatitude} color="#e2e8f0" transparent opacity={0.72} lineWidth={1.4} />
      {showArcs && dayArc.length > 1 ? (
        <Line points={dayArc} color="#fde047" lineWidth={4} />
      ) : null}
      {showArcs && nightArc.length > 1 ? (
        <Line points={nightArc} color="#a78bfa" lineWidth={4} />
      ) : null}
    </group>
  )
}
