import { assertLatitudeDegrees } from './angle'
import { TROPIC_LATITUDE_DEGREES, POLAR_CIRCLE_LATITUDE_DEGREES } from '../earthCoordinates'

export const THERMAL_ZONES = [
  { id: 'north-frigid', name: '北寒带', south: POLAR_CIRCLE_LATITUDE_DEGREES, north: 90, color: '#93c5fd', directSun: false, polarEvents: true },
  { id: 'north-temperate', name: '北温带', south: TROPIC_LATITUDE_DEGREES, north: POLAR_CIRCLE_LATITUDE_DEGREES, color: '#86efac', directSun: false, polarEvents: false },
  { id: 'tropical', name: '热带', south: -TROPIC_LATITUDE_DEGREES, north: TROPIC_LATITUDE_DEGREES, color: '#fbbf24', directSun: true, polarEvents: false },
  { id: 'south-temperate', name: '南温带', south: -POLAR_CIRCLE_LATITUDE_DEGREES, north: -TROPIC_LATITUDE_DEGREES, color: '#86efac', directSun: false, polarEvents: false },
  { id: 'south-frigid', name: '南寒带', south: -90, north: -POLAR_CIRCLE_LATITUDE_DEGREES, color: '#93c5fd', directSun: false, polarEvents: true },
] as const

export function classifyThermalZone(latitudeDegrees: number) {
  assertLatitudeDegrees(latitudeDegrees)
  const absoluteLatitude = Math.abs(latitudeDegrees)
  // 容差只吸收度分换算的浮点舍入，不把邻近纬度误判为边界。
  const onTropic = Math.abs(absoluteLatitude - TROPIC_LATITUDE_DEGREES) < 1e-10
  const onPolarCircle = Math.abs(absoluteLatitude - POLAR_CIRCLE_LATITUDE_DEGREES) < 1e-10
  if (onTropic || onPolarCircle) {
    const north = latitudeDegrees > 0
    return {
      name: `${north ? '北' : '南'}${onTropic ? '回归线' : '极圈'}（两带分界）`,
      directSun: onTropic,
      polarEvents: onPolarCircle,
      explanation: onTropic
        ? '热带与温带的分界；教材模型中每年对应至日有一次太阳直射。'
        : '温带与寒带的分界；几何教材模型中，至日晨昏线与纬线相切，昼长按24小时或0小时计。',
    }
  }
  const zone = THERMAL_ZONES.find(item => latitudeDegrees >= item.south && latitudeDegrees <= item.north)!
  return {
    name: zone.name, directSun: zone.directSun, polarEvents: zone.polarEvents,
    explanation: zone.directSun ? '一年中有太阳直射，赤道及热带内部通常有两次。'
      : zone.polarEvents ? '没有太阳直射，存在极昼极夜现象；持续时间随纬度和季节变化。'
        : '没有太阳直射，也没有极昼极夜；太阳高度和昼长随季节变化。',
  }
}
