import { getTeachingScript } from '../../education/teachingScripts'
import { useEarthLabStore } from '../../store/useEarthLabStore'

export function EducationControls() {
  const mode = useEarthLabStore((state) => state.learningMode)
  const topic = useEarthLabStore((state) => state.teacherTopic)
  const teacherStepIndex = useEarthLabStore((state) => state.teacherStepIndex)
  const isTeacherPlaying = useEarthLabStore((state) => state.isTeacherPlaying)
  const previousTeacherStep = useEarthLabStore((state) => state.previousTeacherStep)
  const nextTeacherStep = useEarthLabStore((state) => state.nextTeacherStep)
  const toggleTeacherPlaying = useEarthLabStore((state) => state.toggleTeacherPlaying)
  const resetTeacherDemo = useEarthLabStore((state) => state.resetTeacherDemo)
  const question = useEarthLabStore((state) => state.practiceQuestion)
  const submitted = useEarthLabStore((state) => state.practiceSubmitted)
  const explanationIndex = useEarthLabStore((state) => state.practiceExplanationIndex)
  const previousExplanation = useEarthLabStore((state) => state.previousPracticeExplanationStep)
  const nextExplanation = useEarthLabStore((state) => state.nextPracticeExplanationStep)
  const nextQuestion = useEarthLabStore((state) => state.generateNextQuestion)

  if (mode === 'teach') {
    const script = getTeachingScript(topic)
    return (
      <section className="education-controls" aria-label="教师演示控制器">
        <div className="education-control-title"><small>教师演示</small><strong>{script.title}</strong></div>
        <button type="button" disabled={teacherStepIndex === 0} onClick={previousTeacherStep}>上一步</button>
        <button type="button" className="primary-control" onClick={toggleTeacherPlaying}>{isTeacherPlaying ? '暂停' : '播放'}</button>
        <button type="button" disabled={teacherStepIndex === script.steps.length - 1} onClick={nextTeacherStep}>下一步</button>
        <button type="button" onClick={resetTeacherDemo}>重置</button>
        <div className="education-progress"><i style={{ width: `${((teacherStepIndex + 1) / script.steps.length) * 100}%` }} /></div>
      </section>
    )
  }

  return (
    <section className="education-controls practice-controls" aria-label="练习解释控制器">
      <div className="education-control-title"><small>当前题型</small><strong>{question?.typeLabel ?? '练习'}</strong></div>
      {submitted && question ? (
        <>
          <button type="button" disabled={explanationIndex === 0} onClick={previousExplanation}>上一步</button>
          <button type="button" disabled={explanationIndex === question.explanationSteps.length - 1} onClick={nextExplanation}>下一步解释</button>
          <button type="button" className="primary-control" onClick={nextQuestion}>下一题</button>
        </>
      ) : (
        <span className="practice-hint">旋转模型观察后，在右侧选择答案。</span>
      )}
    </section>
  )
}
