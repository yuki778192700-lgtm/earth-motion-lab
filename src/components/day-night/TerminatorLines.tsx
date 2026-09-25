import { Html, Line } from '@react-three/drei'
import { useMemo } from 'react'
import { calculateTerminatorGeometry } from '../../domain/dayNight/dayNightGeometry'
import { EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'

interface TerminatorLinesProps {
  date: Date
}

export function TerminatorLines({ date }: TerminatorLinesProps) {
  const geometry = useMemo(() => calculateTerminatorGeometry(date), [date])
  const dawnPoints = useMemo(
    () =>
      geometry.dawn.map((coordinate) =>
        latitudeLongitudeToVector3(
          coordinate.latitudeDegrees,
          coordinate.longitudeDegrees,
          EARTH_RADIUS * 1.018,
        ),
      ),
    [geometry.dawn],
  )
  const duskPoints = useMemo(
    () =>
      geometry.dusk.map((coordinate) =>
        latitudeLongitudeToVector3(
          coordinate.latitudeDegrees,
          coordinate.longitudeDegrees,
          EARTH_RADIUS * 1.018,
        ),
      ),
    [geometry.dusk],
  )
  const dawnLabel = dawnPoints[Math.floor(dawnPoints.length / 2)]
  const duskLabel = duskPoints[Math.floor(duskPoints.length / 2)]

  return (
    <group renderOrder={7}>
      {dawnPoints.length > 1 ? (
        <Line points={dawnPoints} color="#22d3ee" lineWidth={2.5} />
      ) : null}
      {duskPoints.length > 1 ? (
        <Line points={duskPoints} color="#fb923c" lineWidth={2.5} />
      ) : null}
      {dawnLabel ? (
        <Html position={dawnLabel} center distanceFactor={5.5}>
          <span className="terminator-label dawn">晨线</span>
        </Html>
      ) : null}
      {duskLabel ? (
        <Html position={duskLabel} center distanceFactor={5.5}>
          <span className="terminator-label dusk">昏线</span>
        </Html>
      ) : null}
    </group>
  )
}
