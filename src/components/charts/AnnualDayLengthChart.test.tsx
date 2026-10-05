import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AnnualDayLengthChart } from './AnnualDayLengthChart'
import { AnnualDeclinationChart } from './AnnualDeclinationChart'
import { createOrbitAnnualTrends } from '../../domain/orbit/orbitAnnualTrends'
import { calculateHemisphereSeasons } from '../../domain/solar/hemisphereSeasons'

describe('全年曲线绘制与时间游标', () => {
  const model = createOrbitAnnualTrends(2026)
  it('单纬度旧模式保持原图例、青色点与极昼极夜说明', () => {
    const markup = renderToStaticMarkup(<AnnualDayLengthChart model={model.north} timeMs={model.north.startTimeMs} dayHours={model.north.samples[0]!.dayHours} />)
    expect(markup).toContain('2026年所选纬度几何昼长曲线')
    expect(markup).toContain('24h极昼 / 0h极夜')
    expect(markup).not.toContain('#f9a8d4')
    expect(markup).toContain('r="4" fill="#67e8f9"')
  })
  it.each([model.north.startTimeMs, ...model.declination.events.map(event => event.timeMs), model.north.endTimeMs])('时刻%s两图游标使用相同全年比例，双纬度读数独立', timeMs => {
    const current = calculateHemisphereSeasons(timeMs, 30)
    const ratio = (timeMs - model.north.startTimeMs) / (model.north.endTimeMs - model.north.startTimeMs)
    const day = renderToStaticMarkup(<AnnualDayLengthChart model={model.north} timeMs={timeMs} dayHours={current.north.dayHours} latitudeLabel="30°N" comparison={{ model: model.south, dayHours: current.south.dayHours, label: '30°S' }} />)
    const declination = renderToStaticMarkup(<AnnualDeclinationChart model={model.declination} timeMs={timeMs} declinationDegrees={current.declinationDegrees} />)
    expect(day).toContain(`x1="${35 + ratio * 300}" x2="${35 + ratio * 300}" y1="18" y2="168" stroke="#67e8f9"`)
    expect(declination).toContain(`x1="${46 + ratio * 290}" x2="${46 + ratio * 290}" y1="18" y2="168" stroke="#67e8f9"`)
    expect(day).toContain(`30°N当前昼长：${current.north.dayHours.toFixed(3)}小时`)
    expect(day).toContain(`30°S当前昼长：${current.south.dayHours.toFixed(3)}小时`)
    for (const event of model.declination.events) expect(day).toContain(event.label)
    expect(day).toContain('stroke="#f9a8d4"')
  })
})
