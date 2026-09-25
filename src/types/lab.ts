export type LabModuleId =
  | 'rotation'
  | 'revolution'
  | 'day-night'
  | 'terminator'
  | 'obliquity'
  | 'subsolar-point'
  | 'day-length'
  | 'solar-altitude'
  | 'seasons'
  | 'climate-zones'
  | 'local-time'
  | 'date-line'
  | 'polar-day-night'

export type LabModuleGroup = '基础运动' | '光照与角度' | '观测变化' | '时间与极区'

export interface LabModule {
  id: LabModuleId
  name: string
  shortName: string
  group: LabModuleGroup
  index: number
}

export type SimulationSpeed = 1 | 10 | 100 | 1000

export type CameraViewPreset = 'default' | 'north-pole' | 'south-pole' | 'equator'

export type DayNightStep = 1 | 2 | 3 | 4 | 5 | 6
