import { memo, type ReactNode } from 'react'
import { EARTH_RADIUS } from '../../../lib/earthCoordinates'

interface CloudLayerProps {
  children?: ReactNode
}

const cloudVertexShader = `
  varying vec3 vCloudPosition;
  varying vec3 vViewNormal;

  void main() {
    vCloudPosition = normalize(position);
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const cloudFragmentShader = `
  varying vec3 vCloudPosition;
  varying vec3 vViewNormal;

  float hash(vec3 point) {
    point = fract(point * 0.3183099 + vec3(0.17, 0.31, 0.53));
    point *= 17.0;
    return fract(point.x * point.y * point.z * (point.x + point.y + point.z));
  }

  float noise(vec3 point) {
    vec3 cell = floor(point);
    vec3 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    return mix(
      mix(
        mix(hash(cell), hash(cell + vec3(1.0, 0.0, 0.0)), local.x),
        mix(hash(cell + vec3(0.0, 1.0, 0.0)), hash(cell + vec3(1.0, 1.0, 0.0)), local.x),
        local.y
      ),
      mix(
        mix(hash(cell + vec3(0.0, 0.0, 1.0)), hash(cell + vec3(1.0, 0.0, 1.0)), local.x),
        mix(hash(cell + vec3(0.0, 1.0, 1.0)), hash(cell + vec3(1.0, 1.0, 1.0)), local.x),
        local.y
      ),
      local.z
    );
  }

  float fbm(vec3 point) {
    float value = 0.0;
    float amplitude = 0.56;
    for (int octave = 0; octave < 4; octave++) {
      value += amplitude * noise(point);
      point = point * 2.03 + vec3(1.7, 2.9, 4.1);
      amplitude *= 0.48;
    }
    return value;
  }

  void main() {
    vec3 samplePosition = vCloudPosition * 3.7 + vec3(0.8, -1.1, 2.4);
    float cloudField = fbm(samplePosition);
    float broadBands = noise(vCloudPosition * vec3(2.2, 5.4, 2.2) + vec3(4.2, 0.7, 1.5));
    float cloudMask = smoothstep(0.58, 0.76, cloudField + broadBands * 0.16);
    float limbFade = 0.72 + 0.28 * abs(vViewNormal.z);
    float alpha = cloudMask * limbFade * 0.19;

    gl_FragColor = vec4(vec3(0.91, 0.95, 1.0), alpha);
  }
`

function ProceduralCloudShell() {
  return (
    <mesh name="ProceduralCloudShell" renderOrder={2}>
      <sphereGeometry args={[EARTH_RADIUS * 1.014, 96, 72]} />
      <shaderMaterial
        vertexShader={cloudVertexShader}
        fragmentShader={cloudFragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

/** 程序化示意云层；不表达任何日期的真实天气分布。 */
export const CloudLayer = memo(function CloudLayer({ children }: CloudLayerProps) {
  return (
    <group name="CloudLayer">
      {children ?? <ProceduralCloudShell />}
    </group>
  )
})
