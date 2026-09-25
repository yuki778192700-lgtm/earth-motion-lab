import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type ComponentRef, type RefObject } from 'react'
import { Vector3 } from 'three'
import { earthLocalToWorld } from '../../lib/earthCoordinates'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import type { CameraViewPreset } from '../../types/lab'

interface CameraControllerProps {
  controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>
}

interface CameraPose {
  position: Vector3
  up: Vector3
  target: Vector3
}

interface CameraTransition {
  elapsed: number
  startPosition: Vector3
  startUp: Vector3
  startTarget: Vector3
  targetPosition: Vector3
  targetUp: Vector3
  targetTarget: Vector3
}

const CAMERA_DISTANCE = 5.7
const TRANSITION_DURATION = 0.72

function getOrbitCameraPose(preset: CameraViewPreset, cameraDistance: number): CameraPose {
  const systemDistance = cameraDistance * 3.7

  switch (preset) {
    case 'north-pole':
      return {
        position: new Vector3(0, systemDistance * 1.16, 0.001),
        up: new Vector3(0, 0, -1),
        target: new Vector3(),
      }
    case 'south-pole':
      return {
        position: new Vector3(0, -systemDistance * 1.16, 0.001),
        up: new Vector3(0, 0, 1),
        target: new Vector3(),
      }
    case 'equator':
      return {
        position: new Vector3(0, 2.4, systemDistance),
        up: new Vector3(0, 1, 0),
        target: new Vector3(),
      }
    case 'default':
      return {
        position: new Vector3(0.82, 0.52, 1).normalize().multiplyScalar(systemDistance),
        up: new Vector3(0, 1, 0),
        target: new Vector3(),
      }
  }
}

function getEarthCameraPose(
  preset: CameraViewPreset,
  cameraDistance: number,
  earthTarget = new Vector3(),
): CameraPose {
  switch (preset) {
    case 'north-pole':
      return {
        position: earthLocalToWorld(new Vector3(0, cameraDistance, 0)).add(earthTarget),
        up: earthLocalToWorld(new Vector3(1, 0, 0)).normalize(),
        target: earthTarget,
      }
    case 'south-pole':
      return {
        position: earthLocalToWorld(new Vector3(0, -cameraDistance, 0)).add(earthTarget),
        up: earthLocalToWorld(new Vector3(1, 0, 0)).normalize(),
        target: earthTarget,
      }
    case 'equator':
      return {
        position: new Vector3(0, 0.2, cameraDistance).add(earthTarget),
        up: new Vector3(0, 1, 0),
        target: earthTarget,
      }
    case 'default': {
      const target = new Vector3(1.5, 0, 0)
      const systemDistance = cameraDistance * 1.75
      return {
        position: new Vector3(0.55, 0.31, 1)
          .normalize()
          .multiplyScalar(systemDistance)
          .add(target),
        up: new Vector3(0, 1, 0),
        target,
      }
    }
  }
}

function getDayNightCameraPose(preset: CameraViewPreset, cameraDistance: number): CameraPose {
  if (preset !== 'default') {
    return getEarthCameraPose(preset, cameraDistance, new Vector3())
  }

  return {
    position: new Vector3(0.72, 0.44, 1).normalize().multiplyScalar(cameraDistance),
    up: new Vector3(0, 1, 0),
    target: new Vector3(),
  }
}

export function CameraController({ controlsRef }: CameraControllerProps) {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const cameraViewPreset = useEarthLabStore((state) => state.cameraViewPreset)
  const cameraViewRequestId = useEarthLabStore((state) => state.cameraViewRequestId)
  const activeModuleId = useEarthLabStore((state) => state.activeModuleId)
  const transition = useRef<CameraTransition | null>(null)
  const currentTarget = useRef(new Vector3())

  useEffect(() => {
    const canvasAspect = size.width / Math.max(size.height, 1)
    const responsiveDistance = CAMERA_DISTANCE * Math.max(1, 1 / canvasAspect)
    const pose = activeModuleId === 'revolution'
      ? getOrbitCameraPose(cameraViewPreset, responsiveDistance)
      : activeModuleId === 'day-night' || activeModuleId === 'terminator'
        ? getDayNightCameraPose(cameraViewPreset, responsiveDistance)
        : getEarthCameraPose(cameraViewPreset, responsiveDistance)
    transition.current = {
      elapsed: 0,
      startPosition: camera.position.clone(),
      startUp: camera.up.clone(),
      startTarget: controlsRef.current?.target.clone() ?? new Vector3(),
      targetPosition: pose.position,
      targetUp: pose.up,
      targetTarget: pose.target,
    }

    if (controlsRef.current) {
      controlsRef.current.enabled = false
    }
  }, [activeModuleId, camera, cameraViewPreset, cameraViewRequestId, controlsRef, size.height, size.width])

  useFrame((_, delta) => {
    const activeTransition = transition.current
    if (!activeTransition) return

    activeTransition.elapsed += delta
    const progress = Math.min(activeTransition.elapsed / TRANSITION_DURATION, 1)
    const eased = 1 - Math.pow(1 - progress, 3)

    camera.position.lerpVectors(
      activeTransition.startPosition,
      activeTransition.targetPosition,
      eased,
    )
    camera.up
      .lerpVectors(activeTransition.startUp, activeTransition.targetUp, eased)
      .normalize()
    currentTarget.current.lerpVectors(
      activeTransition.startTarget,
      activeTransition.targetTarget,
      eased,
    )
    camera.lookAt(currentTarget.current)

    const controls = controlsRef.current
    if (controls) {
      controls.target.copy(currentTarget.current)
      controls.update()
    }

    if (progress === 1) {
      if (controls) {
        controls.target.copy(activeTransition.targetTarget)
        controls.enabled = true
        controls.update()
      }
      transition.current = null
    }
  })

  return null
}
