import { Atmosphere } from '../../scene/Atmosphere'
import { AdditiveBlending } from 'three'
import { EARTH_RADIUS } from '../../../lib/earthCoordinates'
import { memo } from 'react'

const hazeVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`

const hazeFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    float rim = pow(1.0 - max(dot(vNormal, vViewDirection), 0.0), 2.1);
    vec3 hazeColor = vec3(0.14, 0.53, 0.86);
    gl_FragColor = vec4(hazeColor, rim * 0.075);
  }
`

/** 大气层系统边界，当前保持原有视觉实现。 */
export const AtmosphereLayer = memo(function AtmosphereLayer() {
  return (
    <group name="AtmosphereLayer">
      <Atmosphere />
      <mesh name="SurfaceAtmosphericHaze" scale={1.012} renderOrder={1}>
        <sphereGeometry args={[EARTH_RADIUS, 96, 64]} />
        <shaderMaterial
          vertexShader={hazeVertexShader}
          fragmentShader={hazeFragmentShader}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  )
})
