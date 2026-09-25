import { useEarthLabStore } from '../../store/useEarthLabStore'

export function PracticePanel() {
  const question = useEarthLabStore((state) => state.practiceQuestion)
  const selectedAnswerId = useEarthLabStore((state) => state.practiceSelectedAnswerId)
  const submitted = useEarthLabStore((state) => state.practiceSubmitted)
  const explanationIndex = useEarthLabStore((state) => state.practiceExplanationIndex)
  const selectAnswer = useEarthLabStore((state) => state.selectPracticeAnswer)
  const submitAnswer = useEarthLabStore((state) => state.submitPracticeAnswer)

  if (!question) return null
  const correct = selectedAnswerId === question.correctAnswerId
  const activeExplanation = question.explanationSteps[explanationIndex]

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
          <p>{question.explanation}</p>
          {activeExplanation ? (
            <div className="explanation-step">
              <span>模型解释 {explanationIndex + 1}/{question.explanationSteps.length}</span>
              <b>{activeExplanation.title}</b>
              <p>{activeExplanation.explanation}</p>
            </div>
          ) : null}
        </section>
      ) : null}
    </aside>
  )
}
