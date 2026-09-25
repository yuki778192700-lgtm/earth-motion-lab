import {
  dayLength,
  solarDeclination,
  sunriseTime,
  sunsetTime,
  subsolarPoint,
} from '../../lib/geography'

export interface GeographicCoordinate {
  latitudeDegrees: number
  longitudeDegrees: number
}

export interface TerminatorGeometry {
  dawn: GeographicCoordinate[]
  dusk: GeographicCoordinate[]
}

export interface LatitudeArcGeometry {
  fullLatitude: GeographicCoordinate[]
  dayArc: GeographicCoordinate[]
  nightArc: GeographicCoordinate[]
}

function normalizeLongitudeDegrees(longitudeDegrees: number): number {
  return ((longitudeDegrees + 180) % 360 + 360) % 360 - 180
}

function createArc(
  latitudeDegrees: number,
  startLongitudeDegrees: number,
  sweepDegrees: number,
  segments = 192,
): GeographicCoordinate[] {
  return Array.from({ length: segments + 1 }, (_, index) => ({
    latitudeDegrees,
    longitudeDegrees: normalizeLongitudeDegrees(
      startLongitudeDegrees + (sweepDegrees * index) / segments,
    ),
  }))
}

/** 晨线和昏线的经纬度采样；计算只依赖 geographyEngine。 */
export function calculateTerminatorGeometry(
  date: Date,
  latitudeStepDegrees = 0.5,
): TerminatorGeometry {
  const declinationDegrees = solarDeclination(date)
  const directPoint = subsolarPoint(date)
  const dawn: GeographicCoordinate[] = []
  const dusk: GeographicCoordinate[] = []

  for (
    let latitudeDegrees = -90;
    latitudeDegrees <= 90 + 1e-9;
    latitudeDegrees += latitudeStepDegrees
  ) {
    const sunrise = sunriseTime(latitudeDegrees, declinationDegrees)
    const sunset = sunsetTime(latitudeDegrees, declinationDegrees)

    if (sunrise !== null) {
      dawn.push({
        latitudeDegrees,
        longitudeDegrees: normalizeLongitudeDegrees(
          directPoint.longitudeDegrees + (sunrise - 12) * 15,
        ),
      })
    }

    if (sunset !== null) {
      dusk.push({
        latitudeDegrees,
        longitudeDegrees: normalizeLongitudeDegrees(
          directPoint.longitudeDegrees + (sunset - 12) * 15,
        ),
      })
    }
  }

  return { dawn, dusk }
}

/** 所选纬线、昼弧和夜弧的经纬度采样。 */
export function calculateLatitudeArcGeometry(
  date: Date,
  latitudeDegrees: number,
): LatitudeArcGeometry {
  const declinationDegrees = solarDeclination(date)
  const directPoint = subsolarPoint(date)
  const daylightHours = dayLength(latitudeDegrees, declinationDegrees)
  const daylightSweepDegrees = daylightHours * 15
  const nightSweepDegrees = 360 - daylightSweepDegrees
  const dayStartLongitude = directPoint.longitudeDegrees - daylightSweepDegrees / 2
  const nightStartLongitude = directPoint.longitudeDegrees + daylightSweepDegrees / 2

  return {
    fullLatitude: createArc(latitudeDegrees, -180, 360),
    dayArc:
      daylightSweepDegrees <= 1e-9
        ? []
        : createArc(latitudeDegrees, dayStartLongitude, daylightSweepDegrees),
    nightArc:
      nightSweepDegrees <= 1e-9
        ? []
        : createArc(latitudeDegrees, nightStartLongitude, nightSweepDegrees),
  }
}
