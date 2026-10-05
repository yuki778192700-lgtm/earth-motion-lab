import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { SRGBColorSpace } from 'three'
import { EARTH_RADIUS } from '../../lib/earthCoordinates'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { getLabModuleRuntimeConfig } from '../../config/labModuleRegistry'
import { getDayNightVisualStyle } from '../../config/dayNightVisualStyle'
import { useSolarSideTeachingView } from '../../hooks/useSolarSideTeachingView'
import { EARTH_LABEL_OCCLUDER_NAME } from '../../config/teachingLabelStyle'

const EARTH_TEXTURE_PATH = '/textures/earth-blue-marble-2048.png'

export function EarthGlobe() {
  const visualStyle = getDayNightVisualStyle(useSolarSideTeachingView())
  const isDayNight = useEarthLabStore(state => getLabModuleRuntimeConfig(state.activeModuleId).scene === 'day-night')
  const texture = useTexture(EARTH_TEXTURE_PATH)
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    texture.needsUpdate = true
  }, [gl, texture])

  return (
    <mesh name={EARTH_LABEL_OCCLUDER_NAME} castShadow receiveShadow>
      <sphereGeometry args={[EARTH_RADIUS, 128, 96]} />
      <meshPhysicalMaterial
        map={texture}
        roughness={0.76}
        metalness={0}
        clearcoat={0.08}
        clearcoatRoughness={0.72}
        emissiveMap={texture}
        emissive="#16263b"
        emissiveIntensity={isDayNight ? visualStyle.surfaceEmissiveIntensity : 0.12}
      />
    </mesh>
  )
}

useTexture.preload(EARTH_TEXTURE_PATH)
