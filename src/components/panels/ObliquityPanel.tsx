import { useMemo } from 'react'
import { calculateObliquityGeometry } from '../../domain/orbit/obliquityGeometry'
import { calculateSeasonalEvents } from '../../domain/orbit/earthOrbit'
import { useEarthLabStore } from '../../store/useEarthLabStore'

export function ObliquityPanel() {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const setTime = useEarthLabStore(state => state.setSimulationTime)
  const setLayer = useEarthLabStore(state => state.setTeachingLayer)
  const layers = useEarthLabStore(state => state.teachingLayers)
  const year = new Date(timeMs).getUTCFullYear()
  const geometry = useMemo(() => calculateObliquityGeometry(), [])
  const events = useMemo(() => calculateSeasonalEvents(year), [year])
  return <section className="data-section obliquity-panel" aria-label="黄赤交角独立实验">
    <h2>黄赤交角 · 三个角度</h2>
    <table className="obliquity-angle-table"><caption>从现有3D方向计算的角度</caption><thead><tr><th scope="col">关系</th><th scope="col">教材值 / 模型读数</th></tr></thead><tbody>
      <tr><th scope="row">赤道面 ↔ 黄道面</th><td>23°26′<small>{geometry.equatorToEclipticDegrees.toFixed(4)}°</small></td></tr>
      <tr><th scope="row">地轴 ↔ 黄道面法线</th><td>23°26′<small>{geometry.axisToEclipticNormalDegrees.toFixed(4)}°</small></td></tr>
      <tr><th scope="row">地轴 ↔ 黄道面</th><td>66°34′<small>{geometry.axisToEclipticPlaneDegrees.toFixed(4)}°</small></td></tr>
    </tbody></table>
    <p>赤道面垂直于地轴；黄道面是地球公转轨道所在的平面。两个平面的锐夹角，等于其北向法线的夹角。</p>
    <p>3D黄色角弧画在地轴与黄道面法线之间，表示23°26′，不是地轴与黄道面之间的夹角。后者是余角66°34′。</p>
    <div className="local-time-presets"><button type="button" aria-pressed={layers.earthAxis} onClick={() => setLayer('earthAxis', !layers.earthAxis)}>地轴：{layers.earthAxis ? '显示' : '隐藏'}</button><button type="button" aria-pressed={layers.angleIndicators} onClick={() => setLayer('angleIndicators', !layers.angleIndicators)}>角度辅助线：{layers.angleIndicators ? '显示' : '隐藏'}</button></div>
    <h3>对比公转四个位置</h3>
    <div className="noon-season-comparison">{events.map(event => <button type="button" key={event.id} onClick={() => setTime(event.timeMs)}>{event.label}（北半球）</button>)}</div>
    <p>逐个点击二分二至：地球位置变化，但地轴方向保持空间平行，三个角度不随日期变化。改变观察镜头只改变投影，不能用屏幕上看起来的角度代替真实空间夹角。</p>
    <p>黄道面北法线为世界+Y；地轴方向向量为（{geometry.earthNorthAxis.x.toFixed(4)}，{geometry.earthNorthAxis.y.toFixed(4)}，{geometry.earthNorthAxis.z.toFixed(4)}）。它与地球表面绕地轴的自转分开处理。</p>
    <p>本场景采用固定教材值23°26′，用于一年内的几何演示，忽略岁差、章动及长期倾角变化。现有太阳赤纬引擎采用日期相关的天文近似，因此至日赤纬可能与23°26′有微小差异；本步不改两者。</p>
  </section>
}
