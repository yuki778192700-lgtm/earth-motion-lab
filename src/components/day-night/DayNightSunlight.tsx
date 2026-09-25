import { Html, Line } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import { DirectionalLight, Quaternion, type Object3D, Vector3 } from 'three'

const Y_AXIS = new Vector3(0, 1, 0)

interface DayNightSunlightProps {
  sunDirection: Vector3
  showRays: boolean
}

export function DayNightSunlight({ sunDirection, showRays }: DayNightSunlightProps) {
  const lightRef = useRef<DirectionalLight>(null)
  const targetRef = useRef<Object3D>(null)
  const rays = useMemo(() => {
    const towardEarth = sunDirection.clone().normalize().multiplyScalar(-1)
    const lateral = new Vector3().crossVectors(towardEarth, Y_AXIS).normalize()
    const quaternion = new Quaternion().setFromUnitVectors(Y_AXIS, towardEarth)

    return [-1.55, -0.78, 0, 0.78, 1.55].map((offset) => {
      const offsetVector = lateral.clone().multiplyScalar(offset)
      const start = sunDirection.clone().normalize().multiplyScalar(4.6).add(offsetVector)
      const end = sunDirection.clone().normalize().multiplyScalar(1.75).add(offsetVector)
      return {
        start,
        end,
        arrow: start.clone().lerp(end, 0.55),
        quaternion,
      }
    })
  }, [sunDirection])

  useEffect(() => {
    const light = lightRef.current
    const target = targetRef.current
    if (!light || !target) return
    light.target = target
    target.updateMatrixWorld()
  }, [sunDirection])

  return (
    <group>
      <object3D ref={targetRef} />
      <directionalLight
        ref={lightRef}
        position={sunDirection.clone().normalize().multiplyScalar(5)}
        intensity={3.2}
        color="#fff1d2"
      />

      {showRays ? (
        <group>
          {rays.map((ray, index) => (
            <group key={index}>
              <Line
                points={[ray.start, ray.end]}
                color="#fbbf24"
                transparent
                opacity={0.62}
                lineWidth={1.2}
              />
              <mesh position={ray.arrow} quaternion={ray.quaternion}>
                <coneGeometry args={[0.045, 0.16, 14]} />
                <meshBasicMaterial color="#fbbf24" toneMapped={false} />
              </mesh>
            </group>
          ))}
          <Html position={sunDirection.clone().normalize().multiplyScalar(3.65)} center distanceFactor={6}>
            <span className="sunlight-label">太阳光线</span>
          </Html>
        </group>
      ) : null}
    </group>
  )
}
