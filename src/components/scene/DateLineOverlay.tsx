import { Html, Line } from '@react-three/drei'
import { useMemo } from 'react'
import { calculateDateLineCrossing } from '../../lib/geography'
import { createLongitudePath, EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'
import { useEarthLabStore } from '../../store/useEarthLabStore'

const dateFormatter = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', month: '2-digit', day: '2-digit' })

/** All geometry is Earth surface-bound, using the shared geographic coordinates. */
export function DateLineOverlay() {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const direction = useEarthLabStore(state => state.dateLineDirection)
  const progress = useEarthLabStore(state => state.dateLineProgress)
  const result = useMemo(() => calculateDateLineCrossing(direction, progress, new Date(timeMs)), [direction, progress, timeMs])
  const meridian = useMemo(() => createLongitudePath(180, EARTH_RADIUS * 1.025), [])
  const path = useMemo(() => Array.from({ length: 41 }, (_, i) => latitudeLongitudeToVector3(30, 179 + i * 0.05, EARTH_RADIUS * 1.04)), [])
  const point = useMemo(() => latitudeLongitudeToVector3(result.latitudeDegrees, result.longitudeDegrees, EARTH_RADIUS * 1.055), [result.latitudeDegrees, result.longitudeDegrees])
  const labels = useMemo(() => [
    { position: latitudeLongitudeToVector3(55, 179, EARTH_RADIUS * 1.04), text: '西侧 UTC+12', clock: result.westernSide },
    { position: latitudeLongitudeToVector3(10, -179, EARTH_RADIUS * 1.04), text: '东侧 UTC−12', clock: result.easternSide },
  ], [result.westernSide, result.easternSide])
  return <group name="TheoreticalDateLineOverlay">
    <Line points={meridian} {...teachingOverlayStyle.lines.selectedLatitude} />
    <Line points={path} {...teachingOverlayStyle.lines.rotationDirection} />
    <mesh position={point}><sphereGeometry args={[0.055, 16, 12]} /><meshBasicMaterial color={teachingOverlayStyle.lines.rotationDirection.color} toneMapped={false} /></mesh>
    <Html position={point} center occlude zIndexRange={[10, 0]}><span className="local-time-marker">跨线观察点</span></Html>
    {labels.map(label => <Html key={label.text} position={label.position} center occlude zIndexRange={[10, 0]}><span className="local-time-marker">{label.text} · {dateFormatter.format(new Date(label.clock.calendarTimeMs))}</span></Html>)}
  </group>
}
