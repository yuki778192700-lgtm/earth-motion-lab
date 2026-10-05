import { describe, expect, it } from 'vitest'
import { MathUtils, Vector3 } from 'three'
import { calculateObliquityGeometry } from './obliquityGeometry'
import { calculateEarthOrbitState, calculateOrbitAlignedEarthRotationRadians, calculateSeasonalEvents } from './earthOrbit'
import { EARTH_AXIAL_TILT_DEGREES, EARTH_ORIENTATION_Z_RADIANS } from '../../lib/earthCoordinates'
import { getLabModuleRuntimeConfig } from '../../config/labModuleRegistry'

describe('黄赤交角空间几何', () => {
  it('两面夹角等于法线夹角；地轴与黄道面是余角', () => {
    const geometry = calculateObliquityGeometry()
    expect(geometry.equatorToEclipticDegrees).toBeCloseTo(23 + 26 / 60, 12)
    expect(geometry.axisToEclipticNormalDegrees).toBeCloseTo(EARTH_AXIAL_TILT_DEGREES, 12)
    expect(geometry.axisToEclipticPlaneDegrees).toBeCloseTo(66 + 34 / 60, 12)
    expect(geometry.axisToEclipticPlaneDegrees + geometry.axisToEclipticNormalDegrees).toBe(90)
    expect(geometry.equatorialNorthNormal.dot(geometry.earthNorthAxis)).toBeCloseTo(1, 12)
  })
  it('角度计算与EarthModel固定Z倾角一致，不混用弧度/度', () => {
    const geometry = calculateObliquityGeometry()
    const renderedAxis = new Vector3(0, 1, 0).applyAxisAngle(new Vector3(0, 0, 1), EARTH_ORIENTATION_Z_RADIANS)
    expect(renderedAxis.distanceTo(geometry.earthNorthAxis)).toBeLessThan(1e-12)
    expect(MathUtils.radToDeg(renderedAxis.angleTo(new Vector3(0, 1, 0)))).toBeCloseTo(geometry.equatorToEclipticDegrees, 12)
  })
  it('二分二至地球位置不同，绕局部Y自转不改变地轴方向', () => {
    const axes = calculateSeasonalEvents(2026).map(event => {
      const localAxis = new Vector3(0, 1, 0).applyAxisAngle(new Vector3(0, 1, 0), calculateOrbitAlignedEarthRotationRadians(event.timeMs))
      return { position: calculateEarthOrbitState(event.timeMs).scenePosition, axis: localAxis.applyAxisAngle(new Vector3(0, 0, 1), EARTH_ORIENTATION_Z_RADIANS) }
    })
    expect(new Set(axes.map(item => item.position.join(','))).size).toBe(4)
    for (const item of axes) expect(item.axis.distanceTo(calculateObliquityGeometry().earthNorthAxis)).toBeLessThan(1e-12)
  })
  it('相机观察旋转不改变空间夹角', () => {
    for (const rotation of [0, Math.PI / 2, Math.PI, -Math.PI / 3]) {
      const geometry = calculateObliquityGeometry()
      const axis = new Vector3(1, 2, 3).normalize()
      const earth = geometry.earthNorthAxis.applyAxisAngle(axis, rotation)
      const normal = geometry.eclipticNorthNormal.applyAxisAngle(axis, rotation)
      expect(MathUtils.radToDeg(earth.angleTo(normal))).toBeCloseTo(EARTH_AXIAL_TILT_DEGREES, 12)
    }
  })
  it('模块面板独立、公转路由不变；返回对象不共享可变向量', () => {
    expect(getLabModuleRuntimeConfig('obliquity').panel).toBe('obliquity')
    expect(getLabModuleRuntimeConfig('obliquity').scene).toBe('orbit')
    calculateObliquityGeometry().earthNorthAxis.set(0, 0, 0)
    expect(calculateObliquityGeometry().earthNorthAxis.length()).toBeCloseTo(1, 12)
  })
})
