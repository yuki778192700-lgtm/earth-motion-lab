import {
  DEFAULT_TEACHING_LAYERS,
  type TeachingLayers,
} from './teachingLayers'
import type { CameraViewPreset, LabModuleId } from '../types/lab'

export type LabSceneKind = 'earth' | 'orbit' | 'day-night' | 'planned'
export type LabPanelKind = 'rotation' | 'orbit' | 'day-night' | 'thermal-zones' | 'local-time' | 'date-line' | 'subsolar-annual' | 'noon-annual' | 'seasons' | 'polar-annual' | 'obliquity' | 'day-length-annual' | 'planned'
export type LabModuleAvailability = 'complete' | 'shared' | 'planned'
export type LabControlId =
  | 'date'
  | 'time'
  | 'latitude'
  | 'playback'
  | 'camera'
  | 'layers'
  | 'orbit-key-dates'

export interface LabModuleRuntimeConfig {
  id: LabModuleId
  scene: LabSceneKind
  panel: LabPanelKind
  availability: LabModuleAvailability
  defaultCamera: CameraViewPreset
  defaultLayers: Readonly<TeachingLayers>
  controls: readonly LabControlId[]
  modelNote: string
  plannedSummary?: string
}

function teachingLayers(
  overrides: Partial<TeachingLayers>,
): Readonly<TeachingLayers> {
  return Object.freeze({ ...DEFAULT_TEACHING_LAYERS, ...overrides })
}

const EARTH_LAYERS = teachingLayers({
  terminator: false,
  parallelSunRays: false,
  solarDirection: false,
  subsolarPoint: false,
  dayArc: false,
  nightArc: false,
  angleIndicators: false,
})

const ORBIT_LAYERS = teachingLayers({
  coordinateGrid: false,
  terminator: false,
  subsolarPoint: false,
  dayArc: false,
  nightArc: false,
})

const DAY_NIGHT_LAYERS = teachingLayers({
  subsolarPoint: false,
  angleIndicators: false,
})

/**
 * 13 个课程入口的唯一运行时路由表。
 * 场景、数据面板、默认镜头、默认图层和可用控制器均从这里读取。
 */
export const LAB_MODULE_REGISTRY = {
  rotation: {
    id: 'rotation', scene: 'earth', panel: 'rotation', availability: 'complete',
    defaultCamera: 'default', defaultLayers: EARTH_LAYERS,
    controls: ['time', 'latitude', 'playback', 'camera', 'layers'],
    modelNote: '采用 24 小时平均太阳日。太阳大小与日地距离为非等比例教学示意；云层为程序化视觉示意，不代表实时云况。',
  },
  revolution: {
    id: 'revolution', scene: 'orbit', panel: 'orbit', availability: 'complete',
    defaultCamera: 'default', defaultLayers: ORBIT_LAYERS,
    controls: ['date', 'playback', 'camera', 'layers', 'orbit-key-dates'],
    modelNote: '采用开普勒椭圆轨道和太阳视黄经近似模型。轨道离心率按真实值计算，天体大小与距离非等比例；云层不代表实时云况。',
  },
  'day-night': {
    id: 'day-night', scene: 'day-night', panel: 'day-night', availability: 'complete',
    defaultCamera: 'sun-side', defaultLayers: DAY_NIGHT_LAYERS,
    controls: ['date', 'time', 'latitude', 'playback', 'camera', 'layers'],
    modelNote: '太阳方向和入射光在世界坐标中固定，昼夜交替由地球自西向东自转形成。升落时刻不含大气折射、太阳视半径和地形影响。',
  },
  terminator: {
    id: 'terminator', scene: 'day-night', panel: 'day-night', availability: 'complete',
    defaultCamera: 'terminator', defaultLayers: DAY_NIGHT_LAYERS,
    controls: ['date', 'time', 'latitude', 'playback', 'camera', 'layers'],
    modelNote: '晨昏线由球面法向与固定太阳方向的点积为零确定，不是贴在地球表面的固定装饰线。',
  },
  obliquity: {
    id: 'obliquity', scene: 'orbit', panel: 'obliquity', availability: 'complete',
    defaultCamera: 'default', defaultLayers: ORBIT_LAYERS,
    controls: ['date', 'camera', 'layers', 'orbit-key-dates'],
    modelNote: '三个角度从公转场景的地轴和黄道面法线计算。固定教材值23°26′，一年内地轴空间平行；屏幕投影角度不等于空间角度，不模拟长期岁差章动。',
  },
  'subsolar-point': {
    id: 'subsolar-point', scene: 'day-night', panel: 'subsolar-annual', availability: 'complete',
    defaultCamera: 'equator',
    defaultLayers: teachingLayers({ subsolarPoint: true, angleIndicators: false, dayArc: false, nightArc: false }),
    controls: ['date', 'time', 'latitude', 'camera', 'layers'],
    modelNote: '全年赤纬曲线与3D直射点共用太阳位置模型；淡色带是直射纬度范围，不是固定经线轨迹。直射经度按当前UTC和时间方程计算。',
  },
  'day-length': {
    id: 'day-length', scene: 'day-night', panel: 'day-length-annual', availability: 'complete',
    defaultCamera: 'terminator', defaultLayers: DAY_NIGHT_LAYERS,
    controls: ['date', 'latitude', 'camera', 'layers'],
    modelNote: '全年昼长曲线、二分二至升落对比与3D昼弧夜弧共用引擎。日出日落为地方真太阳时，非区时；每日固定赤纬近似，不含折射、太阳视半径或地形。',
  },
  'solar-altitude': {
    id: 'solar-altitude', scene: 'day-night', panel: 'noon-annual', availability: 'complete',
    defaultCamera: 'equator',
    defaultLayers: teachingLayers({ subsolarPoint: true, angleIndicators: true, dayArc: false, nightArc: false }),
    controls: ['date', 'time', 'latitude', 'camera', 'layers'],
    modelNote: '正午太阳高度曲线与3D量角共用地理计算。量角点随直射经度定位，表示所选纬度的当地真太阳正午；极夜负高度保留。',
  },
  seasons: {
    id: 'seasons', scene: 'orbit', panel: 'seasons', availability: 'complete',
    defaultCamera: 'default', defaultLayers: ORBIT_LAYERS,
    controls: ['date', 'camera', 'layers', 'orbit-key-dates'],
    modelNote: '复用公转模型，对比同纬度绝对值的南北半球天文季节、几何昼长与正午太阳高度。季节按节气时刻划分，不代表当地气候；日地非等比例。',
  },
  'climate-zones': {
    id: 'climate-zones', scene: 'earth', panel: 'thermal-zones', availability: 'complete',
    defaultCamera: 'equator', defaultLayers: EARTH_LAYERS,
    controls: ['latitude', 'camera', 'layers'],
    modelNote: '采用固定教材边界23°26′和66°34′划分天文五带。回归线和极圈单独标注为分界；五带着色不代表实时气温或气候类型。',
  },
  'local-time': {
    id: 'local-time', scene: 'earth', panel: 'local-time', availability: 'shared',
    defaultCamera: 'equator', defaultLayers: EARTH_LAYERS,
    controls: ['date', 'time', 'playback', 'camera', 'layers'],
    modelNote: '双地点实验对比地方平均太阳时与固定UTC偏移区时。经度东正西负，每度差4分钟；固定偏移由用户选择，不是国家时区地图，不含夏令时和历史规则。',
  },
  'date-line': {
    id: 'date-line', scene: 'earth', panel: 'date-line', availability: 'shared',
    defaultCamera: 'north-pole', defaultLayers: EARTH_LAYERS,
    controls: ['date', 'time', 'camera', 'layers'],
    modelNote: '180°理论日期界线基础实验：同一UTC时刻，向东跨线减一天，向西跨线加一天。忽略旅途耗时；不表示现实曲折走向或法定时区边界。',
  },
  'polar-day-night': {
    id: 'polar-day-night', scene: 'day-night', panel: 'polar-annual', availability: 'complete',
    defaultCamera: 'north-pole', defaultLayers: DAY_NIGHT_LAYERS,
    controls: ['date', 'latitude', 'camera', 'layers'],
    modelNote: '复用昼夜场景和几何昼长引擎，比较动态极昼极夜纬度边界与全年昼长曲线。不含折射、太阳视半径或地形；图线不是精确起止日期预报。',
  },
} as const satisfies Record<LabModuleId, LabModuleRuntimeConfig>

export function getLabModuleRuntimeConfig(
  moduleId: LabModuleId,
): LabModuleRuntimeConfig {
  return LAB_MODULE_REGISTRY[moduleId]
}
