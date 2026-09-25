import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { EARTH_RADIUS, createLatitudePath } from '../../lib/earthCoordinates'
import { useEarthLabStore } from '../../store/useEarthLabStore'

export function SelectedLatitudeRing() {
  const observerLatitudeDegrees = useEarthLabStore(
    (state) => state.observerLatitudeDegrees,
  )
  const points = useMemo(
    () => createLatitudePath(observerLatitudeDegrees, EARTH_RADIUS * 1.016, 256),
    [observerLatitudeDegrees],
  )

  return (
    <Line
      points={points}
      color="#a3e635"
      transparent
      opacity={0.98}
      lineWidth={2.1}
      renderOrder={6}
    />
  )
}
