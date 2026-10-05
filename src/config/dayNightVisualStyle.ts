/** 仅控制教学对比，不参与昼夜分类、太阳方向或晨昏线位置计算。 */
export const DAY_NIGHT_VISUAL_STYLE = Object.freeze({
  ambientIntensity: 0.018,
  surfaceEmissiveIntensity: 0.04,
  nightOverlayOpacity: 0.64,
  dayOverlayOpacity: 0.012,
  // 对称过渡，中心始终为n·SUN_DIRECTION=0，约±0.34°。
  boundaryDotHalfWidth: 0.006,
  // 位于云壳外、经纬线内；避免不受光照的云壳抬亮夜半球。
  overlayRadiusFactor: 1.016,
})

/** 侧视投屏专用填充光：提升昼面纹理，夜面仍由同一光照遮罩压暗。 */
export const SIDE_VIEW_VISUAL_STYLE = Object.freeze({
  ...DAY_NIGHT_VISUAL_STYLE,
  ambientIntensity: 0.5,
  surfaceEmissiveIntensity: 0.2,
  nightOverlayOpacity: 0.8,
})

export function getDayNightVisualStyle(isSolarSideView: boolean) {
  return isSolarSideView ? SIDE_VIEW_VISUAL_STYLE : DAY_NIGHT_VISUAL_STYLE
}
