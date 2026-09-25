import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import {
  EARTH_RADIUS,
  createLatitudePath,
  createLongitudePath,
} from '../../lib/earthCoordinates'

const GRID_RADIUS = EARTH_RADIUS * 1.006
const LATITUDES = [-75, -60, -45, -30, -15, 15, 30, 45, 60, 75]
const LONGITUDES = Array.from({ length: 24 }, (_, index) => -180 + index * 15)

export function CoordinateGrid() {
  const latitudePaths = useMemo(
    () => LATITUDES.map((latitude) => createLatitudePath(latitude, GRID_RADIUS)),
    [],
  )
  const longitudePaths = useMemo(
    () => LONGITUDES.map((longitude) => createLongitudePath(longitude, GRID_RADIUS)),
    [],
  )

  return (
    <group renderOrder={3}>
      {latitudePaths.map((points, index) => (
        <Line
          key={`grid-latitude-${LATITUDES[index]}`}
          points={points}
          color="#c8f6ff"
          transparent
          opacity={0.18}
          lineWidth={0.55}
        />
      ))}
      {longitudePaths.map((points, index) => (
        <Line
          key={`grid-longitude-${LONGITUDES[index]}`}
          points={points}
          color="#c8f6ff"
          transparent
          opacity={0.17}
          lineWidth={0.55}
        />
      ))}
    </group>
  )
}
