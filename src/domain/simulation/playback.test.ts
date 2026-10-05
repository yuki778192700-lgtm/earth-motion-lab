import { describe, expect, it } from 'vitest'
import {
  calculateSimulationAdvance,
  DEFAULT_SIMULATION_SPEED,
  SIMULATION_SPEED_OPTIONS,
} from './playback'

describe('模拟播放速度', () => {
  it('只提供 1000×、2000×、3000×，默认采用 1000×', () => {
    expect(SIMULATION_SPEED_OPTIONS).toEqual([1_000, 2_000, 3_000])
    expect(DEFAULT_SIMULATION_SPEED).toBe(1_000)
  })

  it('三个档位按 1:2:3 推进模拟时间', () => {
    const advances = SIMULATION_SPEED_OPTIONS.map((speed) =>
      calculateSimulationAdvance(1_000, speed, true),
    )

    expect(advances).toEqual([1_000_000, 2_000_000, 3_000_000])
    expect(advances[1]! / advances[0]!).toBe(2)
    expect(advances[2]! / advances[0]!).toBe(3)
  })

  it('暂停后所有速度档位的时间增量均为 0', () => {
    for (const speed of SIMULATION_SPEED_OPTIONS) {
      expect(calculateSimulationAdvance(1_000, speed, false)).toBe(0)
    }
  })
})
