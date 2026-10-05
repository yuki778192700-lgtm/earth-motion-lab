import { MathUtils, Vector3 } from 'three'
import { earthLocalToWorld, latitudeLongitudeToVector3 } from '../../lib/earthCoordinates'

/** 复用公转场景的固定地轴姿态；世界+Y为黄道面北法线。输出角度均为度。 */
export function calculateObliquityGeometry() {
  const eclipticNorthNormal = new Vector3(0, 1, 0)
  const earthNorthAxis = earthLocalToWorld(latitudeLongitudeToVector3(90, 0, 1)).normalize()
  const axisToEclipticNormalDegrees = MathUtils.radToDeg(earthNorthAxis.angleTo(eclipticNorthNormal))
  return {
    earthNorthAxis,
    eclipticNorthNormal,
    equatorialNorthNormal: earthNorthAxis.clone(),
    axisToEclipticNormalDegrees,
    equatorToEclipticDegrees: axisToEclipticNormalDegrees,
    axisToEclipticPlaneDegrees: 90 - axisToEclipticNormalDegrees,
  }
}
