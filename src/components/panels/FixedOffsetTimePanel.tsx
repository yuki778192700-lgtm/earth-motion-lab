import { useMemo } from 'react'
import { compareMeanAndFixedTime, FIXED_UTC_OFFSET_OPTIONS, formatUtcOffset } from '../../lib/geography'
import { useEarthLabStore } from '../../store/useEarthLabStore'

const formatter = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })

export function FixedOffsetTimePanel({ point }: { point: 'A' | 'B' }) {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const longitude = useEarthLabStore(state => point === 'A' ? state.localTimeLongitudeA : state.localTimeLongitudeB)
  const offset = useEarthLabStore(state => point === 'A' ? state.localTimeOffsetA : state.localTimeOffsetB)
  const setOffset = useEarthLabStore(state => state.setLocalTimeOffset)
  const comparison = useMemo(() => compareMeanAndFixedTime(longitude, offset, new Date(timeMs)), [longitude, offset, timeMs])
  const { dayOffset } = comparison.fixedClock
  const delta = comparison.fixedMinusMeanMinutes

  return <div className="fixed-offset-clock">
    <label>固定UTC偏移<select aria-label={`地点${point}固定UTC偏移`} value={offset} onChange={event => setOffset(point, Number(event.target.value))}>
      {FIXED_UTC_OFFSET_OPTIONS.map(value => <option key={value} value={value}>{formatUtcOffset(value)}</option>)}
    </select></label>
    <span>区时（固定时差模型）</span>
    <output aria-label={`地点${point}区时`}>{formatter.format(new Date(comparison.fixedClock.calendarTimeMs))}</output>
    <small>区时日期相对UTC：{dayOffset === 0 ? '同日' : dayOffset > 0 ? '次日' : '前日'}</small>
    <p>区时 − 地方平均太阳时：{delta > 0 ? '+' : ''}{delta} 分钟</p>
  </div>
}
