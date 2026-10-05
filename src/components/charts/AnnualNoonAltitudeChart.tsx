import { useMemo } from 'react'
import type { AnnualNoonAltitudeModel } from '../../domain/solar/annualNoonAltitudeModel'

const LEFT = 35
const TOP = 18
const WIDTH = 300
const HEIGHT = 150
const y = (degrees: number) => TOP + (90 - degrees) / 120 * HEIGHT

export function AnnualNoonAltitudeChart({ model, timeMs, altitudeDegrees }: { model: AnnualNoonAltitudeModel; timeMs: number; altitudeDegrees: number }) {
  const x = (time: number) => LEFT + (time - model.startTimeMs) / (model.endTimeMs - model.startTimeMs) * WIDTH
  const path = useMemo(() => model.samples.map((sample, index) => `${index === 0 ? 'M' : 'L'}${LEFT + (sample.timeMs - model.startTimeMs) / (model.endTimeMs - model.startTimeMs) * WIDTH},${y(sample.altitudeDegrees)}`).join(' '), [model])
  return <svg className="annual-declination-chart annual-noon-chart" viewBox="0 0 355 210" role="img" aria-label={`${model.year}年所选纬度正午太阳高度曲线，保留负值`}>
    <title>全年正午太阳高度—UTC日期</title>
    <rect x={LEFT} y={y(0)} width={WIDTH} height={y(-30) - y(0)} fill="#a78bfa" opacity="0.1" />
    {[-30, 0, 30, 60, 90].map(value => <g key={value}><line x1={LEFT} x2={LEFT + WIDTH} y1={y(value)} y2={y(value)} stroke={value === 0 ? '#fb923c' : '#416277'} strokeDasharray={value === 0 ? undefined : '3 3'} /><text x={LEFT - 4} y={y(value) + 4} textAnchor="end">{value}°</text></g>)}
    <path d={path} fill="none" stroke="#facc15" strokeWidth="2" />
    {[0, 3, 6, 9, 11].map(month => <text key={month} x={x(Date.UTC(model.year, month, 1))} y={190} textAnchor="middle">{month + 1}月</text>)}
    {model.events.map(event => <g key={event.id}><circle cx={x(event.timeMs)} cy={y(event.altitudeDegrees)} r={3} fill="#fb923c" /><text x={x(event.timeMs)} y={y(event.altitudeDegrees) + (event.altitudeDegrees > 75 ? 15 : -9)} textAnchor="middle">{event.label}</text></g>)}
    <line x1={x(timeMs)} x2={x(timeMs)} y1={TOP} y2={TOP + HEIGHT} stroke="#67e8f9" strokeDasharray="3 3" />
    <circle cx={x(timeMs)} cy={y(altitudeDegrees)} r={4} fill="#67e8f9"><title>当前日期正午太阳高度 {altitudeDegrees.toFixed(3)}°</title></circle>
    <text x={LEFT + WIDTH / 2} y={206} textAnchor="middle">UTC日期 · 0°为地平线</text>
  </svg>
}
