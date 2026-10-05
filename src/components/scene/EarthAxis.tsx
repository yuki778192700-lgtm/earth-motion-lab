import { Line } from '@react-three/drei'
import { memo, useMemo } from 'react'
import { EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'

const AXIS_RADIUS = EARTH_RADIUS * 1.48

export const EarthAxis = memo(function EarthAxis() {
  const style = teachingOverlayStyle.lines.axis
  const { north, south } = useMemo(
    () => ({
      north: latitudeLongitudeToVector3(90, 0, AXIS_RADIUS),
      south: latitudeLongitudeToVector3(-90, 0, AXIS_RADIUS),
    }),
    [],
  )

  return (
    <group name="EarthAxis" renderOrder={style.renderOrder}>
      <Line points={[south, north]} {...style} />
      <mesh position={north}>
        <coneGeometry args={[0.05, 0.18, 18]} />
        <meshBasicMaterial color={style.color} transparent opacity={style.opacity} depthTest={style.depthTest} />
      </mesh>
      <mesh position={south} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.05, 0.18, 18]} />
        <meshBasicMaterial color={style.color} transparent opacity={style.opacity} depthTest={style.depthTest} />
      </mesh>
    </group>
  )
})
