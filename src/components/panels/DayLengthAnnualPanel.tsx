import { useMemo } from 'react'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { calculateDayNightModel } from '../../domain/dayNight/dayNightModel'
import { createAnnualSubsolarModel } from '../../domain/solar/annualSubsolarModel'
import { createDayLengthExperiment, formatApparentSolarTime } from '../../domain/solar/dayLengthExperiment'
import { AnnualDayLengthChart } from '../charts/AnnualDayLengthChart'

const latitudeLabel = (value: number) => value === 0 ? '赤道' : `${Math.abs(value).toFixed(2)}°${value > 0 ? 'N' : 'S'}`

export function DayLengthAnnualPanel() {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const latitude = useEarthLabStore(state => state.observerLatitudeDegrees)
  const setLatitude = useEarthLabStore(state => state.setObserverLatitude)
  const setTime = useEarthLabStore(state => state.setSimulationTime)
  const year = new Date(timeMs).getUTCFullYear()
  const annual = useMemo(() => createAnnualSubsolarModel(year), [year])
  const curve = useMemo(() => createDayLengthExperiment(year, latitude, annual), [year, latitude, annual])
  const current = useMemo(() => calculateDayNightModel(new Date(timeMs), latitude), [timeMs, latitude])
  return <section className="data-section day-length-annual-panel" aria-label="昼夜长短全年实验">
    <h2>昼夜长短 · 全年实验</h2>
    <label>选择纬度 · {latitudeLabel(latitude)}<input type="range" min="-90" max="90" step="any" value={latitude} aria-label="全年昼长实验纬度" onChange={event => setLatitude(Number(event.target.value))} /></label>
    <div className="local-time-presets">{[0, 30, -30, 70, -70, 90, -90].map(value => <button type="button" key={value} onClick={() => setLatitude(value)}>{latitudeLabel(value)}</button>)}</div>
    <output>昼长：{current.daylightHours.toFixed(3)}小时 · 夜长：{current.nightHours.toFixed(3)}小时</output>
    <dl className="day-length-solar-times"><dt>日出（地方真太阳时）</dt><dd>{formatApparentSolarTime(current.sunriseSolarHours)}</dd><dt>日落（地方真太阳时）</dt><dd>{formatApparentSolarTime(current.sunsetSolarHours)}</dd></dl>
    <p>太阳赤纬：{current.declinationDegrees.toFixed(4)}°。当前状态：{current.polarState === 'polar-day' ? '极昼' : current.polarState === 'polar-night' ? '极夜' : Math.abs(latitude) === 90 ? '理想分点边界' : '昼夜交替'}。</p>
    <AnnualDayLengthChart model={curve} timeMs={timeMs} dayHours={current.daylightHours} />
    <div className="day-length-event-list" aria-label="二分二至昼长与升落对比">{curve.events.map(event => <button type="button" key={event.id} onClick={() => setTime(event.timeMs)}><strong>{event.label}（北半球）· 昼长{event.dayHours.toFixed(3)}小时</strong><span>日出{formatApparentSolarTime(event.sunriseSolarHours)}</span><span>日落{formatApparentSolarTime(event.sunsetSolarHours)}</span></button>)}</div>
    <p>黄色曲线为几何昼长，青色点为当前日期。日期与纬度改变时，选中纬线、昼弧夜弧和面板同步。全年日采样曲线是教学近似，不是精确升落预报。</p>
    <p>这里的真太阳时以太阳上中天为12:00，不是地方平均太阳时、北京时间或其他区时。升落计算把当前赤纬作为一天内不变的近似，时刻显示到秒只为避免舍入歧义，不代表秒级天文精度。</p>
    <p>赤道几何昼长全年12小时；北半球纬度越高，夏冬昼长差通常越大，南半球的季节变化相反。太阳赤纬恰为0°时普通纬度昼夜各12小时，节气模型的小残差不强制归零。</p>
    <p>极昼、极夜及两极不伪造每日升落时刻。两极分点的12小时值只是引擎边界约定；曲线采用阶梯示意，不表示太阳每日升落。计算不含大气折射、太阳视半径或地形。</p>
  </section>
}
