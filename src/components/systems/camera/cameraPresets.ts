import { MathUtils, Vector3 } from 'three'
import {
  calculateDayNightEarthPose,
  DAY_NIGHT_EARTH_CENTER,
} from '../../../domain/dayNight/solarReferenceFrame'
import { earthLocalToWorld } from '../../../lib/earthCoordinates'
import type { CameraViewPreset } from '../../../types/lab'

export interface CameraPose {
  position: Vector3
  up: Vector3
  target: Vector3
}

export const CAMERA_DISTANCE = 5.7
export const CAMERA_TRANSITION_DURATION_SECONDS = 0.72

/** 教材侧视图中，地球球心位于画面宽度约 60% 处。 */
export const SIDE_VIEW_EARTH_SCREEN_FRACTION = 0.62
export const SIDE_VIEW_HORIZONTAL_SPAN = 10.9
export const SIDE_VIEW_TARGET_X =
  DAY_NIGHT_EARTH_CENTER.x -
  (SIDE_VIEW_EARTH_SCREEN_FRACTION - 0.5) * SIDE_VIEW_HORIZONTAL_SPAN

/** 使透视相机在切换前与正交侧视图具有相同的垂直视野。 */
export function calculateSideViewCameraZ(
  aspect: number,
  perspectiveFovDegrees = 36,
): number {
  const safeAspect = Math.max(aspect, 0.1)
  const verticalSpan = SIDE_VIEW_HORIZONTAL_SPAN / safeAspect
  return verticalSpan / (2 * Math.tan(MathUtils.degToRad(perspectiveFovDegrees / 2)))
}

export function getOrbitCameraPose(
  preset: CameraViewPreset,
  cameraDistance: number,
): CameraPose {
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
    case 'sun-side':
    case 'terminator':
      return {
        position: new Vector3(0.82, 0.52, 1).normalize().multiplyScalar(systemDistance),
        up: new Vector3(0, 1, 0),
        target: new Vector3(),
      }
  }
}

export function getEarthCameraPose(
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
    case 'default':
    case 'sun-side':
    case 'terminator': {
      const target = new Vector3(1.5, 0, 0)
      const systemDistance = cameraDistance * 1.75
      return {
        position: new Vector3(0, 0.31, 1)
          .normalize()
          .multiplyScalar(systemDistance)
          .add(target),
        up: new Vector3(0, 1, 0),
        target,
      }
    }
  }
}

export function getDayNightCameraPose(
  preset: CameraViewPreset,
  cameraDistance: number,
  date: Date,
  canvasAspect: number,
): CameraPose {
  const earthCenter = new Vector3(
    DAY_NIGHT_EARTH_CENTER.x,
    DAY_NIGHT_EARTH_CENTER.y,
    DAY_NIGHT_EARTH_CENTER.z,
  )

  if (preset === 'sun-side') {
    const compositionTarget = new Vector3(SIDE_VIEW_TARGET_X, 0, 0)
    return {
      position: new Vector3(
        compositionTarget.x,
        0,
        calculateSideViewCameraZ(canvasAspect),
      ),
      up: new Vector3(0, 1, 0),
      target: compositionTarget,
    }
  }

  if (preset === 'terminator') {
    return {
      // 视线沿世界 -Z，与固定太阳方向 -X 垂直，晨昏圈显示为球面中央分界。
      position: earthCenter.clone().add(new Vector3(0, 0, cameraDistance * 1.08)),
      up: new Vector3(0, 1, 0),
      target: earthCenter,
    }
  }

  const pose = calculateDayNightEarthPose(date)

  if (preset === 'north-pole' || preset === 'south-pole') {
    const direction = pose.northAxisWorld
      .clone()
      .multiplyScalar(preset === 'north-pole' ? 1 : -1)
    const stableUp = new Vector3(1, 0, 0)
      .applyQuaternion(pose.orientationQuaternion)
      .multiplyScalar(preset === 'north-pole' ? 1 : -1)
      .normalize()
    return {
      position: earthCenter.clone().addScaledVector(direction, cameraDistance),
      up: stableUp,
      target: earthCenter,
    }
  }

  if (preset === 'equator') {
    const equatorialViewDirection = new Vector3(0, 0, 1)
      .addScaledVector(
        pose.northAxisWorld,
        -pose.northAxisWorld.dot(new Vector3(0, 0, 1)),
      )
      .normalize()
    return {
      position: earthCenter.clone().addScaledVector(equatorialViewDirection, cameraDistance),
      up: pose.northAxisWorld.clone(),
      target: earthCenter,
    }
  }

  return {
    position: new Vector3(0.72, 0.44, 1)
      .normalize()
      .multiplyScalar(cameraDistance)
      .add(earthCenter),
    up: new Vector3(0, 1, 0),
    target: earthCenter,
  }
}
