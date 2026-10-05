import type { ReactNode, RefObject } from 'react'
import type { Group } from 'three'
import { AtmosphereLayer } from './AtmosphereLayer'
import { CloudLayer } from './CloudLayer'
import { EarthSurface } from './EarthSurface'
import { NightSide } from './NightSide'

interface EarthSystemProps {
  surfaceRotationRadians?: number
  surfaceRef?: RefObject<Group | null>
  cloudLayer?: ReactNode
  nightSide?: ReactNode
}

/**
 * 只负责地球实体视觉层，不渲染地轴、经纬网或其他教学几何对象。
 * 外层空间姿态由具体实验场景提供。
 */
export function EarthSystem({
  surfaceRotationRadians = 0,
  surfaceRef,
  cloudLayer,
  nightSide,
}: EarthSystemProps) {
  return (
    <group name="EarthSystem">
      <AtmosphereLayer />
      <NightSide>{nightSide}</NightSide>
      <group
        ref={surfaceRef}
        name="RotatingEarthSurface"
        rotation={[0, surfaceRotationRadians, 0]}
      >
        <EarthSurface />
        <CloudLayer>{cloudLayer}</CloudLayer>
      </group>
    </group>
  )
}
