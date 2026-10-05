import { create } from 'zustand'
import type {
  CameraViewPreset,
  DayNightStep,
  LabModuleId,
  SimulationSpeed,
} from '../types/lab'
import type {
  GeographyQuestion,
  KnowledgeTopic,
  LearningMode,
  SceneAction,
  PracticeSnapshot,
} from '../types/education'
import { getTeachingScript } from '../education/teachingScripts'
import { generateQuestion } from '../education/questionEngine'
import { OBSERVER_MARKER_DEFAULT_LONGITUDE_DEGREES } from '../domain/dayNight/solarReferenceFrame'
import { DEFAULT_SIMULATION_SPEED } from '../domain/simulation/playback'
import {
  createDefaultTeachingLayers,
  type TeachingLayerId,
  type TeachingLayers,
} from '../config/teachingLayers'
import { getLabModuleRuntimeConfig } from '../config/labModuleRegistry'
import { assertTeachingLongitude } from '../lib/geography/localTimeExperiment'
import { assertFixedUtcOffset } from '../lib/geography/fixedOffsetTime'
import { assertDateLineDirection, assertDateLineProgress, type DateLineDirection } from '../lib/geography/dateLine'
import { assertComparisonLatitude } from '../domain/solar/hemisphereSeasons'
import { advanceAnnualTimeline, assertAnnualOrbitDuration, DEFAULT_ANNUAL_ORBIT_DURATION, getNextAnnualStop, stepAnnualDay, type AnnualOrbitDuration } from '../domain/orbit/annualTimeline'
import { assertOrbitLessonStep, createOrbitLesson } from '../domain/orbit/orbitLesson'

const DEFAULT_SIMULATION_TIME_MS = Date.parse('2026-06-21T04:00:00.000Z')

interface EarthLabState {
  orbitLessonStepIndex: number | null
  orbitLessonTargetStepIndex: number | null
  selectOrbitLessonStep: (step: number) => void
  toggleOrbitLessonPlayback: () => void
  annualOrbitDurationSeconds: AnnualOrbitDuration
  isAnnualOrbitPlaying: boolean
  annualOrbitPlaybackYear: number
  annualOrbitStopAtNextEvent: boolean
  annualOrbitStopTimeMs: number | null
  setAnnualOrbitDuration: (duration: AnnualOrbitDuration) => void
  toggleAnnualOrbitPlaying: () => void
  setAnnualOrbitStopAtNextEvent: (enabled: boolean) => void
  seekAnnualOrbitTime: (timeMs: number) => void
  stepAnnualOrbitDay: (direction: -1 | 1) => void
  advanceAnnualOrbitTime: (elapsedRealMs: number) => void
  seasonsComparisonLatitudeDegrees: number
  setSeasonsComparisonLatitude: (latitudeDegrees: number) => void
  subsolarExplanationStep: number
  setSubsolarExplanationStep: (step: number) => void
  dateLineDirection: DateLineDirection
  dateLineProgress: number
  setDateLineDirection: (direction: DateLineDirection) => void
  setDateLineProgress: (progress: number) => void
  localTimeOffsetA: number
  localTimeOffsetB: number
  setLocalTimeOffset: (point: 'A' | 'B', offsetMinutes: number) => void
  localTimeLongitudeA: number
  localTimeLongitudeB: number
  setLocalTimeLongitude: (point: 'A' | 'B', longitudeDegrees: number) => void
  activeModuleId: LabModuleId
  simulationTimeMs: number
  isPlaying: boolean
  speed: SimulationSpeed
  teachingLayers: TeachingLayers
  cameraViewPreset: CameraViewPreset
  cameraViewRequestId: number
  observerLatitudeDegrees: number
  observerLongitudeDegrees: number
  showDayNightObserverMarker: boolean
  isDayNightGuidedMode: boolean
  dayNightStep: DayNightStep
  learningMode: LearningMode
  teacherTopic: KnowledgeTopic
  teacherStepIndex: number
  isTeacherPlaying: boolean
  showSolarNoonGuide: boolean
  educationOverlayMessage: string | null
  practiceSequence: number
  practiceQuestion: GeographyQuestion | null
  practiceSelectedAnswerId: string | null
  practiceSubmitted: boolean
  practiceExplanationIndex: number
  setActiveModule: (moduleId: LabModuleId) => void
  setSimulationTime: (timeMs: number) => void
  advanceSimulationTime: (elapsedSimulationMs: number) => void
  togglePlaying: () => void
  setSpeed: (speed: SimulationSpeed) => void
  toggleTeachingLayer: (layerId: TeachingLayerId) => void
  setTeachingLayer: (layerId: TeachingLayerId, visible: boolean) => void
  requestCameraView: (preset: CameraViewPreset) => void
  setObserverLatitude: (latitudeDegrees: number) => void
  toggleDayNightObserverMarker: () => void
  toggleDayNightAlternation: () => void
  toggleDayNightGuidedMode: () => void
  setDayNightStep: (step: DayNightStep) => void
  setLearningMode: (mode: LearningMode) => void
  selectTeacherTopic: (topic: KnowledgeTopic) => void
  previousTeacherStep: () => void
  nextTeacherStep: () => void
  toggleTeacherPlaying: () => void
  resetTeacherDemo: () => void
  applySceneAction: (action: SceneAction) => void
  selectPracticeAnswer: (answerId: string) => void
  submitPracticeAnswer: () => void
  nextPracticeExplanationStep: () => void
  previousPracticeExplanationStep: () => void
  generateNextQuestion: () => void
  resetSimulation: () => void
}

export const useEarthLabStore = create<EarthLabState>((set) => ({
  orbitLessonStepIndex: null,
  orbitLessonTargetStepIndex: null,
  selectOrbitLessonStep: step => {
    assertOrbitLessonStep(step)
    set(state => {
      if (state.activeModuleId !== 'revolution' || state.learningMode !== 'explore') return {}
      const event = createOrbitLesson(new Date(state.simulationTimeMs).getUTCFullYear())[step]!
      return { simulationTimeMs: event.timeMs, orbitLessonStepIndex: step, orbitLessonTargetStepIndex: null, isAnnualOrbitPlaying: false, isPlaying: false, annualOrbitStopTimeMs: null }
    })
  },
  toggleOrbitLessonPlayback: () => set(state => {
    if (state.activeModuleId !== 'revolution' || state.learningMode !== 'explore') return {}
    if (state.isAnnualOrbitPlaying && state.orbitLessonTargetStepIndex !== null) return { isAnnualOrbitPlaying: false }
    const year = new Date(state.simulationTimeMs).getUTCFullYear()
    const steps = createOrbitLesson(year)
    const index = state.orbitLessonStepIndex ?? 0
    if (index === 3) return {}
    const target = state.orbitLessonTargetStepIndex ?? index + 1
    return {
      orbitLessonStepIndex: index, orbitLessonTargetStepIndex: target,
      simulationTimeMs: state.orbitLessonStepIndex === null ? steps[0]!.timeMs : state.simulationTimeMs,
      isAnnualOrbitPlaying: true, isPlaying: false, annualOrbitPlaybackYear: year,
      annualOrbitStopTimeMs: steps[target]!.timeMs,
    }
  }),
  annualOrbitDurationSeconds: DEFAULT_ANNUAL_ORBIT_DURATION,
  isAnnualOrbitPlaying: false,
  annualOrbitPlaybackYear: 2026,
  annualOrbitStopAtNextEvent: false,
  annualOrbitStopTimeMs: null,
  setAnnualOrbitDuration: duration => {
    assertAnnualOrbitDuration(duration)
    set({ annualOrbitDurationSeconds: duration })
  },
  toggleAnnualOrbitPlaying: () => set(state => {
    if (state.activeModuleId !== 'revolution' || state.learningMode !== 'explore') return {}
    const year = new Date(state.simulationTimeMs).getUTCFullYear()
    const end = Date.UTC(year + 1, 0, 1) - 1
    const timeMs = state.simulationTimeMs >= end ? Date.UTC(year, 0, 1) : state.simulationTimeMs
    return {
      isAnnualOrbitPlaying: !state.isAnnualOrbitPlaying, isPlaying: false,
      orbitLessonStepIndex: null, orbitLessonTargetStepIndex: null,
      simulationTimeMs: timeMs, annualOrbitPlaybackYear: year,
      annualOrbitStopTimeMs: state.annualOrbitStopAtNextEvent ? getNextAnnualStop(timeMs) : null,
    }
  }),
  setAnnualOrbitStopAtNextEvent: enabled => set(state => ({
    annualOrbitStopAtNextEvent: enabled,
    annualOrbitStopTimeMs: state.orbitLessonTargetStepIndex !== null ? state.annualOrbitStopTimeMs : enabled ? getNextAnnualStop(state.simulationTimeMs) : null,
  })),
  seekAnnualOrbitTime: timeMs => {
    if (!Number.isFinite(timeMs)) throw new RangeError('invalid annual seek time')
    set({ simulationTimeMs: timeMs, isAnnualOrbitPlaying: false, isPlaying: false, annualOrbitStopTimeMs: null, orbitLessonStepIndex: null, orbitLessonTargetStepIndex: null })
  },
  stepAnnualOrbitDay: direction => set(state => ({
    orbitLessonStepIndex: null, orbitLessonTargetStepIndex: null,
    simulationTimeMs: stepAnnualDay(state.simulationTimeMs, direction), isAnnualOrbitPlaying: false, isPlaying: false, annualOrbitStopTimeMs: null,
  })),
  advanceAnnualOrbitTime: elapsedRealMs => set(state => {
    if (!state.isAnnualOrbitPlaying || state.activeModuleId !== 'revolution' || state.learningMode !== 'explore') return {}
    const next = advanceAnnualTimeline(state.simulationTimeMs, elapsedRealMs, state.annualOrbitDurationSeconds, state.annualOrbitPlaybackYear, state.annualOrbitStopTimeMs)
    return { simulationTimeMs: next.timeMs, isAnnualOrbitPlaying: !next.shouldPause,
      ...(next.shouldPause && state.orbitLessonTargetStepIndex !== null ? { orbitLessonStepIndex: state.orbitLessonTargetStepIndex, orbitLessonTargetStepIndex: null, annualOrbitStopTimeMs: null } : {}),
    }
  }),
  seasonsComparisonLatitudeDegrees: 30,
  setSeasonsComparisonLatitude: latitudeDegrees => {
    assertComparisonLatitude(latitudeDegrees)
    set({ seasonsComparisonLatitudeDegrees: latitudeDegrees })
  },
  subsolarExplanationStep: 1,
  setSubsolarExplanationStep: step => {
    if (!Number.isInteger(step) || step < 1 || step > 4) throw new RangeError('subsolar explanation step must be between 1 and 4')
    set({ subsolarExplanationStep: step })
  },
  dateLineDirection: 'east',
  dateLineProgress: 0,
  setDateLineDirection: direction => {
    assertDateLineDirection(direction)
    set({ dateLineDirection: direction, dateLineProgress: 0 })
  },
  setDateLineProgress: progress => {
    assertDateLineProgress(progress)
    set({ dateLineProgress: progress })
  },
  localTimeOffsetA: 0,
  localTimeOffsetB: 480,
  setLocalTimeOffset: (point, offsetMinutes) => {
    assertFixedUtcOffset(offsetMinutes)
    set(point === 'A' ? { localTimeOffsetA: offsetMinutes } : { localTimeOffsetB: offsetMinutes })
  },
  localTimeLongitudeA: 0,
  localTimeLongitudeB: 120,
  setLocalTimeLongitude: (point, longitudeDegrees) => {
    assertTeachingLongitude(longitudeDegrees)
    set(point === 'A' ? { localTimeLongitudeA: longitudeDegrees } : { localTimeLongitudeB: longitudeDegrees })
  },
  activeModuleId: 'rotation',
  simulationTimeMs: DEFAULT_SIMULATION_TIME_MS,
  isPlaying: false,
  speed: DEFAULT_SIMULATION_SPEED,
  teachingLayers: createDefaultTeachingLayers(),
  cameraViewPreset: 'default',
  cameraViewRequestId: 0,
  observerLatitudeDegrees: 30,
  observerLongitudeDegrees: OBSERVER_MARKER_DEFAULT_LONGITUDE_DEGREES,
  showDayNightObserverMarker: true,
  isDayNightGuidedMode: false,
  dayNightStep: 1,
  learningMode: 'explore',
  teacherTopic: 'rotation',
  teacherStepIndex: 0,
  isTeacherPlaying: false,
  showSolarNoonGuide: false,
  educationOverlayMessage: null,
  practiceSequence: 0,
  practiceQuestion: null,
  practiceSelectedAnswerId: null,
  practiceSubmitted: false,
  practiceExplanationIndex: 0,
  setActiveModule: (activeModuleId) =>
    set((state) => {
      const config = getLabModuleRuntimeConfig(activeModuleId)
      return {
        activeModuleId,
        orbitLessonStepIndex: null, orbitLessonTargetStepIndex: null,
        ...(activeModuleId === 'revolution' ? { isPlaying: false } : {}),
        isAnnualOrbitPlaying: false,
        annualOrbitStopTimeMs: null,
        cameraViewPreset: config.defaultCamera,
        cameraViewRequestId: state.cameraViewRequestId + 1,
        teachingLayers: { ...config.defaultLayers },
        isDayNightGuidedMode: activeModuleId === 'terminator',
        dayNightStep: activeModuleId === 'terminator' ? 3 : 1,
        showSolarNoonGuide: activeModuleId === 'solar-altitude',
        educationOverlayMessage: null,
      }
    }),
  setSimulationTime: (simulationTimeMs) => set({ simulationTimeMs, isAnnualOrbitPlaying: false, annualOrbitStopTimeMs: null, orbitLessonStepIndex: null, orbitLessonTargetStepIndex: null }),
  advanceSimulationTime: (elapsedSimulationMs) =>
    set((state) => ({ simulationTimeMs: state.simulationTimeMs + elapsedSimulationMs })),
  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSpeed: (speed) => set({ speed }),
  toggleTeachingLayer: (layerId) =>
    set((state) => ({
      teachingLayers: {
        ...state.teachingLayers,
        [layerId]: !state.teachingLayers[layerId],
      },
    })),
  setTeachingLayer: (layerId, visible) =>
    set((state) => ({
      teachingLayers: {
        ...state.teachingLayers,
        [layerId]: visible,
      },
    })),
  requestCameraView: (cameraViewPreset) =>
    set((state) => ({
      cameraViewPreset,
      cameraViewRequestId: state.cameraViewRequestId + 1,
    })),
  setObserverLatitude: (latitudeDegrees) =>
    set({ observerLatitudeDegrees: Math.max(-90, Math.min(90, latitudeDegrees)) }),
  toggleDayNightObserverMarker: () =>
    set((state) => ({ showDayNightObserverMarker: !state.showDayNightObserverMarker })),
  toggleDayNightAlternation: () =>
    set((state) =>
      state.isPlaying
        ? { isPlaying: false }
        : {
            isPlaying: true,
            cameraViewPreset: 'sun-side',
            cameraViewRequestId: state.cameraViewRequestId + 1,
          },
    ),
  toggleDayNightGuidedMode: () =>
    set((state) => ({
      isDayNightGuidedMode: !state.isDayNightGuidedMode,
      dayNightStep: state.isDayNightGuidedMode ? state.dayNightStep : 1,
    })),
  setDayNightStep: (dayNightStep) => set({ dayNightStep }),
  setLearningMode: (learningMode) =>
    set((state) => {
      // 更换教学模式必须结束自由探索的全年演示。
      const annualReset = { isAnnualOrbitPlaying: false, annualOrbitStopTimeMs: null, orbitLessonStepIndex: null, orbitLessonTargetStepIndex: null }
      if (learningMode === 'teach') {
        const script = getTeachingScript(state.teacherTopic)
        const action = script.steps[0]?.action
        return {
          learningMode,
          ...annualReset,
          isTeacherPlaying: false,
          teacherStepIndex: 0,
          practiceQuestion: null,
          practiceSubmitted: false,
          ...createSceneStatePatch(state, action),
        }
      }
      if (learningMode === 'practice') {
        const question = generateQuestion(
          createPracticeSnapshot(state),
          state.practiceSequence,
        )
        return {
          learningMode,
          isTeacherPlaying: false,
          practiceQuestion: question,
          ...annualReset,
          practiceSelectedAnswerId: null,
          practiceSubmitted: false,
          practiceExplanationIndex: 0,
          educationOverlayMessage: null,
          teachingLayers: {
            ...state.teachingLayers,
            subsolarPoint: false,
          },
          showSolarNoonGuide: false,
          isPlaying: false,
          ...createSceneStatePatch(state, question.initialSceneAction),
        }
      }
      return {
        learningMode,
        ...annualReset,
        isTeacherPlaying: false,
        practiceQuestion: null,
        practiceSubmitted: false,
        educationOverlayMessage: null,
        teachingLayers: {
          ...state.teachingLayers,
          subsolarPoint: false,
        },
        showSolarNoonGuide: false,
      }
    }),
  selectTeacherTopic: (teacherTopic) =>
    set((state) => {
      const script = getTeachingScript(teacherTopic)
      return {
        teacherTopic,
        teacherStepIndex: 0,
        isTeacherPlaying: false,
        ...createSceneStatePatch(state, script.steps[0]?.action),
      }
    }),
  previousTeacherStep: () =>
    set((state) => {
      const script = getTeachingScript(state.teacherTopic)
      const teacherStepIndex = Math.max(0, state.teacherStepIndex - 1)
      return {
        teacherStepIndex,
        isTeacherPlaying: false,
        ...createSceneStatePatch(state, script.steps[teacherStepIndex]?.action),
      }
    }),
  nextTeacherStep: () =>
    set((state) => {
      const script = getTeachingScript(state.teacherTopic)
      const finalIndex = script.steps.length - 1
      const teacherStepIndex = Math.min(finalIndex, state.teacherStepIndex + 1)
      return {
        teacherStepIndex,
        isTeacherPlaying: teacherStepIndex < finalIndex ? state.isTeacherPlaying : false,
        ...createSceneStatePatch(state, script.steps[teacherStepIndex]?.action),
      }
    }),
  toggleTeacherPlaying: () =>
    set((state) => ({ isTeacherPlaying: !state.isTeacherPlaying })),
  resetTeacherDemo: () =>
    set((state) => {
      const script = getTeachingScript(state.teacherTopic)
      return {
        teacherStepIndex: 0,
        isTeacherPlaying: false,
        ...createSceneStatePatch(state, script.steps[0]?.action),
      }
    }),
  applySceneAction: (action) =>
    set((state) => createSceneStatePatch(state, action)),
  selectPracticeAnswer: (practiceSelectedAnswerId) =>
    set((state) =>
      state.practiceSubmitted ? {} : { practiceSelectedAnswerId },
    ),
  submitPracticeAnswer: () =>
    set((state) => {
      if (!state.practiceQuestion || !state.practiceSelectedAnswerId) return {}
      return {
        practiceSubmitted: true,
        practiceExplanationIndex: 0,
        ...createSceneStatePatch(state, state.practiceQuestion.explanationSteps[0]?.action),
      }
    }),
  nextPracticeExplanationStep: () =>
    set((state) => {
      const steps = state.practiceQuestion?.explanationSteps ?? []
      const practiceExplanationIndex = Math.min(
        Math.max(0, steps.length - 1),
        state.practiceExplanationIndex + 1,
      )
      return {
        practiceExplanationIndex,
        ...createSceneStatePatch(state, steps[practiceExplanationIndex]?.action),
      }
    }),
  previousPracticeExplanationStep: () =>
    set((state) => {
      const steps = state.practiceQuestion?.explanationSteps ?? []
      const practiceExplanationIndex = Math.max(0, state.practiceExplanationIndex - 1)
      return {
        practiceExplanationIndex,
        ...createSceneStatePatch(state, steps[practiceExplanationIndex]?.action),
      }
    }),
  generateNextQuestion: () =>
    set((state) => {
      const practiceSequence = state.practiceSequence + 1
      const question = generateQuestion(createPracticeSnapshot(state), practiceSequence)
      return {
        practiceSequence,
        practiceQuestion: question,
        practiceSelectedAnswerId: null,
        practiceSubmitted: false,
        practiceExplanationIndex: 0,
        educationOverlayMessage: null,
        teachingLayers: {
          ...state.teachingLayers,
          subsolarPoint: false,
        },
        showSolarNoonGuide: false,
        isPlaying: false,
        ...createSceneStatePatch(state, question.initialSceneAction),
      }
    }),
  resetSimulation: () =>
    set((state) => ({
      orbitLessonStepIndex: null, orbitLessonTargetStepIndex: null,
      annualOrbitDurationSeconds: DEFAULT_ANNUAL_ORBIT_DURATION,
      isAnnualOrbitPlaying: false,
      annualOrbitPlaybackYear: 2026,
      annualOrbitStopAtNextEvent: false,
      annualOrbitStopTimeMs: null,
      seasonsComparisonLatitudeDegrees: 30,
      subsolarExplanationStep: 1,
      dateLineDirection: 'east',
      dateLineProgress: 0,
      localTimeOffsetA: 0,
      localTimeOffsetB: 480,
      localTimeLongitudeA: 0,
      localTimeLongitudeB: 120,
      simulationTimeMs: DEFAULT_SIMULATION_TIME_MS,
      isPlaying: false,
      speed: DEFAULT_SIMULATION_SPEED,
      observerLatitudeDegrees: 30,
      observerLongitudeDegrees: OBSERVER_MARKER_DEFAULT_LONGITUDE_DEGREES,
      showDayNightObserverMarker: true,
      isDayNightGuidedMode: false,
      dayNightStep: 1,
      teachingLayers: createDefaultTeachingLayers(),
      showSolarNoonGuide: state.activeModuleId === 'solar-altitude',
      educationOverlayMessage: null,
    })),
}))

function createPracticeSnapshot(state: EarthLabState): PracticeSnapshot {
  return {
    activeModuleId: state.activeModuleId,
    simulationTimeMs: state.simulationTimeMs, latitudeDegrees: state.observerLatitudeDegrees,
    localTimeLongitudeA: state.localTimeLongitudeA, localTimeLongitudeB: state.localTimeLongitudeB,
    localTimeOffsetA: state.localTimeOffsetA, localTimeOffsetB: state.localTimeOffsetB,
    dateLineDirection: state.dateLineDirection, dateLineProgress: state.dateLineProgress,
  }
}

function createSceneStatePatch(
  state: EarthLabState,
  action?: SceneAction,
): Partial<EarthLabState> {
  if (!action) return {}
  if (action.localTimeLongitudeA !== undefined) assertTeachingLongitude(action.localTimeLongitudeA)
  if (action.localTimeLongitudeB !== undefined) assertTeachingLongitude(action.localTimeLongitudeB)
  if (action.localTimeOffsetA !== undefined) assertFixedUtcOffset(action.localTimeOffsetA)
  if (action.localTimeOffsetB !== undefined) assertFixedUtcOffset(action.localTimeOffsetB)
  if (action.dateLineDirection !== undefined) assertDateLineDirection(action.dateLineDirection)
  if (action.dateLineProgress !== undefined) assertDateLineProgress(action.dateLineProgress)
  const cameraChanged = action.cameraPreset !== undefined
  const moduleId = action.moduleId

  return {
    isAnnualOrbitPlaying: false,
    orbitLessonStepIndex: null, orbitLessonTargetStepIndex: null,
    annualOrbitStopTimeMs: null,
    ...(moduleId ? { activeModuleId: moduleId } : {}),
    ...(action.localTimeLongitudeA !== undefined ? { localTimeLongitudeA: action.localTimeLongitudeA } : {}),
    ...(action.localTimeLongitudeB !== undefined ? { localTimeLongitudeB: action.localTimeLongitudeB } : {}),
    ...(action.localTimeOffsetA !== undefined ? { localTimeOffsetA: action.localTimeOffsetA } : {}),
    ...(action.localTimeOffsetB !== undefined ? { localTimeOffsetB: action.localTimeOffsetB } : {}),
    ...(action.dateLineDirection !== undefined ? { dateLineDirection: action.dateLineDirection } : {}),
    ...(action.dateLineProgress !== undefined ? { dateLineProgress: action.dateLineProgress } : {}),
    ...(action.simulationTimeMs !== undefined
      ? { simulationTimeMs: action.simulationTimeMs }
      : {}),
    ...(action.latitudeDegrees !== undefined
      ? { observerLatitudeDegrees: action.latitudeDegrees }
      : {}),
    ...(cameraChanged
      ? {
          cameraViewPreset: action.cameraPreset,
          cameraViewRequestId: state.cameraViewRequestId + 1,
        }
      : {}),
    ...(action.dayNightStep !== undefined
      ? {
          isDayNightGuidedMode: true,
          dayNightStep: action.dayNightStep,
        }
      : moduleId === 'day-night'
        ? { isDayNightGuidedMode: false }
        : {}),
    teachingLayers: {
      ...state.teachingLayers,
      ...action.teachingLayers,
      subsolarPoint: action.showSubsolarMarker ?? false,
    },
    showSolarNoonGuide: action.showSolarNoonGuide ?? false,
    educationOverlayMessage: action.overlayMessage ?? null,
    isPlaying: false,
  }
}
