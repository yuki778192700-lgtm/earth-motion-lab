import { describe, expect, it } from 'vitest'
import { Vector3 } from 'three'
import {
  calculateLightPropagationDirection,
  createSunDirectionVector,
  getFixedSunPosition,
  getSunlightPropagationDirection,
  SUN_DIRECTION,
} from './solarDirection'

describe('固定太阳方向单一来源', () => {
  it('SUN_DIRECTION 是指向世界 -X 的单位向量', () => {
    expect(SUN_DIRECTION.toArray()).toEqual([-1, 0, 0])
    expect(createSunDirectionVector().length()).toBeCloseTo(1, 12)
  })

  it('光线传播方向始终与 SUN_DIRECTION 相反', () => {
    expect(
      getSunlightPropagationDirection().dot(createSunDirectionVector()),
    ).toBeCloseTo(-1, 12)
  })

  it('任意目标点的 DirectionalLight position → target 均与辅助光线一致', () => {
    const targets = [new Vector3(), new Vector3(1.15, 0, 0), new Vector3(-2, 3, 4)]
    for (const target of targets) {
      const position = getFixedSunPosition(target, 8)
      const actual = calculateLightPropagationDirection(position, target)
      expect(actual.dot(getSunlightPropagationDirection())).toBeCloseTo(1, 12)
    }
  })

  it('拒绝无效的太阳示意距离', () => {
    expect(() => getFixedSunPosition(new Vector3(), 0)).toThrow(RangeError)
    expect(() => getFixedSunPosition(new Vector3(), Number.NaN)).toThrow(RangeError)
  })
})
