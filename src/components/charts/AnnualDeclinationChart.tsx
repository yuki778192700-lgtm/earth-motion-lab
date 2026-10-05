import { useMemo } from 'react'
import type { AnnualSubsolarModel } from '../../domain/solar/annualSubsolarModel'

const LEFT = 46
const TOP = 18
const WIDTH = 290
const HEIGHT = 150
const y = (degrees: number) => TOP + (25 - degrees) / 50 * HEIGHT

/** SVG coordinates are display transforms only; no solar formula or curve fitting here. */
export function AnnualDeclinationChart({ model, timeMs, declinationDegrees }: { model: AnnualSubsolarModel; timeMs: number; declinationDegrees: number }) {
  const x = (time: number) => LEFT + (time - model.startTimeMs) / (model.endTimeMs - model.startTimeMs) * WIDTH
  const path = useMemo(() => model.samples.map((sample, index) => `${index === 0 ? 'M' : 'L'}${LEFT + (sample.timeMs - model.startTimeMs) / (model.endTimeMs - model.startTimeMs) * WIDTH},${y(sample.declinationDegrees)}`).join(' '), [model])
  return <svg className="annual-declination-chart" viewBox="0 0 355 210" role="img" aria-label={`${model.year}年太阳赤纬与UTC日期曲线，北纬为正，南纬为负`}>
    <title>{`${model.year}年太阳赤纬—日期曲线`}</title>
    {[-23.44, 0, 23.44].map(value => <g key={value}>
      <line x1={LEFT} x2={LEFT + WIDTH} y1={y(value)} y2={y(value)} stroke="#416277" strokeDasharray={value === 0 ? undefined : '3 3'} />
      <text x={LEFT - 4} y={y(value) + 4} textAnchor="end">{value === 0 ? '0°' : value > 0 ? '≈23°26′N' : '≈23°26′S'}</text>
    </g>)}
    <path d={path} fill="none" stroke="#facc15" strokeWidth="2" />
    {[0, 3, 6, 9, 11].map(month => <text key={month} x={x(Date.UTC(model.year, month, 1))} y={190} textAnchor="middle">{month + 1}月</text>)}
    {model.events.map(event => <g key={event.id}>
      <circle cx={x(event.timeMs)} cy={y(event.declinationDegrees)} r={3} fill="#fb923c" />
      <text x={x(event.timeMs)} y={y(event.declinationDegrees) + (event.declinationDegrees > 10 ? 17 : -9)} textAnchor="middle">{event.label}</text>
    </g>)}
    <line x1={x(timeMs)} x2={x(timeMs)} y1={TOP} y2={TOP + HEIGHT} stroke="#67e8f9" strokeDasharray="3 3" />
    <circle cx={x(timeMs)} cy={y(declinationDegrees)} r={4} fill="#67e8f9"><title>{`当前太阳赤纬 ${declinationDegrees.toFixed(3)}°`}</title></circle>
    <text x={LEFT + WIDTH / 2} y={206} textAnchor="middle">UTC日期 · 青色点为当前时刻</text>
  </svg>
}
