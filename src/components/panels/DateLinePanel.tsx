import { useMemo } from 'react'
import { calculateDateLineCrossing, formatUtcOffset } from '../../lib/geography'
import { formatTeachingNumber } from '../../lib/formatTeachingNumber'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { UtcTimeEditor } from '../controls/UtcTimeEditor'

const formatter = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })

export function DateLinePanel() {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const direction = useEarthLabStore(state => state.dateLineDirection)
  const progress = useEarthLabStore(state => state.dateLineProgress)
  const setDirection = useEarthLabStore(state => state.setDateLineDirection)
  const setProgress = useEarthLabStore(state => state.setDateLineProgress)
  const result = useMemo(() => calculateDateLineCrossing(direction, progress, new Date(timeMs)), [direction, progress, timeMs])
  const longitude = result.longitudeDegrees

  return <section className="data-section date-line-panel" aria-label="理论日期界线实验">
    <h2>180°理论日期界线</h2>
    <UtcTimeEditor />
    <div className="local-time-presets">
      <button type="button" aria-pressed={direction === 'east'} onClick={() => setDirection('east')}>向东跨线（减一天）</button>
      <button type="button" aria-pressed={direction === 'west'} onClick={() => setDirection('west')}>向西跨线（加一天）</button>
    </div>
    <label>跨线观察点（30°N）<input aria-label="日期界线跨线进度" type="range" min="0" max="1" step="0.01" value={progress} onChange={event => setProgress(Number(event.target.value))} /></label>
    <p>观察点：{formatTeachingNumber(Math.abs(longitude))}°{longitude >= 0 ? 'E' : 'W'} · {result.crossed ? '已进入目标侧' : '尚未跨线'}</p>
    <div className="local-time-presets">
      <button type="button" onClick={() => setProgress(0)}>跨线前</button>
      <button type="button" onClick={() => setProgress(0.5)}>到达界线（按目标侧计）</button>
      <button type="button" onClick={() => setProgress(1)}>跨线后</button>
    </div>
    <div className="date-line-clock"><strong>界线西侧 · UTC+12</strong><output aria-label="日期界线西侧日期">{formatter.format(new Date(result.westernSide.calendarTimeMs))}</output></div>
    <div className="date-line-clock"><strong>界线东侧 · UTC−12</strong><output aria-label="日期界线东侧日期">{formatter.format(new Date(result.easternSide.calendarTimeMs))}</output></div>
    <div className="date-line-clock"><strong>观察点当前日期</strong><output aria-label="跨线观察点日期">{formatter.format(new Date(result.current.calendarTimeMs))}</output></div>
    <p>Step 1：同一UTC时刻，对比西侧UTC+12与东侧UTC−12。两侧钟点相同，西侧日期比东侧晚一天。</p>
    <p>Step 2：{direction === 'east' ? '由西侧向东跨线' : '由东侧向西跨线'}，偏移由{formatUtcOffset(result.beforeOffsetMinutes)}变为{formatUtcOffset(result.afterOffsetMinutes)}。</p>
    <p>Step 3：{direction === 'east' ? '向东跨线，日历减一天；不是物理时间倒流。' : '向西跨线，日历加一天；不是旅途经过了24小时。'}</p>
    <p>拖动跨线进度不会推进UTC，也不会旋转地球；只移动地表观察点。演示忽略旅途耗时。若底部正在播放，UTC仍按原系统推进，可先暂停以隔离跨线效应。</p>
    <p>午夜换日：在同一固定时区内，时间从23:59推进到次日00:00。跨线换日：同一物理时刻切换日期约定，不要求钟点经过午夜。</p>
    <p>边界约定：滑块到达50%时按目标侧显示日期；±180°是同一条经线。图中仅示意180°理论界线，不表示现实日期变更线或国家法定时区边界。</p>
  </section>
}
