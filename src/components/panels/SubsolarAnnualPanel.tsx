import { useMemo } from 'react'
import { createAnnualSubsolarModel } from '../../domain/solar/annualSubsolarModel'
import { subsolarPoint } from '../../lib/geography'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { AnnualDeclinationChart } from '../charts/AnnualDeclinationChart'

const eventFormatter = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const EXPLANATIONS = [
  '地轴相对黄道面法线倾斜约23°26′。地轴在一年公转中惯性空间指向基本不变，可在“地球公转”模块观察。',
  '公转使太阳相对地球赤道面的方向发生全年变化；太阳赤纬北偏为正，南偏为负。四季不是由日地距离远近主导的。',
  '直射点纬度等于太阳赤纬：春分附近过赤道向北，夏至附近最北，秋分附近过赤道向南，冬至附近最南。春秋分名称沿用北半球习惯。',
  '地球自转使直射经度随时间变化，计算包含时间方程。全年图仅记录纬度，不是某条固定经线上的真实全年地表轨迹。',
]

export function SubsolarAnnualPanel() {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const step = useEarthLabStore(state => state.subsolarExplanationStep)
  const setStep = useEarthLabStore(state => state.setSubsolarExplanationStep)
  const setTime = useEarthLabStore(state => state.setSimulationTime)
  const year = new Date(timeMs).getUTCFullYear()
  const model = useMemo(() => createAnnualSubsolarModel(year), [year])
  const point = useMemo(() => subsolarPoint(new Date(timeMs)), [timeMs])
  return <section className="data-section subsolar-annual-panel" aria-label="太阳直射点全年移动实验">
    <h2>直射点全年纬度变化</h2>
    <output aria-label="当前直射点坐标">纬度 {Math.abs(point.latitudeDegrees).toFixed(3)}°{point.latitudeDegrees >= 0 ? 'N' : 'S'} · 经度 {Math.abs(point.longitudeDegrees).toFixed(3)}°{point.longitudeDegrees >= 0 ? 'E' : 'W'}</output>
    <AnnualDeclinationChart model={model} timeMs={timeMs} declinationDegrees={point.latitudeDegrees} />
    <div className="local-time-presets" aria-label="直射点二分二至快捷日期">
      {model.events.map(event => <button type="button" key={event.id} onClick={() => setTime(event.timeMs)} title={`${eventFormatter.format(new Date(event.timeMs))} UTC`}>{event.label} · {eventFormatter.format(new Date(event.timeMs))} UTC</button>)}
    </div>
    <p>拖动底部日期滑块：曲线指示点、3D直射点和当前直射纬线同步变化。黄色淡色带表示全年可直射纬度范围，不是运动轨迹。</p>
    <p>当前模型全年范围：{Math.abs(model.southLimitDegrees).toFixed(3)}°S—{model.northLimitDegrees.toFixed(3)}°N。约对应南北回归线；教材23°26′是近似值，低阶天文模型不强制截断到教材圆整边界。</p>
    <div className="subsolar-explanation" aria-live="polite"><strong>Step {step} / 4</strong><p>{EXPLANATIONS[step - 1]}</p></div>
    <div className="local-time-presets"><button type="button" disabled={step === 1} onClick={() => setStep(step - 1)}>上一步讲解</button><button type="button" disabled={step === 4} onClick={() => setStep(step + 1)}>下一步讲解</button></div>
    <p>本场景是地球中心、固定太阳方向的教学参照视图，不是公转惯性空间镜头。图线使用每日00:00 UTC采样并加入二分二至时刻；青色点和3D模型按当前精确时刻计算。二分二至时间复用现有近似模型，非高精度历书。</p>
  </section>
}
