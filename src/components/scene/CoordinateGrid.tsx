import { Line } from '@react-three/drei'
import { memo, useMemo } from 'react'
import {
  EARTH_RADIUS,
  createLatitudePath,
  createLongitudePath,
} from '../../lib/earthCoordinates'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'
import { pathsToLineSegments } from '../../lib/lineSegments'

const GRID_RADIUS = EARTH_RADIUS * 1.006
const LATITUDES = [-75, -60, -45, -30, -15, 15, 30, 45, 60, 75]
const LONGITUDES = Array.from({ length: 24 }, (_, index) => -180 + index * 15)

export const CoordinateGrid = memo(function CoordinateGrid() {
  const latitudePaths = useMemo(
    () => pathsToLineSegments(LATITUDES.map((latitude) => createLatitudePath(latitude, GRID_RADIUS))),
    [],
  )
  const longitudePaths = useMemo(
    () => pathsToLineSegments(LONGITUDES.map((longitude) => createLongitudePath(longitude, GRID_RADIUS))),
    [],
  )

  return (
    <group name="LatitudeLongitudeGrid">
      <Line
        name="LatitudeGrid"
        segments
        points={latitudePaths}
        {...teachingOverlayStyle.lines.gridLatitude}
      />
      <Line
        name="LongitudeGrid"
        segments
        points={longitudePaths}
        {...teachingOverlayStyle.lines.gridLongitude}
      />
    </group>
  )
})
