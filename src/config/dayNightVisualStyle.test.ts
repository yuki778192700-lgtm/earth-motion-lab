import { describe, expect, it } from 'vitest'
import { DAY_NIGHT_VISUAL_STYLE, getDayNightVisualStyle, SIDE_VIEW_VISUAL_STYLE } from './dayNightVisualStyle'

describe('侧视教学专用视觉样式', () => {
  it('其他昼夜视角保留原样式对象和亮度', () => {
    expect(getDayNightVisualStyle(false)).toBe(DAY_NIGHT_VISUAL_STYLE)
    expect(DAY_NIGHT_VISUAL_STYLE.ambientIntensity).toBe(0.018)
    expect(DAY_NIGHT_VISUAL_STYLE.nightOverlayOpacity).toBe(0.64)
  })

  it('侧视提升纹理可见度，同时保留非纯黑夜面和更强的昼夜对比', () => {
    expect(getDayNightVisualStyle(true)).toBe(SIDE_VIEW_VISUAL_STYLE)
    expect(SIDE_VIEW_VISUAL_STYLE.ambientIntensity).toBeGreaterThan(DAY_NIGHT_VISUAL_STYLE.ambientIntensity)
    expect(SIDE_VIEW_VISUAL_STYLE.nightOverlayOpacity).toBeGreaterThan(DAY_NIGHT_VISUAL_STYLE.nightOverlayOpacity)
    expect(SIDE_VIEW_VISUAL_STYLE.nightOverlayOpacity).toBeLessThan(1)
    expect(SIDE_VIEW_VISUAL_STYLE.dayOverlayOpacity).toBe(DAY_NIGHT_VISUAL_STYLE.dayOverlayOpacity)
  })

  it('不改变晨昏线过渡宽度或球面覆盖半径', () => {
    expect(SIDE_VIEW_VISUAL_STYLE.boundaryDotHalfWidth).toBe(DAY_NIGHT_VISUAL_STYLE.boundaryDotHalfWidth)
    expect(SIDE_VIEW_VISUAL_STYLE.overlayRadiusFactor).toBe(DAY_NIGHT_VISUAL_STYLE.overlayRadiusFactor)
  })
})
