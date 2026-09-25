const FULL_CIRCLE_DEGREES = 360

export function assertFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number`)
  }
}

export function assertValidDate(date: Date, label = 'date'): void {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) {
    throw new TypeError(`${label} must be a valid Date`)
  }
}

export function assertLatitudeDegrees(latitudeDegrees: number): void {
  assertFiniteNumber(latitudeDegrees, 'latitudeDegrees')
  if (latitudeDegrees < -90 || latitudeDegrees > 90) {
    throw new RangeError('latitudeDegrees must be between -90 and 90 degrees')
  }
}

export function assertDeclinationDegrees(declinationDegrees: number): void {
  assertFiniteNumber(declinationDegrees, 'declinationDegrees')
  if (declinationDegrees < -90 || declinationDegrees > 90) {
    throw new RangeError('declinationDegrees must be between -90 and 90 degrees')
  }
}

export function degreesToRadians(degrees: number): number {
  assertFiniteNumber(degrees, 'degrees')
  return (degrees * Math.PI) / 180
}

export function radiansToDegrees(radians: number): number {
  assertFiniteNumber(radians, 'radians')
  return (radians * 180) / Math.PI
}

export function normalizeDegrees360(degrees: number): number {
  assertFiniteNumber(degrees, 'degrees')
  return ((degrees % FULL_CIRCLE_DEGREES) + FULL_CIRCLE_DEGREES) % FULL_CIRCLE_DEGREES
}

export function normalizeLongitudeDegrees(longitudeDegrees: number): number {
  assertFiniteNumber(longitudeDegrees, 'longitudeDegrees')
  return ((longitudeDegrees + 180) % FULL_CIRCLE_DEGREES + FULL_CIRCLE_DEGREES) % FULL_CIRCLE_DEGREES - 180
}
