import { assertDeclinationDegrees } from './angle'

/** 几何极昼/极夜纬度范围，单位度；相切边界沿用引擎约定计入范围。 */
export function polarLatitudeRanges(declinationDegrees: number) {
  assertDeclinationDegrees(declinationDegrees)
  if (declinationDegrees === 0) return null
  const boundaryAbsoluteDegrees = 90 - Math.abs(declinationDegrees)
  const northRange = { minimumDegrees: boundaryAbsoluteDegrees, maximumDegrees: 90 }
  const southRange = { minimumDegrees: -90, maximumDegrees: -boundaryAbsoluteDegrees }
  return {
    boundaryAbsoluteDegrees,
    polarDay: declinationDegrees > 0 ? northRange : southRange,
    polarNight: declinationDegrees > 0 ? southRange : northRange,
  }
}
