import { createAnnualSubsolarModel } from '../solar/annualSubsolarModel'
import { createAnnualDayLengthModel } from '../solar/annualDayLengthModel'

/** 同一年度、同一UTC采样和节气时刻；地理公式全部复用现有引擎。 */
export function createOrbitAnnualTrends(year: number) {
  const declination = createAnnualSubsolarModel(year)
  return {
    declination,
    north: createAnnualDayLengthModel(year, 30, declination),
    south: createAnnualDayLengthModel(year, -30, declination),
  }
}
