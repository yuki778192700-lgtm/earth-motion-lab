import { Line } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  DirectionalLight,
  MathUtils,
  type Object3D,
  Vector3,
} from 'three'
import { EARTH_RADIUS } from '../../lib/earthCoordinates'

const SUN_POSITION_X = 4
const SUN_RADIUS = 0.48
const RAY_START_X = SUN_POSITION_X - SUN_RADIUS * 0.72
const RAY_OFFSETS = [-1.82, -1.08, 0, 1.08, 1.82]

interface SunRay {
  id: string
  start: Vector3
  end: Vector3
  arrow: Vector3
}

function calculateRayEndX(offset: number): number {
  const squaredDistanceFromAxis = offset * offset
  const squaredRadius = EARTH_RADIUS * EARTH_RADIUS

  if (squaredDistanceFromAxis >= squaredRadius) {
    return -2.45
  }

  return Math.sqrt(squaredRadius - squaredDistanceFromAxis) + 0.035
}

export function SunSystem() {
  const lightRef = useRef<DirectionalLight>(null)
  const targetRef = useRef<Object3D>(null)
  const rays = useMemo<SunRay[]>(
    () =>
      RAY_OFFSETS.map((offset) => {
        const endX = calculateRayEndX(offset)
        return {
          id: `sun-ray-${offset}`,
          start: new Vector3(RAY_START_X, offset, 0),
          end: new Vector3(endX, offset, 0),
          arrow: new Vector3(MathUtils.lerp(RAY_START_X, endX, 0.54), offset, 0),
        }
      }),
    [],
  )

  useEffect(() => {
    const light = lightRef.current
    const target = targetRef.current
    if (!light || !target) return

    light.target = target
    target.updateMatrixWorld()
  }, [])

  return (
    <group>
      <object3D ref={targetRef} position={[0, 0, 0]} />
      <directionalLight
        ref={lightRef}
        position={[SUN_POSITION_X, 0, 0]}
        intensity={3.2}
        color="#fff1d2"
      />

      <group position={[SUN_POSITION_X, 0, 0]}>
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

      {rays.map((ray) => (
        <group key={ray.id}>
          <Line
            points={[ray.start, ray.end]}
            color="#fbbf24"
            transparent
            opacity={0.48}
            lineWidth={1.15}
          />
          <mesh position={ray.arrow} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.045, 0.16, 14]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.78} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
