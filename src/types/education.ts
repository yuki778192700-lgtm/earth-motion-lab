import type { CameraViewPreset, DayNightStep, LabModuleId } from './lab'

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

export interface SceneAction {
  moduleId?: LabModuleId
  simulationTimeMs?: number
  latitudeDegrees?: number
  cameraPreset?: CameraViewPreset
  dayNightStep?: DayNightStep
  showSubsolarMarker?: boolean
  showSolarNoonGuide?: boolean
  overlayMessage?: string
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
}

export interface PracticeSnapshot {
  simulationTimeMs: number
  latitudeDegrees: number
}
