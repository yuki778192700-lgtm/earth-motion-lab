import { getTeachingScript, TEACHING_SCRIPTS } from '../../education/teachingScripts'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { getTeachingObservations } from '../../education/teachingObservations'
import { useShallow } from 'zustand/react/shallow'

export function TeacherPanel() {
  const topic = useEarthLabStore((state) => state.teacherTopic)
  const stepIndex = useEarthLabStore((state) => state.teacherStepIndex)
  const selectTopic = useEarthLabStore((state) => state.selectTeacherTopic)
  const script = getTeachingScript(topic)
  const step = script.steps[stepIndex] ?? script.steps[0]!
  const observationState = useEarthLabStore(useShallow(state => ({
    simulationTimeMs: state.simulationTimeMs,
    observerLatitudeDegrees: state.observerLatitudeDegrees,
    localTimeLongitudeA: state.localTimeLongitudeA, localTimeLongitudeB: state.localTimeLongitudeB,
    localTimeOffsetA: state.localTimeOffsetA, localTimeOffsetB: state.localTimeOffsetB,
    dateLineDirection: state.dateLineDirection, dateLineProgress: state.dateLineProgress,
  })))
  const observations = getTeachingObservations(topic, observationState)

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

      {observations.length > 0 ? <section className="data-section" aria-label="教师演示实时观测数据">
        <h2>模型观测数据</h2>
        <dl>{observations.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
      </section> : null}

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
