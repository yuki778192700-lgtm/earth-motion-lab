import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { SRGBColorSpace } from 'three'
import { EARTH_RADIUS } from '../../lib/earthCoordinates'

const EARTH_TEXTURE_PATH = '/textures/earth-blue-marble-2048.png'

export function EarthGlobe() {
  const texture = useTexture(EARTH_TEXTURE_PATH)
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    texture.needsUpdate = true
  }, [gl, texture])

  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[EARTH_RADIUS, 128, 96]} />
      <meshStandardMaterial map={texture} roughness={0.82} metalness={0} />
    </mesh>
  )
}

useTexture.preload(EARTH_TEXTURE_PATH)
