import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type ComponentRef, type RefObject } from 'react'
import { Vector3 } from 'three'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import type { CameraViewPreset } from '../../types/lab'
import {
  CAMERA_DISTANCE,
  CAMERA_TRANSITION_DURATION_SECONDS,
  getDayNightCameraPose,
  getEarthCameraPose,
  getOrbitCameraPose,
} from '../systems/camera/cameraPresets'
import { getLabModuleRuntimeConfig } from '../../config/labModuleRegistry'

interface CameraControllerProps {
  controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>
  onTransitionComplete?: (preset: CameraViewPreset) => void
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

export function CameraController({
  controlsRef,
  onTransitionComplete,
}: CameraControllerProps) {
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
    const sceneKind = getLabModuleRuntimeConfig(activeModuleId).scene
    const pose = sceneKind === 'orbit'
      ? getOrbitCameraPose(cameraViewPreset, responsiveDistance)
      : sceneKind === 'day-night'
        ? getDayNightCameraPose(
            cameraViewPreset,
            responsiveDistance,
            new Date(useEarthLabStore.getState().simulationTimeMs),
            canvasAspect,
          )
        : getEarthCameraPose(cameraViewPreset, responsiveDistance)
    const lockSideView =
      sceneKind === 'day-night' &&
      cameraViewPreset === 'sun-side'
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

    return () => {
      if (controlsRef.current && !lockSideView) {
        controlsRef.current.enabled = true
      }
    }
  }, [activeModuleId, camera, cameraViewPreset, cameraViewRequestId, controlsRef, size.height, size.width])

  useFrame((_, delta) => {
    const activeTransition = transition.current
    if (!activeTransition) return

    activeTransition.elapsed += delta
    const progress = Math.min(
      activeTransition.elapsed / CAMERA_TRANSITION_DURATION_SECONDS,
      1,
    )
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
        const state = useEarthLabStore.getState()
        const activeScene = getLabModuleRuntimeConfig(state.activeModuleId).scene
        controls.enabled = !(
          activeScene === 'day-night' &&
          state.cameraViewPreset === 'sun-side'
        )
        controls.update()
      }
      transition.current = null
      onTransitionComplete?.(useEarthLabStore.getState().cameraViewPreset)
    }
  })

  return null
}
