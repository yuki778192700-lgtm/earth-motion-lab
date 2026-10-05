import { Line } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  DirectionalLight,
  Matrix4,
  Quaternion,
  type Object3D,
  Vector3,
} from 'three'
import { EARTH_RADIUS } from '../../lib/earthCoordinates'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'
import {
  createSunDirectionVector,
  getFixedSunPosition,
  getSunlightPropagationDirection,
} from '../../domain/solar/solarDirection'
import { useEarthLabStore } from '../../store/useEarthLabStore'

const EARTH_CENTER = new Vector3(0, 0, 0)
const Y_AXIS = new Vector3(0, 1, 0)
const SUN_VISUAL_DISTANCE = 4
const SUN_RADIUS = 0.48
const RAY_OFFSETS = [-1.82, -1.08, 0, 1.08, 1.82]

interface SunRay {
  id: string
  start: Vector3
  end: Vector3
  arrow: Vector3
}

function calculateRayEnd(offset: number): Vector3 {
  const squaredDistanceFromAxis = offset * offset
  const squaredRadius = EARTH_RADIUS * EARTH_RADIUS
  const verticalOffset = Y_AXIS.clone().multiplyScalar(offset)

  if (squaredDistanceFromAxis >= squaredRadius) {
    return EARTH_CENTER.clone()
      .addScaledVector(getSunlightPropagationDirection(), 2.45)
      .add(verticalOffset)
  }

  return EARTH_CENTER.clone()
    .addScaledVector(
      createSunDirectionVector(),
      Math.sqrt(squaredRadius - squaredDistanceFromAxis) + 0.035,
    )
    .add(verticalOffset)
}

export function SunSystem() {
  const showRays = useEarthLabStore((state) => state.teachingLayers.parallelSunRays)
  const showDirection = useEarthLabStore((state) => state.teachingLayers.solarDirection)
  const lightRef = useRef<DirectionalLight>(null)
  const targetRef = useRef<Object3D>(null)
  const solarGeometry = useMemo(() => {
    const propagation = getSunlightPropagationDirection()
    const sunPosition = getFixedSunPosition(EARTH_CENTER, SUN_VISUAL_DISTANCE)
    const rayStart = sunPosition.clone().addScaledVector(propagation, SUN_RADIUS * 0.72)
    const arrowQuaternion = new Quaternion().setFromUnitVectors(Y_AXIS, propagation)
    const rays: SunRay[] = RAY_OFFSETS.map((offset) => {
        const start = rayStart.clone().addScaledVector(Y_AXIS, offset)
        const end = calculateRayEnd(offset)
        return {
          id: `sun-ray-${offset}`,
          start,
          end,
          arrow: start.clone().lerp(end, 0.54),
        }
      })
    return { arrowQuaternion, rays, sunPosition }
  }, [])
  const fixedWorldMatrix = useMemo(() => new Matrix4().identity(), [])

  useEffect(() => {
    const light = lightRef.current
    const target = targetRef.current
    if (!light || !target) return

    light.target = target
    target.updateMatrixWorld()
  }, [])

  return (
    <group name="SolarReferenceFrame" matrix={fixedWorldMatrix} matrixAutoUpdate={false}>
      <object3D ref={targetRef} position={[0, 0, 0]} />
      <directionalLight
        ref={lightRef}
        position={solarGeometry.sunPosition}
        intensity={3.2}
        color="#fff1d2"
      />

      <group position={solarGeometry.sunPosition}>
        <mesh>
          <sphereGeometry args={[SUN_RADIUS, 64, 48]} />
          <meshBasicMaterial color="#ffb52e" toneMapped={false} />
        </mesh>
        <mesh scale={1.32}>
          <sphereGeometry args={[SUN_RADIUS, 48, 32]} />
          <meshBasicMaterial
            color="#ff8a1e"
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      {showRays || showDirection ? solarGeometry.rays.map((ray) => (
        <group key={ray.id}>
          {showRays ? (
            <Line
              points={[ray.start, ray.end]}
              {...teachingOverlayStyle.lines.localSunRay}
            />
          ) : null}
          {showDirection ? (
            <mesh position={ray.arrow} quaternion={solarGeometry.arrowQuaternion}>
              <coneGeometry args={[0.045, 0.16, 14]} />
              <meshBasicMaterial
                color={teachingOverlayStyle.lines.localSunRay.color}
                transparent
                opacity={teachingOverlayStyle.opacity.localSunArrow}
                depthTest={teachingOverlayStyle.depthTest.world}
              />
            </mesh>
          ) : null}
        </group>
      )) : null}
    </group>
  )
}
