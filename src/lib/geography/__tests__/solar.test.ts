import { describe, expect, it } from 'vitest'
import { solarDeclination, subsolarPoint } from '../solar'
import { calculateSolarEphemeris } from '../solarEphemeris'

const SPRING_EQUINOX_2026 = new Date('2026-03-20T14:46:00.000Z')
const SUMMER_SOLSTICE_2026 = new Date('2026-06-21T08:24:00.000Z')
const AUTUMN_EQUINOX_2026 = new Date('2026-09-23T00:05:00.000Z')
const WINTER_SOLSTICE_2026 = new Date('2026-12-21T20:50:00.000Z')

describe('solarDeclination', () => {
  it('春分和秋分太阳赤纬接近 0°', () => {
    expect(Math.abs(solarDeclination(SPRING_EQUINOX_2026))).toBeLessThan(0.02)
    expect(Math.abs(solarDeclination(AUTUMN_EQUINOX_2026))).toBeLessThan(0.02)
  })

  it('夏至太阳赤纬接近 +23°26′', () => {
    expect(solarDeclination(SUMMER_SOLSTICE_2026)).toBeCloseTo(23.44, 1)
  })

  it('冬至太阳赤纬接近 -23°26′', () => {
    expect(solarDeclination(WINTER_SOLSTICE_2026)).toBeCloseTo(-23.44, 1)
  })

  it('全年赤纬不超过南北回归线范围', () => {
    for (let month = 0; month < 12; month += 1) {
      const declination = solarDeclination(new Date(Date.UTC(2026, month, 15, 12)))
      expect(declination).toBeGreaterThanOrEqual(-23.45)
      expect(declination).toBeLessThanOrEqual(23.45)
    }
  })

  it('拒绝无效日期', () => {
    expect(() => solarDeclination(new Date(Number.NaN))).toThrow(TypeError)
  })
})

describe('subsolarPoint', () => {
  it('直射点纬度严格等于同一时刻的太阳赤纬', () => {
    const point = subsolarPoint(SUMMER_SOLSTICE_2026)
    expect(point.latitudeDegrees).toBe(solarDeclination(SUMMER_SOLSTICE_2026))
  })

  it('春分直射点位于赤道附近', () => {
    expect(Math.abs(subsolarPoint(SPRING_EQUINOX_2026).latitudeDegrees)).toBeLessThan(0.02)
  })

  it('直射经度满足太阳视正午条件', () => {
    const date = new Date('2026-08-15T03:20:30.000Z')
    const point = subsolarPoint(date)
    const ephemeris = calculateSolarEphemeris(date)
    const utcMinutes = 3 * 60 + 20 + 30 / 60
    const trueSolarMinutes =
      utcMinutes + ephemeris.equationOfTimeMinutes + point.longitudeDegrees * 4
    expect(trueSolarMinutes).toBeCloseTo(720, 8)
  })

  it('相隔 12 小时时直射经度约相差 180°', () => {
    const first = subsolarPoint(new Date('2026-04-10T00:00:00.000Z'))
    const second = subsolarPoint(new Date('2026-04-10T12:00:00.000Z'))
    const separation = Math.abs(first.longitudeDegrees - second.longitudeDegrees)
    const shortestSeparation = Math.min(separation, 360 - separation)
    expect(shortestSeparation).toBeCloseTo(180, 1)
  })

  it('直射经度始终规范化到 [-180°, 180°)', () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const longitude = subsolarPoint(
        new Date(Date.UTC(2026, 0, 1, hour)),
      ).longitudeDegrees
      expect(longitude).toBeGreaterThanOrEqual(-180)
      expect(longitude).toBeLessThan(180)
    }
  })

  it('拒绝无效日期', () => {
    expect(() => subsolarPoint(new Date(Number.NaN))).toThrow(TypeError)
  })
})
