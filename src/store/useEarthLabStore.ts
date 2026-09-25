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
} from '../types/education'
import { getTeachingScript } from '../education/teachingScripts'
import { generateQuestion } from '../education/questionEngine'

const DEFAULT_SIMULATION_TIME_MS = Date.parse('2026-06-21T04:00:00.000Z')

interface EarthLabState {
  activeModuleId: LabModuleId
  simulationTimeMs: number
  isPlaying: boolean
  speed: SimulationSpeed
  showCoordinateGrid: boolean
  cameraViewPreset: CameraViewPreset
  cameraViewRequestId: number
  observerLatitudeDegrees: number
  isDayNightGuidedMode: boolean
  dayNightStep: DayNightStep
  learningMode: LearningMode
  teacherTopic: KnowledgeTopic
  teacherStepIndex: number
  isTeacherPlaying: boolean
  showSubsolarMarker: boolean
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
  toggleCoordinateGrid: () => void
  requestCameraView: (preset: CameraViewPreset) => void
  setObserverLatitude: (latitudeDegrees: number) => void
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
  activeModuleId: 'rotation',
  simulationTimeMs: DEFAULT_SIMULATION_TIME_MS,
  isPlaying: false,
  speed: 1,
  showCoordinateGrid: true,
  cameraViewPreset: 'default',
  cameraViewRequestId: 0,
  observerLatitudeDegrees: 30,
  isDayNightGuidedMode: false,
  dayNightStep: 1,
  learningMode: 'explore',
  teacherTopic: 'rotation',
  teacherStepIndex: 0,
  isTeacherPlaying: false,
  showSubsolarMarker: false,
  showSolarNoonGuide: false,
  educationOverlayMessage: null,
  practiceSequence: 0,
  practiceQuestion: null,
  practiceSelectedAnswerId: null,
  practiceSubmitted: false,
  practiceExplanationIndex: 0,
  setActiveModule: (activeModuleId) =>
    set({
      activeModuleId,
      ...(activeModuleId === 'day-night'
        ? { isDayNightGuidedMode: false as const, dayNightStep: 1 as const }
        : activeModuleId === 'terminator'
          ? { isDayNightGuidedMode: true as const, dayNightStep: 3 as const }
          : {}),
    }),
  setSimulationTime: (simulationTimeMs) => set({ simulationTimeMs }),
  advanceSimulationTime: (elapsedSimulationMs) =>
    set((state) => ({ simulationTimeMs: state.simulationTimeMs + elapsedSimulationMs })),
  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSpeed: (speed) => set({ speed }),
  toggleCoordinateGrid: () =>
    set((state) => ({ showCoordinateGrid: !state.showCoordinateGrid })),
  requestCameraView: (cameraViewPreset) =>
    set((state) => ({
      cameraViewPreset,
      cameraViewRequestId: state.cameraViewRequestId + 1,
    })),
  setObserverLatitude: (latitudeDegrees) =>
    set({ observerLatitudeDegrees: Math.max(-90, Math.min(90, latitudeDegrees)) }),
  toggleDayNightGuidedMode: () =>
    set((state) => ({
      isDayNightGuidedMode: !state.isDayNightGuidedMode,
      dayNightStep: state.isDayNightGuidedMode ? state.dayNightStep : 1,
    })),
  setDayNightStep: (dayNightStep) => set({ dayNightStep }),
  setLearningMode: (learningMode) =>
    set((state) => {
      if (learningMode === 'teach') {
        const script = getTeachingScript(state.teacherTopic)
        const action = script.steps[0]?.action
        return {
          learningMode,
          isTeacherPlaying: false,
          teacherStepIndex: 0,
          practiceQuestion: null,
          practiceSubmitted: false,
          ...createSceneStatePatch(state, action),
        }
      }
      if (learningMode === 'practice') {
        const question = generateQuestion(
          {
            simulationTimeMs: state.simulationTimeMs,
            latitudeDegrees: state.observerLatitudeDegrees,
          },
          state.practiceSequence,
        )
        return {
          learningMode,
          isTeacherPlaying: false,
          practiceQuestion: question,
          practiceSelectedAnswerId: null,
          practiceSubmitted: false,
          practiceExplanationIndex: 0,
          educationOverlayMessage: null,
          showSubsolarMarker: false,
          showSolarNoonGuide: false,
        }
      }
      return {
        learningMode,
        isTeacherPlaying: false,
        practiceQuestion: null,
        practiceSubmitted: false,
        educationOverlayMessage: null,
        showSubsolarMarker: false,
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
      return {
        practiceSequence,
        practiceQuestion: generateQuestion(
          {
            simulationTimeMs: state.simulationTimeMs,
            latitudeDegrees: state.observerLatitudeDegrees,
          },
          practiceSequence,
        ),
        practiceSelectedAnswerId: null,
        practiceSubmitted: false,
        practiceExplanationIndex: 0,
        educationOverlayMessage: null,
        showSubsolarMarker: false,
        showSolarNoonGuide: false,
      }
    }),
  resetSimulation: () =>
    set({
      simulationTimeMs: DEFAULT_SIMULATION_TIME_MS,
      isPlaying: false,
      speed: 1,
      observerLatitudeDegrees: 30,
      isDayNightGuidedMode: false,
      dayNightStep: 1,
      showSubsolarMarker: false,
      showSolarNoonGuide: false,
      educationOverlayMessage: null,
    }),
}))

function createSceneStatePatch(
  state: EarthLabState,
  action?: SceneAction,
): Partial<EarthLabState> {
  if (!action) return {}
  const cameraChanged = action.cameraPreset !== undefined
  const moduleId = action.moduleId

  return {
    ...(moduleId ? { activeModuleId: moduleId } : {}),
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
    showSubsolarMarker: action.showSubsolarMarker ?? false,
    showSolarNoonGuide: action.showSolarNoonGuide ?? false,
    educationOverlayMessage: action.overlayMessage ?? null,
    isPlaying: false,
  }
}
