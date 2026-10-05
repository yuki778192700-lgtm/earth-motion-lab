import { describe, expect, it } from 'vitest'
import { getEarthSurfaceRotationRadians } from './earthSurfacePose'
import { getEarthRotationAngleRadians } from './earthRotation'
import { calculateEarthOrbitState, calculateOrbitAlignedEarthRotationRadians } from '../orbit/earthOrbit'

const START = Date.UTC(2026, 0, 1)

describe('公转教学冻结地表自转', () => {
  it('日期与时刻推进均不改变固定地表姿态', () => {
    for (const time of [START, START + 3_600_000, Date.UTC(2026, 5, 21), Date.UTC(2026, 11, 31)]) {
      expect(getEarthSurfaceRotationRadians(time, 'fixed')).toBe(0)
    }
  })

  it('冻结地表时公转位置仍随日期变化', () => {
    const summer = Date.UTC(2026, 5, 21)
    expect(calculateEarthOrbitState(START).scenePosition).not.toEqual(calculateEarthOrbitState(summer).scenePosition)
    expect(getEarthSurfaceRotationRadians(START, 'fixed')).toBe(getEarthSurfaceRotationRadians(summer, 'fixed'))
  })

  it('其他模块的平均太阳日自转保持原计算，时间推进仍会自转', () => {
    expect(getEarthSurfaceRotationRadians(START, 'solar')).toBe(getEarthRotationAngleRadians(START))
    expect(getEarthSurfaceRotationRadians(START + 3_600_000, 'solar')).not.toBe(getEarthSurfaceRotationRadians(START, 'solar'))
  })

  it('保留原有公转对齐自转计算供其他调用，不改科学公式', () => {
    expect(getEarthSurfaceRotationRadians(START, 'orbit-aligned')).toBe(calculateOrbitAlignedEarthRotationRadians(START))
  })
})
