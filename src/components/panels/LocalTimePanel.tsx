import { useMemo } from 'react'
import { compareLocalMeanTimes } from '../../lib/geography'
import { localTimeStyle } from '../../config/localTimeStyle'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { UtcTimeEditor } from '../controls/UtcTimeEditor'
import { FixedOffsetTimePanel } from './FixedOffsetTimePanel'
import { formatTeachingNumber } from '../../lib/formatTeachingNumber'

const clockFormatter = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
const PRESETS = [{ value: 0, label: '0°' }, { value: 120, label: '120°E' }, { value: -75, label: '75°W' }, { value: -180, label: '180°W' }, { value: 180, label: '180°E' }]

function longitudeLabel(longitude: number) {
  return longitude === 0 ? '0°' : `${formatTeachingNumber(Math.abs(longitude))}°${longitude > 0 ? 'E' : 'W'}`
}

export function LocalTimePanel() {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const a = useEarthLabStore(state => state.localTimeLongitudeA)
  const b = useEarthLabStore(state => state.localTimeLongitudeB)
  const setLongitude = useEarthLabStore(state => state.setLocalTimeLongitude)
  const setTime = useEarthLabStore(state => state.setSimulationTime)
  const setOffset = useEarthLabStore(state => state.setLocalTimeOffset)
  const requestCamera = useEarthLabStore(state => state.requestCameraView)
  const comparison = useMemo(() => compareLocalMeanTimes(a, b, new Date(timeMs)), [a, b, timeMs])

  return <section className="data-section local-time-panel" aria-label="地方时双地点实验">
    <h2>地方时与区时</h2>
    <UtcTimeEditor />
    {(['A', 'B'] as const).map(point => {
      const longitude = point === 'A' ? a : b
      const clock = point === 'A' ? comparison.a : comparison.b
      return <div key={point} className="local-time-point" style={{ borderColor: localTimeStyle[point].color }}>
        <strong style={{ color: localTimeStyle[point].color }}>地点 {point} · {longitudeLabel(longitude)}</strong>
        <input type="range" min="-180" max="180" step="0.05" value={longitude} aria-label={`地点${point}经度`} onChange={event => setLongitude(point, Number(event.target.value))} />
        <div className="local-time-presets">{PRESETS.map(preset => <button key={preset.value} type="button" onClick={() => setLongitude(point, preset.value)} aria-label={`地点${point}选择${preset.label}`}>{preset.label}</button>)}</div>
        <small>地方平均太阳时</small>
        <output aria-label={`地点${point}地方平均太阳时`}>{clockFormatter.format(new Date(clock.calendarTimeMs))}</output>
        <small>相对 UTC 日期：{clock.dayOffset === 0 ? '同日' : clock.dayOffset > 0 ? '次日' : '前日'}</small>
        <FixedOffsetTimePanel point={point} />
      </div>
    })}
    <div className="local-time-comparison" aria-live="polite">
      <strong>B − A：{comparison.timeDifferenceMinutes > 0 ? '+' : ''}{formatTeachingNumber(comparison.timeDifferenceMinutes)} 分钟</strong>
      <p>经度差 {formatTeachingNumber(comparison.longitudeDifferenceDegrees)}° × 4 分钟/°</p>
      <p>{comparison.timeDifferenceMinutes === 0 ? '两地地方平均太阳时相同。' : `B 的日期与钟点读数${comparison.timeDifferenceMinutes > 0 ? '领先' : '落后'} A ${formatTeachingNumber(Math.abs(comparison.timeDifferenceMinutes))} 分钟。`}</p>
      {comparison.sameMeridianDifferentDateConvention ? <p>180°E 与180°W是同一条经线。此处保留两侧日期约定：钟点相同，日期相差一天；不代表两地相隔360°。</p> : null}
    </div>
    <button type="button" className="local-time-demo" onClick={() => {
      setLongitude('A', 0)
      setLongitude('B', 15)
      const date = new Date(timeMs)
      date.setUTCHours(12, 0, 0, 0)
      setTime(date.getTime())
      requestCamera('north-pole')
    }}>观察15°经度差</button>
    <button type="button" className="local-time-demo" onClick={() => {
      setLongitude('A', 116.4)
      setLongitude('B', 120)
      setOffset('A', 480)
      setOffset('B', 480)
      requestCamera('north-pole')
    }}>北京时间示例：北京与120°E经线</button>
    <p>示例中北京经度取116.4°E。两地采用UTC+8时，区时相同；北京地方平均太阳时比北京时间慢14.4分钟（14分24秒）。北京时间不是北京当地的地方太阳时。</p>
    <p>区时 = UTC + 所选固定偏移。同一偏移下钟表读数相同，与地点经度无关；地方平均太阳时仍随经度变化。每15°划分的理论时区不等于实际法定时区。</p>
    <p>选择器每15分钟一档，覆盖UTC−12至UTC+14，包括半小时与45分钟偏移；这些是教学选择，不表示每个选项都有对应的现实法定时区。不会根据经度自动推断国家时区，不包含夏令时、历史变更或国际日期变更线。</p>
    <p>东早西晚：地球自西向东自转，东边经线先到达相同太阳时位置；每差15°，地方时差1小时。点击播放可观察两条经线随地球自转。</p>
    <p>地点标签分别放在12°N、12°S以避免重叠；地方时由经度决定，与纬度无关。背面地点标签会隐藏，拖动地球可观察。</p>
    <p>本实验以UTC近似本初子午线平均太阳时，忽略UT1与UTC的亚秒差。地方平均太阳时不含时间方程；真太阳时包含该修正。太阳照亮的直射经线不必正好对应平均太阳时12点。</p>
  </section>
}
