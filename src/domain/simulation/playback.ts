export const SIMULATION_SPEED_OPTIONS = [1_000, 2_000, 3_000] as const

export type SimulationSpeed = (typeof SIMULATION_SPEED_OPTIONS)[number]

export const DEFAULT_SIMULATION_SPEED: SimulationSpeed = SIMULATION_SPEED_OPTIONS[0]

/**
 * 将真实经过时间换算为模拟时间，单位均为毫秒。
 * 暂停时始终返回 0，播放时严格按所选倍率线性推进。
 */
export function calculateSimulationAdvance(
  elapsedRealMilliseconds: number,
  speed: SimulationSpeed,
  isPlaying: boolean,
): number {
  return isPlaying ? elapsedRealMilliseconds * speed : 0
}
