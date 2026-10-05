import type { CameraViewPreset, DayNightStep, LabModuleId } from './lab'
import type { TeachingLayers } from '../config/teachingLayers'

export type LearningMode = 'explore' | 'teach' | 'practice'

export type KnowledgeTopic =
  | 'rotation'
  | 'terminator'
  | 'obliquity'
  | 'subsolar-point'
  | 'day-length'
  | 'solar-altitude'
  | 'seasons'
  | 'polar-day-night'
  | 'climate-zones'
  | 'local-time'
  | 'fixed-offset-time'
  | 'date-line'

export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'diagram'
  | 'terminator'
  | 'date'
  | 'subsolar'
  | 'day-length'
  | 'noon-altitude'
  | 'local-time'
  | 'thermal-zone'
  | 'fixed-offset-time'
  | 'date-line'

export interface SceneAction {
  moduleId?: LabModuleId
  simulationTimeMs?: number
  latitudeDegrees?: number
  cameraPreset?: CameraViewPreset
  dayNightStep?: DayNightStep
  showSubsolarMarker?: boolean
  showSolarNoonGuide?: boolean
  overlayMessage?: string
  localTimeLongitudeA?: number
  localTimeLongitudeB?: number
  localTimeOffsetA?: number
  localTimeOffsetB?: number
  dateLineDirection?: 'east' | 'west'
  dateLineProgress?: number
  teachingLayers?: Partial<TeachingLayers>
}

export interface TeachingStep {
  title: string
  explanation: string
  durationMs: number
  action: SceneAction
}

export interface TeachingScript {
  id: KnowledgeTopic
  title: string
  summary: string
  steps: TeachingStep[]
}

export interface QuestionOption {
  id: string
  label: string
}

export interface GeographyQuestion {
  id: string
  type: QuestionType
  typeLabel: string
  topic: KnowledgeTopic
  prompt: string
  options: QuestionOption[]
  correctAnswerId: string
  explanation: string
  explanationSteps: TeachingStep[]
  initialSceneAction?: SceneAction
}

export interface PracticeSnapshot {
  simulationTimeMs: number
  latitudeDegrees: number
  activeModuleId?: LabModuleId
  localTimeLongitudeA?: number
  localTimeLongitudeB?: number
  localTimeOffsetA?: number
  localTimeOffsetB?: number
  dateLineDirection?: 'east' | 'west'
  dateLineProgress?: number
}
