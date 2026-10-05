export interface TeachingLineStyle {
  color: string
  lineWidth: number
  opacity: number
  transparent: true
  depthTest: boolean
  depthWrite: boolean
  renderOrder: number
}

export interface TeachingOverlayLineStyles {
  gridLatitude: TeachingLineStyle
  gridLongitude: TeachingLineStyle
  axis: TeachingLineStyle
  equator: TeachingLineStyle
  tropic: TeachingLineStyle
  polarCircle: TeachingLineStyle
  selectedLatitude: TeachingLineStyle
  rotationDirection: TeachingLineStyle
  equatorialPlaneOutline: TeachingLineStyle
  obliquityGuide: TeachingLineStyle
  obliquityArc: TeachingLineStyle
  terminatorDawn: TeachingLineStyle
  terminatorDusk: TeachingLineStyle
  latitudeGuide: TeachingLineStyle
  dayArc: TeachingLineStyle
  nightArc: TeachingLineStyle
  solarNoonNormal: TeachingLineStyle
  solarNoonRay: TeachingLineStyle
  solarNoonAngle: TeachingLineStyle
  sunRayPrimary: TeachingLineStyle
  sunRaySecondary: TeachingLineStyle
  localSunRay: TeachingLineStyle
  orbitPath: TeachingLineStyle
  orbitSunRay: TeachingLineStyle
}

export interface TeachingOverlayStyle {
  lineWidth: {
    hairline: number
    thin: number
    standard: number
    emphasis: number
    arc: number
  }
  opacity: {
    subtle: number
    secondary: number
    standard: number
    emphasis: number
    sunlightArrow: number
    localSunArrow: number
    orbitSunArrow: number
  }
  labelSize: {
    default: string
    compact: string
  }
  depthTest: {
    surface: boolean
    world: boolean
  }
  renderOrder: {
    plane: number
    sunlight: number
    grid: number
    reference: number
    axis: number
    selectedLatitude: number
    terminator: number
    arcs: number
    marker: number
    angle: number
    observer: number
  }
  lines: TeachingOverlayLineStyles
  marker: {
    opacity: number
    depthTest: boolean
  }
  surface: {
    planeOpacity: number
    orbitPlaneOpacity: number
  }
}

const line = (
  color: string,
  lineWidth: number,
  opacity: number,
  renderOrder: number,
  depthTest = true,
): TeachingLineStyle => ({
  color,
  lineWidth,
  opacity,
  transparent: true,
  depthTest,
  depthWrite: false,
  renderOrder,
})

const lineWidth = {
  hairline: 0.55,
  thin: 1,
  standard: 1.4,
  emphasis: 2.4,
  arc: 4,
} as const

const opacity = {
  subtle: 0.18,
  secondary: 0.72,
  standard: 0.9,
  emphasis: 0.98,
  sunlightArrow: 0.58,
  localSunArrow: 0.78,
  orbitSunArrow: 0.82,
} as const

const renderOrder = {
  plane: 2,
  sunlight: 2,
  grid: 3,
  reference: 4,
  axis: 5,
  selectedLatitude: 6,
  terminator: 7,
  arcs: 8,
  marker: 10,
  angle: 11,
  observer: 12,
} as const

/** 全部教学几何对象的视觉样式单一来源。 */
export const teachingOverlayStyle: TeachingOverlayStyle = Object.freeze({
  lineWidth,
  opacity,
  labelSize: {
    default: '0.68rem',
    compact: '0.66rem',
  },
  depthTest: {
    surface: true,
    world: true,
  },
  renderOrder,
  lines: {
    gridLatitude: line('#c8f6ff', lineWidth.hairline, 0.18, renderOrder.grid),
    gridLongitude: line('#c8f6ff', lineWidth.hairline, 0.17, renderOrder.grid),
    axis: line('#f8fafc', 1.8, 0.95, renderOrder.axis),
    equator: line('#67e8f9', 1.8, 0.95, renderOrder.reference),
    tropic: line('#fb923c', 1.25, 0.92, renderOrder.reference),
    polarCircle: line('#c4b5fd', 1.15, 0.9, renderOrder.reference),
    selectedLatitude: line('#a3e635', 2.1, opacity.emphasis, renderOrder.selectedLatitude),
    rotationDirection: line('#fbbf24', lineWidth.emphasis, opacity.standard, renderOrder.terminator),
    equatorialPlaneOutline: line('#67e8f9', 1.2, 0.8, renderOrder.plane),
    obliquityGuide: line('#fbbf24', lineWidth.thin, opacity.secondary, renderOrder.arcs),
    obliquityArc: line('#fbbf24', 2, 1, renderOrder.arcs),
    terminatorDawn: line('#22d3ee', 2.5, 1, renderOrder.terminator),
    terminatorDusk: line('#fb923c', 2.5, 1, renderOrder.terminator),
    latitudeGuide: line('#e2e8f0', lineWidth.standard, opacity.secondary, renderOrder.arcs),
    dayArc: line('#fde047', lineWidth.arc, 1, renderOrder.arcs),
    nightArc: line('#a78bfa', lineWidth.arc, 1, renderOrder.arcs),
    solarNoonNormal: line('#67e8f9', 2, 1, renderOrder.angle),
    solarNoonRay: line('#facc15', lineWidth.emphasis, 1, renderOrder.angle),
    solarNoonAngle: line('#fb923c', 3, 1, renderOrder.angle),
    sunRayPrimary: line('#f6d77a', 1.05, 0.42, renderOrder.sunlight),
    sunRaySecondary: line('#f6d77a', 0.7, 0.22, renderOrder.sunlight),
    localSunRay: line('#fbbf24', 1.15, 0.48, renderOrder.sunlight),
    orbitPath: line('#38bdf8', lineWidth.standard, opacity.secondary, renderOrder.plane),
    orbitSunRay: line('#fbbf24', lineWidth.thin, 0.38, renderOrder.sunlight),
  },
  marker: {
    opacity: 0.92,
    depthTest: true,
  },
  surface: {
    planeOpacity: 0.085,
    orbitPlaneOpacity: 0.035,
  },
})
