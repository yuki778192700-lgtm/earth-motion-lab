import { Line } from '@react-three/drei'
import { memo, useMemo } from 'react'
import {
  EARTH_RADIUS,
  POLAR_CIRCLE_LATITUDE_DEGREES,
  TROPIC_LATITUDE_DEGREES,
  createLatitudePath,
} from '../../lib/earthCoordinates'
import { teachingOverlayStyle, type TeachingLineStyle } from '../../config/teachingOverlayStyle'

const REFERENCE_RADIUS = EARTH_RADIUS * 1.011

interface ReferenceLine {
  id: string
  kind: 'equator' | 'tropic' | 'polarCircle'
  latitude: number
  style: TeachingLineStyle
}

const REFERENCE_LINES: ReferenceLine[] = [
  { id: 'equator', kind: 'equator', latitude: 0, style: teachingOverlayStyle.lines.equator },
  {
    id: 'tropic-north',
    kind: 'tropic',
    latitude: TROPIC_LATITUDE_DEGREES,
    style: teachingOverlayStyle.lines.tropic,
  },
  {
    id: 'tropic-south',
    kind: 'tropic',
    latitude: -TROPIC_LATITUDE_DEGREES,
    style: teachingOverlayStyle.lines.tropic,
  },
  {
    id: 'polar-north',
    kind: 'polarCircle',
    latitude: POLAR_CIRCLE_LATITUDE_DEGREES,
    style: teachingOverlayStyle.lines.polarCircle,
  },
  {
    id: 'polar-south',
    kind: 'polarCircle',
    latitude: -POLAR_CIRCLE_LATITUDE_DEGREES,
    style: teachingOverlayStyle.lines.polarCircle,
  },
]

interface GeographicReferenceLinesProps {
  showEquator?: boolean
  showTropics?: boolean
  showPolarCircles?: boolean
}

export const GeographicReferenceLines = memo(function GeographicReferenceLines({
  showEquator = true,
  showTropics = true,
  showPolarCircles = true,
}: GeographicReferenceLinesProps) {
  const paths = useMemo(
    () =>
      REFERENCE_LINES.map((line) => ({
        ...line,
        points: createLatitudePath(line.latitude, REFERENCE_RADIUS, 256),
      })),
    [],
  )

  return (
    <group name="GeographicReferenceLines">
      {paths.filter((line) =>
        (line.kind === 'equator' && showEquator) ||
        (line.kind === 'tropic' && showTropics) ||
        (line.kind === 'polarCircle' && showPolarCircles),
      ).map((line) => (
        <Line
          key={line.id}
          points={line.points}
          {...line.style}
        />
      ))}
    </group>
  )
})
