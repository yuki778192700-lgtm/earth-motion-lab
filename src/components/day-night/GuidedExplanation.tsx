import { useEarthLabStore } from '../../store/useEarthLabStore'
import type { DayNightStep } from '../../types/lab'

const STEPS: ReadonlyArray<{ step: DayNightStep; label: string; description: string }> = [
  { step: 1, label: '太阳光线', description: '太阳距离遥远，到达地球的光线近似平行。' },
  { step: 2, label: '昼夜半球', description: '朝向太阳的一侧为昼半球，背向太阳的一侧为夜半球。' },
  { step: 3, label: '晨昏线', description: '晨线进入白昼，昏线进入黑夜；两者共同构成晨昏圈。' },
  { step: 4, label: '所选纬线', description: '同一纬线随地球自转依次经过昼半球和夜半球。' },
  { step: 5, label: '昼弧与夜弧', description: '纬线位于昼半球的部分是昼弧，其余部分是夜弧。' },
  { step: 6, label: '昼夜长短', description: '昼弧与夜弧的比例决定该纬度当天的昼长和夜长。' },
]

export function GuidedExplanation() {
  const isGuidedMode = useEarthLabStore((state) => state.isDayNightGuidedMode)
  const step = useEarthLabStore((state) => state.dayNightStep)
  const toggleGuidedMode = useEarthLabStore((state) => state.toggleDayNightGuidedMode)
  const setStep = useEarthLabStore((state) => state.setDayNightStep)
  const activeStep = STEPS.find((item) => item.step === step) ?? STEPS[0]!

  return (
    <section className="data-section guided-explanation" aria-labelledby="guided-heading">
      <div className="guided-heading-row">
        <h2 id="guided-heading">逐步讲解模式</h2>
        <button
          type="button"
          className="guided-toggle"
          data-active={isGuidedMode}
          onClick={toggleGuidedMode}
        >
          {isGuidedMode ? '退出讲解' : '开始讲解'}
        </button>
      </div>

      {isGuidedMode ? (
        <>
          <div className="guided-steps" aria-label="讲解步骤">
            {STEPS.map((item) => (
              <button
                key={item.step}
                type="button"
                data-active={item.step === step}
                onClick={() => setStep(item.step)}
                aria-label={`Step ${item.step} ${item.label}`}
              >
                {item.step}
              </button>
            ))}
          </div>
          <div className="guided-copy">
            <strong>Step {activeStep.step} · {activeStep.label}</strong>
            <p>{activeStep.description}</p>
          </div>
          <div className="guided-actions">
            <button
              type="button"
              disabled={step === 1}
              onClick={() => setStep((step - 1) as DayNightStep)}
            >
              上一步
            </button>
            <button
              type="button"
              disabled={step === 6}
              onClick={() => setStep((step + 1) as DayNightStep)}
            >
              下一步
            </button>
          </div>
        </>
      ) : (
        <p className="guided-summary">完整视图已显示。进入讲解后将按六个步骤逐层呈现。</p>
      )}
    </section>
  )
}
