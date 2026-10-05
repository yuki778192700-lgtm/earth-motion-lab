import { Vector3 } from 'three'

/**
 * 固定光照教学参考系中，从地球指向太阳的世界坐标单位向量。
 * 太阳位于画面左侧（-X），光子沿相反的 +X 方向传播。
 */
export const SUN_DIRECTION: Readonly<Vector3> = Object.freeze(new Vector3(-1, 0, 0))

export function createSunDirectionVector(): Vector3 {
  return new Vector3(SUN_DIRECTION.x, SUN_DIRECTION.y, SUN_DIRECTION.z)
}

export function getSunlightPropagationDirection(): Vector3 {
  return createSunDirectionVector().negate()
}

export function getFixedSunPosition(target: Vector3, distance: number): Vector3 {
  if (!Number.isFinite(distance) || distance <= 0) {
    throw new RangeError('distance must be a positive finite number')
  }
  return target.clone().addScaledVector(createSunDirectionVector(), distance)
}

export function calculateLightPropagationDirection(
  lightPosition: Vector3,
  target: Vector3,
): Vector3 {
  return target.clone().sub(lightPosition).normalize()
}
