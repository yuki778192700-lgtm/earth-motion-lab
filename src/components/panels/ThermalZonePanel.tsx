import { classifyThermalZone, THERMAL_ZONES } from '../../lib/geography/thermalZones'
import { TROPIC_LATITUDE_DEGREES, POLAR_CIRCLE_LATITUDE_DEGREES } from '../../lib/earthCoordinates'
import { useEarthLabStore } from '../../store/useEarthLabStore'

export function ThermalZonePanel() {
  const latitude = useEarthLabStore(state => state.observerLatitudeDegrees)
  const setLatitude = useEarthLabStore(state => state.setObserverLatitude)
  const result = classifyThermalZone(latitude)
  return <section className="data-section thermal-zone-panel">
    <h2>五带实验 · 选择纬度</h2>
    <output>{Math.abs(latitude).toFixed(4)}°{latitude === 0 ? '' : latitude > 0 ? 'N' : 'S'}</output>
    <input className="latitude-range" type="range" min="-90" max="90" step="0.1" value={latitude} onChange={event => setLatitude(Number(event.target.value))} aria-label="五带观察纬度" />
    <div className="thermal-boundary-buttons">
      {[-POLAR_CIRCLE_LATITUDE_DEGREES, -TROPIC_LATITUDE_DEGREES, 0, TROPIC_LATITUDE_DEGREES, POLAR_CIRCLE_LATITUDE_DEGREES].map(value => <button type="button" key={value} onClick={() => setLatitude(value)}>{value === 0 ? '赤道' : `${value > 0 ? '北' : '南'}${Math.abs(value) < 30 ? '回归线' : '极圈'}`}</button>)}
    </div>
    <strong>{result.name}</strong>
    <p>{result.explanation}</p>
    <p>太阳直射：{result.directSun ? '有' : '无'}　极昼极夜：{result.polarEvents ? '有（几何模型）' : '无'}</p>
    <div className="thermal-zone-legend">{THERMAL_ZONES.map(zone => <span key={zone.id}><i style={{ background: zone.color }} />{zone.name}</span>)}</div>
    <p>回归线：23°26′；极圈：66°34′。五带依据太阳辐射的天文条件划分；实际气温和气候还受海拔、海陆位置、洋流等因素影响。</p>
  </section>
}
