import { Line } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import { createAnnualSubsolarModel } from '../../domain/solar/annualSubsolarModel'
import { createLatitudePath, EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'
import { subsolarAnnualStyle } from '../../config/subsolarAnnualStyle'

export function SubsolarLatitudeRange({ year, latitudeDegrees }: { year: number; latitudeDegrees: number }) {
  const range = useMemo(() => createAnnualSubsolarModel(year), [year])
  const geometry = useMemo(() => {
    const positions: number[] = []
    const indices: number[] = []
    const rows = 8
    const columns = 96
    for (let row = 0; row <= rows; row++) for (let column = 0; column <= columns; column++) {
      const latitude = range.southLimitDegrees + (range.northLimitDegrees - range.southLimitDegrees) * row / rows
      const point = latitudeLongitudeToVector3(latitude, -180 + 360 * column / columns, EARTH_RADIUS * 1.006)
      positions.push(point.x, point.y, point.z)
    }
    for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) {
      const a = row * (columns + 1) + column
      const b = a + columns + 1
      indices.push(a, a + 1, b, a + 1, b + 1, b)
    }
    const band = new BufferGeometry()
    band.setAttribute('position', new Float32BufferAttribute(positions, 3))
    band.setIndex(indices)
    return band
  }, [range])
  useEffect(() => () => geometry.dispose(), [geometry])
  const latitudeLine = useMemo(() => createLatitudePath(latitudeDegrees, EARTH_RADIUS * 1.018), [latitudeDegrees])
  return <group name="SubsolarLatitudeRange">
    <mesh geometry={geometry} renderOrder={subsolarAnnualStyle.renderOrder}><meshBasicMaterial color={subsolarAnnualStyle.rangeColor} transparent opacity={subsolarAnnualStyle.rangeOpacity} depthTest={subsolarAnnualStyle.depthTest} depthWrite={false} /></mesh>
    <Line points={latitudeLine} {...teachingOverlayStyle.lines.selectedLatitude} />
  </group>
}
