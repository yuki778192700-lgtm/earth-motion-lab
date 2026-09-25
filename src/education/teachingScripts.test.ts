import { describe, expect, it } from 'vitest'
import { TEACHING_SCRIPTS, getTeachingScript } from './teachingScripts'

describe('teaching scripts', () => {
  it('覆盖八个教师演示知识点，且每个步骤都有场景动作', () => {
    expect(TEACHING_SCRIPTS).toHaveLength(8)
    expect(new Set(TEACHING_SCRIPTS.map((script) => script.id)).size).toBe(8)

    for (const script of TEACHING_SCRIPTS) {
      expect(script.steps.length).toBeGreaterThanOrEqual(3)
      for (const step of script.steps) {
        expect(step.durationMs).toBeGreaterThan(0)
        expect(step.action.moduleId).toBeDefined()
      }
    }
  })

  it('晨昏线演示严格按六步推进', () => {
    const script = getTeachingScript('terminator')
    expect(script.steps.map((step) => step.action.dayNightStep)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('太阳直射点演示使用教材黄赤交角 23°26′', () => {
    const script = getTeachingScript('subsolar-point')
    expect(script.steps[1]?.action.latitudeDegrees).toBeCloseTo(23 + 26 / 60, 10)
    expect(script.steps[3]?.action.latitudeDegrees).toBeCloseTo(-(23 + 26 / 60), 10)
  })
})
