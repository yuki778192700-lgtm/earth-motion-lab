import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import { EARTH_RADIUS, createLatitudePath } from '../../lib/earthCoordinates'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'

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
      {...teachingOverlayStyle.lines.selectedLatitude}
    />
  )
}
