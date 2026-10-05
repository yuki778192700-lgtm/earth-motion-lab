import type { ReactNode, RefObject } from 'react'
import type { Group, Quaternion, Vector3 } from 'three'

interface TeachingOverlaySystemProps {
  /** 不随地球姿态或地表自转变化的世界坐标教学几何。 */
  worldFixed?: ReactNode
  earthFixed?: ReactNode
  surfaceBound?: ReactNode
  earthFramePosition?: Vector3
  earthFrameQuaternion?: Quaternion
  surfaceRotationRadians?: number
  surfaceRef?: RefObject<Group | null>
}

/**
 * 教学几何覆盖层统一入口。
 * worldFixed 固定在世界坐标；earthFixed 随地轴姿态变化但不随地表自转；
 * surfaceBound 与经纬度坐标共同旋转。
 */
export function TeachingOverlaySystem({
  worldFixed,
  earthFixed,
  surfaceBound,
  earthFramePosition,
  earthFrameQuaternion,
  surfaceRotationRadians = 0,
  surfaceRef,
}: TeachingOverlaySystemProps) {
  return (
    <group name="TeachingOverlaySystem">
      <group name="WorldFixedTeachingOverlay">{worldFixed}</group>
      <group
        name="EarthTeachingReferenceFrame"
        position={earthFramePosition}
        quaternion={earthFrameQuaternion}
      >
        <group name="EarthFixedTeachingOverlay">{earthFixed}</group>
        <group
          ref={surfaceRef}
          name="GeographicOverlay"
          rotation={[0, surfaceRotationRadians, 0]}
        >
          {surfaceBound}
        </group>
      </group>
    </group>
  )
}
