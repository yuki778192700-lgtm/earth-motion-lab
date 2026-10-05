import { getLabModuleRuntimeConfig } from '../config/labModuleRegistry'
import { useEarthLabStore } from '../store/useEarthLabStore'

/** 仅用于教学画面样式选择，不参与地球姿态或太阳方向计算。 */
export function useSolarSideTeachingView(): boolean {
  return useEarthLabStore(state =>
    getLabModuleRuntimeConfig(state.activeModuleId).scene === 'day-night' &&
    state.cameraViewPreset === 'sun-side',
  )
}
