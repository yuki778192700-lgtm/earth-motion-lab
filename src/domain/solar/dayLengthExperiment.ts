import { sunriseTime, sunsetTime } from '../../lib/geography'
import { createAnnualDayLengthModel } from './annualDayLengthModel'
import { createAnnualSubsolarModel, type AnnualSubsolarModel } from './annualSubsolarModel'

/** 全年昼长、节气读数与升落时刻共用引擎；所有时长和太阳时单位为小时。 */
export function createDayLengthExperiment(year: number, latitudeDegrees: number, annual: AnnualSubsolarModel = createAnnualSubsolarModel(year)) {
  const model = createAnnualDayLengthModel(year, latitudeDegrees, annual)
  return {
    ...model,
    events: model.events.map(event => ({
      ...event,
      sunriseSolarHours: sunriseTime(latitudeDegrees, event.declinationDegrees),
      sunsetSolarHours: sunsetTime(latitudeDegrees, event.declinationDegrees),
    })),
  }
}

/** 显示格式，不参与地理计算；保留24:00，null不伪造日出日落。 */
export function formatApparentSolarTime(hours: number | null): string {
  if (hours === null) return '—（无每日升落）'
  if (!Number.isFinite(hours) || hours < 0 || hours > 24) throw new RangeError('solar time must be between 0 and 24 hours')
  const seconds = Math.round(hours * 3600)
  const h = Math.floor(seconds / 3600)
  const m = Math.floor(seconds % 3600 / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
