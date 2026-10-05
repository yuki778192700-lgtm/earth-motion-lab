import { useMemo, type CSSProperties } from 'react'
import { ANNUAL_ORBIT_DURATIONS, getAnnualTimeline } from '../../domain/orbit/annualTimeline'
import { useEarthLabStore } from '../../store/useEarthLabStore'

const dateFormatter = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })

export function AnnualOrbitController() {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const duration = useEarthLabStore(state => state.annualOrbitDurationSeconds)
  const playing = useEarthLabStore(state => state.isAnnualOrbitPlaying)
  const stopAtNext = useEarthLabStore(state => state.annualOrbitStopAtNextEvent)
  const setDuration = useEarthLabStore(state => state.setAnnualOrbitDuration)
  const togglePlaying = useEarthLabStore(state => state.toggleAnnualOrbitPlaying)
  const setStopAtNext = useEarthLabStore(state => state.setAnnualOrbitStopAtNextEvent)
  const seek = useEarthLabStore(state => state.seekAnnualOrbitTime)
  const stepDay = useEarthLabStore(state => state.stepAnnualOrbitDay)
  const year = new Date(timeMs).getUTCFullYear()
  const timeline = useMemo(() => getAnnualTimeline(year), [year])
  const progress = (timeMs - timeline.startTimeMs) / timeline.durationMs * 100
  return <section className="time-controller annual-orbit-controller" aria-label="地球公转全年时间轴">
    <div className="annual-orbit-heading"><strong>{dateFormatter.format(new Date(timeMs))} UTC</strong><span>{year}年 · {timeline.daysInYear}天 · 全年{duration}秒</span></div>
    <div className="annual-orbit-track">
      <input className="timeline-range" aria-label="调整公转全年日期" type="range" min={timeline.startTimeMs} max={timeline.endTimeMs} step="any" value={timeMs} style={{ '--timeline-progress': `${progress}%` } as CSSProperties} onChange={event => seek(Number(event.target.value))} />
      <div className="annual-month-ticks" aria-label="月份定位">{timeline.months.map(month => <button key={month.month} type="button" title={`${year}年${month.month}月1日`} style={{ left: `${month.progressPercent}%` }} onClick={() => seek(month.timeMs)}>{month.month}月</button>)}</div>
      <div className="annual-event-ticks" aria-label="二分二至定位">{timeline.events.map(event => <button type="button" key={event.id} title={`${event.label}：${dateFormatter.format(new Date(event.timeMs))} UTC（北半球称谓）`} style={{ left: `${event.progressPercent}%` }} onClick={() => seek(event.timeMs)}>{event.label}</button>)}</div>
    </div>
    <div className="annual-orbit-actions">
      <button type="button" onClick={togglePlaying}>{playing ? '暂停全年演示' : '播放全年演示'}</button>
      <button type="button" onClick={() => seek(timeline.startTimeMs)}>回到年初</button>
      <button type="button" onClick={() => stepDay(-1)} disabled={timeMs <= timeline.startTimeMs}>前一天</button>
      <button type="button" onClick={() => stepDay(1)} disabled={timeMs >= timeline.endTimeMs}>后一天</button>
      <div className="annual-duration-control" aria-label="全年演示时长">{ANNUAL_ORBIT_DURATIONS.map(option => <button key={option} type="button" aria-pressed={duration === option} onClick={() => setDuration(option)}>{option}秒／年</button>)}</div>
      <label><input type="checkbox" checked={stopAtNext} onChange={event => setStopAtNext(event.target.checked)} />到下一节气暂停</label>
    </div>
    <p>从当前日期继续，年末自动暂停；点击“回到年初”可播放完整一年。均匀推进日期，轨道位置由原模型计算；“秒／年”独立于自转倍率。</p>
  </section>
}
