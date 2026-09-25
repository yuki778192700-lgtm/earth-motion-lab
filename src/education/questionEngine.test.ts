import { describe, expect, it } from 'vitest'
import { generateQuestion } from './questionEngine'

const snapshot = {
  simulationTimeMs: Date.parse('2026-06-21T08:24:00.000Z'),
  latitudeDegrees: 40,
}

describe('generateQuestion', () => {
  it('依次覆盖九类题型且每题答案都存在于选项中', () => {
    const types = Array.from({ length: 9 }, (_, sequence) => {
      const question = generateQuestion(snapshot, sequence)
      expect(question.options.some((item) => item.id === question.correctAnswerId)).toBe(true)
      expect(new Set(question.options.map((item) => item.label)).size).toBe(question.options.length)
      expect(question.explanation.length).toBeGreaterThan(10)
      expect(question.explanationSteps.length).toBeGreaterThan(0)
      return question.type
    })
    expect(new Set(types).size).toBe(9)
  })

  it('相同场景和序号生成可重复题目', () => {
    expect(generateQuestion(snapshot, 6)).toEqual(generateQuestion(snapshot, 6))
  })

  it('极昼场景仍能生成有效昼长题', () => {
    const polarSnapshot = { ...snapshot, latitudeDegrees: 90 }
    const question = generateQuestion(polarSnapshot, 6)
    expect(question.options.find((item) => item.id === question.correctAnswerId)?.label).toBe('24.0小时')
  })

  it('地方时四舍五入不会产生 12:60 一类无效时刻', () => {
    const question = generateQuestion(
      { simulationTimeMs: Date.parse('2026-06-21T04:59:40.000Z'), latitudeDegrees: 0 },
      8,
    )
    expect(question.options.find((item) => item.id === question.correctAnswerId)?.label).toBe('13:00')
    expect(question.options.every((item) => !item.label.includes(':60'))).toBe(true)
  })
})
