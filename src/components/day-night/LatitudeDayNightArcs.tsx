import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { calculateLatitudeArcGeometry } from '../../domain/dayNight/dayNightGeometry'
import { EARTH_RADIUS, createLatitudePath, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'

interface LatitudeDayNightArcsProps {
  date: Date
  latitudeDegrees: number
  showDayArc: boolean
  showNightArc: boolean
}

export function LatitudeDayNightArcs({
  date,
  latitudeDegrees,
  showDayArc,
  showNightArc,
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
    () => createLatitudePath(latitudeDegrees, EARTH_RADIUS * 1.022),
    [latitudeDegrees],
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
    <group renderOrder={teachingOverlayStyle.renderOrder.arcs}>
      <Line points={fullLatitude} {...teachingOverlayStyle.lines.latitudeGuide} />
      {showDayArc && dayArc.length > 1 ? (
        <Line points={dayArc} {...teachingOverlayStyle.lines.dayArc} />
      ) : null}
      {showNightArc && nightArc.length > 1 ? (
        <Line points={nightArc} {...teachingOverlayStyle.lines.nightArc} />
      ) : null}
    </group>
  )
}
