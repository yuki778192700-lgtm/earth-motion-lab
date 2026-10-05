import { useMemo } from 'react'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { calculateDayNightModel } from '../../domain/dayNight/dayNightModel'
import { createAnnualSubsolarModel } from '../../domain/solar/annualSubsolarModel'
import { createAnnualDayLengthModel } from '../../domain/solar/annualDayLengthModel'
import { polarLatitudeRanges } from '../../lib/geography/polarRange'
import { AnnualDayLengthChart } from '../charts/AnnualDayLengthChart'

const latitudeLabel = (degrees: number) => degrees === 0 ? '赤道' : `${Math.abs(degrees).toFixed(3)}°${degrees > 0 ? 'N' : 'S'}`

export function PolarAnnualPanel() {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const latitude = useEarthLabStore(state => state.observerLatitudeDegrees)
  const setLatitude = useEarthLabStore(state => state.setObserverLatitude)
  const setTime = useEarthLabStore(state => state.setSimulationTime)
  const year = new Date(timeMs).getUTCFullYear()
  const annual = useMemo(() => createAnnualSubsolarModel(year), [year])
  const curve = useMemo(() => createAnnualDayLengthModel(year, latitude, annual), [year, latitude, annual])
  const current = useMemo(() => calculateDayNightModel(new Date(timeMs), latitude), [timeMs, latitude])
  const range = useMemo(() => polarLatitudeRanges(current.declinationDegrees), [current.declinationDegrees])
  return <section className="data-section polar-annual-panel" aria-label="极昼极夜全年实验">
    <h2>极昼极夜范围实验</h2>
    <label>观察纬度 · {latitudeLabel(latitude)}<input type="range" min="-90" max="90" step="any" value={latitude} aria-label="极昼极夜实验纬度" onChange={event => setLatitude(Number(event.target.value))} /></label>
    <div className="local-time-presets">{[0, 70, -70, 90, -90].map(value => <button key={value} type="button" onClick={() => setLatitude(value)}>{latitudeLabel(value)}</button>)}</div>
    <output>当前状态：{current.polarState === 'polar-day' ? '极昼' : current.polarState === 'polar-night' ? '极夜' : Math.abs(latitude) === 90 ? '太阳中心沿地平线（理想分点）' : '昼夜交替'}</output>
    <p>昼长：{current.daylightHours.toFixed(3)}小时 · 夜长：{current.nightHours.toFixed(3)}小时</p>
    <p>太阳赤纬：{current.declinationDegrees.toFixed(4)}°（北正南负）</p>
    {range ? <div className="polar-range-summary"><p>极昼范围：{latitudeLabel(range.polarDay.minimumDegrees)}—{latitudeLabel(range.polarDay.maximumDegrees)}</p><p>极夜范围：{latitudeLabel(range.polarNight.minimumDegrees)}—{latitudeLabel(range.polarNight.maximumDegrees)}</p><p>动态边界绝对纬度：{range.boundaryAbsoluteDegrees.toFixed(4)}°。|φ| ≥ 90° − |δ|，南北属性由赤纬符号决定。</p></div> : <p>赤纬恰为0°时，无通常意义的极昼极夜范围；两极太阳中心沿几何地平线。</p>}
    <AnnualDayLengthChart model={curve} timeMs={timeMs} dayHours={current.daylightHours} />
    <div className="noon-season-comparison">{curve.events.map(event => <button key={event.id} type="button" onClick={() => setTime(event.timeMs)}>{event.label}（北半球）</button>)}</div>
    <p>日期、选中纬线、昼弧夜弧与数据复用同一模型。24小时表示太阳中心全天不低于地平线，0小时表示全天不高于地平线；相切边界按引擎约定计入。</p>
    <p>范围为几何理论值，不含折射、太阳视半径及地形。极夜不等于天空全天漆黑，仍可能有曙暮光。</p>
    <p>曲线每日采样并加入节气时刻，不用于确定精确起止时间。极点曲线采用阶梯示意；赤纬恰为0°时引擎的12小时值只是边界约定，不表示两极发生普通的每日升落。分点近似模型的残差会使极小极区仍被判为极昼或极夜，不强制归零。</p>
  </section>
}
