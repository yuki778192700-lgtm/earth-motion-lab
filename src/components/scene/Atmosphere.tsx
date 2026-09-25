import { AdditiveBlending, BackSide } from 'three'
import { EARTH_RADIUS } from '../../lib/earthCoordinates'

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDirection = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDirection), 0.0), 3.0);
    vec3 atmosphereColor = vec3(0.12, 0.68, 1.0);
    gl_FragColor = vec4(atmosphereColor, fresnel * 0.5);
  }
`

export function Atmosphere() {
  return (
    <mesh scale={1.065} renderOrder={1}>
      <sphereGeometry args={[EARTH_RADIUS, 96, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={BackSide}
        blending={AdditiveBlending}
      />
    </mesh>
  )
}
