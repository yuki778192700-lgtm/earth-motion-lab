export interface TeachingLayers {
  coordinateGrid: boolean
  earthAxis: boolean
  equator: boolean
  tropics: boolean
  polarCircles: boolean
  terminator: boolean
  parallelSunRays: boolean
  solarDirection: boolean
  subsolarPoint: boolean
  dayArc: boolean
  nightArc: boolean
  angleIndicators: boolean
}

export type TeachingLayerId = keyof TeachingLayers

export interface TeachingLayerOption {
  id: TeachingLayerId
  label: string
}

/** 保留升级前的默认可见效果。 */
export const DEFAULT_TEACHING_LAYERS: Readonly<TeachingLayers> = Object.freeze({
  coordinateGrid: true,
  earthAxis: true,
  equator: true,
  tropics: true,
  polarCircles: true,
  terminator: true,
  parallelSunRays: true,
  solarDirection: true,
  subsolarPoint: false,
  dayArc: true,
  nightArc: true,
  angleIndicators: true,
})

export const TEACHING_LAYER_OPTIONS: readonly TeachingLayerOption[] = Object.freeze([
  { id: 'coordinateGrid', label: '经纬网' },
  { id: 'earthAxis', label: '地轴' },
  { id: 'equator', label: '赤道' },
  { id: 'tropics', label: '南北回归线' },
  { id: 'polarCircles', label: '南北极圈' },
  { id: 'terminator', label: '晨昏线' },
  { id: 'parallelSunRays', label: '太阳平行光' },
  { id: 'solarDirection', label: '太阳方向' },
  { id: 'subsolarPoint', label: '太阳直射点' },
  { id: 'dayArc', label: '昼弧' },
  { id: 'nightArc', label: '夜弧' },
  { id: 'angleIndicators', label: '角度辅助线' },
])

export function createDefaultTeachingLayers(): TeachingLayers {
  return { ...DEFAULT_TEACHING_LAYERS }
}
