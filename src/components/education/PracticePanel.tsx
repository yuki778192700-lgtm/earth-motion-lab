import { useEarthLabStore } from '../../store/useEarthLabStore'
import { useShallow } from 'zustand/react/shallow'
import { getTeachingObservations } from '../../education/teachingObservations'

export function PracticePanel() {
  const question = useEarthLabStore((state) => state.practiceQuestion)
  const selectedAnswerId = useEarthLabStore((state) => state.practiceSelectedAnswerId)
  const submitted = useEarthLabStore((state) => state.practiceSubmitted)
  const explanationIndex = useEarthLabStore((state) => state.practiceExplanationIndex)
  const selectAnswer = useEarthLabStore((state) => state.selectPracticeAnswer)
  const submitAnswer = useEarthLabStore((state) => state.submitPracticeAnswer)
  const observationState = useEarthLabStore(useShallow(state => ({
    simulationTimeMs: state.simulationTimeMs, observerLatitudeDegrees: state.observerLatitudeDegrees,
    localTimeLongitudeA: state.localTimeLongitudeA, localTimeLongitudeB: state.localTimeLongitudeB,
    localTimeOffsetA: state.localTimeOffsetA, localTimeOffsetB: state.localTimeOffsetB,
    dateLineDirection: state.dateLineDirection, dateLineProgress: state.dateLineProgress,
  })))

  if (!question) return null
  const correct = selectedAnswerId === question.correctAnswerId
  const activeExplanation = question.explanationSteps[explanationIndex]
  const observations = submitted ? getTeachingObservations(question.topic, observationState) : []

  return (
    <aside className="data-panel education-panel practice-panel" aria-label="练习模式面板">
      <div className="panel-heading">
        <span><small>PRACTICE</small><strong>练习模式</strong></span>
        <span className="question-type-badge">{question.typeLabel}</span>
      </div>

      <section className="data-section question-card">
        <h2>根据当前3D场景作答</h2>
        <p className="question-prompt">{question.prompt}</p>
        <div className="question-options">
          {question.options.map((item, index) => {
            const isCorrect = submitted && item.id === question.correctAnswerId
            const isWrong = submitted && item.id === selectedAnswerId && !isCorrect
            return (
              <button
                key={item.id}
                type="button"
                disabled={submitted}
                data-selected={selectedAnswerId === item.id}
                data-correct={isCorrect}
                data-wrong={isWrong}
                onClick={() => selectAnswer(item.id)}
              >
                <span>{String.fromCharCode(65 + index)}</span>{item.label}
              </button>
            )
          })}
        </div>
        {!submitted ? (
          <button className="submit-answer" type="button" disabled={!selectedAnswerId} onClick={submitAnswer}>
            提交答案
          </button>
        ) : null}
      </section>

      {submitted ? (
        <section className="data-section answer-explanation">
          <strong data-correct={correct}>{correct ? '回答正确' : '回答错误'}</strong>
          <p>正确答案：{question.options.find(item => item.id === question.correctAnswerId)?.label}</p>
          <p>{question.explanation}</p>
          {activeExplanation ? (
            <div className="explanation-step">
              <span>模型解释 {explanationIndex + 1}/{question.explanationSteps.length}</span>
              <b>{activeExplanation.title}</b>
              <p>{activeExplanation.explanation}</p>
            </div>
          ) : null}
          {observations.length > 0 ? <div aria-label="答案演示实时观测数据"><h3>模型观测数据</h3>
            <dl>{observations.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
          </div> : null}
        </section>
      ) : null}
    </aside>
  )
}
