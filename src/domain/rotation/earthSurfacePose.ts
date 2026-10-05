import { calculateOrbitAlignedEarthRotationRadians } from '../orbit/earthOrbit'
import { getEarthRotationAngleRadians } from './earthRotation'

export type EarthSurfaceRotationModel = 'solar' | 'orbit-aligned' | 'fixed'

/** 渲染姿态策略：fixed为公转教学的显式简化，不改变真实自转计算。 */
export function getEarthSurfaceRotationRadians(
  simulationTimeMs: number,
  model: EarthSurfaceRotationModel,
): number {
  if (model === 'fixed') return 0
  return model === 'orbit-aligned'
    ? calculateOrbitAlignedEarthRotationRadians(simulationTimeMs)
    : getEarthRotationAngleRadians(simulationTimeMs)
}
