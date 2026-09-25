import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import {
  EARTH_RADIUS,
  POLAR_CIRCLE_LATITUDE_DEGREES,
  TROPIC_LATITUDE_DEGREES,
  createLatitudePath,
} from '../../lib/earthCoordinates'

const REFERENCE_RADIUS = EARTH_RADIUS * 1.011

interface ReferenceLine {
  id: string
  latitude: number
  color: string
  width: number
  opacity: number
}

const REFERENCE_LINES: ReferenceLine[] = [
  { id: 'equator', latitude: 0, color: '#67e8f9', width: 1.8, opacity: 0.95 },
  {
    id: 'tropic-north',
    latitude: TROPIC_LATITUDE_DEGREES,
    color: '#fb923c',
    width: 1.25,
    opacity: 0.92,
  },
  {
    id: 'tropic-south',
    latitude: -TROPIC_LATITUDE_DEGREES,
    color: '#fb923c',
    width: 1.25,
    opacity: 0.92,
  },
  {
    id: 'polar-north',
    latitude: POLAR_CIRCLE_LATITUDE_DEGREES,
    color: '#c4b5fd',
    width: 1.15,
    opacity: 0.9,
  },
  {
    id: 'polar-south',
    latitude: -POLAR_CIRCLE_LATITUDE_DEGREES,
    color: '#c4b5fd',
    width: 1.15,
    opacity: 0.9,
  },
]

export function GeographicReferenceLines() {
  const paths = useMemo(
    () =>
      REFERENCE_LINES.map((line) => ({
        ...line,
        points: createLatitudePath(line.latitude, REFERENCE_RADIUS, 256),
      })),
    [],
  )

  return (
    <group renderOrder={4}>
      {paths.map((line) => (
        <Line
          key={line.id}
          points={line.points}
          color={line.color}
          transparent
          opacity={line.opacity}
          lineWidth={line.width}
        />
      ))}
    </group>
  )
}
