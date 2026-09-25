import { describe, expect, it } from 'vitest'
import { calculateLatitudeArcGeometry, calculateTerminatorGeometry } from './dayNightGeometry'
import { calculateDayNightModel } from './dayNightModel'

const EQUINOX = new Date('2026-03-20T14:46:00.000Z')
const JUNE_SOLSTICE = new Date('2026-06-21T08:24:00.000Z')
const DECEMBER_SOLSTICE = new Date('2026-12-21T20:50:00.000Z')

describe('calculateDayNightModel', () => {
  it('赤道春分昼夜各 12 小时，日出 6 时、日落 18 时', () => {
    const model = calculateDayNightModel(EQUINOX, 0)
    expect(model.daylightHours).toBeCloseTo(12, 5)
    expect(model.nightHours).toBeCloseTo(12, 5)
    expect(model.sunriseSolarHours).toBeCloseTo(6, 5)
    expect(model.sunsetSolarHours).toBeCloseTo(18, 5)
    expect(model.polarState).toBe('none')
  })

  it('北极夏至为极昼，冬至为极夜', () => {
    const summer = calculateDayNightModel(JUNE_SOLSTICE, 90)
    const winter = calculateDayNightModel(DECEMBER_SOLSTICE, 90)
    expect(summer.daylightHours).toBe(24)
    expect(summer.sunriseSolarHours).toBeNull()
    expect(summer.polarState).toBe('polar-day')
    expect(winter.daylightHours).toBe(0)
    expect(winter.sunsetSolarHours).toBeNull()
    expect(winter.polarState).toBe('polar-night')
  })

  it('昼长与夜长之和始终为 24 小时', () => {
    for (const latitude of [-90, -66.5, -30, 0, 30, 66.5, 90]) {
      const model = calculateDayNightModel(JUNE_SOLSTICE, latitude)
      expect(model.daylightHours + model.nightHours).toBeCloseTo(24, 10)
    }
  })
})

describe('day-night geometry', () => {
  it('春分晨线和昏线覆盖南北半球并保持分离', () => {
    const geometry = calculateTerminatorGeometry(EQUINOX, 1)
    expect(geometry.dawn.length).toBeGreaterThan(170)
    expect(geometry.dusk.length).toBeGreaterThan(170)
    expect(geometry.dawn[90]?.longitudeDegrees).not.toBe(
      geometry.dusk[90]?.longitudeDegrees,
    )
  })

  it('普通纬度昼夜弧均存在', () => {
    const geometry = calculateLatitudeArcGeometry(JUNE_SOLSTICE, 30)
    expect(geometry.fullLatitude.length).toBeGreaterThan(190)
    expect(geometry.dayArc.length).toBeGreaterThan(0)
    expect(geometry.nightArc.length).toBeGreaterThan(0)
  })

  it('极昼只有昼弧，极夜只有夜弧', () => {
    const polarDay = calculateLatitudeArcGeometry(JUNE_SOLSTICE, 90)
    const polarNight = calculateLatitudeArcGeometry(DECEMBER_SOLSTICE, 90)
    expect(polarDay.dayArc.length).toBeGreaterThan(0)
    expect(polarDay.nightArc).toHaveLength(0)
    expect(polarNight.dayArc).toHaveLength(0)
    expect(polarNight.nightArc.length).toBeGreaterThan(0)
  })
})
