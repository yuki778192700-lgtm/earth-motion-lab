import { Html } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import { THERMAL_ZONES } from '../../lib/geography/thermalZones'
import { EARTH_RADIUS, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'

function createBandGeometry(south: number, north: number): BufferGeometry {
  const positions: number[] = []
  const indices: number[] = []
  const rows = 24
  const columns = 96
  for (let row = 0; row <= rows; row++) {
    for (let column = 0; column <= columns; column++) {
      const point = latitudeLongitudeToVector3(south + (north - south) * row / rows, -180 + 360 * column / columns, EARTH_RADIUS * 1.004)
      positions.push(point.x, point.y, point.z)
    }
  }
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const a = row * (columns + 1) + column
      const b = a + columns + 1
      indices.push(a, a + 1, b, a + 1, b + 1, b)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export function ThermalZoneOverlay() {
  const bands = useMemo(() => THERMAL_ZONES.map(zone => ({ ...zone, geometry: createBandGeometry(zone.south, zone.north), labelPosition: latitudeLongitudeToVector3((zone.south + zone.north) / 2, -90, EARTH_RADIUS * 1.04) })), [])
  useEffect(() => () => bands.forEach(band => band.geometry.dispose()), [bands])
  return <group name="ThermalZoneOverlay">
    {bands.map(band => <group key={band.id}>
      <mesh geometry={band.geometry} renderOrder={2}>
        <meshBasicMaterial color={band.color} transparent opacity={0.23} depthWrite={false} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      <Html position={band.labelPosition} center occlude zIndexRange={[10, 0]}>
        <span className="thermal-zone-label" style={{ color: band.color }}>{band.name}</span>
      </Html>
    </group>)}
  </group>
}
