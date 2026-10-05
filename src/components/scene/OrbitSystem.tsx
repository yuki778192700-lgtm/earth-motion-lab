import { Html, Line } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  DirectionalLight,
  DoubleSide,
  Quaternion,
  type Object3D,
  Vector3,
} from 'three'
import {
  calculateEarthOrbitState,
  calculateSeasonalEvents,
  createOrbitPathForYear,
  ORBIT_SCENE_SCALE,
} from '../../domain/orbit/earthOrbit'
import { EARTH_RADIUS } from '../../lib/earthCoordinates'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { EarthModel } from './EarthModel'
import { ObliquityIndicator } from './ObliquityIndicator'
import { teachingOverlayStyle } from '../../config/teachingOverlayStyle'

const SUN_RADIUS = 0.7
const EARTH_VISUAL_SCALE = 0.55
const EARTH_VISUAL_RADIUS = EARTH_RADIUS * EARTH_VISUAL_SCALE
const Y_AXIS = new Vector3(0, 1, 0)

function OrbitDirectionArrow({ position, tangent }: { position: Vector3; tangent: Vector3 }) {
  const quaternion = useMemo(
    () => new Quaternion().setFromUnitVectors(Y_AXIS, tangent.clone().normalize()),
    [tangent],
  )

  return (
    <mesh position={position} quaternion={quaternion}>
      <coneGeometry args={[0.105, 0.38, 20]} />
      <meshBasicMaterial color={teachingOverlayStyle.lines.terminatorDusk.color} toneMapped={false} />
    </mesh>
  )
}

interface OrbitSunProps {
  earthPosition: Vector3
  showRays: boolean
  showDirection: boolean
}

function OrbitSun({ earthPosition, showRays, showDirection }: OrbitSunProps) {
  const lightRef = useRef<DirectionalLight>(null)
  const targetRef = useRef<Object3D>(null)
  const rays = useMemo(() => {
    const direction = earthPosition.clone().normalize()
    const lateral = new Vector3(-direction.z, 0, direction.x).normalize()

    return [-1.25, -0.62, 0, 0.62, 1.25].map((offset) => {
      const displacedEarth = earthPosition.clone().addScaledVector(lateral, offset)
      return {
        start: displacedEarth.clone().addScaledVector(direction, -2.65),
        end: displacedEarth.clone().addScaledVector(direction, -EARTH_VISUAL_RADIUS * 0.9),
        arrow: displacedEarth.clone().addScaledVector(direction, -1.55),
        direction,
      }
    })
  }, [earthPosition])

  useEffect(() => {
    const light = lightRef.current
    const target = targetRef.current
    if (!light || !target) return

    light.target = target
    target.updateMatrixWorld()
  }, [earthPosition])

  return (
    <group>
      <object3D ref={targetRef} position={earthPosition} />
      <directionalLight
        ref={lightRef}
        position={[0, 0, 0]}
        intensity={3.1}
        color="#fff1d2"
      />
      <pointLight position={[0, 0, 0]} intensity={8} distance={3.5} color="#ffb347" />

      <mesh>
        <sphereGeometry args={[SUN_RADIUS, 64, 48]} />
        <meshBasicMaterial color="#ffb52e" toneMapped={false} />
      </mesh>
      <mesh scale={1.45}>
        <sphereGeometry args={[SUN_RADIUS, 48, 32]} />
        <meshBasicMaterial
          color="#ff8a1e"
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {showRays || showDirection ? rays.map((ray, index) => {
        const quaternion = new Quaternion().setFromUnitVectors(Y_AXIS, ray.direction)
        return (
          <group key={index}>
            {showRays ? (
              <Line
                points={[ray.start, ray.end]}
                {...teachingOverlayStyle.lines.orbitSunRay}
              />
            ) : null}
            {showDirection ? (
              <mesh position={ray.arrow} quaternion={quaternion}>
                <coneGeometry args={[0.045, 0.16, 14]} />
                <meshBasicMaterial
                  color={teachingOverlayStyle.lines.orbitSunRay.color}
                  transparent
                  opacity={teachingOverlayStyle.opacity.orbitSunArrow}
                  depthTest={teachingOverlayStyle.depthTest.world}
                />
              </mesh>
            ) : null}
          </group>
        )
      }) : null}
    </group>
  )
}

export function OrbitSystem() {
  const simulationTimeMs = useEarthLabStore((state) => state.simulationTimeMs)
  const teachingLayers = useEarthLabStore((state) => state.teachingLayers)
  const year = new Date(simulationTimeMs).getUTCFullYear()
  const orbitState = useMemo(
    () => calculateEarthOrbitState(simulationTimeMs),
    [simulationTimeMs],
  )
  const earthPosition = useMemo(
    () => new Vector3(...orbitState.scenePosition),
    [orbitState.scenePosition],
  )
  const orbitPath = useMemo(
    () => createOrbitPathForYear(year).map((state) => new Vector3(...state.scenePosition)),
    [year],
  )
  const seasonalMarkers = useMemo(
    () =>
      calculateSeasonalEvents(year).map((event) => ({
        ...event,
        position: new Vector3(...calculateEarthOrbitState(event.timeMs).scenePosition),
      })),
    [year],
  )
  const directionArrows = useMemo(
    () =>
      [42, 132, 222, 312].map((index) => {
        const position = orbitPath[index] ?? new Vector3()
        const nextPosition = orbitPath[index + 2] ?? position
        return {
          position: position.clone(),
          tangent: nextPosition.clone().sub(position),
        }
      }),
    [orbitPath],
  )

  return (
    <group>
      <OrbitSun
        earthPosition={earthPosition}
        showRays={teachingLayers.parallelSunRays}
        showDirection={teachingLayers.solarDirection}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[ORBIT_SCENE_SCALE * 1.12, 128]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={teachingOverlayStyle.surface.orbitPlaneOpacity}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <Line points={orbitPath} {...teachingOverlayStyle.lines.orbitPath} />

      {directionArrows.map((arrow, index) => (
        <OrbitDirectionArrow key={index} position={arrow.position} tangent={arrow.tangent} />
      ))}

      {seasonalMarkers.map((marker) => (
        <group key={marker.id} position={marker.position}>
          <mesh>
            <sphereGeometry args={[0.075, 16, 12]} />
            <meshBasicMaterial color="#67e8f9" toneMapped={false} />
          </mesh>
          <Html position={[0, 0.38, 0]} center distanceFactor={13} zIndexRange={[3, 0]}>
            <span className="orbit-marker-label" style={{ fontSize: teachingOverlayStyle.labelSize.default }}>{marker.label}</span>
          </Html>
        </group>
      ))}

      <group position={earthPosition}>
        <group scale={EARTH_VISUAL_SCALE}>
          <EarthModel showEquatorialPlane rotationModel="fixed" />
        </group>
        {teachingLayers.angleIndicators ? <ObliquityIndicator /> : null}
      </group>
    </group>
  )
}
