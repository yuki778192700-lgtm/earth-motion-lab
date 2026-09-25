import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import { Color, Vector3 } from 'three'
import { EARTH_RADIUS } from '../../lib/earthCoordinates'

const vertexShader = `
  varying vec3 vLocalNormal;

  void main() {
    vLocalNormal = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform vec3 uSunDirection;
  uniform vec3 uDayColor;
  uniform vec3 uNightColor;
  varying vec3 vLocalNormal;

  void main() {
    float illumination = dot(normalize(vLocalNormal), normalize(uSunDirection));
    float boundary = smoothstep(-0.018, 0.018, illumination);
    vec3 color = mix(uNightColor, uDayColor, boundary);
    float alpha = mix(0.34, 0.055, boundary);
    gl_FragColor = vec4(color, alpha);
  }
`

interface IlluminationHemispheresProps {
  sunDirection: Vector3
}

export function IlluminationHemispheres({ sunDirection }: IlluminationHemispheresProps) {
  const uniforms = useMemo(
    () => ({
      uSunDirection: { value: sunDirection.clone().normalize() },
      uDayColor: { value: new Color('#fbbf24') },
      uNightColor: { value: new Color('#020617') },
    }),
    [sunDirection],
  )

  return (
    <group>
      <mesh renderOrder={2}>
        <sphereGeometry args={[EARTH_RADIUS * 1.008, 96, 72]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
      <Html position={sunDirection.clone().normalize().multiplyScalar(1.72)} center distanceFactor={5.5}>
        <span className="hemisphere-label day">昼半球</span>
      </Html>
      <Html position={sunDirection.clone().normalize().multiplyScalar(-1.72)} center distanceFactor={5.5}>
        <span className="hemisphere-label night">夜半球</span>
      </Html>
    </group>
  )
}
