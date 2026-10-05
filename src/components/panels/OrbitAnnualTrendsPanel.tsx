import { useMemo } from 'react'
import { createOrbitAnnualTrends } from '../../domain/orbit/orbitAnnualTrends'
import { calculateHemisphereSeasons } from '../../domain/solar/hemisphereSeasons'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { AnnualDeclinationChart } from '../charts/AnnualDeclinationChart'
import { AnnualDayLengthChart } from '../charts/AnnualDayLengthChart'

export function OrbitAnnualTrendsPanel() {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const year = new Date(timeMs).getUTCFullYear()
  // 年内播放只更新游标和实时读数，不重复生成全年样本或曲线路径。
  const model = useMemo(() => createOrbitAnnualTrends(year), [year])
  const current = useMemo(() => calculateHemisphereSeasons(timeMs, 30), [timeMs])
  return <section className="data-section orbit-annual-trends-panel" aria-label="公转全年变化联动曲线">
    <h2>全年变化 · 场景联动</h2>
    <p>当前日期（UTC）：{new Date(timeMs).toISOString().slice(0, 10)}。青色竖线标记两张图的同一时刻，与地球公转位置同步。</p>
    <figure>
      <figcaption>太阳直射纬度 · 当前{current.declinationDegrees.toFixed(3)}°（北正南负）</figcaption>
      <AnnualDeclinationChart model={model.declination} timeMs={timeMs} declinationDegrees={current.declinationDegrees} />
    </figure>
    <figure>
      <figcaption>同纬度绝对值昼长对照</figcaption>
      <div className="orbit-trends-legend"><span>黄色：30°N</span><span>粉色：30°S</span></div>
      <AnnualDayLengthChart model={model.north} timeMs={timeMs} dayHours={current.north.dayHours} latitudeLabel="30°N" comparison={{ model: model.south, dayHours: current.south.dayHours, label: '30°S' }} />
      <output>30°N：{current.north.dayHours.toFixed(3)}小时 · 30°S：{current.south.dayHours.toFixed(3)}小时</output>
    </figure>
    <p>拖动底部全年时间轴、选择节气或播放分段讲解，两图游标和实时读数都会同步。不改变其他模块的观察纬度。</p>
    <p>曲线使用每日UTC采样并加入二分二至时刻；当前点直接按当前时刻计算，不从图线上插值。几何昼长不含大气折射、太阳视半径或地形；节气日期沿用现有近似模型。</p>
  </section>
}
