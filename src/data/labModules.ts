import type { LabModule, LabModuleGroup } from '../types/lab'

export const LAB_MODULE_GROUPS: LabModuleGroup[] = [
  '基础运动',
  '光照与角度',
  '观测变化',
  '时间与极区',
]

export const LAB_MODULES: LabModule[] = [
  { id: 'rotation', name: '地球自转', shortName: '自转', group: '基础运动', index: 1 },
  { id: 'revolution', name: '地球公转', shortName: '公转', group: '基础运动', index: 2 },
  { id: 'day-night', name: '昼夜交替', shortName: '昼夜', group: '光照与角度', index: 3 },
  { id: 'terminator', name: '晨昏线', shortName: '晨昏线', group: '光照与角度', index: 4 },
  { id: 'obliquity', name: '黄赤交角', shortName: '交角', group: '光照与角度', index: 5 },
  { id: 'subsolar-point', name: '太阳直射点移动', shortName: '直射点', group: '光照与角度', index: 6 },
  { id: 'day-length', name: '昼夜长短变化', shortName: '昼长', group: '观测变化', index: 7 },
  { id: 'solar-altitude', name: '正午太阳高度', shortName: '太阳高度', group: '观测变化', index: 8 },
  { id: 'seasons', name: '四季形成', shortName: '四季', group: '观测变化', index: 9 },
  { id: 'climate-zones', name: '五带', shortName: '五带', group: '观测变化', index: 10 },
  { id: 'local-time', name: '地方时和时区', shortName: '地方时', group: '时间与极区', index: 11 },
  { id: 'date-line', name: '国际日期变更线', shortName: '日期线', group: '时间与极区', index: 12 },
  { id: 'polar-day-night', name: '极昼极夜', shortName: '极昼夜', group: '时间与极区', index: 13 },
]

export function getLabModule(id: LabModule['id']): LabModule {
  return LAB_MODULES.find((module) => module.id === id) ?? LAB_MODULES[0]!
}
