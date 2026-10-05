import { Html, Line } from '@react-three/drei'
import { useMemo } from 'react'
import { localTimeStyle } from '../../config/localTimeStyle'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'
import { createLongitudePath, EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'
import { useEarthLabStore } from '../../store/useEarthLabStore'

function MeridianMarker({ point, longitude }: { point: 'A' | 'B'; longitude: number }) {
  const style = localTimeStyle[point]
  const geometry = useMemo(() => ({
    line: createLongitudePath(longitude, EARTH_RADIUS * 1.02),
    marker: latitudeLongitudeToVector3(style.latitudeDegrees, longitude, EARTH_RADIUS * 1.035),
  }), [longitude, style.latitudeDegrees])
  return <group name={`LocalTimeMeridian${point}`}>
    <Line points={geometry.line} {...teachingOverlayStyle.lines.selectedLatitude} color={style.color} />
    <mesh position={geometry.marker}>
      <sphereGeometry args={[0.045, 16, 12]} />
      <meshBasicMaterial color={style.color} toneMapped={false} />
    </mesh>
    <Html position={geometry.marker} center occlude zIndexRange={[10, 0]}>
      <span className="local-time-marker" style={{ color: style.color }}>{point}</span>
    </Html>
  </group>
}

/** 位于地表自转组内，太阳参考系仍在独立世界坐标组中。 */
export function LocalTimeOverlay() {
  const a = useEarthLabStore(state => state.localTimeLongitudeA)
  const b = useEarthLabStore(state => state.localTimeLongitudeB)
  return <group name="LocalTimeOverlay"><MeridianMarker point="A" longitude={a} /><MeridianMarker point="B" longitude={b} /></group>
}
