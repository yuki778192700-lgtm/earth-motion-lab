import { getLabModuleRuntimeConfig } from './labModuleRegistry'
import type { TeachingLayers } from './teachingLayers'
import type { LabModuleId } from '../types/lab'
import { dayLength, solarDeclination } from '../lib/geography'

interface SceneLegendState {
  activeModuleId: LabModuleId
  teachingLayers: TeachingLayers
  isDayNightGuidedMode: boolean
  dayNightStep: number
  simulationTimeMs: number
  observerLatitudeDegrees: number
}

export interface SceneLegendEntry {
  id: string
  label: string
  className: string
}

/** 只描述现有场景对象的显示条件，不改变任何渲染或地理状态。 */
export function getSceneLegend(state: SceneLegendState): SceneLegendEntry[] {
  const scene = getLabModuleRuntimeConfig(state.activeModuleId).scene
  const layers = state.teachingLayers
  const entries: SceneLegendEntry[] = []
  const add = (visible: boolean, id: string, label: string, className: string) => {
    if (visible) entries.push({ id, label, className })
  }
  if (scene === 'orbit') {
    add(true, 'orbit', '公转轨道', 'orbit')
    add(true, 'ecliptic', '黄道面', 'ecliptic')
    add(true, 'equatorial-plane', '赤道面', 'equator')
    add(layers.earthAxis, 'axis', '地轴', 'axis')
    add(layers.parallelSunRays, 'rays', '平行太阳光', 'sunlight')
  } else if (scene === 'day-night') {
    const step = state.isDayNightGuidedMode ? state.dayNightStep : 6
    if (step >= 5 && (layers.dayArc || layers.nightArc)) {
      const hours = dayLength(state.observerLatitudeDegrees, solarDeclination(new Date(state.simulationTimeMs)))
      // 与calculateLatitudeArcGeometry中的零弧阈值一致，角度单位为度。
      add(layers.dayArc && hours * 15 > 1e-9, 'day-arc', '昼弧', 'day-arc')
      add(layers.nightArc && 360 - hours * 15 > 1e-9, 'night-arc', '夜弧', 'night-arc')
    }
    add(layers.terminator && step >= 3, 'dawn', '晨线', 'dawn-line')
    add(layers.terminator && step >= 3, 'dusk', '昏线', 'dusk-line')
    add(layers.parallelSunRays && step >= 1, 'rays', '平行太阳光', 'sunlight')
  } else if (scene === 'earth') {
    add(layers.earthAxis, 'axis', '地轴', 'axis')
    add(layers.equator, 'equator', '赤道', 'equator')
    add(layers.tropics, 'tropics', '南北回归线 23°26′', 'tropic')
    add(layers.polarCircles, 'polar-circles', '南北极圈 66°34′', 'polar')
    add(state.activeModuleId === 'rotation' || state.activeModuleId === 'climate-zones', 'latitude', '所选纬线', 'selected-latitude')
    add(layers.parallelSunRays, 'rays', '平行太阳光', 'sunlight')
  }
  return entries
}
