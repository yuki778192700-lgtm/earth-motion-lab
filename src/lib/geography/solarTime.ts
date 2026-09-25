import {
  assertValidDate,
  normalizeLongitudeDegrees,
} from './angle'
import type { LocalSolarTimeResult } from './types'

/**
 * 高中地理中的地方平均太阳时：经度每向东 15°，时间增加 1 小时。
 * 不包含时间方程修正。
 */
export function localSolarTime(
  longitudeDegrees: number,
  utcDate: Date,
): LocalSolarTimeResult {
  assertValidDate(utcDate, 'utcDate')
  const normalized = normalizeLongitudeDegrees(longitudeDegrees)
  // ±180°表示同一条经线，但可用正负号保留从东经侧或西经侧到达日期线的约定。
  // 避免把 +180°强制改写为 -180°后丢失一天的日期偏移信息。
  const normalizedLongitude = normalized === -180 && longitudeDegrees > 0
    ? 180
    : normalized
  const utcDecimalHours =
    utcDate.getUTCHours() +
    utcDate.getUTCMinutes() / 60 +
    utcDate.getUTCSeconds() / 3_600 +
    utcDate.getUTCMilliseconds() / 3_600_000
  const unwrappedHours = utcDecimalHours + normalizedLongitude / 15
  const dayOffset = Math.floor(unwrappedHours / 24) as -1 | 0 | 1
  const decimalHours = ((unwrappedHours % 24) + 24) % 24

  return { decimalHours, dayOffset }
}
