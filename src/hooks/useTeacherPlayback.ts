import { useEffect } from 'react'
import { getTeachingScript } from '../education/teachingScripts'
import { useEarthLabStore } from '../store/useEarthLabStore'

export function useTeacherPlayback(): void {
  const learningMode = useEarthLabStore((state) => state.learningMode)
  const teacherTopic = useEarthLabStore((state) => state.teacherTopic)
  const teacherStepIndex = useEarthLabStore((state) => state.teacherStepIndex)
  const isTeacherPlaying = useEarthLabStore((state) => state.isTeacherPlaying)
  const nextTeacherStep = useEarthLabStore((state) => state.nextTeacherStep)

  useEffect(() => {
    if (learningMode !== 'teach' || !isTeacherPlaying) return
    const script = getTeachingScript(teacherTopic)
    const step = script.steps[teacherStepIndex]
    if (!step) return

    const timeoutId = window.setTimeout(nextTeacherStep, step.durationMs)
    return () => window.clearTimeout(timeoutId)
  }, [isTeacherPlaying, learningMode, nextTeacherStep, teacherStepIndex, teacherTopic])
}
