import { calculateDateLineCrossing, classifyThermalZone, compareLocalMeanTimes, compareMeanAndFixedTime, formatUtcOffset } from '../lib/geography'
import type { KnowledgeTopic } from '../types/education'

interface ObservationSnapshot {
  simulationTimeMs: number
  observerLatitudeDegrees: number
  localTimeLongitudeA: number
  localTimeLongitudeB: number
  localTimeOffsetA: number
  localTimeOffsetB: number
  dateLineDirection: 'east' | 'west'
  dateLineProgress: number
}
const clock = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** 只组合geographyEngine结果；日历字段不是另一个物理时刻。 */
export function getTeachingObservations(topic: KnowledgeTopic, state: ObservationSnapshot): Array<{ label: string; value: string }> {
  const utc = new Date(state.simulationTimeMs)
  if (topic === 'climate-zones') return [{ label: '所选纬度（北正南负）', value: `${state.observerLatitudeDegrees.toFixed(2)}°` }, { label: '天文五带', value: classifyThermalZone(state.observerLatitudeDegrees).name }]
  if (topic === 'local-time' || topic === 'fixed-offset-time') {
    const comparison = compareLocalMeanTimes(state.localTimeLongitudeA, state.localTimeLongitudeB, utc)
    const rows = [
      { label: 'UTC', value: clock.format(utc) },
      { label: 'A经度（东正西负）', value: `${state.localTimeLongitudeA}°` },
      { label: 'B经度（东正西负）', value: `${state.localTimeLongitudeB}°` },
      { label: 'A地方平均太阳时', value: clock.format(new Date(comparison.a.calendarTimeMs)) },
      { label: 'B地方平均太阳时', value: clock.format(new Date(comparison.b.calendarTimeMs)) },
      { label: '地方时B−A', value: `${comparison.timeDifferenceMinutes} 分钟` },
    ]
    if (topic === 'fixed-offset-time') {
      for (const point of ['A', 'B'] as const) {
        const offset = point === 'A' ? state.localTimeOffsetA : state.localTimeOffsetB
        const longitude = point === 'A' ? state.localTimeLongitudeA : state.localTimeLongitudeB
        const result = compareMeanAndFixedTime(longitude, offset, utc)
        rows.push({ label: `${point}区时 · ${formatUtcOffset(offset)}`, value: clock.format(new Date(result.fixedClock.calendarTimeMs)) })
      }
    }
    return rows
  }
  if (topic === 'date-line') {
    const result = calculateDateLineCrossing(state.dateLineDirection, state.dateLineProgress, utc)
    return [
      { label: 'UTC（固定）', value: clock.format(utc) },
      { label: '界线西侧 UTC+12', value: clock.format(new Date(result.westernSide.calendarTimeMs)) },
      { label: '界线东侧 UTC−12', value: clock.format(new Date(result.easternSide.calendarTimeMs)) },
      { label: '观察点日期', value: clock.format(new Date(result.current.calendarTimeMs)) },
    ]
  }
  return []
}
