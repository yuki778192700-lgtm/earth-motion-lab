import { useMemo } from 'react'
import type { AnnualDayLengthModel } from '../../domain/solar/annualDayLengthModel'

const LEFT = 35
const TOP = 18
const WIDTH = 300
const HEIGHT = 150
const y = (hours: number) => TOP + (24 - hours) / 24 * HEIGHT

interface AnnualDayLengthChartProps {
  model: AnnualDayLengthModel
  timeMs: number
  dayHours: number
  latitudeLabel?: string
  comparison?: { model: AnnualDayLengthModel; dayHours: number; label: string }
}

export function AnnualDayLengthChart({ model, timeMs, dayHours, latitudeLabel, comparison }: AnnualDayLengthChartProps) {
  const x = (time: number) => LEFT + (time - model.startTimeMs) / (model.endTimeMs - model.startTimeMs) * WIDTH
  // 极点在分点发生跳变：采用阶梯连线，避免插值暗示极点存在普通日出日落。
  const path = useMemo(() => model.samples.map((sample, index) => {
    const px = LEFT + (sample.timeMs - model.startTimeMs) / (model.endTimeMs - model.startTimeMs) * WIDTH
    return index === 0 ? `M${px},${y(sample.dayHours)}` : Math.abs(model.latitudeDegrees) === 90 ? `H${px}V${y(sample.dayHours)}` : `L${px},${y(sample.dayHours)}`
  }).join(' '), [model])
  const comparisonModel = comparison?.model
  const comparisonPath = useMemo(() => comparisonModel?.samples.map((sample, index) => {
    const px = LEFT + (sample.timeMs - comparisonModel.startTimeMs) / (comparisonModel.endTimeMs - comparisonModel.startTimeMs) * WIDTH
    return index === 0 ? `M${px},${y(sample.dayHours)}` : Math.abs(comparisonModel.latitudeDegrees) === 90 ? `H${px}V${y(sample.dayHours)}` : `L${px},${y(sample.dayHours)}`
  }).join(' '), [comparisonModel])
  return <svg className="annual-declination-chart" viewBox="0 0 355 210" role="img" aria-label={`${model.year}年${comparison ? `${latitudeLabel}与${comparison.label}` : '所选纬度'}几何昼长曲线`}>
    <title>全年几何昼长（小时）—UTC日期</title>
    {[0, 6, 12, 18, 24].map(hours => <g key={hours}><line x1={LEFT} x2={LEFT + WIDTH} y1={y(hours)} y2={y(hours)} stroke="#416277" strokeDasharray="3 3" /><text x={LEFT - 4} y={y(hours) + 4} textAnchor="end">{hours}h</text></g>)}
    <path d={path} fill="none" stroke="#facc15" strokeWidth="2" />
    {comparison ? <path d={comparisonPath} fill="none" stroke="#f9a8d4" strokeWidth="2" strokeDasharray="5 2" /> : null}
    {[0, 3, 6, 9, 11].map(month => <text key={month} x={x(Date.UTC(model.year, month, 1))} y={190} textAnchor="middle">{month + 1}月</text>)}
    {model.events.map(event => <g key={event.id}><circle cx={x(event.timeMs)} cy={y(event.dayHours)} r={3} fill="#fb923c"><title>{`${event.label}：${event.dayHours.toFixed(3)}小时`}</title></circle>{comparison ? <><line x1={x(event.timeMs)} x2={x(event.timeMs)} y1={TOP} y2={TOP + HEIGHT} stroke="#416277" strokeDasharray="2 4" /><text x={x(event.timeMs)} y={TOP - 5} textAnchor="middle">{event.label}</text></> : null}</g>)}
    <line x1={x(timeMs)} x2={x(timeMs)} y1={TOP} y2={TOP + HEIGHT} stroke="#67e8f9" strokeDasharray="3 3" />
    <circle cx={x(timeMs)} cy={y(dayHours)} r={4} fill={comparison ? '#facc15' : '#67e8f9'} stroke={comparison ? '#67e8f9' : undefined}><title>{`${latitudeLabel ?? '所选纬度'}当前昼长：${dayHours.toFixed(3)}小时`}</title></circle>
    {comparison ? <circle cx={x(timeMs)} cy={y(comparison.dayHours)} r={4} fill="#f9a8d4" stroke="#67e8f9"><title>{`${comparison.label}当前昼长：${comparison.dayHours.toFixed(3)}小时`}</title></circle> : null}
    <text x={LEFT + WIDTH / 2} y={206} textAnchor="middle">{comparison ? 'UTC日期 · 青色竖线为当前时刻' : 'UTC日期 · 24h极昼 / 0h极夜'}</text>
  </svg>
}
