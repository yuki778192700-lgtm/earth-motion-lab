/** 固定屏幕字号与像素间距；不更改标签所指向的地理锚点。 */
export const teachingLabelStyle = Object.freeze({
  fontSize: 12,
  lineHeight: 1.25,
  zIndexRange: [3, 0],
  offsets: {
    observer: [0, -28],
    subsolar: [0, 28],
    dawn: [-24, -12],
    dusk: [24, 12],
    altitude: [0, 28],
    obliquity: [0, -16],
  },
} as const)

export type TeachingLabelRole = keyof typeof teachingLabelStyle.offsets

export const EARTH_LABEL_OCCLUDER_NAME = 'EarthLabelSurfaceOccluder'
