import { Html } from '@react-three/drei'
import { memo, useMemo } from 'react'
import { Color, Vector3 } from 'three'
import {
  DAY_NIGHT_EARTH_CENTER,
} from '../../domain/dayNight/solarReferenceFrame'
import { createSunDirectionVector } from '../../domain/solar/solarDirection'
import { EARTH_RADIUS } from '../../lib/earthCoordinates'
import { useAdaptiveHtmlDistanceFactor } from './useAdaptiveHtmlDistanceFactor'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'
import { DAY_NIGHT_VISUAL_STYLE, getDayNightVisualStyle } from '../../config/dayNightVisualStyle'
import { useSolarSideTeachingView } from '../../hooks/useSolarSideTeachingView'

const vertexShader = `
  varying vec3 vWorldNormal;

  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform vec3 uSunDirection;
  uniform vec3 uDayColor;
  uniform vec3 uNightColor;
  uniform float uBoundaryWidth;
  uniform float uNightOpacity;
  uniform float uDayOpacity;
  varying vec3 vWorldNormal;

  void main() {
    float illumination = dot(normalize(vWorldNormal), normalize(uSunDirection));
    float boundary = smoothstep(-uBoundaryWidth, uBoundaryWidth, illumination);
    vec3 color = mix(uNightColor, uDayColor, boundary);
    float alpha = mix(uNightOpacity, uDayOpacity, boundary);
    gl_FragColor = vec4(color, alpha);
  }
`

export const IlluminationHemispheres = memo(function IlluminationHemispheres() {
  const isSideView = useSolarSideTeachingView()
  const visualStyle = getDayNightVisualStyle(isSideView)
  const labelDistanceFactor = useAdaptiveHtmlDistanceFactor(5.5)
  const sunDirection = useMemo(
    () => createSunDirectionVector(),
    [],
  )
  const earthCenter = useMemo(
    () =>
      new Vector3(
        DAY_NIGHT_EARTH_CENTER.x,
        DAY_NIGHT_EARTH_CENTER.y,
        DAY_NIGHT_EARTH_CENTER.z,
      ),
    [],
  )
  const uniforms = useMemo(
    () => ({
      uSunDirection: { value: sunDirection.clone().normalize() },
      uDayColor: { value: new Color('#fbbf24') },
      uNightColor: { value: new Color('#06172d') },
      uBoundaryWidth: { value: DAY_NIGHT_VISUAL_STYLE.boundaryDotHalfWidth },
      uNightOpacity: { value: visualStyle.nightOverlayOpacity },
      uDayOpacity: { value: visualStyle.dayOverlayOpacity },
    }),
    [sunDirection, visualStyle],
  )

  return (
    <group name="WorldIlluminationReference">
      <mesh position={earthCenter} renderOrder={2}>
        <sphereGeometry args={[EARTH_RADIUS * DAY_NIGHT_VISUAL_STYLE.overlayRadiusFactor, 96, 72]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
      <Html
        position={earthCenter.clone().addScaledVector(sunDirection, isSideView ? 0.8 : 1.72).add(new Vector3(0, isSideView ? 1.85 : 0, 0))}
        center
        distanceFactor={labelDistanceFactor}
        zIndexRange={[3, 0]}
      >
        <span className="hemisphere-label day" style={{ fontSize: teachingOverlayStyle.labelSize.default }}>昼半球</span>
      </Html>
      <Html
        position={earthCenter.clone().addScaledVector(sunDirection, isSideView ? -0.8 : -1.72).add(new Vector3(0, isSideView ? 1.85 : 0, 0))}
        center
        distanceFactor={labelDistanceFactor}
        zIndexRange={[3, 0]}
      >
        <span className="hemisphere-label night" style={{ fontSize: teachingOverlayStyle.labelSize.default }}>夜半球</span>
      </Html>
    </group>
  )
})
