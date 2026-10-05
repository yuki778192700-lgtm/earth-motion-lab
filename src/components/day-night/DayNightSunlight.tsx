import { Html, Line } from '@react-three/drei'
import { memo, useEffect, useMemo, useRef } from 'react'
import { DirectionalLight, Matrix4, Quaternion, type Object3D, Vector3 } from 'three'
import {
  createParallelSunRaySegments,
  DAY_NIGHT_EARTH_CENTER,
} from '../../domain/dayNight/solarReferenceFrame'
import {
  getFixedSunPosition,
  getSunlightPropagationDirection,
} from '../../domain/solar/solarDirection'
import { useAdaptiveHtmlDistanceFactor } from './useAdaptiveHtmlDistanceFactor'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'

const Y_AXIS = new Vector3(0, 1, 0)

function fixedEarthCenter(): Vector3 {
  return new Vector3(
    DAY_NIGHT_EARTH_CENTER.x,
    DAY_NIGHT_EARTH_CENTER.y,
    DAY_NIGHT_EARTH_CENTER.z,
  )
}

interface SolarReferenceFrameProps {
  showRays: boolean
  showDirectionIndicator: boolean
}

/**
 * 固定世界坐标太阳参考系。
 * 该组件绝不能成为 EarthSystem 的子对象，也不读取相机或地球自转角。
 */
export const SolarReferenceFrame = memo(function SolarReferenceFrame({
  showRays,
  showDirectionIndicator,
}: SolarReferenceFrameProps) {
  const lightRef = useRef<DirectionalLight>(null)
  const targetRef = useRef<Object3D>(null)
  const rays = useMemo(() => createParallelSunRaySegments(), [])
  const propagationDirection = useMemo(() => getSunlightPropagationDirection(), [])
  const arrowQuaternion = useMemo(
    () => new Quaternion().setFromUnitVectors(Y_AXIS, propagationDirection),
    [propagationDirection],
  )
  const lightPosition = useMemo(
    () => getFixedSunPosition(fixedEarthCenter(), 8),
    [],
  )
  const targetPosition = useMemo(() => fixedEarthCenter(), [])
  const fixedWorldMatrix = useMemo(() => new Matrix4().identity(), [])
  const labelDistanceFactor = useAdaptiveHtmlDistanceFactor(7.5)

  useEffect(() => {
    const light = lightRef.current
    const target = targetRef.current
    if (!light || !target) return
    light.target = target
    light.updateMatrixWorld()
    target.updateMatrixWorld()
  }, [])

  return (
    <group
      name="SolarReferenceFrame"
      matrix={fixedWorldMatrix}
      matrixAutoUpdate={false}
    >
      <object3D ref={targetRef} name="SunLightTarget" position={targetPosition} />
      <directionalLight
        ref={lightRef}
        name="FixedWorldSunlight"
        position={lightPosition}
        intensity={3.15}
        color="#fff4d8"
      />

      {showRays ? (
        <group name="ParallelSunRays">
          {rays.map((ray, index) => (
            <group key={index}>
              <Line
                points={[ray.start, ray.end]}
                {...(index === 4
                  ? teachingOverlayStyle.lines.sunRayPrimary
                  : teachingOverlayStyle.lines.sunRaySecondary)}
              />
              {showDirectionIndicator && index % 2 === 0 ? (
                <mesh
                  position={ray.arrowPosition}
                  quaternion={arrowQuaternion}
                  renderOrder={teachingOverlayStyle.renderOrder.sunlight}
                >
                  <coneGeometry args={[0.034, 0.13, 12]} />
                  <meshBasicMaterial
                    color="#f6d77a"
                    transparent
                    opacity={teachingOverlayStyle.opacity.sunlightArrow}
                    toneMapped={false}
                    depthWrite={false}
                  />
                </mesh>
              ) : null}
            </group>
          ))}

        </group>
      ) : null}

      {showDirectionIndicator ? (
        <group name="SunDirectionIndicator">
          <mesh position={[-5.32, 0, -0.12]}>
            <sphereGeometry args={[0.24, 32, 24]} />
            <meshBasicMaterial color="#f8c95c" toneMapped={false} />
          </mesh>
          <Html position={[-4.2, 0.52, 0]} center distanceFactor={labelDistanceFactor} zIndexRange={[3, 0]}>
            <span className="sunlight-label" style={{ fontSize: teachingOverlayStyle.labelSize.default }}>太阳方向 · 光线平行传播</span>
          </Html>
        </group>
      ) : null}
    </group>
  )
})
