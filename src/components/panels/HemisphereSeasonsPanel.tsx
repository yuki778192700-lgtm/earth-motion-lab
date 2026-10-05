import { useMemo } from 'react'
import { calculateHemisphereSeasons } from '../../domain/solar/hemisphereSeasons'
import { useEarthLabStore } from '../../store/useEarthLabStore'

export function HemisphereSeasonsPanel() {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const latitude = useEarthLabStore(state => state.seasonsComparisonLatitudeDegrees)
  const setLatitude = useEarthLabStore(state => state.setSeasonsComparisonLatitude)
  const setTime = useEarthLabStore(state => state.setSimulationTime)
  const model = useMemo(() => calculateHemisphereSeasons(timeMs, latitude), [timeMs, latitude])
  return <section className="data-section hemisphere-seasons-panel" aria-label="南北半球四季对比实验">
    <h2>南北半球四季对比</h2>
    <label>对比纬度绝对值 · {latitude.toFixed(2)}°<input aria-label="四季对比纬度" type="range" min="0" max="90" step="any" value={latitude} onChange={event => setLatitude(Number(event.target.value))} /></label>
    <div className="local-time-presets">{[0, 30, 66 + 34 / 60, 90].map(value => <button key={value} type="button" onClick={() => setLatitude(value)}>{value === 0 ? '赤道' : value === 90 ? '两极' : value === 30 ? '30°' : '66°34′'}</button>)}</div>
    <p>太阳赤纬：{model.declinationDegrees.toFixed(3)}°（北正南负）</p>
    <div className="hemisphere-comparison">{([['北半球', 'N', model.north], ['南半球', 'S', model.south]] as const).map(([name, suffix, point]) => <article key={name} aria-label={`${name}季节数据`}>
      <h3>{name} · {latitude === 0 ? '赤道参照' : `${latitude.toFixed(2)}°${suffix}`}</h3>
      <strong>{point.season}（天文季节）</strong>
      <dl><dt>几何昼长</dt><dd>{point.dayHours.toFixed(3)} 小时</dd><dt>正午太阳高度</dt><dd>{point.noonAltitudeDegrees.toFixed(3)}°</dd><dt>昼夜状态</dt><dd>{point.lightState}</dd></dl>
    </article>)}</div>
    <div className="noon-season-comparison" aria-label="四季二分二至快捷日期">{model.events.map(event => <button key={event.id} type="button" onClick={() => setTime(event.timeMs)}>{event.label}（北半球）</button>)}</div>
    <p>日地距离：{model.distanceAu.toFixed(4)} AU。南北半球同时共享这个距离，却季节相反：四季形成的关键是地轴倾斜且空间指向基本不变，引起太阳高度和昼长的周年变化，不是距太阳远近。</p>
    <p>“春分、夏至、秋分、冬至”按钮采用北半球称谓；南半球对应秋分、冬至、春分、夏至。天文季节在节气时刻切换，并不代表当地气温立即改变。</p>
    <p>赤道两行是同一纬度的参照数据，不代表赤道有典型四季；热带与极地的实际季节划分也不同。太阳高度不等于气温。</p>
    <p>昼长不含折射、地形和太阳视半径。两极保留负太阳高度；分点附近近似模型的小赤纬残差会影响极点的极昼极夜判断，不强制归零。极点的高度为上中天几何延拓。</p>
  </section>
}
