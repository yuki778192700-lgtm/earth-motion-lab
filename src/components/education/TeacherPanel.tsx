import { getTeachingScript, TEACHING_SCRIPTS } from '../../education/teachingScripts'
import { useEarthLabStore } from '../../store/useEarthLabStore'

export function TeacherPanel() {
  const topic = useEarthLabStore((state) => state.teacherTopic)
  const stepIndex = useEarthLabStore((state) => state.teacherStepIndex)
  const selectTopic = useEarthLabStore((state) => state.selectTeacherTopic)
  const script = getTeachingScript(topic)
  const step = script.steps[stepIndex] ?? script.steps[0]!

  return (
    <aside className="data-panel education-panel teacher-panel" aria-label="教师演示面板">
      <div className="panel-heading">
        <span><small>TEACHER DEMO</small><strong>教师演示</strong></span>
        <span className="panel-sequence">{stepIndex + 1}/{script.steps.length}</span>
      </div>

      <section className="data-section">
        <h2>选择知识点</h2>
        <div className="teaching-topic-grid">
          {TEACHING_SCRIPTS.map((item) => (
            <button key={item.id} type="button" data-active={topic === item.id} onClick={() => selectTopic(item.id)}>
              {item.title}
            </button>
          ))}
        </div>
      </section>

      <section className="data-section teaching-current-step">
        <span className="teaching-step-index">STEP {stepIndex + 1}</span>
        <h2>{step.title}</h2>
        <p>{step.explanation}</p>
      </section>

      <section className="data-section">
        <h2>演示流程</h2>
        <ol className="teaching-step-list">
          {script.steps.map((item, index) => (
            <li key={`${item.title}-${index}`} data-active={index === stepIndex}>
              <span>{index + 1}</span>{item.title}
            </li>
          ))}
        </ol>
      </section>
    </aside>
  )
}
