import { describe, expect, it } from 'vitest'
import { PerspectiveCamera, Vector3 } from 'three'
import {
  calculateDayNightEarthPose,
  DAY_NIGHT_EARTH_CENTER,
  SUN_DIRECTION,
} from '../../../domain/dayNight/solarReferenceFrame'
import {
  calculateSideViewCameraZ,
  getDayNightCameraPose,
  SIDE_VIEW_HORIZONTAL_SPAN,
  SIDE_VIEW_TARGET_X,
  SIDE_VIEW_EARTH_SCREEN_FRACTION,
} from './cameraPresets'

const DATE = new Date('2026-06-21T08:24:00.000Z')
const ASPECT = 16 / 9
const DISTANCE = 5.7

function earthCenter(): Vector3 {
  return new Vector3(
    DAY_NIGHT_EARTH_CENTER.x,
    DAY_NIGHT_EARTH_CENTER.y,
    DAY_NIGHT_EARTH_CENTER.z,
  )
}

describe('专业镜头预设', () => {
  it('侧视放大构图仍保留固定太阳示意，地球位于画面约60%处', () => {
    const left = SIDE_VIEW_TARGET_X - SIDE_VIEW_HORIZONTAL_SPAN / 2
    const right = SIDE_VIEW_TARGET_X + SIDE_VIEW_HORIZONTAL_SPAN / 2
    const earthFraction = (DAY_NIGHT_EARTH_CENTER.x - left) / SIDE_VIEW_HORIZONTAL_SPAN
    expect(earthFraction).toBeCloseTo(SIDE_VIEW_EARTH_SCREEN_FRACTION, 12)
    expect(earthFraction).toBeGreaterThanOrEqual(0.6)
    expect(earthFraction).toBeLessThanOrEqual(0.63)
    expect(left).toBeLessThan(-5.32 - 0.24)
    expect(right).toBeGreaterThan(DAY_NIGHT_EARTH_CENTER.x + 1.45)
  })
  it('晨昏线视角的视线与太阳方向垂直，并以地球球心为目标', () => {
    const pose = getDayNightCameraPose('terminator', DISTANCE, DATE, ASPECT)
    const viewDirection = pose.target.clone().sub(pose.position).normalize()

    expect(pose.target.distanceTo(earthCenter())).toBeLessThan(1e-12)
    expect(Math.abs(viewDirection.dot(new Vector3(...SUN_DIRECTION.toArray())))).toBeLessThan(1e-12)
    expect(pose.position.distanceTo(pose.target)).toBeCloseTo(DISTANCE * 1.08, 12)
  })

  it('南北极视角严格沿当前地轴观察', () => {
    const earthPose = calculateDayNightEarthPose(DATE)
    const north = getDayNightCameraPose('north-pole', DISTANCE, DATE, ASPECT)
    const south = getDayNightCameraPose('south-pole', DISTANCE, DATE, ASPECT)

    expect(north.position.clone().sub(north.target).normalize().dot(earthPose.northAxisWorld)).toBeCloseTo(1, 12)
    expect(south.position.clone().sub(south.target).normalize().dot(earthPose.northAxisWorld)).toBeCloseTo(-1, 12)
  })

  it('赤道侧视的视线位于真实赤道面内', () => {
    const earthPose = calculateDayNightEarthPose(DATE)
    const equator = getDayNightCameraPose('equator', DISTANCE, DATE, ASPECT)
    const cameraRadial = equator.position.clone().sub(equator.target).normalize()

    expect(Math.abs(cameraRadial.dot(earthPose.northAxisWorld))).toBeLessThan(1e-12)
    expect(equator.up.dot(earthPose.northAxisWorld)).toBeCloseTo(1, 12)
  })

  it('透视侧视过渡与正交侧视具有匹配的画面跨度', () => {
    const cameraZ = calculateSideViewCameraZ(ASPECT)
    const camera = new PerspectiveCamera(36, ASPECT)
    const visibleVerticalSpan = 2 * cameraZ * Math.tan((camera.fov * Math.PI) / 360)

    expect(visibleVerticalSpan).toBeCloseTo(SIDE_VIEW_HORIZONTAL_SPAN / ASPECT, 12)
    const side = getDayNightCameraPose('sun-side', DISTANCE, DATE, ASPECT)
    expect(side.position.x).toBeCloseTo(SIDE_VIEW_TARGET_X, 12)
    expect(side.position.z).toBeCloseTo(cameraZ, 12)
  })
})
