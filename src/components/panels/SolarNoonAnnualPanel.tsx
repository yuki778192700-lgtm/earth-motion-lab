import { useMemo } from 'react'
import { solarDeclination, solarNoonAltitude } from '../../lib/geography'
import { createAnnualSubsolarModel } from '../../domain/solar/annualSubsolarModel'
import { createAnnualNoonAltitudeModel } from '../../domain/solar/annualNoonAltitudeModel'
import { useEarthLabStore } from '../../store/useEarthLabStore'
import { AnnualNoonAltitudeChart } from '../charts/AnnualNoonAltitudeChart'

const PRESETS = [{ latitude: 0, label: '赤道' }, { latitude: 30, label: '30°N' }, { latitude: -30, label: '30°S' }, { latitude: 90, label: '北极点' }, { latitude: -90, label: '南极点' }]
const formatLatitude = (latitude: number) => latitude === 0 ? '0°（赤道）' : `${Math.abs(latitude).toFixed(2)}°${latitude > 0 ? 'N' : 'S'}`

export function SolarNoonAnnualPanel() {
  const timeMs = useEarthLabStore(state => state.simulationTimeMs)
  const latitude = useEarthLabStore(state => state.observerLatitudeDegrees)
  const setLatitude = useEarthLabStore(state => state.setObserverLatitude)
  const setTime = useEarthLabStore(state => state.setSimulationTime)
  const year = new Date(timeMs).getUTCFullYear()
  const annual = useMemo(() => createAnnualSubsolarModel(year), [year])
  const model = useMemo(() => createAnnualNoonAltitudeModel(year, latitude, annual), [year, latitude, annual])
  const declination = useMemo(() => solarDeclination(new Date(timeMs)), [timeMs])
  const altitude = useMemo(() => solarNoonAltitude(latitude, declination), [latitude, declination])
  return <section className="data-section solar-noon-annual-panel" aria-label="正午太阳高度全年实验">
    <h2>正午太阳高度</h2>
    <label>选择纬度 · {formatLatitude(latitude)}<input type="range" min="-90" max="90" step="any" value={latitude} aria-label="正午太阳高度实验纬度" onChange={event => setLatitude(Number(event.target.value))} /></label>
    <div className="local-time-presets">{PRESETS.map(preset => <button type="button" key={preset.latitude} onClick={() => setLatitude(preset.latitude)}>{preset.label}</button>)}</div>
    <output aria-label="当前日期正午太阳高度">H = {altitude.toFixed(3)}°</output>
    <p>所选纬度φ：{formatLatitude(latitude)} · 太阳赤纬δ：{declination.toFixed(3)}°（北正南负）</p>
    <p>H = 90° − |φ − δ|。全部使用角度制；高度角从当地水平地平线向太阳方向量起，不是从天顶量起。</p>
    <p>{altitude < 0 ? '正午太阳仍在地平线以下（极夜），负值保留，不裁剪为0°。' : altitude === 0 ? '正午太阳位于几何地平线上。' : '正午太阳在地平线以上；90°表示太阳在天顶。'}</p>
    <AnnualNoonAltitudeChart model={model} timeMs={timeMs} altitudeDegrees={altitude} />
    <div className="noon-season-comparison" aria-label="正午太阳高度二分二至对比">{model.events.map(event => <button type="button" key={event.id} onClick={() => setTime(event.timeMs)}>{event.label} · {event.altitudeDegrees.toFixed(3)}°</button>)}</div>
    <p>拖动日期或纬度：全年曲线、当前读数与3D量角辅助线同步。极点处采用上中天高度的几何延拓，不表示存在普通地点那样唯一的每日正午。</p>
    <p>3D量角点选在所选纬度与当前直射点的同一经线上，表示该点的当地真太阳正午；不是固定地点在当前UTC的即时太阳高度。蓝色线为地表法线，黄色线指向太阳，青色短线表示地平线方向，橙色弧表示高度角。</p>
    <p>赤道一年有两次近90°峰值；回归线之间可一年两次直射，回归线附近约一次，两侧以外不直射。北半球30°N在夏至附近较高，南半球30°S相反。图线每日采样并加入节气时刻，不把采样峰值当作精确直射日期。</p>
    <p>计算复用现有geographyEngine与节气近似模型，不含大气折射、地形或太阳视半径。图层中的“角度辅助线”控制3D量角显示。</p>
  </section>
}
